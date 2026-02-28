import type { PlayerState } from '../../types';
import type { CombatState, CombatEntity } from '../../types/combat';
import { SKILLS } from '../../data/skills';

export class CombatEngine {
    state: CombatState;

    constructor(playerState?: PlayerState, enemy?: Partial<CombatEntity>, type?: CombatState['type'], existingState?: CombatState) {
        if (existingState) {
            this.state = JSON.parse(JSON.stringify(existingState)); // Deep clone
            return;
        }
        if (!playerState || !enemy || !type) throw new Error("Missing args for CombatEngine init");

        const playerEntity: CombatEntity = {
            id: 'player',
            name: playerState.name,
            isPlayer: true,
            levelStr: `${playerState.age}岁`, // or Realm name
            hp: playerState.battleStats.MAX_HP, // Wait, player needs current HP in PlayerState! We don't have current HP yet? We usually heal on level up or have an HP stat. If not, start with MAX. Let's assume full for now until we add persistent HP tracking.
            maxHp: playerState.battleStats.MAX_HP,
            mp: playerState.battleStats.MAX_MP,
            maxMp: playerState.battleStats.MAX_MP,
            shield: 0,
            atk: playerState.battleStats.ATK,
            def: playerState.battleStats.DEF,
            spd: playerState.battleStats.SPD,
            crit: playerState.battleStats.CRIT,
            critDamage: 1.5,
            skills: playerState.equippedSkills?.some(id => id)
                ? playerState.equippedSkills.filter(id => id).map(id => ({ ...SKILLS[id!] }))
                : [{ ...SKILLS['basic_attack'] }],
            buffs: []
        };

        const enemyEntity: CombatEntity = {
            id: enemy.id || 'enemy_1',
            name: enemy.name || '神秘强敌',
            isPlayer: false,
            levelStr: enemy.levelStr || '???',
            hp: enemy.hp || 100,
            maxHp: enemy.hp || 100, // assuming hp passed is max
            mp: enemy.mp || 0,
            maxMp: enemy.maxMp || 0,
            shield: 0,
            atk: enemy.atk || 10,
            def: enemy.def || 5,
            spd: enemy.spd || 10,
            crit: enemy.crit || 5,
            critDamage: 1.5,
            skills: enemy.skills || [
                {
                    id: 'enemy_basic',
                    name: '猛扑',
                    description: '凶狠的攻击',
                    type: 'ATTACK',
                    costType: 'NONE',
                    costAmount: 0,
                    cooldown: 0,
                    target: 'ENEMY',
                    powerMultiplier: 1.0,
                    damageType: 'PHYSICAL'
                }
            ],
            buffs: []
        };

        this.state = {
            id: `combat_${Date.now()}`,
            type,
            player: playerEntity,
            enemy: enemyEntity,
            turn: 1,
            logs: [{
                turn: 1,
                actorName: '系统',
                targetName: '系统',
                skillName: '遭遇',
                damage: 0,
                isCrit: false,
                heal: 0,
                message: `战斗开始！你遭遇了 ${enemyEntity.name}！`
            }],
            isPlayerTurn: playerEntity.spd >= enemyEntity.spd,
            status: 'ACTIVE'
        };
    }

    /* Process one complete round or action sequence */
    executeAction(skillId: string) {
        if (this.state.status !== 'ACTIVE') return this.state;

        // Player acts
        if (this.state.isPlayerTurn) {
            this.performSkill(this.state.player, this.state.enemy, skillId);
            if (this.checkWinCondition()) return this.state;
            this.state.isPlayerTurn = false;
        }

        // Enemy acts (Simple AI: random available skill)
        if (!this.state.isPlayerTurn && this.state.status === 'ACTIVE') {
            const defaultSkill = this.state.enemy.skills[0].id; // TODO: AI logic
            this.performSkill(this.state.enemy, this.state.player, defaultSkill);
            if (this.checkWinCondition()) return this.state;
            this.state.isPlayerTurn = true;
            this.state.turn++;
        }

        return this.state;
    }

    private performSkill(actor: CombatEntity, target: CombatEntity, skillId: string) {
        const skill = actor.skills.find(s => s.id === skillId) || actor.skills[0];

        // Cost deduct
        if (skill.costType === 'MP') actor.mp = Math.max(0, actor.mp - skill.costAmount);
        if (skill.costType === 'HP') actor.hp = Math.max(0, actor.hp - skill.costAmount);

        let logMsg = `${actor.name} 使用了 【${skill.name}】`;
        let damage = 0;
        let isCrit = false;
        let heal = 0;

        if (skill.type === 'ATTACK') {
            // DMG = (ATK * Multi + Flat) * (1 - DEF/(DEF+100))
            const rawDmg = (actor.atk * (skill.powerMultiplier || 1)) + (skill.flatDamage || 0);
            const defReduc = 100 / (100 + target.def);
            damage = Math.max(1, Math.floor(rawDmg * defReduc));

            // Crit
            if (Math.random() * 100 < actor.crit) {
                isCrit = true;
                damage = Math.floor(damage * actor.critDamage);
            }

            // Shield
            if (target.shield > 0) {
                if (target.shield >= damage) {
                    target.shield -= damage;
                    logMsg += `，但这击被护盾完全抵挡！`;
                    damage = 0;
                } else {
                    damage -= target.shield;
                    logMsg += `，击破了护盾！`;
                    target.shield = 0;
                }
            }

            if (damage > 0) {
                target.hp -= damage;
                logMsg += `，造成了 ${damage} 点伤害！`;
                if (isCrit) logMsg += ` (暴击!)`;
            } else if (!logMsg.includes('护盾')) {
                logMsg += `，但未能破防...`;
            }
        } else if (skill.type === 'HEAL') {
            heal = Math.floor((actor.atk + actor.maxHp * 0.1) * (skill.healMultiplier || 1));
            actor.hp = Math.min(actor.maxHp, actor.hp + heal);
            logMsg += `，恢复了 ${heal} 点生命！`;
        } else if (skill.type === 'DEFENSE') {
            const shieldAmt = Math.floor(actor.def * 2 + actor.maxHp * 0.1);
            actor.shield += shieldAmt;
            logMsg += `，获得了 ${shieldAmt} 点护盾！`;
        }

        // Add Log
        this.addLog(actor.name, target.name, skill.name, damage, isCrit, heal, logMsg);
    }

    private checkWinCondition(): boolean {
        if (this.state.enemy.hp <= 0) {
            this.state.enemy.hp = 0;
            this.state.status = 'VICTORY';
            this.addLog('系统', '系统', '', 0, false, 0, `战斗结束！你击败了 ${this.state.enemy.name}！`);
            return true;
        }
        if (this.state.player.hp <= 0) {
            this.state.player.hp = 0;
            this.state.status = 'DEFEAT';
            this.addLog('系统', '系统', '', 0, false, 0, `战斗结束！你重伤倒地...`);
            return true;
        }
        return false;
    }

    private addLog(actor: string, target: string, skill: string, dmg: number, crit: boolean, heal: number, msg: string) {
        this.state.logs.push({
            turn: this.state.turn,
            actorName: actor,
            targetName: target,
            skillName: skill,
            damage: dmg,
            isCrit: crit,
            heal: heal,
            message: msg
        });
    }

    flee() {
        if (this.state.type === 'TRIBULATION') {
            this.addLog('系统', '系统', '', 0, false, 0, `天劫将至，天道锁定，无法逃脱！`);
            return this.state;
        }
        // Base a flee chance on SPD
        const chance = (this.state.player.spd / (this.state.enemy.spd + 1)) * 50;
        if (Math.random() * 100 < chance + 20) { // 20% base chance minimum
            this.state.status = 'FLED';
            this.addLog('系统', '系统', '', 0, false, 0, `你施展遁术，成功逃脱了！`);
        } else {
            this.addLog(this.state.player.name, '系统', '逃跑', 0, false, 0, `逃跑失败！`);
            // Enemy gets a free hit
            this.state.isPlayerTurn = false;
            this.executeAction(this.state.enemy.skills[0].id);
        }
        return this.state;
    }
}
