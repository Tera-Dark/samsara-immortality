import type { PlayerState, GameEvent, Talent, BattleStats, Effect, EventChoice, FortuneBuff } from '../types';
import type { ModuleConfig } from '../types/meta';
import { generateNPC, generateName } from '../utils/DataUtils';
import { GAME_RULES, NPC_DESCRIPTIONS, TEXT_CONSTANTS, INITIAL_STATE, BATTLE_STATS_DEFAULTS } from '../data/rules';
import { determineFate } from '../modules/xianxia/data/fateData';
import { WorldGenerator } from './WorldGenerator';
import type { Mission } from '../types/missionTypes';

// Systems
import { TimeSystem } from './systems/TimeSystem';
import { EventSystem } from './systems/EventSystem';
import { CultivationSystem } from './systems/CultivationSystem';
import { MissionSystem } from './systems/MissionSystem';
import { TalentSystem } from './systems/TalentSystem';
import { InventorySystem } from './systems/InventorySystem';
import { EquipmentSystem } from './systems/EquipmentSystem';
import { SkillSystem } from './systems/SkillSystem';
import { TravelSystem } from './systems/TravelSystem';

// Event Pipeline
import { EventPool } from './EventPool';

export class GameEngine {
    state: PlayerState;
    moduleConfig: ModuleConfig;
    talentsDB: Talent[];

    /** 事件池管理器 — 管理内置事件与 AI 注入事件 */
    readonly eventPool: EventPool;

    /** 事件列表访问器（向后兼容，从 EventPool 获取） */
    get events(): GameEvent[] {
        return this.eventPool.getPool();
    }

    constructor(config: ModuleConfig, events: GameEvent[], talents: Talent[], initialState?: Partial<PlayerState>) {
        this.moduleConfig = config;
        this.talentsDB = talents;

        // Initialize EventPool with registered stat IDs from config
        const registeredStats = config.stats.map(s => s.id);
        const registeredResources = config.resources?.map(r => r.id) || [];
        this.eventPool = new EventPool({
            registeredStats,
            registeredResources,
            allowUnknownStats: true, // Lenient for now — existing events use keys like EXP, MNY, DAO etc.
        });
        this.eventPool.registerCoreEvents(events);

        this.state = { ...this.getInitialState(), ...initialState } as PlayerState;
    }

    hotReload(config: ModuleConfig, events: GameEvent[]) {
        this.moduleConfig = config;
        this.eventPool.registerCoreEvents(events);
        // Basic hot reload support for editor
    }

    getInitialState(): PlayerState {
        // Initialize attributes from Module Config
        const attributes: Record<string, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.moduleConfig.stats.forEach((s: any) => {
            attributes[s.id] = s.base;
        });

        const initialBattleStats: BattleStats = {
            MAX_HP: attributes.HP || 100,
            MAX_MP: attributes.MP || 0,
            ...BATTLE_STATS_DEFAULTS,
            MOVE_SPEED: 20 // Default fallback
        };

        return {
            name: TEXT_CONSTANTS.DEFAULT_NAME,
            age: 0,
            months: 0,
            day: 1,
            realm_idx: 0,
            sub_realm_idx: 0,
            exp: 0,
            maxExp: 100, // Starts at 100 maxExp for sensing Qi
            spiritRootType: 'FATE_SPIRIT_ROOT_FIVE', // 默认五灵根保底
            cultivationSpeedMultiplier: 1.0, // 默认100%修炼速度
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            race: 'HUMAN',
            attributes: attributes,
            battleStats: initialBattleStats,
            tutorialCompleted: false,

            talents: [],
            flags: [],
            relationships: [],
            partners: [],
            pets: [],
            home: {
                level: INITIAL_STATE.HOME_LEVEL,
                name: INITIAL_STATE.HOME_NAME,
                modules: [],
                resources: {} // Use generic resources map
            },
            professions: {}, // Generic professions map
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null
            },
            learnedSkills: [],
            equippedSkills: [null, null, null, null],
            triggeredEvents: [],
            history: [],
            alive: true,
            background: 'FARMER', // Default

            // ... (keep existing)
            // World Context
            world: new WorldGenerator({ seed: 0 }, { silent: true }).generate(),

            // [NEW] Personality & Acquired Traits
            personality: {
                // Core Values (-100 to 100)
                'JUSTICE': 0, // Pos: Justice, Neg: Evil
                'COURAGE': 0, // Pos: Brave, Neg: Timid
                'AMBITION': 0 // Pos: Ambitious, Neg: Content
            },
            acquiredTraits: [],

            // [NEW] 世界定位
            location: '',  // 由世界生成后设定
            sect: null,    // 初始为散修

            // [NEW] 命格与气运
            fate: [],
            fortuneBuffs: [],

            // [NEW] Mission System Initialization
            missions: {
                active: [],
                completed: []
            }
        };
    }

    recalculateStats() {
        CultivationSystem.recalculateStats(this);
    }

    getLifespan(): number {
        return CultivationSystem.getLifespan(this);
    }

    // --- Standardization V2 ---

    triggerTalents(trigger: import('../types').TriggerType) {
        TalentSystem.triggerTalents(this, trigger);
    }

    advanceTime(monthsPassed: number, context?: { action?: string }, daysPassed: number = 0): { event: import('../types').GameEvent | null; message?: string, combat?: { enemy: Partial<import('../types/combat').CombatEntity>, type: import('../types/combat').CombatState['type'] } } {
        return TimeSystem.advanceTime(this, monthsPassed, context, daysPassed);
    }

    init(selectedTalents: Talent[], initialAttributes: { [key: string]: number }) {
        this.state = this.getInitialState();
        this.state.months = 0;
        this.state.age = 0;

        this.state.attributes = { ...this.state.attributes, ...initialAttributes };
        this.state.talents = selectedTalents;

        // Apply talent initial effects (Legacy)
        selectedTalents.forEach(t => {
            if (t.effect) {
                this.applyEffect(t.effect);
                // [FIX] Handle history explicitly
                if (t.effect.history) {
                    this.state.history.push(t.effect.history);
                }
            }
        });

        // Apply PASSIVE modifiers
        this.triggerTalents('PASSIVE');

        // Note: initLife() should be called manually after talents/stats are injected
    }

    reset() {
        this.state = this.getInitialState();
        this.eventPool.resetSession(); // 清除注入的 AI 事件
    }

    initLife() {
        // Determine Background based on LUCK
        const luck = this.state.attributes.LUCK || 0;
        // ... (Background logic same as before)
        if (luck < GAME_RULES.BACKGROUND_THRESHOLDS.FARMER) this.state.background = 'FARMER';
        else if (luck < GAME_RULES.BACKGROUND_THRESHOLDS.RICH) this.state.background = 'RICH';
        else this.state.background = 'CULTIVATOR';

        // Add Background Flag
        this.state.flags.push(`BG_${this.state.background}`);

        // Generate Parents based on Background
        const father = generateNPC('父亲', 'M');
        const mother = generateNPC('母亲', 'F');

        const bgKey = this.state.background as keyof typeof NPC_DESCRIPTIONS.FATHER;

        father.desc = NPC_DESCRIPTIONS.FATHER[bgKey];
        mother.desc = NPC_DESCRIPTIONS.MOTHER[bgKey];

        if (this.state.background === 'FARMER' || this.state.background === 'RICH') {
            father.realm = '凡人';
            mother.realm = '凡人';
        }

        this.state.relationships = [father, mother];

        // Generate Player Name (Inherit Surname)
        const surname = father.name.charAt(0);
        const givenName = generateName(this.state.gender === 'Male' ? 'M' : 'F').slice(1);
        this.state.name = surname + givenName;

        // Recalc Battle Stats for Player
        this.recalculateStats();

        // Initial Log
        this.state.history.push(TEXT_CONSTANTS.BIRTH_LOG + `父亲是${father.name}，母亲是${mother.name}。`);

        // Context-aware Naming
        const namer = NPC_DESCRIPTIONS.NAMER[bgKey] || TEXT_CONSTANTS.MYSTERIOUS_PERSON;
        this.state.history.push(`${namer}为你取名为：${this.state.name}。`);

        // Trigger specific Birth Event based on Background
        let birthEventId = '';
        if (this.state.background === 'FARMER') birthEventId = 'EVT_BIRTH_FARMER';
        else if (this.state.background === 'RICH') birthEventId = 'EVT_BIRTH_RICH';
        else birthEventId = 'EVT_BIRTH_001';

        const birthEvent = this.events.find(e => e.id === birthEventId);
        if (birthEvent) {
            this.processEvent(birthEvent);
        }

        // [NEW] 决定先天命格 + 灵根修炼速度
        const talentIds = this.state.talents.map(t => t.id);
        const fateResult = determineFate(this.state.attributes, this.state.background, talentIds);
        this.state.fate = fateResult.fates;
        this.state.spiritRootType = fateResult.spiritRootType;
        this.state.cultivationSpeedMultiplier = fateResult.cultivationSpeedMultiplier;

        // [NEW] 生成新世界 (随机种子, 随机名称)
        const worldGen = new WorldGenerator({
            seed: Math.floor(Math.random() * 9999999),
        });
        this.state.world = worldGen.generate();

        // [NEW] 玩家出生地 (选择一个推荐境界最低的安全区域)
        const safeRegions = this.state.world.regions.sort((a, b) => a.dangerLevel - b.dangerLevel);
        const startRegion = safeRegions[0];
        this.state.location = startRegion.id;

        this.state.history.push(`你出生在${startRegion.name}，这里${startRegion.description}。`);
    }

    checkBreakthrough(): { message?: string, combat?: { enemy: Partial<import('../types/combat').CombatEntity>, type: import('../types/combat').CombatState['type'] } } | undefined {
        return CultivationSystem.checkBreakthrough(this);
    }

    findEvent(context?: { action?: string }): GameEvent | null {
        return EventSystem.findEvent(this, context);
    }

    updateWorldState() {
        this.state.world.worldMonth++;
        // TODO: Implement Era progression logic here
    }

    checkCondition(cond: string, context?: { action?: string }): boolean {
        return EventSystem.checkCondition(this, cond, context);
    }

    processEvent(event: GameEvent) {
        EventSystem.processEvent(this, event);
    }

    applyOutcome(outcome: import('../types').EventOutcome): string[] {
        return EventSystem.applyOutcome(this, outcome);
    }

    makeChoice(choice: EventChoice) {
        EventSystem.makeChoice(this, choice);
    }

    /** 统一时间戳格式：[X岁Y月] */
    getTimeStr(): string {
        const months = this.state.months % 12;
        return months > 0 ? `[${this.state.age}岁${months}月]` : `[${this.state.age}岁]`;
    }

    applyEffect(effect: Effect): string[] {
        return EventSystem.applyEffect(this, effect);
    }

    // --- 气运Buff管理 ---
    tickFortuneBuffs(monthsPassed: number) {
        TalentSystem.tickFortuneBuffs(this, monthsPassed);
    }

    addFortuneBuff(buff: Omit<FortuneBuff, 'remainingMonths'> & { remainingMonths?: number }) {
        TalentSystem.addFortuneBuff(this, buff);
    }

    // ═══════════════════════════════════════════════════
    // Delegated Systems — Thin wrappers for backward compatibility
    // ═══════════════════════════════════════════════════

    // --- Travel System ---
    travelTo(targetId: string) { return TravelSystem.travelTo(this, targetId); }
    gather() { return TravelSystem.gather(this); }
    rest() { return TravelSystem.rest(this); }
    getLocationEntity(id: string) { return TravelSystem.getLocationEntity(this, id); }
    joinSect(sectId: string) { return TravelSystem.joinSect(this, sectId); }
    calculateTravelDays(targetId: string) { return TravelSystem.calculateTravelDays(this, targetId); }

    // --- Inventory System ---
    addItem(itemId: string, count: number) { InventorySystem.addItem(this, itemId, count); }
    removeItem(itemId: string, count: number) { return InventorySystem.removeItem(this, itemId, count); }
    useItem(itemId: string) { return InventorySystem.useItem(this, itemId); }

    // --- Equipment System ---
    equipItem(itemId: string) { return EquipmentSystem.equipItem(this, itemId); }
    unequipItem(slot: 'weapon' | 'armor' | 'accessory') { return EquipmentSystem.unequipItem(this, slot); }

    // --- Skill System ---
    learnSkill(skillId: string) { return SkillSystem.learnSkill(this, skillId); }
    equipSkill(skillId: string, slotIndex: number) { return SkillSystem.equipSkill(this, skillId, slotIndex); }
    unequipSkill(slotIndex: number) { return SkillSystem.unequipSkill(this, slotIndex); }

    // --- Money Helpers ---
    addSpiritStones(amount: number) { InventorySystem.addSpiritStones(this, amount); }
    earnMoney(amount: number) { InventorySystem.earnMoney(this, amount); }
    spendMoney(amount: number) { return InventorySystem.spendMoney(this, amount); }
    getMoney() { return InventorySystem.getMoney(this); }

    // --- Mission System ---
    checkMissions() { MissionSystem.checkMissions(this); }
    completeMission(missionState: import('../types/missionTypes').GenericMissionState, def: Mission) { MissionSystem.completeMission(this, missionState, def); }
    startMission(missionId: string) { MissionSystem.startMission(this, missionId); }
}

