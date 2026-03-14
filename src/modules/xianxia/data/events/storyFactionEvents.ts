import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import type { WorldNPC } from '../../../../types/worldTypes';

const EMISSARY_PREFIX = 'ARC_STORY_EMISSARY_NPC:';
const FALLEN_PREFIX = 'ARC_STORY_FALLEN_NPC:';

function hasFlag(engine: GameEngine, flag: string) {
    return engine.state.flags.includes(flag);
}

function getNpcByPrefix(engine: GameEngine, prefix: string) {
    const flag = engine.state.flags.find((entry) => entry.startsWith(prefix));
    if (!flag) return null;
    const npcId = flag.slice(prefix.length);
    return engine.state.world.worldNPCs.find((npc) => npc.id === npcId && npc.alive) || null;
}

function pickEmissarySeed(engine: GameEngine): WorldNPC | null {
    return engine.state.world.worldNPCs.find((npc) =>
        npc.alive
        && npc.currentLocationId === engine.state.location
        && (npc.position === 'GUEST' || npc.position === 'WANDERER' || npc.position === 'INNER_DISCIPLE')
    ) || null;
}

function pickFallenSeed(engine: GameEngine): WorldNPC | null {
    return engine.state.world.worldNPCs.find((npc) =>
        npc.alive
        && npc.currentLocationId === engine.state.location
        && (npc.position === 'ELDER' || npc.position === 'GRAND_ELDER' || npc.position === 'INNER_DISCIPLE')
    ) || null;
}

function buildEmissaryArc(engine: GameEngine, npc: WorldNPC, action: string): GameEvent | null {
    if (
        !hasFlag(engine, 'STORY:EMISSARY_STAGE_1')
        && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && ['INTERACT', 'EXPLORE', 'WORK'].includes(action)
        && Math.random() < 0.2
    ) {
        return {
            id: `EVT_STORY_EMISSARY_STAGE1_${npc.id}`,
            title: '言辞过分温柔的人',
            content: `${npc.name} 在人群中散播一种近乎蛊惑的说法: 黑潮并非灾祸，而是淘洗弱者、让真正强者更进一步的“新天命”。`,
            choices: [
                {
                    text: '记住此人说法',
                    effect: {
                        flags: [`${EMISSARY_PREFIX}${npc.id}`, 'STORY:EMISSARY_STAGE_1'],
                        INT: 1,
                        history: `你没有当场发难，只是把 ${npc.name} 的每一句话都记了下来。这样的人，往往比明刀明枪更危险。`,
                    },
                },
                {
                    text: '当场反驳',
                    effect: {
                        flags: [`${EMISSARY_PREFIX}${npc.id}`, 'STORY:EMISSARY_STAGE_1'],
                        REP: 2,
                        WIL: 1,
                        history: `你当众打断了 ${npc.name} 的煽动之语。对方只是笑笑退去，却让你更确定其绝非寻常散修。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:EMISSARY_STAGE_1')
        && !hasFlag(engine, 'STORY:EMISSARY_STAGE_2')
        && hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.18
    ) {
        return {
            id: `EVT_STORY_EMISSARY_STAGE2_${npc.id}`,
            title: '黑潮使者',
            content: `${npc.name} 终于不再遮掩，甚至主动承认自己只是归墟古主投下的一枚棋子。对方说你越是挣扎，这方天地就越会在绝望里自己崩开。`,
            choices: [
                {
                    text: '继续套问归墟布置',
                    effect: {
                        flags: ['STORY:EMISSARY_STAGE_2', 'STORY:EMISSARY_INTEL'],
                        INT: 2,
                        DAO: 1,
                        history: `你强压杀意，硬是从 ${npc.name} 的只言片语里摸出了几条与黑潮祭坛有关的线索。`,
                    },
                },
                {
                    text: '斥其妖言，逼退此人',
                    effect: {
                        flags: ['STORY:EMISSARY_STAGE_2'],
                        REP: 3,
                        WIL: 1,
                        history: `你没有继续听下去，而是逼得 ${npc.name} 当场退走。周围不少本已动摇的人，也因此重新稳住了心神。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:EMISSARY_STAGE_2')
        && !hasFlag(engine, 'STORY:EMISSARY_SLAIN')
        && hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.16
    ) {
        return {
            id: `EVT_STORY_EMISSARY_STAGE3_${npc.id}`,
            title: '祭言断绝',
            content: `${npc.name} 眼见祭坛已毁，终于露出真正獠牙。对方妄图拖住你，好让更多裂口在别处张开。`,
            choices: [
                {
                    text: '当场诛杀此人',
                    combat: {
                        type: 'NPC',
                        enemy: {
                            id: 'story_black_tide_emissary',
                            name: '黑潮使者',
                            levelStr: '归墟走狗',
                            hp: 3400,
                            maxHp: 3400,
                            mp: 900,
                            maxMp: 900,
                            atk: 320,
                            def: 180,
                            spd: 170,
                            crit: 15,
                            critDamage: 1.75,
                        },
                        victoryFlags: ['STORY:EMISSARY_SLAIN'],
                        victoryHistory: '黑潮使者的祭言至此彻底断绝，归墟在你周围布下的一角迷雾也被撕开。',
                    },
                    effect: {
                        history: `你没有再给 ${npc.name} 退走的机会。`,
                    },
                },
                {
                    text: '先逼问别处布置',
                    effect: {
                        flags: ['STORY:EMISSARY_SPOKEN'],
                        INT: 1,
                        WIL: 1,
                        history: `${npc.name} 临退前仍吐出了几句与别处黑潮裂点有关的话。即便没有留下此人，这些话也足够你后面再追一段。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}

function buildFallenArc(engine: GameEngine, npc: WorldNPC, action: string): GameEvent | null {
    if (
        !hasFlag(engine, 'STORY:FALLEN_STAGE_1')
        && hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && ['INTERACT', 'CULTIVATE', 'EXPLORE'].includes(action)
        && Math.random() < 0.16
    ) {
        return {
            id: `EVT_STORY_FALLEN_STAGE1_${npc.id}`,
            title: '旧日长老',
            content: `${npc.name} 曾是某宗门中很有声望的前辈，如今却神色枯槁，只反复说一句话: “撑不住的，都会去归墟。”`,
            choices: [
                {
                    text: '记下此人来历',
                    effect: {
                        flags: [`${FALLEN_PREFIX}${npc.id}`, 'STORY:FALLEN_STAGE_1'],
                        INT: 1,
                        history: `你悄悄打听了 ${npc.name} 的旧事，得知对方那一脉几乎全灭于早年黑潮。`,
                    },
                },
                {
                    text: '试着劝其回头',
                    effect: {
                        flags: [`${FALLEN_PREFIX}${npc.id}`, 'STORY:FALLEN_STAGE_1'],
                        CHR: 1,
                        history: `${npc.name} 对你的劝说并无明显回应，但那双死灰般的眼睛里，似乎仍有极淡的一点波动。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:FALLEN_STAGE_1')
        && !hasFlag(engine, 'STORY:FALLEN_STAGE_2')
        && hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'CULTIVATE'].includes(action)
        && Math.random() < 0.16
    ) {
        return {
            id: `EVT_STORY_FALLEN_STAGE2_${npc.id}`,
            title: '坠渊之人',
            content: `${npc.name} 终于承认，自己早已向归墟低头。对方说不是为了野心，只是因为再也承受不了失去。`,
            choices: [
                {
                    text: '告诉他你为何仍要战',
                    effect: {
                        flags: ['STORY:FALLEN_STAGE_2', 'STORY:FALLEN_HESITATED'],
                        DAO: 1,
                        WIL: 1,
                        history: `你没有急着动手，只把自己一路所见、所护、所失都说给了 ${npc.name} 听。对方第一次沉默了很久。`,
                    },
                },
                {
                    text: '不再多言，准备了结',
                    effect: {
                        flags: ['STORY:FALLEN_STAGE_2'],
                        WIL: 1,
                        history: `你知道有些人一旦踏进去太深，便未必还能再回头。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:FALLEN_STAGE_2')
        && !hasFlag(engine, 'STORY:FALLEN_ELDER_SLAIN')
        && hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.14
    ) {
        const hesitated = hasFlag(engine, 'STORY:FALLEN_HESITATED');
        return {
            id: `EVT_STORY_FALLEN_STAGE3_${npc.id}`,
            title: hesitated ? '最后一问' : '坠渊长老',
            content: hesitated
                ? `${npc.name} 再见到你时，只问了一句: “若我当年也有人拉一把，会不会不一样？”`
                : `${npc.name} 已彻底投向归墟，反过来替黑潮遮掩裂口方位。若不处理，对后面的大战终究是祸患。`,
            choices: [
                {
                    text: '送其上路',
                    combat: {
                        type: 'NPC',
                        enemy: {
                            id: 'story_fallen_elder',
                            name: '坠渊长老',
                            levelStr: '堕化长老',
                            hp: 4600,
                            maxHp: 4600,
                            mp: 1500,
                            maxMp: 1500,
                            atk: 380,
                            def: 240,
                            spd: 150,
                            crit: 14,
                            critDamage: 1.8,
                        },
                        victoryFlags: ['STORY:FALLEN_ELDER_SLAIN'],
                        victoryHistory: hesitated
                            ? '坠渊长老终于死在归墟前夜。你不知道这是否算救赎，但至少这一脉的痛苦不必再继续被黑潮利用。'
                            : '坠渊长老陨落后，归墟在修行界埋下的一枚老棋也终于被你拔掉。',
                    },
                    effect: {
                        history: '你知道这不是一场值得庆祝的胜利，却也没有别的路可走。',
                    },
                },
                {
                    text: hesitated ? '最后再劝一次' : '先记下其行踪',
                    effect: {
                        flags: ['STORY:FALLEN_ELDER_MARKED'],
                        INT: 1,
                        DAO: 1,
                        history: hesitated
                            ? `你没有立刻出手，而是试着给 ${npc.name} 留最后一次开口的机会。`
                            : `你先把 ${npc.name} 的动向与归墟勾连之处全部记下，准备在更好的时机一并收网。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}

export function checkStoryFactionEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';

    const emissaryNpc = getNpcByPrefix(engine, EMISSARY_PREFIX);
    if (emissaryNpc && emissaryNpc.currentLocationId === engine.state.location) {
        const emissaryEvent = buildEmissaryArc(engine, emissaryNpc, action);
        if (emissaryEvent) return emissaryEvent;
    }

    const fallenNpc = getNpcByPrefix(engine, FALLEN_PREFIX);
    if (fallenNpc && fallenNpc.currentLocationId === engine.state.location) {
        const fallenEvent = buildFallenArc(engine, fallenNpc, action);
        if (fallenEvent) return fallenEvent;
    }

    const emissarySeed = pickEmissarySeed(engine);
    if (emissarySeed && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN') && !hasFlag(engine, 'STORY:EMISSARY_STAGE_1') && ['INTERACT', 'EXPLORE', 'WORK'].includes(action) && Math.random() < 0.14) {
        return buildEmissaryArc(engine, emissarySeed, action);
    }

    const fallenSeed = pickFallenSeed(engine);
    if (fallenSeed && hasFlag(engine, 'STORY:ALLIANCE_PLEDGE') && !hasFlag(engine, 'STORY:FALLEN_STAGE_1') && ['INTERACT', 'CULTIVATE', 'EXPLORE'].includes(action) && Math.random() < 0.12) {
        return buildFallenArc(engine, fallenSeed, action);
    }

    return null;
}
