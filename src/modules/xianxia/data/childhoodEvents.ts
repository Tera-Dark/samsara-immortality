
import type { GameEvent } from '../../../types';

export const CHILDHOOD_EVENTS: GameEvent[] = [
    // --- 0岁 (Infant) [0-0] ---
    { id: 'evt_c_0_1', content: "整天除了吃就是睡，长得白白胖胖。", conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 0 }], effect: { STR: 1, HP: 1 } },
    { id: 'evt_c_0_2', content: "半夜经常大哭，吵得邻居不得安宁。", conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 0 }], effect: { CHR: -1, MOOD: -1 } },
    { id: 'evt_c_0_3', content: "对周围的一切都充满好奇，瞪着大眼睛四处张望。", conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 0 }], effect: { INT: 1 } },
    { id: 'evt_c_0_4', content: "抓着父亲的手指不肯松开，力气还不小。", conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 0 }], effect: { STR: 1 } },
    { id: 'evt_c_0_5', content: "虽然是婴儿，但眼神中透着一股机灵劲。", conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 0 }], effect: { INT: 1, POT: 1 } },
    { id: 'evt_c_0_6', content: "体弱多病，经常咳嗽，让父母操碎了心。", conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 0 }], effect: { HP: -1, WIL: 1 } },

    // --- 1-2岁 (Toddler) [1-2] ---
    { id: 'evt_c_1_1', content: "学会了走路，虽然摇摇晃晃，但很少摔跤。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { SPD: 1 } },
    { id: 'evt_c_1_2', content: "开口说的第一句话竟然是“道”，让父母摸不着头脑。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { DAO: 1, INT: 1 } },
    { id: 'evt_c_1_3', content: "喜欢在泥潭里打滚，弄得浑身是泥。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { MOOD: 2, CHR: -1 } },
    { id: 'evt_c_1_4', content: "尝试追逐家里的鸡鸭，展现出惊人的活力。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { SPD: 1, STR: 1 } },
    { id: 'evt_c_1_5', content: "挑食，死活不肯吃青菜。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { STR: -1, WIL: 1 } },
    { id: 'evt_c_1_6', content: "模仿大人的动作，逗得全家人哈哈大笑。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { CHR: 1, MOOD: 2 } },
    { id: 'evt_c_1_7', content: "不论拿到什么东西都往嘴里塞。", conditions: [{ type: 'AGE', op: 'GTE', value: 1 }, { type: 'AGE', op: 'LTE', value: 2 }], effect: { CON: 1, INT: -1 } },

    // --- 抓周事件 (1岁独占) ---
    {
        id: 'evt_c_1_choice_zhuazhou',
        content: "你满周岁了，父母在桌上摆满了各种物件让你抓周。你摇摇晃晃地爬上桌子...",
        conditions: [{ type: 'AGE', op: 'EQ', value: 1 }],
        choices: [
            { text: "抓向那本书卷", effect: { INT: 3, history: "你紧紧抓着书卷不放，父母高兴地说你将来必定是个读书种子。" } },
            { text: "握住了那柄木剑", effect: { STR: 2, WIL: 1, history: "你挥舞着木剑咯咯直笑，冥冥中似乎注定了你尚武的一生。" } },
            { text: "拿起了那个算盘", effect: { LUCK: 1, MONEY: 10, history: "你拨弄着算盘珠子，展现出对商贾之道的本能兴趣。" } },
            { text: "盯上了一块不知名的破石头", effect: { DAO: 3, POT: 2, history: "你无视了所有光鲜的物件，唯独抓住了用来压纸的一块奇石。父母面面相觑。" } }
        ]
    },

    // Danger: Illness
    {
        id: 'evt_c_danger_01',
        content: "突发高烧，浑身滚烫，父母急得像热锅上的蚂蚁。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 0 }, { type: 'AGE', op: 'LTE', value: 2 }],
        branches: [{
            check: [{ type: 'STAT', target: 'HP', op: 'GTE', value: 5 }],
            success: { text: "虽然大病一场，但你奇迹般地挺了过来。", effect: { HP: 1, WIL: 1 } },
            failure: { text: "高烧不退，这幼小的身体终究没能扛过去...", death: true }
        }]
    },

    // --- 3-5岁 (Childhood) [3-5] ---
    // Generic
    { id: 'evt_c_3_1', content: "和其他孩子打架打赢了，成为了孩子王。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { REP: 2, STR: 1 } },
    { id: 'evt_c_3_2', content: "捉迷藏的时候躲在树洞里睡着了，全村人找了你一晚上。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { WIL: 1, REP: -1 } },
    { id: 'evt_c_3_3', content: "用泥巴捏了一个小人，栩栩如生。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { INT: 1, CHR: 1 } },
    { id: 'evt_c_3_4', content: "听过一遍的童谣就能完整背诵下来。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { INT: 2 } },
    { id: 'evt_c_3_5', content: "偷吃家里的糖果被发现了，还死不承认。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { WIL: 1, CHR: -1 } },
    { id: 'evt_c_3_6', content: "在河边捡到一块漂亮的石头，当宝贝收着。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { LUCK: 1, MOOD: 2 } },
    { id: 'evt_c_3_7', content: "看到路边的小乞丐，把自己的馒头分给了他。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { KARMA: 2, CHR: 1 } },
    { id: 'evt_c_3_8', content: "把邻居家的小狗惹毛了，被追了两条街。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { SPD: 2 } },
    { id: 'evt_c_3_9', content: "独自一人坐在屋顶看星星，在这个年纪显得格格不入。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { DAO: 1, WIL: 1 } },
    { id: 'evt_c_3_10', content: "试图拆开父亲的工具看里面的构造。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { INT: 1, MOOD: 1 } },

    // --- 3-5岁 有选择的事件 ---
    {
        id: 'evt_c_3_choice_beggar',
        content: "你在村口看到一个衣衫褴褛的老乞丐，饿得面黄肌瘦。你手里恰好有半个馒头。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }],
        choices: [
            { text: "把馒头分给他", effect: { KARMA: 3, CHR: 1, history: "老乞丐接过馒头，浑浊的双眼中似乎闪过一丝精光。他摸了摸你的头，低声说了句什么便离去了。" } },
            { text: "犹豫后跑开了", effect: { MOOD: -1, history: "你跑开以后心里一直不太舒服。" } },
            { text: "把他带回家让母亲给他饭吃", effect: { KARMA: 5, history: "母亲虽然叹了口气但还是盛了一碗粥。老乞丐临走前留下了一枚生锈的铜钱。" } }
        ]
    },
    {
        id: 'evt_c_3_choice_stone',
        content: "你在河边玩耍时，发现水底有一块隐隐发光的石头。水流湍急，看起来有些危险。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }],
        choices: [
            { text: "冒险下水去捡", effect: { LUCK: 2, POT: 1, HP: -1, history: "你被水冲了个趔趄，好不容易才捞到那块石头。回家后发现它在夜里能微微发光。" } },
            { text: "找根树枝去够", effect: { INT: 2, history: "你聪明地找了根长树枝，把石头拨到了浅水区再捡起来。虽然没带回什么宝贝，但展现了超出年龄的智慧。" } },
            { text: "不管它", effect: { WIL: 1, history: "你看了看湍急的水流，摇了摇头，安全比什么都重要。" } }
        ]
    },
    {
        id: 'evt_c_3_choice_bully',
        content: "村里的大孩子在欺负一个比你还小的小女孩，把她的布偶抢走了。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }],
        choices: [
            { text: "冲上去揍他", effect: { STR: 1, REP: 2, HP: -1, history: "你虽然被打得鼻青脸肿，但成功抢回了布偶。小女孩泣不成声地向你道谢。" } },
            { text: "去叫大人来帮忙", effect: { INT: 1, REP: 1, history: "你跑去找了大人，那个欺负人的孩子被狠狠训了一顿。" } },
            { text: "假装没看见", effect: { MOOD: -2, history: "你低着头走开了，心里有些不是滋味。" } }
        ]
    },
    {
        id: 'evt_c_3_choice_mystery_monk',
        content: "村里来了一个疯疯癫癫的和尚，逢人便笑。他在你家讨水喝时，突然盯着你看了很久。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }],
        choices: [
            { text: "恭敬地递上水碗", effect: { KARMA: 3, CHR: 1, history: "和尚笑着摸了摸你的头：'好孩子，结个善缘。'你觉得脑子突然变得清明了些。" } },
            { text: "害怕地躲在门后", effect: { WIL: -1, history: "和尚摇了摇头，叹息着离开了。" } },
            { text: "好奇地问他为什么笑", effect: { INT: 1, DAO: 2, history: "和尚收起笑容，肃然答道：'笑世人看不穿，笑红尘皆是梦。'这几句话深深印在了你幼小的心里。" } }
        ]
    },

    // --- 3-5岁 日常生活事件 ---
    { id: 'evt_c_3_daily_1', content: "春天来了，院子里的桃花开得正好。你帮母亲扫院子里的落花。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { MOOD: 2, CHR: 1 } },
    { id: 'evt_c_3_daily_2', content: "大雪封门，一家人围着火炉烤红薯吃。窗外白茫茫一片。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { MOOD: 3, CON: 1 } },
    { id: 'evt_c_3_daily_3', content: "中秋节，全家人一起在院子里赏月吃月饼。你听父亲讲嫦娥奔月的故事。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { MOOD: 3, INT: 1 } },
    { id: 'evt_c_3_daily_4', content: "跟着母亲去赶集，集市上人来人往，各种叫卖声不绝于耳。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { INT: 1 } },
    { id: 'evt_c_3_daily_5', content: "夏天太热了，你躺在竹床上扇着蒲扇，听蝉鸣声声。日子平淡而悠长。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }], effect: { MOOD: 1 } },

    // Farmer
    { id: 'evt_c_3_f1', content: "帮着家里喂猪，差点被猪拱倒。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'AGE_BG_FARMER' }], effect: { STR: 1, MOOD: -1 } },
    // Note: We need to set flags like AGE_BG_FARMER during initLife or rely on engine to check dynamic requirements?
    // Engine v2 requirements schema has `reqGender`, `reqRace`. Background is not standard yet. 
    // Plan: We should use `reqStats` or `reqFlags`. Let's assume we add `BG_FARMER` flag to player options or check `background` property manually.
    // For specific childhood "background" field, let's keep it simple by adding the flag check in conditions.
    // I will assume player has flags: 'BG_FARMER', 'BG_RICH', 'BG_CULTIVATOR'. I need to ensure Init adds this flag.

    { id: 'evt_c_3_f2', content: "在田埂上抓了一只特别大的蚂蚱。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }], effect: { MOOD: 2, SPD: 1 } },
    { id: 'evt_c_3_f3', content: "跟着父母下地，虽然帮不上忙，但也晒得像个小泥鳅。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }], effect: { CON: 1 } },

    // Rich
    { id: 'evt_c_3_r1', content: "挑食不肯吃青菜，被奶娘哄了半天才肯张嘴。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { HP: 1, WIL: -1 } },
    { id: 'evt_c_3_r2', content: "把父亲心爱的砚台当积木玩，摔了个粉碎。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { MOOD: -5, MONEY: -2 } },
    { id: 'evt_c_3_r3', content: "家里来了很多客人，你怯生生地躲在屏风后面。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { CHR: -1, WIL: 1 } },

    // Cultivator
    { id: 'evt_c_3_c1', content: "模仿父亲打坐的样子，竟然有模有样。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { DAO: 1, INT: 1 } },
    { id: 'evt_c_3_c2', content: "把母亲炼废的丹药当糖豆吃了，味道怪怪的。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { CON: 2, MP: 1 } },
    { id: 'evt_c_3_c3', content: "盯着墙上的符箓看了一整天，觉得那些线条在动。", conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 5 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { INT: 2 } },

    // Danger: Kidnapping
    {
        id: 'evt_c_danger_02',
        content: "遇到一个人贩子拿糖葫芦诱惑你。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 3 }, { type: 'AGE', op: 'LTE', value: 6 }],
        branches: [{
            check: [{ type: 'STAT', target: 'INT', op: 'GTE', value: 5 }],
            success: { text: "你察觉到不对劲，大声呼救把坏人吓跑了。", effect: { INT: 2, WIL: 2 } },
            failure: { text: "你贪吃糖葫芦被迷晕带走，从此不知所踪...", death: true }
        }]
    },

    // --- 6-9岁 (School Age) [6-9] ---
    // Generic
    { id: 'evt_c_6_1', content: "开始帮家里分担家务，变得懂事了。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { REP: 2, WIL: 1 } },
    { id: 'evt_c_6_2', content: "在私塾偷听先生讲课，认得几个字了。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { INT: 2 } },
    { id: 'evt_c_6_3', content: "捡到一只受伤的小鸟，悄悄把它养大放飞。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { KARMA: 2, CHR: 1 } },
    { id: 'evt_c_6_4', content: "和伙伴们爬树掏鸟窝，身手矫健。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { SPD: 1, STR: 1 } },
    { id: 'evt_c_6_5', content: "被先生夸奖天资聪颖，心里美滋滋的。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { MOOD: 2, REP: 1 } },
    { id: 'evt_c_6_6', content: "因为调皮捣蛋被父亲狠狠揍了一顿。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { HP: -2, WIL: 2 } },
    { id: 'evt_c_6_7', content: "做了一个奇怪的梦，梦见自己飞到了云端。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { DAO: 1 } },
    { id: 'evt_c_6_8', content: "尝试自己做饭，结果差点把厨房烧了。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { INT: -1, LUCK: -1 } },
    { id: 'evt_c_6_9', content: "在集市上看到杂耍艺人表演，看得目不转睛。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { INT: 1, MOOD: 1 } },
    { id: 'evt_c_6_10', content: "帮邻居写家书，赚了几文钱。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { MONEY: 1, REP: 1 } },

    // --- 6-9岁 有选择的事件 ---
    {
        id: 'evt_c_6_choice_stray',
        content: "你在山脚下发现一只受伤的小野兔，后腿被夹子夹住了，还在挣扎。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }],
        choices: [
            { text: "小心翼翼地帮它松开夹子", effect: { KARMA: 3, INT: 1, history: "你花了好一会儿才打开夹子。小兔子被放开后，回头看了你一眼，然后一瘸一拐地跑进了灌木丛。" } },
            { text: "带回家养伤", effect: { KARMA: 2, CHR: 1, history: "你把小兔子抱回家让母亲帮忙包扎。它在你家养了半个月，伤好后依依不舍地离开了。" } },
            { text: "犹豫着走开了", effect: { MOOD: -1, history: "或许你帮不了它。但走远以后，你一整天都在想那只兔子的惨叫。" } }
        ]
    },
    {
        id: 'evt_c_6_choice_wanderer',
        content: "一个过路的说书先生在村口支了个摊子，讲得是飞天遁地的仙人故事。听完后他问你：'小家伙，你将来想做什么？'",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }],
        choices: [
            { text: "我要当大侠！", effect: { STR: 1, WIL: 1, history: "说书先生哈哈大笑：'有志气！'然后教了你一套野路子拳法。" } },
            { text: "我想读书考功名", effect: { INT: 2, history: "说书先生点了点头：'读书好啊，书中自有黄金屋。'他送了你一本旧书当礼物。" } },
            { text: "我要修仙成道！", effect: { DAO: 1, POT: 1, history: "说书先生脸上的笑意淡了一瞬，盯着你看了好一会儿才说：'好志向。但这条路...不好走。'" } }
        ]
    },
    {
        id: 'evt_c_6_choice_thief',
        content: "你亲眼看到隔壁王叔偷了村里公田的粮食藏起来。要不要去告发？",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }],
        choices: [
            { text: "悄悄告诉村长", effect: { KARMA: 2, REP: 1, history: "村长查实后惩罚了王叔。但王叔知道是你告的密后，见你就给白眼。" } },
            { text: "当面质问王叔", effect: { WIL: 2, REP: -1, history: "王叔恼羞成怒骂了你一顿，但之后再也没敢偷了。你年纪虽小，胆子倒不小。" } },
            { text: "当作没看见", effect: { MOOD: -1, history: "多一事不如少一事。但你心里知道，这样做是不对的。" } }
        ]
    },
    {
        id: 'evt_c_6_choice_found_martial_art',
        content: "和小伙伴在村后破庙玩捉迷藏时，你在一尊倒塌的泥像肚子里摸到了一卷残破的竹简。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }],
        choices: [
            { text: "悄悄藏起来自己研究", effect: { INT: 2, POT: 1, history: "虽然看不懂上面的古怪文字，但你照着图画比划，感觉力气变大了一些。" } },
            { text: "拿给村里的老学究看", effect: { REP: 1, WIL: 1, history: "老学究吓了一跳，说是些邪门歪道的打坐法门，让你赶快烧了。你有些遗憾，但也只好照做。" } },
            { text: "觉得没用，扔在一旁", effect: { LUCK: -1, history: "你嫌它扎手，随手丢在了杂草堆里。或许你错过了什么惊天机缘..." } }
        ]
    },

    // --- 6-9岁 日常生活事件 ---
    { id: 'evt_c_6_daily_1', content: "清明时节，跟着全家去给祖先扫墓。你第一次知道了爷爷的名字。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { MOOD: 1, KARMA: 1 } },
    { id: 'evt_c_6_daily_2', content: "端午节，你幸运地吃到了里面藏着铜钱的粽子，全家人都说你好运。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { LUCK: 1, MOOD: 2 } },
    { id: 'evt_c_6_daily_3', content: "秋天收获的季节，你帮忙晒谷子、搬柴火，累得腰酸背痛。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { STR: 1, CON: 1 } },
    { id: 'evt_c_6_daily_4', content: "连下了好几天的雨，哪儿也去不了，你只好在家里发呆。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { MOOD: -1 } },
    { id: 'evt_c_6_daily_5', content: "一个走街串巷的货郎来了，你用攒了好久的几文钱买了一个竹蜻蜓。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }], effect: { MOOD: 3, MONEY: -1 } },

    // Farmer
    { id: 'evt_c_6_f1', content: "农忙时节，你在田间送水，晒得黝黑。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }], effect: { STR: 1, CON: 1 } },
    { id: 'evt_c_6_f2', content: "在山上放牛，骑在牛背上睡着了。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }], effect: { MOOD: 2, DAO: 1 } },
    {
        id: 'evt_c_danger_snake',
        content: "上山砍柴遇到毒蛇！",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }],
        branches: [{
            check: [{ type: 'STAT', target: 'LUCK', op: 'GTE', value: 10 }],
            success: { text: "你眼疾手快，一镰刀将毒蛇斩断。", effect: { WIL: 2, REACTION: 1 } },
            failure: { text: "毒蛇咬中了你的脚踝，毒气攻心无可救药。", death: true }
        }]
    },

    // Rich
    { id: 'evt_c_6_r1', content: "家里请了武师教你强身健体。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { STR: 2, HP: 2 } },
    { id: 'evt_c_6_r2', content: "开始学习琴棋书画，虽然很枯燥，但气质提升了。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { CHR: 2, INT: 1 } },
    {
        id: 'evt_c_danger_kidnap2',
        content: "被绑匪盯上，试图绑架你勒索赎金。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }],
        branches: [{
            check: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 15 }],
            success: { text: "你拼命奔跑，钻进人群中甩掉了绑匪。", effect: { WIL: 5, REP: 5 } },
            failure: { text: "绑匪撕票，父亲交了赎金也没能换回你的命。", death: true }
        }]
    },

    // Cultivator
    { id: 'evt_c_6_c1', content: "被逼着背诵《灵草经》，虽然不懂意思但倒背如流。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { INT: 2, ALCHEMY: 1 } },
    { id: 'evt_c_6_c2', content: "偷偷用父亲的法剑削水果，锋利无比。", conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { ATK: 1 } },
    {
        id: 'evt_c_danger_qi',
        content: "练习引气诀时走火入魔！",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }],
        branches: [{
            check: [{ type: 'STAT', target: 'WIL', op: 'GTE', value: 15 }],
            success: { text: "你咬牙坚持，强行压下了乱窜的灵气。", effect: { MP: 20, WIL: 3 } },
            failure: { text: "灵气逆流冲断经脉，你七窍流血而亡。", death: true }
        }]
    },

    // Danger: Wild Dog (Generic)
    {
        id: 'evt_c_danger_dog',
        content: "村口的恶狗挣脱锁链向你扑来！",
        conditions: [{ type: 'AGE', op: 'GTE', value: 6 }, { type: 'AGE', op: 'LTE', value: 9 }],
        branches: [{
            check: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 10 }],
            success: { text: "你拔腿就跑，比狗还快！", effect: { SPD: 2, WIL: 2 } },
            failure: { text: "你跑得太慢被恶狗咬断了喉咙...", death: true }
        }]
    },

    // --- 10-14岁 (Youth) [10-14] ---
    // Generic
    { id: 'evt_c_10_1', content: "虽然年纪尚小，但已经有了几分大人的模样。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { CHR: 1 } },
    { id: 'evt_c_10_2', content: "常常思考人为什么要活着，显得有些早熟。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { DAO: 1, INT: 1 } },
    { id: 'evt_c_10_3', content: "第一次对异性产生了朦胧的好感。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { MOOD: 2, CHR: 1 } },
    { id: 'evt_c_10_4', content: "独自远行去县城，见识到了外面的世界。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { EXP: 5, WIL: 1 } },
    { id: 'evt_c_10_5', content: "遇到一个乞丐老头，非说你骨骼惊奇。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { LUCK: 2 } },
    { id: 'evt_c_10_6', content: "在灯会上猜中了所有的灯谜，赢得了满堂彩。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { REP: 3, INT: 1 } },
    { id: 'evt_c_10_7', content: "为了朋友两肋插刀，打了一架，挂了彩。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { REP: 2, HP: -2, JUST: 2 } },
    { id: 'evt_c_10_8', content: "开始规划自己的未来，不再浑浑噩噩。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { WIL: 2, AMBITION: 2 } },

    // --- 10-14岁 有选择的事件 ---
    {
        id: 'evt_c_10_choice_path',
        content: "你站在人生的岔路口。县城的书院招生、镇上的铁匠招学徒、远方的商队招伙夫。你该何去何从？",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }],
        choices: [
            { text: "去书院读书", effect: { INT: 3, REP: 1, history: "你踏入了书院的大门。从此，你将与诗书为伴，走上一条求知之路。" } },
            { text: "拜铁匠为师", effect: { STR: 3, CON: 1, history: "铁匠是个沉默寡言的汉子，但手上功夫了得。你开始了打铁的日子。" } },
            { text: "随商队远行", effect: { SPD: 2, EXP: 5, WIL: 1, history: "你背上包袱，跟着商队离开了故乡。外面的世界比你想象的更大。" } }
        ]
    },
    {
        id: 'evt_c_10_choice_treasure',
        content: "你在山洞里发现了一本泛黄的古书，上面画着奇怪的图案。旁边还有一个落满灰尘的匣子。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }],
        choices: [
            { text: "仔细研读古书", effect: { INT: 2, DAO: 2, history: "虽然大部分内容你看不懂，但书中的一些图案似乎描绘了某种呼吸吐纳之法……你记在了心里。" } },
            { text: "打开匣子看看", effect: { LUCK: 2, MONEY: 3, history: "匣子里是几块早已氧化发黑的银锭和一把锈迹斑斑的短匕。虽然不值什么钱，但对你来说是一笔巨款。" } },
            { text: "原样放好离开", effect: { WIL: 2, KARMA: 1, history: "你觉得这些东西的主人也许还会回来。你选择了不取分毫。" } }
        ]
    },
    {
        id: 'evt_c_10_choice_friend',
        content: "你交到了一个新朋友，但他的名声不太好——村里人都说他是个惯偷的无赖。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }],
        choices: [
            { text: "继续和他来往", effect: { CHR: -1, SPD: 2, history: "他教了你很多上树翻墙的本事。虽然声名受损，但你的身手越来越灵活了。" } },
            { text: "疏远他", effect: { WIL: 1, MOOD: -1, history: "你不再理会他。看着他落寞的背影，你心里有些不是滋味，但觉得这是对的。" } },
            { text: "试图劝他改邪归正", effect: { KARMA: 2, REP: 1, history: "你认真地跟他谈了一次。他虽然嘴上不说，但之后偷东西的次数确实少了。" } }
        ]
    },
    {
        id: 'evt_c_10_choice_black_market',
        content: "县城里一年一度的黑市开启了，听说里面有卖真正的神仙丹药。你偷偷攒了一些铜板。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }],
        choices: [
            { text: "花光积蓄买一颗'通脉丹'", effect: { MONEY: -10, HP: -20, CON: 2, history: "吃下药后你腹痛如绞，差点死掉。挺过去后，你发现自己的耐力确实变强了。" } },
            { text: "买一张画废的残缺符箓", effect: { MONEY: -5, INT: 3, DAO: 2, history: "这符箓虽然不能用，但上面的朱砂走势让你对天地灵气有了一丝玄妙的感悟。" } },
            { text: "太危险了，只是看看", effect: { WIL: 1, MOOD: 1, history: "你冷眼旁观，发现不少人都被骗了。你庆幸自己没有冲动消费。" } },
            { text: "买便宜的未知种子", effect: { LUCK: 2, MONEY: -2, history: "你买了一颗黑不溜秋的种子，不知道能种出什么。" } }
        ]
    },

    // --- 10-14岁 日常生活事件 ---
    { id: 'evt_c_10_daily_1', content: "过年了！你领到了人生中最大的一笔压岁钱，开心得睡不着觉。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { MOOD: 5, MONEY: 2 } },
    { id: 'evt_c_10_daily_2', content: "村里办庙会，你跟着人群挤来挤去，看了一出皮影戏。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { MOOD: 2, INT: 1 } },
    { id: 'evt_c_10_daily_3', content: "今年的冬天格外冷，雪下了三尺厚。你和小伙伴们堆了一个巨大的雪人。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { MOOD: 3, CHR: 1 } },
    { id: 'evt_c_10_daily_4', content: "母亲病了一场，你第一次承担起照顾家里的责任。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { WIL: 2, MOOD: -2, KARMA: 1 } },
    { id: 'evt_c_10_daily_5', content: "夏夜里，你与三五好友躺在打谷场上看流星，聊着各自的梦想。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }], effect: { MOOD: 3, DAO: 1 } },

    // Danger: Water
    {
        id: 'evt_c_danger_water',
        content: "和小伙伴下河游泳，突然腿抽筋了！",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }],
        branches: [{
            check: [{ type: 'STAT', target: 'STR', op: 'GTE', value: 15 }],
            success: { text: "凭借惊人的体力，你硬是游回了岸边。", effect: { STR: 2, WIL: 2 } },
            failure: { text: "你在水中挣扎许久，最终沉入了河底...", death: true }
        }]
    },

    // Farmer
    { id: 'evt_c_10_f1', content: "荒年饿肚子，只能啃树皮。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }], effect: { HP: -5, WIL: 5 } },
    { id: 'evt_c_10_f2', content: "参与村里的祭祀活动，祈求风调雨顺。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }], effect: { LUCK: 1 } },
    {
        id: 'evt_c_danger_bandit',
        content: "遭遇山贼洗劫村庄！",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_FARMER' }],
        branches: [{
            check: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 20 }],
            success: { text: "你带着家人躲进了深山，逃过一劫。", effect: { WIL: 5, REACTION: 2 } },
            failure: { text: "山贼屠村，你也未能幸免。", death: true }
        }]
    },

    // Rich
    { id: 'evt_c_10_r1', content: "整日在这个圈子里勾心斗角，在这个年纪学会了察言观色。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { INT: 2, CHR: 1 } },
    { id: 'evt_c_10_r2', content: "跟随父亲打理账目，展现出经商的天赋。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }], effect: { INT: 1, MONEY: 5 } },
    {
        id: 'evt_c_danger_debt',
        content: "家族生意失败，债主上门逼债，父亲被逼自尽。",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_RICH' }],
        branches: [{
            check: [{ type: 'STAT', target: 'WIL', op: 'GTE', value: 20 }],
            success: { text: "你强忍悲痛，立誓要重振家业。", effect: { WIL: 10, MOOD: -10 } },
            failure: { text: "你受不了家道中落的打击，郁郁而终。", death: true }
        }]
    },

    // Cultivator
    { id: 'evt_c_10_c1', content: "随家族长辈外出历练，见识了修仙界的残酷。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { WIL: 3, EXP: 10 } },
    { id: 'evt_c_10_c2', content: "尝试炼制第一炉丹药，虽然只是辟谷丹。", conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }], effect: { ALCHEMY: 2 } },
    {
        id: 'evt_c_danger_war',
        content: "家族被仇敌攻打，护山大阵将破！",
        conditions: [{ type: 'AGE', op: 'GTE', value: 10 }, { type: 'AGE', op: 'LTE', value: 14 }, { type: 'FLAG', op: 'EQ', value: 'BG_CULTIVATOR' }],
        branches: [{
            check: [{ type: 'STAT', target: 'SPD', op: 'GTE', value: 25 }],
            success: { text: "长辈拼死为你杀开一条血路，你逃出生天。", effect: { WIL: 10, LUCK: 5 } },
            failure: { text: "家族覆灭，你死在了乱战之中。", death: true }
        }]
    }
];

