import type { CombatEntity } from '../types/combat';

// A collection of pre-defined enemy templates
export const ENEMIES: Record<string, Partial<CombatEntity>> = {
    // --- Low Level (Mortal / Early Qi) ---
    'wild_boar': {
        id: 'wild_boar',
        name: '狂化野猪',
        levelStr: '凡兽',
        hp: 50,
        maxHp: 50,
        mp: 0,
        maxMp: 0,
        atk: 8,
        def: 3,
        spd: 5,
        crit: 5,
        skills: [
            {
                id: 'boar_charge',
                name: '野蛮冲撞',
                description: '用坚硬的獠牙猛烈撞击',
                type: 'ATTACK',
                costType: 'NONE',
                costAmount: 0,
                cooldown: 2,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 1.5
            }
        ]
    },
    'thug': {
        id: 'thug',
        name: '山贼蒙面人',
        levelStr: '凡人武夫',
        hp: 80,
        maxHp: 80,
        mp: 0,
        maxMp: 0,
        atk: 12,
        def: 5,
        spd: 10,
        crit: 10,
        skills: [
            {
                id: 'thug_slash',
                name: '乱刀斩',
                description: '毫无章法的疯狂砍杀',
                type: 'ATTACK',
                costType: 'NONE',
                costAmount: 0,
                cooldown: 0,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 1.2
            }
        ]
    },
    'qi_cultivator_rogue': {
        id: 'qi_cultivator_rogue',
        name: '落魄散修',
        levelStr: '练气三层',
        hp: 150,
        maxHp: 150,
        mp: 50,
        maxMp: 50,
        atk: 20,
        def: 10,
        spd: 15,
        crit: 5,
        skills: [
            {
                id: 'fireball_weak',
                name: '小火球',
                description: '低劣的火弹术',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 10,
                cooldown: 0,
                target: 'ENEMY',
                damageType: 'MAGICAL',
                powerMultiplier: 1.3
            }
        ]
    },
    'cave_snake': {
        id: 'cave_snake',
        name: '灰鳞洞蛇',
        levelStr: '凡兽',
        hp: 90,
        maxHp: 90,
        mp: 0,
        maxMp: 0,
        atk: 16,
        def: 4,
        spd: 18,
        crit: 8,
        skills: [
            {
                id: 'snake_bite',
                name: '毒牙噬咬',
                description: '借速度贴身撕咬，攻击很快。',
                type: 'ATTACK',
                costType: 'NONE',
                costAmount: 0,
                cooldown: 0,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 1.25,
                flatDamage: 4
            }
        ]
    },
    'grave_robber': {
        id: 'grave_robber',
        name: '流窜盗墓贼',
        levelStr: '凡俗武夫',
        hp: 110,
        maxHp: 110,
        mp: 0,
        maxMp: 0,
        atk: 18,
        def: 7,
        spd: 12,
        crit: 12,
        skills: [
            {
                id: 'dirty_trick',
                name: '撒灰偷袭',
                description: '先扰乱视线再挥刀扑上来。',
                type: 'ATTACK',
                costType: 'NONE',
                costAmount: 0,
                cooldown: 1,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 1.35
            }
        ]
    },

    // --- Mid Level (Mid-Late Qi / Early Foundation) ---
    'demon_wolf': {
        id: 'demon_wolf',
        name: '幽风魔狼',
        levelStr: '一阶妖兽',
        hp: 300,
        maxHp: 300,
        mp: 100,
        maxMp: 100,
        atk: 45,
        def: 25,
        spd: 35,
        crit: 15,
        skills: [
            {
                id: 'wolf_wind_blade',
                name: '风刃吐息',
                description: '口吐锐利的风刃',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 15,
                cooldown: 1,
                target: 'ENEMY',
                damageType: 'MAGICAL',
                powerMultiplier: 1.5,
                flatDamage: 20
            }
        ]
    },
    'sect_disciple': {
        id: 'sect_disciple',
        name: '黑煞宗外门弟子',
        levelStr: '练气九层',
        hp: 500,
        maxHp: 500,
        mp: 200,
        maxMp: 200,
        atk: 60,
        def: 40,
        spd: 30,
        crit: 10,
        skills: [
            {
                id: 'black_saber',
                name: '黑煞刀法',
                description: '阴毒的刀招',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 20,
                cooldown: 0,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 1.8
            },
            {
                id: 'blood_sacrifice',
                name: '燃血遁',
                description: '燃烧精血提升速度',
                type: 'BUFF',
                costType: 'HP',
                costAmount: 50,
                cooldown: 5,
                target: 'SELF',
                applyBuffs: [{
                    id: 'buff_blood_spd',
                    name: '燃血',
                    description: '速度大幅提升',
                    duration: 3,
                    type: 'BUFF',
                    effect: { statMultiplier: { SPD: 2.0 } }
                }]
            }
        ]
    },
    'marsh_spirit': {
        id: 'marsh_spirit',
        name: '沼泽瘴灵',
        levelStr: '炼气六层',
        hp: 260,
        maxHp: 260,
        mp: 120,
        maxMp: 120,
        atk: 32,
        def: 18,
        spd: 20,
        crit: 6,
        skills: [
            {
                id: 'miasma_blast',
                name: '瘴气冲击',
                description: '凝聚湿冷瘴气轰向敌人。',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 12,
                cooldown: 1,
                target: 'ENEMY',
                damageType: 'MAGICAL',
                powerMultiplier: 1.6,
                flatDamage: 18
            },
            {
                id: 'marsh_guard',
                name: '泥沼护体',
                description: '用湿重灵气加固自身护体。',
                type: 'DEFENSE',
                costType: 'MP',
                costAmount: 10,
                cooldown: 3,
                target: 'SELF'
            }
        ]
    },
    'wandering_blade': {
        id: 'wandering_blade',
        name: '游荡刀修',
        levelStr: '炼气七层',
        hp: 280,
        maxHp: 280,
        mp: 80,
        maxMp: 80,
        atk: 38,
        def: 20,
        spd: 26,
        crit: 14,
        skills: [
            {
                id: 'flying_chop',
                name: '追风斩',
                description: '身随刀走，攻势凌厉。',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 15,
                cooldown: 1,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 1.75,
                flatDamage: 16
            },
            {
                id: 'guarded_breath',
                name: '敛息护身',
                description: '先稳住气机，再寻找机会。',
                type: 'BUFF',
                costType: 'MP',
                costAmount: 12,
                cooldown: 4,
                target: 'SELF',
                applyBuffs: [{
                    id: 'buff_guarded_breath',
                    name: '敛息',
                    description: '防守反击，提升防御。',
                    duration: 2,
                    type: 'BUFF',
                    effect: { statMultiplier: { DEF: 1.4 } }
                }]
            }
        ]
    },

    // --- High Level (Core Formation and above) ---
    'demon_king': {
        id: 'demon_king',
        name: '覆海蛟龙',
        levelStr: '三阶大妖',
        hp: 5000,
        maxHp: 5000,
        mp: 2000,
        maxMp: 2000,
        atk: 300,
        def: 250,
        spd: 150,
        crit: 20,
        skills: [
            {
                id: 'dragon_breath',
                name: '覆海真息',
                description: '翻江倒海的龙息',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 100,
                cooldown: 3,
                target: 'ENEMY',
                damageType: 'MAGICAL',
                powerMultiplier: 3.5,
                flatDamage: 500
            }
        ]
    }
};

Object.assign(ENEMIES, {
    void_reaver: {
        id: 'void_reaver',
        name: '归墟裂杀号',
        levelStr: '黑潮凶灵',
        hp: 3600,
        maxHp: 3600,
        mp: 1200,
        maxMp: 1200,
        atk: 340,
        def: 210,
        spd: 175,
        crit: 16,
        critDamage: 1.8,
        skills: [
            {
                id: 'void_rend',
                name: '裂潮斩',
                description: '裹挟裂口恶意的一记横斩。',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 35,
                cooldown: 1,
                target: 'ENEMY',
                damageType: 'MAGICAL',
                powerMultiplier: 1.9,
                flatDamage: 48,
            },
            {
                id: 'void_howl',
                name: '归墟厉啸',
                description: '以尖啸震荡对手心神。',
                type: 'BUFF',
                costType: 'MP',
                costAmount: 28,
                cooldown: 3,
                target: 'SELF',
                applyBuffs: [{
                    id: 'buff_void_howl',
                    name: '裂潮狂啸',
                    description: '被黑潮恶意灌体，攻速暴涨。',
                    duration: 2,
                    type: 'BUFF',
                    effect: { statMultiplier: { ATK: 1.35, SPD: 1.25 } },
                }],
            },
        ],
    },
    starfall_remnant: {
        id: 'starfall_remnant',
        name: '坠星残灵',
        levelStr: '上古残祟',
        hp: 5400,
        maxHp: 5400,
        mp: 2200,
        maxMp: 2200,
        atk: 430,
        def: 260,
        spd: 195,
        crit: 18,
        critDamage: 1.9,
        skills: [
            {
                id: 'star_shard_burst',
                name: '坠星碎雨',
                description: '牵引破碎星辉成片轰落。',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 60,
                cooldown: 2,
                target: 'ENEMY',
                damageType: 'MAGICAL',
                powerMultiplier: 2.2,
                flatDamage: 96,
            },
            {
                id: 'ancient_shell',
                name: '古壳回光',
                description: '短暂凝出残缺古禁，抵消伤害。',
                type: 'DEFENSE',
                costType: 'MP',
                costAmount: 36,
                cooldown: 3,
                target: 'SELF',
            },
        ],
    },
    black_tide_overseer: {
        id: 'black_tide_overseer',
        name: '黑潮监军',
        levelStr: '归墟将种',
        hp: 7600,
        maxHp: 7600,
        mp: 2800,
        maxMp: 2800,
        atk: 620,
        def: 360,
        spd: 240,
        crit: 20,
        critDamage: 2.05,
        skills: [
            {
                id: 'tide_halberd',
                name: '镇潮戟',
                description: '重戟携黑潮之势悍然砸落。',
                type: 'ATTACK',
                costType: 'MP',
                costAmount: 80,
                cooldown: 1,
                target: 'ENEMY',
                damageType: 'PHYSICAL',
                powerMultiplier: 2.35,
                flatDamage: 140,
            },
            {
                id: 'war_banner',
                name: '劫旗压阵',
                description: '高举黑潮战旗，令自身威压暴涨。',
                type: 'BUFF',
                costType: 'MP',
                costAmount: 55,
                cooldown: 4,
                target: 'SELF',
                applyBuffs: [{
                    id: 'buff_war_banner',
                    name: '黑潮战旗',
                    description: '黑潮战意灌体，攻防双涨。',
                    duration: 3,
                    type: 'BUFF',
                    effect: { statMultiplier: { ATK: 1.3, DEF: 1.25 } },
                }],
            },
        ],
    },
});
