import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameEngine } from '../engine/GameEngine';
import { type PlayerState, type GameEvent, type Talent, type SaveMeta, type EventChoice, REALMS } from '../types';
import { TALENTS } from '../modules/xianxia/data/talents';
import { EVENTS } from '../modules/xianxia/data/events';
import { XianxiaConfig } from '../modules/xianxia/config';
import { ActionSystem } from '../engine/systems/ActionSystem';
import { deepMerge } from '../utils/DataUtils';
import { CombatEngine } from '../engine/systems/CombatSystem';
import { AchievementSystem } from '../engine/systems/AchievementSystem';
import { CultivationSystem } from '../engine/systems/CultivationSystem';
import type { CombatState, CombatEntity } from '../types/combat';
import type { NarrativeEvent } from '../components/NarrativeOverlay';
import type { ModuleConfig } from '../types/meta';
import { resolveCombatRewards } from '../utils/combatRewards';
import { applyCombatBondAid, applyFinalBattleSupport } from '../utils/socialUtils';

// Import other stores for cross-store interaction
import { useUIStore } from './uiStore';

// Type moved to uiStore, but keeping here if needed for type reference or refactor module
// type GameScene = ... (Managed by UIStore)

// --- SAVE SYSTEM VERSIONING ---
const SAVE_VERSION = 1;

function applyLateFinalPhaseSupport(combatState: CombatState, engine: GameEngine) {
  if (combatState.enemy.id !== 'story_void_lord_true') return;

  const messages: string[] = [];

  if (engine.state.flags.includes('STORY:FINAL_SUPPORT_SCOUTS')) {
    combatState.player.buffs.push({
      id: 'final_phase_scouts',
      name: '斥候回线',
      description: '斥候回传的险地图录让你更早预判来势。',
      duration: 3,
      type: 'BUFF',
      effect: { statMultiplier: { SPD: 1.1, DEF: 1.08 } }
    });
    messages.push('斥候一路送回的险地图录让你在古主真身前总能快上半步。');
  }

  if (engine.state.flags.includes('STORY:FINAL_SUPPORT_BEACON')) {
    combatState.player.shield += 120;
    messages.push('裂口烽灯与预警阵替你提前分担了一轮归墟恶意。');
  }

  if (engine.state.flags.includes('STORY:FINAL_SUPPORT_WAR_FORGE')) {
    combatState.player.buffs.push({
      id: 'final_phase_war_forge',
      name: '战备齐整',
      description: '大战前赶制的法器与符箓在这一刻终于全部派上了用场。',
      duration: 4,
      type: 'BUFF',
      effect: { statMultiplier: { ATK: 1.12, DEF: 1.12 } }
    });
    messages.push('战前炉火里赶制出的器符真正接上了你的最后一战。');
  }

  if (engine.state.flags.includes('STORY:FINAL_SUPPORT_RESOLVE')) {
    const healGain = 60;
    combatState.player.hp = Math.min(combatState.player.maxHp, combatState.player.hp + healGain);
    messages.push(`大战前夜沉淀下来的道心让你稳住了最后一口气机，额外恢复 ${healGain} 点生命。`);
  }

  messages.forEach((message) => {
    combatState.logs.push({
      turn: combatState.turn,
      actorName: '系统',
      targetName: combatState.player.name,
      skillName: '终局援势',
      damage: 0,
      isCrit: false,
      heal: 0,
      message,
    });
    engine.state.history.push(`${engine.getTimeStr()} ${message}`);
  });
}

// Migration Helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateSave(data: any): any {
  let currentVersion = data.version || 0;

  // Migration Chain
  if (currentVersion < 1) {
    // v0 -> v1: Ensure 'flags', 'world', and 'inventory' exist
    console.log("Migrating Save v0 -> v1");
    if (!data.gameState) data.gameState = {};
    if (!data.gameState.flags) data.gameState.flags = [];
    if (!data.gameState.inventory) data.gameState.inventory = [];
    if (!data.gameState.relationships) data.gameState.relationships = [];

    // World might be missing in very old saves, if so, we can't fully restore, 
    // but we can ensure it doesn't crash by adding a dummy world or regenerating.
    // For now, let's assume if world is missing, it's a broken save, 
    // BUT we can try to inject a default generated one if we had access to WorldGenerator here.
    // Since we don't easily, we'll initialize empty objects to prevent crash.
    if (!data.gameState.world) {
      console.warn("Save missing world data, initializing empty structure to prevent immediate crash.");
      data.gameState.world = { regions: [], sects: [], worldMonth: 0 };
    }

    currentVersion = 1;
  }

  // Future migrations:
  // if (currentVersion < 2) { ... }

  data.version = currentVersion;
  return data;
}

interface GameStore {
  engine: GameEngine;
  gameState: PlayerState;

  currentEvent: GameEvent | null;
  breakthroughMsg: string | null;
  currentCombat: CombatState | null;
  narrativeEvent: NarrativeEvent | null;

  // Actions
  saveGame: (slotId?: number) => void;
  loadGame: (slotId: number) => boolean;
  getSlots: () => SaveMeta;
  deleteSave: (slotId: number) => void;
  exportSave: (slotId: number) => void;
  importSave: (slotId: number, jsonData: string) => { success: boolean; message: string };
  currentSlot: number | null;
  // hasSave: () => boolean; // Deprecated
  startGame: (talents: Talent[], attributes: Record<string, number>) => void;

  // Engine Proxy
  nextTurn: () => void;
  performAction: (actionType: 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT' | 'REFINE_ALCHEMY') => void;
  makeChoice: (choice: EventChoice) => void;
  ackBreakthrough: () => void;
  travel: (targetId: string) => { success: boolean; message: string };
  interactNPC: (npc: import('../types/worldTypes').WorldNPC, type: 'TALK' | 'SPAR' | 'KILL') => void;

  // Combat Proxy
  startCombat: (
    enemy: Partial<CombatEntity>,
    type?: CombatState['type'],
    context?: {
      victoryFlags?: string[];
      victoryHistory?: string;
      nextEnemy?: Partial<CombatEntity>;
      nextType?: CombatState['type'];
      nextVictoryFlags?: string[];
      nextVictoryHistory?: string;
    }
  ) => void;
  executeCombatSkill: (skillId: string) => void;
  fleeCombat: () => void;
  exitCombat: () => void;

  // Narrative UI
  triggerNarrative: (event: NarrativeEvent) => void;
  clearNarrative: () => void;
  updateRuntimeConfig: (field: 'stats' | 'resources', value: ModuleConfig['stats'] | ModuleConfig['resources']) => void;
  upsertRuntimeEvent: (event: GameEvent) => void;
  deleteRuntimeEvent: (eventId: string) => boolean;
  hotReloadRuntimeData: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => {
      // Initialize GameEngine
      const engine = new GameEngine(XianxiaConfig, EVENTS, TALENTS, {
        name: "无名氏",
        gender: Math.random() > 0.5 ? 'Male' : 'Female',
        age: 0,
        months: 0,
        realm_idx: 0,
        attributes: {}, // Will be filled by config
        battleStats: {
          MAX_HP: 100, MAX_MP: 0, ATK: 10, DEF: 10, SPD: 10, CRIT: 0
        },

        talents: [],
        flags: [],
        relationships: [],
        partners: [],
        pets: [],
        home: {
          level: 1,
          name: '破旧草屋',
          modules: [],
          resources: { 'spirit_stones': 0 }
        },
        professions: {
          alchemy: { level: 0, exp: 0, maxExp: 100 },
          artifact: { level: 0, exp: 0, maxExp: 100 },
          formation: { level: 0, exp: 0, maxExp: 100 },
          talisman: { level: 0, exp: 0, maxExp: 100 }
        },
        inventory: [],
        triggeredEvents: [],
        history: [],
        alive: true,
        background: 'FARMER', // Default

        // World Context
        world: {
          era: {
            id: 'ERA_RECOVERY',
            name: '灵气复苏',
            description: '天地灵气开始逐渐复苏，修仙者数量激增。',
            luckModifier: 10,
            spiritDensity: 1.2
          },
          globalLuck: 50,
          worldMonth: 0,
          activeWorldEvents: []
        } as unknown as PlayerState['world'],

        // [NEW] Personality & Acquired Traits
        personality: {
          // Core Values (-100 to 100)
          'JUSTICE': 0, // Pos: Justice, Neg: Evil
          'COURAGE': 0, // Pos: Brave, Neg: Timid
          'AMBITION': 0 // Pos: Ambitious, Neg: Content
        },
        acquiredTraits: []
      });

      return {
        engine,
        gameState: engine.state,
        currentEvent: null,
        breakthroughMsg: null,
        currentCombat: null,
        narrativeEvent: null,

        triggerNarrative: (event) => set({ narrativeEvent: event }),
        clearNarrative: () => set({ narrativeEvent: null }),
        updateRuntimeConfig: (field, value) => {
          const { engine } = get();
          if (field === 'stats') {
            engine.updateModuleConfig({ stats: value as ModuleConfig['stats'] });
          } else {
            engine.updateModuleConfig({ resources: value as ModuleConfig['resources'] });
          }
          set({ gameState: { ...engine.state } });
        },
        upsertRuntimeEvent: (event) => {
          const { engine } = get();
          engine.upsertRuntimeEvent(event);
          set({ gameState: { ...engine.state } });
        },
        deleteRuntimeEvent: (eventId) => {
          const { engine } = get();
          const removed = engine.removeRuntimeEvent(eventId);
          if (removed) {
            set({ gameState: { ...engine.state } });
          }
          return removed;
        },
        hotReloadRuntimeData: () => {
          const { engine } = get();
          engine.hotReload(engine.moduleConfig, engine.events);
          set({ gameState: { ...engine.state } });
        },

        // --- Persistence (Multi-Slot) ---
        currentSlot: null as number | null,

        getSlots: (): SaveMeta => {
          try {
            const metaJson = localStorage.getItem('aeon_save_meta');
            if (metaJson) {
              const meta = JSON.parse(metaJson);
              // Ensure version exists in meta, defaults to 0 if missing
              if (meta.version === undefined) meta.version = 0;
              return meta;
            }

            // Migration Check: If no meta but legacy save exists
            const legacy = localStorage.getItem('aeon_save');
            if (legacy) {
              const legacyData = JSON.parse(legacy);
              const meta: SaveMeta = {
                version: 1, // Legacy migration counts as v1
                lastPlayedSlot: 0,
                slots: {
                  0: {
                    timestamp: legacyData.timestamp || Date.now(),
                    name: legacyData.gameState?.name || "无名氏",
                    summary: `凡人 · ${Math.floor((legacyData.gameState?.months || 0) / 12)}岁`,
                    empty: false
                  }
                }
              };
              // Move legacy to slot 0 and upgrade to v1
              const migratedLegacy = migrateSave(legacyData);
              localStorage.setItem('aeon_save_0', JSON.stringify(migratedLegacy));
              localStorage.setItem('aeon_save_meta', JSON.stringify(meta));
              localStorage.removeItem('aeon_save');
              return meta;
            }

            // Default empty
            return { version: SAVE_VERSION, lastPlayedSlot: -1, slots: {} };
          } catch (e) {
            console.error("Save meta error", e);
            return { version: SAVE_VERSION, lastPlayedSlot: -1, slots: {} };
          }
        },

        saveGame: (slotId?: number) => {
          const { gameState, currentEvent, currentSlot } = get();
          const targetSlot = slotId !== undefined ? slotId : currentSlot;

          if (targetSlot === null || targetSlot === undefined) {
            console.error("No slot selected for saving");
            return;
          }

          const scene = useUIStore.getState().scene;
          const saveData = {
            version: SAVE_VERSION, // Validation Tag
            gameState,
            currentEvent,
            currentCombat: get().currentCombat,
            scene,
            timestamp: Date.now()
          };

          // Save Data
          localStorage.setItem(`aeon_save_${targetSlot}`, JSON.stringify(saveData));

          // Update Metadata
          const meta = get().getSlots();
          meta.lastPlayedSlot = targetSlot;
          meta.slots[targetSlot] = {
            timestamp: saveData.timestamp,
            name: gameState.name,
            summary: `${REALMS[gameState.realm_idx]} · ${gameState.age}岁`,
            empty: false
          };
          localStorage.setItem('aeon_save_meta', JSON.stringify(meta));

          set({ currentSlot: targetSlot });
          // alert('存档成功！'); // Removed alert for smoother flow, UI should show feedback
        },

        loadGame: (slotId: number) => {
          const json = localStorage.getItem(`aeon_save_${slotId}`);
          if (!json) return false;

          try {
            let data = JSON.parse(json);

            // Auto-Migrate on Load
            // If save has no version, assume 0. If it has version < SAVE_VERSION, migrate.
            const dataVersion = data.version || 0;
            if (dataVersion < SAVE_VERSION) {
              console.log(`[Store] Migrating save from v${dataVersion} to v${SAVE_VERSION}`);
              data = migrateSave(data);
              // Optional: Auto-save migrated version immediately? 
              // Better not to overwrite until user manually saves or auto-save triggers, 
              // but for stability let's keep it in memory.
            }

            const { engine } = get();

            // Deep merge saved state with a fresh initial state
            // This ensures any newly added properties in code are populated in old saves
            const freshState = engine.getInitialState();
            const mergedState = deepMerge<PlayerState>(freshState, data.gameState);

            // Restore Engine State
            engine.state = mergedState;

            // Safety checks for critical objects
            if (!engine.state.attributes) engine.state.attributes = {};
            if (!engine.state.flags) engine.state.flags = [];
            // Ensure world exists (Migration should have handled this, but double check)
            if (!engine.state.world) {
              console.error("Save state missing world data even after migration!");
              return false;
            }

            // Restore Store State
            set({
              gameState: engine.state,
              currentEvent: data.currentEvent,
              currentCombat: data.currentCombat || null,
              breakthroughMsg: null,
              currentSlot: slotId
            });

            // Restore UI Scene
            useUIStore.getState().setScene(data.scene || 'GAME');

            // Update Meta Last Played
            const meta = get().getSlots();
            meta.lastPlayedSlot = slotId;
            localStorage.setItem('aeon_save_meta', JSON.stringify(meta));

            return true;
          } catch (e) {
            console.error("Load failed", e);
            // alert("存档损坏或版本不兼容！"); 
            return false;
          }
        },

        deleteSave: (slotId: number) => {
          console.log(`[Store] Deleting save slot ${slotId}`);
          localStorage.removeItem(`aeon_save_${slotId}`);
          const meta = get().getSlots();
          if (meta.slots[slotId]) {
            delete meta.slots[slotId];
            if (meta.lastPlayedSlot === slotId) meta.lastPlayedSlot = -1;
            localStorage.setItem('aeon_save_meta', JSON.stringify(meta));
            if (get().currentSlot === slotId) {
              set({ currentSlot: null });
            }
            console.log(`[Store] Meta updated`, meta);
          } else {
            console.warn(`[Store] Slot ${slotId} not found in meta to delete`);
          }
        },

        exportSave: (slotId: number) => {
          const json = localStorage.getItem(`aeon_save_${slotId}`);
          if (!json) {
            console.warn(`[Store] Slot ${slotId} is empty, nothing to export`);
            return;
          }

          try {
            const data = JSON.parse(json);
            // Add export metadata
            const exportData = {
              _exportInfo: {
                exportedAt: new Date().toISOString(),
                gameVersion: SAVE_VERSION,
                name: data.gameState?.name || '未知',
                realm: REALMS[data.gameState?.realm_idx ?? 0],
                age: data.gameState?.age ?? 0,
              },
              ...data
            };

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            const name = data.gameState?.name || '存档';
            const realm = REALMS[data.gameState?.realm_idx ?? 0] || '';
            a.href = url;
            a.download = `永劫_${name}_${realm}_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            console.log(`[Store] Exported slot ${slotId}`);
          } catch (e) {
            console.error('[Store] Export failed', e);
          }
        },

        importSave: (slotId: number, jsonData: string): { success: boolean; message: string } => {
          try {
            let data = JSON.parse(jsonData);

            // Remove export metadata if present
            if (data._exportInfo) {
              delete data._exportInfo;
            }

            // Basic structure validation
            if (!data.gameState) {
              return { success: false, message: '无效的存档文件：缺少 gameState 数据。' };
            }
            if (typeof data.gameState !== 'object') {
              return { success: false, message: '无效的存档文件：gameState 格式错误。' };
            }

            // Run migration if needed
            const dataVersion = data.version || 0;
            if (dataVersion < SAVE_VERSION) {
              console.log(`[Store] Migrating imported save from v${dataVersion} to v${SAVE_VERSION}`);
              data = migrateSave(data);
            }

            // Deep merge with fresh state to fill missing fields
            const { engine } = get();
            const freshState = engine.getInitialState();
            const mergedState = deepMerge<PlayerState>(freshState, data.gameState);

            // Safety checks
            if (!mergedState.attributes) mergedState.attributes = {} as Record<string, number>;
            if (!mergedState.flags) mergedState.flags = [];
            if (!mergedState.world || !mergedState.world.regions) {
              return { success: false, message: '存档缺少世界数据，无法导入。' };
            }

            // Write to localStorage
            const saveData = {
              version: SAVE_VERSION,
              gameState: mergedState,
              currentEvent: data.currentEvent || null,
              currentCombat: data.currentCombat || null,
              scene: data.scene || 'GAME',
              timestamp: Date.now()
            };
            localStorage.setItem(`aeon_save_${slotId}`, JSON.stringify(saveData));

            // Update meta
            const meta = get().getSlots();
            meta.lastPlayedSlot = slotId;
            meta.slots[slotId] = {
              timestamp: saveData.timestamp,
              name: mergedState.name || '导入存档',
              summary: `${REALMS[mergedState.realm_idx ?? 0]} · ${mergedState.age ?? 0}岁`,
              empty: false
            };
            localStorage.setItem('aeon_save_meta', JSON.stringify(meta));

            console.log(`[Store] Imported save to slot ${slotId}`);
            return { success: true, message: `存档「${mergedState.name}」已成功导入到存档位 ${slotId + 1}。` };
          } catch (e) {
            console.error('[Store] Import failed', e);
            return { success: false, message: `导入失败：${e instanceof Error ? e.message : '文件解析错误'}` };
          }
        },

        startGame: (talents: Talent[], attributes: Record<string, number>) => {
          const selectedSlot = get().currentSlot;
          const { engine } = get();
          engine.reset();

          // Inject selected talents and initial stats
          engine.state.talents = talents;
          engine.state.attributes = { ...engine.state.attributes, ...attributes };

          // Pre-calculate initial battle stats based on new attributes
          engine.recalculateStats();

          // Initialize life (Name, Background, Parents, Fate, World Gen)
          engine.initLife();

          // Apply PASSIVE modifiers from injected talents
          engine.triggerTalents('PASSIVE');

          // Start First Mission if none active
          if (engine.state.missions.active.length === 0 && engine.state.missions.completed.length === 0) {
            engine.startMission('MQ_01_SURVIVAL');
          }

          set({
            gameState: { ...engine.state },
            currentEvent: null,
            breakthroughMsg: null,
            currentSlot: selectedSlot
          });

          // Auto-Save Initial State
          if (selectedSlot !== null) {
            get().saveGame(selectedSlot);
          }
        },

        // Unified Action Handler
        performAction: (actionType: 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT' | 'REFINE_ALCHEMY') => {
          const { engine } = get();

          const system = new ActionSystem(engine);

          const result = system.perform(actionType);

          if (result.success) {
            AchievementSystem.checkAll(engine);

            if (result.combat) {
              get().startCombat(result.combat.enemy, result.combat.type);
            }

            // Check if this is a major narrative event (like a Major Breakthrough or Tribulation Failure)
            let narrativeTriggered = false;
            // "全属性大幅提升" is the signature in CultivationSystem for a major breakthrough
            // "根基受损" is the signature for failing tribulation
            if (result.message && (result.message.includes('全属性大幅提升') || result.message.includes('雷劫之下'))) {
                const isFail = result.message.includes('雷劫之下');
                get().triggerNarrative({
                    id: `breakthrough_narrative_${Date.now()}`,
                    title: isFail ? '渡劫失败' : '大境界突破',
                    theme: isFail ? 'danger' : 'breakthrough',
                    content: [result.message]
                });
                narrativeTriggered = true;
            }

            set({
              gameState: { ...engine.state }, // Force update
              currentEvent: result.event || null,
              breakthroughMsg: (!narrativeTriggered && result.message) ? result.message : null
            });
          }
        },

        nextTurn: () => {
          get().performAction('CULTIVATE');
        },

        makeChoice: (choice: EventChoice) => {
          const { engine } = get();
          engine.makeChoice(choice);
          AchievementSystem.checkAll(engine);

          if (choice.combat) {
            get().startCombat(choice.combat.enemy, choice.combat.type, {
              victoryFlags: choice.combat.victoryFlags,
              victoryHistory: choice.combat.victoryHistory,
              nextEnemy: choice.combat.nextEnemy,
              nextType: choice.combat.nextType,
              nextVictoryFlags: choice.combat.nextVictoryFlags,
              nextVictoryHistory: choice.combat.nextVictoryHistory,
            });
          }

          set({
            currentEvent: null,
            gameState: { ...engine.state } // Sync state changes (logs, stats)
          });
        },

        ackBreakthrough: () => {
          set({ breakthroughMsg: null });
        },

        travel: (targetId: string) => {
          const { engine } = get();
          const result = engine.travelTo(targetId);
          if (result.success) {
            if (result.event) {
              engine.processEvent(result.event);
            }

            AchievementSystem.checkAll(engine);

            if (result.combat) {
              get().startCombat(result.combat.enemy, result.combat.type);
            }

            set({
              gameState: { ...engine.state },
              currentEvent: result.event || null,
              breakthroughMsg: result.timeMessage || null
            });
          }

          if (!result.success) {
            return result;
          }
          return result;
        },

        interactNPC: (npc: import('../types/worldTypes').WorldNPC, type: 'TALK' | 'SPAR' | 'KILL') => {
          const { engine } = get();

          let log = '';
          if (type === 'TALK') {
            npc.affinity = (npc.affinity || 0) + 5;
            log = `你与【${npc.name}】攀谈许久，相谈甚欢，好感度提升。`;
          } else if (type === 'SPAR') {
            npc.affinity = (npc.affinity || 0) + 2;
            log = `你与【${npc.name}】互相印证所学，略有感悟。`;
          } else if (type === 'KILL') {
            npc.affinity = (npc.affinity || 0) - 50;
            log = `你悍然对【${npc.name}】出手，对方拼死突围，结下死仇。`;
          }

          if (type === 'TALK') {
            npc.affinity = Math.max(npc.affinity || 0, (npc.affinity || 0));
            engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + 8);

            if (npc.position === 'WANDERER' && !engine.state.flags.includes(`ARC_GUIDE_NPC:${npc.id}`)) {
              engine.state.flags.push(`ARC_GUIDE_NPC:${npc.id}`);
              log = `你与【${npc.name}】闲谈许久，对方看你顺眼，答应以后若再相逢会多指点你几句。`;
            } else {
              log = `你与【${npc.name}】攀谈许久，眼界与见闻都增长了几分。`;
            }
          } else if (type === 'SPAR') {
            engine.state.exp = Math.min(engine.state.maxExp, engine.state.exp + 18);
            log = `你与【${npc.name}】互相印证所学，切磋之后都略有感悟。`;
          } else if (type === 'KILL') {
            log = `你悍然对【${npc.name}】出手，对方拼死突围，从此结下深仇。`;
          }

          engine.state.history.push(`${engine.getTimeStr()} ${log}`);

          // Pass time
          const result = engine.advanceTime(0, { action: 'INTERACT' }, 5);

          if (result.event) {
            engine.processEvent(result.event);
          }

          AchievementSystem.checkAll(engine);

          if (result.combat) {
            get().startCombat(result.combat.enemy, result.combat.type);
          }

          set({
            gameState: { ...engine.state },
            currentEvent: result.event || null,
            breakthroughMsg: result.message || null
          });
        },

        // --- Combat Methods ---
        startCombat: (
          enemy: Partial<CombatEntity>,
          type: CombatState['type'] = 'WILD',
          context?: {
            victoryFlags?: string[];
            victoryHistory?: string;
            nextEnemy?: Partial<CombatEntity>;
            nextType?: CombatState['type'];
            nextVictoryFlags?: string[];
            nextVictoryHistory?: string;
          }
        ) => {
          const { engine } = get();
          const combatEngine = new CombatEngine(engine.state, enemy, type);
          if (
            context?.victoryFlags?.length
            || context?.victoryHistory
            || context?.nextEnemy
            || context?.nextVictoryFlags?.length
            || context?.nextVictoryHistory
          ) {
            combatEngine.state.context = {
              ...combatEngine.state.context,
              victoryFlags: context?.victoryFlags || [],
              victoryHistory: context?.victoryHistory,
              nextEnemy: context?.nextEnemy,
              nextType: context?.nextType,
              nextVictoryFlags: context?.nextVictoryFlags || [],
              nextVictoryHistory: context?.nextVictoryHistory,
            };
          }
          applyCombatBondAid(combatEngine.state, engine);
          applyFinalBattleSupport(combatEngine.state, engine);
          applyLateFinalPhaseSupport(combatEngine.state, engine);
          set({ currentCombat: combatEngine.state });
        },

        executeCombatSkill: (skillId: string) => {
          const { currentCombat } = get();
          if (!currentCombat) return;
          const combatEngine = new CombatEngine(undefined, undefined, undefined, currentCombat);
          const newState = combatEngine.executeAction(skillId);
          set({ currentCombat: newState });
        },

        fleeCombat: () => {
          const { currentCombat } = get();
          if (!currentCombat) return;
          const combatEngine = new CombatEngine(undefined, undefined, undefined, currentCombat);
          const newState = combatEngine.flee();
          set({ currentCombat: newState });
        },

        exitCombat: () => {
          const { currentCombat, engine } = get();
          if (currentCombat) {
            engine.state.battleStats.HP = Math.max(0, currentCombat.player.hp);
            engine.state.battleStats.MP = Math.max(0, currentCombat.player.mp);

            const nextEnemy = currentCombat.context?.nextEnemy as Partial<CombatEntity> | undefined;
            const nextType = currentCombat.context?.nextType as CombatState['type'] | undefined;
            const nextVictoryFlags = Array.isArray(currentCombat.context?.nextVictoryFlags)
              ? (currentCombat.context?.nextVictoryFlags as string[])
              : [];
            const nextVictoryHistory = typeof currentCombat.context?.nextVictoryHistory === 'string'
              ? currentCombat.context.nextVictoryHistory
              : undefined;

            if (currentCombat.status === 'VICTORY' && currentCombat.type !== 'TRIBULATION' && !nextEnemy) {
              resolveCombatRewards(engine, currentCombat);
            }

            if (currentCombat.status === 'VICTORY') {
              const victoryFlags = Array.isArray(currentCombat.context?.victoryFlags)
                ? (currentCombat.context?.victoryFlags as string[])
                : [];
              victoryFlags.forEach((flag) => {
                if (!engine.state.flags.includes(flag)) {
                  engine.state.flags.push(flag);
                }
              });
              if (typeof currentCombat.context?.victoryHistory === 'string' && currentCombat.context.victoryHistory) {
                engine.state.history.push(`${engine.getTimeStr()} ${currentCombat.context.victoryHistory}`);
              }
            }

            if (currentCombat.status === 'VICTORY' && nextEnemy) {
              const phaseLabel = typeof nextEnemy.levelStr === 'string' ? nextEnemy.levelStr : '终局二阶段';
              const nextName = nextEnemy.name || '未知强敌';
              get().triggerNarrative({
                id: `boss_phase_${Date.now()}`,
                title: '终局再起',
                theme: 'danger',
                content: [
                  `你刚击碎 ${currentCombat.enemy.name} 的外壳，归墟深处却并未就此沉寂。`,
                  `${nextName} 的真正恶意终于彻底压下，战局被拖入 ${phaseLabel}。`,
                ],
              });
              get().startCombat(nextEnemy, nextType || currentCombat.type, {
                victoryFlags: nextVictoryFlags,
                victoryHistory: nextVictoryHistory,
              });
              set({ gameState: { ...engine.state } });
              return;
            }

            if (currentCombat.type === 'TRIBULATION') {
              if (currentCombat.status === 'VICTORY') {
                engine.state.history.push(`${engine.getTimeStr()} 雷劫消散，突破成功！`);
                set({ breakthroughMsg: "雷劫消散，突破成功！" });
                CultivationSystem.applyBreakthroughSuccess(engine);
              } else {
                engine.state.history.push(`${engine.getTimeStr()} 渡劫失败，修为散尽，身受重伤！`);
                set({ breakthroughMsg: "渡劫失败，修为散尽，身受重伤！" });
                CultivationSystem.applyBreakthroughFailure(engine);
              }
            } else if (currentCombat.status === 'DEFEAT' && currentCombat.type !== 'SPARRING') {
              engine.state.alive = false;
              engine.state.history.push(`${engine.getTimeStr()} 战斗失败，你身受致命重伤，道消身死。`);
            } else if (currentCombat.status === 'DEFEAT') {
              engine.state.battleStats.HP = Math.max(1, engine.state.battleStats.HP);
            }

            AchievementSystem.checkAll(engine);
            set({ currentCombat: null, gameState: { ...engine.state } });
          }
        }
      };
    },
    {
      name: 'aeon_session_v1', // Session Storage Key
      storage: createJSONStorage(() => sessionStorage), // Use SessionStorage for temporary dev persistence
      partialize: (state) => ({
        gameState: state.gameState,
        currentEvent: state.currentEvent,
        currentSlot: state.currentSlot,
        currentCombat: state.currentCombat
        // Don't persist engine or actions
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.gameState) {
          console.log("[Store] Rehydrated session state", state.gameState);
          // Sync Engine State
          state.engine.state = state.gameState;
          // If engine checks are needed:
          if (!state.engine.state.attributes) state.engine.state.attributes = {};
        }
      }
    }
  )
);
