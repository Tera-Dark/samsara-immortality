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
    },
    {
        id: "EVT_QI_ANCIENT_RUIN",
        title: "上古遗迹现世",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'GTE', value: 20 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.04,
        content: "你在一处荒原之上，忽然天地变色，狂风大作。地底轰然裂开一道深渊，深渊下方隐隐显露出一座流转着古老阵纹的庞大地下宫殿。这是一个未被发掘的上古遗迹！入口处迷雾重重，散发着骇人的威压。",
        choices: [
            {
                text: "富贵险中求！果断闯入",
                conditions: [{ type: 'STAT', target: 'WIL', op: 'GTE', value: 30 }, { type: 'STAT', target: 'LUCK', op: 'GTE', value: 15 }],
                effect: {
                    items: ['foundation_pill', 'spirit_herb'],
                    MONEY: 300,
                    EXP: 500,
                    DAO: 10,
                    history: "你顶着惊人的威压冲入遗迹外围，凭着过人气运避开重重杀阵，夺得了几件珍稀法宝和丹药，满载而归！"
                }
            },
            {
                text: "富贵险中求！(底蕴不足)",
                conditions: [{ type: 'STAT', target: 'WIL', op: 'LT', value: 30 }],
                effect: {
                    HP: -80,
                    MOOD: -50,
                    history: "你刚踏入迷雾，便被上古杀阵的一丝罡风刮中，肉身几近崩溃，只能仓皇逃出，修养数载才堪堪稳住伤势。"
                }
            },
            {
                text: "冷静旁观，寻找遗漏",
                conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 25 }],
                effect: {
                    MONEY: 100,
                    INT: 5,
                    DAO: 3,
                    history: "你没有被贪欲冲昏头脑。在各大宗门高手赶来火拼时，你聪明地在周边捡拾被破阵余波震飞的零星宝物，并发了一笔小财。"
                }
            },
            {
                text: "绝不涉险，立刻远遁",
                effect: {
                    WIL: 1,
                    MOOD: 10,
                    history: "这种大机缘往往伴随着天大的杀机。你头也不回地御剑离开，虽然错过了宝物，但保全了性命。"
                }
            }
        ]
    },
    {
        id: "EVT_QI_CULTIVATION_INSIGHT",
        title: "吐纳有感",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'CULTIVATE' }
        ],
        probability: 0.12,
        content: "你在一呼一吸间忽然察觉周身灵气流转的细微差异，原本晦涩的经脉路线似乎一下子清晰起来。",
        choices: [
            { text: "顺势冲开经脉", effect: { EXP: 180, MP: 20, history: "你借着这缕感悟一鼓作气冲开了数处细小阻滞，修炼速度明显快了不少。" } },
            { text: "缓缓记下体悟", effect: { INT: 2, WIL: 1, history: "你没有贪功冒进，而是把这份灵感一点点沉淀为自己的根基。" } }
        ]
    },
    {
        id: "EVT_QI_MARKET_FIND",
        title: "旧摊奇货",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'GTE', value: 14 }
        ],
        probability: 0.08,
        content: "坊市角落有个无人问津的旧摊，摊主懒洋洋地靠着柱子打盹。几件不起眼的旧物里似乎藏着点门道。",
        choices: [
            { text: "买下那枚残旧玉简", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 12 }], effect: { MONEY: -12, items: ['book_fire_art'], history: "你擦去玉简上的灰尘，竟得到一门粗浅却实用的火法。" } },
            { text: "挑一张保命符箓", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 8 }], effect: { MONEY: -8, items: ['talisman_armor', 'talisman_speed'], history: "虽然只是低阶符箓，但对初入仙途的你来说已颇为实用。" } },
            { text: "只看不买", effect: { INT: 1, history: "你和摊主闲聊了几句，学到不少辨认旧物真伪的门道。" } }
        ]
    },
    {
        id: "EVT_QI_HELP_FELLOW",
        title: "同行散修",
        conditions: [
            { type: 'REALM', op: 'EQ', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.1,
        content: "你在野外碰到一名受伤的散修，对方气息紊乱、法袍染血，却依旧紧紧护着怀里的包裹。",
        choices: [
            { text: "出手相助", effect: { KARMA: 5, items: ['healing_pill_small', 'spirit_herb'], history: "你替他止血包扎，对方临走前送了你一些草药和疗伤丹药作为谢礼。" } },
            { text: "交换资源各取所需", conditions: [{ type: 'STAT', target: 'CHR', op: 'GTE', value: 12 }], effect: { MONEY: 15, items: ['iron_sword'], history: "你与对方做了一笔公平交易，用随身杂物换来一柄勉强可用的飞剑胚子。" } },
            { text: "谨慎离开", effect: { WIL: 1, history: "你不愿贸然卷入他人的因果，略作观察后便悄然离去。" } }
        ]
    },
    {
        id: "EVT_QI_NIGHT_MARKET",
        title: "夜坊灯火",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'GTE', value: 16 }
        ],
        probability: 0.08,
        content: "夜幕降临后，坊市深巷里另有一层热闹。灯笼低垂，人声压得极轻，摆在摊上的东西却明显比白日更有意思。",
        choices: [
            { text: "买一件趁手护具", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 20 }], effect: { MONEY: -20, items: ['cloth_armor'], history: "你淘到一件勉强合身的护具，虽然不是法器，却能实打实保命。" } },
            { text: "打听秘境传闻", effect: { INT: 1, DAO: 1, REP: 1, history: "你在夜坊听来不少真假难辨的秘境消息，虽未必全真，却拓宽了眼界。" } },
            { text: "顺手捡漏", conditions: [{ type: 'STAT', target: 'LUCK', op: 'GTE', value: 12 }], effect: { items: ['spirit_shard', 'spirit_shard', 'spirit_shard', 'bigu_pill'], history: "你在一堆杂物里翻出几枚灵石碎片和一瓶便宜却实用的辟谷丹。" } }
        ]
    },
    {
        id: "EVT_QI_SWORD_REPAIR_STALL",
        title: "旧剑摊",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'GTE', value: 14 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.09,
        content: "坊市边角有个替人修补飞剑的老修士，摊上堆满断剑、旧玉简和没人认领的护腕，像是专给散修捡漏的地方。",
        choices: [
            {
                text: "买下带剑意的旧玉简",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 15 }],
                effect: { MONEY: -15, items: ['book_sword_art'], history: "你挑中的旧玉简剑意未散，虽然残缺，却足够你入门御剑法。" }
            },
            {
                text: "帮他打下手换报酬",
                effect: { MONEY: 8, items: ['iron_sword'], INT: 1, history: "你替老修士分拣断剑、擦拭法器，临走时换到一柄还能用的精铁剑。" }
            },
            {
                text: "讨教身法避锋",
                conditions: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 16 }],
                effect: { items: ['book_phantom_step'], SPD: 1, history: "老修士见你步子轻，指点了几句卸力诀窍，还把一份旧身法拓本送给了你。" }
            }
        ]
    },
    {
        id: "EVT_QI_FOGGY_MARSH",
        title: "雾沼异动",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.08,
        content: "你穿过低洼湿地时，四周雾气忽然凝而不散，水面下像有什么东西正在缓缓抬头。",
        choices: [
            {
                text: "强行破雾杀过去",
                effect: {
                    history: "你催动真气驱散身前水雾，一道带着湿冷腥气的灵体朝你扑来。"
                },
                combat: {
                    type: 'WILD',
                    enemy: { ...ENEMIES['marsh_spirit'] }
                }
            },
            {
                text: "沿边缘搜刮灵材就退",
                effect: { items: ['spirit_herb', 'spirit_shard'], MONEY: 12, history: "你没深入雾沼，只在外围搜到些零散灵材，见好就收。" }
            },
            {
                text: "借风势迅速脱身",
                effect: { SPD: 1, WIL: 1, history: "你判断此地不宜久留，立刻运转身法抽身离去，反而磨炼了自己的步法。" }
            }
        ]
    },
    {
        id: "EVT_QI_WANDERING_BLADE",
        title: "刀客拦路",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'GTE', value: 16 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.07,
        content: "山道尽头，一个提刀散修靠在古松下打量你许久，忽然笑说正缺个试刀的人。",
        choices: [
            {
                text: "应战试试成色",
                effect: {
                    history: "你也不退让，当即亮出兵刃，准备拿这一战试试自己近来的修行成果。"
                },
                combat: {
                    type: 'WILD',
                    enemy: { ...ENEMIES['wandering_blade'] }
                }
            },
            {
                text: "丢几块灵石消灾",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 20 }],
                effect: { MONEY: -20, MOOD: -5, history: "你不想在山路上平白消耗，干脆破财消灾，对方也懒得继续纠缠。" }
            },
            {
                text: "记下他的招路再退",
                effect: { INT: 1, SPD: 1, history: "你没有硬接，而是远远观察对方的站姿与拔刀节奏，暗自记下不少细节。" }
            }
        ]
    },
    {
        id: "EVT_QI_RUINED_CAMP",
        title: "荒营余烬",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.09,
        content: "你在山坳里发现一处刚熄不久的营地，火堆还带着温度，四周却空无一人，像是有人仓促撤离。",
        choices: [
            {
                text: "搜查还能用的补给",
                effect: { items: ['healing_pill_small', 'spirit_shard'], MONEY: 8, history: "你在营地角落翻到些散碎补给和遗落灵石，看来上一批人走得确实匆忙。" }
            },
            {
                text: "顺着脚印追查去向",
                effect: { EXP: 45, INT: 1, history: "你沿着混乱脚印追出一段路，虽没追上人，却借此熟悉了这片山地的气机流向。" }
            },
            {
                text: "只在远处观察局势",
                effect: { REP: 1, WIL: 1, history: "你没有贸然靠近，而是默默记下营地痕迹和撤退方向，准备日后再做打算。" }
            }
        ]
    },
    {
        id: "EVT_QI_HERB_GARDEN_ERRAND",
        title: "灵药园杂务",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'WORK' }
        ],
        probability: 0.09,
        content: "你替人照看山脚灵药园时，发现不少活其实并不难，只是需要足够耐心和一点辨药眼力。",
        choices: [
            {
                text: "认真分拣药材",
                effect: { items: ['spirit_herb', 'spirit_herb'], INT: 1, MONEY: 10, history: "你把药性相近的灵草分得清清楚楚，药园主人高兴地给了你报酬。" }
            },
            {
                text: "顺手记下灵草长势",
                effect: { INT: 1, DAO: 1, EXP: 35, history: "你观察了整整半日灵草在晨昏间的变化，对灵气涨落又多懂了一层。" }
            },
            {
                text: "替主人巡园驱虫",
                effect: { WIL: 1, items: ['talisman_speed'], history: "你忙上忙下把整片药园照料妥当，主人干脆送了你一张平日自用的轻身符。" }
            }
        ]
    },
    {
        id: "EVT_QI_MARKET_MEDIATION",
        title: "坊市调停",
        conditions: [
            { type: 'REALM', op: 'GTE', value: 1 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.08,
        content: "你路过坊市时，正撞见两名散修因一件旧法器吵得面红耳赤，旁边摊主已经快被闹得做不成生意了。",
        choices: [
            {
                text: "出面讲和",
                conditions: [{ type: 'STAT', target: 'CHR', op: 'GTE', value: 12 }],
                effect: { REP: 2, MONEY: 12, history: "你几句话便把价码和来路理顺，双方居然都认了你的面子。" }
            },
            {
                text: "趁乱看看他们争的东西",
                effect: { INT: 1, items: ['spirit_shard', 'bigu_pill'], history: "你没卷进争执，反倒从旁边摊位捡了点便宜又实用的小东西。" }
            },
            {
                text: "默默记下坊市规矩",
                effect: { CHR: 1, DAO: 1, history: "你没有插手，只把众人的反应和坊市默认的规矩一一记在心里。" }
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
