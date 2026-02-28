import type { ModuleConfig } from '../../types/meta';

export const XianxiaConfig: ModuleConfig = {
    id: 'xianxia_legacy',
    name: '修仙模拟器 (Legacy)',
    author: 'System',
    version: '1.0.0',
    description: '经典的修仙人生重开模拟器剧本。',

    stats: [
        // --- Base Stats (先天五维) ---
        {
            id: 'STR', name: '体魄', type: 'int', base: 0, visible: true,
            min: 0, max: 200, // Limit raised for late game
            description: '决定肉身强度、生命上限与负重能力。体魄过低可能无法承受高阶功法。',
            color: 'text-rose-500'
        },
        {
            id: 'INT', name: '悟性', type: 'int', base: 0, visible: true,
            min: 0, max: 200,
            description: '决定功法修炼速度、参悟效率与突破瓶颈的概率。',
            color: 'text-blue-500'
        },
        {
            id: 'POT', name: '资质', type: 'int', base: 0, visible: true,
            min: 0, max: 100,
            description: '决定灵气吸收效率、丹药吸收率与境界提升上限。',
            color: 'text-amber-500'
        },
        {
            id: 'CHR', name: '魅力', type: 'int', base: 0, visible: true,
            min: 0, max: 999, // User request: Max 999
            description: '决定NPC初始好感度、双修效果与特殊奇遇触发概率。',
            color: 'text-purple-500'
        },
        {
            id: 'LUCK', name: '气运', type: 'int', base: 0, visible: true,
            min: 0, max: 100,
            description: '决定投胎出身、稀有掉落率、渡劫成功率与免死概率。',
            color: 'text-yellow-500'
        },

        // --- Hidden / Advanced (隐藏属性) ---
        {
            id: 'KARMA', name: '业力', type: 'int', base: 0, visible: true,
            min: -1000, max: 1000,
            description: '因果报应。正值为善（功德），负值为恶（罪孽）。影响天劫威力与特定门派接纳度。',
            color: 'text-red-600'
        },
        {
            id: 'SOUL', name: '神识', type: 'int', base: 10, visible: true,
            min: 0, max: 1000,
            description: '灵魂强度。影响感知范围、神识攻击与抗夺舍能力。',
            color: 'text-cyan-400'
        },
        {
            id: 'WIL', name: '意志', type: 'int', base: 10, visible: true,
            min: 0, max: 1000,
            description: '心境坚韧度。影响抵抗心魔、幻境与威压的能力。',
            color: 'text-stone-400'
        },

        // --- Survival / Status (状态属性) ---
        {
            id: 'HP', name: '生命', type: 'int', base: 100, visible: true,
            description: '当前气血值。归零则身死道消。',
            color: 'text-green-500'
        },
        {
            id: 'MP', name: '法力', type: 'int', base: 0, visible: true,
            description: '当前灵力值。施展法术、驾驭法宝消耗。',
            color: 'text-sky-500'
        },
        {
            id: 'LIFESPAN', name: '寿元', type: 'int', base: 60, visible: true,
            description: '剩余寿命。随境界提升而增加，归零则坐化。',
            color: 'text-slate-400'
        },
        {
            id: 'MOOD', name: '心情', type: 'int', base: 50, visible: true,
            min: 0, max: 100, // User request: Max 100
            description: '当前心境状态。过低会导致修炼走火入魔，过高有助于突破。',
            color: 'text-pink-400'
        },
        {
            id: 'TOXIN', name: '丹毒', type: 'int', base: 0, visible: true,
            min: 0, max: 100,
            description: '体内积累的丹药毒性。达到上限(100)则毒发身亡。随时间缓慢代谢。',
            color: 'text-lime-600'
        },
        {
            id: 'REP', name: '声望', type: 'int', base: 0, visible: true,
            description: '江湖/修仙界名声。影响NPC态度与事件触发。',
            color: 'text-gray-300'
        },

        // --- Battle Stats (战斗属性) ---
        {
            id: 'ATK', name: '攻击', type: 'int', base: 0, visible: false,
            description: '物理攻击力。由体魄、装备、功法等影响。',
            color: 'text-red-500'
        },
        {
            id: 'DEF', name: '防御', type: 'int', base: 0, visible: false,
            description: '物理防御力。减少受到的伤害。',
            color: 'text-blue-500'
        },
        {
            id: 'SPD', name: '身法', type: 'int', base: 0, visible: false,
            description: '战斗中的速度，影响出手顺序与闪避率。',
            color: 'text-green-500'
        },
        {
            id: 'CRIT', name: '暴击', type: 'int', base: 0, visible: false,
            description: '暴击率。暴击时造成额外伤害。',
            color: 'text-orange-500'
        },
        {
            id: 'MOVE_SPEED', name: '脚力', type: 'int', base: 0, visible: false,
            description: '移动速度。影响赶路、探索和逃跑效率。',
            color: 'text-teal-500'
        },
        {
            id: 'MAX_HP', name: '气血上限', type: 'int', base: 100, visible: false,
            description: '最大生命值。由体魄、境界、装备等决定。',
            color: 'text-green-500'
        },
        {
            id: 'MAX_MP', name: '灵力上限', type: 'int', base: 0, visible: false,
            description: '最大灵力值。由修为、境界、功法等决定。',
            color: 'text-sky-500'
        }
    ],

    resources: [
        // --- Mortal Currency (凡人货币) ---
        {
            id: 'COPPER', name: '铜钱', base: 0, icon: '铜',
            description: '凡间最基础的货币。',
            exchange: { target: 'SILVER_FRAG', rate: 1000 } // 1000 Copper = 1 Silver Frag
        },
        {
            id: 'SILVER_FRAG', name: '碎银', base: 0, icon: '银',
            description: '零碎的银两。',
            exchange: { target: 'SILVER', rate: 10 } // 10 Frag = 1 Silver
        },
        {
            id: 'SILVER', name: '银锭', base: 0, icon: '锭',
            description: '标准的官银。',
            exchange: { target: 'GOLD', rate: 10 } // 10 Silver = 1 Gold
        },
        {
            id: 'GOLD', name: '金锭', base: 0, icon: '金',
            description: '贵重的黄金。可兑换下品灵石。',
            exchange: { target: 'L_SPIRIT', rate: 10 } // 10 Gold = 1 Low Spirit Stone
        },

        // --- Cultivator Currency (修仙货币) ---
        {
            id: 'L_SPIRIT', name: '下品灵石', base: 0, icon: '灵',
            description: '蕴含少量灵气的石头，修仙界通用货币。',
            exchange: { target: 'M_SPIRIT', rate: 100 } // 100 Low = 1 Mid
        },
        {
            id: 'M_SPIRIT', name: '中品灵石', base: 0, icon: '灵',
            description: '灵气纯净，可用于阵法与修炼。',
            exchange: { target: 'H_SPIRIT', rate: 100 } // 100 Mid = 1 High
        },
        {
            id: 'H_SPIRIT', name: '上品灵石', base: 0, icon: '灵',
            description: '珍贵无比，元婴期修士的主要货币。',
            exchange: { target: 'T_SPIRIT', rate: 100 } // 100 High = 1 Top
        },
        {
            id: 'T_SPIRIT', name: '极品灵石', base: 0, icon: '极',
            description: '传说中的灵石，内蕴天地法则，可遇不可求。',
            exchange: null // Top tier
        },

        // --- Sect Resources ---
        { id: 'CONTRIBUTION', name: '宗门贡献', base: 0, icon: '功', description: '用于兑换宗门内的功法与宝物。' }
    ],

    maxLifespanFormula: "60 + (stats.realm_idx || 0) * 50"
};
