import type { Mission } from '../types/missionTypes';

// ═══════════════════════════════════════════════════════════════
//  主线任务 (MAIN QUESTS)
// ═══════════════════════════════════════════════════════════════

export const MAIN_QUESTS: Mission[] = [
    {
        id: 'MQ_01_SURVIVAL',
        type: 'MAIN',
        title: '初临贵地',
        description: '你降生在这个世界，虽然还很弱小，但首先要做的就是活下去，健康成长。',
        minAge: 0,
        objectives: [
            { id: 'obj_age_6', description: '活到6岁', type: 'AGE', target: 'AGE', requiredCount: 6, currentCount: 0 }
        ],
        rewards: {
            text: '获得少量属性成长',
            effect: { stats: { STR: 2, CON: 2 } }
        },
        nextMissionId: 'MQ_02_FOUNDATION'
    },
    {
        id: 'MQ_02_FOUNDATION',
        type: 'MAIN',
        title: '打熬筋骨',
        description: '想要在这个残酷的世界生存，必须要有强健的体魄。通过习文习武，提升你的基础属性。',
        prereqMissions: ['MQ_01_SURVIVAL'],
        objectives: [
            { id: 'obj_attr_sum', description: '单项属性达到15', type: 'STAT', target: 'ANY_15', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '开启游历功能',
            effect: { flags: ['UNLOCK_TRAVEL'] }
        },
        nextMissionId: 'MQ_03_SEEK_TAO'
    },
    {
        id: 'MQ_03_SEEK_TAO',
        type: 'MAIN',
        title: '寻仙问道',
        description: '听闻世间有仙山。既然身体已长成，不妨开启【历练】，寻找那传说中的修仙功法。',
        prereqMissions: ['MQ_02_FOUNDATION'],
        objectives: [
            { id: 'obj_find_immortal', description: '获得修仙功法', type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '获得《长春功》与【下品灵石】x10',
            effect: {
                items: ['book_changchun'],
                history: '你在山洞深处找到了一卷残破的无名功法，旁边散落着几块发光的石头。'
            }
        },
        nextMissionId: 'MQ_04_QI_REFINEMENT'
    },
    {
        id: 'MQ_04_QI_REFINEMENT',
        type: 'MAIN',
        title: '突破炼气',
        description: '凡人寿元有限，唯有踏入修仙界，方能求得长生。在【行动】中不断【修炼】，尝试突破至炼气期。',
        prereqMissions: ['MQ_03_SEEK_TAO'],
        objectives: [
            { id: 'obj_realm_qi', description: '境界达到炼气期', type: 'REALM', target: '1', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '领悟天地灵气',
            effect: {
                flags: ['OFFICIAL_CULTIVATOR'],
                INT: 2,
                POT: 1
            }
        },
        nextMissionId: 'MQ_05_FOUNDATION_PREP'
    },
    {
        id: 'MQ_05_FOUNDATION_PREP',
        type: 'MAIN',
        title: '筑基准备',
        description: '炼气期只是修仙的第一步。想要筑基，不仅需要将修为推至瓶颈，还需要寻得传说中的【筑基丹】。去四处历练或参加城中拍卖吧。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'obj_get_foundation_pill', description: '获得筑基丹', type: 'INVENTORY', target: 'foundation_pill', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '获得黄龙丹x5辅助修炼',
            effect: {
                items: ['qi_gathering_pill', 'qi_gathering_pill', 'qi_gathering_pill', 'qi_gathering_pill', 'qi_gathering_pill']
            }
        },
        nextMissionId: 'MQ_06_FOUNDATION_ESTABLISHMENT'
    },
    {
        id: 'MQ_06_FOUNDATION_ESTABLISHMENT',
        type: 'MAIN',
        title: '百日筑基',
        description: '万事俱备，只欠东风。服下筑基丹，闭关冲击筑基期。此乃逆天改命之举，九死一生，务必保持心境平稳。',
        prereqMissions: ['MQ_05_FOUNDATION_PREP'],
        objectives: [
            { id: 'obj_realm_foundation', description: '境界达到筑基期', type: 'REALM', target: '2', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '寿元大增，脱胎换骨',
            effect: {
                flags: ['FOUNDATION_ESTABLISHED'],
                history: '突破成功！你感觉体内灵力如江河崩腾，寿元凭空增加了一百余载，真乃神仙中人！'
            }
        },
        nextMissionId: 'MQ_07_GOLDEN_CORE'
    },
    {
        id: 'MQ_07_GOLDEN_CORE',
        type: 'MAIN',
        title: '凝结金丹',
        description: '筑基之后，需将体内灵力凝聚为金丹。金丹大道，乃修仙界的分水岭，从此正式踏入修仙者之列。',
        prereqMissions: ['MQ_06_FOUNDATION_ESTABLISHMENT'],
        objectives: [
            { id: 'obj_realm_core', description: '境界达到金丹期', type: 'REALM', target: '3', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '金丹大成，寿元倍增',
            effect: {
                flags: ['GOLDEN_CORE_FORMED'],
                history: '丹田中一颗光芒万丈的金丹缓缓成型，天地间似有雷鸣回荡。'
            }
        },
        nextMissionId: 'MQ_08_NASCENT_SOUL'
    },
    {
        id: 'MQ_08_NASCENT_SOUL',
        type: 'MAIN',
        title: '元婴出窍',
        description: '金丹之上，便是元婴。需将金丹蜕变为元婴，此后神识大增，可以元婴出窍遨游天地。',
        prereqMissions: ['MQ_07_GOLDEN_CORE'],
        objectives: [
            { id: 'obj_realm_nascent', description: '境界达到元婴期', type: 'REALM', target: '4', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '元婴出窍，踏入上境',
            effect: {
                flags: ['NASCENT_SOUL_FORMED'],
                history: '一个微缩的你从头顶天灵盖飞出，这便是你的元婴，承载着你的意志与记忆。'
            }
        },
        nextMissionId: 'MQ_09_HUASHEN'
    },
    {
        id: 'MQ_09_HUASHEN',
        type: 'MAIN',
        title: '化神通天',
        description: '元婴圆满之后，需领悟天地法则，将元婴化为神念，从此呼风唤雨、移山填海不在话下。此为凡仙之间的最终跨越。',
        prereqMissions: ['MQ_08_NASCENT_SOUL'],
        objectives: [
            { id: 'obj_realm_huashen', description: '境界达到化神期', type: 'REALM', target: '5', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '化神大成，超凡入圣',
            effect: {
                flags: ['HUASHEN_ASCENDED'],
                history: '天降异象，五彩神光笼罩全身。你的元婴化为一道神念融入天地，从此掌握天地法则之力！'
            }
        }
    }
];

// ═══════════════════════════════════════════════════════════════
//  支线任务 (SIDE QUESTS)
// ═══════════════════════════════════════════════════════════════

export const SIDE_QUESTS: Mission[] = [
    {
        id: 'SQ_01_HERB_GATHER',
        type: 'SIDE',
        title: '灵草采集',
        description: '山中灵草遍地，若能采集一些，不仅可以卖到坊市换取灵石，还能用于炼制丹药。',
        minAge: 6,
        objectives: [
            { id: 'obj_herb_3', description: '采集灵草3株', type: 'INVENTORY', target: 'spirit_herb', requiredCount: 3, currentCount: 0 }
        ],
        rewards: {
            text: '获得下品灵石x5',
            effect: { history: '你将灵草交给了药铺老板，换来了几枚灵石。' }
        }
    },
    {
        id: 'SQ_02_MONSTER_HUNT',
        type: 'SIDE',
        title: '猎杀妖兽',
        description: '附近的山林中出现了低阶妖兽的踪迹，村中长老悬赏猎杀。这是历练和赚取资源的好机会。',
        minAge: 10,
        objectives: [
            { id: 'obj_kill_3', description: '击败3只妖兽', type: 'KILL', target: 'LOW_MONSTER', requiredCount: 3, currentCount: 0 }
        ],
        rewards: {
            text: '获得一阶妖丹x1 与 下品灵石x10',
            effect: { items: ['monster_core'], history: '你成功猎杀了妖兽，从尸体中取出了妖丹。' }
        }
    },
    {
        id: 'SQ_03_MERCHANT',
        type: 'SIDE',
        title: '行商之路',
        description: '坊市之间互通有无，贩运货物虽然辛苦，但利润颇丰。积累第一桶金，为修仙之路打好物质基础。',
        minAge: 8,
        objectives: [
            { id: 'obj_gold_100', description: '持有铜钱达到1000', type: 'STAT', target: 'COPPER_1000', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '获得【碎银】x5，解锁商贸系统',
            effect: { flags: ['UNLOCK_TRADE'], history: '你积累了不少财富，在坊市中渐渐有了名声。' }
        }
    },
    {
        id: 'SQ_04_BEFRIEND',
        type: 'SIDE',
        title: '以武会友',
        description: '江湖之中，以武会友是结交好友最快的方式。与他人切磋，提升自身实力的同时也能积攒人脉。',
        minAge: 10,
        objectives: [
            { id: 'obj_friend_1', description: '与1位NPC好感度达到80', type: 'STAT', target: 'INTIMACY_80', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '声望+10，获得随机丹药',
            effect: { stats: { REP: 10 }, history: '你的名声越来越响亮，已成为远近闻名的人物。' }
        }
    },
    {
        id: 'SQ_05_KNOWLEDGE',
        type: 'SIDE',
        title: '博览群书',
        description: '俗话说读万卷书行万里路，凡间的书籍虽不含仙法，但也能增长见识，提升悟性。',
        minAge: 4,
        objectives: [
            { id: 'obj_int_20', description: '悟性达到20', type: 'STAT', target: 'INT_20', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '悟性+3，获得卷轴',
            effect: { stats: { INT: 3 }, history: '你废寝忘食地阅读了大量典籍，感觉头脑更加清明了。' }
        }
    },
    {
        id: 'SQ_06_BODY_TEMPERING',
        type: 'SIDE',
        title: '铁布衫功',
        description: '体修之道，以肉身为根基。通过不断锻打，让皮肉筋骨脱胎换骨，纵使不修灵力也能刀枪不入。',
        minAge: 6,
        objectives: [
            { id: 'obj_str_25', description: '体魄达到25', type: 'STAT', target: 'STR_25', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '防御+15，体魄+5',
            effect: { stats: { STR: 5 }, history: '你感觉自己的皮肤坚硬如铁，普通刀剑已难以伤身。' }
        }
    },
    {
        id: 'SQ_07_FIRST_PILL',
        type: 'SIDE',
        title: '初识丹道',
        description: '修仙者对丹药的需求永无止境。学习基础炼丹术，能炼制培元丹等基础丹药，自给自足。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'obj_pill_flag', description: '学习炼丹术', type: 'FLAG', target: 'HAS_ALCHEMY', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '解锁炼丹功能，获得黄龙丹x3',
            effect: {
                flags: ['UNLOCK_ALCHEMY'],
                items: ['qi_gathering_pill', 'qi_gathering_pill', 'qi_gathering_pill'],
                history: '你从丹房老祖那里学会了最基础的炼丹之法。'
            }
        }
    },
    {
        id: 'SQ_08_EXPLORE_RUINS',
        type: 'SIDE',
        title: '探索遗迹',
        description: '传闻附近有上古修士留下的洞府遗迹，里面或许有珍贵的功法和宝物。当然，也可能有致命的禁制和守护妖兽。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'obj_explore_ruin', description: '成功探索1处遗迹', type: 'EVENT', target: 'RUIN_EXPLORED', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '获得随机法器或功法',
            effect: { history: '你在遗迹深处找到了一件残破的法器，虽然威力大不如前，但对你来说依然是至宝。' }
        }
    }
];

// ═══════════════════════════════════════════════════════════════
//  特殊任务 (SPECIAL / EVENT QUESTS)
// ═══════════════════════════════════════════════════════════════

export const SPECIAL_QUESTS: Mission[] = [
    {
        id: 'EQ_01_DESTINY',
        type: 'EVENT',
        title: '天降奇缘',
        description: '世间偶有天降奇缘，也许是一朵灵花，也许是一卷残篇。有缘人得之，可一步登天。此乃可遇不可求之事。',
        objectives: [
            { id: 'obj_destiny_event', description: '触发天降奇缘事件', type: 'EVENT', target: 'DESTINY_EVENT', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '随机获得稀有物品或大幅属性提升',
            effect: { history: '冥冥之中自有天意，你得到了意想不到的机缘。' }
        }
    },
    {
        id: 'EQ_02_TRIBULATION',
        type: 'EVENT',
        title: '心魔劫',
        description: '修炼至一定程度后，心中的执念会化为心魔。若不能战胜心魔，轻则境界倒退，重则走火入魔。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'obj_heart_demon', description: '战胜心魔', type: 'EVENT', target: 'DEFEAT_HEART_DEMON', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '意志+10，获得心境提升',
            effect: { stats: { WIL: 10 }, history: '心魔散去，你的道心愈发坚不可摧。' }
        }
    },
    {
        id: 'EQ_03_SECT_TRIAL',
        type: 'EVENT',
        title: '宗门大比',
        description: '每隔十年，宗门都会举办一次大比。表现优异者可获得宗门重点培养，获取珍贵的修炼资源。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'obj_sect_trial', description: '参加宗门大比并取得前三', type: 'EVENT', target: 'SECT_TRIAL_TOP3', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '宗门贡献+100，获得中品灵石x10',
            effect: { stats: { REP: 20 }, history: '你在宗门大比中表现出众，一时间名声大噪。' }
        }
    },
    {
        id: 'EQ_04_TREASURE_MAP',
        type: 'EVENT',
        title: '残破宝图',
        description: '你意外获得一张残破的宝图，上面标注了一处神秘之地。传说有上古强者陨落于此，留下了无尽的宝藏。',
        minAge: 15,
        objectives: [
            { id: 'obj_find_treasure', description: '根据宝图找到宝藏', type: 'EVENT', target: 'TREASURE_FOUND', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '获得大量灵石与随机装备',
            effect: { history: '在宝图标记之处，你发掘出了一个尘封已久的储物袋。' }
        }
    },
    {
        id: 'EQ_05_CATASTROPHE',
        type: 'EVENT',
        title: '天地浩劫',
        description: '预言中的天地浩劫即将降临，妖族大军蠢蠢欲动。修仙界需要每一位修士的力量来守护家园。此为大世事件，不可避免。',
        prereqMissions: ['MQ_06_FOUNDATION_ESTABLISHMENT'],
        objectives: [
            { id: 'obj_defend_realm', description: '参与守护修仙界', type: 'EVENT', target: 'DEFEND_REALM', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '声望大增，获得天地造化',
            effect: { stats: { REP: 50 }, history: '浩劫过后，你的名字被刻在了英雄碑上，传颂千古。' }
        }
    },
    {
        id: 'EQ_06_SECRET_REALM',
        type: 'EVENT',
        title: '秘境探险',
        description: '空间裂缝中偶尔会出现通往远古秘境的通道。秘境中灵气充沛、机缘无数，但危险同样致命。每次开启时间有限，需要做好充分准备。',
        prereqMissions: ['MQ_04_QI_REFINEMENT'],
        objectives: [
            { id: 'obj_secret_realm', description: '成功通关秘境', type: 'EVENT', target: 'SECRET_REALM_CLEAR', requiredCount: 1, currentCount: 0 }
        ],
        rewards: {
            text: '获得秘境宝物与修为大增',
            effect: { history: '你从秘境中全身而退，收获颇丰，修为更是精进了一大截。' }
        }
    }
];

// ═══════════════════════════════════════════════════════════════
//  全部任务汇总
// ═══════════════════════════════════════════════════════════════

export const ALL_QUESTS: Mission[] = [...MAIN_QUESTS, ...SIDE_QUESTS, ...SPECIAL_QUESTS];
