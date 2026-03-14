import type { PlayerState, GameEvent, Talent, BattleStats, Effect, EventChoice, FortuneBuff } from '../types';
import type { ModuleConfig } from '../types/meta';
import { generateNPC, generateName } from '../utils/DataUtils';
import { GAME_RULES, NPC_DESCRIPTIONS, TEXT_CONSTANTS, INITIAL_STATE, BATTLE_STATS_DEFAULTS } from '../data/rules';
import { determineFate } from '../modules/xianxia/data/fateData';
import { WorldGenerator } from './WorldGenerator';
import type { Mission } from '../types/missionTypes';

import { TimeSystem } from './systems/TimeSystem';
import { EventSystem } from './systems/EventSystem';
import { CultivationSystem } from './systems/CultivationSystem';
import { MissionSystem } from './systems/MissionSystem';
import { TalentSystem } from './systems/TalentSystem';
import { InventorySystem } from './systems/InventorySystem';
import { EquipmentSystem } from './systems/EquipmentSystem';
import { SkillSystem } from './systems/SkillSystem';
import { TravelSystem } from './systems/TravelSystem';
import { AlchemySystem } from './systems/AlchemySystem';
import { AbodeSystem } from './systems/AbodeSystem';
import { SectSystem as SectSys } from './systems/SectSystem';
import { EventPool } from './EventPool';

export class GameEngine {
    state: PlayerState;
    moduleConfig: ModuleConfig;
    talentsDB: Talent[];
    readonly eventPool: EventPool;

    get events(): GameEvent[] {
        return this.eventPool.getPool();
    }

    constructor(config: ModuleConfig, events: GameEvent[], talents: Talent[], initialState?: Partial<PlayerState>) {
        this.moduleConfig = config;
        this.talentsDB = talents;

        const registeredStats = config.stats.map(s => s.id);
        const registeredResources = config.resources?.map(r => r.id) || [];
        this.eventPool = new EventPool({
            registeredStats,
            registeredResources,
            allowUnknownStats: true,
        });
        this.eventPool.registerCoreEvents(events);

        this.state = { ...this.getInitialState(), ...initialState } as PlayerState;
    }

    hotReload(config: ModuleConfig, events: GameEvent[]) {
        this.moduleConfig = config;
        this.eventPool.registerCoreEvents(events);
    }

    updateModuleConfig(patch: Partial<Pick<ModuleConfig, 'stats' | 'resources'>>) {
        this.moduleConfig = {
            ...this.moduleConfig,
            ...patch,
        };
    }

    getInitialState(): PlayerState {
        const attributes: Record<string, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.moduleConfig.stats.forEach((s: any) => {
            attributes[s.id] = s.base;
        });

        const initialBattleStats: BattleStats = {
            MAX_HP: attributes.HP || 100,
            MAX_MP: attributes.MP || 0,
            ...BATTLE_STATS_DEFAULTS,
            MOVE_SPEED: 20,
        };

        return {
            name: TEXT_CONSTANTS.DEFAULT_NAME,
            age: 0,
            months: 0,
            day: 1,
            realm_idx: 0,
            sub_realm_idx: 0,
            exp: 0,
            maxExp: 100,
            spiritRootType: 'FATE_SPIRIT_ROOT_FIVE',
            cultivationSpeedMultiplier: 1.0,
            gender: Math.random() > 0.5 ? 'Male' : 'Female',
            race: 'HUMAN',
            attributes,
            battleStats: initialBattleStats,
            tutorialCompleted: false,
            deathKarmaClaimed: false,
            talents: [],
            flags: [],
            relationships: [],
            partners: [],
            pets: [],
            home: {
                level: INITIAL_STATE.HOME_LEVEL,
                name: INITIAL_STATE.HOME_NAME,
                modules: [],
                resources: {},
            },
            professions: {},
            inventory: [],
            equipment: {
                weapon: null,
                armor: null,
                accessory: null,
            },
            learnedSkills: [],
            equippedSkills: [null, null, null, null],
            triggeredEvents: [],
            history: [],
            alive: true,
            background: 'FARMER',
            world: new WorldGenerator({ seed: 0 }, { silent: true }).generate(),
            personality: {
                JUSTICE: 0,
                COURAGE: 0,
                AMBITION: 0,
            },
            acquiredTraits: [],
            location: '',
            sect: null,
            sectState: null,
            fate: [],
            fortuneBuffs: [],
            missions: {
                active: [],
                completed: [],
            },
        };
    }

    recalculateStats() {
        CultivationSystem.recalculateStats(this);
    }

    getLifespan(): number {
        return CultivationSystem.getLifespan(this);
    }

    triggerTalents(trigger: import('../types').TriggerType) {
        TalentSystem.triggerTalents(this, trigger);
    }

    advanceTime(
        monthsPassed: number,
        context?: { action?: string },
        daysPassed: number = 0,
    ): {
        event: import('../types').GameEvent | null;
        message?: string;
        combat?: {
            enemy: Partial<import('../types/combat').CombatEntity>;
            type: import('../types/combat').CombatState['type'];
        };
    } {
        return TimeSystem.advanceTime(this, monthsPassed, context, daysPassed);
    }

    init(selectedTalents: Talent[], initialAttributes: { [key: string]: number }) {
        this.state = this.getInitialState();
        this.state.months = 0;
        this.state.age = 0;

        this.state.attributes = { ...this.state.attributes, ...initialAttributes };
        this.state.talents = selectedTalents;

        selectedTalents.forEach(t => {
            if (t.effect) {
                this.applyEffect(t.effect);
                if (t.effect.history) {
                    this.state.history.push(t.effect.history);
                }
            }
        });

        this.triggerTalents('PASSIVE');
    }

    reset() {
        this.state = this.getInitialState();
        this.eventPool.resetSession();
    }

    initLife() {
        const luck = this.state.attributes.LUCK || 0;
        if (luck < GAME_RULES.BACKGROUND_THRESHOLDS.FARMER) this.state.background = 'FARMER';
        else if (luck < GAME_RULES.BACKGROUND_THRESHOLDS.RICH) this.state.background = 'RICH';
        else this.state.background = 'CULTIVATOR';

        this.state.flags.push(`BG_${this.state.background}`);

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

        const surname = father.name.charAt(0);
        const givenName = generateName(this.state.gender === 'Male' ? 'M' : 'F').slice(1);
        this.state.name = surname + givenName;

        this.recalculateStats();

        let birthEffect: Effect;
        if (bgKey === 'FARMER') birthEffect = { STR: 2, MOOD: 5 };
        else if (bgKey === 'RICH') birthEffect = { MONEY: 50, CHR: 5 };
        else birthEffect = { MONEY: 10, REP: 5 };
        this.applyEffect(birthEffect);

        const talentIds = this.state.talents.map(t => t.id);
        const fateResult = determineFate(this.state.attributes, this.state.background, talentIds);
        this.state.fate = fateResult.fates;
        this.state.spiritRootType = fateResult.spiritRootType;
        this.state.cultivationSpeedMultiplier = fateResult.cultivationSpeedMultiplier;

        const worldGen = new WorldGenerator({
            seed: Math.floor(Math.random() * 9999999),
        });
        this.state.world = worldGen.generate();

        const safeRegions = [...this.state.world.regions].sort((a, b) => a.dangerLevel - b.dangerLevel);
        const startRegion = safeRegions[0];
        this.state.location = startRegion.id;

        this.state.history.push(TEXT_CONSTANTS.BIRTH_LOG);
        this.state.history.push(`你出生在${startRegion.name}。${startRegion.description}`);

        const familyLineByBackground = {
            FARMER: `家里靠几亩薄田和一间旧屋过活，父亲${father.name}与母亲${mother.name}都只是凡俗之人，却把日子熬得很稳。`,
            RICH: `你自幼生在殷实之家，父亲${father.name}往来商旅，母亲${mother.name}善理家事，门庭里常有外客出入。`,
            CULTIVATOR: `你出身带着修行底蕴的家门，父亲${father.name}与母亲${mother.name}都知道这世上不止柴米油盐，还有宗门、灵气与大道。`,
        } as const;
        this.state.history.push(familyLineByBackground[bgKey]);

        const namer = NPC_DESCRIPTIONS.NAMER[bgKey] || TEXT_CONSTANTS.MYSTERIOUS_PERSON;
        this.state.history.push(`${namer}为你取名“${this.state.name}”。从这一刻起，你真正被这个世界记住了。`);

        const firstFeelingByBackground = {
            FARMER: '夜里风从窗缝里吹进来，灶火、泥土与人声混在一起，你对人间最早的印象，是清苦中的温热。',
            RICH: '廊下灯火长明，院外车马偶有停驻，你对这个世界最早的感觉，是热闹背后总还藏着更大的去处。',
            CULTIVATOR: '长辈交谈时偶尔提起宗门、劫数与机缘，那些你尚听不懂的词句，已先一步在心底埋下回响。',
        } as const;
        this.state.history.push(firstFeelingByBackground[bgKey]);
    }

    checkBreakthrough(): {
        message?: string;
        combat?: {
            enemy: Partial<import('../types/combat').CombatEntity>;
            type: import('../types/combat').CombatState['type'];
        };
    } | undefined {
        return CultivationSystem.checkBreakthrough(this);
    }

    findEvent(context?: { action?: string }): GameEvent | null {
        return EventSystem.findEvent(this, context);
    }

    updateWorldState() {
        this.state.world.worldMonth++;
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

    getTimeStr(): string {
        const months = this.state.months % 12;
        return months > 0 ? `[${this.state.age}岁${months}月]` : `[${this.state.age}岁]`;
    }

    applyEffect(effect: Effect): string[] {
        return EventSystem.applyEffect(this, effect);
    }

    tickFortuneBuffs(monthsPassed: number) {
        TalentSystem.tickFortuneBuffs(this, monthsPassed);
    }

    addFortuneBuff(buff: Omit<FortuneBuff, 'remainingMonths'> & { remainingMonths?: number }) {
        TalentSystem.addFortuneBuff(this, buff);
    }

    travelTo(targetId: string) { return TravelSystem.travelTo(this, targetId); }
    gather() { return TravelSystem.gather(this); }
    rest() { return TravelSystem.rest(this); }
    performLocationAction(action: import('./systems/TravelSystem').LocationActionType) { return TravelSystem.performLocationAction(this, action); }
    getLocationEntity(id: string) { return TravelSystem.getLocationEntity(this, id); }
    joinSect(sectId: string) { return TravelSystem.joinSect(this, sectId); }
    calculateTravelDays(targetId: string) { return TravelSystem.calculateTravelDays(this, targetId); }

    addItem(itemId: string, count: number) { InventorySystem.addItem(this, itemId, count); }
    removeItem(itemId: string, count: number) { return InventorySystem.removeItem(this, itemId, count); }
    consumeItem(itemId: string) { return InventorySystem.consumeItem(this, itemId); }

    equipItem(itemId: string) { return EquipmentSystem.equipItem(this, itemId); }
    unequipItem(slot: 'weapon' | 'armor' | 'accessory') { return EquipmentSystem.unequipItem(this, slot); }

    learnSkill(skillId: string) { return SkillSystem.learnSkill(this, skillId); }
    equipSkill(skillId: string, slotIndex: number) { return SkillSystem.equipSkill(this, skillId, slotIndex); }
    unequipSkill(slotIndex: number) { return SkillSystem.unequipSkill(this, slotIndex); }

    addSpiritStones(amount: number) { InventorySystem.addSpiritStones(this, amount); }
    earnMoney(amount: number) { InventorySystem.earnMoney(this, amount); }
    spendMoney(amount: number) { return InventorySystem.spendMoney(this, amount); }
    getMoney() { return InventorySystem.getMoney(this); }

    checkMissions() { MissionSystem.checkMissions(this); }
    completeMission(missionState: import('../types/missionTypes').GenericMissionState, def: Mission) { MissionSystem.completeMission(this, missionState, def); }
    startMission(missionId: string) { MissionSystem.startMission(this, missionId); }

    getAlchemyRecipes() { return AlchemySystem.getAvailableRecipes(this); }
    canRefineAlchemy(recipeId: string) { return AlchemySystem.canRefine(this, recipeId); }
    refineAlchemy(recipeId: string) { return AlchemySystem.refine(this, recipeId); }
    getAlchemySuccessRate(recipe: import('../data/alchemy').AlchemyRecipe) { return AlchemySystem.calculateSuccessRate(this, recipe); }

    getAbodeState() { return AbodeSystem.getAbodeState(this); }
    upgradeAbode() { return AbodeSystem.upgradeAbode(this); }
    plantHerb(plotIndex: number, seedId: string) { return AbodeSystem.plantHerb(this, plotIndex, seedId); }
    harvestHerb(plotIndex: number) { return AbodeSystem.harvestHerb(this, plotIndex); }
    clearPlot(plotIndex: number) { return AbodeSystem.clearPlot(this, plotIndex); }
    getAvailableSeeds() { return AbodeSystem.getAvailableSeeds(this); }
    getAbodeCultivationBonus() { return AbodeSystem.getCultivationBonus(this); }

    getAllSects() { return SectSys.getAllSects(); }
    getSectState() { return SectSys.getSectState(this); }
    canJoinSect(sectId: string) { return SectSys.canJoin(this, sectId); }
    joinSectNew(sectId: string) { return SectSys.joinSect(this, sectId); }
    leaveSect() { return SectSys.leaveSect(this); }
    doSectMission(missionId: string) { return SectSys.doMission(this, missionId); }
    exchangeSectItem(itemId: string) { return SectSys.exchangeItem(this, itemId); }
    getSectRankTitle() { return SectSys.getCurrentRankTitle(this); }

    upsertRuntimeEvent(event: GameEvent) { this.eventPool.upsertRuntimeEvent(event); }
    removeRuntimeEvent(eventId: string) { return this.eventPool.removeEventById(eventId); }
}
