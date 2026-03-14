import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import type { WorldNPC } from '../../../../types/worldTypes';
import { hasBond } from '../../../../utils/socialUtils';

function onceFlag(kind: string, npcId: string) {
    return `SOCIAL_EVENT:${kind}:${npcId}`;
}

function hasFlag(engine: GameEngine, kind: string, npcId: string) {
    return engine.state.flags.includes(onceFlag(kind, npcId));
}

function hasScene(engine: GameEngine, kind: string, npcId: string) {
    return engine.state.flags.includes(`SOCIAL_SCENE:${kind}:${npcId}`);
}

export function checkAffinityEvents(engine: GameEngine): GameEvent | null {
    const localNpcs = engine.state.world.worldNPCs.filter((npc) => npc.currentLocationId === engine.state.location && npc.alive);
    const shuffled = [...localNpcs].sort(() => Math.random() - 0.5);

    for (const npc of shuffled) {
        const affinity = npc.affinity || 0;

        if (affinity <= -50 && Math.random() < 0.2) {
            return generateRevengeEvent(npc);
        }

        if (hasScene(engine, 'COMMISSION', npc.id) && !hasFlag(engine, 'COMMISSION_RETURN', npc.id) && affinity >= 30 && Math.random() < 0.18) {
            return generateCommissionReturnEvent(npc);
        }

        if (hasScene(engine, 'TRAVEL', npc.id) && !hasFlag(engine, 'TRAVEL_MEMORY', npc.id) && affinity >= 28 && Math.random() < 0.16) {
            return generateTravelMemoryEvent(npc);
        }

        if (hasScene(engine, 'NIGHT_TALK', npc.id) && !hasFlag(engine, 'NIGHT_TALK_ECHO', npc.id) && affinity >= 50 && Math.random() < 0.16) {
            return generateNightTalkEchoEvent(npc);
        }

        if (!hasBond(npc, 'DAO_PARTNER') && affinity >= 88 && !hasFlag(engine, 'PARTNER_HINT', npc.id) && Math.random() < 0.14) {
            return generatePartnerHintEvent(npc);
        }

        if (!hasBond(npc, 'SWORN_SIBLING') && affinity >= 65 && affinity < 88 && !hasFlag(engine, 'SWORN_HINT', npc.id) && Math.random() < 0.1) {
            return generateSwornHintEvent(npc);
        }

        if (hasBond(npc, 'DAO_PARTNER') && affinity >= 95) {
            if ((engine.state.attributes.MOOD || 50) <= 25 && !hasFlag(engine, 'PARTNER_CONSOLE', npc.id) && Math.random() < 0.16) {
                return generatePartnerConsoleEvent(npc);
            }
            if (!hasFlag(engine, 'PARTNER_GIFT', npc.id) && Math.random() < 0.18) {
                return generatePartnerGiftEvent(npc);
            }
            if (hasScene(engine, 'NIGHT_TALK', npc.id) && !hasFlag(engine, 'PARTNER_FUTURE', npc.id) && Math.random() < 0.15) {
                return generatePartnerFutureEvent(npc);
            }
            if (Math.random() < 0.12) {
                return generatePartnerWarmEvent(npc);
            }
        }

        if (hasBond(npc, 'SWORN_SIBLING') && affinity >= 75) {
            if (!hasFlag(engine, 'SWORN_RESCUE', npc.id) && Math.random() < 0.14) {
                return generateSwornRescueEvent(npc);
            }
            if (hasScene(engine, 'TRAVEL', npc.id) && !hasFlag(engine, 'SWORN_VENTURE', npc.id) && Math.random() < 0.14) {
                return generateSwornVentureEvent(npc);
            }
            if (Math.random() < 0.12) {
                return generateSwornSupportEvent(npc);
            }
        }

        if (!hasBond(npc, 'DAO_PARTNER') && !hasBond(npc, 'SWORN_SIBLING') && affinity >= 40 && affinity < 88 && Math.random() < 0.08) {
            return generateFriendEvent(npc);
        }
    }

    return null;
}

function generateRevengeEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_REVENGE_${npc.id}_${Date.now()}`,
        title: '旧怨翻涌',
        content: `${npc.name} 冷眼拦住去路，显然旧怨未消。对方此来不善，你必须立刻做出选择。`,
        choices: [
            { text: '正面迎战', effect: { history: `你与 ${npc.name} 正面交锋，旧怨再添新伤。`, HP: -40, WIL: 1 } },
            { text: '暂避锋芒', effect: { history: `你压下怒意抽身而退，暂且避开了 ${npc.name} 的锋芒。`, MP: -20, SPD: 1 } },
        ],
        eventType: 'CRISIS',
    };
}

function generateCommissionReturnEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_COMMISSION_${npc.id}_${Date.now()}`,
        title: '托付有回音',
        content: `${npc.name} 带着你先前托付的结果回来，或是消息，或是门路，又或者是一点出乎意料的收获。`,
        choices: [
            {
                text: '先听消息',
                effect: {
                    flags: [onceFlag('COMMISSION_RETURN', npc.id)],
                    INT: 1,
                    REP: 1,
                    MONEY: 10,
                    history: `${npc.name} 把一路打听来的消息和打点剩下的灵石都交回你手中，还提醒你最近哪些地方值得去走一趟。`,
                },
            },
            {
                text: '直接收下成果',
                effect: {
                    flags: [onceFlag('COMMISSION_RETURN', npc.id)],
                    items: ['spirit_herb', 'healing_pill_small'],
                    CHR: 1,
                    history: `${npc.name} 没多说废话，只把办成的东西交给你，显然这笔托付做得相当妥当。`,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generateTravelMemoryEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_TRAVEL_${npc.id}_${Date.now()}`,
        title: '同游余韵',
        content: `你与 ${npc.name} 先前同行时谈起的一段见闻，近日忽然在脑海里连成了线，似乎正指向一处新的机会。`,
        choices: [
            {
                text: '顺着线索细想',
                effect: {
                    flags: [onceFlag('TRAVEL_MEMORY', npc.id)],
                    EXP: 80,
                    LUCK: 1,
                    history: `你回想起与 ${npc.name} 同游时遗漏的细节，竟从中悟出了一点修行上的新路。`,
                },
            },
            {
                text: '把这段缘分记在心里',
                effect: {
                    flags: [onceFlag('TRAVEL_MEMORY', npc.id)],
                    MOOD: 8,
                    CHR: 1,
                    history: `你没有急着追逐线索，只是安静记住这段同行的余味，心境反倒更加平和。`,
                },
            },
        ],
        eventType: 'RANDOM',
    };
}

function generateNightTalkEchoEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_NIGHT_TALK_${npc.id}_${Date.now()}`,
        title: '灯下回声',
        content: `与 ${npc.name} 的那次夜谈似乎并未真正结束。几句当时未能说透的话，如今又在心底泛起回响。`,
        choices: [
            {
                text: '继续琢磨其中深意',
                effect: {
                    flags: [onceFlag('NIGHT_TALK_ECHO', npc.id)],
                    WIL: 1,
                    DAO: 1,
                    history: `你把那夜的只言片语反复咀嚼，终于明白了 ${npc.name} 当时真正想提醒你的东西。`,
                },
            },
            {
                text: '珍惜这份信任',
                effect: {
                    flags: [onceFlag('NIGHT_TALK_ECHO', npc.id)],
                    MOOD: 10,
                    REP: 1,
                    history: `你忽然意识到，有些关系本身就是答案。想到这里，心里竟比平时安定得多。`,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generatePartnerHintEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_PARTNER_HINT_${npc.id}_${Date.now()}`,
        title: '情意暗生',
        content: `${npc.name} 与你并肩同行时，言语间已多了几分不加掩饰的亲近。也许你们之间的缘分，早已不止于普通故交。`,
        choices: [
            {
                text: '将这份情意记在心里',
                effect: {
                    flags: [onceFlag('PARTNER_HINT', npc.id)],
                    history: `你将 ${npc.name} 的情意默默记下，彼此之间的气氛也微妙起来。`,
                    MOOD: 5,
                },
            },
            {
                text: '仍以道心为先',
                effect: {
                    flags: [onceFlag('PARTNER_HINT', npc.id)],
                    history: `你压下杂念，只把 ${npc.name} 当作值得珍视的同道。`,
                    INT: 1,
                    WIL: 1,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generateSwornHintEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_SWORN_HINT_${npc.id}_${Date.now()}`,
        title: '同道相知',
        content: `${npc.name} 直言与你志趣相投，若以后真遇大风大浪，也愿与你并肩。那种信任已远超普通结交。`,
        choices: [
            {
                text: '记下这份义气',
                effect: {
                    flags: [onceFlag('SWORN_HINT', npc.id)],
                    history: `你把 ${npc.name} 这番话牢牢记在心里，胸中也多了一分热意。`,
                    WIL: 1,
                    REP: 1,
                },
            },
            {
                text: '淡淡一笑',
                effect: {
                    flags: [onceFlag('SWORN_HINT', npc.id)],
                    history: `你没有把话说满，但也默认了与 ${npc.name} 之间越发深厚的信任。`,
                    CHR: 1,
                },
            },
        ],
        eventType: 'RANDOM',
    };
}

function generatePartnerWarmEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_PARTNER_WARM_${npc.id}_${Date.now()}`,
        title: '道侣相扶',
        content: `${npc.name} 主动为你护法，并与你交换近日修行心得。长夜无声，二人却都感到前路不再孤单。`,
        choices: [
            { text: '一同参悟', effect: { history: `你与 ${npc.name} 静坐同修，彼此心意相契，修为与心境都有增长。`, EXP: 120, MOOD: 8, DAO: 1 } },
            { text: '谢过好意，记在心中', effect: { history: `你谢过 ${npc.name} 的好意，心中却比平时安稳得多。`, WIL: 1, CHR: 1 } },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generatePartnerGiftEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_PARTNER_GIFT_${npc.id}_${Date.now()}`,
        title: '归来有礼',
        content: `${npc.name} 外出归来时，特意给你带回一份精心挑选的东西，显然一直记着你的需要。`,
        choices: [
            {
                text: '珍重收下',
                effect: {
                    flags: [onceFlag('PARTNER_GIFT', npc.id)],
                    history: `${npc.name} 把一路带回的礼物郑重交到你手中。你没多说什么，却把这份心意记得很深。`,
                    items: ['healing_pill_small', 'qi_gathering_pill'],
                    MOOD: 10,
                },
            },
            {
                text: '与其共享此物',
                effect: {
                    flags: [onceFlag('PARTNER_GIFT', npc.id)],
                    history: `你没有独自收起礼物，而是与 ${npc.name} 当场分用，彼此都更觉安心。`,
                    EXP: 90,
                    CHR: 1,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generatePartnerConsoleEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_PARTNER_CONSOLE_${npc.id}_${Date.now()}`,
        title: '灯下慰心',
        content: `${npc.name} 察觉你近日心绪不宁，夜里特意留在身边陪你说了许久的话，想替你稳住乱起的杂念。`,
        choices: [
            {
                text: '向其倾诉',
                effect: {
                    flags: [onceFlag('PARTNER_CONSOLE', npc.id)],
                    history: `你终于把压在心底的烦闷说了出来，${npc.name} 一直安静听着，直到你重新平静。`,
                    MOOD: 18,
                    WIL: 1,
                },
            },
            {
                text: '只默默并肩坐着',
                effect: {
                    flags: [onceFlag('PARTNER_CONSOLE', npc.id)],
                    history: `你没有多言，只与 ${npc.name} 一起看着灯火慢慢燃尽，但心里的郁结确实散了些。`,
                    MOOD: 12,
                    DAO: 1,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generatePartnerFutureEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_PARTNER_FUTURE_${npc.id}_${Date.now()}`,
        title: '共望来路',
        content: `夜谈之后，${npc.name} 罕见地主动与你谈起更长远的以后。那不只是陪伴，而像是把未来也一并放进了话里。`,
        choices: [
            {
                text: '与其约定共同精进',
                effect: {
                    flags: [onceFlag('PARTNER_FUTURE', npc.id)],
                    EXP: 140,
                    DAO: 2,
                    history: `你与 ${npc.name} 在灯下立下约定，无论以后境界如何变化，都要并肩往前再走一段。`,
                },
            },
            {
                text: '只把这份话意藏好',
                effect: {
                    flags: [onceFlag('PARTNER_FUTURE', npc.id)],
                    CHR: 1,
                    MOOD: 14,
                    history: `你没有立刻回应得太满，只把这份未来的想象收进心里，却也因此更珍惜当下。`,
                },
            },
        ],
        eventType: 'MAIN',
    };
}

function generateSwornSupportEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_SWORN_${npc.id}_${Date.now()}`,
        title: '义气相援',
        content: `${npc.name} 听闻你近来奔波，特地带着补给来找你，还说若有麻烦尽管开口。`,
        choices: [
            { text: '收下援手', effect: { history: `${npc.name} 将备好的丹药与灵石塞给了你，义气可感。`, items: ['healing_pill_small', 'spirit_stone'], REP: 1 } },
            { text: '与其把酒论道', effect: { history: `你与 ${npc.name} 借夜色长谈，彼此志气更坚。`, EXP: 80, WIL: 1, DAO: 1 } },
        ],
        eventType: 'RANDOM',
    };
}

function generateSwornRescueEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_SWORN_RESCUE_${npc.id}_${Date.now()}`,
        title: '义亲援手',
        content: `你刚陷入麻烦，${npc.name} 便从侧面赶来替你挡下一记狠手。生死边缘，有人真把你当自己人。`,
        choices: [
            {
                text: '与其并肩杀出',
                effect: {
                    flags: [onceFlag('SWORN_RESCUE', npc.id)],
                    history: `你与 ${npc.name} 并肩突围，这份联手作战的经历足以铭记很久。`,
                    EXP: 110,
                    WIL: 2,
                    REP: 2,
                },
            },
            {
                text: '先退一步整备',
                effect: {
                    flags: [onceFlag('SWORN_RESCUE', npc.id)],
                    history: `${npc.name} 替你殿后争取了时间，你趁机稳住阵脚，也看清了自己欠下的人情。`,
                    HP: 20,
                    DAO: 1,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generateSwornVentureEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_SWORN_VENTURE_${npc.id}_${Date.now()}`,
        title: '联手探路',
        content: `${npc.name} 想起你们上次同行时提过的一处险地，干脆邀你再去把那条路探深一些。`,
        choices: [
            {
                text: '再闯一程',
                effect: {
                    flags: [onceFlag('SWORN_VENTURE', npc.id)],
                    EXP: 100,
                    WIL: 1,
                    items: ['spirit_shard'],
                    history: `你与 ${npc.name} 再次联手前行，虽只得了些小收获，却把默契磨得更稳了。`,
                },
            },
            {
                text: '记下地点，来日再说',
                effect: {
                    flags: [onceFlag('SWORN_VENTURE', npc.id)],
                    INT: 1,
                    REP: 1,
                    history: `你没有急着动身，只是把 ${npc.name} 提到的路线和节点全部记了下来。`,
                },
            },
        ],
        eventType: 'OPPORTUNITY',
    };
}

function generateFriendEvent(npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_FRIEND_${npc.id}_${Date.now()}`,
        title: '故友相邀',
        content: `${npc.name} 主动来寻你同行，想与你切磋见识、互换消息。`,
        choices: [
            { text: '答应同去', effect: { history: `你与 ${npc.name} 同游半日，消息与感悟都多了不少。`, EXP: 60, CHR: 1 } },
            { text: '改日再聚', effect: { history: `你与 ${npc.name} 相约来日再叙，气氛依旧和气。`, MOOD: 3 } },
        ],
        eventType: 'RANDOM',
    };
}
