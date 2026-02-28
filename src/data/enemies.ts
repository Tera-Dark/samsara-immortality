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
