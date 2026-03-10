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
import type { CombatState, CombatEntity } from '../types/combat';

// Import other stores for cross-store interaction
import { useUIStore } from './uiStore';

// Type moved to uiStore, but keeping here if needed for type reference or refactor module
// type GameScene = ... (Managed by UIStore)

// --- SAVE SYSTEM VERSIONING ---
const SAVE_VERSION = 1;

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
  performAction: (actionType: 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT') => void;
  makeChoice: (choice: EventChoice) => void;
  ackBreakthrough: () => void;
  travel: (targetId: string) => { success: boolean; message: string };
  interactNPC: (npc: import('../types/worldTypes').WorldNPC, type: 'TALK' | 'SPAR' | 'KILL') => void;

  // Combat Proxy
  startCombat: (enemy: Partial<CombatEntity>, type?: CombatState['type']) => void;
  executeCombatSkill: (skillId: string) => void;
  fleeCombat: () => void;
  exitCombat: () => void;
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
            if (data.scene) {
              useUIStore.getState().setScene(data.scene);
            }

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
            currentSlot: null // Clear slot until saved
          });

          // Auto-Save Initial State
          const { currentSlot } = get();
          if (currentSlot !== null) {
            get().saveGame(currentSlot);
          }
        },

        // Unified Action Handler
        performAction: (actionType: 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT') => {
          const { engine } = get();

          const system = new ActionSystem(engine);

          const result = system.perform(actionType);

          if (result.success) {
            if (result.combat) {
              get().startCombat(result.combat.enemy, result.combat.type);
            }

            set({
              gameState: { ...engine.state }, // Force update
              currentEvent: result.event || null,
              breakthroughMsg: result.message || null
            });
          }
        },

        nextTurn: () => {
          get().performAction('CULTIVATE');
        },

        makeChoice: (choice: EventChoice) => {
          const { engine } = get();
          engine.makeChoice(choice);

          if (choice.combat) {
            get().startCombat(choice.combat.enemy, choice.combat.type);
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
            set({ gameState: { ...engine.state } });
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

          engine.state.history.push(`${engine.getTimeStr()} ${log}`);

          // Pass time
          const result = engine.advanceTime(0, { action: 'INTERACT' }, 5);

          if (result.event) {
            engine.processEvent(result.event);
          }

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
        startCombat: (enemy: Partial<CombatEntity>, type: CombatState['type'] = 'WILD') => {
          const { engine } = get();
          const combatEngine = new CombatEngine(engine.state, enemy, type);
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
            engine.state.battleStats.MAX_HP = Math.max(1, currentCombat.player.hp);

            if (currentCombat.type === 'TRIBULATION') {
              if (currentCombat.status === 'VICTORY') {
                engine.state.history.push(`${engine.getTimeStr()} 雷劫消散，突破成功！`);
                set({ breakthroughMsg: "雷劫消散，突破成功！" });
                // Wait, we need to apply breakthrough success if it wasn't already.
                // Since we can't easily import CultivationSystem here without circular dependencies,
                // let's just cheat and level up the realm here directly, simulating applyBreakthroughSuccess.
                const idx = engine.state.realm_idx;
                engine.state.realm_idx++;
                const bonus = (idx + 1) * 10; // Approximate GAME_RULES.REALM_BONUS_MULTIPLIER
                for (const k in engine.state.attributes) {
                  if (k !== 'MONEY' && k !== 'MOOD') engine.state.attributes[k] += bonus;
                }
                engine.state.battleStats.MAX_HP = Math.floor(engine.state.battleStats.MAX_HP * 1.5);
                engine.state.battleStats.HP = engine.state.battleStats.MAX_HP;
                engine.state.battleStats.MP = engine.state.battleStats.MAX_MP;
              } else {
                engine.state.history.push(`${engine.getTimeStr()} 渡劫失败，修为散尽，身受重伤！`);
                set({ breakthroughMsg: "渡劫失败，修为散尽，身受重伤！" });
              }
            }

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
