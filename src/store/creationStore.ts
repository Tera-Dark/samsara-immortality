import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Talent } from '../types';
import { TALENTS } from '../modules/xianxia/data/talents';
import { useMetaStore } from './metaStore';
import { useUIStore } from './uiStore';
import { useGameStore } from './gameStore';
import { AchievementSystem } from '../engine/systems/AchievementSystem';

interface CreationState {
    availableTalents: Talent[];
    selectedTalentIds: string[];
    allocStats: { [key: string]: number };
    availablePoints: number;
    statsConfirmed: boolean;
    talentResetCount: number;

    // Actions
    drawTalents: () => void;
    resetTalents: () => void;
    selectTalent: (id: string) => void;
    confirmTalents: () => void;
    updateStat: (key: string, delta: number) => void;
    autoAllocate: (mode: 'RANDOM' | 'AVG') => void;
    confirmStats: () => void;
    beginJourney: () => void; // Final submit
}

export const useCreationStore = create<CreationState>()(
    persist(
        (set, get) => ({
            availableTalents: [],
            selectedTalentIds: [],
            allocStats: { STR: 0, MND: 0, INT: 0, CHR: 0, POT: 0, LUCK: 0 },
            availablePoints: 24,
            statsConfirmed: false,
            talentResetCount: 0,

            drawTalents: () => {
                // Config: 6 Options
                // Weights: White 55, Green 30, Blue 10, Purple 5, Orange 1, Red 0.03
                const WEIGHTS = [
                    { grade: 1, weight: 5500 },  // White
                    { grade: 2, weight: 3000 },  // Green
                    { grade: 3, weight: 1000 },  // Blue
                    { grade: 4, weight: 500 },   // Purple
                    { grade: 5, weight: 100 },   // Orange
                    { grade: 6, weight: 3 }      // Red
                ];
                const TOTAL_WEIGHT = 10103;

                const drawn: Talent[] = [];
                const drawnIds = new Set<string>();

                // Draw 6 times
                for (let i = 0; i < 6; i++) {
                    let attempts = 0;
                    let talent: Talent | undefined;

                    while (!talent && attempts < 10) {
                        attempts++;
                        // 1. Roll Grade
                        let roll = Math.floor(Math.random() * TOTAL_WEIGHT);
                        let targetGrade = 1;
                        for (const w of WEIGHTS) {
                            if (roll < w.weight) {
                                targetGrade = w.grade;
                                break;
                            }
                            roll -= w.weight;
                        }

                        // 2. Filter Pool
                        // Grade 5/6 need achievement unlock; If pool is empty for that grade, fallback to Grade 1 (Common)
                        const unlockedGrades = AchievementSystem.getUnlockedTalentGrades();
                        let pool = TALENTS.filter(t => t.grade === targetGrade && !drawnIds.has(t.id) && unlockedGrades.has(t.grade));
                        if (pool.length === 0) {
                            pool = TALENTS.filter(t => t.grade === 1 && !drawnIds.has(t.id));
                        }

                        if (pool.length > 0) {
                            talent = pool[Math.floor(Math.random() * pool.length)];
                        }
                    }

                    if (talent) {
                        drawn.push(talent);
                        drawnIds.add(talent.id);
                    }
                }

                set({ availableTalents: drawn, selectedTalentIds: [] });
            },

            resetTalents: () => {
                const { talentResetCount, drawTalents } = get();
                const metaState = useMetaStore.getState().metaState;

                // Base resets = 3, + Meta Upgrades
                const maxResets = 3 + (metaState.unlockedUpgrades['meta_resets'] || 0);

                if (talentResetCount < maxResets) {
                    set({ talentResetCount: talentResetCount + 1 });
                    drawTalents();
                }
            },

            selectTalent: (id: string) => {
                const { selectedTalentIds } = get();
                const metaState = useMetaStore.getState().metaState;
                const maxTalents = 3 + (metaState.unlockedUpgrades['meta_talent_slot'] || 0);

                if (selectedTalentIds.includes(id)) {
                    set({ selectedTalentIds: selectedTalentIds.filter(tid => tid !== id) });
                } else {
                    if (selectedTalentIds.length < maxTalents) {
                        set({ selectedTalentIds: [...selectedTalentIds, id] });
                    }
                }
            },

            confirmTalents: () => {
                const metaState = useMetaStore.getState().metaState;
                const maxTalents = 3 + (metaState.unlockedUpgrades['meta_talent_slot'] || 0);

                if (get().selectedTalentIds.length !== maxTalents) return;
                // 重置属性分配
                useUIStore.getState().setScene('ALLOC');
                set({
                    availablePoints: 24,
                    allocStats: { STR: 0, MND: 0, INT: 0, CHR: 0, POT: 0, LUCK: 0 },
                });
            },

            updateStat: (key: string, delta: number) => {
                const { allocStats, availablePoints } = get();
                if (delta > 0 && availablePoints > 0) {
                    set({
                        allocStats: { ...allocStats, [key]: allocStats[key] + 1 },
                        availablePoints: availablePoints - 1
                    });
                } else if (delta < 0 && allocStats[key] > 0) {
                    set({
                        allocStats: { ...allocStats, [key]: allocStats[key] - 1 },
                        availablePoints: availablePoints + 1
                    });
                }
            },

            autoAllocate: (mode: 'RANDOM' | 'AVG') => {
                // 每次自动分配都从头开始，重新分配全部点数
                const totalPoints = 24;

                if (mode === 'AVG') {
                    set({
                        allocStats: { STR: 4, MND: 4, INT: 4, CHR: 4, POT: 4, LUCK: 4 },
                        availablePoints: 0
                    });
                } else {
                    const stats = { STR: 0, MND: 0, INT: 0, CHR: 0, POT: 0, LUCK: 0 };
                    const keys = Object.keys(stats) as Array<keyof typeof stats>;
                    let pts = totalPoints;

                    while (pts > 0) {
                        const k = keys[Math.floor(Math.random() * keys.length)];
                        stats[k]++;
                        pts--;
                    }
                    set({ allocStats: stats, availablePoints: 0 });
                }
            },

            confirmStats: () => {
                set({ statsConfirmed: true });
                get().beginJourney();
            },

            beginJourney: () => {
                const { selectedTalentIds, allocStats } = get();

                // Map talent IDs back to objects
                const selectedTalentObjects = selectedTalentIds.map(id => TALENTS.find(t => t.id === id)).filter(t => t !== undefined) as Talent[];

                const metaState = useMetaStore.getState().metaState;
                const upgrades = metaState.unlockedUpgrades;

                // Combine User Allocation with Meta Upgrades
                const finalStats = { ...allocStats };
                finalStats.STR += (upgrades['meta_str'] || 0);
                finalStats.INT += (upgrades['meta_int'] || 0);
                finalStats.CHR += (upgrades['meta_chr'] || 0);
                finalStats.POT += (upgrades['meta_pot'] || 0);
                finalStats.MND += (upgrades['meta_mnd'] || 0);
                finalStats.LUCK += (upgrades['meta_luck'] || 0);

                // Initial Money
                const startingMoney = (upgrades['meta_starting_money'] || 0) * 50;
                if (startingMoney > 0) {
                    finalStats.MONEY = (finalStats.MONEY || 0) + startingMoney;
                }

                // Clear local state
                set({
                    availableTalents: [],
                    selectedTalentIds: [],
                    talentResetCount: 0,
                    statsConfirmed: false
                });

                // Initialize and start game
                const gameStore = useGameStore.getState();
                gameStore.startGame(selectedTalentObjects, finalStats);

                useUIStore.getState().setScene('GAME');
            }
        }),
        {
            name: 'aeon-creation-storage',
            partialize: (state) => ({
                talentResetCount: state.talentResetCount,
                availableTalents: state.availableTalents,
                selectedTalentIds: state.selectedTalentIds,
                allocStats: state.allocStats,
                availablePoints: state.availablePoints
            })
        }
    )
);
