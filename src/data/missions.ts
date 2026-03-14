import type { Mission } from '../types/missionTypes';

export const MAIN_QUESTS: Mission[] = [
    {
        id: 'MQ_01_SURVIVAL',
        type: 'MAIN',
        title: '初临尘世',
        description: '你降生在这方世界，眼下最重要的不是长生，而是先安稳活下去。',
        minAge: 0,
        objectives: [
            { id: 'age_6', description: '活到 6 岁', type: 'AGE', target: 'AGE', requiredCount: 6, currentCount: 0 },
        ],
        rewards: {
            text: '平安长大',
            effect: { random_stats: { pool: ['STR', 'INT', 'CHR', 'LUCK', 'POT', 'CON'], totalAmount: 5 } },
        },
        nextMissionId: 'MQ_02_FOUNDATION',
    },
    {
        id: 'MQ_02_FOUNDATION',
        type: 'MAIN',
        title: '打熬根骨',
        description: '想在乱世中站稳，至少要先让自己有一项拿得出手的本事。',
        prereqMissions: ['MQ_01_SURVIVAL'],
        objectives: [
            { id: 'any_stat_12', description: '任意一项属性达到 12', type: 'STAT', target: 'ANY_12', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '正式踏上成长之路',
            effect: { flags: ['UNLOCK_TRAVEL'], WIL: 1, history: '你意识到自己已不再只是随波逐流的凡人。' },
        },
        nextMissionId: 'MQ_03_SEEK_TAO',
    },
    {
        id: 'MQ_03_SEEK_TAO',
        type: 'MAIN',
        title: '寻法问道',
        description: '江湖传闻中，总有真正的修行法门。你决定亲自把它找出来。',
        prereqMissions: ['MQ_02_FOUNDATION'],
        objectives: [
            { id: 'cultivation_method', description: '获得修行法门', type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '得见仙门一角',
            effect: {
                items: ['book_changchun'],
                INT: 1,
                history: '你终于摸到了一丝真正的修行门径，此后的人生也彻底不同了。',
            },
        },
        nextMissionId: 'MQ_04_QI_REFINEMENT',
    },
    {
        id: 'MQ_04_QI_REFINEMENT',
        type: 'MAIN',
        title: '炼气入门',
        description: '将感应到的灵气纳入体内，正式迈过凡人与修士之间的门槛。',
        prereqMissions: ['MQ_03_SEEK_TAO'],
        objectives: [
            { id: 'realm_1', description: '境界达到炼气', type: 'REALM', target: '1', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '真正踏入修行',
            effect: { flags: ['OFFICIAL_CULTIVATOR'], INT: 2, POT: 1 },
        },
        nextMissionId: 'MQ_05_FOUNDATION_PREP',
    },
    {
        id: 'MQ_05_FOUNDATION_PREP',
        type: 'MAIN',
        title: '筑基之资',
        description: '想要真正打下道基，筑基丹与稳定心境都不可或缺。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'foundation_pill', description: '获得筑基丹', type: 'INVENTORY', target: 'foundation_pill', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '为筑基做足准备',
            effect: {
                items: ['qi_gathering_pill', 'qi_gathering_pill', 'qi_gathering_pill'],
                MOOD: 5,
            },
        },
        nextMissionId: 'MQ_06_FOUNDATION_ESTABLISHMENT',
    },
    {
        id: 'MQ_06_FOUNDATION_ESTABLISHMENT',
        type: 'MAIN',
        title: '百日筑基',
        description: '成败在此一举。只要筑基成功，你才算真正有资格窥望更大的天地。',
        prereqMissions: ['MQ_05_FOUNDATION_PREP'],
        objectives: [
            { id: 'realm_2', description: '境界达到筑基', type: 'REALM', target: '2', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '道基初成',
            effect: {
                flags: ['FOUNDATION_ESTABLISHED'],
                WIL: 2,
                history: '道基落成后，你第一次真切感觉到寿元与命数都不再受凡俗轻易摆布。',
            },
        },
        nextMissionId: 'MQ_07_BLACK_TIDE_OMEN',
    },
    {
        id: 'MQ_07_BLACK_TIDE_OMEN',
        type: 'MAIN',
        title: '黑潮前兆',
        description: '筑基之后，你开始接触到修行界真正的暗流。有人提起北荒深处的黑潮，也有人提起一个曾让上古宗门覆灭的名字。',
        prereqMissions: ['MQ_06_FOUNDATION_ESTABLISHMENT'],
        objectives: [
            { id: 'black_tide_omen', description: '查明黑潮异象', type: 'FLAG', target: 'STORY:BLACK_TIDE_OMEN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '知晓大敌存在',
            effect: {
                REP: 3,
                DAO: 1,
                history: '你第一次意识到，未来要面对的敌人，可能并非某个修士或宗门，而是足以侵吞天地的东西。',
            },
        },
        nextMissionId: 'MQ_08_GOLDEN_CORE',
    },
    {
        id: 'MQ_08_GOLDEN_CORE',
        type: 'MAIN',
        title: '结丹为峰',
        description: '若想插手更大的风暴，你必须先拥有足够强的力量。',
        prereqMissions: ['MQ_07_BLACK_TIDE_OMEN'],
        objectives: [
            { id: 'realm_3', description: '境界达到金丹', type: 'REALM', target: '3', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '金丹大成',
            effect: {
                flags: ['GOLDEN_CORE_FORMED'],
                INT: 2,
                WIL: 2,
                history: '金丹凝成之后，你终于有资格站到更高处，去看清黑潮真正的走向。',
            },
        },
        nextMissionId: 'MQ_09_ALLIANCE_OF_DAWN',
    },
    {
        id: 'MQ_09_ALLIANCE_OF_DAWN',
        type: 'MAIN',
        title: '曙光盟约',
        description: '各宗与散修中的有识之士已开始私下结盟。你需要决定自己是否真的要卷入这场关乎众生的风暴。',
        prereqMissions: ['MQ_08_GOLDEN_CORE'],
        objectives: [
            { id: 'alliance_pledge', description: '加入曙光盟约', type: 'FLAG', target: 'STORY:ALLIANCE_PLEDGE', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '正式跻身抗劫前线',
            effect: {
                REP: 8,
                CHR: 1,
                history: '从这一刻起，你不再只是为自己修行，而是被卷入整个修行界的存亡之争。',
            },
        },
        nextMissionId: 'MQ_10_NASCENT_SOUL',
    },
    {
        id: 'MQ_10_NASCENT_SOUL',
        type: 'MAIN',
        title: '元婴出世',
        description: '盟约固然重要，可若你本身境界不足，也不过是棋盘上的一枚弃子。',
        prereqMissions: ['MQ_09_ALLIANCE_OF_DAWN'],
        objectives: [
            { id: 'realm_4', description: '境界达到元婴', type: 'REALM', target: '4', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '元婴既成',
            effect: {
                flags: ['NASCENT_SOUL_FORMED'],
                DAO: 2,
                history: '元婴成形之后，你的目光终于能越过眼前恩怨，看到更远处的大局。',
            },
        },
        nextMissionId: 'MQ_11_BREAK_VOID_ALTAR',
    },
    {
        id: 'MQ_11_BREAK_VOID_ALTAR',
        type: 'MAIN',
        title: '裂渊祭坛',
        description: '黑潮的扩散并非偶然。有人在替归墟古主铺路，而其中一座祭坛的线索，已经落到你手上。',
        prereqMissions: ['MQ_10_NASCENT_SOUL'],
        objectives: [
            { id: 'void_altar_broken', description: '摧毁裂渊祭坛', type: 'FLAG', target: 'STORY:VOID_ALTAR_BROKEN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '斩断黑潮支点',
            effect: {
                REP: 10,
                WIL: 2,
                history: '祭坛被毁后，黑潮第一次出现明显衰退，曙光盟约中的许多人也因此真正记住了你的名字。',
            },
        },
        nextMissionId: 'MQ_12_HUASHEN',
    },
    {
        id: 'MQ_12_HUASHEN',
        type: 'MAIN',
        title: '化神通天',
        description: '归墟古主尚未真正现身。若想在最终之战中不沦为陪衬，你必须先跨过化神这道天堑。',
        prereqMissions: ['MQ_11_BREAK_VOID_ALTAR'],
        objectives: [
            { id: 'realm_5', description: '境界达到化神', type: 'REALM', target: '5', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '化神有成',
            effect: {
                flags: ['HUASHEN_ASCENDED'],
                DAO: 2,
                INT: 2,
                history: '你终于拥有了可以直接触碰天地法则的力量，也真正有资格面见那位大敌。',
            },
        },
        nextMissionId: 'MQ_13_SEAL_THE_RIFT',
    },
    {
        id: 'MQ_13_SEAL_THE_RIFT',
        type: 'MAIN',
        title: '封镇归墟',
        description: '祭坛虽毁，裂口仍在。若不将其封住，黑潮迟早会卷土重来。',
        prereqMissions: ['MQ_12_HUASHEN'],
        objectives: [
            { id: 'void_rift_sealed', description: '封住归墟裂口', type: 'FLAG', target: 'STORY:VOID_RIFT_SEALED', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '黑潮暂退',
            effect: {
                REP: 12,
                MOOD: 8,
                history: '裂口被封后，天地间压抑许久的灵机终于重新流动起来，但你知道真正的终局还没有到。',
            },
        },
        nextMissionId: 'MQ_14_REFINE_VOID',
    },
    {
        id: 'MQ_14_REFINE_VOID',
        type: 'MAIN',
        title: '炼虚蓄势',
        description: '归墟古主不会容忍你继续成长。最终之战前，你必须再往前迈出一步。',
        prereqMissions: ['MQ_13_SEAL_THE_RIFT'],
        objectives: [
            { id: 'realm_6', description: '境界达到炼虚', type: 'REALM', target: '6', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '逼近终局',
            effect: {
                WIL: 3,
                DAO: 2,
                history: '当你踏入炼虚之后，归墟那边投来的恶意反而更清晰了。你知道，最后一战已经不远。',
            },
        },
        nextMissionId: 'MQ_15_SLAY_THE_VOID_LORD',
    },
    {
        id: 'MQ_15_SLAY_THE_VOID_LORD',
        type: 'MAIN',
        title: '斩落古主',
        description: '归墟古主终于自黑潮尽头投来真正的意志。若你不能胜，这方天地将再无安宁可言。',
        prereqMissions: ['MQ_14_REFINE_VOID'],
        objectives: [
            { id: 'void_lord_slain', description: '击败归墟古主', type: 'FLAG', target: 'STORY:VOID_LORD_SLAIN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '终结黑潮',
            effect: {
                REP: 50,
                DAO: 5,
                WIL: 5,
                history: '你在归墟尽头斩断了古主的意志，这场笼罩世界多年的黑潮终于被真正终结。',
            },
        },
    },
];

export const SIDE_QUESTS: Mission[] = [
    {
        id: 'SQ_01_HERB_GATHER',
        type: 'SIDE',
        title: '灵草采集',
        description: '采集一些灵草，既能换取灵石，也能为日后炼丹留点底子。',
        minAge: 6,
        objectives: [
            { id: 'herb_3', description: '持有 3 株灵草', type: 'INVENTORY', target: 'spirit_herb', requiredCount: 3, currentCount: 0 },
        ],
        rewards: {
            text: '换得一点修行资源',
            effect: { MONEY: 6, history: '你把灵草换成了灵石，也算给自己攒下一点起步家当。' },
        },
    },
    {
        id: 'SQ_02_MONSTER_HUNT',
        type: 'SIDE',
        title: '猎妖试手',
        description: '附近山林有低阶妖兽活动，正适合作为初期历练对象。',
        minAge: 10,
        objectives: [
            { id: 'monster_core_1', description: '持有 1 枚妖核', type: 'INVENTORY', target: 'monster_core', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '战后分得赏金',
            effect: { items: ['healing_pill_small'], MONEY: 10, history: '你带着妖核回来，村镇中的人看你的眼神也多了几分敬畏。' },
        },
    },
    {
        id: 'SQ_03_MERCHANT',
        type: 'SIDE',
        title: '市井门路',
        description: '修行离不开资源。哪怕不是成为商贾，多攒些灵石也总归没坏处。',
        minAge: 8,
        objectives: [
            { id: 'money_30', description: '灵石达到 30', type: 'STAT', target: 'MONEY_30', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '打通市井渠道',
            effect: { flags: ['UNLOCK_TRADE'], MONEY: 8, CHR: 1 },
        },
    },
    {
        id: 'SQ_04_BEFRIEND',
        type: 'SIDE',
        title: '结交同道',
        description: '修行路上，可靠的人脉有时比丹药还值钱。',
        minAge: 10,
        objectives: [
            { id: 'friend_1', description: '任意一位关系达到 60', type: 'STAT', target: 'INTIMACY_60', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '名声渐起',
            effect: { stats: { REP: 10 }, history: '你在周边修士中慢慢混出了些名声。' },
        },
    },
    {
        id: 'SQ_05_KNOWLEDGE',
        type: 'SIDE',
        title: '博观群书',
        description: '道理未必都写在仙家玉简里，凡俗书卷也自有积累。',
        minAge: 4,
        objectives: [
            { id: 'int_20', description: '悟性达到 20', type: 'STAT', target: 'INT_20', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '见识更广',
            effect: { stats: { INT: 3 }, items: ['book_changchun'], history: '大量阅读让你看待世界的方式也跟着变了。' },
        },
    },
];

export const SPECIAL_QUESTS: Mission[] = [
    {
        id: 'EQ_01_CATASTROPHE',
        type: 'EVENT',
        title: '天地将倾',
        description: '随着境界提升，你会越来越频繁地接触到黑潮扩散的痕迹。这已不仅是某个人的修行问题。',
        prereqMissions: ['MQ_07_BLACK_TIDE_OMEN'],
        objectives: [
            { id: 'see_black_tide', description: '查明黑潮前兆', type: 'FLAG', target: 'STORY:BLACK_TIDE_OMEN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '预感大劫将近',
            effect: { DAO: 1, WIL: 1 },
        },
    },
    {
        id: 'EQ_02_SECRET_REALM',
        type: 'EVENT',
        title: '秘境余烬',
        description: '黑潮扩张之际，许多沉寂多年的秘境也开始松动，危险与机缘一并浮现。',
        prereqMissions: ['MQ_08_GOLDEN_CORE'],
        objectives: [
            { id: 'secret_realm', description: '完成一次秘境挑战', type: 'EVENT', target: 'SECRET_REALM_CLEAR', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '带回秘境收获',
            effect: { EXP: 120, items: ['spirit_shard'], history: '你自秘境归来后，对黑潮下的世界也有了更多理解。' },
        },
    },
    {
        id: 'EQ_03_REFUGEES',
        type: 'EVENT',
        title: '黑潮下的活路',
        description: '修士可以谈大义，但总有人要先去管那些在灾劫里活不下去的人。',
        prereqMissions: ['MQ_07_BLACK_TIDE_OMEN'],
        functionPrereq: (state) => state.flags.includes('STORY:HELPED_REFUGEES') || state.flags.includes('STORY:REFUGE_SUPPORT'),
        objectives: [
            { id: 'refuge_support', description: '参与一次安置或援助', type: 'FLAG', target: 'STORY:REFUGE_SUPPORT', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '流民也会记住恩义',
            effect: { REP: 6, CHR: 1, MOOD: 6, history: '你也许救不了所有人，但至少让一部分人在这场黑潮里多撑住了几天。' },
        },
    },
    {
        id: 'EQ_04_SCATTERED_ALLIES',
        type: 'EVENT',
        title: '散修同盟',
        description: '若散修永远各自为战，那他们就永远只能在大势里被卷走。',
        prereqMissions: ['MQ_09_ALLIANCE_OF_DAWN'],
        functionPrereq: (state) => state.flags.includes('STORY:SCATTERED_ALLIES'),
        objectives: [
            { id: 'scattered_allies', description: '说服散修加入战线', type: 'FLAG', target: 'STORY:SCATTERED_ALLIES', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '多出一批可用之人',
            effect: { REP: 8, WIL: 2, history: '你让一些本该四散的人真正站到了一起，这种事本身就很难。' },
        },
    },
    {
        id: 'EQ_05_FINAL_MUSTER',
        type: 'EVENT',
        title: '大战前夕',
        description: '终局将至，过往所有善意、人脉、决断，都该在这一刻汇成真正可见的回响。',
        prereqMissions: ['MQ_14_REFINE_VOID'],
        functionPrereq: (state) => state.flags.includes('STORY:FINAL_MUSTER'),
        objectives: [
            { id: 'final_muster', description: '完成众生来援', type: 'FLAG', target: 'STORY:FINAL_MUSTER', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '以众生之意赴终局',
            effect: { REP: 12, MOOD: 10, WIL: 2, history: '直到大战前夜你才真正明白，修行路上的每一次停步与伸手，最后都会回到自己身上。' },
        },
    },
    {
        id: 'EQ_06_BLACK_TIDE_EMISSARY',
        type: 'EVENT',
        title: '黑潮使者',
        description: '真正可怕的并不只是归墟古主，还有那些在劫难里替它说话、替它开路的人。',
        prereqMissions: ['MQ_09_ALLIANCE_OF_DAWN'],
        functionPrereq: (state) => state.flags.includes('STORY:EMISSARY_STAGE_1'),
        objectives: [
            { id: 'emissary_slain', description: '解决黑潮使者', type: 'FLAG', target: 'STORY:EMISSARY_SLAIN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '拔除一枚暗钉',
            effect: { REP: 8, INT: 1, history: '黑潮最擅长先从人心里撕开口子。你拔掉的，不只是一个人。' },
        },
    },
    {
        id: 'EQ_07_FALLEN_ELDER',
        type: 'EVENT',
        title: '坠渊长老',
        description: '有些人不是生来就该站在归墟那边，但一旦滑落进去，往往比真正的敌人更让人难受。',
        prereqMissions: ['MQ_11_BREAK_VOID_ALTAR'],
        functionPrereq: (state) => state.flags.includes('STORY:FALLEN_STAGE_1'),
        objectives: [
            { id: 'fallen_elder_slain', description: '处理坠渊长老', type: 'FLAG', target: 'STORY:FALLEN_ELDER_SLAIN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '了却一桩旧痛',
            effect: { DAO: 2, WIL: 2, history: '你知道这件事不会有真正圆满的答案，但至少它不再继续恶化下去。' },
        },
    },
];

SPECIAL_QUESTS.push(
    {
        id: 'EQ_08_SUPPLY_LINE',
        type: 'EVENT',
        title: '战线续命',
        description: '真正拖垮联盟的，往往不是某一场大战，而是补给线先断、人心先散。把后方重新接上前线，本身就是中期最关键的战果之一。',
        prereqMissions: ['MQ_09_ALLIANCE_OF_DAWN'],
        functionPrereq: (state) => state.flags.includes('STORY:SUPPLY_LINE_SECURED'),
        objectives: [
            { id: 'supply_line', description: '打通联盟补给线', type: 'FLAG', target: 'STORY:SUPPLY_LINE_SECURED', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '前线终于等到补给',
            effect: { REP: 8, WIL: 1, EXP: 180, items: ['healing_pill_small'], history: '你让本该断掉的一条线重新接了起来。很多人的命，就是这样一点点续回来的。' },
        },
    },
    {
        id: 'EQ_09_RIFT_BEACON',
        type: 'EVENT',
        title: '裂口烽灯',
        description: '祭坛毁去之后，真正决定前线死伤的，开始变成预警与调度。重燃烽灯，意味着战局第一次真正能被提前看见。',
        prereqMissions: ['MQ_11_BREAK_VOID_ALTAR'],
        functionPrereq: (state) => state.flags.includes('STORY:RIFT_BEACON_LIT'),
        objectives: [
            { id: 'rift_beacon', description: '点亮裂口烽灯', type: 'FLAG', target: 'STORY:RIFT_BEACON_LIT', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '为封裂争来先机',
            effect: { REP: 8, DAO: 1, EXP: 240, items: ['talisman_armor'], history: '烽灯亮起之后，黑潮第一次不再总能抢先一步。' },
        },
    },
    {
        id: 'EQ_10_WAR_FORGE',
        type: 'EVENT',
        title: '战前炉火',
        description: '后期不是单纯堆数值，而是把一路积累的人、物、阵、符都组织成真正能打终局的一套战备。',
        prereqMissions: ['MQ_13_SEAL_THE_RIFT'],
        functionPrereq: (state) => state.flags.includes('STORY:WAR_FORGE_KINDLED'),
        objectives: [
            { id: 'war_forge', description: '完成大战战备整合', type: 'FLAG', target: 'STORY:WAR_FORGE_KINDLED', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '大战前的最后整军',
            effect: { REP: 10, WIL: 2, EXP: 320, items: ['talisman_speed', 'qi_gathering_pill'], history: '你把一盘散沙般的战前准备真正整成了可用的阵势，终局终于开始像一场能打的仗。' },
        },
    },
    {
        id: 'EQ_11_VOID_HUNT',
        type: 'EVENT',
        title: '裂口猎杀',
        description: '后期前线真正可怕的，除了大敌本身，还有那些专门收割伤员和斥候的黑潮猎杀号。把它们清掉，前线才有资格继续撑下去。',
        prereqMissions: ['MQ_11_BREAK_VOID_ALTAR'],
        functionPrereq: (state) => state.flags.includes('STORY:VOID_HUNT_PURGED'),
        objectives: [
            { id: 'void_hunt', description: '肃清裂口猎杀号', type: 'FLAG', target: 'STORY:VOID_HUNT_PURGED', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '前线夜色终于安静些了',
            effect: { REP: 9, WIL: 2, EXP: 380, items: ['major_heal_pill'], history: '你拔掉的是一只凶灵，更是一整层让前线人心持续溃散的恐惧。' },
        },
    },
    {
        id: 'EQ_12_STARFALL_CACHE',
        type: 'EVENT',
        title: '坠星古藏',
        description: '高境界之后，机缘不该只是普通掉落，而该是足以左右终局准备的古藏、残阵和危险守护者。',
        prereqMissions: ['MQ_13_SEAL_THE_RIFT'],
        functionPrereq: (state) => state.flags.includes('STORY:STARFALL_CACHE_CLAIMED'),
        objectives: [
            { id: 'starfall_cache', description: '夺得坠星古藏', type: 'FLAG', target: 'STORY:STARFALL_CACHE_CLAIMED', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '终局前多出一口底牌',
            effect: { DAO: 2, INT: 1, EXP: 520, items: ['pure_spirit_stone', 'ice_lotus'], history: '那座古藏沉睡多年，却偏偏在大战前醒来。你带走的不只是资源，还有一份旧时代留下的余火。' },
        },
    },
    {
        id: 'EQ_13_OVERSEER',
        type: 'EVENT',
        title: '斩监军',
        description: '真正的终局前，总该先有一场把战线气势重新拽回来的硬仗。黑潮监军就是这样的关口。',
        prereqMissions: ['MQ_14_REFINE_VOID'],
        functionPrereq: (state) => state.flags.includes('STORY:OVERSEER_SLAIN'),
        objectives: [
            { id: 'overseer', description: '击溃黑潮监军', type: 'FLAG', target: 'STORY:OVERSEER_SLAIN', requiredCount: 1, currentCount: 0 },
        ],
        rewards: {
            text: '大战前先折其锋',
            effect: { REP: 12, WIL: 2, EXP: 680, items: ['pure_spirit_stone', 'major_heal_pill'], history: '大战未启，你先让黑潮那边少了一根能撑住阵势的骨头。很多人的胆气，也因此重新稳了下来。' },
        },
    },
);

export const ALL_QUESTS: Mission[] = [...MAIN_QUESTS, ...SIDE_QUESTS, ...SPECIAL_QUESTS];
