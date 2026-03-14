import type { GameEngine } from '../GameEngine';
import { SECTS, type SectData, type SectState } from '../../data/sects';
import { ITEMS } from '../../data/items';
import { InventorySystem } from './InventorySystem';
import { getSectBondAssist } from '../../utils/socialUtils';

export interface SectActionResult {
    success: boolean;
    message: string;
}

export class SectSystem {
    static getSectState(engine: GameEngine): SectState | null {
        return engine.state.sectState || null;
    }

    private static setSectState(engine: GameEngine, state: SectState | null): void {
        engine.state.sectState = state;
        engine.state.sect = state?.id || null;
    }

    static getSectData(sectId: string): SectData | undefined {
        return SECTS.find((sect) => sect.id === sectId);
    }

    static getAllSects(): SectData[] {
        return SECTS;
    }

    static canJoin(engine: GameEngine, sectId: string): { canDo: boolean; reasons: string[] } {
        const sect = this.getSectData(sectId);
        if (!sect) return { canDo: false, reasons: ['宗门不存在。'] };

        const currentSect = this.getSectState(engine);
        if (currentSect) {
            return { canDo: false, reasons: ['你已加入其他宗门，需先退出当前宗门。'] };
        }

        const reasons: string[] = [];
        const realmIdx = engine.state.realm_idx || 0;
        if (realmIdx < sect.minRealmIdx) {
            reasons.push('境界不足');
        }

        if (sect.requirements) {
            for (const req of sect.requirements) {
                const value = engine.state.attributes[req.stat] || 0;
                if (value < req.min) {
                    reasons.push(`${req.stat} 不足 (需 ${req.min}，当前 ${Math.floor(value)})`);
                }
            }
        }

        return { canDo: reasons.length === 0, reasons };
    }

    static joinSect(engine: GameEngine, sectId: string): SectActionResult {
        const check = this.canJoin(engine, sectId);
        if (!check.canDo) {
            return { success: false, message: `入门失败：${check.reasons.join('；')}` };
        }

        const sect = this.getSectData(sectId)!;
        const state: SectState = {
            id: sectId,
            contribution: 0,
            rankIdx: 0,
            joinedMonth: engine.state.months,
            missionDoneThisMonth: false,
        };

        this.setSectState(engine, state);

        const logMsg = `${engine.getTimeStr()}【宗门】你正式加入了 ${sect.name}，身份为${sect.ranks[0].title}。`;
        engine.state.history.push(logMsg);
        return { success: true, message: logMsg };
    }

    static leaveSect(engine: GameEngine): SectActionResult {
        const sectState = this.getSectState(engine);
        if (!sectState) {
            return { success: false, message: '你当前并未加入任何宗门。' };
        }

        const sect = this.getSectData(sectState.id);
        this.setSectState(engine, null);

        const logMsg = `${engine.getTimeStr()}【宗门】你离开了 ${sect?.name || '原宗门'}，贡献随之清零。`;
        engine.state.history.push(logMsg);
        return { success: true, message: logMsg };
    }

    static doMission(engine: GameEngine, missionId: string): SectActionResult {
        const sectState = this.getSectState(engine);
        if (!sectState) {
            return { success: false, message: '你尚未加入任何宗门。' };
        }

        if (sectState.missionDoneThisMonth) {
            return { success: false, message: '本月已执行过宗门任务，下个月再来。' };
        }

        const sect = this.getSectData(sectState.id);
        if (!sect) return { success: false, message: '宗门数据异常。' };

        const mission = sect.missions.find((item) => item.id === missionId);
        if (!mission) return { success: false, message: '任务不存在。' };

        if (sectState.rankIdx < mission.minRankIdx) {
            return {
                success: false,
                message: `职位不足：需要达到 ${sect.ranks[mission.minRankIdx]?.title} 才能接取此任务。`,
            };
        }

        sectState.missionDoneThisMonth = true;

        const luck = engine.state.attributes.LUCK || 0;
        const bondAssist = getSectBondAssist(engine);
        const adjustedRate = Math.min(0.99, mission.successRate + luck * 0.005 + (bondAssist?.successBonus || 0));
        const roll = Math.random();
        const timeStr = engine.getTimeStr();

        if (roll > adjustedRate) {
            const failHint = bondAssist
                ? ` ${((bondAssist.npc.relationships || []).includes('DAO_PARTNER')) ? '道侣' : '义亲'} ${bondAssist.npc.name} 已尽力周旋，但此行仍差了些运数。`
                : '';
            const logMsg = `${timeStr}【宗门】任务「${mission.name}」执行失败。${failHint}`;
            engine.state.history.push(logMsg);
            return { success: false, message: logMsg };
        }

        const contributionGain = mission.contributionReward + (bondAssist?.contributionBonus || 0);
        sectState.contribution += contributionGain;
        engine.state.attributes.MONEY = (engine.state.attributes.MONEY || 0) + mission.moneyReward;

        let lootMsg = '';
        if (mission.lootItemId && mission.lootChance && Math.random() < mission.lootChance) {
            InventorySystem.addItem(engine, mission.lootItemId, 1);
            const itemDef = ITEMS[mission.lootItemId];
            lootMsg = `\n额外获得：${itemDef?.name || mission.lootItemId} x1`;
        }

        const bondMsg = bondAssist
            ? `\n${(bondAssist.npc.relationships || []).includes('DAO_PARTNER') ? '道侣' : '义亲'} ${bondAssist.npc.name} 暗中照拂，额外贡献 +${bondAssist.contributionBonus}`
            : '';
        const promotionMsg = this.checkPromotion(engine, sectState, sect);
        const logMsg = `${timeStr}【宗门】任务「${mission.name}」完成。贡献 +${contributionGain}，灵石 +${mission.moneyReward}${lootMsg}${bondMsg}${promotionMsg}`;
        engine.state.history.push(logMsg);

        return { success: true, message: logMsg };
    }

    private static checkPromotion(engine: GameEngine, sectState: SectState, sect: SectData): string {
        const nextRank = sect.ranks[sectState.rankIdx + 1];
        if (!nextRank) return '';

        if (sectState.contribution >= nextRank.minContribution) {
            sectState.rankIdx += 1;
            const msg = `\n${engine.getTimeStr()}【宗门】恭喜，你已晋升为 ${nextRank.title}。${nextRank.benefits}`;
            engine.state.history.push(msg);
            return msg;
        }

        return '';
    }

    static exchangeItem(engine: GameEngine, itemId: string): SectActionResult {
        const sectState = this.getSectState(engine);
        if (!sectState) {
            return { success: false, message: '你尚未加入任何宗门。' };
        }

        const sect = this.getSectData(sectState.id);
        if (!sect) return { success: false, message: '宗门数据异常。' };

        const shopItem = sect.shopItems.find((item) => item.itemId === itemId);
        if (!shopItem) {
            return { success: false, message: '该物品不在宗门商店中。' };
        }

        if (sectState.contribution < shopItem.contributionCost) {
            return {
                success: false,
                message: `贡献点不足 (需 ${shopItem.contributionCost}，当前 ${sectState.contribution})。`,
            };
        }

        sectState.contribution -= shopItem.contributionCost;
        InventorySystem.addItem(engine, itemId, 1);

        const itemDef = ITEMS[itemId];
        const logMsg = `${engine.getTimeStr()}【宗门】你消耗 ${shopItem.contributionCost} 贡献点兑换了 ${itemDef?.name || itemId} x1。`;
        engine.state.history.push(logMsg);

        return { success: true, message: logMsg };
    }

    static monthlyReset(engine: GameEngine): void {
        const sectState = this.getSectState(engine);
        if (sectState) {
            sectState.missionDoneThisMonth = false;
        }
    }

    static getCurrentRankTitle(engine: GameEngine): string {
        const sectState = this.getSectState(engine);
        if (!sectState) return '散修';
        const sect = this.getSectData(sectState.id);
        if (!sect) return '散修';
        return sect.ranks[sectState.rankIdx]?.title || '散修';
    }
}
