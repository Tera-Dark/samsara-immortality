/**
 * alchemy.ts — 炼丹术配方数据库
 *
 * 每个丹方定义了所需材料、成品、难度系数、境界门槛和炼丹经验。
 */

export interface AlchemyRecipe {
    id: string;
    name: string;
    description: string;
    materials: { itemId: string; count: number }[];
    resultItemId: string;
    resultCount: number;
    /** 难度系数 1-100，影响基础成功率 */
    difficulty: number;
    /** 最低境界 idx (0=凡人, 1=炼气, 2=筑基...) */
    minRealmIdx: number;
    /** 炼丹获得的熟练度经验 */
    proficiencyGain: number;
    /** 耗时（天） */
    timeCostDays: number;
}

/** 丹药品质（由炼丹判定产出） */
export type PillQuality = 'WASTE' | 'COMMON' | 'GOOD' | 'PERFECT';

export const PILL_QUALITY_LABELS: Record<PillQuality, string> = {
    WASTE: '废丹',
    COMMON: '凡品',
    GOOD: '良品',
    PERFECT: '极品',
};

/** 品质对应的效果倍率 */
export const PILL_QUALITY_MULTIPLIER: Record<PillQuality, number> = {
    WASTE: 0,
    COMMON: 1.0,
    GOOD: 1.5,
    PERFECT: 2.5,
};

export const ALCHEMY_RECIPES: AlchemyRecipe[] = [
    // ─── 入门丹药 (炼气期) ───
    {
        id: 'RECIPE_BIGU',
        name: '辟谷丹方',
        description: '最基础的辟谷丹配方，入门炼丹师的必修课。',
        materials: [
            { itemId: 'spirit_herb', count: 2 },
        ],
        resultItemId: 'bigu_pill',
        resultCount: 3,
        difficulty: 10,
        minRealmIdx: 1,
        proficiencyGain: 5,
        timeCostDays: 7,
    },
    {
        id: 'RECIPE_HEALING_SMALL',
        name: '回春丹方',
        description: '炼制回春丹的配方，需要灵草与百年黄精调配。',
        materials: [
            { itemId: 'spirit_herb', count: 3 },
            { itemId: 'century_ginseng', count: 1 },
        ],
        resultItemId: 'healing_pill_small',
        resultCount: 2,
        difficulty: 25,
        minRealmIdx: 1,
        proficiencyGain: 10,
        timeCostDays: 10,
    },
    {
        id: 'RECIPE_QI_GATHERING',
        name: '黄龙丹方',
        description: '辅助炼气的丹药配方，能大幅提升修炼速度。',
        materials: [
            { itemId: 'spirit_herb', count: 4 },
            { itemId: 'fire_seed', count: 1 },
        ],
        resultItemId: 'qi_gathering_pill',
        resultCount: 1,
        difficulty: 35,
        minRealmIdx: 1,
        proficiencyGain: 15,
        timeCostDays: 15,
    },
    // ─── 中阶丹药 (筑基期) ───
    {
        id: 'RECIPE_PEIYUAN',
        name: '培元丹方',
        description: '温补根基的丹药，长期服用可缓慢提升资质。',
        materials: [
            { itemId: 'century_ginseng', count: 2 },
            { itemId: 'ice_lotus', count: 1 },
        ],
        resultItemId: 'peiyuan_pill',
        resultCount: 1,
        difficulty: 45,
        minRealmIdx: 2,
        proficiencyGain: 20,
        timeCostDays: 15,
    },
    {
        id: 'RECIPE_MINOR_HEAL',
        name: '小还丹方',
        description: '中阶疗伤秘方，需要妖兽血晶催化药力。',
        materials: [
            { itemId: 'century_ginseng', count: 2 },
            { itemId: 'beast_blood', count: 1 },
        ],
        resultItemId: 'minor_heal_pill',
        resultCount: 2,
        difficulty: 40,
        minRealmIdx: 2,
        proficiencyGain: 18,
        timeCostDays: 12,
    },
    {
        id: 'RECIPE_XISUI',
        name: '洗髓丹方',
        description: '脱胎换骨之药，服用后可洗涤经脉杂质，永久提升体魄与悟性。',
        materials: [
            { itemId: 'ice_lotus', count: 2 },
            { itemId: 'dragon_saliva_herb', count: 1 },
            { itemId: 'beast_blood', count: 1 },
        ],
        resultItemId: 'xisui_pill',
        resultCount: 1,
        difficulty: 60,
        minRealmIdx: 2,
        proficiencyGain: 30,
        timeCostDays: 20,
    },
    // ─── 高阶丹药 (筑基后期+) ───
    {
        id: 'RECIPE_FOUNDATION',
        name: '筑基丹方',
        description: '筑基期必备神丹的秘方，炼制极难，非大毅力者不可为。',
        materials: [
            { itemId: 'dragon_saliva_herb', count: 2 },
            { itemId: 'purple_cloud_fruit', count: 1 },
            { itemId: 'beast_blood', count: 2 },
        ],
        resultItemId: 'foundation_pill',
        resultCount: 1,
        difficulty: 75,
        minRealmIdx: 2,
        proficiencyGain: 50,
        timeCostDays: 30,
    },
    {
        id: 'RECIPE_MAJOR_HEAL',
        name: '大还丹方',
        description: '起死回生的至高疗伤圣药，药材珍贵至极。',
        materials: [
            { itemId: 'purple_cloud_fruit', count: 2 },
            { itemId: 'dragon_saliva_herb', count: 1 },
            { itemId: 'century_ginseng', count: 3 },
        ],
        resultItemId: 'major_heal_pill',
        resultCount: 1,
        difficulty: 70,
        minRealmIdx: 2,
        proficiencyGain: 40,
        timeCostDays: 25,
    },
    {
        id: 'RECIPE_ZENGSHOU',
        name: '增寿丹方',
        description: '逆天改命之丹，服用可延长寿元五十年。配方失传已久，只有极少数丹道宗师方可尝试。',
        materials: [
            { itemId: 'purple_cloud_fruit', count: 3 },
            { itemId: 'ice_lotus', count: 2 },
            { itemId: 'dragon_saliva_herb', count: 2 },
        ],
        resultItemId: 'zengshou_pill',
        resultCount: 1,
        difficulty: 90,
        minRealmIdx: 3,
        proficiencyGain: 80,
        timeCostDays: 30,
    },
];
