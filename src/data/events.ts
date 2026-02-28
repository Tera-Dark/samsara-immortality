import type { GameEvent } from '../types';

export const EVENTS: GameEvent[] = [
    // --- Birth Events ---
    {
        id: "EVT_BIRTH_001",
        age: 0,
        title: "转世投胎",
        trigger: "background === 'CULTIVATOR'",
        content: "你出生在一个修仙世家，父亲是筑基期修士，母亲是温柔的凡人女子。家族长老为你摸骨，称你有修仙潜质。",
        effect: { MONEY: 10, REP: 5 }
    },
    {
        id: "EVT_BIRTH_FARMER",
        age: 0,
        title: "农家子",
        trigger: "background === 'FARMER'",
        content: "你出生在山脚下的一个小村庄，父母都是老实巴交的农民。家里虽然清贫，但充满温情。",
        effect: { STR: 2, MOOD: 5 }
    },
    {
        id: "EVT_BIRTH_RICH",
        age: 0,
        title: "富家子",
        trigger: "background === 'RICH'",
        content: "你出生在青牛镇的首富之家，含着金汤匙出生。仆从成群，衣食无忧。",
        effect: { MONEY: 50, CHR: 5 }
    },

    // --- Age 1: Catch ---
    {
        id: "EVT_AGE_1_WALK",
        age: 1,
        title: "抓周",
        content: "周岁抓周仪式上，你推开了胭脂水粉，同时也无视了金银珠宝，径直抓住了...",
        choices: [
            { text: "一把木剑", effect: { STR: 2, flags: ['FLAG_SWORD_INTEREST'] } },
            { text: "一本古籍", effect: { INT: 2, flags: ['FLAG_BOOK_INTEREST'] } },
            { text: "一颗丹药", effect: { POT: 1, flags: ['FLAG_ALCHEMY_INTEREST'] } }
        ]
    },

    // --- Farmer Specific ---
    {
        id: "EVT_FARMER_FAMINE",
        age: 5,
        title: "灾年",
        trigger: "background === 'FARMER'",
        content: "今年大旱，庄稼颗粒无收。家里存粮见底，父亲不得不进山打猎...",
        choices: [
            { text: "帮忙挖野菜", effect: { STR: 2, MOOD: -5 } },
            { text: "哭闹", effect: { MOOD: -10, HP: -2 } }
        ]
    },
    {
        id: "EVT_FARMER_COW",
        age: 8,
        title: "放牛娃",
        trigger: "background === 'FARMER'",
        content: "你躺在牛背上看着蓝天白云，忽然看见一道流光划破天际——那是御剑飞行的仙人！",
        effect: { MOOD: 10, INT: 1 }
    },

    // --- Rich Specific ---
    {
        id: "EVT_RICH_TUTOR",
        age: 5,
        title: "私塾",
        trigger: "background === 'RICH'",
        content: "父亲重金聘请了城里的老举人教你读书写字。",
        effect: { INT: 5, CHR: 2 }
    },
    {
        id: "EVT_RICH_BULLY",
        age: 8,
        title: "纨绔",
        trigger: "background === 'RICH'",
        content: "你带着几个家丁在街上闲逛，看到一个乞丐...",
        choices: [
            { text: "施舍银两", effect: { KARMA: 5, MONEY: -5 } },
            { text: "放狗咬人", effect: { KARMA: -10, MOOD: 5 } }
        ]
    },

    // --- Cultivator Specific ---
    {
        id: "EVT_AGE_3_GIFT",
        age: 3,
        title: "神童初显",
        trigger: "background === 'CULTIVATOR' && stats.INT > 5",
        content: "你三岁便能识文断字，过目不忘，被家族长辈誉为神童。父亲大喜，赏赐了你一块灵玉。",
        effect: { REP: 10, MNY: 5, LUCK: 1 }
    },
    {
        id: "EVT_AGE_5_FOUNDATION",
        age: 5,
        title: "药浴筑基",
        trigger: "background === 'CULTIVATOR'",
        content: "五岁这年，父亲开始为你准备药浴，用以打熬筋骨，为日后修炼做准备。药浴痛苦万分，你...",
        choices: [
            { text: "咬牙坚持", effect: { STR: 5, HP: 10, MOOD: -10 } },
            { text: "大哭大闹", effect: { STR: 2, MOOD: 5, REP: -5 } }
        ]
    },
    {
        id: "EVT_AGE_7_SCHOOL",
        age: 7,
        title: "族学启蒙",
        trigger: "background === 'CULTIVATOR'",
        content: "你进入了家族学堂，开始系统学习修仙界的常识和家族历史。",
        choices: [
            { text: "专心听讲", effect: { INT: 3, EXP: 100 } },
            { text: "结交同窗", effect: { CHR: 3, REP: 5 } }
        ]
    },
    {
        id: "EVT_AGE_10_TEST",
        age: 10,
        title: "测灵大会",
        content: "家族举行十年一度的测灵大会，所有满十岁的孩童都要测试灵根。你忐忑不安地走上测试台...",
        choices: [
            {
                condition: "stats.POT >= 8",
                text: "光芒万丈！",
                effect: {
                    REP: 200,
                    MONEY: 100,
                    flags: ["FLAG_GENIUS"],
                    MOOD: 20
                }
            },
            {
                condition: "stats.POT < 8 && stats.POT >= 4",
                text: "中规中矩",
                effect: {
                    REP: 0,
                    MONEY: 10
                }
            },
            {
                condition: "stats.POT < 4",
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
        age: 15,
        title: "退婚风波",
        trigger: "flags.includes('FLAG_WASTE')",
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
        trigger: "stats.INT > 15 && age >= 6 && Math.random() < 0.3",
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
        trigger: "stats.STR > 20 && age >= 6 && Math.random() < 0.2",
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
        trigger: "stats.POT < 5 && age >= 6 && Math.random() < 0.2",
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
        trigger: "stats.LUCK > 15 && age >= 6 && Math.random() < 0.1",
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
        trigger: "stats.CHR > 20 && age >= 12 && Math.random() < 0.2",
        content: "因为你生得俊俏，又有几分才气，一位族妹羞答答地塞给你一个香囊。",
        effect: {
            MOOD: 15,
            item: "Sachet"
        }
    },

    // --- Mortal Ascension Chain (Fan Ren Style) ---
    {
        id: "EVT_MORTAL_LEAVE",
        title: "远方的信",
        age: 10,
        trigger: "(background === 'FARMER' || background === 'ORPHAN') && !flags.includes('JOINED_SEVEN_SECT')",
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
        age: 12,
        reqFlags: ['JOINED_SEVEN_SECT'],
        content: "七玄门的入门考核极其残酷，需要在正午烈日下，从陡峭的炼骨崖爬上顶峰。许多同龄人已经晕倒。",
        choices: [
            {
                text: "咬牙死撑 (需要意志)",
                condition: "stats.WIL >= 10",
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
                condition: "stats.INT >= 15",
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
        age: 13,
        trigger: "(flags.includes('SECT_DISCIPLE') || flags.includes('SECT_SERVANT')) && !flags.includes('DOCTOR_PUPIL')",
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
        age: 14,
        reqFlags: ['DOCTOR_PUPIL'],
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
        reqFlags: ['HAS_GREEN_VIAL'],
        trigger: "age >= 15",
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
        age: 16,
        reqFlags: ['DOCTOR_PUPIL'],
        content: "墨大夫终于摊牌了！原来他大限将至，养你三年只为夺舍你的肉身！此刻他将你制住，元神出窍扑面而来！",
        choices: [
            {
                text: "吞噬反杀 (需要高意志/气运)",
                condition: "stats.WIL >= 20 || stats.LUCK >= 25",
                effect: {
                    flags: ['KILLED_DOCTOR', 'OFFICIAL_CULTIVATOR'],
                    stats: { WIL: 10, INT: 5, POT: 5 },
                    items: ['Yellow Dragon Dan', 'Basic Talisman'],
                    history: "谁知你的神魂因穿越/天赋异禀异常强大，反而吞噬了墨大夫的残魂！你接手了他的遗产。"
                }
            },
            {
                text: "尝试谈判 (需要高智商)",
                condition: "stats.INT >= 30",
                effect: {
                    flags: ['DOCTOR_PARTNER'],
                    stats: { INT: 5, DAO: 2 },
                    history: "你冷静地指出了夺舍的风险，并提出用长春功帮他延寿。墨大夫犹豫了，最终同意暂不夺舍，与你建立共生契约。"
                }
            },
            {
                text: "拼死一搏 (低概率逃生)",
                condition: "stats.STR >= 40",
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
        reqFlags: ['KILLED_DOCTOR'],
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
    }
];
