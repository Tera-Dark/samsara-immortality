import type { GameEvent } from '../../../../types';
import { ENEMIES } from '../../../../data/enemies';

const _EVENTS_QI: GameEvent[] = [
    {
        id: "EVT_MARKET_SCAM_01",
        title: "坊市骗局",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 },
            { type: 'AGE', op: 'LTE', value: 30 },
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'EQ', value: true }
        ],
        probability: 0.1,
        content: "在坊市闲逛时，一个尖嘴猴腮的散修拉住你，神秘兮兮地向你推销半张残缺的‘上古丹方’。",
        choices: [
            {
                text: "花费 3 灵石买下",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 3 }], // Using MONEY proxy for now
                effect: { MONEY: -3, MOOD: -10, history: "你仔细一看，发现那残页上的墨迹都没干，被骗了！" }
            },
            {
                text: "冷眼拆穿 (需要高智商)",
                conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 20 }],
                effect: { MOOD: 5, REP: 2, history: "你当场拆穿了他的骗术，那人灰溜溜地跑了。" }
            },
            {
                text: "不理会",
                effect: { MOOD: 0 }
            }
        ]
    },
    {
        id: "EVT_SECT_TASK_RIVAL",
        title: "宗门争执",
        conditions: [
            { type: 'FLAG', target: 'SECT_MEMBER', op: 'EQ', value: true },
            { type: 'AGE', op: 'GTE', value: 12 }
        ],
        probability: 0.15,
        content: "在任务堂接取任务时，一个平日里飞扬跋扈的内门弟子看中了你手里的轻松任务，要求你让给他。",
        choices: [
            {
                text: "据理力争",
                effect: { REP: 10, MOOD: -5, STR: 1, history: "你义正言辞地拒绝了他，虽然得罪了人，但心中念头通达。" }
            },
            {
                text: "出剑教训 (需要实力)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 30 }],
                effect: { REP: 30, MOOD: 20, history: "你拔剑而起，一招便将其击退。修仙界，实力为尊！" }
            },
            {
                text: "忍气吞声",
                effect: { MOOD: -20, WIL: -1, history: "你低头让出了任务，道心蒙尘。" }
            }
        ]
    },
    {
        id: "EVT_AUCTION_INVITE",
        title: "地下拍卖会",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'STAT', target: 'MONEY', op: 'GTE', value: 50 }, // Has some cash
            { type: 'ROOT_STATE', target: 'location', op: 'EQ', value: 'CITY_ANY' } // Conceptual pseudo-check, we'll just let it proc randomly for now
        ],
        probability: 0.05,
        content: "你在茶馆休息时，掌柜的塞给你一块黑木牌，低声说今晚有场特殊的地下交易。",
        choices: [
            {
                text: "前去开眼界",
                effect: {
                    MONEY: -20,
                    items: ['spirit_herb'],
                    history: "你花高价拍下了一株年份不错的灵草，心疼不已。"
                }
            },
            {
                text: "黑吃黑 (危险)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 50 }],
                effect: {
                    MONEY: 100,
                    KARMA: -10,
                    history: "你尾随一名拍得宝物的修士，将其截杀，大赚一笔。"
                }
            },
            {
                text: "不去凑热闹",
                effect: { MOOD: 0 }
            }
        ]
    },
    {
        id: "EVT_DEMONIC_WHISPER",
        title: "魔音乱耳",
        conditions: [
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'CULTIVATE' },
            { type: 'REALM', op: 'GTE', value: 1 }
        ],
        probability: 0.08,
        content: "修炼时，耳边仿佛传来若有若无的靡靡之音，引诱你尝试一种捷径功法。",
        choices: [
            {
                text: "顺从而学",
                effect: {
                    EXP: 300,
                    KARMA: -20,
                    stats: { MAX_HP: -10 },
                    history: "你贪图进境神速，偷练了不知名的魔功，气血却日渐亏空。"
                }
            },
            {
                text: "紧守灵台 (需要高意志)",
                conditions: [{ type: 'STAT', target: 'WIL', op: 'GTE', value: 20 }],
                effect: {
                    WIL: 2,
                    MOOD: 10,
                    history: "你抱元守一，斩断了魔念，心境更加圆满。"
                }
            },
            {
                text: "强行中断",
                effect: { HP: -20, history: "你强行打断修炼，吐出一口心血，受了点内伤。" }
            }
        ]
    },
    {
        id: "EVT_SUDDEN_RAIN",
        title: "灵雨降临",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'STAT', target: 'LUCK', op: 'GTE', value: 10 }
        ],
        probability: 0.05,
        content: "天降甘霖，你惊讶地发现这雨水中竟然蕴含着淡淡的灵气！这是一场罕见的灵雨。",
        choices: [
            {
                text: "盘膝打坐吸收",
                effect: {
                    EXP: 100,
                    HP: 20,
                    history: "你贪婪地吸收着灵雨中的精华，修为精进。"
                }
            },
            {
                text: "拿玉瓶收集",
                effect: {
                    items: ['healing_pill_small'], // Assuming we can craft with it or it acts like one
                    history: "你收集了半瓶灵雨，权当做疗伤圣药备用。"
                }
            }
        ]
    },
    {
        id: "EVT_SECT_TOURNAMENT",
        title: "宗门大比",
        conditions: [
            { type: 'FLAG', target: 'SECT_MEMBER', op: 'EQ', value: true },
            { type: 'REALM', op: 'EQ', value: 1 } // Qi Refinement stage
        ],
        probability: 0.05, // Happens rarely
        content: "三年一度的宗门大比开始了，炼气期的弟子们摩拳擦掌，准备在擂台上一展身手。",
        choices: [
            {
                text: "全力以赴 (需要高属性)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 80 }, { type: 'STAT', target: 'DEF', op: 'GTE', value: 50 }],
                effect: {
                    items: ['foundation_pill'],
                    REP: 100,
                    MOOD: 50,
                    history: "你大发神威，连败数名劲敌，夺得炼气期大比头名！掌门亲自赏赐了一枚筑基丹！"
                }
            },
            {
                text: "重在参与",
                effect: {
                    MONEY: 30,
                    EXP: 50,
                    history: "你勉力打入前五十，获得了宗门的安慰奖，也算见识了各路英豪。"
                }
            },
            {
                text: "台下观摩",
                effect: {
                    INT: 2,
                    history: "你仔细观察了师兄弟们的斗法，对法术的运用有了新的领悟。"
                }
            }
        ]
    },
    {
        id: "EVT_SAVING_MORTAL",
        title: "凡人求救",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 }
        ],
        probability: 0.1,
        content: "路过世俗村落时，你看到几个山贼正在劫掠村民。",
        choices: [
            {
                text: "仙家手段惩戒",
                effect: {
                    KARMA: 10,
                    REP: 5,
                    history: "你略施小计唤出一团火焰，山贼便被吓得魂飞魄散，村民将你视为神仙下凡。"
                }
            },
            {
                text: "杀鸡儆猴",
                effect: {
                    KARMA: -5,
                    MOOD: -5,
                    history: "你毫不留情地斩杀了山贼首领，村民们虽然得救，但看你的眼神充满了恐惧。"
                }
            },
            {
                text: "冷眼旁观",
                effect: {
                    KARMA: -20,
                    history: "仙凡有别，你冷漠地看着一切发生，如同高高在上的神明。"
                }
            }
        ]
    },
    // [NEW EVENTS BELOW]
    {
        id: "EVT_QI_MYSTIC_REALM_ENTRANCE",
        title: "微型秘境",
        conditions: [
            { type: 'REALM', op: 'EQ', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.05,
        content: "你在荒野中偶然察觉到一丝灵气波动，拨开藤蔓后，发现一个隐蔽的空间裂隙，似乎通往某个微型秘境。",
        choices: [
            {
                text: "孤身闯入 (极其危险)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 50 }, { type: 'STAT', target: 'SPD', op: 'GTE', value: 30 }],
                effect: {
                    items: ['foundation_pill'],
                    EXP: 300,
                    HP: -30,
                    history: "你在秘境中九死一生，击杀了守护妖兽，竟意外获得了一枚筑基丹！但也受了重伤。"
                }
            },
            {
                text: "孤身闯入 (实力不足)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'LT', value: 50 }],
                effect: {
                    HP: -80,
                    stats: { MAX_HP: -10 },
                    MOOD: -30,
                    history: "你刚踏入秘境就被一阶巅峰妖兽袭击，拼尽底牌才逃出一条命，根基受损！"
                }
            },
            {
                text: "在入口处采摘灵草",
                effect: {
                    items: ['spirit_herb'],
                    MONEY: 20,
                    history: "你明智地没有深入，只在裂隙边缘采集了一些沾染秘境灵气的草药。"
                }
            }
        ]
    },
    {
        id: "EVT_QI_BEAST_TIDE_WARNING",
        title: "兽潮前兆",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.08,
        content: "你发现森林深处的低阶妖兽如同惊弓之鸟般向外围逃窜，地面传来隐隐的震动。那是传说中兽潮爆发的前兆！",
        choices: [
            {
                text: "挺身而出，逆流预警",
                effect: {
                    REP: 50,
                    KARMA: 30,
                    HP: -20,
                    history: "你冒着被妖兽践踏的风险，向附近的坊市发出预警，成了当地散修口中的英雄。"
                }
            },
            {
                text: "趁乱猎杀落单妖兽 (需要高战力)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 40 }],
                effect: {
                    MONEY: 80,
                    KARMA: -5,
                    history: "你胆大包天，在兽潮前夕逆流而上猎杀妖兽，大赚了一笔妖丹和材料。"
                }
            },
            {
                text: "立刻御剑(或神行)逃离",
                effect: {
                    SPD: 1,
                    WIL: -2,
                    history: "君子不立危墙之下，你立刻施展遁术逃之夭夭。"
                }
            }
        ]
    },
    {
        id: "EVT_QI_FELLOW_DAOIST_BETRAYAL",
        title: "道友的背刺",
        conditions: [
            { type: 'REALM', op: 'EQ', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.08,
        content: "你与一名临时结伴的散修共同探索一处古修士洞府，在分配宝物时，他突然暴起发难，一剑刺向你的后心！",
        choices: [
            {
                text: "反杀搜魂 (需要极高战力与神识)",
                conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 60 }, { type: 'STAT', target: 'INT', op: 'GTE', value: 30 }],
                effect: {
                    MONEY: 150,
                    EXP: 100,
                    KARMA: -5,
                    history: "你早有防备，不仅反杀了此人，还用狠辣手段搜刮了他身上的所有财物和功法残篇。"
                }
            },
            {
                text: "舍财保命 (高身法)",
                conditions: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 40 }],
                effect: {
                    MONEY: -30,
                    MOOD: -20,
                    history: "你拼着受损的代价施展血遁之术逃走，辛苦探索的宝物全落入了他人之手。"
                }
            },
            {
                text: "被重创抢劫",
                conditions: [{ type: 'STAT', target: 'SPD', op: 'LT', value: 40 }, { type: 'STAT', target: 'ATK', op: 'LT', value: 60 }],
                effect: {
                    HP: -50,
                    MONEY: -50,
                }
            }
        ]
    },
    {
        id: "EVT_QI_DEMON_WOLF_ENCOUNTER",
        title: "遭遇幽风魔狼",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.05,
        content: "你在密林深处探寻灵草时，灌木丛中突然蹿出一头体型如牛的幽风魔狼，它死死盯着你，口中隐隐凝聚着青色的风刃。",
        choices: [
            {
                text: "拔剑迎战！",
                effect: {
                    history: "你毫无惧色，运转体内真元，与魔狼展开了殊死搏杀！"
                },
                combat: {
                    type: 'WILD',
                    enemy: { ...ENEMIES['demon_wolf'] }
                }
            },
            {
                text: "丢弃灵草诱饵逃跑",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 10 }],
                effect: { MONEY: -10, MOOD: -5, history: "你忍痛丢下几株珍贵灵草，趁魔狼分心进食时施展遁术逃离了险境。" }
            }
        ]
    },
    {
        id: "EVT_QI_SECT_DISCIPLE_AMBUSH",
        title: "宗门劫杀",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.05,
        content: "一股带有强烈煞气的剑风袭来，一名身穿玄衣的黑煞宗外门弟子拦住了去路：“留下储物袋，饶你不死！”",
        choices: [
            {
                text: "除魔卫道！",
                effect: {
                    history: "你怒喝一声，祭出法器迎战魔门弟子！"
                },
                combat: {
                    type: 'WILD',
                    enemy: { ...ENEMIES['sect_disciple'] }
                }
            },
            {
                text: "破财免灾",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 50 }],
                effect: { MONEY: -50, MOOD: -20, history: "魔门弟子势大，你只能交出大半身家保命。" }
            }
        ]
    }
];

export const EVENTS_QI: GameEvent[] = _EVENTS_QI.map(e => ({
    ...e,
    conditions: [
        ...(e.conditions || []),
        { type: 'REALM', op: 'GT', value: 0 }
    ]
}));
