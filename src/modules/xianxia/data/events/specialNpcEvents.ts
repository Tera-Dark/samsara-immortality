import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import type { WorldNPC } from '../../../../types/worldTypes';

const GUIDE_FLAG_PREFIX = 'ARC_GUIDE_NPC:';
const BROKER_FLAG_PREFIX = 'ARC_BROKER_NPC:';

const GUIDE_STAGE_1 = 'ARC_GUIDE_STAGE_1_DONE';
const GUIDE_STAGE_2 = 'ARC_GUIDE_STAGE_2_DONE';
const GUIDE_STAGE_3 = 'ARC_GUIDE_STAGE_3_DONE';

const BROKER_STAGE_1 = 'ARC_BROKER_STAGE_1_DONE';
const BROKER_STAGE_2 = 'ARC_BROKER_STAGE_2_DONE';
const BROKER_STAGE_3 = 'ARC_BROKER_STAGE_3_DONE';

function getNpcByFlag(engine: GameEngine, prefix: string): WorldNPC | null {
    const flag = engine.state.flags.find(entry => entry.startsWith(prefix));
    if (!flag) return null;
    const npcId = flag.slice(prefix.length);
    return engine.state.world.worldNPCs.find(npc => npc.id === npcId && npc.alive) || null;
}

function getLocalBrokerSeed(engine: GameEngine): WorldNPC | null {
    return engine.state.world.worldNPCs.find(npc =>
        npc.alive
        && npc.currentLocationId === engine.state.location
        && (npc.position === 'OUTER_DISCIPLE' || npc.position === 'INNER_DISCIPLE')
        && (npc.affinity || 0) >= 12
    ) || null;
}

function buildGuideArc(engine: GameEngine, guideNpc: WorldNPC, action: string): GameEvent | null {
    const affinity = guideNpc.affinity || 0;

    if (!engine.state.flags.includes(GUIDE_STAGE_1) && affinity >= 10 && ['EXPLORE', 'WORK', 'INTERACT'].includes(action) && Math.random() < 0.35) {
        return {
            id: `EVT_SPECIAL_GUIDE_STAGE1_${guideNpc.id}`,
            title: '游方客借灯',
            content: `你在路边再度碰见【${guideNpc.name}】。对方像是早知道你会来，借着一盏旧灯同你讲起山川旧闻与坊市门道。`,
            choices: [
                {
                    text: '认真记下他的话',
                    effect: {
                        flags: [GUIDE_STAGE_1],
                        INT: 1,
                        DAO: 1,
                        items: ['book_changchun', 'spirit_shard'],
                        history: `${guideNpc.name}随手递给你一卷旧功法与几枚灵石碎片，说是给肯听故事的人一点路费。`,
                    },
                },
                {
                    text: '帮他收摊换些见闻',
                    effect: {
                        flags: [GUIDE_STAGE_1],
                        MONEY: 8,
                        CHR: 1,
                        history: `你替${guideNpc.name}收好旧摊，对方顺口点拨了不少与人打交道的门道。`,
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (engine.state.flags.includes(GUIDE_STAGE_1) && !engine.state.flags.includes(GUIDE_STAGE_2) && affinity >= 22 && action === 'EXPLORE' && Math.random() < 0.3) {
        return {
            id: `EVT_SPECIAL_GUIDE_STAGE2_${guideNpc.id}`,
            title: '废园寻踪',
            content: `【${guideNpc.name}】在山路旁等你许久，只说自己年轻时曾在附近一座废园寄居，那里也许还留着些对你有用的东西。`,
            choices: [
                {
                    text: '按他说的线索去找',
                    effect: {
                        flags: [GUIDE_STAGE_2],
                        items: ['book_body_art', 'talisman_speed', 'spirit_herb'],
                        WIL: 1,
                        history: `你照着${guideNpc.name}给的指引摸进废园，果然翻到几样还算实用的旧物。`,
                    },
                },
                {
                    text: '先陪他慢慢聊旧事',
                    effect: {
                        flags: [GUIDE_STAGE_2],
                        INT: 1,
                        REP: 1,
                        MONEY: 12,
                        history: `${guideNpc.name}似乎更满意你愿意停下来听他讲话，临别前塞给你一点灵石做路费。`,
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (
        engine.state.flags.includes(GUIDE_STAGE_2)
        && !engine.state.flags.includes(GUIDE_STAGE_3)
        && affinity >= 38
        && engine.state.realm_idx >= 1
        && ['EXPLORE', 'INTERACT', 'CULTIVATE'].includes(action)
        && Math.random() < 0.28
    ) {
        return {
            id: `EVT_SPECIAL_GUIDE_STAGE3_${guideNpc.id}`,
            title: '山夜旧约',
            content: `夜色里，【${guideNpc.name}】终于承认自己当年也曾是个四处碰壁的散修。见你如今已真正踏上仙途，他将最后一点旧藏交到你手里。`,
            choices: [
                {
                    text: '收下旧藏，铭记此恩',
                    effect: {
                        flags: [GUIDE_STAGE_3],
                        items: ['book_fire_art', 'book_phantom_step', 'jade_ring'],
                        EXP: 90,
                        DAO: 2,
                        history: `${guideNpc.name}把压在箱底多年的旧玉简和一枚玉戒都交给了你，要你以后去更远的地方看看。`,
                    },
                },
                {
                    text: '只取一份身法，其余留给他',
                    effect: {
                        flags: [GUIDE_STAGE_3],
                        items: ['book_phantom_step'],
                        CHR: 2,
                        REP: 2,
                        history: `你没有把所有东西都收下，${guideNpc.name}看你的眼神也因此更加柔和。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}

function buildBrokerArc(engine: GameEngine, brokerNpc: WorldNPC, action: string): GameEvent | null {
    const affinity = brokerNpc.affinity || 0;

    if (!engine.state.flags.includes(BROKER_STAGE_1) && affinity >= 10 && ['INTERACT', 'EXPLORE', 'WORK'].includes(action) && Math.random() < 0.3) {
        return {
            id: `EVT_SPECIAL_BROKER_STAGE1_${brokerNpc.id}`,
            title: '后巷门路',
            content: `【${brokerNpc.name}】把你叫到坊市后巷，低声说自己认得几家不会把好货摆到明面上的摊子，问你敢不敢跟。`,
            choices: [
                {
                    text: '跟他去见见世面',
                    effect: {
                        flags: [BROKER_STAGE_1],
                        items: ['talisman_speed', 'spirit_shard'],
                        MONEY: -6,
                        history: `${brokerNpc.name}带你转进几条偏巷，你虽花了点钱，但也确实买到些外面少见的小玩意。`,
                    },
                },
                {
                    text: '只听门道，不急着买',
                    effect: {
                        flags: [BROKER_STAGE_1],
                        CHR: 1,
                        INT: 1,
                        history: `你没有急着出手，而是把几条坊市里的暗规矩都牢牢记了下来。`,
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (engine.state.flags.includes(BROKER_STAGE_1) && !engine.state.flags.includes(BROKER_STAGE_2) && affinity >= 20 && action === 'EXPLORE' && Math.random() < 0.26) {
        return {
            id: `EVT_SPECIAL_BROKER_STAGE2_${brokerNpc.id}`,
            title: '旧仓盘货',
            content: `【${brokerNpc.name}】说有人想处理一批压仓旧货，喊你一起去掌眼。仓里灰尘扑面，却像真藏着些能用的东西。`,
            choices: [
                {
                    text: '帮忙估价分成',
                    effect: {
                        flags: [BROKER_STAGE_2],
                        MONEY: 16,
                        items: ['book_sword_art'],
                        history: `你替${brokerNpc.name}把旧货一件件盘清，对方很守规矩地分了你一份，还额外送你一卷旧剑诀。`,
                    },
                },
                {
                    text: '挑件实用之物留给自己',
                    effect: {
                        flags: [BROKER_STAGE_2],
                        items: ['cloth_armor', 'healing_pill_small'],
                        REP: 1,
                        history: `你没拿灵石，而是从旧仓里挑了两件当下最用得上的东西。`,
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (engine.state.flags.includes(BROKER_STAGE_2) && !engine.state.flags.includes(BROKER_STAGE_3) && affinity >= 34 && engine.state.realm_idx >= 1 && ['EXPLORE', 'INTERACT'].includes(action) && Math.random() < 0.24) {
        return {
            id: `EVT_SPECIAL_BROKER_STAGE3_${brokerNpc.id}`,
            title: '暗拍来帖',
            content: `【${brokerNpc.name}】深夜递来一张烫金帖子，说有场只认熟人的小型暗拍愿意放你进去见见世面。`,
            choices: [
                {
                    text: '跟他入场试试运气',
                    effect: {
                        flags: [BROKER_STAGE_3],
                        MONEY: -20,
                        items: ['book_fire_art', 'jade_ring', 'healing_pill_small'],
                        REP: 2,
                        history: `你跟着${brokerNpc.name}进了暗拍，虽然花了些钱，但确实把几样不错的货带了回来。`,
                    },
                },
                {
                    text: '谢他好意，只问消息',
                    effect: {
                        flags: [BROKER_STAGE_3],
                        INT: 2,
                        DAO: 1,
                        history: `${brokerNpc.name}把几条关于坊市、秘境和宗门流向的风声都告诉了你，省下钱也开了眼界。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}

export function checkSpecialNpcEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';

    const guideNpc = getNpcByFlag(engine, GUIDE_FLAG_PREFIX);
    if (guideNpc && guideNpc.currentLocationId === engine.state.location) {
        const guideEvent = buildGuideArc(engine, guideNpc, action);
        if (guideEvent) return guideEvent;
    }

    const brokerNpc = getNpcByFlag(engine, BROKER_FLAG_PREFIX);
    if (brokerNpc && brokerNpc.currentLocationId === engine.state.location) {
        const brokerEvent = buildBrokerArc(engine, brokerNpc, action);
        if (brokerEvent) return brokerEvent;
    }

    const brokerSeed = getLocalBrokerSeed(engine);
    if (
        brokerSeed
        && !engine.state.flags.includes(BROKER_STAGE_1)
        && ['INTERACT', 'EXPLORE', 'WORK'].includes(action)
        && Math.random() < 0.22
    ) {
        return {
            id: `EVT_SPECIAL_BROKER_INTRO_${brokerSeed.id}`,
            title: '偏巷熟客',
            content: `你又在坊市边角碰见【${brokerSeed.name}】。对方认出你后，忽然压低声音，说自己知道几条外人不熟的买卖门路。`,
            choices: [
                {
                    text: '听他把话说完',
                    effect: {
                        flags: [`${BROKER_FLAG_PREFIX}${brokerSeed.id}`, BROKER_STAGE_1],
                        CHR: 1,
                        MONEY: 4,
                        items: ['spirit_shard'],
                        history: `${brokerSeed.name}见你嘴严，便把偏巷几条真正能淘到东西的路数都告诉了你。`,
                    },
                },
                {
                    text: '只记住这个人情',
                    effect: {
                        flags: [`${BROKER_FLAG_PREFIX}${brokerSeed.id}`, BROKER_STAGE_1],
                        REP: 1,
                        INT: 1,
                        history: `你没有立刻跟单，只先把${brokerSeed.name}这条线和他提过的几处摊子都记在心里。`,
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    return null;
}
