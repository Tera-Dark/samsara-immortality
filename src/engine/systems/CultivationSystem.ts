import { GameEngine } from '../GameEngine';
import { CULTIVATION_REALMS, REALMS } from '../../types';
import { GAME_RULES } from '../../data/rules';
import { deriveBattleStats } from '../../utils/DataUtils';
import type { CombatEntity, CombatState } from '../../types/combat';
import { ITEMS } from '../../data/items';
import type { BattleStats } from '../../types';

export class CultivationSystem {
    static recalculateStats(engine: GameEngine) {
        // 1. Calculate effective attributes (Base + Equipment)
        const effectiveAttributes = { ...engine.state.attributes };
        const flatBattleStatsBonuses: Partial<BattleStats> = {};

        if (engine.state.equipment) {
            const equippedIds = [
                engine.state.equipment.weapon,
                engine.state.equipment.armor,
                engine.state.equipment.accessory
            ].filter(Boolean) as string[];

            for (const itemId of equippedIds) {
                const item = ITEMS[itemId];
                if (item && item.statBonuses) {
                    for (const [key, val] of Object.entries(item.statBonuses)) {
                        if (key in effectiveAttributes) {
                            effectiveAttributes[key as keyof typeof effectiveAttributes] += (val as number);
                        } else {
                            flatBattleStatsBonuses[key as keyof BattleStats] = (flatBattleStatsBonuses[key as keyof BattleStats] || 0) + (val as number);
                        }
                    }
                }
            }
        }

        // 2. Derive base battle stats from effective attributes
        const baseBattleStats = deriveBattleStats(effectiveAttributes, engine.state.realm_idx);

        // 3. Add flat equipment battle stat bonuses
        for (const [key, val] of Object.entries(flatBattleStatsBonuses)) {
            if (val) {
                baseBattleStats[key as keyof BattleStats] += val;
            }
        }

        // 4. Preserve current HP/MP ratios or values
        if (engine.state.battleStats) {
            baseBattleStats.HP = Math.min(engine.state.battleStats.HP, baseBattleStats.MAX_HP);
            baseBattleStats.MP = Math.min(engine.state.battleStats.MP, baseBattleStats.MAX_MP);
        } else {
            baseBattleStats.HP = baseBattleStats.MAX_HP;
            baseBattleStats.MP = baseBattleStats.MAX_MP;
        }

        engine.state.battleStats = baseBattleStats;
    }

    static getLifespan(engine: GameEngine): number {
        const base = GAME_RULES.BASE_LIFESPAN;
        const bonuses = GAME_RULES.LIFESPAN_BONUSES;
        return base + (bonuses[engine.state.realm_idx] || 0);
    }

    static checkBreakthrough(engine: GameEngine): { message?: string, combat?: { enemy: Partial<CombatEntity>, type: CombatState['type'] } } | undefined {
        const idx = engine.state.realm_idx;
        if (idx >= REALMS.length - 1) return;

        // 凡人突破炼气期（保留原Power逻辑，作为修仙入门门槛）
        if (idx === 0) {
            if (!engine.state.flags.includes('HAS_CULTIVATION_METHOD') || engine.state.age < 5) return;
            const power = (engine.state.attributes.ROOT || 0) * 2 + (engine.state.attributes.INT || 0) + (engine.state.attributes.STR || 0);
            if (power > GAME_RULES.REALM_THRESHOLDS[0]) {
                const msg = `你翻阅不知名的修真功法，渐渐感应到了天地灵气... 突破成功！你踏入了【炼气一层】！`;
                this.applyMajorBreakthrough(engine);
                return { message: msg };
            }
            return;
        }

        // 修仙者突破小境界/大境界（基于EXP系统）
        if (engine.state.exp >= engine.state.maxExp) {
            const currentRealmDef = CULTIVATION_REALMS[idx];
            const maxSubRealms = currentRealmDef.subRealms?.length || 1;

            if (engine.state.sub_realm_idx < maxSubRealms - 1) {
                // 小境界突破
                this.applySubBreakthrough(engine);
                const subRealmName = currentRealmDef.subRealms![engine.state.sub_realm_idx];
                const message = `修为圆满，你水到渠成地突破到了【${currentRealmDef.name}·${subRealmName}】！实力有所精进。`;
                engine.state.history.push(`${engine.getTimeStr()} ${message}`);
                return { message };
            } else {
                // 大境界突破 (Major Breakthrough)
                // idx=1 (炼气圆满 -> 筑基)
                let message = '';
                if (idx === 1) {
                    const hasPill = engine.removeItem('foundation_pill', 1);
                    const baseRate = Math.min(0.6, (engine.state.attributes.LUCK || 0) * 0.01 + (engine.state.attributes.INT || 0) * 0.005 + (engine.state.attributes.CON || 0) * 0.005);
                    const successRate = hasPill ? baseRate + 0.4 : baseRate;

                    if (Math.random() > successRate) {
                        const damage = Math.floor(engine.state.battleStats.MAX_HP * 0.5);
                        engine.state.battleStats.HP -= damage;
                        engine.state.attributes.MOOD -= 20;
                        engine.state.exp = Math.floor(engine.state.maxExp * 0.8); // 突破失败掉20%修为
                        message = `你尝试冲击筑基期，但在紧要关头真气逆流，突破失败！${hasPill ? '尽管服用了筑基丹，但仍功败垂成。' : '没有筑基丹的辅助，突破难如登天。'}修为掉落，气血大损。`;
                        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
                        return { message };
                    }
                } else if (idx > 1) {
                    // 天劫
                    const enemyLevelStr = `第${idx}重雷劫`;
                    return {
                        message: "天威难测，雷劫将至！",
                        combat: {
                            enemy: {
                                name: "九天雷劫",
                                levelStr: enemyLevelStr,
                                maxHp: 2000 * idx,
                                hp: 2000 * idx,
                                maxMp: 9999,
                                mp: 9999,
                                atk: 50 * idx,
                                def: 50 * idx,
                                spd: 80 + (idx * 5),
                                crit: 10 + idx,
                                critDamage: 1.5,
                                shield: 0,
                                buffs: [],
                                skills: [
                                    { id: 'thunder_strike', name: '狂雷天威', type: 'ATTACK', costType: 'NONE', costAmount: 0, powerMultiplier: 1.5, description: '', cooldown: 0, target: 'ENEMY' },
                                    { id: 'thunder_defense', name: '劫云蔽日', type: 'DEFENSE', costType: 'NONE', costAmount: 0, description: '', cooldown: 0, target: 'SELF' }
                                ]
                            },
                            type: 'TRIBULATION'
                        }
                    };
                }

                // 大境界成功 (没有天劫或者炼气突破成功)
                this.applyMajorBreakthrough(engine);
                const nextRealmDef = CULTIVATION_REALMS[engine.state.realm_idx];
                const subRealmName = nextRealmDef.subRealms ? nextRealmDef.subRealms[0] : '';
                message = `突破成功！你顶住了天地灵气的涤荡，成功晋升为【${nextRealmDef.name}${subRealmName ? '·' + subRealmName : ''}】！全属性大幅提升。`;
                engine.state.history.push(`${engine.getTimeStr()} ${message}`);
                return { message };
            }
        }
    }

    static applySubBreakthrough(engine: GameEngine) {
        engine.state.sub_realm_idx++;
        engine.state.exp = 0;
        engine.state.maxExp = this.calculateMaxExp(engine.state.realm_idx, engine.state.sub_realm_idx);

        // 小境界属性奖励
        const bonus = 2;
        for (const k in engine.state.attributes) {
            engine.state.attributes[k] += bonus;
        }
        this.recalculateStats(engine);
    }

    static applyMajorBreakthrough(engine: GameEngine) {
        const idx = engine.state.realm_idx;
        engine.state.realm_idx++;
        engine.state.sub_realm_idx = 0;
        engine.state.exp = 0;
        engine.state.maxExp = this.calculateMaxExp(engine.state.realm_idx, 0);

        const bonus = (idx + 1) * GAME_RULES.REALM_BONUS_MULTIPLIER * 2; // 大境界奖励更丰厚
        for (const k in engine.state.attributes) {
            engine.state.attributes[k] += bonus;
        }

        engine.state.battleStats.MAX_HP = Math.floor(engine.state.battleStats.MAX_HP * 1.5);
        engine.state.battleStats.HP = engine.state.battleStats.MAX_HP;
        engine.state.battleStats.MP = engine.state.battleStats.MAX_MP;

        this.recalculateStats(engine);
    }

    static calculateMaxExp(realmIdx: number, subRealmIdx: number): number {
        const base = 100;
        return Math.floor(base * Math.pow(3, realmIdx) * Math.pow(1.2, subRealmIdx));
    }

    static applyBreakthroughSuccess(engine: GameEngine) {
        // Alias for external calls (like gameStore after tribulation combat)
        this.applyMajorBreakthrough(engine);
    }

    static applyBreakthroughFailure(engine: GameEngine) {
        const damage = Math.floor(engine.state.battleStats.MAX_HP * 0.8);
        engine.state.battleStats.HP -= damage;
        engine.state.attributes.MOOD -= 50;
        engine.state.exp = Math.floor(engine.state.maxExp * 0.5); // 渡劫失败掉50%修为
        const message = `雷劫之下，险象环生。你虽然保住性命，但修为大摔，根基受损，需要长期休养才能重新冲击境界...`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
    }
}
