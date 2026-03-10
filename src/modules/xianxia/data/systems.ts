export type SystemCategory = 'CRAFTING' | 'CULTIVATION' | 'SOCIAL' | 'EXPLORATION';

export interface XianxiaSystem {
    id: string;
    name: string;
    category: SystemCategory;
    icon: string;       // Lucide component name
    description: string;
    coreStats: string[]; // 关联的核心属性，如 STR, MND 等
    features: string[]; // 这个系统包含的具体玩法内容
    unlockCondition?: string; // 预期解锁条件
    status: 'AVAILABLE' | 'WIP' | 'PLANNED';
}

export const XIANXIA_SYSTEMS: XianxiaSystem[] = [
    // --- 生产技艺 (CRAFTING) ---
    {
        id: 'ALCHEMY',
        name: '炼丹术',
        category: 'CRAFTING',
        icon: 'FlaskConical',
        description: '以天地灵草为引，夺造化之功。炼制恢复、增幅、破境甚至直接增加百年修为的无上仙丹。',
        coreStats: ['MND', 'INT'], // 神识控火，悟性识药
        features: ['搜集丹方药材', '异火收集控温', '成丹品阶判定 (废丹/凡/地/天/仙)'],
        unlockCondition: '炼气初期',
        status: 'PLANNED'
    },
    {
        id: 'SMITHING',
        name: '炼器术',
        category: 'CRAFTING',
        icon: 'Anvil',
        description: '熔炼天下奇金异石，锻造防身法宝与杀伐剑阵，强悍的法宝甚至能诞生器灵。',
        coreStats: ['STR', 'MND'], // 体魄挥锤，神识刻阵
        features: ['矿脉采掘', '法宝祭炼升级', '器灵认主'],
        unlockCondition: '炼气中期',
        status: 'PLANNED'
    },
    {
        id: 'FORMATION',
        name: '阵法术',
        category: 'CRAFTING',
        icon: 'Hexagon',
        description: '借天地山川之势，布下杀阵、幻阵、聚灵阵。阵法宗师甚至能以天地为阵，困杀仙佛。',
        coreStats: ['INT', 'POT'], // 悟性推演，资质共鸣
        features: ['阵图刻录', '随身杀阵布设', '洞府聚灵阵升级'],
        unlockCondition: '筑基初期',
        status: 'PLANNED'
    },
    {
        id: 'TALISMAN',
        name: '符箓术',
        category: 'CRAFTING',
        icon: 'ScrollText',
        description: '以朱砂妖血，将天地法则封印于黄纸之中。对敌时漫天符雨，可爆发出远超自身境界的杀伤力。',
        coreStats: ['MND', 'LUCK'], // 神识落笔，气运成符
        features: ['画符充能', '符箓售卖换钱', '战斗瞬发消耗'],
        unlockCondition: '炼气初期',
        status: 'PLANNED'
    },

    // --- 洞天福地与培养 (CULTIVATION) ---
    {
        id: 'ABODE',
        name: '洞府',
        category: 'CULTIVATION',
        icon: 'Mountain',
        description: '修士安身立命之本。从简陋的山洞到悬浮瑶池仙岛，洞府等级决定了你的闭关效率与资产安全。',
        coreStats: ['POT'], // 随资质影响环境契合
        features: ['洞天升级扩容', '聚灵阵节点', '抵御天劫阵基'],
        unlockCondition: '筑基初期',
        status: 'PLANNED'
    },
    {
        id: 'PLANTATION',
        name: '灵田种植',
        category: 'CULTIVATION',
        icon: 'Sprout',
        description: '在洞府开辟灵田，种植灵草妙药。是每一位炼丹师背后必须要有的资源支撑。',
        coreStats: ['INT', 'LUCK'], // 把握时节，气运防具变异
        features: ['播种浇灌(耗时)', '极品变异株', '灵宠偷吃防备'],
        unlockCondition: '拥有洞府后',
        status: 'PLANNED'
    },
    {
        id: 'PET',
        name: '御兽灵宠',
        category: 'CULTIVATION',
        icon: 'PawPrint',
        description: '驯服莽荒异兽，或孵化远古真龙。灵宠不仅能协助战斗，还能搜寻天地财宝、看家护院。',
        coreStats: ['CHR', 'STR'], // 魅力吸引，武力折服
        features: ['兽卵孵化', '血脉返祖进化', '协同出战'],
        unlockCondition: '炼气后期',
        status: 'PLANNED'
    },

    // --- 游历与探索 (EXPLORATION) ---
    {
        id: 'DUNGEON',
        name: '上古秘境',
        category: 'EXPLORATION',
        icon: 'Compass',
        description: '天地孕育的独立空间，隐藏着上古修士的传承、绝迹的灵草，以及致命的空间裂缝与远古妖兽。',
        coreStats: ['STR', 'LUCK'], // 武力破局，气运逢生
        features: ['多层肉鸽探索', '生死抉择事件', '唯一传承争夺'],
        unlockCondition: '金丹初期',
        status: 'PLANNED'
    },

    // --- 社交与人情世故 (SOCIAL) ---
    {
        id: 'SECT',
        name: '宗门势力',
        category: 'SOCIAL',
        icon: 'Landmark',
        description: '背靠大树好乘凉。加入正魔宗门，完成师门任务，甚至步步蚕食夺取掌门之位，发动宗门灭国级法仗。',
        coreStats: ['POT', 'INT'],
        features: ['贡献度兑换', '门派大比', '宗门战役'],
        unlockCondition: '凡人期/炼气期',
        status: 'PLANNED'
    },
    {
        id: 'COMPANION',
        name: '道侣双修',
        category: 'SOCIAL',
        icon: 'HeartHandshake',
        description: '漫漫长生路，财侣法地。寻找灵魂契合的道侣结契，可共享部分造化，甚至通过双修秘法突破死局。',
        coreStats: ['CHR', 'POT'], // 魅力结缘，资质互补
        features: ['结契大典', '阴阳互补同修', '道侣背叛/绿帽事件'],
        unlockCondition: '无限制 (双方好感度达标)',
        status: 'PLANNED'
    }
];
