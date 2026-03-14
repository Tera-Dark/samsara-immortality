import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NPC } from '../types';

type SceneType = 'MENU' | 'TALENT' | 'ALLOC' | 'GAME' | 'SUMMARY' | 'CODEX' | 'REINCARNATION';

interface UIState {
    scene: SceneType;
    previousScene: SceneType | null;
    settings: {
        volume: number;
        theme: 'light' | 'dark';
    };
    showCharacterSheet: boolean;
    showInventory: boolean;
    showSkills: boolean;
    showMap: boolean;
    showSettings: boolean;
    showMissions: boolean;
    /** 当前查看的NPC，null表示查看自己 */
    inspectTarget: NPC | null;

    // Actions
    setScene: (scene: SceneType) => void;
    setVolume: (vol: number) => void;
    toggleCharacterSheet: (show?: boolean) => void;
    toggleInventory: (show?: boolean) => void;
    toggleSkills: (show?: boolean) => void;
    toggleMap: (show?: boolean) => void;
    toggleSettings: (show?: boolean) => void;
    toggleMissions: (show?: boolean) => void;
    /** 打开NPC详情面板 */
    inspectNPC: (npc: NPC | null) => void;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            scene: 'MENU', // Default start
            previousScene: null,
            settings: {
                volume: 50,
                theme: 'dark'
            },
            showCharacterSheet: false,
            inspectTarget: null,
            showInventory: false,
            showSkills: false,
            showMap: false,
            showSettings: false,
            showMissions: false,

            setScene: (newScene) => set((state) => ({
                scene: newScene,
                previousScene: state.scene,
                showCharacterSheet: false,
                inspectTarget: null,
                showInventory: false,
                showSkills: false,
                showMap: false,
                showSettings: false,
                showMissions: false,
            })),

            setVolume: (vol) => set((state) => ({ settings: { ...state.settings, volume: vol } })),

            toggleCharacterSheet: (show) => set((state) => ({
                showCharacterSheet: show !== undefined ? show : !state.showCharacterSheet,
                ...(!show && show !== undefined ? { inspectTarget: null } : {})
            })),

            toggleInventory: (show) => set((state) => ({ showInventory: show !== undefined ? show : !state.showInventory })),
            toggleSkills: (show) => set((state) => ({ showSkills: show !== undefined ? show : !state.showSkills })),
            toggleMap: (show) => set((state) => ({ showMap: show !== undefined ? show : !state.showMap })),
            toggleSettings: (show) => set((state) => ({ showSettings: show !== undefined ? show : !state.showSettings })),
            toggleMissions: (show) => set((state) => ({ showMissions: show !== undefined ? show : !state.showMissions })),

            inspectNPC: (npc) => set({
                inspectTarget: npc,
                showCharacterSheet: true,
            }),
        }),
        {
            name: 'aeon-ui-storage',
            partialize: (state) => ({ settings: state.settings }), // Only persist settings
        }
    )
);
