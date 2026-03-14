import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import type { WorldNPC } from '../../../../types/worldTypes';
import { generateName } from '../../../../utils/DataUtils';

const EARLY_COMPANION_FLAG_PREFIX = 'START_STORY:EARLY_COMPANION:';

function hasFlag(engine: GameEngine, flag: string) {
    return engine.state.flags.includes(flag);
}

function getEarlyCompanion(engine: GameEngine): WorldNPC | null {
    const flag = engine.state.flags.find((entry) => entry.startsWith(EARLY_COMPANION_FLAG_PREFIX));
    if (!flag) return null;
    const npcId = flag.slice(EARLY_COMPANION_FLAG_PREFIX.length);
    return engine.state.world.worldNPCs.find((npc) => npc.id === npcId && npc.alive) || null;
}

function ensureEarlyCompanion(engine: GameEngine) {
    const existing = getEarlyCompanion(engine);
    if (existing) {
        existing.currentLocationId = engine.state.location;
        existing.locationId = engine.state.location;
        existing.knownToPlayer = true;
        return existing;
    }

    const gender: 'M' | 'F' = Math.random() > 0.5 ? 'M' : 'F';
    const npc: WorldNPC = {
        id: `early_companion_${Math.random().toString(36).slice(2, 10)}`,
        name: generateName(gender),
        title: Math.random() > 0.5 ? '行脚少年' : '背篓少女',
        titles: [],
        realmIndex: 0,
        sectId: null,
        position: 'WANDERER',
        locationId: engine.state.location,
        currentLocationId: engine.state.location,
        personality: ['curious', 'warm', 'restless'],
        gender,
        age: 14 + Math.floor(Math.random() * 4),
        lifespan: 70,
        alive: true,
        alignment: 'NEUTRAL',
        combatPower: 8,
        knownToPlayer: true,
        playerFavor: 0,
        affinity: 18,
        relationships: [],
    };

    engine.state.world.worldNPCs.push(npc);
    engine.state.flags.push(`${EARLY_COMPANION_FLAG_PREFIX}${npc.id}`);
    return npc;
}

function backgroundOpening(engine: GameEngine) {
    if (engine.state.background === 'FARMER') {
        return {
            home: '家里只有几亩薄田与一间旧屋，日子清苦，却也总有热饭热汤。',
            hope: '父母只盼你平安长大，不必像他们一样把一生都熬在土里。',
        };
    }

    if (engine.state.background === 'RICH') {
        return {
            home: '你自幼衣食无忧，院中常有商旅来往，外面的消息也比常人灵通得多。',
            hope: '家里人盼你继承家业，也盼你将来能走得比镇上的任何人都远。',
        };
    }

    return {
        home: '你生在带着几分修行底蕴的家门，耳边从小就不缺关于宗门、灵气与大道的议论。',
        hope: '长辈看你的目光里带着期待，像是早已认定你终究要走上一条不同于凡俗的路。',
    };
}

export function checkStartStoryEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';
    const opening = backgroundOpening(engine);
    const noMethod = !engine.state.flags.includes('HAS_CULTIVATION_METHOD');
    const earlyCompanion = getEarlyCompanion(engine);

    if (
        engine.state.age <= 1
        && !hasFlag(engine, 'START_STORY:BIRTH_SCENE')
        && ['GROW', 'INTERACT', 'CULTIVATE'].includes(action)
    ) {
        return {
            id: 'EVT_START_BIRTH_SCENE',
            title: '人间第一夜',
            content: `你来到这世上的第一夜未必惊天动地。${opening.home}${opening.hope}`,
            choices: [
                {
                    text: '把这份温热记在心里',
                    effect: {
                        flags: ['START_STORY:BIRTH_SCENE'],
                        MOOD: 4,
                        CHR: 1,
                        history: '你尚不懂人世艰难，却已在襁褓之中记住了最初那一点灯火与人声。',
                    },
                },
                {
                    text: '眯眼望向屋外风声',
                    effect: {
                        flags: ['START_STORY:BIRTH_SCENE'],
                        INT: 1,
                        WIL: 1,
                        history: '婴孩的你尚不能言，却本能地对屋外的风雪与天地生出了一丝莫名的感应。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 3
        && engine.state.age <= 6
        && !hasFlag(engine, 'START_STORY:HOME_SCENE')
        && ['GROW', 'WORK', 'INTERACT'].includes(action)
        && Math.random() < 0.45
    ) {
        return {
            id: 'EVT_START_HOME_SCENE',
            title: '灯火与屋檐',
            content: engine.state.background === 'FARMER'
                ? '你已经能帮着家里做些零碎活计。灶火边、田埂上、雨夜漏风的窗纸后，都是你最早认识世界的地方。'
                : engine.state.background === 'RICH'
                    ? '你渐渐懂得，家里那些往来的笑脸不全都真诚，饭桌上的一句话也常藏着旁人听不出的盘算。'
                    : '你开始跟在长辈身后旁听一些修行界的闲谈。虽然大多还听不明白，但“宗门”“机缘”“劫数”这些词已经慢慢留在心里。',
            choices: [
                {
                    text: '认真把眼前日子过好',
                    effect: {
                        flags: ['START_STORY:HOME_SCENE'],
                        WIL: 1,
                        MOOD: 3,
                        history: '你逐渐明白，再大的前路也得先从眼下这一口饭、这一盏灯、这一家人开始。',
                    },
                },
                {
                    text: '开始悄悄想外面的事',
                    effect: {
                        flags: ['START_STORY:HOME_SCENE'],
                        INT: 1,
                        DAO: 1,
                        history: '你还年幼，却已经不满足于只知道院墙以内的生活。心里的那扇门，比任何人想的都开得早。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 6
        && engine.state.age <= 9
        && !hasFlag(engine, 'START_STORY:FIRST_MARKET')
        && ['GROW', 'WORK', 'INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.4
    ) {
        return {
            id: 'EVT_START_FIRST_MARKET',
            title: '第一次见人间热闹',
            content: '你第一次真正跟着大人去了更热闹的地方。有人叫卖药草兵器，有人说书摆摊，也有人只靠一张嘴就让围观者掏出银钱。你第一次意识到，世上并不只有自家门口这一亩三分地。',
            choices: [
                {
                    text: '多听多看',
                    effect: {
                        flags: ['START_STORY:FIRST_MARKET'],
                        INT: 1,
                        CHR: 1,
                        history: '你安静记下那些讨价还价、察言观色与人情往来的细节，觉得这世道比书上讲的复杂得多。',
                    },
                },
                {
                    text: '只盯着那些奇异之物',
                    effect: {
                        flags: ['START_STORY:FIRST_MARKET'],
                        LUCK: 1,
                        DAO: 1,
                        history: '在吆喝与烟火里，你反倒最在意那些来历不明的旧物与传闻，总觉得其中藏着另一种人生。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 8
        && engine.state.age <= 12
        && !hasFlag(engine, 'START_STORY:IMMORTAL_RUMOR')
        && ['EXPLORE', 'INTERACT', 'STUDY_LIT', 'WORK'].includes(action)
        && Math.random() < 0.36
    ) {
        return {
            id: 'EVT_START_IMMORTAL_RUMOR',
            title: '第一次听闻仙踪',
            content: '有人说曾见过御剑而过的仙人，有人说那不过是酒后胡话。可你分明从那些残缺不全的传闻里，听见了比村镇日常更遥远也更锋利的东西。',
            choices: [
                {
                    text: '将此事记下',
                    effect: {
                        flags: ['START_STORY:IMMORTAL_RUMOR'],
                        DAO: 1,
                        INT: 1,
                        history: '你第一次认真把“修行”二字记在心底，并意识到自己迟早会去亲眼看看。',
                    },
                },
                {
                    text: '先把它当成故事',
                    effect: {
                        flags: ['START_STORY:IMMORTAL_RUMOR'],
                        MOOD: 3,
                        CHR: 1,
                        history: '你表面上只把这些当作茶余饭后的故事，心里却已悄悄给它们留了位置。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 10
        && !hasFlag(engine, 'START_STORY:LEAVE_HOME_HEART')
        && noMethod
        && ['EXPLORE', 'WORK', 'STUDY_LIT', 'INTERACT'].includes(action)
        && Math.random() < 0.3
    ) {
        return {
            id: 'EVT_START_LEAVE_HOME_HEART',
            title: '想离开的人',
            content: '你越来越频繁地站在村口、镇口或山路边往外看。你知道自己终究会离开熟悉的屋檐，去追某种尚未说清名字的东西。只是那一天究竟何时来，谁也不知道。',
            choices: [
                {
                    text: '把心思藏起来',
                    effect: {
                        flags: ['START_STORY:LEAVE_HOME_HEART'],
                        WIL: 1,
                        MOOD: 2,
                        history: '你没有把离开的念头说出口，只是学着先让自己更像一个真正能上路的人。',
                    },
                },
                {
                    text: '试着向家里人提起',
                    effect: {
                        flags: ['START_STORY:LEAVE_HOME_HEART'],
                        CHR: 1,
                        DAO: 1,
                        history: '你试着提起想去更远处看看。没人真拦你，但也没有人能替你决定这一生究竟该怎么走。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 11
        && engine.state.age <= 14
        && noMethod
        && hasFlag(engine, 'START_STORY:IMMORTAL_RUMOR')
        && !hasFlag(engine, 'START_STORY:WAYFARER')
        && ['EXPLORE', 'INTERACT'].includes(action)
        && Math.random() < 0.42
    ) {
        return {
            id: 'EVT_START_WAYFARER',
            title: '破桥边的游方客',
            content: '你在镇外破桥边遇见一名披旧蓑衣的游方客。他不卖药，不算命，只在桥下看水。你本想走开，却被他一句“想修行，先学会看路”留住了脚步。',
            choices: [
                {
                    text: '上前请教',
                    effect: {
                        flags: ['START_STORY:WAYFARER', 'START_STORY:OLD_TEMPLE_CLUE'],
                        INT: 1,
                        CHR: 1,
                        history: '游方客没有收你为徒，只告诉你山中有一座废庙，真正的门从来不写在门上。',
                    },
                },
                {
                    text: '记下这句话，先不多问',
                    effect: {
                        flags: ['START_STORY:WAYFARER', 'START_STORY:OLD_TEMPLE_CLUE'],
                        WIL: 1,
                        DAO: 1,
                        history: '你没有贸然纠缠，却把那句“真正的门从来不写在门上”牢牢记住，心里像被点了一下。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 12
        && engine.state.age <= 15
        && noMethod
        && hasFlag(engine, 'START_STORY:OLD_TEMPLE_CLUE')
        && !hasFlag(engine, 'START_STORY:OLD_TEMPLE_FOUND')
        && action === 'EXPLORE'
        && Math.random() < 0.5
    ) {
        return {
            id: 'EVT_START_OLD_TEMPLE_FOUND',
            title: '山中废庙',
            content: '你循着零碎线索进山，在藤蔓与断墙后找到一座半塌的旧庙。庙里香火早断，墙上却还残留着极淡的刻痕，像是有人故意留给后来者看的。',
            choices: [
                {
                    text: '先清理尘土，再慢慢辨认',
                    effect: {
                        flags: ['START_STORY:OLD_TEMPLE_FOUND'],
                        INT: 1,
                        WIL: 1,
                        history: '你没有急着乱碰，而是耐心拂去灰尘，从残缺字句里认出了几段吐纳法门的轮廓。',
                    },
                },
                {
                    text: '把整座庙仔细搜一遍',
                    effect: {
                        flags: ['START_STORY:OLD_TEMPLE_FOUND'],
                        LUCK: 1,
                        MONEY: 8,
                        history: '你在破败供桌后翻出几枚旧钱和一本受潮的残册，虽未立刻看懂，却知自己总算找对了地方。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 12
        && engine.state.age <= 16
        && noMethod
        && hasFlag(engine, 'START_STORY:OLD_TEMPLE_FOUND')
        && !hasFlag(engine, 'START_STORY:METHOD_OBTAINED')
        && ['STUDY_LIT', 'CULTIVATE', 'EXPLORE'].includes(action)
    ) {
        return {
            id: 'EVT_START_METHOD_OBTAINED',
            title: '残页成法',
            content: '你把废庙中带回的残页翻了又翻，又反复回想那游方客的话。某个深夜，窗外风声忽止，你终于将那些散乱句子拼成了一门粗浅却完整的吐纳法。',
            choices: [
                {
                    text: '今夜便试着入定',
                    effect: {
                        flags: ['START_STORY:METHOD_OBTAINED', 'HAS_CULTIVATION_METHOD', 'METHOD_CHANGCHUN'],
                        items: ['book_changchun'],
                        EXP: 40,
                        INT: 1,
                        DAO: 1,
                        history: '你第一次真正让灵气沿经络缓缓运行。《长春功》虽浅，却足够让你从此与凡俗岁月分道扬镳。',
                    },
                },
                {
                    text: '先把法门抄熟，再稳稳起步',
                    effect: {
                        flags: ['START_STORY:METHOD_OBTAINED', 'HAS_CULTIVATION_METHOD', 'METHOD_CHANGCHUN'],
                        items: ['book_changchun'],
                        WIL: 1,
                        CON: 1,
                        EXP: 25,
                        history: '你没有急功近利，而是先把《长春功》逐句吃透。待真正行功之时，心里反倒更定了几分。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 13
        && engine.state.age <= 17
        && hasFlag(engine, 'START_STORY:METHOD_OBTAINED')
        && !hasFlag(engine, 'START_STORY:FIRST_SPIRIT_SENSE')
        && action === 'CULTIVATE'
        && Math.random() < 0.45
    ) {
        return {
            id: 'EVT_START_FIRST_SPIRIT_SENSE',
            title: '第一次感到灵气',
            content: '你依着法门再一次入定。最初只是呼吸，随后却像有一缕极细的凉意从天地间落下，顺着鼻息与皮肤渗入体内。你知道，自己终于真正碰到了那道门。',
            choices: [
                {
                    text: '守住心神，不贪不躁',
                    effect: {
                        flags: ['START_STORY:FIRST_SPIRIT_SENSE'],
                        EXP: 60,
                        WIL: 1,
                        history: '你小心护住那一缕初得的灵气，没有让它散去。从这一刻起，你不再只是向往修行的人。',
                    },
                },
                {
                    text: '任由心中喜意翻涌',
                    effect: {
                        flags: ['START_STORY:FIRST_SPIRIT_SENSE'],
                        EXP: 50,
                        MOOD: 6,
                        CHR: 1,
                        history: '灵气入体的那一刻，你几乎压不住心头喜意。即便气息还有些乱，也足够让你记住这一步的分量。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        engine.state.age >= 14
        && engine.state.age <= 18
        && hasFlag(engine, 'START_STORY:METHOD_OBTAINED')
        && !hasFlag(engine, 'START_STORY:FIRST_JOURNEY')
        && ['EXPLORE', 'INTERACT'].includes(action)
        && Math.random() < 0.34
    ) {
        const companion = ensureEarlyCompanion(engine);
        return {
            id: 'EVT_START_FIRST_JOURNEY',
            title: '第一次真正上路',
            content: `你终于不再只是站在村口远望。收拾好干粮与旧衣后，你踏出了真正意义上的第一段远路。路上，你结识了同样年少却已常年在外走动的${companion.name}。对方背着旧行囊，像是比你更早一步学会了看世界。`,
            choices: [
                {
                    text: '向前走，不回头看',
                    effect: {
                        flags: ['START_STORY:FIRST_JOURNEY', 'UNLOCK_TRAVEL', 'START_STORY:EARLY_COMPANION_MET'],
                        WIL: 1,
                        SPD: 1,
                        history: `你第一次真正把故乡甩在身后，也记住了路上遇到的${companion.name}。从这天起，游历天下不再只是一个念头。`,
                    },
                },
                {
                    text: '先和对方交换一路见闻',
                    effect: {
                        flags: ['START_STORY:FIRST_JOURNEY', 'UNLOCK_TRAVEL', 'START_STORY:EARLY_COMPANION_MET'],
                        CHR: 1,
                        LUCK: 1,
                        history: `你与${companion.name}在路边坐了很久，互相讲各自听来的传闻与去过的地方。世界忽然就比过去宽了许多。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        earlyCompanion
        && earlyCompanion.currentLocationId === engine.state.location
        && hasFlag(engine, 'START_STORY:EARLY_COMPANION_MET')
        && !hasFlag(engine, 'START_STORY:EARLY_COMPANION_SCENE_1')
        && ['INTERACT', 'WORK', 'EXPLORE'].includes(action)
        && Math.random() < 0.26
    ) {
        return {
            id: `EVT_START_COMPANION_SCENE_1_${earlyCompanion.id}`,
            title: '路边分半个饼的人',
            content: `你又在路边碰见了${earlyCompanion.name}。对方正坐在石头上啃干饼，看见你后很自然地掰了一半递来，像你们本就该是会在江湖里反复碰见的人。`,
            choices: [
                {
                    text: '接过干饼，也讲讲自己的近况',
                    effect: {
                        flags: ['START_STORY:EARLY_COMPANION_SCENE_1'],
                        MOOD: 5,
                        CHR: 1,
                        history: `你与${earlyCompanion.name}在路边分食干粮，谈起各自这些日子的见闻，彼此都多了几分真实的熟络。`,
                    },
                },
                {
                    text: '问问对方最近可曾见过怪事',
                    effect: {
                        flags: ['START_STORY:EARLY_COMPANION_SCENE_1'],
                        INT: 1,
                        DAO: 1,
                        history: `${earlyCompanion.name}说近来山路边偶尔有不合时令的寒雾，这番话让你对脚下这片天地又多留了一个心眼。`,
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (
        earlyCompanion
        && earlyCompanion.currentLocationId === engine.state.location
        && hasFlag(engine, 'START_STORY:EARLY_COMPANION_SCENE_1')
        && !hasFlag(engine, 'START_STORY:EARLY_COMPANION_SCENE_2')
        && hasFlag(engine, 'START_STORY:FIRST_SPIRIT_SENSE')
        && ['INTERACT', 'CULTIVATE', 'EXPLORE'].includes(action)
        && Math.random() < 0.22
    ) {
        return {
            id: `EVT_START_COMPANION_SCENE_2_${earlyCompanion.id}`,
            title: '少年人的约定',
            content: `${earlyCompanion.name}看出你气息与从前不同，半真半假地问你是不是已经摸到修行的门槛。夜风里，对方忽然说，若有一日真走到更远的地方，希望还能听见你的消息。`,
            choices: [
                {
                    text: '约好以后在更大的地方再见',
                    effect: {
                        flags: ['START_STORY:EARLY_COMPANION_SCENE_2'],
                        REP: 1,
                        WIL: 1,
                        history: `你与${earlyCompanion.name}约好，若谁先走出这片地界，就替另一个人多看几眼世道。少年人的约定不值钱，却最容易让人记很久。`,
                    },
                },
                {
                    text: '送对方一枚灵石碎片作别',
                    effect: {
                        flags: ['START_STORY:EARLY_COMPANION_SCENE_2'],
                        MONEY: -1,
                        CHR: 1,
                        history: `你塞给${earlyCompanion.name}一点路费，对方先是一愣，随后郑重收下。你们之间那点浅薄交情，也因此慢慢有了分量。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}
