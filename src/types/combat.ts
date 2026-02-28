export type DamageType = 'PHYSICAL' | 'MAGICAL' | 'TRUE' | 'LIGHTNING';

export interface CombatBuff {
    id: string;
    name: string;
    description: string;
    duration: number; // Turns remaining
    type: 'BUFF' | 'DEBUFF';
    // Effects applied per turn or static
    effect?: {
        dot?: number; // Damage over time
        hot?: number; // Heal over time
        statMultiplier?: {
            ATK?: number;
            DEF?: number;
            SPD?: number;
        };
    };
}

export interface CombatSkill {
    id: string;
    name: string;
    description: string;
    type: 'ATTACK' | 'HEAL' | 'BUFF' | 'DEFENSE';
    costType: 'MP' | 'HP' | 'NONE';
    costAmount: number;
    cooldown: number; // Max cooldown
    currentCooldown?: number; // stateful
    target: 'ENEMY' | 'SELF' | 'ALL_ENEMIES';

    // Attack
    damageType?: DamageType;
    powerMultiplier?: number; // e.g., 1.5x ATK
    flatDamage?: number;

    // Heal
    healMultiplier?: number; // e.g., 0.5x INT/ATK

    // Buff
    applyBuffs?: CombatBuff[];
}

export interface CombatEntity {
    id: string;
    name: string;
    isPlayer: boolean;
    levelStr: string; // e.g., 练气初期, 二阶妖兽

    // Current Vitals
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    shield: number; // Temporary HP/Shield

    // Core Combat Stats
    atk: number;
    def: number;
    spd: number;
    crit: number; // 0-100%
    critDamage: number; // e.g., 1.5

    skills: CombatSkill[];
    buffs: CombatBuff[];
}

export interface CombatLogRecord {
    turn: number;
    actorName: string;
    targetName: string;
    skillName: string;
    damage: number;
    isCrit: boolean;
    heal: number;
    message: string;
}

export interface CombatState {
    id: string; // unique combat id
    type: 'WILD' | 'NPC' | 'TRIBULATION' | 'SPARRING'; // defines lethality
    player: CombatEntity;
    enemy: CombatEntity;
    turn: number;
    logs: CombatLogRecord[];
    isPlayerTurn: boolean;
    status: 'ACTIVE' | 'VICTORY' | 'DEFEAT' | 'FLED';
    context?: Record<string, unknown>; // For loot or callbacks
}
