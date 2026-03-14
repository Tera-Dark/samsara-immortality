import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import type { WorldNPC } from '../../../../types/worldTypes';

const WITNESS_PREFIX = 'ARC_STORY_WITNESS_NPC:';
const OPPORTUNIST_PREFIX = 'ARC_STORY_OPPORTUNIST_NPC:';

const WITNESS_STAGE_1 = 'ARC_STORY_WITNESS_STAGE_1';
const WITNESS_STAGE_2 = 'ARC_STORY_WITNESS_STAGE_2';
const WITNESS_STAGE_3 = 'ARC_STORY_WITNESS_STAGE_3';

const OPPORTUNIST_STAGE_1 = 'ARC_STORY_OPPORTUNIST_STAGE_1';
const OPPORTUNIST_STAGE_2 = 'ARC_STORY_OPPORTUNIST_STAGE_2';
const OPPORTUNIST_STAGE_3 = 'ARC_STORY_OPPORTUNIST_STAGE_3';

function hasFlag(engine: GameEngine, flag: string) {
    return engine.state.flags.includes(flag);
}

function getNpcByPrefix(engine: GameEngine, prefix: string) {
    const flag = engine.state.flags.find((entry) => entry.startsWith(prefix));
    if (!flag) return null;
    const npcId = flag.slice(prefix.length);
    return engine.state.world.worldNPCs.find((npc) => npc.id === npcId && npc.alive) || null;
}

function pickWitnessSeed(engine: GameEngine): WorldNPC | null {
    return engine.state.world.worldNPCs.find((npc) =>
        npc.alive
        && npc.currentLocationId === engine.state.location
        && (npc.position === 'WANDERER' || npc.position === 'OUTER_DISCIPLE')
    ) || null;
}

function pickOpportunistSeed(engine: GameEngine): WorldNPC | null {
    return engine.state.world.worldNPCs.find((npc) =>
        npc.alive
        && npc.currentLocationId === engine.state.location
        && (npc.position === 'INNER_DISCIPLE' || npc.position === 'GUEST' || npc.position === 'OUTER_DISCIPLE')
    ) || null;
}

function buildWitnessArc(engine: GameEngine, npc: WorldNPC, action: string): GameEvent | null {
    if (
        !hasFlag(engine, WITNESS_STAGE_1)
        && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && ['INTERACT', 'WORK', 'EXPLORE'].includes(action)
        && Math.random() < 0.28
    ) {
        return {
            id: `EVT_STORY_WITNESS_STAGE1_${npc.id}`,
            title: '风雪夜里的求助',
            content: `${npc.name} 带着几名受黑潮惊扰的凡人缩在破屋檐下，药食都快见底。对方明明也是修士，却仍在一趟趟把能救出来的人往回背。`,
            choices: [
                {
                    text: '留下资源，帮他们撑过这一夜',
                    effect: {
                        flags: [`${WITNESS_PREFIX}${npc.id}`, WITNESS_STAGE_1, 'STORY:HELPED_REFUGEES'],
                        MONEY: -8,
                        REP: 2,
                        MOOD: 4,
                        history: `你把手头能分出的灵石和药物都留给了 ${npc.name} 一行人。那些凡人未必知道你是谁，但他们记住了这一夜有人肯停下脚步。`,
                    },
                },
                {
                    text: '亲自护送他们去安全处',
                    effect: {
                        flags: [`${WITNESS_PREFIX}${npc.id}`, WITNESS_STAGE_1, 'STORY:HELPED_REFUGEES'],
                        WIL: 1,
                        REP: 3,
                        history: `你陪着 ${npc.name} 将人一个个送往安全地带。那一路并不体面，却让你第一次真正看清这场黑潮压在凡人头上的样子。`,
                    },
                },
                {
                    text: '只提醒几句，转身离开',
                    effect: {
                        flags: [`${WITNESS_PREFIX}${npc.id}`, WITNESS_STAGE_1, 'STORY:LEFT_REFUGEES'],
                        INT: 1,
                        history: `你只是提醒了几句便转身离开。${npc.name} 没有拦你，只是默默把那点失望藏进了眼里。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, WITNESS_STAGE_1)
        && !hasFlag(engine, WITNESS_STAGE_2)
        && hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.24
    ) {
        const helped = hasFlag(engine, 'STORY:HELPED_REFUGEES');
        return {
            id: `EVT_STORY_WITNESS_STAGE2_${npc.id}`,
            title: helped ? '旧人携恩而来' : '旧人再见',
            content: helped
                ? `${npc.name} 再见到你时，已经替那些被救下的人安顿出了一处落脚地。对方悄悄告诉你，黑潮后头还有人在暗中囤药抬价，发灾难财。`
                : `${npc.name} 再次见到你，神情平静了许多。对方没有翻旧账，只淡淡提起黑潮之后有人趁乱囤药抬价，许多凡人只能硬熬。`,
            choices: [
                {
                    text: '出手资助安顿点',
                    effect: {
                        flags: [WITNESS_STAGE_2, 'STORY:REFUGE_SUPPORT'],
                        MONEY: -12,
                        REP: 3,
                        CHR: 1,
                        history: `你没有多说，只让 ${npc.name} 替你把灵石和药材转交下去。哪怕只是撑住几户人家，也总比什么都不做来得强。`,
                    },
                },
                {
                    text: '记下囤药之人的线索',
                    effect: {
                        flags: [WITNESS_STAGE_2, 'STORY:KNOW_OPPORTUNIST'],
                        INT: 1,
                        WIL: 1,
                        history: `${npc.name} 把几条关键线索悄悄告诉了你。你这才明白，灾祸里最冷的未必是黑潮，而是人心。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, WITNESS_STAGE_2)
        && !hasFlag(engine, WITNESS_STAGE_3)
        && hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'CULTIVATE', 'EXPLORE'].includes(action)
        && Math.random() < 0.22
    ) {
        const helped = hasFlag(engine, 'STORY:HELPED_REFUGEES');
        return {
            id: `EVT_STORY_WITNESS_STAGE3_${npc.id}`,
            title: helped ? '凡尘微灯' : '迟来的暖意',
            content: helped
                ? `${npc.name} 带你去看了一眼那处安顿点。孩子们已经重新敢在院里跑动，屋檐下有人在煮热粥。对方说，这样的日子多撑一日，便值一日。`
                : `${npc.name} 带你去看了一眼被安顿下来的凡人。那些人并不认识你，却还是对每一个肯伸手的修士心怀感激。你第一次觉得，晚一点也总比不到好。`,
            choices: [
                {
                    text: '留下防身丹药与符箓',
                    effect: {
                        flags: [WITNESS_STAGE_3],
                        items: ['healing_pill_small', 'talisman_speed'],
                        REP: 4,
                        MOOD: 6,
                        history: `你把一部分保命之物留在了安顿点。那并不能改变整个世界，却足以让几个人在下一次风暴来时多出一点希望。`,
                    },
                },
                {
                    text: '与其静坐片刻',
                    effect: {
                        flags: [WITNESS_STAGE_3],
                        DAO: 1,
                        WIL: 1,
                        history: `你与 ${npc.name} 一起坐在院门前，看着烟火气慢慢重新升起来。你忽然明白，修行若不能护住这些东西，也就少了很多意义。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}

function buildOpportunistArc(engine: GameEngine, npc: WorldNPC, action: string): GameEvent | null {
    if (
        !hasFlag(engine, OPPORTUNIST_STAGE_1)
        && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && ['INTERACT', 'WORK', 'EXPLORE'].includes(action)
        && Math.random() < 0.24
    ) {
        return {
            id: `EVT_STORY_OPPORTUNIST_STAGE1_${npc.id}`,
            title: '趁乱牟利',
            content: `${npc.name} 悄悄向你兜售几瓶翻了数倍价格的疗伤丹，口口声声说黑潮将至，资源本就该归出得起价的人。`,
            choices: [
                {
                    text: '当场拒绝，并记住此人',
                    effect: {
                        flags: [`${OPPORTUNIST_PREFIX}${npc.id}`, OPPORTUNIST_STAGE_1, 'STORY:SPOTTED_OPPORTUNIST'],
                        WIL: 1,
                        REP: 1,
                        history: `你没有买下那些高价丹药，只把 ${npc.name} 这副嘴脸默默记在了心里。`,
                    },
                },
                {
                    text: '先买一点，以备不时之需',
                    effect: {
                        flags: [`${OPPORTUNIST_PREFIX}${npc.id}`, OPPORTUNIST_STAGE_1, 'STORY:BOUGHT_FROM_OPPORTUNIST'],
                        MONEY: -12,
                        items: ['healing_pill_small'],
                        history: `你终究还是买下了一瓶丹药。理智告诉你这是必要准备，可心里多少还是有些不舒服。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, OPPORTUNIST_STAGE_1)
        && !hasFlag(engine, OPPORTUNIST_STAGE_2)
        && hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'WORK'].includes(action)
        && Math.random() < 0.22
    ) {
        const bought = hasFlag(engine, 'STORY:BOUGHT_FROM_OPPORTUNIST');
        return {
            id: `EVT_STORY_OPPORTUNIST_STAGE2_${npc.id}`,
            title: '人心各有价',
            content: bought
                ? `${npc.name} 认出了你，语气竟意外客气了不少，还试探你是否愿意一同做几桩“只赚不赔”的生意。`
                : `${npc.name} 见你再来，竟像无事发生般谈起黑潮里的买卖经，仿佛凡人的生死也只是账本上一行数字。`,
            choices: [
                {
                    text: '公开斥责此人',
                    effect: {
                        flags: [OPPORTUNIST_STAGE_2, 'STORY:EXPOSED_OPPORTUNIST'],
                        REP: 3,
                        WIL: 1,
                        history: `你当众点破了 ${npc.name} 的做派。围观之人未必都敢附和，但至少有人开始重新审视这门黑心生意。`,
                    },
                },
                {
                    text: '暂且按下，只收集更多把柄',
                    effect: {
                        flags: [OPPORTUNIST_STAGE_2, 'STORY:TRACKED_OPPORTUNIST'],
                        INT: 2,
                        WIL: 1,
                        history: `你没有急着翻脸，而是顺着 ${npc.name} 的口风继续往下摸。越听，你越觉得对方背后还有更深的勾连。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, OPPORTUNIST_STAGE_2)
        && !hasFlag(engine, OPPORTUNIST_STAGE_3)
        && hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && npc.currentLocationId === engine.state.location
        && ['INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.2
    ) {
        const exposed = hasFlag(engine, 'STORY:EXPOSED_OPPORTUNIST');
        return {
            id: `EVT_STORY_OPPORTUNIST_STAGE3_${npc.id}`,
            title: exposed ? '冷眼旁观的人' : '迟来的清算',
            content: exposed
                ? `${npc.name} 如今已混得狼狈不堪，身边再无多少人肯信。对方看着被黑潮波及后残破的街巷，终于第一次露出几分真实的惶然。`
                : `${npc.name} 终究还是被你抓到了把柄。可真站到对方面前时，你却发现他也不过是个在大劫里先一步学会冷下心来的人。`,
            choices: [
                {
                    text: '不再追打，让其自行承担后果',
                    effect: {
                        flags: [OPPORTUNIST_STAGE_3],
                        WIL: 1,
                        DAO: 1,
                        history: `你没有继续落井下石。大劫之下，人会变成什么样，本就是修行路上最刺眼的一面镜子。`,
                    },
                },
                {
                    text: '逼其吐出囤积资源接济灾民',
                    effect: {
                        flags: [OPPORTUNIST_STAGE_3],
                        MONEY: 16,
                        REP: 4,
                        history: `你逼着 ${npc.name} 吐出了先前囤下的大半资源，并将其转手用在了受灾之人身上。那一刻，周围人看你的眼神已彻底不同。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}

export function checkStoryHumanityEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';

    const witnessNpc = getNpcByPrefix(engine, WITNESS_PREFIX);
    if (witnessNpc && witnessNpc.currentLocationId === engine.state.location) {
        const witnessEvent = buildWitnessArc(engine, witnessNpc, action);
        if (witnessEvent) return witnessEvent;
    }

    const opportunistNpc = getNpcByPrefix(engine, OPPORTUNIST_PREFIX);
    if (opportunistNpc && opportunistNpc.currentLocationId === engine.state.location) {
        const opportunistEvent = buildOpportunistArc(engine, opportunistNpc, action);
        if (opportunistEvent) return opportunistEvent;
    }

    const witnessSeed = pickWitnessSeed(engine);
    if (witnessSeed && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN') && !hasFlag(engine, WITNESS_STAGE_1) && ['INTERACT', 'WORK', 'EXPLORE'].includes(action) && Math.random() < 0.18) {
        return buildWitnessArc(engine, witnessSeed, action);
    }

    const opportunistSeed = pickOpportunistSeed(engine);
    if (opportunistSeed && hasFlag(engine, 'STORY:BLACK_TIDE_OMEN') && !hasFlag(engine, OPPORTUNIST_STAGE_1) && ['INTERACT', 'WORK', 'EXPLORE'].includes(action) && Math.random() < 0.16) {
        return buildOpportunistArc(engine, opportunistSeed, action);
    }

    return null;
}
