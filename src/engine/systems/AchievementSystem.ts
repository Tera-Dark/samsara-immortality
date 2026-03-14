import type { GameEngine } from '../GameEngine';
import { ACHIEVEMENTS, type Achievement } from '../../data/achievements';
import { useMetaStore } from '../../store/metaStore';
import { SectSystem } from './SectSystem';
import { AbodeSystem } from './AbodeSystem';

export class AchievementSystem {
    static checkAll(engine: GameEngine): Achievement[] {
        const metaState = useMetaStore.getState().metaState;
        const unlocked = metaState.achievements || [];
        const newlyUnlocked: Achievement[] = [];

        for (const ach of ACHIEVEMENTS) {
            if (unlocked.includes(ach.id)) continue;
            if (this.checkCondition(engine, ach)) {
                newlyUnlocked.push(ach);
            }
        }

        if (newlyUnlocked.length > 0) {
            for (const ach of newlyUnlocked) {
                useMetaStore.getState().unlockAchievement(ach.id);
                useMetaStore.getState().addKarma(ach.karmaReward);

                const timeStr = engine.getTimeStr();
                const rewardText = ach.karmaReward > 0 ? `（轮回点+${ach.karmaReward}）` : '';
                engine.state.history.push(`${timeStr}🏆 成就达成：「${ach.name}」- ${ach.description}${rewardText}`);
            }
        }

        return newlyUnlocked;
    }

    private static checkCondition(engine: GameEngine, ach: Achievement): boolean {
        const cond = ach.condition;
        const state = engine.state;

        switch (cond.type) {
            case 'REALM_REACHED':
                return (state.realm_idx || 0) >= cond.realmIdx;
            case 'AGE_REACHED':
                return state.age >= cond.age;
            case 'STAT_REACHED':
                return (state.attributes[cond.stat] || 0) >= cond.value;
            case 'FLAG_OBTAINED':
                return state.flags.includes(cond.flag);
            case 'REINCARNATION_COUNT':
                return useMetaStore.getState().metaState.reincarnationCount >= cond.count;
            case 'TOTAL_KILLS':
                return (state.attributes.KILLS || 0) >= cond.count;
            case 'MONEY_REACHED':
                return (state.attributes.MONEY || 0) >= cond.amount;
            case 'ITEM_COUNT':
                return state.inventory.reduce((total, slot) => total + (slot.count || 0), 0) >= cond.count;
            case 'ALCHEMY_COUNT':
                return (state.attributes.ALCHEMY_PROF || 0) >= cond.count;
            case 'SECT_RANK': {
                const sectState = SectSystem.getSectState(engine);
                return sectState !== null && sectState.rankIdx >= cond.rankIdx;
            }
            case 'ABODE_LEVEL': {
                const abode = AbodeSystem.getAbodeState(engine);
                return abode.level >= cond.level;
            }
            default:
                return false;
        }
    }

    static getUnlockedTalentGrades(): Set<number> {
        const metaState = useMetaStore.getState().metaState;
        const unlocked = metaState.achievements || [];
        const grades = new Set<number>([1, 2, 3, 4]);

        for (const achId of unlocked) {
            const ach = ACHIEVEMENTS.find(a => a.id === achId);
            if (!ach?.unlocks) continue;
            for (const unlock of ach.unlocks) {
                if (unlock.type === 'TALENT_POOL' && unlock.grades) {
                    unlock.grades.forEach(g => grades.add(g));
                }
            }
        }

        return grades;
    }

    static getAllAchievements(): { achievement: Achievement; unlocked: boolean }[] {
        const metaState = useMetaStore.getState().metaState;
        const unlocked = metaState.achievements || [];

        return ACHIEVEMENTS.map(ach => ({
            achievement: ach,
            unlocked: unlocked.includes(ach.id),
        }));
    }
}
