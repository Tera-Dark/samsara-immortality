/**
 * TravelSystem — 旅行/地点管理
 * 
 * 从 GameEngine 中提取的旅行逻辑：移动、采集、休息、加入宗门、地点查询。
 */

import type { GameEngine } from '../GameEngine';
import { REALMS } from '../../types';
import type { Region, Location } from '../../types/worldTypes';
import { ITEMS, LOOT_TABLES } from '../../data/items';
import { InventorySystem } from './InventorySystem';

export class TravelSystem {
    static travelTo(engine: GameEngine, targetId: string): { success: boolean; message: string } {
        const currentId = engine.state.location;
        if (currentId === targetId) return { success: false, message: '你已经在这里了。' };

        const endNode = this.getLocationEntity(engine, targetId);
        if (!endNode) return { success: false, message: '无效的目标地点。' };

        const travelDays = this.calculateTravelDays(engine, targetId);

        // Simple processing: accumulate days into months
        const monthsPassed = Math.max(0, Math.floor(travelDays / 30));

        engine.state.world.worldMonth += monthsPassed;
        engine.state.location = targetId;

        const log = `你前往${endNode.name}，路途遥远，耗时 ${travelDays} 天。`;
        engine.state.history.push(log);

        // Loot Check (Simple)
        if (Math.random() < 0.3) {
            const lootTable = LOOT_TABLES['LOW_LEVEL'];
            const roll = Math.random() * 100;
            let currentWeight = 0;

            for (const item of lootTable) {
                currentWeight += item.weight;
                if (roll <= currentWeight) {
                    const count = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                    InventorySystem.addItem(engine, item.itemId, count);
                    const itemName = ITEMS[item.itemId]?.name || '未知物品';
                    engine.state.history.push(`你在途中偶然发现：${itemName} x${count}！`);
                    break;
                }
            }
        }

        return { success: true, message: log };
    }

    static gather(engine: GameEngine): { success: boolean; message: string } {
        const locationId = engine.state.location;
        const locationEntity = this.getLocationEntity(engine, locationId);

        let isSafeZone = false;
        if (locationEntity && 'type' in locationEntity && (locationEntity.type === 'CITY' || locationEntity.type === 'SECT')) {
            isSafeZone = true;
        }

        if (isSafeZone) {
            return { success: false, message: '这里是安全区，无法通过采集获取资源。' };
        }

        // Consume Time (1 month)
        engine.state.world.worldMonth += 1;
        engine.state.months += 1;
        engine.triggerTalents('TURN_START');
        engine.triggerTalents('TURN_END');

        // Loot Logic
        const lootTable = LOOT_TABLES['LOW_LEVEL'];
        const roll = Math.random() * 100;
        let currentWeight = 0;
        let lootItem: string | null = null;
        let lootCount = 0;

        for (const item of lootTable) {
            currentWeight += item.weight;
            if (roll <= currentWeight) {
                lootCount = Math.floor(Math.random() * (item.max - item.min + 1)) + item.min;
                lootItem = item.itemId;
                break;
            }
        }

        if (lootItem) {
            InventorySystem.addItem(engine, lootItem, lootCount);
            const itemName = ITEMS[lootItem]?.name || '未知物品';
            const msg = `你在附近搜寻了一番，发现了：${itemName} x${lootCount}`;
            engine.state.history.push(`${engine.getTimeStr()} ${msg}`);
            return { success: true, message: msg };
        } else {
            const msg = '你在附近搜寻了一番，但一无所获。';
            engine.state.history.push(`${engine.getTimeStr()} ${msg}`);
            return { success: true, message: msg };
        }
    }

    static rest(engine: GameEngine): { success: boolean; message: string } {
        const locationId = engine.state.location;
        const locationEntity = this.getLocationEntity(engine, locationId);

        let canRest = false;
        if (locationEntity && 'type' in locationEntity && (locationEntity.type === 'CITY' || locationEntity.type === 'SECT')) {
            canRest = true;
        }

        if (!canRest) {
            return { success: false, message: '只有在城镇或宗门才能安全休息。' };
        }

        const cost = 5;
        if (!InventorySystem.spendMoney(engine, cost)) {
            const currentMoney = InventorySystem.getMoney(engine);
            return { success: false, message: `灵石不足，客栈住宿需要 ${cost} 灵石。（当前: ${currentMoney}）` };
        }

        // Full Heal
        engine.state.battleStats.HP = engine.state.battleStats.MAX_HP;
        engine.state.battleStats.MP = engine.state.battleStats.MAX_MP;

        // Pass Time (1 Month)
        engine.state.world.worldMonth += 1;
        engine.state.months += 1;
        engine.triggerTalents('TURN_START');
        engine.triggerTalents('TURN_END');

        const msg = `你花费 ${cost} 灵石在客栈休整了一月，精气神已恢复巅峰。`;
        engine.state.history.push(`${engine.getTimeStr()} ${msg}`);

        return { success: true, message: msg };
    }

    static getLocationEntity(engine: GameEngine, id: string): Region | Location | null {
        // Search Regions
        const region = engine.state.world.regions.find(r => r.id === id);
        if (region) return region;

        // Search Locations inside Regions
        for (const r of engine.state.world.regions) {
            const loc = r.locations.find(l => l.id === id);
            if (loc) return loc;
        }
        return null;
    }

    static joinSect(engine: GameEngine, sectId: string): { success: boolean; message: string } {
        if (engine.state.sect) {
            return { success: false, message: '你已加入宗门，不可再拜入其他门派。' };
        }

        const sect = engine.state.world.sects.find(s => s.id === sectId);
        if (!sect) {
            return { success: false, message: '宗门不存在。' };
        }

        const requiredRealm = sect.entryRealmRequirement || 0;
        if (engine.state.realm_idx < requiredRealm) {
            return { success: false, message: `你的境界不足，该宗门要求至少达到【${REALMS[requiredRealm]}】才能入门。` };
        }

        engine.state.sect = sect.id;

        const msg = `恭喜！你成功通过了考核，拜入【${sect.name}】成为一名外门弟子。`;
        engine.state.history.push(`${engine.getTimeStr()} ${msg}`);
        return { success: true, message: msg };
    }

    static calculateTravelDays(engine: GameEngine, targetId: string): number {
        const currentLocationId = engine.state.location;
        const currentEntity = this.getLocationEntity(engine, currentLocationId);
        const targetEntity = this.getLocationEntity(engine, targetId);

        if (!currentEntity || !targetEntity) return 999;

        const getGlobalCoord = (entity: Region | Location) => {
            if ('locations' in entity) {
                // It's a Region
                return { x: entity.coord.x * 20, y: entity.coord.y * 20 };
            } else {
                // It's a Location — find parent region
                const region = engine.state.world.regions.find(r =>
                    r.id === (entity as Location).regionId || r.locations.some(l => l.id === entity.id)
                );
                if (!region) return { x: 0, y: 0 };
                return {
                    x: region.coord.x * 20 + entity.coord.x,
                    y: region.coord.y * 20 + entity.coord.y
                };
            }
        };

        const start = getGlobalCoord(currentEntity);
        const end = getGlobalCoord(targetEntity);

        const dist = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));

        const speed = engine.state.battleStats.MOVE_SPEED || 20;
        const distanceLi = dist * 100;
        const days = Math.ceil(distanceLi / speed);
        return Math.max(1, days);
    }
}
