import { GameEngine } from '../GameEngine';
import type { FortuneBuff } from '../../types';
import { ConditionMatcher } from '../../utils/ConditionMatcher';
import { CultivationSystem } from './CultivationSystem';
import { TEXT_CONSTANTS } from '../../data/rules';

export class TalentSystem {
    static triggerTalents(engine: GameEngine, trigger: import('../../types').TriggerType) {
        engine.state.talents.forEach(talent => {
            if (!talent.modifiers) return;

            talent.modifiers.forEach(mod => {
                if (mod.trigger !== trigger) return;

                // Unified Condition Check
                const conditions = mod.conditions || [];
                if (!ConditionMatcher.checkConditions(engine.state, conditions)) return;

                // Probability Check
                if (mod.probability !== undefined && Math.random() > mod.probability) return;

                let triggeredAny = false;
                const changes: string[] = [];

                // Apply Effects (Standardized)
                if (mod.stats) {
                    for (const [k, v] of Object.entries(mod.stats)) {
                        if (v !== undefined) {
                            engine.state.attributes[k] = (engine.state.attributes[k] || 0) + v;
                            const statName = TEXT_CONSTANTS.STATS[k as keyof typeof TEXT_CONSTANTS.STATS] || k;
                            changes.push(`${statName} +${v}`);
                            triggeredAny = true;
                        }
                    }
                }

                if (mod.battle) {
                    for (const [k, v] of Object.entries(mod.battle)) {
                        if (engine.state.battleStats[k] !== undefined && v !== undefined) {
                            engine.state.battleStats[k] += v;
                            changes.push(`${k} +${v}`);
                            triggeredAny = true;
                        }
                    }
                }

                if (mod.resource) {
                    for (const [k, v] of Object.entries(mod.resource)) {
                        if (v === undefined) continue;
                        if (k === 'SPIRIT_STONES') {
                            engine.state.attributes.MONEY = (engine.state.attributes.MONEY || 0) + v;
                            changes.push(`灵石 +${v}`);
                            triggeredAny = true;
                        } else {
                            engine.state.home.resources[k] = (engine.state.home.resources[k] || 0) + v;
                            triggeredAny = true;
                        }
                    }
                }

                // If this was a probability-based trigger (like TURN_END occasional events) and it succeeded, push a log
                if (mod.probability !== undefined && triggeredAny) {
                     // The history array takes strings
                     const ageStr = engine.state.age > 0 ? `[${engine.state.age}岁] ` : '';
                     engine.state.history.unshift(`${ageStr}你的命格【${talent.name}】触发：${changes.join(', ')}`);
                }
            });
        });

        CultivationSystem.recalculateStats(engine);
    }

    static tickFortuneBuffs(engine: GameEngine, monthsPassed: number) {
        const expired: FortuneBuff[] = [];
        engine.state.fortuneBuffs = engine.state.fortuneBuffs.filter(buff => {
            buff.remainingMonths -= monthsPassed;
            if (buff.remainingMonths <= 0) {
                expired.push(buff);
                return false;
            }
            return true;
        });

        // 过期时撤销属性加成并记录日志
        for (const buff of expired) {
            for (const [k, v] of Object.entries(buff.effects)) {
                engine.state.attributes[k] = (engine.state.attributes[k] || 0) - v;
            }
            const timeStr = engine.getTimeStr();
            engine.state.history.push(`${timeStr} 「${buff.name}」气运消散了…`);
        }
    }

    static addFortuneBuff(engine: GameEngine, buff: Omit<FortuneBuff, 'remainingMonths'> & { remainingMonths?: number }) {
        // 检查是否已存在
        const existing = engine.state.fortuneBuffs.find(b => b.id === buff.id);
        if (existing) {
            existing.remainingMonths = buff.durationMonths; // 刷新时间
            return;
        }

        const fullBuff: FortuneBuff = {
            ...buff,
            remainingMonths: buff.remainingMonths ?? buff.durationMonths
        };

        engine.state.fortuneBuffs.push(fullBuff);

        // 应用属性加成
        for (const [k, v] of Object.entries(fullBuff.effects)) {
            engine.state.attributes[k] = (engine.state.attributes[k] || 0) + v;
        }

        const timeStr = engine.getTimeStr();
        const effectsStr = Object.entries(fullBuff.effects).map(([k, v]) => {
            const name = TEXT_CONSTANTS.STATS[k as keyof typeof TEXT_CONSTANTS.STATS] || k;
            return `${name} ${v > 0 ? '+' : ''}${v}`;
        }).join('，');
        engine.state.history.push(`${timeStr} 获得气运「${fullBuff.name}」（持续${fullBuff.durationMonths}月）\n${effectsStr}`);
    }
}
