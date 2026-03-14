export const GAME_RULES = {
    LIFESPAN_BONUSES: [0, 40, 120, 300, 800, 2000, 5000, 10000, 50000],
    BASE_LIFESPAN: 80,
    REALM_THRESHOLDS: [8, 50, 150, 400, 1000, 3000, 8000, 20000, 80000],
    REALM_BONUS_MULTIPLIER: 5,
    BACKGROUND_THRESHOLDS: {
        FARMER: 10,
        RICH: 20,
    },
    INFANT_EVENTS: [
        '学会翻身',
        '咿呀学语，试图叫一声“爹”',
        '看着窗外发呆',
        '被母亲抱在怀里轻哄',
        '尝试爬行',
        '抓住了父亲的胡子',
        '对家里的猫充满好奇',
        '大哭了一场',
        '在摇篮里睡得很香',
        '尝试站立，却摔了个屁股墩',
    ],
};

export const NPC_DESCRIPTIONS = {
    FATHER: {
        FARMER: '你的父亲，一个诚实肯干的农夫。',
        RICH: '你的父亲，镇上有名的富商。',
        CULTIVATOR: '你的父亲，家族中的中坚修士。',
    },
    MOTHER: {
        FARMER: '你的母亲，勤劳温厚的农家妇人。',
        RICH: '你的母亲，知书达理的富家主母。',
        CULTIVATOR: '你的母亲，温柔而见识不浅的修行者。',
    },
    NAMER: {
        FARMER: '村里的老秀才',
        RICH: '你的父亲',
        CULTIVATOR: '家族长辈',
    },
};

export const TEXT_CONSTANTS = {
    DEFAULT_NAME: '无名氏',
    BIRTH_LOG: '你出生了。',
    DEATH_LOG: '寿元已尽，道消身死。',
    BREAKTHROUGH_SUCCESS: '突破成功。晋升为【{realm}】。全属性 +{bonus}',
    EVENT_DEFAULT_TITLE: '突发事件',
    MYSTERIOUS_PERSON: '一位神秘人',
    STATS: {
        STR: '体魄',
        INT: '悟性',
        CHR: '魅力',
        LUCK: '气运',
        ROOT: '资质',
        POT: '潜力',
        CON: '体质',
        HP: '生命',
        MP: '法力',
        MAX_HP: '气血上限',
        MAX_MP: '法力上限',
        MOOD: '心情',
        WIL: '意志',
        LIFESPAN: '寿元',
        POISON: '丹毒',
        FAME: '声望',
        REP: '名望',
        KARMA: '功德',
        MONEY: '灵石',
        ALCHEMY: '炼丹',
        ATK: '攻击',
        DEF: '防御',
        SPD: '身法',
        CRIT: '暴击',
        MOVE_SPEED: '脚力',
        DAO: '道行',
        EXP: '修为',
        MNY: '银两',
    },
};

export const ECONOMY = {
    CURRENCY_NAME: '灵石',
    EXCHANGE_RATES: {
        SPIRIT_STONE: 1,
        GOLD: 1,
        SILVER: 0.1,
        COPPER: 0.001,
    },
    toSpiritStones(amount: number, unit: 'GOLD' | 'SILVER' | 'COPPER' = 'GOLD'): number {
        const rate = ECONOMY.EXCHANGE_RATES[unit] || 1;
        return Math.floor(amount * rate);
    },
};

export const INITIAL_STATE = {
    HOME_NAME: '破旧草屋',
    HOME_LEVEL: 1,
};

export const BATTLE_STATS_DEFAULTS = {
    ATK: 10,
    DEF: 0,
    SPD: 10,
    CRIT: 0,
};
