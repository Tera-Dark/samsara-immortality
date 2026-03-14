/**
 * sects.ts — 宗门势力数据定义
 *
 * 每个宗门有独特的入门要求、贡献奖励和专属功法/丹方。
 */

export type SectAlignment = 'RIGHTEOUS' | 'DEMONIC' | 'NEUTRAL';

export interface SectRank {
    title: string;
    minContribution: number;
    benefits: string;
}

export interface SectMission {
    id: string;
    name: string;
    description: string;
    /** 任务消耗天数 */
    timeCostDays: number;
    /** 贡献点奖励 */
    contributionReward: number;
    /** 灵石奖励 */
    moneyReward: number;
    /** 需要达到的宗门等级 (index into ranks) */
    minRankIdx: number;
    /** 成功率 (0~1) */
    successRate: number;
    /** 可能掉落的物品 */
    lootItemId?: string;
    lootChance?: number;
}

export interface SectData {
    id: string;
    name: string;
    alignment: SectAlignment;
    description: string;
    /** 入门最低境界 (realm_idx) */
    minRealmIdx: number;
    /** 入门需要的最低属性（可选） */
    requirements?: { stat: string; min: number }[];
    ranks: SectRank[];
    missions: SectMission[];
    /** 宗门特供物品 (可用贡献点兑换) */
    shopItems: { itemId: string; contributionCost: number }[];
    /** 宗门特色标签 */
    tags: string[];
}

export interface SectState {
    id: string;
    contribution: number;
    /** 当前门派等级 (ranks 中的索引) */
    rankIdx: number;
    /** 加入时的年龄（月） */
    joinedMonth: number;
    /** 本月是否已执行任务 */
    missionDoneThisMonth: boolean;
}

// ─── 宗门数据 ───

export const SECTS: SectData[] = [
    {
        id: 'SECT_QINGYUN',
        name: '青云宗',
        alignment: 'RIGHTEOUS',
        description: '正道第一大宗，以剑道闻名天下。宗门底蕴深厚，弟子皆以惩奸除恶为己任。修剑道者的首选门派。',
        minRealmIdx: 1,
        requirements: [{ stat: 'INT', min: 8 }],
        tags: ['剑修', '正道', '古老'],
        ranks: [
            { title: '外门弟子', minContribution: 0, benefits: '可使用宗门灵田，每月领取灵石补贴。' },
            { title: '内门弟子', minContribution: 100, benefits: '可修习宗门剑诀，获得修炼加成。' },
            { title: '核心弟子', minContribution: 500, benefits: '可进入宗门秘境，获得珍稀灵药。' },
            { title: '亲传弟子', minContribution: 2000, benefits: '参与宗门高层决策，获得宗门秘术。' },
        ],
        missions: [
            {
                id: 'QY_PATROL',
                name: '巡山守卫',
                description: '巡视宗门山门，驱赶妖兽侵扰。',
                timeCostDays: 7,
                contributionReward: 5,
                moneyReward: 3,
                minRankIdx: 0,
                successRate: 0.95,
            },
            {
                id: 'QY_HERB_GATHER',
                name: '采药任务',
                description: '前往后山灵药园采集灵草，供宗门炼丹所用。',
                timeCostDays: 15,
                contributionReward: 12,
                moneyReward: 10,
                minRankIdx: 0,
                successRate: 0.85,
                lootItemId: 'spirit_herb',
                lootChance: 0.6,
            },
            {
                id: 'QY_SLAY_DEMON',
                name: '除魔卫道',
                description: '下山清剿活跃在附近的邪修与妖兽。危险但贡献丰厚。',
                timeCostDays: 30,
                contributionReward: 35,
                moneyReward: 30,
                minRankIdx: 1,
                successRate: 0.7,
                lootItemId: 'monster_core',
                lootChance: 0.4,
            },
            {
                id: 'QY_SECRET_REALM',
                name: '秘境探索',
                description: '进入宗门秘境，寻找上古遗留。极度危险，可能获得稀世珍宝。',
                timeCostDays: 30,
                contributionReward: 80,
                moneyReward: 50,
                minRankIdx: 2,
                successRate: 0.5,
                lootItemId: 'beast_blood',
                lootChance: 0.3,
            },
        ],
        shopItems: [
            { itemId: 'spirit_herb', contributionCost: 5 },
            { itemId: 'century_ginseng', contributionCost: 30 },
            { itemId: 'book_sword_art', contributionCost: 100 },
            { itemId: 'jade_sword', contributionCost: 200 },
            { itemId: 'ice_lotus', contributionCost: 150 },
        ],
    },
    {
        id: 'SECT_WANDU',
        name: '万毒门',
        alignment: 'DEMONIC',
        description: '魔道巨擘，精通毒术与炼毒之道。门下弟子为求力量不择手段，但掌握了世间最精深的丹毒之术。炼丹者的另一选择。',
        minRealmIdx: 1,
        requirements: [{ stat: 'MND', min: 8 }],
        tags: ['毒修', '魔道', '炼丹'],
        ranks: [
            { title: '毒奴', minContribution: 0, benefits: '获赐入门毒体，免疫低阶毒素。' },
            { title: '毒使', minContribution: 80, benefits: '可修习门派毒术功法，炼丹成功率提升。' },
            { title: '毒尊', minContribution: 400, benefits: '可使用门派万毒池淬体，获得稀有毒材。' },
            { title: '大长老', minContribution: 1500, benefits: '参与门派核心秘闻，获取至毒之物。' },
        ],
        missions: [
            {
                id: 'WD_COLLECT_VENOM',
                name: '采集毒素',
                description: '深入瘴气沼泽，采集珍稀毒虫与毒草。',
                timeCostDays: 10,
                contributionReward: 8,
                moneyReward: 5,
                minRankIdx: 0,
                successRate: 0.9,
            },
            {
                id: 'WD_REFINE_POISON',
                name: '炼毒任务',
                description: '为门派炼制一批毒药，需有一定的炼丹基础。',
                timeCostDays: 20,
                contributionReward: 20,
                moneyReward: 15,
                minRankIdx: 1,
                successRate: 0.8,
                lootItemId: 'fire_seed',
                lootChance: 0.5,
            },
            {
                id: 'WD_ASSASSINATE',
                name: '暗杀行动',
                description: '门派密令，暗杀指定目标。极度危险，报酬极高。',
                timeCostDays: 30,
                contributionReward: 50,
                moneyReward: 80,
                minRankIdx: 2,
                successRate: 0.55,
                lootItemId: 'dragon_saliva_herb',
                lootChance: 0.2,
            },
        ],
        shopItems: [
            { itemId: 'fire_seed', contributionCost: 8 },
            { itemId: 'spirit_herb', contributionCost: 4 },
            { itemId: 'century_ginseng', contributionCost: 25 },
            { itemId: 'beast_blood', contributionCost: 80 },
            { itemId: 'book_fire_art', contributionCost: 80 },
        ],
    },
    {
        id: 'SECT_TIANJI',
        name: '天机阁',
        alignment: 'NEUTRAL',
        description: '超然于正魔两道之外的隐世宗门，精通阵法、符箓与推演之术。不问世事，只求天机。适合内修型修士。',
        minRealmIdx: 1,
        requirements: [{ stat: 'INT', min: 10 }],
        tags: ['阵法', '符箓', '隐世'],
        ranks: [
            { title: '记名弟子', minContribution: 0, benefits: '可查阅阁中部分典籍。' },
            { title: '正式阁员', minContribution: 120, benefits: '可学习基础阵法与符箓。' },
            { title: '执事', minContribution: 600, benefits: '可进入天机密库，获取珍贵符材。' },
            { title: '阁老', minContribution: 2500, benefits: '参与天机推演，获取先机。' },
        ],
        missions: [
            {
                id: 'TJ_COPY_SCROLLS',
                name: '抄录经文',
                description: '抄录阁中古籍，经文晦涩，需要极高的悟性。',
                timeCostDays: 10,
                contributionReward: 6,
                moneyReward: 2,
                minRankIdx: 0,
                successRate: 0.9,
            },
            {
                id: 'TJ_SETUP_ARRAY',
                name: '布设守护阵',
                description: '协助布设阁中守护阵法，需要消耗大量精力。',
                timeCostDays: 20,
                contributionReward: 18,
                moneyReward: 10,
                minRankIdx: 1,
                successRate: 0.8,
            },
            {
                id: 'TJ_INVESTIGATE',
                name: '秘密调查',
                description: '奉阁令调查异常天象或修士失踪案，极其隐秘。',
                timeCostDays: 30,
                contributionReward: 45,
                moneyReward: 30,
                minRankIdx: 2,
                successRate: 0.65,
                lootItemId: 'purple_cloud_fruit',
                lootChance: 0.1,
            },
        ],
        shopItems: [
            { itemId: 'spirit_herb', contributionCost: 5 },
            { itemId: 'talisman_speed', contributionCost: 15 },
            { itemId: 'talisman_armor', contributionCost: 30 },
            { itemId: 'soul_wood_bracelet', contributionCost: 300 },
            { itemId: 'ice_lotus', contributionCost: 120 },
        ],
    },
    {
        id: 'SECT_SANXIU',
        name: '散修坊市联盟',
        alignment: 'NEUTRAL',
        description: '并非真正的宗门，而是散修们自发组建的互助联盟。要求最低，但资源也较为匮乏。适合不愿受拘束的修士。',
        minRealmIdx: 1,
        tags: ['散修', '自由', '坊市'],
        ranks: [
            { title: '普通成员', minContribution: 0, benefits: '可在坊市中交易，享受成员价。' },
            { title: '资深成员', minContribution: 50, benefits: '高级交易权限，获取内部消息。' },
            { title: '理事', minContribution: 300, benefits: '参与联盟决策，享受分红。' },
        ],
        missions: [
            {
                id: 'SX_TRADE_RUN',
                name: '商队护卫',
                description: '护送坊市商队前往远方交易，路途中可能遭遇劫匪。',
                timeCostDays: 15,
                contributionReward: 10,
                moneyReward: 20,
                minRankIdx: 0,
                successRate: 0.85,
            },
            {
                id: 'SX_GATHER_INFO',
                name: '搜集情报',
                description: '打探周围势力的动向，为联盟提供情报。',
                timeCostDays: 10,
                contributionReward: 8,
                moneyReward: 5,
                minRankIdx: 0,
                successRate: 0.9,
            },
            {
                id: 'SX_BOUNTY_HUNT',
                name: '悬赏追杀',
                description: '接取联盟悬赏令，追杀指定恶修。奖励丰厚但风险极高。',
                timeCostDays: 30,
                contributionReward: 40,
                moneyReward: 60,
                minRankIdx: 1,
                successRate: 0.6,
                lootItemId: 'monster_core',
                lootChance: 0.5,
            },
        ],
        shopItems: [
            { itemId: 'healing_pill_small', contributionCost: 10 },
            { itemId: 'qi_gathering_pill', contributionCost: 20 },
            { itemId: 'spirit_herb', contributionCost: 3 },
            { itemId: 'fire_seed', contributionCost: 10 },
            { itemId: 'century_ginseng', contributionCost: 30 },
        ],
    },
];
