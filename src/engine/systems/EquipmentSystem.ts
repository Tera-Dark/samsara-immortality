/**
 * EquipmentSystem — 装备管理
 * 
 * 从 GameEngine 中提取的装备逻辑：装备、卸下法宝。
 */

import type { GameEngine } from '../GameEngine';
import { ITEMS } from '../../data/items';
import { InventorySystem } from './InventorySystem';

export class EquipmentSystem {
    static equipItem(engine: GameEngine, itemId: string): { success: boolean; message: string } {
        const itemDef = ITEMS[itemId];
        if (!itemDef || itemDef.type !== 'EQUIPMENT' || !itemDef.equipType) {
            return { success: false, message: '该物品不可装备。' };
        }

        if (!InventorySystem.removeItem(engine, itemId, 1)) {
            return { success: false, message: '背包中没有该物品。' };
        }

        const slotTypes: Record<string, keyof typeof engine.state.equipment> = {
            'WEAPON': 'weapon',
            'ARMOR': 'armor',
            'ACCESSORY': 'accessory'
        };
        const slot = slotTypes[itemDef.equipType];

        const currentEquipped = engine.state.equipment[slot];

        // Swap if already equipped
        if (currentEquipped) {
            InventorySystem.addItem(engine, currentEquipped, 1);
        }

        engine.state.equipment[slot] = itemId;
        engine.recalculateStats();

        const msg = `你装备上了【${itemDef.name}】。`;
        engine.state.history.push(`${engine.getTimeStr()} ${msg}`);
        return { success: true, message: msg };
    }

    static unequipItem(engine: GameEngine, slot: 'weapon' | 'armor' | 'accessory'): { success: boolean; message: string } {
        const currentEquippedId = engine.state.equipment[slot];
        if (!currentEquippedId) {
            return { success: false, message: '该部位没有装配任何法宝。' };
        }

        const itemDef = ITEMS[currentEquippedId];
        engine.state.equipment[slot] = null;
        InventorySystem.addItem(engine, currentEquippedId, 1);
        engine.recalculateStats();

        const msg = `你解除了【${itemDef?.name || '未知法宝'}】的绑定。`;
        engine.state.history.push(`${engine.getTimeStr()} ${msg}`);
        return { success: true, message: msg };
    }
}
