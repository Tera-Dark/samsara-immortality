import { create } from 'zustand';
import { META_UPGRADES } from '../data/meta';

interface MetaState {
    karma: number;
    unlockedUpgrades: { [key: string]: number };
    achievements: string[];
    reincarnationCount: number;
}

interface MetaStore {
    metaState: MetaState;

    // Actions
    loadMeta: () => void;
    saveMeta: () => void;
    purchaseUpgrade: (upgradeId: string, cost: number) => void;
    addKarma: (amount: number) => void;
    unlockAchievement: (achievementId: string) => void;
    incrementReincarnation: () => void;
}

const DEFAULT_META_STATE: MetaState = {
    karma: 0,
    unlockedUpgrades: {},
    achievements: [],
    reincarnationCount: 0,
};

function readMetaState(): MetaState {
    try {
        return {
            karma: parseInt(localStorage.getItem('aeon_meta_karma') || '0'),
            unlockedUpgrades: JSON.parse(localStorage.getItem('aeon_meta_upgrades') || '{}'),
            achievements: JSON.parse(localStorage.getItem('aeon_meta_achievements') || '[]'),
            reincarnationCount: parseInt(localStorage.getItem('aeon_meta_reincarnation_count') || '0'),
        };
    } catch {
        return DEFAULT_META_STATE;
    }
}

function persistMetaState(metaState: MetaState) {
    localStorage.setItem('aeon_meta_karma', metaState.karma.toString());
    localStorage.setItem('aeon_meta_upgrades', JSON.stringify(metaState.unlockedUpgrades));
    localStorage.setItem('aeon_meta_achievements', JSON.stringify(metaState.achievements));
    localStorage.setItem('aeon_meta_reincarnation_count', metaState.reincarnationCount.toString());
}

export const useMetaStore = create<MetaStore>((set, get) => ({
    metaState: readMetaState(),

    loadMeta: () => {
        set({ metaState: readMetaState() });
    },

    saveMeta: () => {
        const { metaState } = get();
        persistMetaState(metaState);
    },

    purchaseUpgrade: (upgradeId, cost) => {
        const { metaState } = get();
        const upgradeDef = META_UPGRADES.find(u => u.id === upgradeId);

        if (!upgradeDef) return;

        if (metaState.karma >= cost) {
            const currentLevel = metaState.unlockedUpgrades[upgradeId] || 0;

            if (currentLevel >= upgradeDef.maxLevel) return; // Prevent over-upgrade

            const newMeta = {
                ...metaState,
                karma: metaState.karma - cost,
                unlockedUpgrades: {
                    ...metaState.unlockedUpgrades,
                    [upgradeId]: currentLevel + 1
                }
            };
            set({ metaState: newMeta });
            persistMetaState(newMeta);
        }
    },

    addKarma: (amount) => {
        const { metaState } = get();
        const newMeta = {
            ...metaState,
            karma: metaState.karma + amount
        };
        set({ metaState: newMeta });
        persistMetaState(newMeta);
    },

    unlockAchievement: (achievementId) => {
        const { metaState } = get();
        if (metaState.achievements.includes(achievementId)) return;
        const newMeta = {
            ...metaState,
            achievements: [...metaState.achievements, achievementId],
        };
        set({ metaState: newMeta });
        persistMetaState(newMeta);
    },

    incrementReincarnation: () => {
        const { metaState } = get();
        const newMeta = {
            ...metaState,
            reincarnationCount: metaState.reincarnationCount + 1,
        };
        set({ metaState: newMeta });
        persistMetaState(newMeta);
    },
}));
