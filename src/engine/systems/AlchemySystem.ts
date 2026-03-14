/**
 * AlchemySystem — 炼丹术核心引擎
 * 
 * 处理炼丹的成功率计算、品质判定和资源消耗。
 * 成功率受 MND(神识) + INT(悟性) + LUCK(气运) + 熟练度影响。
 * 品质分四阶：废丹 → 凡品 → 良品 → 极品。
 */

import type { GameEngine } from '../GameEngine';
import { ALCHEMY_RECIPES, type AlchemyRecipe, type PillQuality, PILL_QUALITY_LABELS } from '../../data/alchemy';
import { ITEMS } from '../../data/items';
import { InventorySystem } from './InventorySystem';

export interface AlchemyResult {
    success: boolean;
    message: string;
    quality?: PillQuality;
    itemId?: string;
    count?: number;
}

export class AlchemySystem {

    /**
     * 获取玩家当前可用（境界已解锁）的配方列表
     */
    static getAvailableRecipes(engine: GameEngine): AlchemyRecipe[] {
        const realmIdx = engine.state.realm_idx || 0;
        // 只要已解锁丹道标记即可（炼气后自动获得）
        if (!engine.state.flags.includes('HAS_ALCHEMY')) return [];
        return ALCHEMY_RECIPES.filter(r => r.minRealmIdx <= realmIdx);
    }

    /**
     * 检查某个配方的材料是否满足
     */
    static canRefine(engine: GameEngine, recipeId: string): { canDo: boolean; missing: string[] } {
        const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return { canDo: false, missing: ['配方不存在'] };

        const realmIdx = engine.state.realm_idx || 0;
        if (realmIdx < recipe.minRealmIdx) {
            return { canDo: false, missing: ['境界不足'] };
        }

        const missing: string[] = [];
        for (const mat of recipe.materials) {
            const slot = engine.state.inventory.find(s => s.itemId === mat.itemId);
            const have = slot ? slot.count : 0;
            if (have < mat.count) {
                const itemDef = ITEMS[mat.itemId];
                missing.push(`${itemDef?.name || mat.itemId} (需${mat.count}/有${have})`);
            }
        }

        return { canDo: missing.length === 0, missing };
    }

    /**
     * 计算炼丹成功率 (0~1)
     * 公式：base = (MND*2 + INT*1.5 + LUCK + proficiency*0.5) / (difficulty * 2)
     * 最终 clamp 到 [5%, 95%]
     */
    static calculateSuccessRate(engine: GameEngine, recipe: AlchemyRecipe): number {
        const mnd = engine.state.attributes.MND || 0;
        const int = engine.state.attributes.INT || 0;
        const luck = engine.state.attributes.LUCK || 0;
        const proficiency = engine.state.attributes.ALCHEMY_PROF || 0;

        const power = mnd * 2 + int * 1.5 + luck + proficiency * 0.5;
        let rate = power / (recipe.difficulty * 2);

        // Clamp
        rate = Math.max(0.05, Math.min(0.95, rate));
        return rate;
    }

    /**
     * 判定丹药品质
     * LUCK 和 MND 共同影响极品概率
     */
    static rollQuality(engine: GameEngine, recipe: AlchemyRecipe): PillQuality {
        const luck = engine.state.attributes.LUCK || 0;
        const mnd = engine.state.attributes.MND || 0;
        const proficiency = engine.state.attributes.ALCHEMY_PROF || 0;

        // 品质点数 = (LUCK + MND/2 + 熟练度/3) 对抗 difficulty
        const qualityScore = (luck + mnd / 2 + proficiency / 3) / recipe.difficulty;
        const roll = Math.random();

        if (roll < 0.02 + qualityScore * 0.08) {
            return 'PERFECT'; // ~2-10% 概率
        } else if (roll < 0.15 + qualityScore * 0.2) {
            return 'GOOD';    // ~15-35% 概率
        } else {
            return 'COMMON';  // 其余为凡品
        }
    }

    /**
     * 执行炼丹
     */
    static refine(engine: GameEngine, recipeId: string): AlchemyResult {
        const recipe = ALCHEMY_RECIPES.find(r => r.id === recipeId);
        if (!recipe) {
            return { success: false, message: '丹方不存在。' };
        }

        // 检查材料
        const check = this.canRefine(engine, recipeId);
        if (!check.canDo) {
            return { success: false, message: `材料不足：${check.missing.join('、')}` };
        }

        // 消耗材料
        for (const mat of recipe.materials) {
            InventorySystem.removeItem(engine, mat.itemId, mat.count);
        }

        // 增加熟练度
        engine.state.attributes.ALCHEMY_PROF = (engine.state.attributes.ALCHEMY_PROF || 0) + recipe.proficiencyGain;

        // 成功率判定
        const rate = this.calculateSuccessRate(engine, recipe);
        const roll = Math.random();

        if (roll > rate) {
            // 炼丹失败 → 废丹
            const timeStr = engine.getTimeStr();
            const logMsg = `${timeStr}【炼丹】尝试炼制「${recipe.name}」...丹炉轰鸣，药液崩散，炼丹失败了。(成功率: ${Math.round(rate * 100)}%)`;
            engine.state.history.push(logMsg);
            return {
                success: false,
                message: logMsg,
                quality: 'WASTE',
            };
        }

        // 成功 → 判定品质
        const quality = this.rollQuality(engine, recipe);
        const qualityLabel = PILL_QUALITY_LABELS[quality];

        // 品质影响产出数量
        let finalCount = recipe.resultCount;
        if (quality === 'PERFECT') finalCount += 1; // 极品多一颗

        // 添加丹药到背包
        InventorySystem.addItem(engine, recipe.resultItemId, finalCount);

        const itemDef = ITEMS[recipe.resultItemId];
        const pillName = itemDef?.name || recipe.resultItemId;

        const timeStr = engine.getTimeStr();
        const logMsg = `${timeStr}【炼丹】炼制「${recipe.name}」成功！出丹品质：${qualityLabel}。获得 ${pillName} x${finalCount}`;
        engine.state.history.push(logMsg);

        return {
            success: true,
            message: logMsg,
            quality,
            itemId: recipe.resultItemId,
            count: finalCount,
        };
    }
}
