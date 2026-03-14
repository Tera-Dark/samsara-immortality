/**
 * InventorySystem - 物品背包管理
 *
 * 从 GameEngine 中提取的物品管理逻辑：添加、移除、使用物品、金钱管理。
 */

import type { GameEngine } from '../GameEngine';
import { ITEMS } from '../../data/items';
import { SKILLS } from '../../data/skills';

export class InventorySystem {
    static addItem(engine: GameEngine, itemId: string, count: number): void {
        if (count <= 0) return;
        const itemDef = ITEMS[itemId];
        if (!itemDef) {
            console.warn(`[InventorySystem] Attempted to add unknown item: ${itemId}`);
            return;
        }

        const existingSlot = engine.state.inventory.find(s => s.itemId === itemId);
        if (existingSlot && itemDef.stackable) {
            existingSlot.count += count;
        } else {
            engine.state.inventory.push({ itemId, count });
        }
    }

    static removeItem(engine: GameEngine, itemId: string, count: number): boolean {
        const slotIdx = engine.state.inventory.findIndex(s => s.itemId === itemId);
        if (slotIdx === -1) return false;

        if (engine.state.inventory[slotIdx].count < count) return false;

        engine.state.inventory[slotIdx].count -= count;
        if (engine.state.inventory[slotIdx].count <= 0) {
            engine.state.inventory.splice(slotIdx, 1);
        }
        return true;
    }

    static consumeItem(engine: GameEngine, itemId: string): { success: boolean; message: string } {
        const slot = engine.state.inventory.find(s => s.itemId === itemId);
        if (!slot) return { success: false, message: '你没有该物品。' };

        const itemDef = ITEMS[itemId];
        if (!itemDef) return { success: false, message: '物品定义不存在。' };
        if (itemDef.type !== 'CONSUMABLE') return { success: false, message: '该物品无法直接使用。' };

        this.removeItem(engine, itemId, 1);

        let msg = `使用了【${itemDef.name}】。`;

        if (itemDef.effect) {
            const changes = engine.applyEffect(itemDef.effect);
            if (changes.length > 0) {
                msg += `\n(${changes.join('，')})`;
            }
            if (itemDef.effect.history) {
                msg += `\n${itemDef.effect.history}`;
            }
        } else {
            msg += '\n暂时没有感受到明显变化。';
        }

        if (itemDef.learnSkillId && SKILLS[itemDef.learnSkillId]) {
            const skillDef = SKILLS[itemDef.learnSkillId];
            const learnResult = engine.learnSkill(itemDef.learnSkillId);
            msg += learnResult.success
                ? `\n你领悟了【${skillDef.name}】。`
                : `\n${learnResult.message}`;

            const hasNoEquippedSkills = engine.state.equippedSkills.every(skillId => !skillId);
            const firstEmptySlot = engine.state.equippedSkills.findIndex(skillId => !skillId);
            if (learnResult.success && hasNoEquippedSkills && firstEmptySlot !== -1) {
                const equipResult = engine.equipSkill(itemDef.learnSkillId, firstEmptySlot);
                if (equipResult.success) {
                    msg += '\n新法术已自动装备到第一个法术位。';
                }
            }
        }

        return { success: true, message: msg };
    }

    static addSpiritStones(engine: GameEngine, amount: number): void {
        engine.state.attributes.MONEY = (engine.state.attributes.MONEY || 0) + amount;
    }

    static earnMoney(engine: GameEngine, amount: number): void {
        engine.state.attributes.MONEY = (engine.state.attributes.MONEY || 0) + amount;
    }

    static spendMoney(engine: GameEngine, amount: number): boolean {
        const current = engine.state.attributes.MONEY || 0;
        if (current < amount) return false;
        engine.state.attributes.MONEY = current - amount;
        return true;
    }

    static getMoney(engine: GameEngine): number {
        return engine.state.attributes.MONEY || 0;
    }
}
