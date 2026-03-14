/**
 * AbodeSystem — 洞府与灵田管理引擎
 *
 * 处理洞府升级、灵田种植/收获、每月生长 tick。
 */

import type { GameEngine } from '../GameEngine';
import {
    ABODE_LEVELS,
    HERB_SEEDS,
    type AbodeState,
    type HerbSeed,
} from '../../data/abode';
import { ITEMS } from '../../data/items';
import { InventorySystem } from './InventorySystem';

export interface AbodeActionResult {
    success: boolean;
    message: string;
}

export class AbodeSystem {

    /**
     * 获取/初始化洞府状态
     */
    static getAbodeState(engine: GameEngine): AbodeState {
        if (!engine.state.abode) {
            engine.state.abode = { level: 0, plots: [] };
        }
        return engine.state.abode;
    }

    /**
     * 获取当前洞府等级数据
     */
    static getCurrentLevel(engine: GameEngine) {
        const abode = this.getAbodeState(engine);
        return ABODE_LEVELS[abode.level] || ABODE_LEVELS[0];
    }

    /**
     * 获取下一级洞府数据（如果有的话）
     */
    static getNextLevel(engine: GameEngine) {
        const abode = this.getAbodeState(engine);
        return ABODE_LEVELS[abode.level + 1] || null;
    }

    /**
     * 获取当前可种植的灵草种子列表
     */
    static getAvailableSeeds(engine: GameEngine): HerbSeed[] {
        const abode = this.getAbodeState(engine);
        return HERB_SEEDS.filter(s => s.minAbodeLevel <= abode.level);
    }

    /**
     * 升级洞府
     */
    static upgradeAbode(engine: GameEngine): AbodeActionResult {
        const abode = this.getAbodeState(engine);
        const nextLevel = ABODE_LEVELS[abode.level + 1];

        if (!nextLevel) {
            return { success: false, message: '洞府已是最高等级。' };
        }

        const realmIdx = engine.state.realm_idx || 0;
        if (realmIdx < nextLevel.minRealmIdx) {
            return { success: false, message: `境界不足，需要至少达到更高的修为才能升级。` };
        }

        const money = engine.state.attributes.MONEY || 0;
        if (money < nextLevel.upgradeCost) {
            return { success: false, message: `灵石不足，需要 ${nextLevel.upgradeCost} 灵石 (当前: ${money})。` };
        }

        // 消耗灵石
        engine.state.attributes.MONEY = money - nextLevel.upgradeCost;

        // 升级
        abode.level = nextLevel.level;

        // 确保灵田数组大小正确（新增空田）
        while (abode.plots.length < nextLevel.maxPlots) {
            abode.plots.push({ herbId: null, growthMonths: 0, mature: false, mutated: false });
        }

        const timeStr = engine.getTimeStr();
        const logMsg = `${timeStr}【洞府】恭喜！你的洞府升级为「${nextLevel.name}」。修炼加速 +${Math.round(nextLevel.cultivationBonus * 100)}%，灵田上限 ${nextLevel.maxPlots} 块。`;
        engine.state.history.push(logMsg);

        return { success: true, message: logMsg };
    }

    /**
     * 在指定灵田地块种植灵草
     */
    static plantHerb(engine: GameEngine, plotIndex: number, seedId: string): AbodeActionResult {
        const abode = this.getAbodeState(engine);
        const level = this.getCurrentLevel(engine);

        if (plotIndex < 0 || plotIndex >= level.maxPlots) {
            return { success: false, message: '无效的灵田地块。' };
        }

        // 确保 plot 存在
        while (abode.plots.length <= plotIndex) {
            abode.plots.push({ herbId: null, growthMonths: 0, mature: false, mutated: false });
        }

        const plot = abode.plots[plotIndex];
        if (plot.herbId !== null) {
            return { success: false, message: '该地块已有作物，需等待收获或清除。' };
        }

        const seed = HERB_SEEDS.find(s => s.id === seedId);
        if (!seed) {
            return { success: false, message: '未知的种子类型。' };
        }

        if (seed.minAbodeLevel > abode.level) {
            return { success: false, message: `洞府等级不足，需要「${ABODE_LEVELS[seed.minAbodeLevel]?.name}」才能种植此灵草。` };
        }

        // 扣除种子费用
        const money = engine.state.attributes.MONEY || 0;
        if (money < seed.seedPrice) {
            return { success: false, message: `灵石不足，购买种子需要 ${seed.seedPrice} 灵石。` };
        }
        engine.state.attributes.MONEY = money - seed.seedPrice;

        // 种植
        plot.herbId = seedId;
        plot.growthMonths = 0;
        plot.mature = false;
        plot.mutated = false;

        const timeStr = engine.getTimeStr();
        const logMsg = `${timeStr}【灵田】在灵田中种下了「${seed.name}」，预计 ${seed.growthMonths} 个月后成熟。`;
        engine.state.history.push(logMsg);

        return { success: true, message: logMsg };
    }

    /**
     * 收获已成熟的灵草
     */
    static harvestHerb(engine: GameEngine, plotIndex: number): AbodeActionResult {
        const abode = this.getAbodeState(engine);

        if (plotIndex < 0 || plotIndex >= abode.plots.length) {
            return { success: false, message: '无效的灵田地块。' };
        }

        const plot = abode.plots[plotIndex];
        if (!plot.herbId || !plot.mature) {
            return { success: false, message: '该地块尚无成熟作物。' };
        }

        const seed = HERB_SEEDS.find(s => s.id === plot.herbId);
        if (!seed) {
            // Shouldn't happen, but be safe
            plot.herbId = null;
            plot.growthMonths = 0;
            plot.mature = false;
            return { success: false, message: '未知作物数据，已清理地块。' };
        }

        // 计算收获量
        let count = seed.harvestMin + Math.floor(Math.random() * (seed.harvestMax - seed.harvestMin + 1));
        if (plot.mutated) count *= 2;

        // 添加到背包
        InventorySystem.addItem(engine, seed.harvestItemId, count);
        const itemDef = ITEMS[seed.harvestItemId];

        // 清空地块
        plot.herbId = null;
        plot.growthMonths = 0;
        plot.mature = false;
        const wasMutated = plot.mutated;
        plot.mutated = false;

        const timeStr = engine.getTimeStr();
        const mutationText = wasMutated ? '（变异加成！）' : '';
        const logMsg = `${timeStr}【灵田】收获了 ${itemDef?.name || seed.harvestItemId} x${count} ${mutationText}`;
        engine.state.history.push(logMsg);

        return { success: true, message: logMsg };
    }

    /**
     * 清除地块（放弃未成熟的作物）
     */
    static clearPlot(engine: GameEngine, plotIndex: number): AbodeActionResult {
        const abode = this.getAbodeState(engine);

        if (plotIndex < 0 || plotIndex >= abode.plots.length) {
            return { success: false, message: '无效的灵田地块。' };
        }

        const plot = abode.plots[plotIndex];
        if (!plot.herbId) {
            return { success: false, message: '地块已是空地。' };
        }

        const seed = HERB_SEEDS.find(s => s.id === plot.herbId);
        plot.herbId = null;
        plot.growthMonths = 0;
        plot.mature = false;
        plot.mutated = false;

        return { success: true, message: `清除了「${seed?.name || '未知作物'}」。` };
    }

    /**
     * 每月 tick — 推进灵田生长
     * 应在 TimeSystem.advanceTime 中调用
     */
    static tickGrowth(engine: GameEngine, monthsPassed: number): void {
        const abode = this.getAbodeState(engine);
        if (abode.level === 0 || abode.plots.length === 0) return;

        for (const plot of abode.plots) {
            if (!plot.herbId || plot.mature) continue;

            const seed = HERB_SEEDS.find(s => s.id === plot.herbId);
            if (!seed) continue;

            plot.growthMonths += monthsPassed;

            // 检查是否成熟
            if (plot.growthMonths >= seed.growthMonths) {
                plot.mature = true;

                // 变异判定
                const luck = engine.state.attributes.LUCK || 0;
                const mutationRoll = Math.random();
                if (mutationRoll < seed.mutationChance + luck * 0.002) {
                    plot.mutated = true;
                    const timeStr = engine.getTimeStr();
                    engine.state.history.push(`${timeStr}【灵田】「${seed.name}」发生了变异！收获时产量翻倍！`);
                }
            }
        }
    }

    /**
     * 获取洞府的修炼加成倍率
     */
    static getCultivationBonus(engine: GameEngine): number {
        const level = this.getCurrentLevel(engine);
        return level.cultivationBonus;
    }
}
