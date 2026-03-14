/**
 * TravelSystem - travel and location actions.
 */

import type { GameEngine } from '../GameEngine';
import { REALMS } from '../../types';
import type { GameEvent } from '../../types';
import type { CombatEntity, CombatState } from '../../types/combat';
import type { Location, Region } from '../../types/worldTypes';
import { ITEMS, LOOT_TABLES } from '../../data/items';
import { InventorySystem } from './InventorySystem';

interface TravelActionResult {
    success: boolean;
    message: string;
    event?: GameEvent | null;
    timeMessage?: string;
    combat?: { enemy: Partial<CombatEntity>; type: CombatState['type'] };
}

export type LocationActionType =
    | 'FORAGE'
    | 'MINE'
    | 'HARVEST_HERBS'
    | 'MEDITATE'
    | 'EXPLORE_RUINS'
    | 'CHALLENGE_SECRET_REALM'
    | 'GATHER_INFO'
    | 'ATTEND_AUCTION';

export class TravelSystem {
    private static grantLateGameExplorationBonus(engine: GameEngine): string[] {
        const bonus: string[] = [];

        if (engine.state.realm_idx >= 4 && Math.random() < 0.3) {
            InventorySystem.addItem(engine, 'pure_spirit_stone', 1);
            bonus.push('涓婂搧鐏电煶 x1');
        }

        if (engine.state.realm_idx >= 5 && Math.random() < 0.24) {
            const rarePool = ['ice_lotus', 'beast_blood', 'purple_cloud_fruit'] as const;
            const rareItem = rarePool[Math.floor(Math.random() * rarePool.length)];
            InventorySystem.addItem(engine, rareItem, 1);
            bonus.push(`${ITEMS[rareItem]?.name || rareItem} x1`);
        }

        if (engine.state.realm_idx >= 6 && Math.random() < 0.18) {
            const rewardPool = ['book_fire_art', 'book_phantom_step', 'spirit_gathering_pendant'] as const;
            const reward = rewardPool[Math.floor(Math.random() * rewardPool.length)];
            InventorySystem.addItem(engine, reward, 1);
            bonus.push(`${ITEMS[reward]?.name || reward} x1`);
        }

        return bonus;
    }

    static travelTo(engine: GameEngine, targetId: string): TravelActionResult {
        const currentId = engine.state.location;
        if (currentId === targetId) {
            return { success: false, message: '你已经在这里了。' };
        }

        const endNode = this.getLocationEntity(engine, targetId);
        if (!endNode) {
            return { success: false, message: '无效的目标地点。' };
        }

        const travelDays = this.calculateTravelDays(engine, targetId);
        engine.state.location = targetId;

        const message = `你前往 ${endNode.name}，路途耗时 ${travelDays} 天。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);

        if (Math.random() < 0.3) {
            const randomLoot = this.rollLoot(LOOT_TABLES.LOW_LEVEL);
            if (randomLoot) {
                InventorySystem.addItem(engine, randomLoot.itemId, randomLoot.count);
                const itemName = ITEMS[randomLoot.itemId]?.name || randomLoot.itemId;
                engine.state.history.push(`${engine.getTimeStr()} 途中偶得 ${itemName} x${randomLoot.count}`);
            }
        }

        const timeResult = engine.advanceTime(Math.floor(travelDays / 30), { action: 'TRAVEL' }, travelDays % 30);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    static gather(engine: GameEngine): TravelActionResult {
        return this.performLocationAction(engine, 'FORAGE');
    }

    static rest(engine: GameEngine): TravelActionResult {
        const locationEntity = this.getLocationEntity(engine, engine.state.location);
        const canRest =
            !!locationEntity
            && 'type' in locationEntity
            && ['CITY', 'SECT', 'SECT_HQ', 'INN'].includes(locationEntity.type);

        if (!canRest) {
            return { success: false, message: '只有在城镇、宗门或客栈才能安心休息。' };
        }

        const cost = 5;
        if (!InventorySystem.spendMoney(engine, cost)) {
            return { success: false, message: `灵石不足，休息需要 ${cost} 灵石。` };
        }

        engine.state.battleStats.HP = engine.state.battleStats.MAX_HP;
        engine.state.battleStats.MP = engine.state.battleStats.MAX_MP;

        const timeResult = engine.advanceTime(1, { action: 'REST' });
        const message = `你花费 ${cost} 灵石休养了一个月，气血与灵力都恢复到了稳定状态。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);

        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    static performLocationAction(engine: GameEngine, action: LocationActionType): TravelActionResult {
        const locationEntity = this.getLocationEntity(engine, engine.state.location);
        if (!locationEntity || !('type' in locationEntity)) {
            return { success: false, message: '当前位置不支持此行动。' };
        }

        switch (action) {
            case 'FORAGE':
                return this.handleForage(engine, locationEntity);
            case 'MINE':
                return this.handleMine(engine, locationEntity);
            case 'HARVEST_HERBS':
                return this.handleHarvestHerbs(engine, locationEntity);
            case 'MEDITATE':
                return this.handleMeditate(engine, locationEntity);
            case 'EXPLORE_RUINS':
                return this.handleExploreRuins(engine, locationEntity);
            case 'CHALLENGE_SECRET_REALM':
                return this.handleSecretRealm(engine, locationEntity);
            case 'GATHER_INFO':
                return this.handleGatherInfo(engine, locationEntity);
            case 'ATTEND_AUCTION':
                return this.handleAuction(engine, locationEntity);
            default:
                return { success: false, message: '此行动尚不可用。' };
        }
    }

    static getLocationEntity(engine: GameEngine, id: string): Region | Location | null {
        const region = engine.state.world.regions.find((item) => item.id === id);
        if (region) return region;

        for (const worldRegion of engine.state.world.regions) {
            const location = worldRegion.locations.find((item) => item.id === id);
            if (location) return location;
        }

        return null;
    }

    static joinSect(engine: GameEngine, sectId: string): { success: boolean; message: string } {
        if (engine.state.sect) {
            return { success: false, message: '你已有所属宗门，不能重复拜入。' };
        }

        const sect = engine.state.world.sects.find((item) => item.id === sectId);
        if (!sect) {
            return { success: false, message: '宗门不存在。' };
        }

        const requiredRealm = sect.entryRealmRequirement || 0;
        if (engine.state.realm_idx < requiredRealm) {
            return { success: false, message: `境界不足，至少需要达到 ${REALMS[requiredRealm]} 才能入门。` };
        }

        engine.state.sect = sect.id;

        const message = `你通过了考核，拜入 ${sect.name}，成为一名外门弟子。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return { success: true, message };
    }

    static calculateTravelDays(engine: GameEngine, targetId: string): number {
        const currentEntity = this.getLocationEntity(engine, engine.state.location);
        const targetEntity = this.getLocationEntity(engine, targetId);

        if (!currentEntity || !targetEntity) return 999;

        const getGlobalCoord = (entity: Region | Location) => {
            if ('locations' in entity) {
                return { x: entity.coord.x * 20, y: entity.coord.y * 20 };
            }

            const region = engine.state.world.regions.find((item) =>
                item.id === entity.regionId || item.locations.some((location) => location.id === entity.id));
            if (!region) return { x: 0, y: 0 };

            return {
                x: region.coord.x * 20 + entity.coord.x,
                y: region.coord.y * 20 + entity.coord.y,
            };
        };

        const start = getGlobalCoord(currentEntity);
        const end = getGlobalCoord(targetEntity);
        const distance = Math.hypot(end.x - start.x, end.y - start.y);
        const speed = engine.state.battleStats.MOVE_SPEED || 20;
        return Math.max(1, Math.ceil((distance * 100) / speed));
    }

    private static handleForage(engine: GameEngine, location: Location): TravelActionResult {
        if (!['WILDERNESS', 'CITY', 'SECT', 'SECT_HQ'].includes(location.type)) {
            return { success: false, message: '这里并不适合普通采集。' };
        }

        const timeResult = engine.advanceTime(1, { action: 'GATHER' });
        if (!engine.state.alive) {
            return {
                success: true,
                message: timeResult.message || '你在采集途中耗尽了体力。',
                event: timeResult.event,
                timeMessage: timeResult.message,
                combat: timeResult.combat,
            };
        }

        const loot = this.rollLoot(LOOT_TABLES.LOW_LEVEL);
        const message = loot
            ? `你在附近搜寻一番，找到 ${ITEMS[loot.itemId]?.name || loot.itemId} x${loot.count}。`
            : '你在附近搜寻了一圈，但没有什么像样的收获。';

        if (loot) {
            InventorySystem.addItem(engine, loot.itemId, loot.count);
        }

        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleMine(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'MINE') {
            return { success: false, message: '这里没有值得开采的矿脉。' };
        }

        const timeResult = engine.advanceTime(1, { action: 'GATHER' });
        const oreCount = 1 + Math.floor(Math.random() * 2);
        const stoneCount = 2 + Math.floor(Math.random() * 4);

        InventorySystem.addItem(engine, 'iron', oreCount);
        engine.earnMoney(stoneCount);

        let bonusText = '';
        if (Math.random() < 0.18) {
            InventorySystem.addItem(engine, 'spirit_shard', 1);
            bonusText = ' 你还在矿壁裂隙间凿出了一小块灵石碎晶。';
        }

        const message = `你在矿脉中凿出了玄铁 x${oreCount}，并换得灵石 ${stoneCount}。${bonusText}`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleHarvestHerbs(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'HERB_GARDEN') {
            return { success: false, message: '这里没有成片灵药可供采摘。' };
        }

        const timeResult = engine.advanceTime(1, { action: 'GATHER' });
        const herbRoll = Math.random();
        const herbId = herbRoll > 0.82 ? 'century_ginseng' : herbRoll > 0.55 ? 'spirit_herb' : 'dragon_saliva_herb';
        const count = herbId === 'spirit_herb' ? 2 : 1;

        InventorySystem.addItem(engine, herbId, count);
        const message = `你沿着药圃小心采摘，获得 ${ITEMS[herbId]?.name || herbId} x${count}。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleMeditate(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'SPIRIT_VEIN') {
            return { success: false, message: '这里的灵气并不值得专门吐纳。' };
        }

        const timeResult = engine.advanceTime(1, { action: 'CULTIVATE' });
        const expGain = 40 + engine.state.realm_idx * 18 + Math.floor(Math.random() * (35 + engine.state.realm_idx * 8));
        engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
        engine.state.battleStats.MP = Math.min(engine.state.battleStats.MAX_MP, (engine.state.battleStats.MP || 0) + 20);

        if (Math.random() < 0.2) {
            engine.state.attributes.INT = (engine.state.attributes.INT || 0) + 1;
        }

        const message = `你在灵脉节点静坐吐纳，修为增长 ${expGain}，灵力也更加凝练。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleExploreRuins(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'RUINS') {
            return { success: false, message: '这里没有可供探索的遗迹。' };
        }

        const timeResult = engine.advanceTime(1, { action: 'EXPLORE' });
        const lootTable = engine.state.realm_idx >= 2 ? LOOT_TABLES.MID_LEVEL : LOOT_TABLES.LOW_LEVEL;
        const loot = this.rollLoot(lootTable);
        const foundLore = Math.random() < 0.4;
        const expGain = engine.state.realm_idx >= 2 ? 24 + engine.state.realm_idx * 10 : 0;

        if (loot) {
            InventorySystem.addItem(engine, loot.itemId, loot.count);
        }
        if (foundLore && !engine.state.triggeredEvents.includes('RUIN_EXPLORED')) {
            engine.state.triggeredEvents.push('RUIN_EXPLORED');
        }
        if (expGain > 0) {
            engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
        }
        const lateBonus = this.grantLateGameExplorationBonus(engine);

        const messageParts = ['你深入遗迹废墟，避开坍塌石梁与残阵。'];
        if (loot) {
            messageParts.push(`最终带出了 ${ITEMS[loot.itemId]?.name || loot.itemId} x${loot.count}。`);
        }
        if (foundLore) {
            messageParts.push('你还记下了一段残缺碑文，似乎能作为后续机缘线索。');
        }
        if (expGain > 0) {
            messageParts.push(`此行也让你对自身所学有了更多体会，修为 +${expGain}。`);
        }

        if (lateBonus.length > 0) {
            messageParts.push(`浣犺繕甯﹀嚭浜?${lateBonus.join('、')}銆?`);
        }

        const message = messageParts.join('');
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleSecretRealm(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'SECRET_REALM') {
            return { success: false, message: '这里没有开启中的秘境入口。' };
        }

        const timeResult = engine.advanceTime(1, { action: 'EXPLORE' });
        const lootTable = engine.state.realm_idx >= 2 ? LOOT_TABLES.HIGH_LEVEL : LOOT_TABLES.MID_LEVEL;
        const loot = this.rollLoot(lootTable);
        const expGain = 48 + engine.state.realm_idx * 18;

        if (loot) {
            InventorySystem.addItem(engine, loot.itemId, loot.count);
        }
        engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);

        if (!engine.state.triggeredEvents.includes('SECRET_REALM_CLEAR')) {
            engine.state.triggeredEvents.push('SECRET_REALM_CLEAR');
        }

        engine.state.attributes.LUCK = (engine.state.attributes.LUCK || 0) + 1;

        const message = loot
            ? `你闯过秘境外围的灵压与残禁，带回 ${ITEMS[loot.itemId]?.name || loot.itemId} x${loot.count}，同时修为增长 ${expGain}。`
            : `你在秘境中全身而退，虽未获宝物，却磨砺了心境，修为 +${expGain}。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleGatherInfo(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'CITY' && location.type !== 'MARKET') {
            return { success: false, message: '这里消息闭塞，打探不到什么有用风声。' };
        }

        const fee = 3;
        if (!InventorySystem.spendMoney(engine, fee)) {
            return { success: false, message: `消息并不白来，至少要准备 ${fee} 灵石。` };
        }

        const timeResult = engine.advanceTime(0, { action: 'SOCIAL' }, 10);
        const rumors = [
            '你从茶肆散修口中听说附近遗迹最近灵光再现。',
            '坊市里有人在收购灵草，短期内药材更容易卖出好价。',
            '有位云游修士正在寻找可造之材，请多留意附近人物。',
            '听闻某处矿脉刚被冲开，近来更容易挖出高品质矿材。',
        ];

        if (!engine.state.flags.includes('RUMOR_NETWORK')) {
            engine.state.flags.push('RUMOR_NETWORK');
        }

        const message = `${rumors[Math.floor(Math.random() * rumors.length)]} 你顺手花掉了 ${fee} 灵石打点消息。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static handleAuction(engine: GameEngine, location: Location): TravelActionResult {
        if (location.type !== 'AUCTION_HOUSE') {
            return { success: false, message: '这里并非拍卖行，暂时没有竞价会场。' };
        }

        const entryFee = 12;
        if (!InventorySystem.spendMoney(engine, entryFee)) {
            return { success: false, message: `入场需要 ${entryFee} 灵石，你手头还不够宽裕。` };
        }

        const timeResult = engine.advanceTime(0, { action: 'TRADE' }, 12);
        const rewards = ['minor_heal_pill', 'qi_gathering_pill', 'book_sword_art', 'talisman_speed'];
        const rewardId = rewards[Math.floor(Math.random() * rewards.length)];
        InventorySystem.addItem(engine, rewardId, 1);

        const message = `你挤进拍场抢到一件漏拍货，最终以 ${entryFee} 灵石拿下 ${ITEMS[rewardId]?.name || rewardId}。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return {
            success: true,
            message,
            event: timeResult.event,
            timeMessage: timeResult.message,
            combat: timeResult.combat,
        };
    }

    private static rollLoot(table: typeof LOOT_TABLES.LOW_LEVEL) {
        const roll = Math.random() * 100;
        let currentWeight = 0;

        for (const item of table) {
            currentWeight += item.weight;
            if (roll <= currentWeight) {
                return {
                    itemId: item.itemId,
                    count: Math.floor(Math.random() * (item.max - item.min + 1)) + item.min,
                };
            }
        }

        return null;
    }
}
