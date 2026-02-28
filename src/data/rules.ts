export const GAME_RULES = {
    // 寿元加成 (Base 80 + Realm Bonus)
    // Indexes match REALMS: '凡人', '炼气', '筑基', '金丹', '元婴', '化神', etc.
    LIFESPAN_BONUSES: [0, 40, 120, 300, 800, 2000, 5000, 10000, 50000],
    BASE_LIFESPAN: 80,

    // 境界突破阈值 (Total Power Requirement)
    // Power = ROOT*2 + INT + STR
    REALM_THRESHOLDS: [8, 50, 150, 400, 1000, 3000, 8000, 20000, 80000],

    // 境界突破加成 (Per Attribute)
    // Formula in code was: (idx + 1) * 5. 
    // We can allow static config or keep formula. 
    // Let's use a base multiplier for now.
    REALM_BONUS_MULTIPLIER: 5,

    // 出身背景判定 (Based on LUCK)
    BACKGROUND_THRESHOLDS: {
        FARMER: 10, // < 10
        RICH: 20    // < 20, else CULTIVATOR
    },

    // 婴儿期事件 (0-3岁)
    INFANT_EVENTS: [
        '学会了翻身',
        '咿呀学语，试图叫“爹”',
        '看着窗外发呆',
        '被母亲抱在怀里哄睡',
        '尝试爬行',
        '抓住了父亲的胡子',
        '对家里的猫充满了好奇',
        '大哭了一场',
        '在摇篮里睡得很香',
        '尝试站立，但摔了个屁墩'
    ]
};

export const NPC_DESCRIPTIONS = {
    FATHER: {
        FARMER: "你的父亲，一个诚实肯干的农夫。",
        RICH: "你的父亲，镇上有名的富商。",
        CULTIVATOR: "你的父亲，家族中坚力量。"
    },
    MOTHER: {
        FARMER: "你的母亲，勤劳的农家妇女。",
        RICH: "你的母亲，知书达理的大家闺秀。",
        CULTIVATOR: "你的母亲，温柔贤淑。"
    },
    NAMER: {
        FARMER: "村里的老秀才",
        RICH: "你的父亲",
        CULTIVATOR: "家族长老"
    }
};

export const TEXT_CONSTANTS = {
    DEFAULT_NAME: "无名氏",
    BIRTH_LOG: "你出生了。",
    DEATH_LOG: "寿元已尽，道消身死...",
    BREAKTHROUGH_SUCCESS: "突破成功！晋升为【{realm}】！全属性 +{bonus}",
    EVENT_DEFAULT_TITLE: "突发事件",
    MYSTERIOUS_PERSON: "神秘人",
    STATS: {
        STR: "体魄",
        INT: "悟性",
        CHR: "魅力",
        LUCK: "气运",
        ROOT: "资质",
        POT: "资质",
        CON: "体质",
        HP: "生命",
        MP: "法力",
        MAX_HP: "气血上限",
        MAX_MP: "法力上限",
        MOOD: "心情",
        WIL: "意志",
        LIFESPAN: "寿元",
        POISON: "丹毒",
        FAME: "声望",
        REP: "声望",
        KARMA: "功德",
        MONEY: "灵石",
        ALCHEMY: "炼丹",
        ATK: "攻击",
        DEF: "防御",
        SPD: "身法",
        CRIT: "暴击",
        MOVE_SPEED: "脚力",
        DAO: "道行",
        EXP: "修为",
        MNY: "银两"
    }
};

// ═══ 经济体系 ═══
// 统一以「灵石」为基准货币单位
// 事件文本中可出现黄金、白银、铜钱等叙事货币，
// 但最终 Effect 中的 MONEY 字段统一为灵石数量。
// 换算比率（用于叙事→灵石转换）：
//   1 灵石 = 1 两黄金 = 10 两白银 = 1000 铜钱
export const ECONOMY = {
    CURRENCY_NAME: '灵石',
    EXCHANGE_RATES: {
        SPIRIT_STONE: 1,   // 1 灵石
        GOLD: 1,           // 1 两黄金 = 1 灵石
        SILVER: 0.1,       // 1 两白银 = 0.1 灵石
        COPPER: 0.001,     // 1 铜钱 = 0.001 灵石
    },
    // 便捷转换函数
    toSpiritStones(amount: number, unit: 'GOLD' | 'SILVER' | 'COPPER' = 'GOLD'): number {
        const rate = ECONOMY.EXCHANGE_RATES[unit] || 1;
        return Math.floor(amount * rate);
    }
};

export const INITIAL_STATE = {
    HOME_NAME: '破旧草屋',
    HOME_LEVEL: 1
};

export const BATTLE_STATS_DEFAULTS = {
    ATK: 10,
    DEF: 0,
    SPD: 10,
    CRIT: 0,
    MOVE_SPEED: 10
};
