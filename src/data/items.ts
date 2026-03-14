import type { Item } from '../types/itemTypes';

export const ITEMS: Record<string, Item> = {
    // Resources
    'spirit_stone': {
        id: 'spirit_stone',
        name: '下品灵石',
        type: 'RESOURCE',
        rarity: 'COMMON',
        description: '修仙界通用货币，蕴含微量灵气。',
        stackable: true,
        value: 1,
        icon: '灵'
    },
    'spirit_shard': {
        id: 'spirit_shard',
        name: '灵石碎片',
        type: 'RESOURCE',
        rarity: 'COMMON',
        description: '破碎的灵石，价值较低。',
        stackable: true,
        value: 0.1,
        icon: '碎'
    },

    // Consumables
    'bigu_pill': {
        id: 'bigu_pill',
        name: '辟谷丹',
        type: 'CONSUMABLE',
        rarity: 'COMMON',
        description: '修仙者闭关必备，服之一月不知饥饿。',
        stackable: true,
        value: 5,
        effect: {
            HP: 5,
            history: '服下辟谷丹，腹中饥饿感顿消。'
        },
        icon: '丹'
    },
    'healing_pill_small': {
        id: 'healing_pill_small',
        name: '回春丹',
        type: 'CONSUMABLE',
        rarity: 'COMMON',
        description: '初级疗伤丹药，回复少量气血。',
        stackable: true,
        value: 10,
        effect: {
            HP: 20,
            history: '吞下回春丹，伤势有所好转。'
        },
        icon: '丹'
    },
    'qi_gathering_pill': {
        id: 'qi_gathering_pill',
        name: '黄龙丹',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '辅助炼气的丹药，能固本培元，略微提升修为。',
        stackable: true,
        value: 50,
        effect: {
            MP: 10,
            EXP: 50,
            history: '服下黄龙丹，药力化作丝丝灵力汇入丹田。'
        },
        icon: '丹'
    },
    'foundation_pill': {
        id: 'foundation_pill',
        name: '筑基丹',
        type: 'CONSUMABLE',
        rarity: 'RARE',
        description: '突破筑基期必备的神丹，极其珍贵。能大幅度提高筑基成功率。',
        stackable: true,
        value: 1000,
        effect: {
            // Check handled during breakthrough
            history: '小心翼翼地收好筑基丹，这可是突破境界的关键。'
        },
        icon: '丹'
    },

    // Manuals (Books)
    'book_changchun': {
        id: 'book_changchun',
        name: '长春功',
        type: 'CONSUMABLE', // Assuming consuming reads it
        rarity: 'COMMON',
        description: '凡人亦可修炼的基础木属性功法，中正平和，能滋养肉身。',
        stackable: false,
        value: 100,
        learnSkillId: 'heal_light',
        effect: {
            flags: ['HAS_CULTIVATION_METHOD', 'METHOD_CHANGCHUN'],
            INT: 1,
            history: '你研读了《长春功》，将其要诀牢记于心。'
        },
        icon: '卷'
    },
    'book_body_art': {
        id: 'book_body_art',
        name: '撼山拳谱',
        type: 'CONSUMABLE',
        rarity: 'COMMON',
        description: '凡俗武馆流出的入门拳谱，重在稳扎稳打，适合前期防止战斗手感单一。',
        stackable: false,
        value: 80,
        learnSkillId: 'crashing_fist',
        effect: {
            STR: 1,
            CON: 1,
            history: '你照着拳谱反复演练，出拳终于不再只是胡乱挥打。'
        },
        icon: '拳'
    },
    'book_sword_art': {
        id: 'book_sword_art',
        name: '青元剑诀',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '流传甚广的剑修入门功法，杀伐果断。',
        stackable: false,
        value: 300,
        learnSkillId: 'sword_control',
        effect: {
            flags: ['HAS_CULTIVATION_METHOD', 'METHOD_SWORD'],
            ATK: 5,
            history: '你领悟了《青元剑诀》的基础剑意。'
        },
        icon: '卷'
    },

    // Artifacts / Gear
    'artifact_iron_shield': {
        id: 'artifact_iron_shield',
        name: '玄铁盾',
        type: 'MATERIAL', // TODO: Change to GEAR when gear system is implemented
        rarity: 'COMMON',
        description: '通体由玄铁打造的下品防御法器，颇为沉重。',
        stackable: false,
        value: 150,
        icon: '盾'
    },
    'artifact_talisman_fire': {
        id: 'artifact_talisman_fire',
        name: '火弹符',
        type: 'CONSUMABLE',
        rarity: 'COMMON',
        description: '封印了一道中级火弹术的符箓，威力惊人。',
        stackable: true,
        value: 30,
        effect: {
            // Need combat hook for this, standard effect just adds history for now
            history: '你捏着火弹符，感觉安全了许多。'
        },
        icon: '火'
    },

    // Materials
    'iron': {
        id: 'iron',
        name: '玄铁',
        type: 'MATERIAL',
        rarity: 'COMMON',
        description: '打造凡兵利器的上好材料。',
        stackable: true,
        value: 5,
        icon: '铁'
    },
    'spirit_herb': {
        id: 'spirit_herb',
        name: '灵草',
        type: 'MATERIAL',
        rarity: 'UNCOMMON',
        description: '吸取天地灵气的草药，可用于炼丹。',
        stackable: true,
        value: 20,
        icon: '草'
    },
    'monster_core': {
        id: 'monster_core',
        name: '一阶妖丹',
        type: 'MATERIAL',
        rarity: 'UNCOMMON',
        description: '低阶妖兽的内丹，蕴含狂暴的灵气。',
        stackable: true,
        value: 30,
        icon: '丹'
    },

    // Mounts
    'spirit_horse': {
        id: 'spirit_horse',
        name: '踏云马',
        type: 'MOUNT',
        rarity: 'UNCOMMON',
        description: '日行千里的灵马，可缩短赶路时间。',
        stackable: false,
        value: 200,
        effect: {
            TRAVEL_SPEED: 0.5 // +50% Speed
        },
        icon: '马'
    },
    'flying_sword': {
        id: 'flying_sword',
        name: '青云剑',
        type: 'MOUNT',
        rarity: 'RARE',
        description: '制式飞剑，筑基期修士的代步工具。',
        stackable: false,
        value: 800,
        effect: {
            TRAVEL_SPEED: 1.5 // +150% Speed
        },
        icon: '剑'
    },

    // --- Equipment ---
    'iron_sword': {
        id: 'iron_sword',
        name: '精铁剑',
        type: 'EQUIPMENT',
        equipType: 'WEAPON',
        rarity: 'COMMON',
        description: '凡间铁匠打造的凡兵，锋利尚可。',
        stackable: false,
        value: 10,
        statBonuses: { ATK: 5, SPD: 2 },
        icon: '剑'
    },
    'cloth_armor': {
        id: 'cloth_armor',
        name: '粗布麻衣',
        type: 'EQUIPMENT',
        equipType: 'ARMOR',
        rarity: 'COMMON',
        description: '普通的粗布衣服，仅能御寒。',
        stackable: false,
        value: 5,
        statBonuses: { DEF: 2, HP: 10 },
        icon: '衣'
    },
    'jade_ring': {
        id: 'jade_ring',
        name: '翠玉扳指',
        type: 'EQUIPMENT',
        equipType: 'ACCESSORY',
        rarity: 'UNCOMMON',
        description: '凡人富商常佩戴的扳指，略带一丝灵气滋养身体。',
        stackable: false,
        value: 50,
        statBonuses: { MP: 10, INT: 2 },
        icon: '饰'
    },
    // --- New Weapons ---
    'jade_sword': {
        id: 'jade_sword',
        name: '青云玉剑',
        type: 'EQUIPMENT',
        equipType: 'WEAPON',
        rarity: 'UNCOMMON',
        description: '以上好寒玉淬炼而成的飞剑，轻灵无比，能增幅少许法术威力。',
        stackable: false,
        value: 200,
        statBonuses: { ATK: 15, SPD: 5, MAX_MP: 20 },
        icon: '剑'
    },
    'fire_fan': {
        id: 'fire_fan',
        name: '焚天扇',
        type: 'EQUIPMENT',
        equipType: 'WEAPON',
        rarity: 'RARE',
        description: '由火烈鸟翎羽炼制而成的法器，挥舞时热浪滚滚，极其霸道。',
        stackable: false,
        value: 1200,
        statBonuses: { ATK: 45, CRIT: 10, MAX_MP: -10 },
        icon: '扇'
    },
    'heavy_breaker': {
        id: 'heavy_breaker',
        name: '碎岩重锋',
        type: 'EQUIPMENT',
        equipType: 'WEAPON',
        rarity: 'RARE',
        description: '重达千斤的巨剑，非体修不可挥动，一击之下金石皆碎。',
        stackable: false,
        value: 1500,
        statBonuses: { ATK: 60, SPD: -10, DEF: 10 },
        icon: '剑'
    },

    // --- New Armors ---
    'silk_robe': {
        id: 'silk_robe',
        name: '天丝云鳞袍',
        type: 'EQUIPMENT',
        equipType: 'ARMOR',
        rarity: 'UNCOMMON',
        description: '由冰蚕丝编制而成的法袍，冬暖夏凉，能抵御寻常刀剑。',
        stackable: false,
        value: 300,
        statBonuses: { DEF: 15, MAX_HP: 50, SPD: 2 },
        icon: '袍'
    },
    'phantom_armor': {
        id: 'phantom_armor',
        name: '幻影流光铠',
        type: 'EQUIPMENT',
        equipType: 'ARMOR',
        rarity: 'EPIC',
        description: '传说中采用极光之髓打造的宝铠，穿上后身形飘忽不定。',
        stackable: false,
        value: 5000,
        statBonuses: { DEF: 40, MAX_HP: 200, SPD: 20, CRIT: 5 },
        icon: '铠'
    },

    // --- New Accessories ---
    'soul_wood_bracelet': {
        id: 'soul_wood_bracelet',
        name: '养魂木手串',
        type: 'EQUIPMENT',
        equipType: 'ACCESSORY',
        rarity: 'RARE',
        description: '以万年养魂木雕刻而成，长期佩戴可稳固神识，抵消心魔。',
        stackable: false,
        value: 1800,
        statBonuses: { MAX_MP: 100, DEF: 5 },
        icon: '串'
    },
    'spirit_gathering_pendant': {
        id: 'spirit_gathering_pendant',
        name: '极品聚灵佩',
        type: 'EQUIPMENT',
        equipType: 'ACCESSORY',
        rarity: 'EPIC',
        description: '核心篆刻了微型聚灵阵的玉佩，源源不断地为佩戴者提供精纯灵力。',
        stackable: false,
        value: 6000,
        statBonuses: { MAX_MP: 300, SPD: 5, ATK: 10 },
        icon: '玉'
    },

    // --- New Consumables ---
    'minor_heal_pill': {
        id: 'minor_heal_pill',
        name: '小还丹',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '疗伤秘药，能迅速恢复一定气血。',
        stackable: true,
        value: 80,
        effect: {
            HP: 100,
            history: '服下小还丹，伤口流血顿时止住了。'
        },
        icon: '丹'
    },
    'major_heal_pill': {
        id: 'major_heal_pill',
        name: '大还丹',
        type: 'CONSUMABLE',
        rarity: 'RARE',
        description: '起死回生的疗伤圣药，肉白骨，活死人。',
        stackable: true,
        value: 500,
        effect: {
            HP: 500,
            history: '大还丹入腹，磅礴的生机散开，令人浑身舒泰。'
        },
        icon: '丹'
    },
    'core_formation_pill': {
        id: 'core_formation_pill',
        name: '结丹丸',
        type: 'CONSUMABLE',
        rarity: 'EPIC',
        description: '筑基圆满修士梦寐以求的至宝，服用后有一定几率结成金丹。',
        stackable: true,
        value: 10000,
        effect: {
            history: '结丹丸的灵力在体内横冲直撞，你赶忙凝神静气，引导灵力归于丹田。'
        },
        icon: '丹'
    },

    // --- New Materials ---
    'century_ginseng': {
        id: 'century_ginseng',
        name: '百年黄精',
        type: 'MATERIAL',
        rarity: 'UNCOMMON',
        description: '深山老林中生长的灵药，年份越久灵气越足。',
        stackable: true,
        value: 150,
        icon: '药'
    },
    'beast_blood': {
        id: 'beast_blood',
        name: '妖兽血晶',
        type: 'MATERIAL',
        rarity: 'RARE',
        description: '高阶妖兽精血凝结而成的晶体，可用于炼制霸道的丹药。',
        stackable: true,
        value: 400,
        icon: '血'
    },
    'pure_spirit_stone': {
        id: 'pure_spirit_stone',
        name: '上品灵石',
        type: 'RESOURCE',
        rarity: 'EPIC',
        description: '极度纯净的灵石，不仅能作为货币，更可直接用来布设大阵。',
        stackable: true,
        value: 1000, // 1000 base value (equal to 1000 common stones roughly by lore, but lets just give it high value)
        icon: '灵'
    },

    // --- New Manuals ---
    'book_fire_art': {
        id: 'book_fire_art',
        name: '烈火诀',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '火系入门功法玉简，记载了操控凡火的心得。',
        stackable: false,
        value: 200,
        learnSkillId: 'fireball',
        effect: {
            flags: ['HAS_CULTIVATION_METHOD', 'METHOD_FIRE'],
            ATK: 3,
            history: '你研读了《烈火诀》，仿佛指尖有火焰在跳动。'
        },
        icon: '火'
    },
    'book_phantom_step': {
        id: 'book_phantom_step',
        name: '幻影步法',
        type: 'CONSUMABLE',
        rarity: 'RARE',
        description: '一种极为灵动的身法，练至大成可踏雪无痕。',
        stackable: false,
        value: 800,
        learnSkillId: 'phantom_step',
        effect: {
            flags: ['HAS_AGILITY_METHOD'],
            SPD: 10,
            history: '你习得了《幻影步法》，感觉身体轻盈了许多。'
        },
        icon: '步'
    },

    // --- New Talismans ---
    'talisman_speed': {
        id: 'talisman_speed',
        name: '神行符',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '贴在腿上可日行千里，逃命赶路的佳品。',
        stackable: true,
        value: 50,
        effect: {
            history: '拍下神行符，双腿仿佛生风。'
        },
        icon: '符'
    },
    'talisman_armor': {
        id: 'talisman_armor',
        name: '金刚符',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '能在周身形成一道金刚护体气罩，抵御致命一击。',
        stackable: true,
        value: 100,
        effect: {
            history: '金刚符化作点点金光笼罩全身。'
        },
        icon: '符'
    },

    // ─── 炼丹专用灵草材料 ───
    'fire_seed': {
        id: 'fire_seed',
        name: '赤焰火种',
        type: 'MATERIAL',
        rarity: 'UNCOMMON',
        description: '蕴含地火精华的种子，是炼制丹药时引火入炉的关键催化剂。',
        stackable: true,
        value: 35,
        icon: '火'
    },
    'ice_lotus': {
        id: 'ice_lotus',
        name: '千年冰莲',
        type: 'MATERIAL',
        rarity: 'RARE',
        description: '生长于万年冰窟深处的奇花，花瓣晶莹如玉，是炼制培元、洗髓类丹药的核心灵药。',
        stackable: true,
        value: 300,
        icon: '莲'
    },
    'dragon_saliva_herb': {
        id: 'dragon_saliva_herb',
        name: '龙涎草',
        type: 'MATERIAL',
        rarity: 'RARE',
        description: '传说因真龙口涎滋润一方灵土而生的异草，药香浓烈，可入高阶丹方。',
        stackable: true,
        value: 500,
        icon: '龙'
    },
    'purple_cloud_fruit': {
        id: 'purple_cloud_fruit',
        name: '紫云果',
        type: 'MATERIAL',
        rarity: 'EPIC',
        description: '仅在紫霄峰绝巅云海中结果的圣果，百年一熟，服之可通灵窍。是炼制筑基丹与增寿丹的关键。',
        stackable: true,
        value: 2000,
        icon: '果'
    },

    // ─── 炼丹成品：新增丹药 ───
    'peiyuan_pill': {
        id: 'peiyuan_pill',
        name: '培元丹',
        type: 'CONSUMABLE',
        rarity: 'UNCOMMON',
        description: '温补根基之丹，服用后资质略有提升，修炼速度永久增加。',
        stackable: true,
        value: 200,
        effect: {
            POT: 1,
            history: '培元丹化作暖流流遍经脉，根基更加稳固了。'
        },
        icon: '丹'
    },
    'xisui_pill': {
        id: 'xisui_pill',
        name: '洗髓丹',
        type: 'CONSUMABLE',
        rarity: 'RARE',
        description: '脱胎换骨之丹，服用后洗涤经脉杂质，体魄与悟性永久提升。',
        stackable: true,
        value: 800,
        effect: {
            STR: 2,
            INT: 2,
            history: '洗髓丹药力在体内炸开，剧痛过后浑身轻松了许多，仿佛脱胎换骨。'
        },
        icon: '丹'
    },
    'zengshou_pill': {
        id: 'zengshou_pill',
        name: '增寿丹',
        type: 'CONSUMABLE',
        rarity: 'LEGENDARY',
        description: '逆天改命的无上神丹，服用后可延长寿元五十年。',
        stackable: true,
        value: 50000,
        effect: {
            LIFESPAN: 600, // 50 years * 12 months
            history: '增寿丹入腹，仿佛有一股鸿蒙之力洗涤四肢百骸，你感觉...生命的尽头被推远了。'
        },
        icon: '丹'
    },
};

export const LOOT_TABLES = {
    'LOW_LEVEL': [
        { itemId: 'spirit_stone', weight: 50, min: 1, max: 3 },
        { itemId: 'spirit_shard', weight: 30, min: 2, max: 5 },
        { itemId: 'iron', weight: 10, min: 1, max: 1 },
        { itemId: 'spirit_herb', weight: 5, min: 1, max: 1 },
        { itemId: 'book_body_art', weight: 2, min: 1, max: 1 },
        { itemId: 'iron_sword', weight: 2, min: 1, max: 1 },
        { itemId: 'cloth_armor', weight: 2, min: 1, max: 1 },
        { itemId: 'monster_core', weight: 3, min: 1, max: 1 }
    ],
    'MID_LEVEL': [
        { itemId: 'spirit_stone', weight: 50, min: 10, max: 30 },
        { itemId: 'minor_heal_pill', weight: 20, min: 1, max: 2 },
        { itemId: 'talisman_fire', weight: 15, min: 1, max: 1 },
        { itemId: 'book_sword_art', weight: 4, min: 1, max: 1 },
        { itemId: 'jade_sword', weight: 5, min: 1, max: 1 },
        { itemId: 'silk_robe', weight: 5, min: 1, max: 1 },
        { itemId: 'century_ginseng', weight: 10, min: 1, max: 2 },
        { itemId: 'beast_blood', weight: 8, min: 1, max: 1 }
    ],
    'HIGH_LEVEL': [
        { itemId: 'pure_spirit_stone', weight: 30, min: 1, max: 5 },
        { itemId: 'major_heal_pill', weight: 15, min: 1, max: 2 },
        { itemId: 'phantom_armor', weight: 2, min: 1, max: 1 },
        { itemId: 'fire_fan', weight: 3, min: 1, max: 1 },
        { itemId: 'soul_wood_bracelet', weight: 4, min: 1, max: 1 },
        { itemId: 'core_formation_pill', weight: 1, min: 1, max: 1 } // Extremely rare
    ]
};

Object.assign(ITEMS, {
    voidbreaker_blade: {
        id: 'voidbreaker_blade',
        name: '斩虚古锋',
        type: 'EQUIPMENT',
        equipType: 'WEAPON',
        rarity: 'LEGENDARY',
        description: '历经终局大战后仍未崩毁的古锋，专克邪祟与裂界之物。',
        stackable: false,
        value: 18000,
        statBonuses: { ATK: 120, CRIT: 12, SPD: 10 },
        icon: '剑',
    },
    dawnfire_robe: {
        id: 'dawnfire_robe',
        name: '曙火天衣',
        type: 'EQUIPMENT',
        equipType: 'ARMOR',
        rarity: 'LEGENDARY',
        description: '曙光盟约汇聚各家火种缝成的护身法袍，能在大战余烬中稳住气机。',
        stackable: false,
        value: 16000,
        statBonuses: { DEF: 85, MAX_HP: 420, MAX_MP: 180 },
        icon: '袍',
    },
    mirror_of_returning_dawn: {
        id: 'mirror_of_returning_dawn',
        name: '回明宝鉴',
        type: 'EQUIPMENT',
        equipType: 'ACCESSORY',
        rarity: 'LEGENDARY',
        description: '以坠星残片与归墟边壳炼成的宝鉴，既可聚灵，也可映照敌势。',
        stackable: false,
        value: 20000,
        statBonuses: { MAX_MP: 360, ATK: 28, DEF: 18, SPD: 12 },
        icon: '镜',
    },
});

LOOT_TABLES.HIGH_LEVEL.push(
    { itemId: 'voidbreaker_blade', weight: 1, min: 1, max: 1 },
    { itemId: 'dawnfire_robe', weight: 1, min: 1, max: 1 },
    { itemId: 'mirror_of_returning_dawn', weight: 1, min: 1, max: 1 },
);
