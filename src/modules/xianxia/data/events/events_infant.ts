import type { GameEvent } from '../../../../types';

export const EVENTS_INFANT: GameEvent[] = [
    // ═══ 0~2岁 婴幼儿事件 ═══
    {
        id: "EVT_INF_WALK",
        title: "蹒跚学步",
        conditions: [
            { type: 'AGE', op: 'LT', value: 3 },
            { type: 'AGE', op: 'GT', value: 0 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.3,
        content: "你开始尝试蹒跚学步，虽然经常摔倒，但身体逐渐变得结实。你在院子里迈出了人生的第一步...",
        choices: [
            { text: "跌跌撞撞地走", effect: { STR: 1, history: "你1岁多时学会了走路，体魄略微增强。" } },
            { text: "爬来爬去更自在", effect: { SPD: 1, history: "比起走路，你更喜欢到处爬，手脚倒是灵活得很。" } },
            { text: "扒着桌腿站着不动", effect: { WIL: 1, history: "你倔强地站着不肯坐下，虽然摇摇晃晃，但意志坚定。" } }
        ]
    },
    {
        id: "EVT_INF_SPEAK",
        title: "牙牙学语",
        conditions: [
            { type: 'AGE', op: 'LT', value: 3 },
            { type: 'AGE', op: 'GT', value: 0 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.3,
        content: "你开始牙牙学语，聪慧的眼神让父母十分惊喜。家人们争相逗你说话...",
        choices: [
            { text: "叫爹娘", effect: { CHR: 1, history: "你奶声奶气地叫出了爹娘，全家人乐开了花。" } },
            { text: "念叨奇怪的字", effect: { INT: 1, DAO: 1, history: "你嘴里念叨着谁也听不懂的字眼，仿佛在背诵什么经文。" } },
            { text: "指着天空咿呀", effect: { POT: 1, history: "你总是指着天空咿咿呀呀，似乎能看到常人看不到的东西。" } }
        ]
    },
    {
        id: "EVT_INF_TOY",
        title: "抓周之喜",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 1 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 1.0,
        content: "你满岁了，父母为你举办了抓周仪式。桌子上摆满了各种物件：小木剑、旧书本、金元宝、泥娃娃...",
        choices: [
            { text: "抓木制小剑", effect: { POT: 2, history: "你抓周时选了小剑，似乎有尚武修仙之姿。" } },
            { text: "抓旧书本", effect: { INT: 2, history: "你抓周时选了旧书，显示出过人的聪慧。" } },
            { text: "抓大金元宝", effect: { MONEY: 50, LUCK: 1, history: "你抓周时选了元宝，父母大喜，认定你是个赚钱好手。" } },
            { text: "呼呼大睡", effect: { CON: 2, history: "你抓周时只是呼呼大睡，体质倒是极好。" } }
        ]
    },
    {
        id: "EVT_INF_STARS",
        title: "仰望星空",
        conditions: [
            { type: 'AGE', op: 'EQ', value: 2 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.5,
        content: "夏夜，你躺在竹席上看着满天繁星。不知为何，那些星星的轨迹在你的眼中仿佛有着某种神秘的规律...",
        choices: [
            { text: "试着用手去抓星星", effect: { POT: 1, history: "你伸手去抓星星，虽然什么都没抓到，但对天地灵气有了本能的感知。" } },
            { text: "安静地看着发呆", effect: { INT: 1, DAO: 1, history: "幼年的你常常盯着星空发呆，似乎在参悟天道。" } },
            { text: "指给父母看", effect: { CHR: 1, history: "你拉着父母一起看星星，享受着家庭的温馨。" } }
        ]
    },
    {
        id: "EVT_INF_STRANGER",
        title: "陌生访客",
        conditions: [
            { type: 'AGE', op: 'LT', value: 3 },
            { type: 'AGE', op: 'GT', value: 0 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.15,
        content: "一个行脚道人路过你家门口，他看了你一眼，忽然露出了意味深长的微笑...",
        choices: [
            { text: "对他咧嘴笑", effect: { LUCK: 1, KARMA: 2, history: "道人摸了摸你的头，低声说了几句谁也没听清的话便离去了。" } },
            { text: "哇哇大哭", effect: { WIL: 1, history: "你被陌生人吓哭了，母亲赶忙把你抱进屋里。不过你的警觉心似乎很强。" } },
            { text: "好奇地盯着他", effect: { INT: 1, POT: 1, history: "你直直地盯着道人，道人点了点头说道：'此子将来必有造化。'" } }
        ]
    },
    {
        id: "EVT_INF_ANIMAL",
        title: "灵犬相伴",
        conditions: [
            { type: 'AGE', op: 'LT', value: 3 },
            { type: 'AGE', op: 'GT', value: 0 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.15,
        content: "一只不知从哪来的大黄狗总是守在你的摇篮旁边，寸步不离。父母试图赶走它，但它总是回来...",
        choices: [
            { text: "和它一起玩", effect: { CHR: 1, MOOD: 3, history: "你把大黄狗当成了最好的玩伴，整天骑在它背上咯咯笑。" } },
            { text: "分食给它吃", effect: { KARMA: 2, history: "你把自己的口粮分给大黄狗，善良的天性初现端倪。" } }
        ]
    },
    {
        id: "EVT_INF_DREAM",
        title: "奇异梦境",
        conditions: [
            { type: 'AGE', op: 'LT', value: 3 },
            { type: 'AGE', op: 'GT', value: 0 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.1,
        content: "你在睡梦中发出了奇怪的光芒，父母惊醒后发现你安然无恙，只是额头上似乎多了一个淡淡的印记...",
        choices: [
            { text: "记住那个梦", effect: { DAO: 2, history: "你梦见了一片金光灿烂的仙境，醒来后虽然忘了大半，但心中留下了向往。" } },
            { text: "什么都不记得了", effect: { LUCK: 2, history: "虽然你什么都不记得，但那道光芒似乎在你体内留下了什么。" } }
        ]
    },

    // ═══ 3~5岁 幼童事件 ═══
    {
        id: "EVT_INF_PLAYMATES",
        title: "小伙伴",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.3,
        content: "村里的孩子们邀你一起玩耍。有人想玩打仗，有人想捉迷藏，有人想下河摸鱼...",
        choices: [
            { text: "当孩子王指挥打仗", effect: { STR: 1, CHR: 1, history: "你指挥小伙伴们分成两队打仗，颇有几分将帅风范。" } },
            { text: "独自去河边摸鱼", effect: { SPD: 1, LUCK: 1, history: "你一个人跑去河边摸鱼，竟然摸到了一条金色的小鱼。" } },
            { text: "躲在角落看蚂蚁搬家", effect: { INT: 1, DAO: 1, history: "你蹲在角落看了一整天蚂蚁搬家，从中悟出了一些道理。" } }
        ]
    },
    {
        id: "EVT_INF_FALL",
        title: "树上跌落",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "你爬上了村口那棵大树想摘果子，不料脚一滑从树上跌了下来...",
        choices: [
            { text: "哭着找娘", effect: { MOOD: -3, CON: 1, history: "你摔得不轻，但骨头倒是硬，养了几天就好了。" } },
            { text: "忍着痛爬上去再摘", effect: { STR: 1, WIL: 1, history: "你咬着牙又爬了上去，这回终于摘到了果子！性格倔强如斯。" } },
            { text: "研究怎样才不会摔", effect: { INT: 1, history: "你仔细观察了树枝的粗细和位置，下次再爬时如履平地。" } }
        ]
    },
    {
        id: "EVT_INF_OLDMAN_STORY",
        title: "老人讲古",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 6 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.25,
        content: "村里的老人在大树下给孩子们讲故事，说的是关于仙人和妖怪的传说...",
        choices: [
            { text: "听得入了迷", effect: { INT: 1, DAO: 1, history: "老人说曾有仙人在这附近飞过。从此你的心中种下了一颗求道的种子。" } },
            { text: "追问仙人住在哪里", effect: { POT: 1, history: "你追着老人问仙人住在哪里，老人笑着说：'仙缘可遇不可求。'" } },
            { text: "觉得是骗人的", effect: { WIL: 1, history: "你才不信这些鬼话，心想长大了亲自去看看。" } }
        ]
    },
    {
        id: "EVT_INF_BUTTERFLY",
        title: "追蝶戏花",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "春日午后，一只七彩蝴蝶翩翩飞过。你追着它跑进了后山的花丛中...",
        choices: [
            { text: "小心翼翼地抓住它", effect: { SPD: 1, history: "你追了好一会儿终于抓住了蝴蝶，手脚变得更加灵活了。" } },
            { text: "看它落在花上采蜜", effect: { INT: 1, MOOD: 2, history: "你安静地看着蝴蝶采蜜，感受到了自然的美好。" } },
            { text: "发现花丛中有奇怪的草", effect: { LUCK: 1, history: "你在花丛中发现了一株散发着淡淡光芒的小草，带回家后被父亲收好了。" } }
        ]
    },
    {
        id: "EVT_INF_RAIN_PLAY",
        title: "雨中嬉戏",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 6 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "下雨了，别的孩子都跑回了家，你却站在雨中张开双臂...",
        choices: [
            { text: "在雨中尽情奔跑", effect: { STR: 1, MOOD: 2, history: "你在雨中跑得浑身湿透，却开心得不得了。" } },
            { text: "感受雨滴落在身上", effect: { DAO: 1, history: "你闭上眼感受着雨水的节奏，似乎隐约触碰到了天地的脉搏。" } },
            { text: "用泥巴堆东西", effect: { CHR: 1, history: "你用泥巴捏出了各种小人，手艺比同龄人巧多了。" } }
        ]
    },

    // ═══ 随机奇遇（0~5岁） ═══
    {
        id: "EVT_INF_RARE_JADE",
        title: "石中玉",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 2 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.08,
        content: "你在河边捡到一块奇怪的石头，敲开后里面竟然有一块温润的玉石，触手生温...",
        choices: [
            { text: "藏在枕头底下", effect: { LUCK: 2, POT: 1, history: "你把玉石藏在枕头下当宝贝，每晚都睡得特别安稳，身体也似乎在慢慢变好。" } },
            { text: "送给母亲", effect: { KARMA: 3, CHR: 1, history: "你把玉石送给了母亲，母亲感动得红了眼眶，将它做成了一个挂坠给你戴上。" } },
            { text: "好奇地舔一舔", effect: { CON: 2, history: "你把玉石放进嘴里舔了舔，一股清凉之气涌入体内，你感觉浑身舒畅。" } }
        ]
    },
    {
        id: "EVT_INF_CRANE",
        title: "白鹤掠影",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.06,
        content: "一只通体雪白的仙鹤从天空掠过，它在你头顶盘旋了一圈后留下了一根羽毛缓缓飘落在你面前...",
        choices: [
            { text: "将羽毛插在头上", effect: { LUCK: 2, history: "你把仙鹤羽毛插在头上玩，一股暖流涌入全身。这是仙禽的恩赐。" } },
            { text: "交给父亲收好", effect: { KARMA: 1, MONEY: 20, history: "父亲看到仙鹤羽毛惊了一跳，将它卖给了行商换了不少银两。" } }
        ]
    },

    // ═══ 新增：日常生活事件（0~5岁） ═══
    {
        id: "EVT_INF_FIRST_SNOW",
        title: "初见落雪",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'LTE', value: 3 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "冬天的第一场雪悄然降临。你第一次看见白茫茫的世界，呆住了...",
        choices: [
            { text: "伸手去接雪花", effect: { INT: 1, MOOD: 3, history: "你伸出小手接住一朵雪花，看它在掌心融化，咯咯地笑了起来。" } },
            { text: "裹着棉袄不肯出门", effect: { CON: 1, history: "你紧紧裹在棉袄里，只从门缝里往外看。母亲说你怕冷的样子像只小仓鼠。" } }
        ]
    },
    {
        id: "EVT_INF_NEIGHBOR_VISIT",
        title: "邻家小孩",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 2 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.25,
        content: "隔壁家的孩子来串门，手里拿着一个你没见过的布老虎玩具。他想和你交换你最喜欢的竹马...",
        choices: [
            { text: "爽快交换", effect: { CHR: 1, MOOD: 1, history: "你们交换了玩具，从此成了形影不离的玩伴。" } },
            { text: "犹豫再三拒绝了", effect: { WIL: 1, MOOD: -1, history: "你舍不得心爱的竹马，但看到邻家孩子失望的表情，又有些不忍。" } },
            { text: "两个一起玩", effect: { INT: 1, CHR: 1, history: "你提议两人的玩具放在一起玩，彼此都很开心。" } }
        ]
    },
    {
        id: "EVT_INF_FIRST_FEVER",
        title: "初次发热",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 0 },
            { type: 'AGE', op: 'LTE', value: 2 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.15,
        content: "你突然发了高烧，小脸烧得通红。母亲急得一夜没合眼，用湿毛巾给你敷额头...",
        choices: [
            { text: "安静地忍耐", effect: { WIL: 1, CON: 1, history: "你虽然难受，但一声不吭。退烧后体质反而变好了一些。" } },
            { text: "哭闹不止", effect: { CHR: -1, HP: -1, history: "你哭了整整一夜，嗓子都哑了。好在第二天烧退了。" } }
        ]
    },
    {
        id: "EVT_INF_HARVEST_FEST",
        title: "丰收时节",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "秋天到了，村里庄稼大丰收。大人们忙着收割，你在田边的稻草堆里钻来钻去...",
        choices: [
            { text: "帮忙搬稻穗", effect: { STR: 1, KARMA: 1, history: "你虽然搬不了多少，但父母看得很欣慰。" } },
            { text: "在稻草堆里打滚", effect: { MOOD: 3, history: "你在金黄的稻草堆里打了一整天的滚，开心得不想回家。" } },
            { text: "抓田里的蟋蟀", effect: { SPD: 1, history: "你在稻田里抓到了好几只大蟋蟀，成了孩子们羡慕的对象。" } }
        ]
    },
    {
        id: "EVT_INF_THUNDER_NIGHT",
        title: "雷雨之夜",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 1 },
            { type: 'AGE', op: 'LTE', value: 4 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "深夜一声炸雷惊醒了你。窗外电闪雷鸣，大雨如注。你蜷缩在被窝里，有些害怕...",
        choices: [
            { text: "钻进父母被窝", effect: { MOOD: 1, history: "你缩在父母中间，很快就安心地睡着了。" } },
            { text: "鼓起勇气看闪电", effect: { WIL: 1, DAO: 1, history: "你看着天空中劈裂的闪电，心中竟不再恐惧，反而生出一股说不清的亢奋。" } }
        ]
    },
    {
        id: "EVT_INF_COOKING_SMELL",
        title: "灶间飘香",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 2 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.25,
        content: "母亲正在灶台前炖着一锅浓浓的骨头汤，香味飘满了整个院子。你的肚子咕噜咕噜地叫了起来...",
        choices: [
            { text: "帮忙烧火", effect: { CON: 1, KARMA: 1, history: "你帮母亲往灶膛里添柴，虽然弄得满脸黑灰，但汤格外好喝。" } },
            { text: "眼巴巴地等着吃", effect: { MOOD: 2, history: "你蹲在灶台前等了整整一个时辰，喝到汤时觉得这是世上最美味的东西。" } }
        ]
    },
    {
        id: "EVT_INF_MARKET_DAY",
        title: "赶集日",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "每月十五是赶集日。父亲带你去镇上赶集，集市上人山人海，什么都有卖的...",
        choices: [
            { text: "缠着要糖人", effect: { MOOD: 3, MONEY: -1, history: "父亲无奈地掏钱给你买了个糖人，你高兴得蹦蹦跳跳。" } },
            { text: "看杂耍表演", effect: { INT: 1, history: "你看见有人变戏法，看得目瞪口呆，一直在琢磨那些东西是怎么变出来的。" } },
            { text: "紧紧跟着父亲", effect: { WIL: 1, history: "人太多了，你紧紧拉着父亲的衣角，生怕走丢了。" } }
        ]
    },
    {
        id: "EVT_INF_SPRING_FLOWERS",
        title: "春日花开",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 2 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "春天来了，漫山遍野的野花竞相开放。整个村子都笼罩在花香之中...",
        choices: [
            { text: "摘一束送给母亲", effect: { CHR: 1, KARMA: 1, history: "你抱着一大把野花跑回家，母亲弯腰接过花，眼角有些湿润。" } },
            { text: "追蜜蜂追到山上去了", effect: { SPD: 1, MOOD: 2, history: "你追着蜜蜂跑了好远，虽然最后迷了一小会儿路，但看到了村子里从没见过的景色。" } }
        ]
    },
    {
        id: "EVT_INF_MOONLIT_NIGHT",
        title: "月夜蛙鸣",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 3 },
            { type: 'AGE', op: 'LTE', value: 5 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.15,
        content: "夏夜，月光如水，稻田里蛙声一片。你搬了张小凳子坐在院子里乘凉...",
        choices: [
            { text: "数萤火虫", effect: { INT: 1, MOOD: 2, history: "你数了好几百只萤火虫，数着数着就趴在凳子上睡着了。" } },
            { text: "听蛙鸣入了迷", effect: { DAO: 1, history: "蛙声整齐如同吟唱，你静静听着，感受到一种说不清的宁静。" } }
        ]
    },
    {
        id: "EVT_INF_FATHER_TEACH",
        title: "父亲教导",
        conditions: [
            { type: 'AGE', op: 'GTE', value: 4 },
            { type: 'AGE', op: 'LTE', value: 6 },
            { type: 'REALM', op: 'EQ', value: 0 }
        ],
        probability: 0.2,
        content: "父亲在院子里教你认字和算数。虽然只是简单的笔画和加减法，但你学得很认真...",
        choices: [
            { text: "努力多认几个字", effect: { INT: 2, history: "你接下来几天反复练习，已经能认识二十多个字了。" } },
            { text: "比起认字更想听故事", effect: { INT: 1, DAO: 1, history: "父亲无奈地给你讲了几个修仙者的传说，你听得如痴如醉。" } }
        ]
    }
];
