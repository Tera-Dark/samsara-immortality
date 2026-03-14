import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import { ENEMIES } from '../../../../data/enemies';

function hasFlag(engine: GameEngine, flag: string) {
    return engine.state.flags.includes(flag);
}

function hasMission(engine: GameEngine, missionId: string) {
    return engine.state.missions.active.some((mission) => mission.id === missionId);
}

export function checkStoryWorldPulseEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';

    if (
        hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && !hasFlag(engine, 'STORY:PULSE_REFUGEE_RUMOR')
        && ['WORK', 'INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.18
    ) {
        return {
            id: 'EVT_STORY_PULSE_REFUGEE_RUMOR',
            title: '流民与传闻',
            content: '坊间开始出现越来越多逃离黑潮边缘的人。有人把希望寄托在宗门，有人则说修士根本不会管凡人生死。',
            choices: [
                {
                    text: '出面安抚众人',
                    effect: {
                        flags: ['STORY:PULSE_REFUGEE_RUMOR'],
                        REP: 2,
                        CHR: 1,
                        history: '你没有许下太满的承诺，只是让这些惊惶的人知道，至少还有修士愿意站出来说话。',
                    },
                },
                {
                    text: '旁听他们的议论',
                    effect: {
                        flags: ['STORY:PULSE_REFUGEE_RUMOR'],
                        INT: 1,
                        DAO: 1,
                        history: '你默默听着那些流民的议论，第一次从凡人的角度重新审视了修行界的冷暖。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:BLACK_TIDE_OMEN')
        && !hasFlag(engine, 'STORY:SCOUT_ROUTE_DRAWN')
        && ['EXPLORE', 'INTERACT', 'WORK'].includes(action)
        && Math.random() < 0.17
    ) {
        return {
            id: 'EVT_STORY_PULSE_SCOUT_ROUTE',
            title: '前线斥候',
            content: '一队从黑潮边缘退回来的斥候带着残缺地图与伤员，正急着把沿途的裂隙、兽群和撤离路线送回后方。若这份路线图断在半路，后面会有更多人死得不明不白。',
            choices: [
                {
                    text: '护送斥候回营',
                    effect: {
                        flags: ['STORY:SCOUT_ROUTE_DRAWN'],
                        REP: 2,
                        WIL: 1,
                        EXP: 70,
                        items: ['talisman_speed'],
                        history: '你亲自护着斥候队穿过乱流地带，将伤员和图卷一并送回了营地。那张并不完整的地图，后来成了不少人能活着回来的依凭。',
                    },
                },
                {
                    text: '接手补完险地图录',
                    effect: {
                        flags: ['STORY:SCOUT_ROUTE_DRAWN'],
                        INT: 1,
                        DAO: 1,
                        EXP: 90,
                        history: '你把斥候沿途记下的地脉异动、黑潮回涌和怪影分布重新整理成图。很多时候，活命靠的不是蛮力，而是谁先看清局势。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && !hasFlag(engine, 'STORY:PULSE_SECT_DIVIDE')
        && engine.state.sect
        && ['INTERACT', 'CULTIVATE', 'WORK'].includes(action)
        && Math.random() < 0.16
    ) {
        return {
            id: 'EVT_STORY_PULSE_SECT_DIVIDE',
            title: '宗门并非铁板一块',
            content: '你所在宗门内部对是否真要全力投入黑潮之战意见不一。有人主张先保山门，有人则认为若只顾自保，迟早会被各个击破。',
            choices: [
                {
                    text: '站到主战一方',
                    effect: {
                        flags: ['STORY:PULSE_SECT_DIVIDE'],
                        REP: 3,
                        WIL: 1,
                        history: '你明确站到了主战一方，也因此得罪了一些求稳的人，但更多弟子开始真正把你视作敢担事的人。',
                    },
                },
                {
                    text: '先稳住内部人心',
                    effect: {
                        flags: ['STORY:PULSE_SECT_DIVIDE'],
                        CHR: 1,
                        INT: 1,
                        history: '你没有急于表态，而是先设法让争论不要演变成内耗。黑潮未至，宗门总不能先自己乱了阵脚。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && !hasFlag(engine, 'STORY:PULSE_LOOSE_CULTIVATORS')
        && ['INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.16
    ) {
        return {
            id: 'EVT_STORY_PULSE_LOOSE_CULTIVATORS',
            title: '散修的去留',
            content: '一批散修正在争论是否要加入曙光盟约。有人说那不过是宗门借机收编外力，有人则说若继续各扫门前雪，黑潮总会吞到自己头上。',
            choices: [
                {
                    text: '以自身经历说服他们',
                    effect: {
                        flags: ['STORY:PULSE_LOOSE_CULTIVATORS', 'STORY:SCATTERED_ALLIES'],
                        REP: 4,
                        CHR: 1,
                        history: '你把自己一路见过的人和事都说给这些散修听。最终，还是有几人决定跟你站到同一边。',
                    },
                },
                {
                    text: '尊重他们各自选择',
                    effect: {
                        flags: ['STORY:PULSE_LOOSE_CULTIVATORS'],
                        DAO: 1,
                        WIL: 1,
                        history: '你没有强求任何人。修行之人本就各有道路，只是黑潮来时，谁都要为自己的选择付账。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:ALLIANCE_PLEDGE')
        && !hasFlag(engine, 'STORY:SUPPLY_LINE_SECURED')
        && ['WORK', 'INTERACT', 'EXPLORE'].includes(action)
        && Math.random() < 0.15
    ) {
        return {
            id: 'EVT_STORY_PULSE_SUPPLY_LINE',
            title: '联盟粮道',
            content: '黑潮未至，后方先乱。几条通往前线的补给线被散修匪众与惊惶流民挤得寸步难行，药材、符纸和口粮都卡在半路。若再拖延，前线很快就会先垮。',
            choices: [
                {
                    text: '押送物资亲赴前线',
                    effect: {
                        flags: ['STORY:SUPPLY_LINE_SECURED'],
                        REP: 3,
                        WIL: 1,
                        EXP: 110,
                        items: ['healing_pill_small', 'qi_gathering_pill'],
                        history: '你随着补给队一路前压，途中连斩数拨趁乱劫掠之徒，总算把药材和符箓送进了最缺东西的地方。',
                    },
                },
                {
                    text: '重整沿途接应节点',
                    effect: {
                        flags: ['STORY:SUPPLY_LINE_SECURED'],
                        CHR: 1,
                        INT: 1,
                        EXP: 95,
                        MOOD: 4,
                        history: '你没有只顾眼前一车一箱，而是把沿路的接应人手、临时歇脚点和传讯方式都重新拢了一遍。补给终于不再是一阵风，而是一条线。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && !hasFlag(engine, 'STORY:PULSE_FIELD_REPORT')
        && ['INTERACT', 'WORK', 'EXPLORE'].includes(action)
        && Math.random() < 0.16
    ) {
        return {
            id: 'EVT_STORY_PULSE_FIELD_REPORT',
            title: '前线战报',
            content: '祭坛被毁后，各地前线开始传回混杂着喜讯与坏消息的战报。有人守住了山门，也有人整支队伍都没能回来。',
            choices: [
                {
                    text: '亲自整理这些战报',
                    effect: {
                        flags: ['STORY:PULSE_FIELD_REPORT'],
                        INT: 1,
                        REP: 2,
                        history: '你一条条整理着战报，越发清楚这场大劫背后从来不只有英雄，也有无数悄无声息就再没回来的普通人。',
                    },
                },
                {
                    text: '为战死者留一炷香',
                    effect: {
                        flags: ['STORY:PULSE_FIELD_REPORT'],
                        MOOD: 6,
                        DAO: 1,
                        history: '你在夜里为那些名字都未必留得下的人点了一炷香。修行路上很少有人停下来，但总该有人记得他们来过。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && !hasFlag(engine, 'STORY:RIFT_BEACON_LIT')
        && ['EXPLORE', 'INTERACT', 'CULTIVATE'].includes(action)
        && Math.random() < 0.15
    ) {
        return {
            id: 'EVT_STORY_PULSE_RIFT_BEACON',
            title: '裂口烽灯',
            content: '祭坛虽毁，归墟裂口周围的几处旧时代烽灯台却仍有残阵可用。只要点亮它们，前线便能更早察觉黑潮回涌的方向，也能为后续封裂争取出一线缓冲。',
            choices: [
                {
                    text: '登临烽台，亲手点灯',
                    effect: {
                        flags: ['STORY:RIFT_BEACON_LIT'],
                        REP: 3,
                        DAO: 1,
                        EXP: 150,
                        items: ['talisman_armor'],
                        history: '你顶着裂口外溢的恶意，一盏盏点亮那些本该沉寂的烽灯。黑夜仍深，但至少从此有人能更早看见它来。',
                    },
                },
                {
                    text: '校正封禁阵纹',
                    effect: {
                        flags: ['STORY:RIFT_BEACON_LIT'],
                        INT: 1,
                        WIL: 1,
                        EXP: 170,
                        history: '你没有急着出手，而是先把烽台旧阵与如今裂口气机重新对准。那套校正过的阵纹，后来为数处前线营地多争来了半炷香的预警。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:VOID_ALTAR_BROKEN')
        && !hasFlag(engine, 'STORY:VOID_HUNT_PURGED')
        && ['EXPLORE', 'INTERACT'].includes(action)
        && Math.random() < 0.14
    ) {
        return {
            id: 'EVT_STORY_PULSE_VOID_HUNT',
            title: '裂口猎杀',
            content: '祭坛崩毁之后，一批专门游走在裂口边缘的黑潮凶灵开始反过来猎杀前线斥候与伤员。若不把这股东西打掉，后续封裂时会被它们从背后狠狠咬上一口。',
            choices: [
                {
                    text: '循迹追杀凶灵',
                    combat: {
                        type: 'NPC',
                        enemy: { ...ENEMIES.void_reaver },
                        victoryFlags: ['STORY:VOID_HUNT_PURGED'],
                        victoryHistory: '你顺着残留恶意一路反追，把那头专食血气与恐惧的裂杀号钉死在裂口边缘。前线夜里的哭喊，终于少了一层。',
                    },
                    effect: {
                        REP: 2,
                        WIL: 1,
                        history: '你没再等联盟慢慢调人，而是直接沿着黑潮凶灵留下的痕迹追了出去。',
                    },
                },
                {
                    text: '先布阵护住伤员营地',
                    effect: {
                        flags: ['STORY:VOID_HUNT_MARKED'],
                        INT: 1,
                        CHR: 1,
                        EXP: 150,
                        history: '你没有急着追敌，而是先把伤员营地和撤退路线护住。哪怕凶灵未除，至少它这一次没能再顺势撕开口子。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && !hasFlag(engine, 'STORY:WAR_FORGE_KINDLED')
        && ['WORK', 'CULTIVATE', 'INTERACT'].includes(action)
        && Math.random() < 0.15
    ) {
        return {
            id: 'EVT_STORY_PULSE_WAR_FORGE',
            title: '战前炉火',
            content: '裂口被暂时封住后，各宗各地都在为最终决战紧急炼制符箓、整修法器、分配丹药。忙乱之中仍缺一个能镇住场面、把散乱心气重新拢成一股的人。',
            choices: [
                {
                    text: '入炉连夜炼制战备',
                    effect: {
                        flags: ['STORY:WAR_FORGE_KINDLED'],
                        REP: 4,
                        WIL: 1,
                        EXP: 190,
                        items: ['talisman_armor', 'talisman_speed'],
                        history: '你守在炉火前整整一夜，把能救命的符箓和应急法器一批批送出。真正的大战未必都在前线，很多胜负从后方就已开始分明。',
                    },
                },
                {
                    text: '召集诸修共议战法',
                    effect: {
                        flags: ['STORY:WAR_FORGE_KINDLED'],
                        DAO: 1,
                        WIL: 1,
                        MOOD: 6,
                        EXP: 210,
                        history: '你把各方修士叫到一处，把能用的阵、符、兵、药和退路都摆到明面上讲清。等人心不再乱的时候，战力才真正开始成形。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && !hasFlag(engine, 'STORY:STARFALL_CACHE_CLAIMED')
        && ['EXPLORE', 'CULTIVATE'].includes(action)
        && Math.random() < 0.14
    ) {
        return {
            id: 'EVT_STORY_PULSE_STARFALL_CACHE',
            title: '坠星古藏',
            content: '裂口封住后，一处被黑潮掩埋多年的古修遗藏重新露出轮廓。只是守在里面的并非寻常残魂，而是被旧时代星陨与黑潮一同扭曲出来的古怪残灵。',
            choices: [
                {
                    text: '强开古藏，斩除残灵',
                    combat: {
                        type: 'NPC',
                        enemy: { ...ENEMIES.starfall_remnant },
                        victoryFlags: ['STORY:STARFALL_CACHE_CLAIMED'],
                        victoryHistory: '你硬生生顶着古藏残禁斩灭了坠星残灵，顺势将那批沉睡多年的高阶资源一并带出。大战前终于又多了一口真正压箱底的东西。',
                    },
                    effect: {
                        DAO: 1,
                        WIL: 1,
                        history: '你知道这不是普通机缘，而是一场足以左右后续战力的夺取。',
                    },
                },
                {
                    text: '先抄录古藏阵图',
                    effect: {
                        flags: ['STORY:STARFALL_CACHE_MARKED'],
                        INT: 2,
                        EXP: 220,
                        items: ['pure_spirit_stone'],
                        history: '你没有急着拼命，而是先把外层阵图与残禁纹理尽可能记下。哪怕还未彻底取尽机缘，这份图录本身就已值回半条命。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasMission(engine, 'MQ_15_SLAY_THE_VOID_LORD')
        && hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && !hasFlag(engine, 'STORY:OVERSEER_SLAIN')
        && ['EXPLORE', 'INTERACT', 'CULTIVATE'].includes(action)
        && Math.random() < 0.13
    ) {
        return {
            id: 'EVT_STORY_PULSE_OVERSEER',
            title: '黑潮监军',
            content: '终局真正降临前，黑潮深处先派出了一尊负责整合诸处劫兵的监军。它不一定比古主更强，却足够把前线刚被拢起来的人心再一次碾碎。',
            choices: [
                {
                    text: '截杀监军，先断其势',
                    combat: {
                        type: 'NPC',
                        enemy: { ...ENEMIES.black_tide_overseer },
                        victoryFlags: ['STORY:OVERSEER_SLAIN'],
                        victoryHistory: '你在大战前先一步斩断了黑潮监军。那股原本要压向前线的劫兵之势，也因此硬生生断了一截。',
                    },
                    effect: {
                        REP: 4,
                        WIL: 1,
                        history: '你没有等它把战线彻底压垮，而是选择先把最能稳住黑潮秩序的那一环摘掉。',
                    },
                },
                {
                    text: '暂避锋芒，先递出军情',
                    effect: {
                        flags: ['STORY:OVERSEER_SPOTTED'],
                        INT: 1,
                        CHR: 1,
                        EXP: 260,
                        history: '你没有立刻迎战，而是第一时间把监军现身的时机、路线与压阵方式递回了联盟。很多时候，打赢一场仗先靠的是谁更早看见它怎么来。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasMission(engine, 'MQ_15_SLAY_THE_VOID_LORD')
        && hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && !hasFlag(engine, 'STORY:LAST_STAND_RESOLVE')
        && ['INTERACT', 'CULTIVATE', 'EXPLORE'].includes(action)
        && Math.random() < 0.18
    ) {
        return {
            id: 'EVT_STORY_PULSE_LAST_STAND',
            title: '战前问心',
            content: '越接近最后一战，越多的人开始在夜里沉默。有人写遗书，有人反复擦拭兵刃，也有人只是安静地看着天边。你忽然意识到，真正需要跨过去的，未必只是那位大敌。',
            choices: [
                {
                    text: '与众修定下死战章程',
                    effect: {
                        flags: ['STORY:LAST_STAND_RESOLVE'],
                        REP: 4,
                        WIL: 2,
                        EXP: 240,
                        history: '你把能说的话都说透了，把能安排的事都安排到了最后一层。等众人再抬头时，眼里的惶意已少了许多。',
                    },
                },
                {
                    text: '独自静坐，校准道心',
                    effect: {
                        flags: ['STORY:LAST_STAND_RESOLVE'],
                        DAO: 2,
                        MOOD: 8,
                        EXP: 260,
                        history: '你在大战前少有地彻底安静下来，把一路走来的执念、悔意与守护之心重新捋顺。等你再起身时，已不再迟疑。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    if (
        hasMission(engine, 'MQ_15_SLAY_THE_VOID_LORD')
        && hasFlag(engine, 'STORY:VOID_RIFT_SEALED')
        && !hasFlag(engine, 'STORY:FINAL_MUSTER')
        && ['INTERACT', 'CULTIVATE', 'EXPLORE'].includes(action)
        && Math.random() < 0.26
    ) {
        const helpedRefugees = hasFlag(engine, 'STORY:HELPED_REFUGEES');
        const scatteredAllies = hasFlag(engine, 'STORY:SCATTERED_ALLIES');
        const refugeSupport = hasFlag(engine, 'STORY:REFUGE_SUPPORT');
        const exposedOpportunist = hasFlag(engine, 'STORY:EXPOSED_OPPORTUNIST') || hasFlag(engine, 'STORY:TRACKED_OPPORTUNIST');
        const scoutRoutes = hasFlag(engine, 'STORY:SCOUT_ROUTE_DRAWN');
        const supplyLine = hasFlag(engine, 'STORY:SUPPLY_LINE_SECURED');
        const riftBeacon = hasFlag(engine, 'STORY:RIFT_BEACON_LIT');
        const warForge = hasFlag(engine, 'STORY:WAR_FORGE_KINDLED');
        const resolve = hasFlag(engine, 'STORY:LAST_STAND_RESOLVE');

        const rewardFlags = ['STORY:FINAL_MUSTER'];
        const items = ['healing_pill_small', 'qi_gathering_pill'];
        let history = '大战前夕，各方终于开始把能拿出来的力量都往你这里靠拢。你第一次真正看清，这一路并非只有你一个人走到了现在。';
        let rep = 6;
        let wil = 2;
        let mood = 8;

        if (helpedRefugees) {
            rewardFlags.push('STORY:FINAL_SUPPORT_REFUGEES');
            rep += 2;
            history += ' 那些曾被你帮过的流民想方设法送来药材与消息。';
        }
        if (scatteredAllies) {
            rewardFlags.push('STORY:FINAL_SUPPORT_SCATTERED');
            wil += 1;
            history += ' 几名你曾说服过的散修也赶来助阵，愿替你顶住侧翼。';
        }
        if (refugeSupport) {
            rewardFlags.push('STORY:FINAL_SUPPORT_SUPPLIES');
            mood += 4;
            history += ' 安顿点那边悄悄凑出了一批补给，说至少不想让前线的人再饿着去死。';
        }
        if (exposedOpportunist) {
            rewardFlags.push('STORY:FINAL_SUPPORT_INTEL');
            rep += 2;
            history += ' 你先前追出的那批黑心资源与线索，如今也化成了能真正派上用场的前线情报。';
        }
        if (scoutRoutes) {
            rewardFlags.push('STORY:FINAL_SUPPORT_SCOUTS');
            rep += 1;
            wil += 1;
            history += ' 那张你补完过的险地图录，被前线斥候反复誊抄，少了许多无谓折损。';
        }
        if (supplyLine) {
            rewardFlags.push('STORY:FINAL_SUPPORT_SUPPLY');
            mood += 3;
            items.push('healing_pill_small');
            history += ' 先前打通的补给线没有在大战前夜掉链子，丹药、符纸与口粮都比预想中更快送到了位。';
        }
        if (riftBeacon) {
            rewardFlags.push('STORY:FINAL_SUPPORT_BEACON');
            wil += 1;
            history += ' 裂口周边重燃的烽灯台不断传回预警，让各方调度终于能快上半拍。';
        }
        if (warForge) {
            rewardFlags.push('STORY:FINAL_SUPPORT_WAR_FORGE');
            rep += 1;
            items.push('talisman_armor');
            history += ' 战前炉火并未白燃，那些赶制出的符箓与法器，此刻正一件件落到真正需要的人手里。';
        }
        if (resolve) {
            rewardFlags.push('STORY:FINAL_SUPPORT_RESOLVE');
            wil += 1;
            mood += 2;
            history += ' 而你自己，也已经把最后一丝迟疑留在了大战之前。';
        }

        return {
            id: 'EVT_STORY_FINAL_MUSTER',
            title: '众生来援',
            content: '归墟古主真正投下意志前夜，各地修士、散修、被你帮过的人与被你说服的人都陆续汇拢。大战依旧凶险，但这一次，终于不再只是你独自向前。',
            choices: [
                {
                    text: '收下众人来意，整军备战',
                    effect: {
                        flags: rewardFlags,
                        REP: rep,
                        WIL: wil,
                        MOOD: mood,
                        items,
                        history,
                    },
                },
                {
                    text: '逐一回应每一份援手',
                    effect: {
                        flags: rewardFlags,
                        REP: rep + 1,
                        CHR: 2,
                        MOOD: mood + 2,
                        items,
                        history: `${history} 你没有把这些援手视作理所当然，而是亲自一一记下。无论此战结果如何，这些名字你都不会忘。`,
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}
