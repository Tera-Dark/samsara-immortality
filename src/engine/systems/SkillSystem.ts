/**
 * SkillSystem — 技能/功法管理
 * 
 * 从 GameEngine 中提取的技能逻辑：学习、装备、卸下功法。
 */

import type { GameEngine } from '../GameEngine';
import { SKILLS } from '../../data/skills';

export class SkillSystem {
    static learnSkill(engine: GameEngine, skillId: string): { success: boolean; message: string } {
        if (!SKILLS[skillId]) {
            return { success: false, message: '该功法不存在。' };
        }
        if (engine.state.learnedSkills.includes(skillId)) {
            return { success: false, message: '你已经学会了该功法。' };
        }

        engine.state.learnedSkills.push(skillId);
        const skillDef = SKILLS[skillId];
        const msg = `你参悟了【${skillDef.name}】。`;
        engine.state.history.push(`${engine.getTimeStr()} ${msg}`);
        return { success: true, message: msg };
    }

    static equipSkill(engine: GameEngine, skillId: string, slotIndex: number): { success: boolean; message: string } {
        if (slotIndex < 0 || slotIndex >= 4) {
            return { success: false, message: '无效的法术位。' };
        }
        if (!engine.state.learnedSkills.includes(skillId)) {
            return { success: false, message: '你尚未掌握该法术。' };
        }

        // Check if already equipped in another slot
        const existingSlot = engine.state.equippedSkills.indexOf(skillId);
        if (existingSlot !== -1 && existingSlot !== slotIndex) {
            engine.state.equippedSkills[existingSlot] = null;
        }

        engine.state.equippedSkills[slotIndex] = skillId;
        const msg = `你将【${SKILLS[skillId].name}】装备到了法术位。`;
        return { success: true, message: msg };
    }

    static unequipSkill(engine: GameEngine, slotIndex: number): { success: boolean; message: string } {
        if (slotIndex < 0 || slotIndex >= 4) {
            return { success: false, message: '无效的法术位。' };
        }
        const skillId = engine.state.equippedSkills[slotIndex];
        if (skillId) {
            engine.state.equippedSkills[slotIndex] = null;
            return { success: true, message: `你卸下了法术。` };
        }
        return { success: false, message: `该位置没有装备法术。` };
    }
}
