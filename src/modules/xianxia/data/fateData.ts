import type { FateEntry, FateGrade } from '../../../types';

/**
 * 灵根修炼速度倍率表
 * 五灵根(保底) = 1.0x, 天灵根 = 6.0x, 混沌灵根 = 10.0x
 */
export const SPIRIT_ROOT_SPEED: Record<string, number> = {
    'FATE_SPIRIT_ROOT_FIVE': 1.0,      // 五灵根 100%
    'FATE_SPIRIT_ROOT_FOUR': 1.5,      // 四灵根 150%
    'FATE_SPIRIT_ROOT_THREE': 2.5,     // 三灵根 250%
    'FATE_SPIRIT_ROOT_DUAL': 4.0,      // 双灵根 400%
    'FATE_SPIRIT_ROOT_MUTANT': 5.0,    // 变异灵根 500%
    'FATE_SPIRIT_ROOT_HEAVENLY': 6.0,  // 天灵根 600%
    'FATE_SPIRIT_ROOT_CHAOS': 10.0,    // 混沌灵根 1000%（特殊命格）
};

/**
 * 先天命格数据库
 * 根据出生属性/背景/天赋决定
 */
export const INNATE_FATES: FateEntry[] = [
    // === 灵根类 ===
    { id: 'FATE_SPIRIT_ROOT_HEAVENLY', name: '天灵根', grade: 6 as FateGrade, description: '天生灵根纯净无比，修炼速度×6.0', effects: { POT: 10, INT: 5 }, cultivationSpeed: 6.0 },
    { id: 'FATE_SPIRIT_ROOT_MUTANT', name: '变异灵根', grade: 5 as FateGrade, description: '灵根发生变异，蕴含独特力量，修炼速度×5.0', effects: { POT: 8, LUCK: 3 }, cultivationSpeed: 5.0 },
    { id: 'FATE_SPIRIT_ROOT_DUAL', name: '双灵根', grade: 4 as FateGrade, description: '天赋不凡，修炼之路较为顺畅，修炼速度×4.0', effects: { POT: 5 }, cultivationSpeed: 4.0 },
    { id: 'FATE_SPIRIT_ROOT_THREE', name: '三灵根', grade: 3 as FateGrade, description: '中规中矩的灵根资质，修炼速度×2.5', effects: { POT: 2 }, cultivationSpeed: 2.5 },
    { id: 'FATE_SPIRIT_ROOT_FOUR', name: '四灵根', grade: 2 as FateGrade, description: '灵根驳杂，修炼较为缓慢，修炼速度×1.5', effects: { POT: 1 }, cultivationSpeed: 1.5 },
    { id: 'FATE_SPIRIT_ROOT_FIVE', name: '五灵根', grade: 1 as FateGrade, description: '灵根最为驳杂，修炼速度×1.0（保底）', effects: {}, cultivationSpeed: 1.0 },

    // === 体质类 ===
    { id: 'FATE_BODY_DIVINE', name: '先天道体', grade: 6 as FateGrade, description: '传说中的修炼体质，万中无一', effects: { STR: 10, HP: 50 } },
    { id: 'FATE_BODY_STRONG', name: '天生神力', grade: 4 as FateGrade, description: '力大无穷，体魄远超同龄人', effects: { STR: 5, HP: 20 } },
    { id: 'FATE_BODY_NORMAL', name: '凡躯', grade: 2 as FateGrade, description: '寻常体质，不特别出众', effects: {} },
    { id: 'FATE_BODY_SICKLY', name: '先天体弱', grade: 1 as FateGrade, description: '体弱多病，需多加调养', effects: { STR: -3, HP: -10 } },

    // === 命运类 ===
    { id: 'FATE_LUCKY_STAR', name: '福星命', grade: 5 as FateGrade, description: '天运加身，逢凶化吉', effects: { LUCK: 10 } },
    { id: 'FATE_MERCHANT', name: '商贾之命', grade: 3 as FateGrade, description: '天生就有经商之才', effects: { CHR: 3, LUCK: 2 } },
    { id: 'FATE_SCHOLAR', name: '文曲星照', grade: 4 as FateGrade, description: '聪慧过人，读书一目十行', effects: { INT: 5 } },
    { id: 'FATE_LONER', name: '孤星命', grade: 2 as FateGrade, description: '天煞孤星，亲缘淡薄', effects: { LUCK: -2, INT: 2 } },
    { id: 'FATE_COMMONER', name: '平凡之命', grade: 1 as FateGrade, description: '芸芸众生中的一员', effects: {} },

    // === 气运类（高级） ===
    { id: 'FATE_PROTAGONIST', name: '主角光环', grade: 6 as FateGrade, description: '命运之子，气运深厚不可估量', effects: { LUCK: 15, POT: 5 } },
    { id: 'FATE_REINCARNATED', name: '转世重修', grade: 5 as FateGrade, description: '前世大能转世，记忆残留', effects: { INT: 10, WIL: 5 } },
];

/**
 * 根据出生属性决定先天命格
 * 保证至少3个命格：灵根 + 体质 + 命运
 * 所有角色必定获得灵根（最差五灵根保底）
 */
export function determineFate(attributes: { [key: string]: number }, background: string, talentIds: string[]): { fates: FateEntry[], spiritRootType: string, cultivationSpeedMultiplier: number } {
    const fates: FateEntry[] = [];
    let spiritRootType = 'FATE_SPIRIT_ROOT_FIVE';
    let cultivationSpeedMultiplier = 1.0;

    // 1. 灵根命格（根据资质 POT）— 必定有一个（保底五灵根）
    const pot = attributes.POT || attributes.ROOT || 0;
    let rootFate: FateEntry;
    if (pot >= 20) {
        rootFate = INNATE_FATES.find(f => f.id === 'FATE_SPIRIT_ROOT_HEAVENLY')!;
    } else if (pot >= 15) {
        rootFate = INNATE_FATES.find(f => f.id === 'FATE_SPIRIT_ROOT_MUTANT')!;
    } else if (pot >= 10) {
        rootFate = INNATE_FATES.find(f => f.id === 'FATE_SPIRIT_ROOT_DUAL')!;
    } else if (pot >= 6) {
        rootFate = INNATE_FATES.find(f => f.id === 'FATE_SPIRIT_ROOT_THREE')!;
    } else if (pot >= 3) {
        rootFate = INNATE_FATES.find(f => f.id === 'FATE_SPIRIT_ROOT_FOUR')!;
    } else {
        rootFate = INNATE_FATES.find(f => f.id === 'FATE_SPIRIT_ROOT_FIVE')!;
    }
    fates.push(rootFate);
    spiritRootType = rootFate.id;
    cultivationSpeedMultiplier = rootFate.cultivationSpeed || SPIRIT_ROOT_SPEED[rootFate.id] || 1.0;

    // 特殊：混沌道体命格额外提升修炼速度
    if (talentIds.includes('TAL_R_CHAOS')) {
        cultivationSpeedMultiplier = 10.0;
        spiritRootType = 'FATE_SPIRIT_ROOT_CHAOS';
    }

    // 2. 体质命格（根据体魄 STR）— 必定有一个
    const str = attributes.STR || 0;
    if (str >= 15) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_BODY_DIVINE')!);
    } else if (str >= 10) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_BODY_STRONG')!);
    } else if (str <= 2) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_BODY_SICKLY')!);
    } else {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_BODY_NORMAL')!);
    }

    // 3. 命运命格（根据气运 LUCK + 悟性 INT）— 必定有一个
    const luck = attributes.LUCK || 0;
    const int = attributes.INT || 0;
    if (luck >= 15) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_LUCKY_STAR')!);
    } else if (int >= 12) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_SCHOLAR')!);
    } else if (luck <= 2 && luck > 0) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_LONER')!);
    } else {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_COMMONER')!);
    }

    // 4. 额外命格：特殊天赋映射
    if (talentIds.includes('TAL_O_REBIRTH')) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_REINCARNATED')!);
    }
    if (talentIds.includes('TAL_O_PROTAGONIST')) {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_PROTAGONIST')!);
    }

    // 5. 背景命格
    if (background === 'RICH') {
        fates.push(INNATE_FATES.find(f => f.id === 'FATE_MERCHANT')!);
    }

    // 去重 + 过滤 undefined
    const uniqueFates = [...new Map(fates.filter(Boolean).map(f => [f.id, f])).values()];
    return { fates: uniqueFates, spiritRootType, cultivationSpeedMultiplier };
}
