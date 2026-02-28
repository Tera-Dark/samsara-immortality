import type { GameEvent } from '../../../../types';

export const EVENTS: GameEvent[] = [
    // --- Birth Events ---
    {
        id: "EVT_BIRTH_001",
        title: "转世投胎",
        conditions: [{ type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'CULTIVATOR' }],
        content: "你出生在一个修仙世家，父亲是筑基期修士，母亲是温柔的凡人女子。家族长老为你摸骨，称你有修仙潜质。",
        scene: {
            id: "SCENE_BIRTH_001",
            effect: "shake",
            background: "", // Fallback to dark color
            characters: [
                { id: "father", name: "父亲", image: "", position: "left" },
                { id: "elder", name: "长老", image: "", position: "right" }
            ],
            dialogue: {
                speaker: "长老",
                content: "此子骨骼惊奇，灵气自天灵盖喷涌而出，日后必成大器！"
            }
        },
        effect: { MONEY: 10, REP: 5 }
    },
    {
        id: "EVT_BIRTH_FARMER",
        title: "农家子",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 0 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'FARMER' }
        ],
        content: "你出生在山脚下的一个小村庄，父母都是老实巴交的农民。家里虽然清贫，但充满温情。",
        effect: { STR: 2, MOOD: 5 }
    },
    {
        id: "EVT_BIRTH_RICH",
        title: "富家子",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 0 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'RICH' }
        ],
        content: "你出生在青牛镇的首富之家，含着金汤匙出生。仆从成群，衣食无忧。",
        effect: { MONEY: 50, CHR: 5 }
    },


    // --- Farmer Specific ---
    {
        id: "EVT_FARMER_FAMINE",
        title: "灾年",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 5 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'FARMER' }
        ],
        content: "今年大旱，庄稼颗粒无收。家里存粮见底，父亲不得不进山打猎...",
        choices: [
            { text: "帮忙挖野菜", effect: { STR: 2, MOOD: -5 } },
            { text: "哭闹", effect: { MOOD: -10, HP: -2 } }
        ]
    },
    {
        id: "EVT_FARMER_COW",
        title: "放牛娃",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 8 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'FARMER' }
        ],
        content: "你躺在牛背上看着蓝天白云，忽然看见一道流光划破天际——那是御剑飞行的仙人！",
        effect: { MOOD: 10, INT: 1 }
    },

    // --- Rich Specific ---
    {
        id: "EVT_RICH_TUTOR",
        title: "私塾",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 5 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'RICH' }
        ],
        content: "父亲重金聘请了城里的老举人教你读书写字。",
        effect: { INT: 5, CHR: 2 }
    },
    {
        id: "EVT_RICH_BULLY",
        title: "纨绔",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 8 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'RICH' }
        ],
        content: "你带着几个家丁在街上闲逛，看到一个乞丐...",
        choices: [
            { text: "施舍银两", effect: { KARMA: 5, MONEY: -5 } },
            { text: "放狗咬人", effect: { KARMA: -10, MOOD: 5 } }
        ]
    },

    // --- Cultivator Specific ---
    {
        id: "EVT_AGE_3_GIFT",
        title: "神童初显",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 3 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'CULTIVATOR' },
            { type: 'STAT', target: 'INT', op: 'GT', value: 5 }
        ],
        content: "你三岁便能识文断字，过目不忘，被家族长辈誉为神童。父亲大喜，赏赐了你一块灵玉。",
        effect: { REP: 10, MNY: 5, LUCK: 1 }
    },
    {
        id: "EVT_AGE_5_FOUNDATION",
        title: "药浴筑基",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 5 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'CULTIVATOR' }
        ],
        content: "五岁这年，父亲传授你家族的基础吐纳法，并开始为你准备药浴，用以打熬筋骨。药浴痛苦万分，你...",
        choices: [
            { text: "咬牙坚持", effect: { STR: 5, HP: 10, MOOD: -10, flags: ['HAS_CULTIVATION_METHOD'] } },
            { text: "大哭大闹", effect: { STR: 2, MOOD: 5, REP: -5, flags: ['HAS_CULTIVATION_METHOD'] } }
        ]
    },
    // --- Generic Method Discovery ---
    {
        id: "EVT_FOUND_SECRET_MANUAL",
        title: "遗落的秘籍",
        conditions: [
            { type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', op: 'NEQ', value: true },
            { type: 'AGE', op: 'GTE', value: 8 }
        ],
        probability: 0.05,
        content: "你在旧书摊/深山/阁楼中无意间发现了一本残破的口诀，似乎是某种修仙功法。",
        choices: [
            { text: "尝试修炼", effect: { flags: ['HAS_CULTIVATION_METHOD'], INT: 2, history: "你获得了一门粗浅的《长春功》。" } },
            { text: "置之不理", effect: { MOOD: -5 } }
        ]
    },
    {
        id: "EVT_AGE_7_SCHOOL",
        title: "族学启蒙",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 7 },
            { type: 'ROOT_STATE', target: 'background', op: 'EQ', value: 'CULTIVATOR' }
        ],
        content: "你进入了家族学堂，开始系统学习修仙界的常识和家族历史。",
        choices: [
            { text: "专心听讲", effect: { INT: 3, EXP: 100 } },
            { text: "结交同窗", effect: { CHR: 3, REP: 5 } }
        ]
    },
    {
        id: "EVT_AGE_10_TEST",
        title: "测灵大会",
        conditions: [{ type: 'AGE', op: 'EQ', value: 10 }],
        content: "家族举行十年一度的测灵大会，所有满十岁的孩童都要测试灵根。你忐忑不安地走上测试台...",
        choices: [
            {
                conditions: [{ type: 'STAT', target: 'POT', op: 'GTE', value: 8 }],
                text: "光芒万丈！",
                effect: {
                    REP: 200,
                    MONEY: 100,
                    flags: ["FLAG_GENIUS"],
                    MOOD: 20
                }
            },
            {
                conditions: [
                    { type: 'STAT', target: 'POT', op: 'LT', value: 8 },
                    { type: 'STAT', target: 'POT', op: 'GTE', value: 4 }
                ],
                text: "中规中矩",
                effect: {
                    REP: 0,
                    MONEY: 10
                }
            },
            {
                conditions: [{ type: 'STAT', target: 'POT', op: 'LT', value: 4 }],
                text: "黯淡无光...",
                effect: {
                    MOOD: -30,
                    REP: -20,
                    flags: ["FLAG_WASTE"]
                }
            }
        ]
    },
    {
        id: "EVT_WASTE_REVENGE",
        title: "退婚风波",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 15 },
            { type: 'FLAG', target: 'FLAG_WASTE', op: 'EQ', value: true }
        ],
        content: "你的未婚妻纳兰嫣然今日登门，随行还有云岚宗的长老。她神色倨傲，把一纸休书扔在你面前：'你这废物，配不上我！'",
        choices: [
            {
                text: "大喊'莫欺少年穷'！",
                effect: {
                    MOOD: 50,
                    REP: 50,
                    flags: ["FLAG_REVENGE_PLEDGE"],
                    KARMA: 5
                }
            },
            {
                text: "收下补偿，默默忍受",
                effect: {
                    MOOD: -50,
                    MONEY: 500,
                    LUCK: -2
                }
            }
        ]
    },

    // --- Attribute Triggered Events (No fixed Age) ---
    {
        id: "EVT_HIGH_INT_EPIPHANY",
        title: "顿悟",
        conditions: [
            { type: 'STAT', target: 'INT', op: 'GT', value: 15 },
            { type: 'AGE', op: 'GTE', value: 6 }
        ],
        probability: 0.3,
        content: "你观摩家族长辈练功，忽有所悟，对修行的理解加深了。",
        effect: {
            EXP: 50,
            POT: 1,
            MOOD: 10
        }
    },
    {
        id: "EVT_HIGH_STR_BULLY",
        title: "惩强扶弱",
        conditions: [
            { type: 'STAT', target: 'STR', op: 'GT', value: 20 },
            { type: 'AGE', op: 'GTE', value: 6 }
        ],
        probability: 0.2,
        content: "几个旁系子弟正在欺负弱小，你路见不平...",
        choices: [
            {
                text: "出手教训",
                effect: { REP: 10, MOOD: 5, KARMA: 2 }
            },
            {
                text: "冷眼旁观",
                effect: { MOOD: -5, KARMA: -1 }
            }
        ]
    },
    {
        id: "EVT_LOW_ROOT_MOCK",
        title: "嘲讽",
        conditions: [
            { type: 'STAT', target: 'POT', op: 'LT', value: 5 },
            { type: 'AGE', op: 'GTE', value: 6 }
        ],
        probability: 0.2,
        content: "你在演武场旁经过，听到几个族人在窃窃私语，嘲笑你资质平庸。",
        choices: [
            {
                text: "愤而离去",
                effect: { MOOD: -10, STR: 1 }
            },
            {
                text: "与之理论",
                effect: { MOOD: -20, REP: -5 }
            }
        ]
    },
    {
        id: "EVT_HIGH_LUCK_TREASURE",
        title: "意外之财",
        conditions: [
            { type: 'STAT', target: 'LUCK', op: 'GT', value: 15 },
            { type: 'AGE', op: 'GTE', value: 6 }
        ],
        probability: 0.1,
        content: "你在后山闲逛时，不小心被树根绊倒，却发现树根下埋着一个古旧的盒子。",
        choices: [
            {
                text: "打开看看",
                effect: { MONEY: 50, LUCK: 1 }
            },
            {
                text: "交给家族",
                effect: { REP: 20, MONEY: 10 }
            }
        ]
    },
    {
        id: "EVT_HIGH_CHR_GIFT",
        title: "爱慕者",
        conditions: [
            { type: 'STAT', target: 'CHR', op: 'GT', value: 20 },
            { type: 'AGE', op: 'GTE', value: 12 }
        ],
        probability: 0.2,
        content: "因为你生得俊俏，又有几分才气，一位族妹羞答答地塞给你一个香囊。",
        effect: {
            MOOD: 15,
            item: "Sachet"
        }
    },

    // --- Childhood (Age 3-9) ---
    {
        id: "EVT_CHILD_PLAY",
        title: "青梅竹马",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 6 }
        ],
        probability: 0.3,
        content: "邻家的小孩找你出来玩泥巴，你们玩得很开心。",
        effect: { MOOD: 5, CHR: 1 }
    },
    // {
    //     id: "EVT_CHILD_SICK",
    //     title: "大病一场",
    //     trigger: "age >= 3 && age <= 8 && Math.random() < 0.1",
    //     content: "你突然发起了高烧，浑身滚烫，父母衣不解带地照顾了你三天三夜。",
    //     choices: [
    //         { text: "挺过来了", effect: { HP: 1, STR: -1, MOOD: 5 } },
    //         { text: "落下病根", condition: "stats.STR < 5", effect: { STR: -2, HP: -5 } }
    //     ]
    // },
    {
        id: "EVT_CHILD_STORY",
        title: "听故事",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 4 },
            { type: 'AGE', op: 'LTE', value: 7 }
        ],
        probability: 0.2,
        content: "村口的老乞丐给孩子们讲神仙打架的故事，别人都听睡着了，唯独你听得津津有味。",
        effect: { INT: 2, flags: ['HEARD_LEGEND'] }
    },

    // --- Teenage Years (Age 10-15) ---
    {
        id: "EVT_TEEN_LOVE",
        title: "情窦初开",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 12 },
            { type: 'AGE', op: 'LTE', value: 15 }
        ],
        probability: 0.15,
        content: "你发现只要看到那个身影，心跳就会莫名加速...",
        choices: [
            { text: "暗恋", effect: { MOOD: -5, INT: 1 } },
            { text: "表白", effect: { MOOD: 10, KARMA: 2, history: "被发了好人卡，但你感觉整个人都成熟了。" } }
        ]
    },
    {
        id: "EVT_TEEN_COMING_OF_AGE",
        title: "成人礼",
        conditions: [{ type: 'AGE', op: 'EQ', value: 15 }],
        content: "行冠礼（或及笄礼）的日子到了，意味着你正式成年，需承担起责任。",
        choices: [
            { text: "立志修仙", conditions: [{ type: 'STAT', target: 'POT', op: 'GT', value: 0 }], effect: { MOOD: 10, WIL: 5, history: "你立誓要追求长生大道。" } },
            { text: "承欢膝下", effect: { KARMA: 10, REP: 5, history: "你决定先尽孝道。" } },
            { text: "闯荡江湖", effect: { STR: 5, SPD: 5, history: "世界那么大，你想去看看。" } }
        ]
    },

    // --- Exploration Events (Triggered by EXPLORE action or random) ---
    {
        id: "EVT_EXPLORE_HERB",
        title: "灵草",
        conditions: [{ type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }],
        probability: 0.2,
        content: "在深山中，你发现一株散发着微光的植物，旁边似乎有野兽守护。",
        choices: [
            { text: "冒险采摘", conditions: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 15 }], effect: { MONEY: 20, HP: -5, history: "虽然被咬了一口，但采到了灵草。" } },
            { text: "智取", conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 15 }], effect: { MONEY: 20, INT: 1, history: "你设下陷阱引开野兽，轻松得手。" } },
            { text: "放弃", effect: { MOOD: -2 } }
        ]
    },
    {
        id: "EVT_EXPLORE_ROGUE",
        title: "散修尸骨",
        conditions: [{ type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }],
        probability: 0.1,
        content: "你在山洞中发现一具枯骨，身旁散落着一些杂物。",
        effect: { MONEY: 50, items: ['Broken Sword'], history: "捡死人财，虽不吉利但很实惠。" }
    },
    {
        id: "EVT_EXPLORE_BEAST",
        title: "妖兽",
        conditions: [{ type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }],
        probability: 0.1,
        content: "一只一阶妖兽【风狼】挡住了你的去路！",
        choices: [
            { text: "战斗", conditions: [{ type: 'STAT', target: 'ATK', op: 'GTE', value: 20 }], effect: { REP: 10, EXP: 20, HP: -10 } },
            { text: "逃跑", effect: { SPD: 1, MOOD: -5 } },
            { text: "滑铲", conditions: [{ type: 'STAT', target: 'LUCK', op: 'LT', value: 5 }], effect: { HP: -50, history: "给风狼加餐了..." } } // Joke option
        ]
    },

    // --- Cultivation Events (Triggered by CULTIVATE action) ---
    {
        id: "EVT_CULT_BREAKTHROUGH_FAIL",
        title: "瓶颈",
        conditions: [
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'CULTIVATE' },
            { type: 'REALM', op: 'GT', value: 0 }
        ],
        probability: 0.1,
        content: "你感觉修为触碰到了壁垒，无论如何吐纳都无法精进半分。",
        choices: [
            { text: "强行冲关", effect: { HP: -20, MOOD: -10, history: "经脉受损，欲速则不达。" } },
            { text: "外出心炼", effect: { MOOD: 5, WIL: 2, history: "读万卷书行万里路，心境提升了。" } }
        ]
    },
    {
        id: "EVT_CULT_QI_DEVIATION",
        title: "走火入魔",
        conditions: [
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'CULTIVATE' },
            { type: 'STAT', target: 'MOOD', op: 'LT', value: 20 }
        ],
        probability: 0.05,
        content: "因心境不稳，灵气在经脉中乱窜！",
        effect: { HP: -30, stats: { MAX_MP: -10 }, history: "还是太急躁了..." }
    },
    {
        id: "EVT_CULT_EPIPHANY",
        title: "天人合一",
        conditions: [
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'CULTIVATE' },
            { type: 'STAT', target: 'LUCK', op: 'GT', value: 15 }
        ],
        probability: 0.05,
        content: "今日修炼时，竟意外进入了玄之又玄的'顿悟'状态！",
        effect: { EXP: 500, INT: 2, MOOD: 20, history: "修为大涨！" }
    },

    // --- Generic Mortal Ascension Chain (Fan Ren Style) ---
    {
        id: "EVT_MORTAL_LEAVE",
        title: "远方的信",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 10 },
            { type: 'ROOT_STATE', target: 'background', op: 'IN', value: ['FARMER', 'ORPHAN'] },
            { type: 'FLAG', target: 'JOINED_SEVEN_SECT', op: 'NEQ', value: true }
        ],
        content: "你的三叔从城里寄来书信，他在江湖门派'七玄门'有些人脉，问你是否愿意去帮派里谋个差事，或许能学几手功夫。",
        choices: [
            {
                text: "欣然前往 (踏入江湖)",
                effect: { flags: ['JOINED_SEVEN_SECT'], MOOD: 5, STR: 1, history: "你告别父母，踏上了前往七玄门的马车。" }
            },
            {
                text: "留在村里 (平凡是福)",
                effect: { flags: ['FARMER_LIFE'], MOOD: 10, KARMA: 5, history: "你选择留在父母身边，尽享天伦之乐。" }
            }
        ]
    },

    // Branch: Joined Sect
    {
        id: "EVT_SECT_TEST",
        title: "炼骨崖考核",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 12 },
            { type: 'FLAG', target: 'JOINED_SEVEN_SECT', op: 'EQ', value: true }
        ],
        content: "七玄门的入门考核极其残酷，需要在正午烈日下，从陡峭的炼骨崖爬上顶峰。许多同龄人已经晕倒。",
        choices: [
            {
                text: "咬牙死撑 (需要意志)",
                conditions: [{ type: 'STAT', target: 'WIL', op: 'GTE', value: 10 }],
                effect: {
                    flags: ['SECT_DISCIPLE'],
                    REP: 10,
                    STR: 3,
                    MONEY: 5,
                    history: "凭着一股狠劲，你硬是爬上了峰顶，成为了正式弟子。"
                }
            },
            {
                text: "寻找捷径 (需要悟性)",
                conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 15 }],
                effect: {
                    flags: ['SECT_DISCIPLE', 'SMART_KID'],
                    INT: 2,
                    MONEY: 5,
                    history: "你发现了一条隐蔽的小路，虽然不仅光彩，但成功通过了考核。"
                }
            },
            {
                text: "遗憾放弃",
                effect: {
                    flags: ['SECT_SERVANT'],
                    MOOD: -10,
                    MONEY: 1,
                    history: "你没能坚持到最后，只能留在门派做一个杂役弟子。"
                }
            }
        ]
    },

    // Branch: Doctor Mo (The Tutor)
    {
        id: "EVT_MYSTERIOUS_DOCTOR",
        title: "怪医的关注",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 13 },
            { type: 'FLAG', target: 'DOCTOR_PUPIL', op: 'NEQ', value: true },
            // OR logic: Player has SECT_DISCIPLE OR SECT_SERVANT flag
            { type: 'FLAG', op: 'IN', value: ['SECT_DISCIPLE', 'SECT_SERVANT'] }
        ],
        content: "门派里供奉的墨大夫把你叫去。这老者眼神阴鸷，摸了摸你的手骨，露出一丝狂喜。",
        choices: [
            {
                text: "拜师学艺",
                effect: {
                    flags: ['DOCTOR_PUPIL'],
                    INT: 2,
                    POT: 1,
                    history: "墨大夫收你为记名弟子，但他不教医术武功，只让你修炼一套无名口诀（长春功）。"
                }
            },
            {
                text: "婉言谢绝",
                effect: {
                    flags: ['MISSED_OPPORTUNITY'],
                    REP: 5,
                    history: "你觉得这老头不像好人，拒绝了他的好意。"
                }
            }
        ]
    },

    // Branch: The Cheat Item (Green Vial)
    {
        id: "EVT_GREEN_VIAL",
        title: "神手谷奇遇",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 14 },
            { type: 'FLAG', target: 'DOCTOR_PUPIL', op: 'EQ', value: true }
        ],
        content: "你在神手谷的小溪边散步，脚趾踢到了一个硬物。捡起来洗净一看，是一个布满绿锈的奇怪小瓶。",
        choices: [
            {
                text: "私藏 (开启掌天之路)",
                effect: {
                    flags: ['HAS_GREEN_VIAL'],
                    LUCK: 5,
                    WIL: 2,
                    history: "直觉告诉你此物不凡，你把它贴身藏好，没告诉任何人。"
                }
            },
            {
                text: "上交师父",
                effect: {
                    flags: ['LOST_VIAL'],
                    MONEY: 20,
                    REP: 10,
                    history: "墨大夫大喜过望，赏了你几十两银子。你感觉似乎失去了什么极其重要的东西..."
                }
            }
        ]
    },

    // Branch: VIAL Discovery
    {
        id: "EVT_VIAL_DISCOVERY",
        title: "催熟灵药",
        conditions: [
            { type: 'FLAG', target: 'HAS_GREEN_VIAL', op: 'EQ', value: true },
            { type: 'AGE', op: 'GTE', value: 15 }
        ],
        content: "你无意中发现，这个小瓶子在月光下会凝聚绿液，滴在草药上竟然能瞬间催熟百年药龄！",
        effect: {
            flags: ['KNOWS_VIAL_SECRET'],
            stats: { AFF_NAT: 20 },
            history: "你发现了小绿瓶的逆天功效！从此灵药对你来说唾手可得。"
        }
    },

    // Branch: The Crisis
    {
        id: "EVT_POSSESSION_CRISIS",
        title: "夺舍惊魂",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 16 },
            { type: 'FLAG', target: 'DOCTOR_PUPIL', op: 'EQ', value: true }
        ],
        content: "墨大夫终于摊牌了！原来他大限将至，养你三年只为夺舍你的肉身！此刻他将你制住，元神出窍扑面而来！",
        choices: [
            {
                text: "吞噬反杀 (需要高意志/气运)",
                // OR: WIL >= 20 || LUCK >= 25. Using lower threshold (WIL >= 20) as simplified gate.
                conditions: [
                    { type: 'STAT', target: 'WIL', op: 'GTE', value: 20 }
                ],
                effect: {
                    flags: ['KILLED_DOCTOR', 'OFFICIAL_CULTIVATOR'],
                    stats: { WIL: 10, INT: 5, POT: 5 },
                    items: ['Yellow Dragon Dan', 'Basic Talisman'],
                    history: "谁知你的神魂因穿越/天赋异禀异常强大，反而吞噬了墨大夫的残魂！你接手了他的遗产。"
                }
            },
            {
                text: "尝试谈判 (需要高智商)",
                conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 30 }],
                effect: {
                    flags: ['DOCTOR_PARTNER'],
                    stats: { INT: 5, DAO: 2 },
                    history: "你冷静地指出了夺舍的风险，并提出用长春功帮他延寿。墨大夫犹豫了，最终同意暂不夺舍，与你建立共生契约。"
                }
            },
            {
                text: "拼死一搏 (低概率逃生)",
                conditions: [{ type: 'STAT', target: 'STR', op: 'GTE', value: 40 }],
                effect: {
                    flags: ['ROGUE_CULTIVATOR', 'HUNTED_BY_DOCTOR'],
                    HP: -50,
                    history: "你爆发蛮力挣脱了束缚，重伤逃入茫茫大山。从此你成为了一名散修，时刻提防墨大夫的追杀。"
                }
            }
        ]
    },

    // Outcome A: Orthodox Path
    {
        id: "EVT_OFFICIAL_PATH",
        title: "升仙令",
        conditions: [{ type: 'FLAG', target: 'KILLED_DOCTOR', op: 'EQ', value: true }],
        content: "在墨大夫的遗物中，你发现了一枚【升仙令】和一封推荐信。原来修仙界真的存在...",
        choices: [
            {
                text: "持令拜山 (加入正道)",
                effect: {
                    flags: ['JOINED_YELLOW_SECT'],
                    history: "你凭升仙令加入了修仙大派黄枫谷，虽然只是低级弟子，但终于踏上了正途。"
                }
            },
            {
                text: "卖掉令牌 (散修之路)",
                effect: {
                    MONEY: 1000,
                    flags: ['RICH_ROGUE'],
                    history: "你觉得门派规矩太多，索性在黑市卖掉令牌，换了一大笔灵石做启动资金。"
                }
            }
        ]
    },

    // ═══ 新增：通用世界观事件（天象/季节/传闻等） ═══
    {
        id: "EVT_CORE_SEASON_SPRING",
        title: "春回大地",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 5 }
        ],
        probability: 0.08,
        content: "冰雪消融，万物复苏。桃花灼灼，杏花纷纷，整个世界都焕发出勃勃生机。天地间的灵气也似乎更加活跃了。",
        choices: [
            { text: "去山中踏青", effect: { MOOD: 5, SPD: 1, history: "你在山间奔跑嬉戏，感受着春日的暖阳和清风。" } },
            { text: "在灵气充沛时打坐", conditions: [{ type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', op: 'EQ', value: true }], effect: { EXP: 30, DAO: 1, history: "你趁着天地灵气复苏之际入定修炼，获益匪浅。" } }
        ]
    },
    {
        id: "EVT_CORE_SEASON_WINTER",
        title: "严冬酷寒",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 5 }
        ],
        probability: 0.08,
        content: "今年的冬天格外寒冷，北风呼啸，大雪封路。井水都被冻住了，出门都成了一件难事...",
        choices: [
            { text: "以冰雪磨砺体魄", effect: { CON: 2, HP: -5, history: "你每日在寒风中赤膊打拳，冻得嘴唇发紫，但体魄愈发强健。" } },
            { text: "闭门读书", effect: { INT: 2, history: "哪儿也去不了，就在屋里多看几本书。一个冬天下来，你已经博览群书。" } },
            { text: "围炉烤火过冬", effect: { MOOD: 3, history: "你和家人围坐在一起，听着窗外的风声，心里暖洋洋的。" } }
        ]
    },
    {
        id: "EVT_CORE_CELESTIAL_METEOR",
        title: "天象异变·流星",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 8 }
        ],
        probability: 0.03,
        content: "夜半时分，一颗拖着长尾的巨大流星划过夜空，照亮了半边天际。据说这是修仙界有大能陨落的征兆...",
        choices: [
            { text: "循着陨落方向去找", conditions: [{ type: 'STAT', target: 'LUCK', op: 'GTE', value: 10 }], effect: { LUCK: 3, MONEY: 10, history: "你找到了陨石坠落的地方，拾得几块散发着奇异光泽的碎片。" } },
            { text: "闭目冥想", effect: { DAO: 2, history: "流星划过天际的瞬间，你似乎领悟到了某种天道法则。" } },
            { text: "掩上门窗不去理会", effect: { WIL: 1, history: "天上的事与凡人何干？你翻了个身继续睡觉。" } }
        ]
    },
    {
        id: "EVT_CORE_WANDERING_MONK",
        title: "云游僧人",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 8 }
        ],
        probability: 0.06,
        content: "一个手持禅杖的苦行僧路过你的村庄，在村口的大树下打坐。他面容枯槁但目光深邃，浑身上下透着一股说不清的气度...",
        choices: [
            { text: "恭敬地送上茶水", effect: { KARMA: 3, DAO: 1, history: "僧人接过茶水微微一笑，用枯指在你额头轻点一下。你感到一阵清凉涌入脑海。" } },
            { text: "请教修行之道", effect: { INT: 2, DAO: 2, history: "僧人说：'万法归宗，道在心中。观自在，行自在。'虽然你不太懂，但记在心中反复琢磨。" } },
            { text: "远远地看着", effect: { MOOD: 1, history: "你觉得这个和尚很奇怪，但直觉告诉你他不是普通人。" } }
        ]
    },
    {
        id: "EVT_CORE_RUMOR_WAR",
        title: "传闻·修仙界大战",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 12 }
        ],
        probability: 0.05,
        content: "集市上有商人在议论纷纷：据说远方两个修仙大派打了起来，方圆百里化为焦土，无数凡人流离失所...",
        choices: [
            { text: "认真打听细节", effect: { INT: 1, history: "你了解到修仙大派之间的利益纷争。弱肉强食，修仙界也不太平。" } },
            { text: "暗自发誓变强", effect: { WIL: 2, history: "弱小就会被碾碎。你紧握拳头，暗暗发誓绝不做砧板上的鱼肉。" } },
            { text: "庆幸离战场很远", effect: { MOOD: 1, history: "还好只是远方的事......暂时和你无关。" } }
        ]
    },
    {
        id: "EVT_CORE_ECLIPSE",
        title: "天象异变·日蚀",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 5 }
        ],
        probability: 0.02,
        content: "正午时分，天色突然暗了下来——太阳被遮住了大半！村里人惊恐地敲锣打鼓驱邪。修仙者们则知道这是天地灵气交替的罕见时刻...",
        choices: [
            { text: "趁日蚀之时打坐吸收阴阳灵气", conditions: [{ type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', op: 'EQ', value: true }], effect: { EXP: 100, DAO: 2, history: "日蚀之时，你感受到了阴阳交替的奇妙力量，修为精进不少！" } },
            { text: "记录天象变化", effect: { INT: 3, history: "你仔细观察记录了日蚀的全过程。也许将来会有用处。" } },
            { text: "躲在家里不敢出门", effect: { MOOD: -2, history: "你和大部分村民一样，躲在屋里瑟瑟发抖等天色恢复。" } }
        ]
    },
    {
        id: "EVT_CORE_TRAVELING_MERCHANT",
        title: "行脚商人",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 }
        ],
        probability: 0.1,
        content: "一个走南闯北的行脚商人来到村里，他的货担里有各种稀奇古怪的东西。他和你攀谈起来，讲述了外面世界的见闻...",
        choices: [
            { text: "花钱买个小物件", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 2 }], effect: { MONEY: -2, LUCK: 1, history: "你买了一个据说带来好运的平安符。是真是假不好说，但心里踏实了许多。" } },
            { text: "听他讲外面的故事", effect: { INT: 1, MOOD: 3, history: "商人讲了许多你闻所未闻的奇事：会飞的人、吃人的妖、千年不化的冰山...你的世界观一再被刷新。" } },
            { text: "打听修仙者的消息", effect: { DAO: 1, history: "商人压低声音说，他在路上曾远远看见一个人一跃百丈，转瞬消失在天际。那应该就是所谓的'仙人'了..." } }
        ]
    },
    {
        id: "EVT_CORE_SICK_NEIGHBOR",
        title: "邻里互助",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 8 }
        ],
        probability: 0.1,
        content: "邻居李大伯病倒了，家里只剩年迈的婆婆和年幼的孙子。看着他们愁苦的面容，你心里不是滋味...",
        choices: [
            { text: "帮忙砍柴挑水照顾", effect: { KARMA: 3, STR: 1, history: "你每天去帮李大伯家干活，一直到他病好。全村人都夸你是个好孩子。" } },
            { text: "把攒的钱借给他们", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 3 }], effect: { KARMA: 5, MONEY: -3, history: "你把自己攒了好久的钱借给他们请郎中。李大伯病好后一定要登门道谢。" } },
            { text: "心有余但力不足", effect: { MOOD: -2, history: "你也想帮忙，但自己家里也不宽裕。" } }
        ]
    },
    {
        id: "EVT_CORE_WATER_SOURCE",
        title: "泉水异变",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 5 }
        ],
        probability: 0.04,
        content: "村后山上的泉眼突然变得甘甜异常，喝了以后浑身舒泰。老人们说这是龙脉活动的征兆，灵气聚集之地...",
        choices: [
            { text: "每天去泉边打水喝", effect: { HP: 5, CON: 1, history: "你坚持每天喝泉水，身体变得格外健康。" } },
            { text: "在泉边打坐感应灵气", conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 8 }], effect: { DAO: 2, EXP: 20, history: "你隐约感应到泉水中蕴含着天地灵气......原来所谓的灵气就是这种感觉。" } },
            { text: "装几壶带回家", effect: { MOOD: 2, history: "你灌了好几壶泉水带回家给全家人喝。" } }
        ]
    },
    {
        id: "EVT_CORE_NIGHTWATCH",
        title: "夜间值守",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 12 }
        ],
        probability: 0.08,
        content: "最近村子附近闹野兽，村长号召壮劳力轮流值夜。轮到你的这天夜里，万籁俱寂，只有月光洒在田野上...",
        choices: [
            { text: "认真巡逻至天亮", effect: { WIL: 2, STR: 1, history: "一整夜的巡逻虽然辛苦但平安无事。晨曦微露时你终于松了口气。" } },
            { text: "坐在角落里偷偷冥想", conditions: [{ type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', op: 'EQ', value: true }], effect: { EXP: 30, history: "你一边值守一边运转功法，夜深人静时效果出奇地好。" } },
            { text: "和同伴聊天打发时间", effect: { CHR: 1, MOOD: 2, history: "你和一起值守的大哥聊了一宿，增进了不少感情。" } }
        ]
    }
];
