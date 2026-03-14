import type { PlayerState } from '../types';
import type { CombatBuff, CombatState } from '../types/combat';
import type { WorldNPC } from '../types/worldTypes';
import type { GameEngine } from '../engine/GameEngine';

export type SocialBondType = 'DAO_PARTNER' | 'SWORN_SIBLING';

export interface SocialSupportResult {
    message: string;
    npc: WorldNPC;
}

export interface SectBondAssistResult {
    npc: WorldNPC;
    successBonus: number;
    contributionBonus: number;
}

export function getAffinityTier(affinity: number) {
    if (affinity >= 90) return { label: '生死相许', color: 'text-rose-600' };
    if (affinity >= 70) return { label: '知己莫逆', color: 'text-violet-600' };
    if (affinity >= 40) return { label: '相谈甚欢', color: 'text-sky-600' };
    if (affinity >= 10) return { label: '渐生熟络', color: 'text-emerald-600' };
    if (affinity <= -60) return { label: '深仇大恨', color: 'text-red-600' };
    if (affinity <= -20) return { label: '心存芥蒂', color: 'text-orange-600' };
    return { label: '泛泛之交', color: 'text-slate-500' };
}

export function hasBond(npc: WorldNPC, bond: SocialBondType) {
    return (npc.relationships || []).includes(bond);
}

export function getBondLabel(npc: WorldNPC) {
    if (hasBond(npc, 'DAO_PARTNER')) return '道侣';
    if (hasBond(npc, 'SWORN_SIBLING')) return '义亲';
    return null;
}

export function canFormBond(npc: WorldNPC, affinity: number, bond: SocialBondType) {
    if (bond === 'DAO_PARTNER') {
        return affinity >= 90 && !hasBond(npc, 'DAO_PARTNER');
    }

    return affinity >= 70 && !hasBond(npc, 'SWORN_SIBLING') && !hasBond(npc, 'DAO_PARTNER');
}

export function applyBond(engine: GameEngine, npc: WorldNPC, bond: SocialBondType) {
    if (!npc.relationships) npc.relationships = [];
    if (!npc.relationships.includes(bond)) {
        npc.relationships.push(bond);
    }

    const timeStr = engine.getTimeStr();
    if (bond === 'DAO_PARTNER') {
        if (!engine.state.partners.includes(npc.id)) {
            engine.state.partners.push(npc.id);
        }
        engine.state.attributes.CHR = (engine.state.attributes.CHR || 0) + 1;
        engine.state.attributes.LUCK = (engine.state.attributes.LUCK || 0) + 1;
        const flag = `SOCIAL_BOND:DAO_PARTNER:${npc.id}`;
        if (!engine.state.flags.includes(flag)) {
            engine.state.flags.push(flag);
        }
        const message = `你与 ${npc.name} 互许大道，正式结为道侣。`;
        engine.state.history.push(`${timeStr} ${message}`);
        return message;
    }

    const flag = `SOCIAL_BOND:SWORN_SIBLING:${npc.id}`;
    if (!engine.state.flags.includes(flag)) {
        engine.state.flags.push(flag);
    }
    engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
    const message = `你与 ${npc.name} 歃血为盟，自此结为义亲。`;
    engine.state.history.push(`${timeStr} ${message}`);
    return message;
}

export function runBondActivity(engine: GameEngine, npc: WorldNPC, bond: SocialBondType) {
    if (bond === 'DAO_PARTNER') {
        const expGain = 40 + npc.realmIndex * 10;
        engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
        engine.state.attributes.MOOD = (engine.state.attributes.MOOD || 0) + 5;
        const message = `你与 ${npc.name} 共参大道，双修过后修为增长 ${expGain}。`;
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
        return message;
    }

    const expGain = 24 + npc.realmIndex * 8;
    engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
    engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
    const message = `你与 ${npc.name} 并肩论道，彼此砥砺之下修为增长 ${expGain}。`;
    engine.state.history.push(`${engine.getTimeStr()} ${message}`);
    return message;
}

export function getBondedNpcs(state: PlayerState) {
    return state.world.worldNPCs.filter((npc) => {
        const relations = npc.relationships || [];
        return relations.includes('DAO_PARTNER') || relations.includes('SWORN_SIBLING');
    });
}

export function getLocalBondedNpcs(state: PlayerState) {
    return getBondedNpcs(state).filter((npc) => {
        const npcLocation = npc.currentLocationId || npc.locationId;
        return npcLocation === state.location;
    });
}

function pickPreferredBond(npcs: WorldNPC[]) {
    return [...npcs].sort((a, b) => {
        const aScore = (hasBond(a, 'DAO_PARTNER') ? 1000 : 0) + (a.affinity || 0) + a.realmIndex * 5;
        const bScore = (hasBond(b, 'DAO_PARTNER') ? 1000 : 0) + (b.affinity || 0) + b.realmIndex * 5;
        return bScore - aScore;
    })[0] || null;
}

export function applyActionBondSupport(
    engine: GameEngine,
    action: 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT' | 'REFINE_ALCHEMY'
): SocialSupportResult | null {
    const localBonded = getLocalBondedNpcs(engine.state);
    if (localBonded.length === 0) return null;

    const triggerRate = Math.min(0.42, 0.2 + localBonded.length * 0.06);
    if (Math.random() > triggerRate) return null;

    const npc = pickPreferredBond(localBonded);
    if (!npc) return null;

    let message = '';
    if (hasBond(npc, 'DAO_PARTNER')) {
        switch (action) {
            case 'CULTIVATE':
            case 'REFINE_ALCHEMY':
            case 'STUDY_LIT': {
                const expGain = 18 + npc.realmIndex * 6;
                engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
                engine.state.attributes.MOOD = (engine.state.attributes.MOOD || 0) + 2;
                message = `道侣 ${npc.name} 在旁护持点拨，你额外获得修为 ${expGain}，心境也安稳了几分。`;
                break;
            }
            case 'WORK': {
                const moneyGain = 2 + Math.floor(npc.realmIndex / 2);
                engine.state.attributes.MONEY = (engine.state.attributes.MONEY || 0) + moneyGain;
                engine.state.attributes.REP = (engine.state.attributes.REP || 0) + 1;
                message = `道侣 ${npc.name} 暗中替你打点人情，此番营生额外入账 ${moneyGain} 灵石，并小涨了些声望。`;
                break;
            }
            case 'EXPLORE': {
                engine.state.attributes.LUCK = (engine.state.attributes.LUCK || 0) + 1;
                engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
                message = `道侣 ${npc.name} 与你同探前路，替你避开险处，气运与心志皆有所得。`;
                break;
            }
            case 'GROW': {
                engine.state.attributes.CHR = (engine.state.attributes.CHR || 0) + 1;
                engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
                message = `${npc.name} 常来相伴，令你在岁月流转间更添风度，也更知如何守心。`;
                break;
            }
        }
    } else {
        switch (action) {
            case 'WORK': {
                engine.state.attributes.MONEY = (engine.state.attributes.MONEY || 0) + 1;
                engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
                message = `义亲 ${npc.name} 出手帮衬，这趟差事轻松不少，额外赚得 1 灵石。`;
                break;
            }
            case 'EXPLORE': {
                const expGain = 12 + npc.realmIndex * 4;
                engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
                engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
                message = `义亲 ${npc.name} 并肩开路，你在历练中额外获得修为 ${expGain}。`;
                break;
            }
            case 'CULTIVATE':
            case 'REFINE_ALCHEMY':
            case 'STUDY_LIT': {
                const expGain = 10 + npc.realmIndex * 4;
                engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + expGain);
                engine.state.attributes.WIL = (engine.state.attributes.WIL || 0) + 1;
                message = `义亲 ${npc.name} 与你互证所得，你额外获得修为 ${expGain}，意志更坚。`;
                break;
            }
            case 'GROW': {
                engine.state.attributes.STR = (engine.state.attributes.STR || 0) + 1;
                message = `义亲 ${npc.name} 拉着你磨炼筋骨，你在成长中又强健了几分。`;
                break;
            }
        }
    }

    if (!message) return null;
    engine.state.history.push(`${engine.getTimeStr()} ${message}`);
    return { message, npc };
}

export function applyCombatBondAid(combatState: CombatState, engine: GameEngine): SocialSupportResult | null {
    const localBonded = getLocalBondedNpcs(engine.state);
    if (localBonded.length === 0) return null;

    const npc = pickPreferredBond(localBonded);
    if (!npc) return null;

    const realmFactor = Math.max(1, npc.realmIndex + 1);
    let message = '';

    if (hasBond(npc, 'DAO_PARTNER')) {
        const shieldGain = 18 + realmFactor * 8;
        const healGain = 10 + realmFactor * 6;
        const buff: CombatBuff = {
            id: `bond_partner_guard_${npc.id}`,
            name: '同心护法',
            description: '道侣暗中护持，攻防俱增。',
            duration: 3,
            type: 'BUFF',
            effect: {
                statMultiplier: {
                    ATK: 1.12,
                    DEF: 1.15,
                },
            },
        };

        combatState.player.shield += shieldGain;
        combatState.player.hp = Math.min(combatState.player.maxHp, combatState.player.hp + healGain);
        combatState.player.buffs.push(buff);
        message = `道侣 ${npc.name} 暗中护法，为你加持 ${shieldGain} 点护盾并调息 ${healGain} 点气血。`;
    } else {
        const shieldGain = 12 + realmFactor * 6;
        const buff: CombatBuff = {
            id: `bond_sworn_guard_${npc.id}`,
            name: '并肩赴战',
            description: '义亲相援，身法与攻势更凌厉。',
            duration: 2,
            type: 'BUFF',
            effect: {
                statMultiplier: {
                    ATK: 1.1,
                    SPD: 1.12,
                },
            },
        };

        combatState.player.shield += shieldGain;
        combatState.player.buffs.push(buff);
        message = `义亲 ${npc.name} 闻讯驰援，替你挡下一波攻势，并激起你的战意。`;
    }

    combatState.logs.push({
        turn: combatState.turn,
        actorName: '系统',
        targetName: combatState.player.name,
        skillName: '情谊相援',
        damage: 0,
        isCrit: false,
        heal: 0,
        message,
    });
    engine.state.history.push(`${engine.getTimeStr()} ${message}`);

    return { message, npc };
}

export function getSectBondAssist(engine: GameEngine): SectBondAssistResult | null {
    const currentSect = engine.state.sect;
    if (!currentSect) return null;

    const bondedInSect = getBondedNpcs(engine.state).filter((npc) => npc.sectId === currentSect);
    if (bondedInSect.length === 0) return null;

    const npc = pickPreferredBond(bondedInSect);
    if (!npc) return null;

    if (hasBond(npc, 'DAO_PARTNER')) {
        return {
            npc,
            successBonus: 0.1,
            contributionBonus: 5 + Math.max(0, npc.realmIndex),
        };
    }

    return {
        npc,
        successBonus: 0.06,
        contributionBonus: 3 + Math.max(0, Math.floor(npc.realmIndex / 2)),
    };
}

export function applyFinalBattleSupport(combatState: CombatState, engine: GameEngine) {
    if (combatState.enemy.id !== 'story_void_lord') return;
    if (!engine.state.flags.includes('STORY:FINAL_MUSTER')) return;

    const logs: string[] = [];

    if (engine.state.flags.includes('STORY:FINAL_SUPPORT_REFUGEES')) {
        const healGain = 80;
        combatState.player.hp = Math.min(combatState.player.maxHp, combatState.player.hp + healGain);
        logs.push(`后方安置点送来的药物替你稳住气息，额外恢复 ${healGain} 点气血。`);
    }

    if (engine.state.flags.includes('STORY:FINAL_SUPPORT_SUPPLIES')) {
        const shieldGain = 160;
        combatState.player.shield += shieldGain;
        logs.push(`众人凑出的符甲与补给替你撑起 ${shieldGain} 点护盾。`);
    }

    if (engine.state.flags.includes('STORY:FINAL_SUPPORT_SCATTERED')) {
        combatState.player.buffs.push({
            id: 'final_support_scattered',
            name: '散修策应',
            description: '侧翼策应，让你攻势更顺。',
            duration: 3,
            type: 'BUFF',
            effect: {
                statMultiplier: {
                    ATK: 1.15,
                    SPD: 1.12,
                },
            },
        });
        logs.push('赶来助阵的散修替你牵制住了一部分黑潮压力。');
    }

    if (engine.state.flags.includes('STORY:FINAL_SUPPORT_INTEL')) {
        combatState.player.buffs.push({
            id: 'final_support_intel',
            name: '前线情报',
            description: '提前知晓弱点，防守更稳。',
            duration: 3,
            type: 'BUFF',
            effect: {
                statMultiplier: {
                    DEF: 1.18,
                },
            },
        });
        logs.push('你先前追出的情报让归墟古主的出手不再毫无征兆。');
    }

    logs.forEach((message) => {
        combatState.logs.push({
            turn: combatState.turn,
            actorName: '系统',
            targetName: combatState.player.name,
            skillName: '众生来援',
            damage: 0,
            isCrit: false,
            heal: 0,
            message,
        });
        engine.state.history.push(`${engine.getTimeStr()} ${message}`);
    });
}
