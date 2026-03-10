
import type { CombatState, CombatEntity } from './combat';

export interface StatConfig {
    id: string;
    name: string;
    min?: number;
    max?: number;
    visible?: boolean;
}

export interface PlayerStats {
    [key: string]: number;
}

/**
 * Effect — 事件/选项的效果定义
 * 
 * 属性修改采用**平铺**方式，key 为 ModuleConfig.stats 中注册的属性 ID。
 * 例如 `{ STR: 5, INT: -2 }` 表示体魄+5, 悟性-2。
 * 
 * 运行时安全：EventValidator 会在 AI 事件注入时验证 key 是否为已注册属性。
 * 编译时无法完全约束（因为属性 ID 是配置驱动的），故保留 index signature。
 */
export interface Effect {
    /** 动态属性修改（key = 属性 ID, value = 修改量） */
    [key: string]: number | string | string[] | object | undefined;

    // ─── Well-known Fields ───
    /** 添加标记到角色状态 */
    flags?: string[];
    /** 附加到历史日志的文本 */
    history?: string;
    /** 嵌套属性修改（legacy 格式，新事件建议使用平铺） */
    stats?: { [key: string]: number };
    /** 每回合持续效果 */
    per_turn?: { [key: string]: number };
    /** 获得的物品 ID 列表 */
    items?: string[];
    /** 获得单个物品 ID */
    item?: string;
}

export type TalentEffect = Effect;


// --- Standardization Types (V2) ---
export type TriggerType = 'PASSIVE' | 'TURN_START' | 'TURN_END' | 'AGE_UP' | 'BATTLE_START' | 'BATTLE_END';
export type ConditionOp = 'GT' | 'LT' | 'EQ' | 'GTE' | 'LTE' | 'NEQ' | 'IN' | 'NIN';
export const CONDITION_OPS: ConditionOp[] = ['GT', 'LT', 'EQ', 'GTE', 'LTE', 'NEQ', 'IN', 'NIN'];

export type ConditionType = 'STAT' | 'ATTRIBUTE' | 'FLAG' | 'AGE' | 'WORLD_ERA' | 'WORLD_LUCK' | 'REALM' | 'ROOT_STATE';
export const CONDITION_TYPES: ConditionType[] = ['STAT', 'ATTRIBUTE', 'FLAG', 'AGE', 'WORLD_ERA', 'WORLD_LUCK', 'REALM', 'ROOT_STATE'];

export interface Condition {
    type: ConditionType;
    target?: string; // e.g. 'STR', 'BG_FARMER'. Optional for AGE, REALM etc.
    op: ConditionOp;
    value: number | string | string[] | boolean;
}

export interface TalentModifier {
    trigger: TriggerType;
    conditions?: Condition[];
    probability?: number; // 0-1

    // The actual effect
    stats?: Partial<CharacterAttributes>;
    battle?: Partial<BattleStats>;
    resource?: Record<string, number>; // Spirit stones, etc.
}

export interface Talent {
    id: string;
    name: string;
    grade: 1 | 2 | 3 | 4 | 5 | 6; // Updated to include 5/6
    description: string;
    modifiers?: TalentModifier[]; // New Standard
    effect?: TalentEffect; // Legacy Support
}

export interface EventRequirement {
    // Legacy mapping support, eventually replace with just 'conditions'
    conditions?: Condition[];

    minAge?: number;
    maxAge?: number;
    stats?: Record<string, number>; // Attributes >= value
    flags?: string[];
    random?: number; // 0-1 (Luck factor)
}

export interface EventOutcome {
    text: string;
    effect?: Effect; // Re-use generic effect for simple stat changes
    death?: boolean;
    nextEventId?: string; // Chain events
    combat?: { enemy: Partial<CombatEntity>, type?: CombatState['type'] }; // Trigger combat
}

export interface EventChoice {
    text: string;
    conditions?: Condition[]; // V2
    effect?: Effect;
    combat?: { enemy: Partial<CombatEntity>, type?: CombatState['type'] }; // Trigger combat
}

export interface GameEvent {
    id: string;
    title?: string;

    // Logic V2 - Unified Condition System
    conditions?: Condition[];
    probability?: number; // 0-1 (Random chance to trigger if conditions met)

    branches?: {
        check: Condition[]; // Strict V2
        success: EventOutcome;
        failure: EventOutcome;
    }[];

    content: string;

    // VN Scene Support
    scene?: SceneData;

    effect?: Effect;
    choices?: EventChoice[];

    // UI/Meta
    eventType?: 'MAIN' | 'RANDOM' | 'CRISIS' | 'OPPORTUNITY';
}

export interface WorldEra {
    id: string;
    name: string; // e.g. "末法时代", "灵气复苏"
    description: string;
    luckModifier: number; // Global luck buff/debuff
    spiritDensity: number; // Affects cultivation speed
}

export interface WorldState {
    era: WorldEra;
    globalLuck: number; // 0-100, affects drop rates globally
    turn: number; // Global turn counter
    activeEvents: string[]; // Active world events (e.g. "Demon Invasion")
}

export interface BattleStats {
    MAX_HP: number; // Health Limit
    MAX_MP: number; // Mana Limit
    ATK: number;
    DEF: number;
    SPD: number; // Speed / Dodge
    CRIT: number; // Crit Rate %
    [key: string]: number; // Allow extensibility
}

// --- Stats System ---
// --- Stats System ---
export interface CharacterAttributes {
    [key: string]: number;
}

export interface NPC {
    id: string;
    name: string;
    gender: 'M' | 'F';
    relation: string; // 'Father', 'Mother', 'Friend', 'Enemy' (Legacy)
    desc: string;
    intimacy: number; // 0-100 (Legacy)
    affinity: number; // -100 to 100 [NEW] Favorability / Hostility
    relationships: string[]; // e.g. ['ENEMY', 'PARTNER', 'MASTER', 'DISCIPLE'] [NEW]
    // Life
    age: number;
    lifespan: number;
    alive: boolean;
    // Power
    realm: string; // Display name e.g. "筑基后期"
    attributes: CharacterAttributes;
    battleStats: BattleStats;
}

import type { SceneData } from './meta';
export type Gender = 'Male' | 'Female';
export type Race = 'HUMAN' | 'YAO' | 'DRAGON' | 'PHOENIX' | 'GHOST' | 'DEVIL';

export interface ProfessionStats {
    level: number; // 1-9
    exp: number;
    maxExp: number;
}

export interface Professions {
    [key: string]: ProfessionStats;
}

export interface Pet {
    id: string;
    name: string;
    type: string; // e.g. "Spirit Fox"
    realm: string;
    stats: BattleStats; // Keep BattleStats for combat for now
    intimacy: number;
}

export interface Home {
    level: number;
    name: string; // e.g. "Create Cave"
    modules: string[]; // e.g. "Herb Garden", "Alchemy Room"
    resources: { [key: string]: number }; // Spirit Stones, Wood, Iron
}

// --- 先天命格 (Innate Fate) ---
export type FateGrade = 1 | 2 | 3 | 4 | 5 | 6; // 凡 | 良 | 优 | 极 | 仙 | 天
export const FATE_GRADE_NAMES: Record<FateGrade, string> = { 1: '凡', 2: '良', 3: '优', 4: '极', 5: '仙', 6: '天' };
export const FATE_GRADE_COLORS: Record<FateGrade, string> = {
    1: '#9ca3af', // 灰
    2: '#22c55e', // 绿
    3: '#3b82f6', // 蓝
    4: '#a855f7', // 紫
    5: '#f59e0b', // 金
    6: '#ef4444', // 红
};

export interface FateEntry {
    id: string;
    name: string;       // e.g. "天灵根", "商贾之命"
    grade: FateGrade;
    description: string;
    effects?: { [key: string]: number }; // 永久属性加成
    cultivationSpeed?: number; // 灵根修炼速度倍率 (1.0 = 100%)
}

// --- 后天气运 (Acquired Fortune Buffs) ---
export interface FortuneBuff {
    id: string;
    name: string;       // e.g. "福星高照", "霉运缠身"
    grade: FateGrade;
    description: string;
    effects: { [key: string]: number }; // 暂时性属性加成
    durationMonths: number;  // 总持续时间(月)
    remainingMonths: number; // 剩余时间(月)
    sourceEventId?: string;  // 来源事件
}

import type { WorldSnapshot } from './worldTypes';



export interface PlayerState {
    name: string;
    gender: Gender;
    race: Race;
    age: number;
    months: number;
    day: number;
    realm_idx: number; // Major Realm Index
    sub_realm_idx: number; // Sub-Realm Index
    exp: number; // Cultivation Experience
    maxExp: number; // Required EXP to reach next sub-realm

    // [NEW] 灵根系统
    spiritRootType: string; // 灵根类型 ID (e.g. 'FATE_SPIRIT_ROOT_FIVE')
    cultivationSpeedMultiplier: number; // 修炼速度倍率 (1.0 = 100%)

    // Core Data-Driven Stats
    attributes: CharacterAttributes;

    // Derived Combat Stats (Can also be data-driven later)
    battleStats: BattleStats;

    talents: Talent[];
    flags: string[];

    // Social & sub-systems
    relationships: NPC[];
    partners: string[];
    pets: Pet[];
    home: Home;
    professions: Professions;
    // Inventory
    inventory: import('./itemTypes').InventorySlot[];
    // Equipment
    equipment: {
        weapon: string | null;
        armor: string | null;
        accessory: string | null;
    };
    mount?: import('./itemTypes').Item; // [NEW] Mount Slot

    // Skills & Spells
    learnedSkills: string[];
    equippedSkills: (string | null)[]; // Max 4 equipped skills

    triggeredEvents: string[];

    history: string[];
    alive: boolean;
    background: string; // Generic string now

    // World Context
    world: WorldSnapshot;

    // [NEW] Tutorial State
    tutorialCompleted: boolean;

    // [NEW] 世界定位
    /** 当前所在区域ID */
    location: string;
    /** 所属宗门ID, null = 散修 */
    sect: string | null;

    // [NEW] Personality & Acquired Traits
    personality: { [key: string]: number };
    acquiredTraits: Talent[]; // Re-using Talent interface for traits

    // [NEW] 命格与气运
    fate: FateEntry[];         // 先天命格（永久）
    fortuneBuffs: FortuneBuff[]; // 后天气运（暂时）

    // [NEW] Mission System
    missions: {
        active: import('./missionTypes').GenericMissionState[];
        completed: string[]; // Mission IDs
    };

    // [NEW] Minigames State
    minigame?: {
        combat?: CombatState;
    };
}

export interface SaveSlotMeta {
    timestamp: number;
    name: string;
    summary: string;
    empty: boolean;
}

export interface SaveMeta {
    version?: number; // [NEW] Versioning
    lastPlayedSlot: number;
    slots: { [key: number]: SaveSlotMeta };
}

// --- Realm System (境界系统) ---

export interface RealmModifier {
    // Attribute bonuses
    stats?: Partial<BattleStats>;
    attributes?: Partial<CharacterAttributes>;
    // Special effects
    lifespanBonus?: number;
    spiritDensityReq?: number; // Minimum spirit density to practice
}

export interface RealmCondition {
    stats?: Partial<CharacterAttributes>;
    items?: string[]; // Required items to break through
    probability?: number; // Base success rate
}

export interface RealmDefinition {
    id: string;
    name: string;
    index: number; // 0-9
    desc: string;
    flavor: string; // Flavor text

    modifiers: RealmModifier;
    breakthrough: RealmCondition;

    subRealms?: string[]; // [NEW] Optional subdivisions
}

export const CULTIVATION_REALMS: RealmDefinition[] = [
    {
        id: 'REALM_MORTAL', name: '凡人', index: 0,
        desc: '普普通通的凡人，寿元不过百年。',
        flavor: '红尘滚滚，众生皆苦。',
        modifiers: { lifespanBonus: 0 },
        breakthrough: { probability: 1 },
        subRealms: []
    },
    {
        id: 'REALM_QI_REF', name: '炼气', index: 1,
        desc: '引气入体，踏入仙途。可使用低阶法术，身体素质远超凡人。',
        flavor: '吞吐天地灵气，洗涤肉身凡胎。',
        subRealms: ['一层', '二层', '三层', '四层', '五层', '六层', '七层', '八层', '九层', '十层'],
        modifiers: {
            lifespanBonus: 20,
            stats: { MP: 100, ATK: 10, DEF: 5 },
            attributes: { STR: 5, INT: 5, SPD: 5 }
        },
        breakthrough: { stats: { POT: 5 }, probability: 0.8 }
    },
    {
        id: 'REALM_FOUNDATION', name: '筑基', index: 2,
        desc: '铸就道基，法力液化。可御剑飞行，寿元大增，是真正的修仙者。',
        flavor: '百日筑基，大道始成。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 100,
            stats: { MP: 500, HP: 200, ATK: 50, DEF: 30 },
            attributes: { STR: 20, INT: 10, SPD: 10, MND: 10 }
        },
        breakthrough: { stats: { POT: 15 }, items: ['筑基丹'], probability: 0.4 }
    },
    {
        id: 'REALM_GOLDEN_CORE', name: '金丹', index: 3,
        desc: '体内结成金丹，精气神浑然一体。法力通玄，可借天地之威。',
        flavor: '一颗金丹吞入腹，我命由我不由天。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 300,
            stats: { MP: 2000, HP: 1000, ATK: 200, DEF: 100 },
            attributes: { STR: 50, INT: 20, SPD: 30, MND: 50 }
        },
        breakthrough: { stats: { POT: 30, MOOD: 80 }, probability: 0.2 }
    },
    {
        id: 'REALM_NAS_SOUL', name: '元婴', index: 4,
        desc: '破丹成婴，元神出窍。肉身毁而元神不灭，可瞬移，神通广大。',
        flavor: '神游太虚，瞬息千里。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 800,
            stats: { MP: 10000, HP: 5000, ATK: 1000, DEF: 500 },
            attributes: { STR: 100, INT: 50, SPD: 100, MND: 200 }
        },
        breakthrough: { stats: { POT: 50, WIL: 50 }, probability: 0.1 }
    },
    {
        id: 'REALM_DIVINITY', name: '化神', index: 5,
        desc: '元神寄托虚空，感悟天地法则。举手投足间引动天地之力。',
        flavor: '炼虚合道，超凡入圣。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 2000,
            stats: { MP: 50000, HP: 20000, ATK: 5000, DEF: 2000 },
            attributes: { ALL: 200, MND: 500 }
        },
        breakthrough: { stats: { POT: 80, INT: 80, WIL: 80 }, probability: 0.05 }
    },
    {
        id: 'REALM_REFINE_VOID', name: '炼虚', index: 6,
        desc: '返璞归真，炼化虚空。可撕裂空间，移星换斗，已是一方大能。',
        flavor: '大道三千，殊途同归。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 5000,
            stats: { MP: 200000, HP: 80000, ATK: 20000, DEF: 8000 },
            attributes: { ALL: 500, MND: 1000 }
        },
        breakthrough: { stats: { POT: 120, INT: 120, WIL: 120 }, probability: 0.03 }
    },
    {
        id: 'REALM_UNITY', name: '合体', index: 7,
        desc: '元神与肉身彻底合一，天人合一之境。一念之间可毁天灭地。',
        flavor: '天人合一，万法归宗。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 10000,
            stats: { MP: 800000, HP: 300000, ATK: 80000, DEF: 30000 },
            attributes: { ALL: 1000, MND: 2000 }
        },
        breakthrough: { stats: { POT: 200, INT: 200, WIL: 200 }, probability: 0.01 }
    },
    {
        id: 'REALM_MAHAYANA', name: '大乘', index: 8,
        desc: '修为通天，半步飞升。一举一动皆合天道，俯瞰苍生。',
        flavor: '道法自然，天道不可违。',
        subRealms: ['初期', '中期', '后期', '圆满'],
        modifiers: {
            lifespanBonus: 50000,
            stats: { MP: 5000000, HP: 2000000, ATK: 500000, DEF: 200000 },
            attributes: { ALL: 3000, MND: 5000 }
        },
        breakthrough: { stats: { POT: 500, INT: 500, WIL: 500 }, probability: 0.005 }
    }
];

// Legacy export for compatibility
export const REALMS = CULTIVATION_REALMS.map(r => r.name);

export type Tab = 'TALENTS' | 'EVENTS' | 'STATS' | 'REALMS' | 'QUESTS' | 'SYSTEMS';
