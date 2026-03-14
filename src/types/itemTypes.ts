import type { Effect } from './index';

export type ItemType = 'RESOURCE' | 'CONSUMABLE' | 'EQUIPMENT' | 'MATERIAL' | 'MOUNT';
export type ItemRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: ItemRarity;
    description: string;
    stackable: boolean;
    effect?: Effect;
    value: number; // Spirit Stones value
    icon?: string; // Optional icon class or char

    // [NEW] Equipment Specific Fields
    equipType?: 'WEAPON' | 'ARMOR' | 'ACCESSORY';
    statBonuses?: Partial<import('./index').BattleStats> & Partial<import('./index').CharacterAttributes>;
    learnSkillId?: string;
}

export interface InventorySlot {
    itemId: string;
    count: number;
}
