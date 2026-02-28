import type { PlayerState } from '../types';

export function getGuidance(state: PlayerState): { text: string; subtext?: string } {
    const age = Math.floor(state.months / 12);

    // 1. 幼儿期 (0-3岁)
    if (age < 3) {
        return {
            text: "茁壮成长",
            subtext: "使用[成长]跳过时间，等待3岁开启更多行动。"
        };
    }

    // 2. 凡人期 (属性积累)
    // 检查是否已踏入仙途 (Has Qi)
    const hasQi = state.realm_idx >= 1;
    const hasBook = state.flags.includes('HAS_CULTIVATION_METHOD');

    if (!hasQi) {
        // 还没引气入体
        if (!hasBook) {
            // 还没功法 -> 需属性达标或奇遇
            // 检查属性是否足够触发"仙缘" (假设需要某属性>10或运气)
            // 简化逻辑：引导提升属性
            const maxAttr = Math.max(...Object.values(state.attributes));
            if (maxAttr < 10) {
                return {
                    text: "打熬筋骨",
                    subtext: "通过[习文]或[习武]将任意属性提升至10点以上。"
                };
            } else {
                return {
                    text: "寻仙问道",
                    subtext: "属性已足，通过[历练]寻找仙缘，或继续[习文/习武]等待机缘。"
                };
            }
        } else {
            // 有功法，没入道 -> 修炼！
            return {
                text: "感应灵气",
                subtext: "使用[修炼]尝试引气入体，踏入仙途。"
            };
        }
    }

    // 3. 炼气期
    if (state.realm_idx === 1) { // 炼气
        // 检查是否瓶颈
        // 这里简化判断，假设 MP 满了就是瓶颈
        // Actually gameStore checks `mpValue` vs `MAX_MP`.
        // But `state` in `guideSystem` might not have transient `mpValue` if it's in a separate store? 
        // Wait, `mpValue` was calculated in GameScene from `state`? 
        // Ah, `gameState.battleStats.MAX_MP` is the limit. 
        // The current value is... wait, where is current MP stored?
        // `engine.state` usually has it? 
        // In `GameEngine.ts`, `this.state` has `battleStats`, but `init` sets `MP` in `battleStats`.
        // Usually `currentMP` is separate from `MAX_MP`?
        // Looking at `GameScene.tsx`: `const mpValue = gameState.battleStats.MAX_MP || 0;` 
        // Wait, line 30 involves `MAX_MP`.
        // Line 82: `width: ... mpValue / (gameState.battleStats.MAX_MP ...)`
        // It seems `mpValue` IS `MAX_MP` in the current simplistic implementation?
        // Or `mpValue` is missing from `PlayerState` typescript definition?
        // Let's re-read `PlayerState` in `index.ts`.
        // `PlayerState` has `battleStats: BattleStats`. `BattleStats` has `MAX_MP`.
        // Where is current MP?
        // If the game design implies "Cultivation Progress" = "Max MP", then `MAX_MP` grows until it hits Realm Limit.

        // Return generic cultivation advice
        return {
            text: "精进修为",
            subtext: "坚持[修炼]提升灵力上限，准备突破境界。"
        };
    }

    // 4. 筑基期
    if (state.realm_idx === 2) {
        return {
            text: "游历天下",
            subtext: "筑基已成，可前往[世界地图]探索更广阔的天地。"
        };
    }

    return {
        text: "修仙路漫漫",
        subtext: "道法自然，随心而动。"
    };
}
