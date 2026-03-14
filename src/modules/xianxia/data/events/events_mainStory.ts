import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';

function hasActiveMission(engine: GameEngine, missionId: string) {
    return engine.state.missions.active.some((mission) => mission.id === missionId);
}

function hasFlag(engine: GameEngine, flag: string) {
    return engine.state.flags.includes(flag);
}

export function checkMainStoryEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';

    if (
        hasActiveMission(engine, 'MQ_07_BLACK_TIDE_OMEN')
        && !hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && ['CULTIVATE', 'EXPLORE', 'INTERACT'].includes(action)
        && Math.random() < 0.45
    ) {
        return {
            id: 'EVT_MAIN_BLACK_TIDE_OMEN',
            title: '黑潮初现',
            content: '你在修行间隙察觉天地灵机中混入了一缕异样的阴冷气息。数名修士都提到，近来北荒深处常有黑潮翻涌，像是某种沉睡已久的东西正在苏醒。',
            choices: [
                {
                    text: '记下异象，暗中留意',
                    effect: {
                        flags: ['STORY:BLACK_TIDE_OMEN'],
                        DAO: 1,
                        INT: 1,
                        history: '你把这股异样灵机牢牢记下，隐约感觉自己的修行之路将不再只是个人长生之争。',
                    },
                },
                {
                    text: '主动打探黑潮源头',
                    effect: {
                        flags: ['STORY:BLACK_TIDE_OMEN'],
                        REP: 2,
                        WIL: 1,
                        history: '你主动向来往修士打探消息，渐渐拼凑出一个名字: 归墟古主。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasActiveMission(engine, 'MQ_09_ALLIANCE_OF_DAWN')
        && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && !hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && ['INTERACT', 'EXPLORE', 'WORK'].includes(action)
        && Math.random() < 0.4
    ) {
        return {
            id: 'EVT_MAIN_ALLIANCE_PLEDGE',
            title: '曙光盟约',
            content: '几位宗门使者与散修前辈在中州秘密会面，商议如何应对黑潮背后的大敌。你被邀请列席，只因你已是少数真正见过异象并活着回来的人。',
            choices: [
                {
                    text: '接下盟约，愿为先锋',
                    effect: {
                        flags: ['STORY:ALLIANCE_PLEDGE'],
                        REP: 5,
                        WIL: 2,
                        history: '你在众人面前立下誓言，愿为曙光盟约探出一条活路。自此，你真正站上了这场大局的前线。',
                    },
                },
                {
                    text: '只收情报，不许空言',
                    effect: {
                        flags: ['STORY:ALLIANCE_PLEDGE'],
                        INT: 2,
                        DAO: 1,
                        history: '你没有把话说满，只带走了几份与黑潮有关的密报，也因此看清局势比想象中更险恶。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasActiveMission(engine, 'MQ_11_BREAK_VOID_ALTAR')
        && hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && !hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && ['EXPLORE', 'INTERACT'].includes(action)
        && Math.random() < 0.35
    ) {
        return {
            id: 'EVT_MAIN_VOID_ALTAR',
            title: '裂渊祭坛',
            content: '你终于沿着曙光盟约给出的线索，找到一座正在汲取天地浊气的古老祭坛。若不将其摧毁，黑潮终会借此撕开更大的裂口。',
            choices: [
                {
                    text: '立刻出手摧毁祭坛',
                    combat: {
                        type: 'NPC',
                        enemy: {
                            id: 'story_void_altar_guard',
                            name: '裂渊祭卫',
                            levelStr: '黑潮祭卫',
                            hp: 1800,
                            maxHp: 1800,
                            mp: 400,
                            maxMp: 400,
                            atk: 180,
                            def: 120,
                            spd: 90,
                            crit: 12,
                            critDamage: 1.7,
                        },
                        victoryFlags: ['STORY:VOID_ALTAR_BROKEN'],
                        victoryHistory: '你一战击溃祭坛守卫，亲手斩断黑潮祭坛与归墟之间的联系，天地间那股阴冷之意也为之一滞。',
                    },
                    effect: {
                        history: '你调动全身灵力，决意不让这座祭坛继续存在。',
                    },
                },
                {
                    text: '先观其纹路再破阵',
                    effect: {
                        INT: 1,
                        WIL: 1,
                        history: '你没有急着动手，而是先强记下祭坛纹路。那股来自归墟的古老恶意，也由此更加清晰地显露出来。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasActiveMission(engine, 'MQ_13_SEAL_THE_RIFT')
        && hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && !hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && ['EXPLORE', 'CULTIVATE', 'INTERACT'].includes(action)
        && Math.random() < 0.32
    ) {
        return {
            id: 'EVT_MAIN_SEAL_RIFT',
            title: '归墟裂口',
            content: '祭坛虽毁，但归墟深处仍有一道裂口在缓慢扩张。若不能将其封死，这方天地迟早会迎来真正的大劫。',
            choices: [
                {
                    text: '入裂口镇压黑潮',
                    combat: {
                        type: 'NPC',
                        enemy: {
                            id: 'story_void_beast',
                            name: '归墟裂兽',
                            levelStr: '裂口镇守',
                            hp: 5200,
                            maxHp: 5200,
                            mp: 1200,
                            maxMp: 1200,
                            atk: 420,
                            def: 260,
                            spd: 180,
                            crit: 16,
                            critDamage: 1.8,
                        },
                        victoryFlags: ['STORY:VOID_RIFT_SEALED'],
                        victoryHistory: '你以自身道基为引，强行封住归墟裂口，黑潮第一次被真正压回了深渊之下。',
                    },
                    effect: {
                        history: '你明知此行可能伤及根基，仍旧选择踏入裂口最深处。',
                    },
                },
                {
                    text: '先收集封印之法',
                    effect: {
                        DAO: 1,
                        INT: 1,
                        history: '你暂且没有深入，而是不断搜集与封印归墟裂口有关的旧法。大战尚未来临，但你已开始为最后一战做准备。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasActiveMission(engine, 'MQ_15_SLAY_THE_VOID_LORD')
        && hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && !hasFlag(engine, 'STORY:VOID_LORD_SLAIN')
        && ['CULTIVATE', 'EXPLORE', 'INTERACT'].includes(action)
        && Math.random() < 0.28
    ) {
        return {
            id: 'EVT_MAIN_VOID_LORD',
            title: '归墟古主',
            content: '随着你境界再进一步，那道曾被封住的裂口忽然再度震颤。黑潮真正的主人终于投来目光。若此战不能胜，这一世修行与整个世界都会被拖入归墟。',
            choices: [
                {
                    text: '以此身迎战古主',
                    combat: {
                        type: 'NPC',
                        enemy: {
                            id: 'story_void_lord_shell',
                            name: '归墟古主残壳',
                            levelStr: '终局首重',
                            hp: 9000,
                            maxHp: 9000,
                            mp: 3200,
                            maxMp: 3200,
                            atk: 780,
                            def: 460,
                            spd: 280,
                            crit: 18,
                            critDamage: 1.9,
                        },
                        victoryHistory: '你先打碎了归墟古主投在此世的外壳，可真正的恶意并未就此断绝。裂口深处反而开始彻底苏醒。',
                        nextEnemy: {
                            id: 'story_void_lord_true',
                            name: '归墟古主',
                            levelStr: '终局二重',
                            hp: 15000,
                            maxHp: 15000,
                            mp: 5200,
                            maxMp: 5200,
                            atk: 980,
                            def: 580,
                            spd: 340,
                            crit: 22,
                            critDamage: 2.1,
                        },
                        nextType: 'NPC',
                        nextVictoryFlags: ['STORY:VOID_LORD_SLAIN'],
                        nextVictoryHistory: '你在归墟尽头斩落古主意志，这场笼罩天地的黑潮终于被彻底截断。众生得以再迎一个可以修行、可以活下去的明天。',
                    },
                    effect: {
                        history: '你不再后退，所有过往的修行、情义与执念，都在此刻汇成了真正的一剑。',
                    },
                },
                {
                    text: '静心调息，再看最后一眼天地',
                    effect: {
                        MOOD: 10,
                        WIL: 2,
                        history: '大战前夜，你少见地让自己彻底安静下来。你知道下一次出手，便要决定许多人的命运。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}
