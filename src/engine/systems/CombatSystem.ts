import type { PlayerState } from '../../types';
import type { CombatEntity, CombatSkill, CombatState } from '../../types/combat';
import { SKILLS } from '../../data/skills';

type CombatBaseStats = Pick<CombatEntity, 'atk' | 'def' | 'spd' | 'crit' | 'critDamage' | 'maxHp' | 'maxMp'>;

interface CombatContext {
    playerBase: CombatBaseStats;
    enemyBase: CombatBaseStats;
}

export class CombatEngine {
    state: CombatState;

    constructor(
        playerState?: PlayerState,
        enemy?: Partial<CombatEntity>,
        type?: CombatState['type'],
        existingState?: CombatState
    ) {
        if (existingState) {
            this.state = JSON.parse(JSON.stringify(existingState));
            return;
        }
        if (!playerState || !enemy || !type) {
            throw new Error('Missing args for CombatEngine init');
        }

        const playerSkills: CombatSkill[] = playerState.equippedSkills?.some(id => id)
            ? [
                { ...SKILLS.basic_attack, currentCooldown: 0 },
                ...playerState.equippedSkills
                    .filter((id): id is string => Boolean(id))
                    .map(id => ({ ...SKILLS[id], currentCooldown: 0 })),
            ]
            : [{ ...SKILLS.basic_attack, currentCooldown: 0 }];

        const defaultEnemySkill: CombatSkill = {
            id: 'enemy_basic',
            name: '猛扑',
            description: '凶狠的攻击。',
            type: 'ATTACK',
            costType: 'NONE',
            costAmount: 0,
            cooldown: 0,
            target: 'ENEMY',
            powerMultiplier: 1.0,
            damageType: 'PHYSICAL',
            currentCooldown: 0,
        };

        const enemySkills: CombatSkill[] = (enemy.skills?.length ? enemy.skills : [defaultEnemySkill])
            .map(skill => ({ ...skill, currentCooldown: skill.currentCooldown || 0 }));

        const playerEntity: CombatEntity = {
            id: 'player',
            name: playerState.name,
            isPlayer: true,
            levelStr: `${playerState.age}岁`,
            hp: playerState.battleStats.HP,
            maxHp: playerState.battleStats.MAX_HP,
            mp: playerState.battleStats.MP,
            maxMp: playerState.battleStats.MAX_MP,
            shield: 0,
            atk: playerState.battleStats.ATK,
            def: playerState.battleStats.DEF,
            spd: playerState.battleStats.SPD,
            crit: playerState.battleStats.CRIT,
            critDamage: 1.5,
            skills: playerSkills,
            buffs: [],
        };

        const enemyEntity: CombatEntity = {
            id: enemy.id || 'enemy_1',
            name: enemy.name || '神秘强敌',
            isPlayer: false,
            levelStr: enemy.levelStr || '???',
            hp: enemy.hp || enemy.maxHp || 100,
            maxHp: enemy.maxHp || enemy.hp || 100,
            mp: enemy.mp || enemy.maxMp || 0,
            maxMp: enemy.maxMp || enemy.mp || 0,
            shield: enemy.shield || 0,
            atk: enemy.atk || 10,
            def: enemy.def || 5,
            spd: enemy.spd || 10,
            crit: enemy.crit || 5,
            critDamage: enemy.critDamage || 1.5,
            skills: enemySkills,
            buffs: enemy.buffs || [],
        };

        this.state = {
            id: `combat_${Date.now()}`,
            type,
            player: playerEntity,
            enemy: enemyEntity,
            turn: 1,
            logs: [
                {
                    turn: 1,
                    actorName: '系统',
                    targetName: '系统',
                    skillName: '遭遇',
                    damage: 0,
                    isCrit: false,
                    heal: 0,
                    message: `战斗开始！你遭遇了 ${enemyEntity.name}。`,
                },
            ],
            isPlayerTurn: playerEntity.spd >= enemyEntity.spd,
            status: 'ACTIVE',
            context: {
                playerBase: this.snapshotBaseStats(playerEntity),
                enemyBase: this.snapshotBaseStats(enemyEntity),
            } as unknown as Record<string, unknown>,
        };
    }

    executeAction(skillId: string) {
        if (this.state.status !== 'ACTIVE') return this.state;

        if (this.state.isPlayerTurn) {
            const interrupted = this.beginTurn(this.state.player);
            if (!interrupted) {
                const actionResult = this.performSkill(this.state.player, this.state.enemy, skillId);
                if (!actionResult.success) {
                    this.addLog(this.state.player.name, this.state.player.name, skillId, 0, false, 0, actionResult.message);
                    return this.state;
                }
            }
            if (this.checkWinCondition()) return this.state;
            this.endTurn(this.state.player);
            this.state.isPlayerTurn = false;
        }

        if (!this.state.isPlayerTurn && this.state.status === 'ACTIVE') {
            const interrupted = this.beginTurn(this.state.enemy);
            if (!interrupted) {
                const enemySkillId = this.pickEnemySkill(this.state.enemy);
                this.performSkill(this.state.enemy, this.state.player, enemySkillId);
            }
            if (this.checkWinCondition()) return this.state;
            this.endTurn(this.state.enemy);
            this.state.isPlayerTurn = true;
            this.state.turn++;
        }

        return this.state;
    }

    private beginTurn(actor: CombatEntity): boolean {
        this.tickCooldowns(actor);
        this.recalculateDerivedStats(actor);
        const buffMessage = this.applyBuffEffects(actor);
        if (buffMessage) {
            this.addLog(actor.name, actor.name, '状态', 0, false, 0, buffMessage);
        }
        return this.checkWinCondition();
    }

    private endTurn(actor: CombatEntity) {
        this.tickBuffDurations(actor);
        this.recalculateDerivedStats(actor);
    }

    private performSkill(actor: CombatEntity, target: CombatEntity, skillId: string): { success: boolean; message: string } {
        const skill = actor.skills.find(s => s.id === skillId) || actor.skills[0];
        if (!skill) return { success: false, message: '没有可用的技能。' };
        if ((skill.currentCooldown || 0) > 0) return { success: false, message: `${skill.name}仍在冷却中。` };
        if (skill.costType === 'MP' && actor.mp < skill.costAmount) return { success: false, message: `灵力不足，无法施展${skill.name}。` };
        if (skill.costType === 'HP' && actor.hp <= skill.costAmount) return { success: false, message: `气血不足，无法强行施展${skill.name}。` };

        if (skill.costType === 'MP') actor.mp = Math.max(0, actor.mp - skill.costAmount);
        if (skill.costType === 'HP') actor.hp = Math.max(1, actor.hp - skill.costAmount);

        let logMsg = `${actor.name} 使用了【${skill.name}】`;
        let damage = 0;
        let isCrit = false;
        let heal = 0;

        if (skill.type === 'ATTACK') {
            const rawDmg = actor.atk * (skill.powerMultiplier || 1) + (skill.flatDamage || 0);
            const defReduc = skill.damageType === 'TRUE' ? 1 : 100 / (100 + target.def);
            damage = Math.max(1, Math.floor(rawDmg * defReduc));

            if (Math.random() * 100 < actor.crit) {
                isCrit = true;
                damage = Math.floor(damage * actor.critDamage);
            }

            const blockedByShield = Math.min(target.shield, damage);
            if (blockedByShield > 0) {
                target.shield -= blockedByShield;
                damage -= blockedByShield;
                logMsg += `，击碎了 ${blockedByShield} 点护盾`;
            }

            if (damage > 0) {
                target.hp = Math.max(0, target.hp - damage);
                logMsg += `，造成了 ${damage} 点伤害`;
                if (isCrit) logMsg += '（暴击）';
            } else {
                logMsg += '，伤害被完全抵消';
            }
        } else if (skill.type === 'HEAL') {
            heal = Math.floor((actor.atk + actor.maxHp * 0.1) * (skill.healMultiplier || 1));
            actor.hp = Math.min(actor.maxHp, actor.hp + heal);
            logMsg += `，恢复了 ${heal} 点生命`;
        } else if (skill.type === 'DEFENSE') {
            const shieldAmt = Math.floor(actor.def * 1.5 + actor.spd * 0.6 + actor.maxHp * 0.08);
            actor.shield += shieldAmt;
            logMsg += `，获得了 ${shieldAmt} 点护盾`;
        } else if (skill.type === 'BUFF' && skill.applyBuffs?.length) {
            const nextBuffs = skill.applyBuffs.map(buff => ({ ...buff }));
            actor.buffs.push(...nextBuffs);
            this.recalculateDerivedStats(actor);
            logMsg += `，获得了 ${nextBuffs.map(buff => `【${buff.name}】`).join('、')} 的加持`;
        }

        skill.currentCooldown = skill.cooldown;
        this.addLog(actor.name, target.name, skill.name, damage, isCrit, heal, `${logMsg}。`);
        return { success: true, message: logMsg };
    }

    private pickEnemySkill(enemy: CombatEntity): string {
        const availableSkills = enemy.skills.filter(skill => this.canUseSkill(enemy, skill));
        if (availableSkills.length === 0) return enemy.skills[0]?.id || 'enemy_basic';

        const freshBuff = availableSkills.find(skill =>
            skill.type === 'BUFF'
            && skill.applyBuffs?.some(buff => !enemy.buffs.some(active => active.id === buff.id))
        );
        if (freshBuff) return freshBuff.id;

        const preferredAttack = availableSkills
            .filter(skill => skill.type === 'ATTACK')
            .sort((a, b) => this.getSkillScore(b) - this.getSkillScore(a))[0];
        if (preferredAttack) return preferredAttack.id;

        return availableSkills[0].id;
    }

    private canUseSkill(actor: CombatEntity, skill: CombatSkill): boolean {
        if ((skill.currentCooldown || 0) > 0) return false;
        if (skill.costType === 'MP' && actor.mp < skill.costAmount) return false;
        if (skill.costType === 'HP' && actor.hp <= skill.costAmount) return false;
        return true;
    }

    private getSkillScore(skill: CombatSkill): number {
        if (skill.type === 'ATTACK') return (skill.powerMultiplier || 1) * 100 + (skill.flatDamage || 0);
        if (skill.type === 'DEFENSE') return 90;
        if (skill.type === 'HEAL') return 80;
        if (skill.type === 'BUFF') return 70;
        return 0;
    }

    private applyBuffEffects(actor: CombatEntity): string | null {
        if (!actor.buffs.length) return null;

        const messages: string[] = [];
        for (const buff of actor.buffs) {
            if (buff.effect?.dot) {
                const damage = Math.min(actor.hp, buff.effect.dot);
                actor.hp = Math.max(0, actor.hp - damage);
                messages.push(`【${buff.name}】造成 ${damage} 点持续伤害`);
            }
            if (buff.effect?.hot) {
                const heal = Math.min(buff.effect.hot, actor.maxHp - actor.hp);
                actor.hp += heal;
                messages.push(`【${buff.name}】恢复 ${heal} 点生命`);
            }
        }

        return messages.length ? `${actor.name} 受到状态影响：${messages.join('，')}。` : null;
    }

    private tickCooldowns(actor: CombatEntity) {
        actor.skills.forEach(skill => {
            skill.currentCooldown = Math.max(0, (skill.currentCooldown || 0) - 1);
        });
    }

    private tickBuffDurations(actor: CombatEntity) {
        actor.buffs = actor.buffs
            .map(buff => ({ ...buff, duration: buff.duration - 1 }))
            .filter(buff => buff.duration > 0);
    }

    private recalculateDerivedStats(actor: CombatEntity) {
        const base = this.getBaseStats(actor);
        const multipliers = actor.buffs.reduce((acc, buff) => {
            const effect = buff.effect?.statMultiplier;
            if (effect?.ATK) acc.ATK *= effect.ATK;
            if (effect?.DEF) acc.DEF *= effect.DEF;
            if (effect?.SPD) acc.SPD *= effect.SPD;
            return acc;
        }, { ATK: 1, DEF: 1, SPD: 1 });

        actor.atk = Math.max(1, Math.floor(base.atk * multipliers.ATK));
        actor.def = Math.max(0, Math.floor(base.def * multipliers.DEF));
        actor.spd = Math.max(1, Math.floor(base.spd * multipliers.SPD));
        actor.crit = base.crit;
        actor.critDamage = base.critDamage;
        actor.maxHp = base.maxHp;
        actor.maxMp = base.maxMp;
        actor.hp = Math.min(actor.hp, actor.maxHp);
        actor.mp = Math.min(actor.mp, actor.maxMp);
    }

    private snapshotBaseStats(entity: CombatEntity): CombatBaseStats {
        return {
            atk: entity.atk,
            def: entity.def,
            spd: entity.spd,
            crit: entity.crit,
            critDamage: entity.critDamage,
            maxHp: entity.maxHp,
            maxMp: entity.maxMp,
        };
    }

    private getBaseStats(entity: CombatEntity): CombatBaseStats {
        const context = this.state.context as unknown as CombatContext;
        return entity.isPlayer ? context.playerBase : context.enemyBase;
    }

    private checkWinCondition(): boolean {
        if (this.state.enemy.hp <= 0) {
            this.state.enemy.hp = 0;
            this.state.status = 'VICTORY';
            this.addLog('系统', '系统', '', 0, false, 0, `战斗结束！你击败了 ${this.state.enemy.name}。`);
            return true;
        }
        if (this.state.player.hp <= 0) {
            this.state.player.hp = 0;
            this.state.status = 'DEFEAT';
            this.addLog('系统', '系统', '', 0, false, 0, '战斗结束！你重伤倒地。');
            return true;
        }
        return false;
    }

    private addLog(actor: string, target: string, skill: string, damage: number, crit: boolean, heal: number, message: string) {
        this.state.logs.push({
            turn: this.state.turn,
            actorName: actor,
            targetName: target,
            skillName: skill,
            damage,
            isCrit: crit,
            heal,
            message,
        });
    }

    flee() {
        if (this.state.type === 'TRIBULATION') {
            this.addLog('系统', '系统', '', 0, false, 0, '天劫将至，天道锁定，无法逃脱。');
            return this.state;
        }

        const chance = (this.state.player.spd / (this.state.enemy.spd + 1)) * 50;
        if (Math.random() * 100 < chance + 20) {
            this.state.status = 'FLED';
            this.addLog('系统', '系统', '', 0, false, 0, '你施展遁术，成功脱离了战斗。');
            return this.state;
        }

        this.addLog(this.state.player.name, '系统', '逃跑', 0, false, 0, '逃跑失败，被敌人拦了下来。');
        this.state.isPlayerTurn = false;
        return this.executeAction(this.pickEnemySkill(this.state.enemy));
    }
}
