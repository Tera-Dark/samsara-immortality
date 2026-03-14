import { GameEngine } from '../GameEngine';
import { CULTIVATION_REALMS, REALMS } from '../../types';
import { GAME_RULES } from '../../data/rules';
import { deriveBattleStats } from '../../utils/DataUtils';
import type { CombatEntity, CombatState } from '../../types/combat';
import { ITEMS } from '../../data/items';
import type { BattleStats } from '../../types';

export class CultivationSystem {
    private static readonly REALM_EXP_CURVE = [100, 260, 720, 1800, 4200, 9200, 18800, 36000, 68000];

    static recalculateStats(engine: GameEngine) {
        const effectiveAttributes = { ...engine.state.attributes };
        const flatBattleStatsBonuses: Partial<BattleStats> = {};

        if (engine.state.equipment) {
            const equippedIds = [
                engine.state.equipment.weapon,
                engine.state.equipment.armor,
                engine.state.equipment.accessory,
            ].filter(Boolean) as string[];

            for (const itemId of equippedIds) {
                const item = ITEMS[itemId];
                if (!item?.statBonuses) continue;

                for (const [key, val] of Object.entries(item.statBonuses)) {
                    if (key in effectiveAttributes) {
                        effectiveAttributes[key as keyof typeof effectiveAttributes] += val as number;
                    } else {
                        flatBattleStatsBonuses[key as keyof BattleStats] =
                            (flatBattleStatsBonuses[key as keyof BattleStats] || 0) + (val as number);
                    }
                }
            }
        }

        const baseBattleStats = deriveBattleStats(effectiveAttributes, engine.state.realm_idx);

        for (const [key, val] of Object.entries(flatBattleStatsBonuses)) {
            if (val) {
                baseBattleStats[key as keyof BattleStats] += val;
            }
        }

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
        return GAME_RULES.BASE_LIFESPAN + (GAME_RULES.LIFESPAN_BONUSES[engine.state.realm_idx] || 0);
    }

    static checkBreakthrough(engine: GameEngine): { message?: string; combat?: { enemy: Partial<CombatEntity>; type: CombatState['type'] } } | undefined {
        const idx = engine.state.realm_idx;
        if (idx >= REALMS.length - 1) return;

        if (idx === 0) {
            if (!engine.state.flags.includes('HAS_CULTIVATION_METHOD') || engine.state.age < 5) return;
            const power = (engine.state.attributes.ROOT || 0) * 2 + (engine.state.attributes.INT || 0) + (engine.state.attributes.STR || 0);
            if (power > GAME_RULES.REALM_THRESHOLDS[0]) {
                const msg = '你感应到了天地灵气，成功踏入【炼气一层】！';
                this.applyMajorBreakthrough(engine);
                return { message: msg };
            }
            return;
        }

        if (engine.state.exp >= engine.state.maxExp) {
            const currentRealmDef = CULTIVATION_REALMS[idx];
            const maxSubRealms = currentRealmDef.subRealms?.length || 1;

            if (engine.state.sub_realm_idx < maxSubRealms - 1) {
                this.applySubBreakthrough(engine);
                const subRealmName = currentRealmDef.subRealms![engine.state.sub_realm_idx];
                const message = `修为圆满，你已突破至【${currentRealmDef.name}·${subRealmName}】！`;
                engine.state.history.push(`${engine.getTimeStr()} ${message}`);
                return { message };
            }

            let message = '';
            if (idx === 1) {
                const hasPill = engine.removeItem('foundation_pill', 1);
                const baseRate = Math.min(0.6, (engine.state.attributes.LUCK || 0) * 0.01 + (engine.state.attributes.INT || 0) * 0.005 + (engine.state.attributes.CON || 0) * 0.005);
                const successRate = hasPill ? baseRate + 0.4 : baseRate;

                if (Math.random() > successRate) {
                    const damage = Math.floor(engine.state.battleStats.MAX_HP * 0.5);
                    engine.state.battleStats.HP -= damage;
                    engine.state.attributes.MOOD -= 20;
                    engine.state.exp = Math.floor(engine.state.maxExp * 0.8);
                    message = hasPill
                        ? '你冲击筑基失败，即便服用了筑基丹，依旧功败垂成，修为受损。'
                        : '你冲击筑基失败，没有筑基丹相助，突破难如登天。';
                    engine.state.history.push(`${engine.getTimeStr()} ${message}`);
                    return { message };
                }
            } else if (idx > 1) {
                return {
                    message: '天威难测，雷劫将至！',
                    combat: {
                        enemy: {
                            name: '九天雷劫',
                            levelStr: `第${idx}重雷劫`,
                            maxHp: 2000 * idx,
                            hp: 2000 * idx,
                            maxMp: 9999,
                            mp: 9999,
                            atk: 50 * idx,
                            def: 50 * idx,
                            spd: 80 + idx * 5,
                            crit: 10 + idx,
                            critDamage: 1.5,
                            shield: 0,
                            buffs: [],
                            skills: [
                                { id: 'thunder_strike', name: '狂雷天威', type: 'ATTACK', costType: 'NONE', costAmount: 0, powerMultiplier: 1.5, description: '', cooldown: 0, target: 'ENEMY' },
                                { id: 'thunder_defense', name: '劫云蔽日', type: 'DEFENSE', costType: 'NONE', costAmount: 0, description: '', cooldown: 0, target: 'SELF' },
                            ],
                        },
                        type: 'TRIBULATION',
                    },
                };
            }

            this.applyMajorBreakthrough(engine);
            const nextRealmDef = CULTIVATION_REALMS[engine.state.realm_idx];
            const subRealmName = nextRealmDef.subRealms ? nextRealmDef.subRealms[0] : '';
            message = `突破成功！你已晋升为【${nextRealmDef.name}${subRealmName ? `·${subRealmName}` : ''}】！`;
            engine.state.history.push(`${engine.getTimeStr()} ${message}`);
            return { message };
        }
    }

    static applySubBreakthrough(engine: GameEngine) {
        engine.state.sub_realm_idx++;
        engine.state.exp = 0;
        engine.state.maxExp = this.calculateMaxExp(engine.state.realm_idx, engine.state.sub_realm_idx);

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

        const bonus = (idx + 1) * GAME_RULES.REALM_BONUS_MULTIPLIER * 2;
        for (const k in engine.state.attributes) {
            engine.state.attributes[k] += bonus;
        }

        engine.state.battleStats.MAX_HP = Math.floor(engine.state.battleStats.MAX_HP * 1.5);
        engine.state.battleStats.HP = engine.state.battleStats.MAX_HP;
        engine.state.battleStats.MP = engine.state.battleStats.MAX_MP;

        this.recalculateStats(engine);
    }

    static calculateMaxExp(realmIdx: number, subRealmIdx: number): number {
        const base = this.REALM_EXP_CURVE[realmIdx] || Math.floor(68000 * Math.pow(1.75, Math.max(0, realmIdx - 8)));
        return Math.floor(base * Math.pow(1.18, subRealmIdx));
    }

    static applyBreakthroughSuccess(engine: GameEngine) {
        this.applyMajorBreakthrough(engine);
    }

    static applyBreakthroughFailure(engine: GameEngine) {
        const damage = Math.floor(engine.state.battleStats.MAX_HP * 0.8);
        engine.state.battleStats.HP -= damage;
        engine.state.attributes.MOOD -= 50;
        engine.state.exp = Math.floor(engine.state.maxExp * 0.5);
        const message = '雷劫之下，你虽保住性命，却修为大损，根基受创，需要长时间调养。';
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
    }
}
