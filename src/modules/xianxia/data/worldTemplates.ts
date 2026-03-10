/**
 * 世界生成模板数据
 * 
 * 提供名称池、地形模板、道统模板等静态数据
 * 供 WorldGenerator 随机组合
 */

import type {
    TerrainType, LocationType, Doctrine,
    Alignment, SectRank, ResourceType, SectPosition
} from '../../../types/worldTypes';

// ═══════════════════════════════════════
//  宗门名称池
// ═══════════════════════════════════════

/** 门派前缀（意境） */
export const SECT_NAME_PREFIX = [
    '青云', '太玄', '紫霄', '天机', '玄天', '清虚',
    '碧落', '九幽', '苍穹', '灵隐', '玉虚', '太一',
    '昆仑', '蓬莱', '瑶池', '龙渊', '凤鸣', '星辰',
    '天罡', '地煞', '万象', '混元', '无极', '太极',
    '飞仙', '御剑', '灵宝', '丹霞', '天音', '妙法',
    // 邪道
    '血刃', '幽冥', '万毒', '噬魂', '焚天', '灭世',
    '修罗', '鬼煞', '黑水', '赤焰', '冥河', '魔渊',
];

/** 门派后缀（组织形式） */
export const SECT_NAME_SUFFIX = [
    '宗', '门', '派', '阁', '殿', '教',
    '谷', '洞', '宫', '庄', '盟', '会',
    '堂', '院', '府', '楼', '观', '寺',
];

// ═══════════════════════════════════════
//  区域名称池
// ═══════════════════════════════════════

export const REGION_NAME_PREFIX = [
    '苍茫', '幽深', '碧翠', '灵秀', '蛮荒', '玄冥',
    '烈焰', '极寒', '太古', '混沌', '天域', '地底',
    '苍穹', '万仞', '九幽', '浩瀚', '辽阔', '神秘',
];

export const REGION_NAME_SUFFIX: Record<TerrainType, string[]> = {
    MOUNTAIN: ['山脉', '群峰', '仙峰', '绝壁', '灵山'],
    PLAINS: ['平原', '草原', '旷野', '沃土', '中原'],
    FOREST: ['密林', '古林', '丛林', '秘林', '灵林'],
    DESERT: ['荒漠', '沙海', '戈壁', '旱地', '死域'],
    SWAMP: ['泽地', '沼泽', '毒沼', '幽泽', '瘴地'],
    OCEAN: ['海域', '深海', '汪洋', '灵海', '碧海'],
    VOLCANO: ['火域', '熔岩地', '烈焰原', '炎山', '火海'],
    SNOW: ['雪域', '冰原', '极地', '霜原', '寒渊'],
    ABYSS: ['深渊', '地渊', '魔域', '黑暗界', '虚空'],
};

// ═══════════════════════════════════════
//  地形模板
// ═══════════════════════════════════════

export interface TerrainTemplate {
    type: TerrainType;
    /** 基础灵气浓度 */
    baseSpiritDensity: number;
    /** 基础危险度 */
    baseDangerLevel: number;
    /** 可出产的资源类型 */
    resourceTypes: ResourceType[];
    /** 适合的阵营 */
    suitableAlignments: Alignment[];
    /** 生成权重（越高越容易出现）*/
    weight: number;
}

export const TERRAIN_TEMPLATES: TerrainTemplate[] = [
    { type: 'MOUNTAIN', baseSpiritDensity: 1.3, baseDangerLevel: 4, resourceTypes: ['SPIRIT_VEIN', 'MINERAL', 'HERB'], suitableAlignments: ['RIGHTEOUS', 'NEUTRAL'], weight: 20 },
    { type: 'PLAINS', baseSpiritDensity: 0.8, baseDangerLevel: 2, resourceTypes: ['HERB', 'SPIRIT_VEIN'], suitableAlignments: ['RIGHTEOUS', 'NEUTRAL'], weight: 20 },
    { type: 'FOREST', baseSpiritDensity: 1.1, baseDangerLevel: 5, resourceTypes: ['HERB', 'BEAST_LAIR', 'TREASURE'], suitableAlignments: ['NEUTRAL', 'EVIL'], weight: 15 },
    { type: 'DESERT', baseSpiritDensity: 0.5, baseDangerLevel: 6, resourceTypes: ['MINERAL', 'TREASURE'], suitableAlignments: ['NEUTRAL', 'EVIL'], weight: 8 },
    { type: 'SWAMP', baseSpiritDensity: 0.9, baseDangerLevel: 7, resourceTypes: ['HERB', 'BEAST_LAIR'], suitableAlignments: ['EVIL'], weight: 8 },
    { type: 'OCEAN', baseSpiritDensity: 1.0, baseDangerLevel: 5, resourceTypes: ['SPIRIT_VEIN', 'BEAST_LAIR'], suitableAlignments: ['NEUTRAL'], weight: 5 },
    { type: 'VOLCANO', baseSpiritDensity: 1.5, baseDangerLevel: 8, resourceTypes: ['MINERAL', 'TREASURE'], suitableAlignments: ['EVIL'], weight: 5 },
    { type: 'SNOW', baseSpiritDensity: 1.2, baseDangerLevel: 6, resourceTypes: ['SPIRIT_VEIN', 'HERB'], suitableAlignments: ['RIGHTEOUS', 'NEUTRAL'], weight: 8 },
    { type: 'ABYSS', baseSpiritDensity: 2.0, baseDangerLevel: 10, resourceTypes: ['BEAST_LAIR', 'TREASURE'], suitableAlignments: ['EVIL'], weight: 3 },
];

// ═══════════════════════════════════════
//  地点模板
// ═══════════════════════════════════════

export interface LocationTemplate {
    type: LocationType;
    namePatterns: string[];
    /** 生成权重 */
    weight: number;
}

export const LOCATION_TEMPLATES: LocationTemplate[] = [
    { type: 'CITY', namePatterns: ['{地名}坊市', '{地名}城', '{地名}镇'], weight: 15 },
    { type: 'WILDERNESS', namePatterns: ['{地名}荒野', '{地名}原野', '{地名}旷野'], weight: 20 },
    { type: 'SECRET_REALM', namePatterns: ['{地名}秘境', '{地名}禁地', '太古{地名}遗迹'], weight: 8 },
    { type: 'MINE', namePatterns: ['{地名}矿脉', '{地名}矿场', '地底{地名}矿藏'], weight: 10 },
    { type: 'HERB_GARDEN', namePatterns: ['{地名}药圃', '{地名}灵田', '百草{地名}园'], weight: 10 },
    { type: 'SPIRIT_VEIN', namePatterns: ['{地名}灵脉', '{地名}龙穴', '地底{地名}灵泉'], weight: 8 },
    { type: 'RUINS', namePatterns: ['{地名}遗迹', '古修士{地名}洞府', '上古{地名}殿堂'], weight: 6 },
    { type: 'MARKET', namePatterns: ['{地名}集市', '散修{地名}交易所', '{地名}商盟'], weight: 8 },
    { type: 'INN', namePatterns: ['{地名}客栈', '{地名}酒楼', '仙来客栈'], weight: 15 },
    { type: 'AUCTION_HOUSE', namePatterns: ['{地名}拍卖行', '{地名}商会', '万宝楼'], weight: 5 },
];

// ═══════════════════════════════════════
//  道统模板
// ═══════════════════════════════════════

export interface DoctrineTemplate {
    doctrine: Doctrine;
    label: string;
    description: string;
    /** 正道偏好 (0-1, 0.5=中立)  */
    righteousBias: number;
    /** 适合地形 */
    preferredTerrains: TerrainType[];
    /** 生成权重 */
    weight: number;
}

export const DOCTRINE_TEMPLATES: DoctrineTemplate[] = [
    { doctrine: 'SWORD', label: '剑修', description: '以剑入道，一剑破万法', righteousBias: 0.7, preferredTerrains: ['MOUNTAIN', 'SNOW'], weight: 15 },
    { doctrine: 'ALCHEMY', label: '丹修', description: '炼丹问道，妙手回春', righteousBias: 0.5, preferredTerrains: ['MOUNTAIN', 'FOREST'], weight: 12 },
    { doctrine: 'TALISMAN', label: '符修', description: '符箓通天，万符归宗', righteousBias: 0.6, preferredTerrains: ['PLAINS', 'MOUNTAIN'], weight: 10 },
    { doctrine: 'FORMATION', label: '阵修', description: '阵法纵横，困天锁地', righteousBias: 0.5, preferredTerrains: ['PLAINS', 'DESERT'], weight: 8 },
    { doctrine: 'BODY', label: '体修', description: '千锤百炼，肉身成圣', righteousBias: 0.4, preferredTerrains: ['MOUNTAIN', 'VOLCANO'], weight: 10 },
    { doctrine: 'DEMON', label: '魔修', description: '心魔入道，唯我独尊', righteousBias: 0.1, preferredTerrains: ['ABYSS', 'SWAMP', 'VOLCANO'], weight: 10 },
    { doctrine: 'BEAST', label: '兽修', description: '驭兽为伴，万兽朝宗', righteousBias: 0.4, preferredTerrains: ['FOREST', 'SWAMP'], weight: 8 },
    { doctrine: 'SPIRIT', label: '灵修', description: '沟通天地，灵气为引', righteousBias: 0.6, preferredTerrains: ['FOREST', 'OCEAN'], weight: 8 },
    { doctrine: 'MUSIC', label: '音修', description: '以音杀人，以曲度人', righteousBias: 0.5, preferredTerrains: ['PLAINS', 'MOUNTAIN'], weight: 5 },
    { doctrine: 'CRAFT', label: '器修', description: '铸器通灵，神兵利器', righteousBias: 0.5, preferredTerrains: ['MOUNTAIN', 'VOLCANO'], weight: 8 },
];

// ═══════════════════════════════════════
//  宗门等级模板
// ═══════════════════════════════════════

export interface SectRankTemplate {
    rank: SectRank;
    label: string;
    /** 综合实力范围 [min, max] */
    powerRange: [number, number];
    /** 人数范围 [min, max] */
    memberRange: [number, number];
    /** 长老数量范围 */
    elderRange: [number, number];
    /** 最低宗主境界 (REALMS 索引) */
    minLeaderRealm: number;
    /** 生成权重 */
    weight: number;
}

export const SECT_RANK_TEMPLATES: SectRankTemplate[] = [
    { rank: 'SCATTERED', label: '散修联盟', powerRange: [5, 15], memberRange: [3, 8], elderRange: [0, 1], minLeaderRealm: 1, weight: 10 },
    { rank: 'SMALL', label: '小宗门', powerRange: [15, 35], memberRange: [5, 12], elderRange: [1, 3], minLeaderRealm: 2, weight: 25 },
    { rank: 'MEDIUM', label: '中型宗门', powerRange: [35, 60], memberRange: [8, 20], elderRange: [2, 5], minLeaderRealm: 3, weight: 25 },
    { rank: 'LARGE', label: '大宗门', powerRange: [60, 85], memberRange: [15, 30], elderRange: [3, 7], minLeaderRealm: 4, weight: 15 },
    { rank: 'HOLY_LAND', label: '圣地', powerRange: [85, 100], memberRange: [20, 40], elderRange: [5, 10], minLeaderRealm: 5, weight: 5 },
];

// ═══════════════════════════════════════
//  职位与境界映射
// ═══════════════════════════════════════

export interface PositionTemplate {
    position: SectPosition;
    label: string;
    /** 相对宗主的境界偏移 (负数=低于宗主) */
    realmOffset: number;
}

export const POSITION_TEMPLATES: PositionTemplate[] = [
    { position: 'SECT_MASTER', label: '宗主', realmOffset: 0 },
    { position: 'GRAND_ELDER', label: '大长老', realmOffset: -1 },
    { position: 'ELDER', label: '长老', realmOffset: -2 },
    { position: 'INNER_DISCIPLE', label: '内门弟子', realmOffset: -3 },
    { position: 'OUTER_DISCIPLE', label: '外门弟子', realmOffset: -4 },
    { position: 'WANDERER', label: '散修', realmOffset: 0 },
];

// ═══════════════════════════════════════
//  资源名称池
// ═══════════════════════════════════════

export const RESOURCE_NAMES: Record<ResourceType, string[]> = {
    SPIRIT_VEIN: ['天灵脉', '地灵泉', '龙气脉', '星辰灵脉', '太古灵泉', '九曲灵脉'],
    MINERAL: ['寒铁矿', '紫金矿', '玄铁矿脉', '星辰陨铁', '赤焰铜矿', '灵银矿'],
    HERB: ['百草园', '灵药谷', '万年灵芝地', '仙草洞天', '千年参田', '灵果林'],
    BEAST_LAIR: ['万兽巢', '妖兽窟', '灵兽栖息地', '噬龙潭', '蛟龙渊', '远古兽穴'],
    TREASURE: ['上古遗藏', '仙人洞府', '天降奇宝', '前辈遗宝', '秘境宝库', '太古洞天'],
};

// ═══════════════════════════════════════
//  NPC 称号池
// ═══════════════════════════════════════

export const NPC_TITLES: Record<Doctrine, string[]> = {
    SWORD: ['剑仙', '剑圣', '剑魔', '御剑真人', '一剑客'],
    ALCHEMY: ['丹圣', '丹仙', '药王', '炼丹真人', '丹道宗师'],
    TALISMAN: ['符圣', '天符师', '万符真人', '符道宗师'],
    FORMATION: ['阵圣', '阵仙', '困天大师', '万阵宗师'],
    BODY: ['金刚', '不灭战神', '铁壁', '体修宗师'],
    DEMON: ['魔尊', '血修罗', '噬魂者', '暗夜之王'],
    BEAST: ['兽帝', '万兽之王', '御兽宗师', '灵兽真人'],
    SPIRIT: ['灵圣', '天灵师', '灵修宗师', '灵悟真人'],
    MUSIC: ['琴仙', '音杀者', '天乐宗师', '幽律真人'],
    CRAFT: ['器圣', '铸神', '器道宗师', '锻神真人'],
};

// ═══════════════════════════════════════
//  NPC 性格标签池
// ═══════════════════════════════════════

export const PERSONALITY_TAGS = {
    RIGHTEOUS: ['正义', '仁慈', '刚正', '豁达', '无私', '守序', '谦逊', '仗义'],
    NEUTRAL: ['沉稳', '务实', '冷漠', '孤傲', '随性', '精明', '内敛', '寡言'],
    EVIL: ['残忍', '贪婪', '阴狠', '好战', '嗜血', '狡诈', '暴虐', '多疑'],
};

// ═══════════════════════════════════════
//  纪元模板
// ═══════════════════════════════════════

export interface EraTemplate {
    id: string;
    name: string;
    description: string;
    luckModifier: number;
    spiritDensity: number;
}

export const ERA_TEMPLATES: EraTemplate[] = [
    { id: 'ERA_END_LAW', name: '末法时代', description: '天地灵气稀薄，修行艰难，宗门凋零。', luckModifier: -10, spiritDensity: 0.5 },
    { id: 'ERA_RECOVERY', name: '灵气复苏', description: '天地灵气逐渐复苏，修仙者数量激增。', luckModifier: 10, spiritDensity: 1.2 },
    { id: 'ERA_GOLDEN', name: '修仙盛世', description: '灵气充沛，天才辈出，各大宗门争锋。', luckModifier: 20, spiritDensity: 1.5 },
    { id: 'ERA_CHAOS', name: '乱世纷争', description: '正邪大战，天下大乱，危机即是机缘。', luckModifier: 0, spiritDensity: 1.0 },
    { id: 'ERA_CATASTROPHE', name: '天劫将至', description: '天道异变，灵气紊乱，万物凋零的征兆已现。', luckModifier: -20, spiritDensity: 0.8 },
];

// ═══════════════════════════════════════
//  辅助：地点描述片段池
// ═══════════════════════════════════════

export const LOCATION_DESCRIPTORS: Record<LocationType, string[]> = {
    CITY: ['繁华喧嚣，商旅如织', '人烟稀少的边陲小镇', '修仙者聚集的坊市', '凡人与修士共居的城池'],
    SECT_HQ: ['气势恢宏的宗门山门', '隐于云雾中的洞天福地', '戒备森严的宗门驻地', '古朴庄严的宗门大殿'],
    SECRET_REALM: ['时空裂隙中的异度空间', '上古大能开辟的洞天', '充满危机与机缘的秘境', '传说中的仙人遗迹'],
    WILDERNESS: ['荒无人烟的旷野', '灵兽出没的危险地带', '偶有散修路过的荒地', '野草丛生的废墟边缘'],
    MINE: ['蕴含灵矿的地下洞穴', '危险的深层矿道', '时有矿兽出没的矿脉', '宗门控制的灵矿区'],
    HERB_GARDEN: ['灵药丛生的山谷', '隐秘的药田洞天', '灵气滋养的百草园', '散发药香的灵田'],
    SPIRIT_VEIN: ['天地灵脉所在', '灵气喷涌的龙穴', '适合闭关的绝佳地点', '被宗门争夺的灵脉'],
    RUINS: ['古修士留下的废墟', '充满机关陷阱的遗迹', '传说有宝藏的古洞府', '岁月侵蚀的太古建筑'],
    MARKET: ['散修交易的临时集市', '各方势力设立的交易所', '黑市交易的隐秘场所', '繁忙的灵石兑换处'],
    INN: ['人声鼎沸的凡人客栈', '供修女歇息的清幽酒楼', '鱼龙混杂的落脚点，常有小道消息流传'],
    AUCTION_HOUSE: ['修仙者云集的金碧辉煌商会', '由大能坐镇的顶级拍卖行', '奇珍异宝暗流涌动的地下黑市'],
    SECT: ['宗门驻地', '门派分舵', '下界分支'],
};
