import type { GameEvent } from '../../../../types';

const _EVENTS_MORTAL: GameEvent[] = [
    {
        id: "EVT_MORTAL_LEAVE",
        title: "凡尘俗世",
        conditions: [
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'NEQ', value: true },
            { type: 'AGE', op: 'GTE', value: 18 },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.05,
        content: "你已成年，但仍未踏入仙途。看着村里的同龄人纷纷娶亲生子，你心中...",
        choices: [
            {
                text: "绝不甘心！",
                effect: { WIL: 5, MOOD: -10, history: "你收拾行囊，决定离开村子去碰碰运气。" }
            },
            {
                text: "接受平凡",
                effect: { MOOD: 10, KARMA: 5, history: "你叹了口气，也开始考虑终身大事了。" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_WOLF",
        title: "山林遇险",
        conditions: [
            { type: 'REALM', op: 'GT', value: -1 } // 任意境界都会遇到，但通常是凡人
        ],
        probability: 0.1, // 增加遇到野狼的概率
        content: "你正在荒郊野外赶路...",
        branches: [
            {
                check: [],
                success: {
                    text: "你在荒野中遇到了一头饥饿的野狼。野狼目露凶光，朝你扑来！唯有一战！",
                    combat: {
                        type: 'WILD',
                        enemy: {
                            id: 'wild_wolf',
                            name: "野狼",
                            levelStr: "普通野兽",
                            hp: 100, maxHp: 100,
                            mp: 0, maxMp: 0,
                            atk: 15, def: 5, spd: 40, crit: 5, critDamage: 1.5,
                            shield: 0, buffs: [],
                            skills: [
                                { id: 'bite', name: '撕咬', type: 'ATTACK', costType: 'NONE', costAmount: 0, powerMultiplier: 1.0, description: '野兽本能的攻击。', cooldown: 0, target: 'ENEMY' }
                            ]
                        }
                    }
                },
                failure: { text: "" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_BANDITS",
        title: "路遇山匪",
        conditions: [
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'NEQ', value: true },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.1,
        content: "几个凶神恶煞的山匪拦住了你的去路，要求留下买路财。",
        choices: [
            {
                text: "破财消灾",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 5 }],
                effect: { MONEY: -5, MOOD: -10 }
            },
            {
                text: "拼了！ (需要高体魄)",
                conditions: [{ type: 'STAT', target: 'STR', op: 'GTE', value: 15 }],
                effect: { REP: 10, MONEY: 5, MOOD: 20, history: "你凭借一身蛮力打退了山匪，还缴获了些盘缠。" }
            },
            {
                text: "落荒而逃",
                effect: { SPD: 1, MOOD: -5 }
            }
        ]
    },
    {
        id: "EVT_MORTAL_SICK",
        title: "风寒",
        conditions: [
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'NEQ', value: true },
            { type: 'STAT', target: 'CON', op: 'LT', value: 15 }
        ],
        probability: 0.08,
        content: "凡人肉体羸弱，你偶感风寒，病倒在床。",
        effect: { HP: -20, stats: { MAX_HP: -1 }, history: "大病一场，伤了些元气。" }
    },
    {
        id: "EVT_IMMORTAL_ENCOUNTER",
        title: "仙缘",
        conditions: [
            { type: 'FLAG', target: 'HAS_CULTIVATION_METHOD', op: 'NEQ', value: true },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' },
            { type: 'AGE', op: 'GTE', value: 15 }
        ],
        probability: 0.02,
        content: "你在一处悬崖下救了一位重伤垂死的老者，老者看了你一眼，叹道：“罢罢罢，这也算是一场造化。”",
        choices: [
            {
                text: "跪地磕头拜师",
                effect: {
                    flags: ['HAS_CULTIVATION_METHOD'],
                    items: ['qi_gathering_pill'],
                    KARMA: 10,
                    history: "老者传了你一套残缺心法和一瓶丹药后便坐化了。你将其安葬，心中发誓定要踏上仙途。"
                }
            }
        ]
    },
    // [NEW EVENTS BELOW]
    {
        id: "EVT_MORTAL_SUDDEN_RAIN",
        title: "突降暴雨",
        conditions: [
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'NEQ', value: true },
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.1,
        content: "你正在山间行走，原本晴朗的天空突然乌云密布，电闪雷鸣，一场暴雨倾盆而下。前方隐约可见一个幽暗的山洞。",
        choices: [
            {
                text: "顶着暴雨赶路",
                effect: { HP: -10, MOOD: -5, CON: 1, history: "你冒雨狂奔，虽然受了风寒，但体魄似乎由于磨砺变强了一丝。" }
            },
            {
                text: "躲入山洞 (可能有危险)",
                effect: { nextEventId: "EVT_MORTAL_SUDDEN_RAIN_CAVE" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_SUDDEN_RAIN_CAVE",
        title: "山洞避雨",
        conditions: [{ type: 'FLAG', target: 'NEVER_HAPPENS', op: 'EQ', value: true }], // Only triggered by previous event
        probability: 0,
        content: "你冲进山洞，发现洞内干燥异常，深处隐隐传来奇怪的腥风。",
        choices: [
            {
                text: "深入探索 (需要高体魄与身法)",
                conditions: [{ type: 'STAT', target: 'STR', op: 'GTE', value: 12 }, { type: 'STAT', target: 'SPD', op: 'GTE', value: 12 }],
                effect: { MONEY: 10, STR: 1, history: "你深入洞窟，惊跑了一只误入的野兽，在它的巢穴旁发现了几株草药并拿去换了灵石。" }
            },
            {
                text: "深入探索 (冒进)",
                conditions: [{ type: 'STAT', target: 'STR', op: 'LT', value: 12 }],
                effect: { HP: -30, MOOD: -15, history: "你惊动了洞里的野熊，拼死才逃出来，受了重伤！" }
            },
            {
                text: "就在洞口生火等待",
                effect: { MOOD: 5, history: "你在洞口安全地度过了雨夜，第二天清晨下山。" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_INJURED_BEAST",
        title: "受伤的灵狐",
        conditions: [
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'NEQ', value: true },
            { type: 'STAT', target: 'KARMA', op: 'GTE', value: 0 }
        ],
        probability: 0.08,
        content: "你在林间采集时，发现一只通体雪白的狐狸中了猎人的捕兽夹，正发出哀鸣。它的眼眸竟然有几分人性化的哀求。",
        choices: [
            {
                text: "悉心包扎放生",
                conditions: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 10 }],
                effect: { KARMA: 10, MOOD: 10, history: "你小心翼翼地解开夹子并用草药为它包扎。灵狐深深看了你一眼，遁入林中。" }
            },
            {
                text: "趁机宰杀售卖",
                effect: { MONEY: 8, KARMA: -15, MOOD: -10, history: "你残忍地杀死了这只罕见的白狐拿去坊市卖皮，换了一笔横财，但总觉得心里发毛。" }
            },
            {
                text: "假装没看见",
                effect: { MOOD: -5, history: "凡人自顾不暇，哪有余力管野兽死活。你默默离开了。" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_ROGUE_FIGHT",
        title: "神仙打架",
        conditions: [
            { type: 'FLAG', target: 'OFFICIAL_CULTIVATOR', op: 'NEQ', value: true },
            { type: 'AGE', op: 'GTE', value: 12 }
        ],
        probability: 0.05,
        content: "天空中突然爆发出一阵刺目的光芒，两名御剑飞行的修仙者正在激烈斗法，不时有法术余波轰击在远处的山头上。",
        choices: [
            {
                text: "躲得远远的",
                effect: { WIL: 1, history: "神仙打架凡人遭殃，你理智地躲进了地窖，逃过一劫。" }
            },
            {
                text: "冒险凑近观摩 (需要高身法与悟性)",
                conditions: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 15 }, { type: 'STAT', target: 'INT', op: 'GTE', value: 15 }],
                effect: { INT: 3, EXP: 20, history: "你凭借灵巧的身法躲过余波，隐隐对修仙者的力量有了一丝凡人的明悟。" }
            },
            {
                text: "寻找落下的宝物",
                effect: { HP: -50, stats: { MAX_HP: -5 }, history: "你刚跑出几步，就被一道流弹擦中，身受重创险些丧命！" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_BOOK_PEDDLER",
        title: "古怪的书贩",
        conditions: [
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.1,
        content: "在镇上的集市里，一个衣衫褴褛的老书贩拉住你，神秘兮兮地掏出一本无字天书：“少年，我看你骨骼惊奇，这本‘造化玉碟’十文钱卖你！”",
        choices: [
            {
                text: "花钱买下",
                conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 1 }],
                effect: { MONEY: -1, INT: 1, history: "你花钱买下后发现只是一本普通的识字教材，不过多读读书总没坏处。" }
            },
            {
                text: "与之攀谈 (需要高魅力)",
                conditions: [{ type: 'STAT', target: 'CHR', op: 'GTE', value: 12 }],
                effect: { CHR: 2, history: "你没有买书，反而和老者聊得很投机。老者大笑离去，你觉得自己的谈吐有所精进。" }
            },
            {
                text: "当成疯子轰走",
                effect: { KARMA: -2, history: "你嫌恶地甩开老者的手，快步离开了。" }
            }
        ]
    },
    {
        id: "EVT_MORTAL_EERIE_WELL",
        title: "诡异枯井",
        conditions: [
            { type: 'ROOT_STATE', target: 'action', op: 'EQ', value: 'EXPLORE' }
        ],
        probability: 0.08,
        content: "你在村庄外围的荒地发现了一口早已废弃的枯井，井底隐隐散发着微弱的幽光，伴随着轻微的叹息声。",
        choices: [
            {
                text: "扔块石头探路",
                effect: { MOOD: -5, history: "石头落入井中，却没有听到回声，唯有一声凄厉的尖啸传出，吓得你拔腿就跑。" }
            },
            {
                text: "冒险腰系麻绳下井 (高体魄与胆识)",
                conditions: [{ type: 'STAT', target: 'STR', op: 'GTE', value: 18 }],
                effect: { MONEY: 15, STR: 2, history: "你下到井底，发现了几具骸骨和一些散落的灵石，虽然阴森，但收获颇丰。" }
            },
            {
                text: "不去作死",
                effect: { WIL: 1, history: "好奇害死猫，你按捺住心中的邪念，转身离去。" }
            }
        ]
    },

    // ═══ 新增：凡人日常生活事件 ═══
    {
        id: "EVT_MORTAL_FAIR_TRADE",
        title: "庙会赶集",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 12 }
        ],
        probability: 0.15,
        content: "镇上的年关庙会热闹非凡。糖葫芦、打铁花、戏台子，应有尽有。你在人群中发现一个卖旧货的摊子...",
        choices: [
            { text: "花钱淘一件看得上的旧物", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 3 }], effect: { MONEY: -3, LUCK: 2, history: "你花了三块灵石淘了一个铜镜。回家一擦，里面竟然有模糊的文字隐现。" } },
            { text: "看戏台上的大戏", effect: { MOOD: 5, history: "台上演的是忠孝节义的故事，你看得泪流满面。" } },
            { text: "找个角落练拳", effect: { STR: 1, WIL: 1, history: "别人都在看热闹，只有你在角落里默默练功。" } }
        ]
    },
    {
        id: "EVT_MORTAL_HARVEST",
        title: "年景好坏",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 }
        ],
        probability: 0.15,
        content: "今年的年景如何，关系到一家人的温饱...",
        branches: [{
            check: [{ type: 'STAT', target: 'LUCK', op: 'GTE', value: 8 }],
            success: { text: "风调雨顺，五谷丰登！家里存粮充足，你也长了不少个头。", effect: { STR: 1, MOOD: 5, MONEY: 2 } },
            failure: { text: "今年闹了旱灾，收成惨淡。一家人勒紧裤腰带过日子。", effect: { MOOD: -5, HP: -5, WIL: 2, history: "饥饿让你变得更坚韧了。" } }
        }]
    },
    {
        id: "EVT_MORTAL_MEDICINE_OLD",
        title: "游方郎中",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 8 }
        ],
        probability: 0.1,
        content: "一个背着药箱的游方郎中路过你家村子，免费给村民看病。你好奇地凑过去看他开方抓药...",
        choices: [
            { text: "帮他打下手", effect: { INT: 2, KARMA: 2, history: "你帮郎中磨药、称药、包药。他夸你手脚麻利，临走塞给你一本《百草辨识》。" } },
            { text: "请他给自己把脉", effect: { HP: 5, history: "郎中把完脉说你身子骨还算硬朗，不过给了你几副调理的方子。" } },
            { text: "听了一会儿就走了", effect: { MOOD: 1, history: "你觉得药材的味道太苦了，还是出去玩比较好。" } }
        ]
    },
    {
        id: "EVT_MORTAL_STRANGE_DREAM",
        title: "奇异之梦",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 },
            { type: 'STAT', target: 'DAO', op: 'GTE', value: 3 }
        ],
        probability: 0.08,
        content: "你做了一个奇怪的梦。梦里你站在一座高山之巅，云海翻腾，一个声音在耳边说：'道在脚下...'",
        choices: [
            { text: "试着记住梦中的感悟", effect: { DAO: 2, INT: 1, history: "醒来后你隐约记得梦中的一些画面，似乎暗藏天机。" } },
            { text: "只当是日有所思", effect: { MOOD: 1, history: "一觉醒来，什么都记不清了。不过梦中那种飘然的感觉令人神往。" } }
        ]
    },
    {
        id: "EVT_MORTAL_RIVER_FISH",
        title: "河畔垂钓",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 8 }
        ],
        probability: 0.15,
        content: "夏日午后，你在村后的小河边钓鱼。蝉鸣声声，水面上波光粼粼。一切都很宁静...",
        choices: [
            { text: "耐心等待鱼上钩", effect: { WIL: 1, DAO: 1, history: "你等了整整一个下午，终于钓到一条大鱼。你觉得等待本身也是一种修行。" } },
            { text: "下河摸鱼", effect: { STR: 1, SPD: 1, MOOD: 3, history: "你甩掉鞋子跳进河里，虽然没抓到几条鱼，但玩得不亦乐乎。" } },
            { text: "坐在河边发呆", effect: { MOOD: 2, DAO: 1, history: "你看着水面上树影婆娑，心中一片宁静。什么都不想做，什么都不想，就这样坐着。" } }
        ]
    },
    {
        id: "EVT_MORTAL_GRANDPA_STORY",
        title: "长辈往事",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 8 },
            { type: 'AGE', op: 'LTE', value: 20 }
        ],
        probability: 0.12,
        content: "村里最年长的族老在大槐树下讲古。他说年轻时曾亲眼见过一位仙人在天上飞过...",
        choices: [
            { text: "追问仙人的细节", effect: { INT: 1, DAO: 1, history: "族老说那仙人踩着一把光芒四射的飞剑，眨眼间就消失在了云端。你的心中涌起了无限向往。" } },
            { text: "觉得是编的", effect: { WIL: 1, history: "你不太信这些故事。但族老认真的表情让你又有些动摇。" } }
        ]
    },
    {
        id: "EVT_MORTAL_MARTIAL_SHOW",
        title: "武馆开张",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 }
        ],
        probability: 0.08,
        content: "镇上新开了一家武馆，馆主是个面带疤痕的壮汉，据说是从外地退下来的镖师。他在门口表演了一套虎拳，虎虎生风...",
        choices: [
            { text: "拜师学艺", conditions: [{ type: 'STAT', target: 'MONEY', op: 'GTE', value: 5 }], effect: { MONEY: -5, STR: 3, SPD: 1, history: "你交了束修，馆主收了你做徒弟。每天天不亮就要起来蹲马步。" } },
            { text: "在旁边偷学", effect: { STR: 1, INT: 1, history: "你没钱拜师，但每天都来看别人练功。久而久之，倒也学到了一些粗浅的招式。" } },
            { text: "不感兴趣", effect: { MOOD: 0, history: "你觉得舞刀弄枪不如多读两本书。" } }
        ]
    },
    {
        id: "EVT_MORTAL_FRIEND_DEPART",
        title: "好友远行",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 14 }
        ],
        probability: 0.1,
        content: "你最好的朋友要跟着家人搬去别的地方了。临别时他塞给你一个用麻绳编的手环说：'别忘了我。'",
        choices: [
            { text: "把自己的竹笛送给他", effect: { CHR: 1, MOOD: -3, WIL: 1, history: "你们相视无言，最终在村口分别。你开始明白，人生就是不断的相聚与离别。" } },
            { text: "约定将来一定再见", effect: { WIL: 2, MOOD: -1, history: "你们拉钩许下约定。虽然不知道将来能不能实现，但这份友谊你会一直记得。" } }
        ]
    },
    {
        id: "EVT_MORTAL_NIGHT_SKY",
        title: "星夜遐想",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 }
        ],
        probability: 0.12,
        content: "晴朗的夜空繁星密布，银河横亘天际。你躺在草地上仰望苍穹，觉得自己无比渺小...",
        choices: [
            { text: "思考天地万物的奥秘", effect: { DAO: 2, INT: 1, history: "你望着星空，突然对天地间的规律有了一丝懵懂的感悟。" } },
            { text: "就这样安静地躺着", effect: { MOOD: 5, history: "你什么都不想，只是静静地看着满天星斗。内心前所未有地平静。" } }
        ]
    },
    {
        id: "EVT_MORTAL_COOKING_LEARN",
        title: "学做饭菜",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 10 },
            { type: 'AGE', op: 'LTE', value: 18 }
        ],
        probability: 0.12,
        content: "母亲开始教你做饭。烧火、切菜、掌勺，看起来简单的事情做起来却手忙脚乱...",
        choices: [
            { text: "认真学习", effect: { INT: 1, CON: 1, history: "经过几次失败后，你终于做出了一道像样的菜。母亲尝了一口，欣慰地笑了。" } },
            { text: "把厨房弄得一团糟", effect: { MOOD: -1, history: "你不小心打翻了油锅，差点着了火。母亲又好气又好笑地赶你出了厨房。" } }
        ]
    }
];

export const EVENTS_MORTAL: GameEvent[] = _EVENTS_MORTAL.map(e => ({
    ...e,
    conditions: [
        ...(e.conditions || []),
        { type: 'REALM', op: 'EQ', value: 0 },
        { type: 'AGE', op: 'GTE', value: 3 }
    ]
}));
