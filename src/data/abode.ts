/**
 * abode.ts — 洞府与灵田数据定义
 *
 * 洞府：修士安身之所，等级越高修炼加成越大，灵田越多。
 * 灵田：在洞府中种植灵草的土地，灵草成熟后可收获用于炼丹。
 */

export interface AbodeLevel {
    level: number;
    name: string;
    description: string;
    /** 聚灵阵修炼加速倍率 */
    cultivationBonus: number;
    /** 灵田数量上限 */
    maxPlots: number;
    /** 升级所需灵石 */
    upgradeCost: number;
    /** 最低境界要求 (realm_idx) */
    minRealmIdx: number;
}

export interface HerbSeed {
    id: string;
    name: string;
    description: string;
    /** 成熟所需月数 */
    growthMonths: number;
    /** 收获的物品ID */
    harvestItemId: string;
    /** 每次收获数量范围 */
    harvestMin: number;
    harvestMax: number;
    /** 种子购买价格 (灵石) */
    seedPrice: number;
    /** 变异概率 (0~1)：变异后产量翻倍 */
    mutationChance: number;
    /** 需要的最低洞府等级 */
    minAbodeLevel: number;
}

export interface PlotState {
    /** 种植的灵草种子ID，null 表示空地 */
    herbId: string | null;
    /** 已经生长的月数 */
    growthMonths: number;
    /** 是否已成熟 */
    mature: boolean;
    /** 是否发生变异（产量翻倍） */
    mutated: boolean;
}

export interface AbodeState {
    level: number;
    plots: PlotState[];
}

// ─── 洞府等级数据 ───

export const ABODE_LEVELS: AbodeLevel[] = [
    {
        level: 0,
        name: '荒野露宿',
        description: '在一处山崖下找了个避风的角落，勉强遮风挡雨。',
        cultivationBonus: 0,
        maxPlots: 0,
        upgradeCost: 0,
        minRealmIdx: 0,
    },
    {
        level: 1,
        name: '简陋山洞',
        description: '找到一处天然山洞，略作整理后勉强可居。虽简陋但已能开辟小片灵田。',
        cultivationBonus: 0.05, // 5%
        maxPlots: 2,
        upgradeCost: 50,
        minRealmIdx: 1,
    },
    {
        level: 2,
        name: '灵穴洞府',
        description: '以灵石改造山洞，引入灵脉支流。聚灵阵已初步成型，修炼效率显著提升。',
        cultivationBonus: 0.15, // 15%
        maxPlots: 4,
        upgradeCost: 500,
        minRealmIdx: 1,
    },
    {
        level: 3,
        name: '仙居福地',
        description: '洞府坐落于灵气充裕之地，阵法守护、灵田茂盛。已初具仙家气象。',
        cultivationBonus: 0.30, // 30%
        maxPlots: 6,
        upgradeCost: 5000,
        minRealmIdx: 2,
    },
    {
        level: 4,
        name: '洞天福地',
        description: '独立的小成洞天，内有灵泉飞瀑、药田如画。灵气浓郁堪比仙界一角。',
        cultivationBonus: 0.50, // 50%
        maxPlots: 9,
        upgradeCost: 50000,
        minRealmIdx: 3,
    },
];

// ─── 灵草种子数据 ───

export const HERB_SEEDS: HerbSeed[] = [
    {
        id: 'SEED_SPIRIT_HERB',
        name: '灵草种子',
        description: '最常见的灵草种子，生长迅速，产量稳定。',
        growthMonths: 3,
        harvestItemId: 'spirit_herb',
        harvestMin: 2,
        harvestMax: 4,
        seedPrice: 5,
        mutationChance: 0.05,
        minAbodeLevel: 1,
    },
    {
        id: 'SEED_FIRE_SEED',
        name: '赤焰火种苗',
        description: '需要在温热环境下培育，成熟后结出蕴含地火的种子。',
        growthMonths: 4,
        harvestItemId: 'fire_seed',
        harvestMin: 1,
        harvestMax: 3,
        seedPrice: 15,
        mutationChance: 0.08,
        minAbodeLevel: 1,
    },
    {
        id: 'SEED_CENTURY_GINSENG',
        name: '黄精株苗',
        description: '百年黄精的幼苗，需要耐心培育，但产出珍贵。',
        growthMonths: 6,
        harvestItemId: 'century_ginseng',
        harvestMin: 1,
        harvestMax: 2,
        seedPrice: 50,
        mutationChance: 0.06,
        minAbodeLevel: 2,
    },
    {
        id: 'SEED_ICE_LOTUS',
        name: '冰莲花种',
        description: '千年冰莲的花种，需要灵气充裕的环境才能存活。',
        growthMonths: 9,
        harvestItemId: 'ice_lotus',
        harvestMin: 1,
        harvestMax: 1,
        seedPrice: 200,
        mutationChance: 0.04,
        minAbodeLevel: 3,
    },
    {
        id: 'SEED_DRAGON_SALIVA',
        name: '龙涎草籽',
        description: '据说只有在洞天福地中才能培育成功的珍稀药材。',
        growthMonths: 12,
        harvestItemId: 'dragon_saliva_herb',
        harvestMin: 1,
        harvestMax: 1,
        seedPrice: 500,
        mutationChance: 0.03,
        minAbodeLevel: 3,
    },
    {
        id: 'SEED_PURPLE_CLOUD',
        name: '紫云果核',
        description: '紫云果的果核，世间最难培育的灵植之一。唯有洞天福地才配得上它。',
        growthMonths: 18,
        harvestItemId: 'purple_cloud_fruit',
        harvestMin: 1,
        harvestMax: 1,
        seedPrice: 2000,
        mutationChance: 0.02,
        minAbodeLevel: 4,
    },
];
