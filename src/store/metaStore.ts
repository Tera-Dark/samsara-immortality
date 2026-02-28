import { create } from 'zustand';

interface MetaState {
    karma: number;
    unlockedUpgrades: { [key: string]: number };
}

interface MetaStore {
    metaState: MetaState;

    // Actions
    loadMeta: () => void;
    saveMeta: () => void;
    purchaseUpgrade: (upgradeId: string, cost: number) => void;
    addKarma: (amount: number) => void;
}

export const useMetaStore = create<MetaStore>((set, get) => ({
    metaState: {
        karma: 0,
        unlockedUpgrades: {}
    },

    loadMeta: () => {
        const karma = parseInt(localStorage.getItem('aeon_meta_karma') || '0');
        const upgrades = JSON.parse(localStorage.getItem('aeon_meta_upgrades') || '{}');
        set({ metaState: { karma, unlockedUpgrades: upgrades } });
    },

    saveMeta: () => {
        const { metaState } = get();
        localStorage.setItem('aeon_meta_karma', metaState.karma.toString());
        localStorage.setItem('aeon_meta_upgrades', JSON.stringify(metaState.unlockedUpgrades));
    },

    purchaseUpgrade: (upgradeId, cost) => {
        const { metaState, saveMeta } = get();
        if (metaState.karma >= cost) {
            const currentLevel = metaState.unlockedUpgrades[upgradeId] || 0;
            const newMeta = {
                ...metaState,
                karma: metaState.karma - cost,
                unlockedUpgrades: {
                    ...metaState.unlockedUpgrades,
                    [upgradeId]: currentLevel + 1
                }
            };
            set({ metaState: newMeta });
            saveMeta(); // Auto save on purchase
        }
    },

    addKarma: (amount) => {
        const { metaState, saveMeta } = get();
        const newMeta = {
            ...metaState,
            karma: metaState.karma + amount
        };
        set({ metaState: newMeta });
        saveMeta();
    }
}));
