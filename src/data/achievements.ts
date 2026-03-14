/**
 * achievements.ts — 成就系统数据定义
 *
 * 成就可解锁：天赋池等级、特定命格、游戏功能。
 */

export type AchievementCategory = 'CULTIVATION' | 'COMBAT' | 'EXPLORATION' | 'SURVIVAL' | 'REINCARNATION' | 'COLLECTION' | 'SOCIAL';

export interface AchievementUnlock {
    type: 'TALENT_POOL' | 'FEAT' | 'FEATURE';
    /** TALENT_POOL: 解锁指定 grade 天赋池 */
    grades?: number[];
    /** FEAT: 解锁指定 fateId 命格 */
    fateId?: string;
    /** FEATURE: 解锁功能标识 */
    featureId?: string;
}

export interface Achievement {
    id: string;
    name: string;
    description: string;
    category: AchievementCategory;
    /** 是否隐藏（达成前不显示条件） */
    hidden?: boolean;
    /** 奖励轮回点 */
    karmaReward: number;
    /** 解锁内容 */
    unlocks?: AchievementUnlock[];
    /** 检测条件（由 AchievementSystem 使用） */
    condition: AchievementCondition;
}

export type AchievementCondition =
    | { type: 'REALM_REACHED'; realmIdx: number }
    | { type: 'AGE_REACHED'; age: number }
    | { type: 'STAT_REACHED'; stat: string; value: number }
    | { type: 'FLAG_OBTAINED'; flag: string }
    | { type: 'REINCARNATION_COUNT'; count: number }
    | { type: 'TOTAL_KILLS'; count: number }
    | { type: 'MONEY_REACHED'; amount: number }
    | { type: 'ITEM_COUNT'; count: number }
    | { type: 'ALCHEMY_COUNT'; count: number }
    | { type: 'SECT_RANK'; rankIdx: number }
    | { type: 'ABODE_LEVEL'; level: number };


export const ACHIEVEMENTS: Achievement[] = [
    // ═══ 修炼里程碑 ═══
    {
        id: 'ACH_FIRST_CULTIVATE',
        name: '踏上仙途',
        description: '首次突破至炼气期',
        category: 'CULTIVATION',
        karmaReward: 5,
        condition: { type: 'REALM_REACHED', realmIdx: 1 },
    },
    {
        id: 'ACH_FOUNDATION',
        name: '筑基成功',
        description: '突破至筑基期',
        category: 'CULTIVATION',
        karmaReward: 10,
        condition: { type: 'REALM_REACHED', realmIdx: 2 },
        unlocks: [{ type: 'TALENT_POOL', grades: [5] }],
    },
    {
        id: 'ACH_GOLDEN_CORE',
        name: '金丹大道',
        description: '突破至金丹期',
        category: 'CULTIVATION',
        karmaReward: 25,
        condition: { type: 'REALM_REACHED', realmIdx: 3 },
    },
    {
        id: 'ACH_NASCENT_SOUL',
        name: '元婴出窍',
        description: '突破至元婴期',
        category: 'CULTIVATION',
        karmaReward: 50,
        condition: { type: 'REALM_REACHED', realmIdx: 4 },
        unlocks: [{ type: 'TALENT_POOL', grades: [6] }],
    },
    {
        id: 'ACH_IMMORTAL',
        name: '飞升成仙',
        description: '突破至化神期',
        category: 'CULTIVATION',
        karmaReward: 100,
        condition: { type: 'REALM_REACHED', realmIdx: 5 },
    },

    // ═══ 生存成就 ═══
    {
        id: 'ACH_SURVIVE_100',
        name: '百岁人瑞',
        description: '存活至 100 岁',
        category: 'SURVIVAL',
        karmaReward: 5,
        condition: { type: 'AGE_REACHED', age: 100 },
    },
    {
        id: 'ACH_SURVIVE_300',
        name: '三百年长生',
        description: '存活至 300 岁',
        category: 'SURVIVAL',
        karmaReward: 15,
        condition: { type: 'AGE_REACHED', age: 300 },
    },
    {
        id: 'ACH_SURVIVE_1000',
        name: '千年不朽',
        description: '存活至 1000 岁',
        category: 'SURVIVAL',
        karmaReward: 50,
        condition: { type: 'AGE_REACHED', age: 1000 },
        hidden: true,
    },

    // ═══ 轮回成就 ═══
    {
        id: 'ACH_REINCARNATION_1',
        name: '轮回之始',
        description: '完成第一次轮回',
        category: 'REINCARNATION',
        karmaReward: 10,
        condition: { type: 'REINCARNATION_COUNT', count: 1 },
    },
    {
        id: 'ACH_REINCARNATION_3',
        name: '三世轮回',
        description: '完成 3 次轮回',
        category: 'REINCARNATION',
        karmaReward: 20,
        condition: { type: 'REINCARNATION_COUNT', count: 3 },
        unlocks: [{ type: 'TALENT_POOL', grades: [5] }],
    },
    {
        id: 'ACH_REINCARNATION_10',
        name: '十世修行',
        description: '完成 10 次轮回',
        category: 'REINCARNATION',
        karmaReward: 50,
        condition: { type: 'REINCARNATION_COUNT', count: 10 },
        unlocks: [{ type: 'TALENT_POOL', grades: [6] }],
    },

    // ═══ 战斗成就 ═══
    {
        id: 'ACH_FIRST_KILL',
        name: '初战告捷',
        description: '首次击败敌人',
        category: 'COMBAT',
        karmaReward: 3,
        condition: { type: 'TOTAL_KILLS', count: 1 },
    },
    {
        id: 'ACH_VETERAN',
        name: '身经百战',
        description: '累计击败 50 个敌人',
        category: 'COMBAT',
        karmaReward: 20,
        condition: { type: 'TOTAL_KILLS', count: 50 },
    },

    // ═══ 财富成就 ═══
    {
        id: 'ACH_RICH',
        name: '小富即安',
        description: '灵石达到 500',
        category: 'COLLECTION',
        karmaReward: 5,
        condition: { type: 'MONEY_REACHED', amount: 500 },
    },
    {
        id: 'ACH_WEALTHY',
        name: '富甲一方',
        description: '灵石达到 10000',
        category: 'COLLECTION',
        karmaReward: 20,
        condition: { type: 'MONEY_REACHED', amount: 10000 },
    },

    // ═══ 社交/宗门成就 ═══
    {
        id: 'ACH_JOIN_SECT',
        name: '门派弟子',
        description: '加入任意一个宗门',
        category: 'SOCIAL',
        karmaReward: 5,
        condition: { type: 'FLAG_OBTAINED', flag: 'IN_SECT' },
    },
    {
        id: 'ACH_SECT_ELDER',
        name: '位高权重',
        description: '在宗门中晋升至第三阶位',
        category: 'SOCIAL',
        karmaReward: 25,
        condition: { type: 'SECT_RANK', rankIdx: 2 },
    },

    // ═══ 收集/炼丹成就 ═══
    {
        id: 'ACH_FIRST_ALCHEMY',
        name: '初入丹道',
        description: '首次成功炼制丹药',
        category: 'COLLECTION',
        karmaReward: 5,
        condition: { type: 'FLAG_OBTAINED', flag: 'FIRST_ALCHEMY_SUCCESS' },
    },

    // ═══ 洞府成就 ═══
    {
        id: 'ACH_CAVE_HOME',
        name: '安家落户',
        description: '洞府升级至第 2 级',
        category: 'EXPLORATION',
        karmaReward: 5,
        condition: { type: 'ABODE_LEVEL', level: 2 },
    },
    {
        id: 'ACH_BLESSED_LAND',
        name: '洞天福地',
        description: '洞府升级至最高级',
        category: 'EXPLORATION',
        karmaReward: 30,
        condition: { type: 'ABODE_LEVEL', level: 4 },
        hidden: true,
    },

    // ═══ 属性成就 ═══
    {
        id: 'ACH_STRONG_BODY',
        name: '铜皮铁骨',
        description: '体魄达到 50',
        category: 'COMBAT',
        karmaReward: 10,
        condition: { type: 'STAT_REACHED', stat: 'STR', value: 50 },
    },
    {
        id: 'ACH_GENIUS',
        name: '天纵奇才',
        description: '悟性达到 50',
        category: 'CULTIVATION',
        karmaReward: 10,
        condition: { type: 'STAT_REACHED', stat: 'INT', value: 50 },
    },
];

ACHIEVEMENTS.push({
    id: 'ACH_END_BLACK_TIDE',
    name: '黑潮终绝',
    description: '击败归墟古主，完成当前版本终局',
    category: 'CULTIVATION',
    karmaReward: 120,
    hidden: true,
    condition: { type: 'FLAG_OBTAINED', flag: 'STORY:VOID_LORD_SLAIN' },
});
