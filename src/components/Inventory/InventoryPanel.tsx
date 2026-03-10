import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ITEMS } from '../../data/items';
import type { ItemType } from '../../types/itemTypes';
import { User, Sword, Shield, Gem } from 'lucide-react';

interface InventoryPanelProps {
    onClose: () => void;
}

const RARITY_COLORS = {
    'COMMON': '#a0a0a0',
    'UNCOMMON': '#4ade80',
    'RARE': '#60a5fa',
    'EPIC': '#a78bfa',
    'LEGENDARY': '#facc15'
};

const CATEGORIES: { label: string, value: ItemType | 'ALL' }[] = [
    { label: '全部', value: 'ALL' },
    { label: '法宝', value: 'EQUIPMENT' },
    { label: '丹药', value: 'CONSUMABLE' },
    { label: '材料', value: 'MATERIAL' },
];

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ onClose }) => {
    const { gameState } = useGameStore();
    const { inventory, equipment, battleStats } = gameState;
    const engine = useGameStore(state => state.engine);

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ItemType | 'ALL'>('ALL');
    const [selectedEquipSlot, setSelectedEquipSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);

    const syncState = () => {
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleUseItem = (itemId: string) => {
        const result = engine.useItem(itemId);
        if (result.success) syncState();
        else alert(result.message);
    };

    const handleEquipItem = (itemId: string) => {
        const result = engine.equipItem(itemId);
        if (result.success) syncState();
        else alert(result.message);
    };

    const handleUnequipItem = (slot: 'weapon' | 'armor' | 'accessory') => {
        const result = engine.unequipItem(slot);
        if (result.success) {
            if (selectedEquipSlot === slot) setSelectedEquipSlot(null);
            syncState();
        } else {
            alert(result.message);
        }
    };

    // Derived Selection
    const isSlotSelected = selectedEquipSlot !== null;
    let selectedItemDef = null;
    let selectedSlotCount = 0;

    if (isSlotSelected) {
        const eqId = equipment[selectedEquipSlot];
        if (eqId) {
            selectedItemDef = ITEMS[eqId];
            selectedSlotCount = 1;
        }
    } else if (selectedItem) {
        selectedItemDef = ITEMS[selectedItem];
        selectedSlotCount = inventory.find(s => s.itemId === selectedItem)?.count || 0;
    }

    const filteredInventory = inventory.filter(slot => {
        const item = ITEMS[slot.itemId];
        if (!item) return false;
        if (selectedCategory === 'ALL') return true;
        return item.type === selectedCategory;
    });

    const renderEquipSlot = (label: string, slot: 'weapon' | 'armor' | 'accessory', iconFallback: string) => {
        const itemId = equipment[slot];
        const item = itemId ? ITEMS[itemId] : null;
        const isSelected = selectedEquipSlot === slot;

        return (
            <div className="mb-4">
                <div className="text-xs text-slate-500 mb-1 pl-1">{label}</div>
                <div
                    className={`h-16 bg-slate-800 border-2 rounded cursor-pointer relative group transition-all flex items-center px-4
                        ${isSelected ? 'border-amber-500 bg-slate-700' : 'border-slate-200 hover:border-slate-500'}
                    `}
                    onClick={() => {
                        setSelectedItem(null);
                        setSelectedEquipSlot(slot);
                    }}
                    style={{ borderColor: isSelected ? undefined : (item ? RARITY_COLORS[item.rarity] : undefined) }}
                >
                    <div className="text-2xl mr-4 opacity-80 flex items-center">
                        {item ? item.icon : (iconFallback === 'sword' ? <Sword className="w-6 h-6 text-slate-400" /> : iconFallback === 'shield' ? <Shield className="w-6 h-6 text-slate-400" /> : <Gem className="w-6 h-6 text-slate-400" />)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {item ? (
                            <div className="truncate text-sm" style={{ color: RARITY_COLORS[item.rarity] }}>{item.name}</div>
                        ) : (
                            <div className="text-slate-600 text-sm">空</div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center catch-events z-50 animate-fade-in">
            <div className="w-[1000px] h-[650px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-800/50">
                    <h2 className="text-xl font-bold text-amber-500 tracking-wider">角色 & 行囊</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        关闭 (Esc)
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Character & Equipment */}
                    <div className="w-64 border-r border-slate-200 bg-slate-800/20 p-6 flex flex-col overflow-y-auto">
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 mx-auto rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                <User className="w-10 h-10 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">{gameState.name}</h3>
                            <p className="text-xs text-slate-400 mt-1">
                                ATK: <span className="text-rose-400">{battleStats.ATK}</span> | DEF: <span className="text-blue-400">{battleStats.DEF}</span>
                            </p>
                        </div>

                        {renderEquipSlot('武器', 'weapon', 'sword')}
                        {renderEquipSlot('防具', 'armor', 'shield')}
                        {renderEquipSlot('饰品', 'accessory', 'gem')}
                    </div>

                    {/* Middle Panel: Inventory Grid */}
                    <div className="flex-1 flex flex-col">
                        {/* Categories */}
                        <div className="flex px-4 pt-4 pb-2 border-b border-slate-200 space-x-2">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all
                                        ${selectedCategory === cat.value
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                                            : 'bg-slate-800 text-slate-400 border border-slate-200 hover:bg-slate-700'}
                                    `}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="flex-1 p-4 overflow-y-auto grid grid-cols-5 gap-3 content-start">
                            {filteredInventory.map((slot, idx) => {
                                const item = ITEMS[slot.itemId];
                                if (!item) return null;
                                const isSelected = selectedItem === slot.itemId && !isSlotSelected;

                                return (
                                    <div
                                        key={idx}
                                        className={`aspect-square bg-slate-800 border-2 rounded cursor-pointer relative group transition-all
                                            ${isSelected ? 'border-amber-500 bg-slate-700 scale-105 shadow-lg z-10' : 'border-slate-200 hover:border-slate-500'}
                                        `}
                                        onClick={() => {
                                            setSelectedEquipSlot(null);
                                            setSelectedItem(slot.itemId);
                                        }}
                                        style={{ borderColor: isSelected ? undefined : RARITY_COLORS[item.rarity] }}
                                    >
                                        <div className="absolute top-1 right-1 text-xs font-mono text-white bg-black/60 px-1.5 rounded shadow">
                                            {slot.count}
                                        </div>
                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                            {item.icon || (item.type === 'RESOURCE' ? '灵' :
                                                item.type === 'CONSUMABLE' ? '丹' :
                                                    item.type === 'MATERIAL' ? '材' : '物')}
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-4 pb-1 text-center text-[11px] truncate px-1 text-slate-600">
                                            {item.name}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty Slots Filler */}
                            {Array.from({ length: Math.max(0, 25 - filteredInventory.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square bg-white border border-slate-200 rounded opacity-30"></div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Details */}
                    <div className="w-80 border-l border-slate-200 bg-slate-800/30 p-6 flex flex-col relative shadow-[-10px_0_20px_rgba(0,0,0,0.2)]">
                        {selectedItemDef ? (
                            <>
                                <div className="text-5xl mb-6 text-center drop-shadow-lg mt-4">
                                    {selectedItemDef.icon || (selectedItemDef.type === 'RESOURCE' ? '灵' : selectedItemDef.type === 'CONSUMABLE' ? '丹' : '草')}
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-center drop-shadow" style={{ color: RARITY_COLORS[selectedItemDef.rarity] }}>
                                    {selectedItemDef.name}
                                </h3>
                                <div className="text-xs text-slate-400 mb-6 uppercase tracking-widest text-center">
                                    {selectedItemDef.type} · {selectedItemDef.rarity}
                                </div>

                                <div className="bg-white/80 p-4 border border-slate-200 rounded-lg mb-6">
                                    <div className="text-sm text-slate-600 leading-relaxed">
                                        {selectedItemDef.description}
                                    </div>

                                    {/* Stat Bonuses */}
                                    {selectedItemDef.statBonuses && (
                                        <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                                            {Object.entries(selectedItemDef.statBonuses).map(([stat, val]) => (
                                                <div key={stat} className="text-xs flex justify-between">
                                                    <span className="text-slate-400">{stat}</span>
                                                    <span className="text-emerald-400 font-mono">+{val as number}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1"></div>

                                <div className="space-y-3 mb-6 bg-slate-800/50 p-4 rounded border border-slate-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">持有数量:</span>
                                        <span className="text-white font-mono">{selectedSlotCount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">单品价值:</span>
                                        <span className="text-amber-300 flex items-center font-mono">
                                            {selectedItemDef.value} <span className="text-xs ml-1">灵石</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {isSlotSelected ? (
                                    <button
                                        className="w-full py-3 rounded-lg font-bold transition-all bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20"
                                        onClick={() => handleUnequipItem(selectedEquipSlot)}
                                    >
                                        卸下装备
                                    </button>
                                ) : (
                                    <>
                                        {selectedItemDef.type === 'EQUIPMENT' && (
                                            <button
                                                className="w-full py-3 rounded-lg font-bold transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20"
                                                onClick={() => handleEquipItem(selectedItemDef!.id)}
                                            >
                                                装 备
                                            </button>
                                        )}
                                        {selectedItemDef.type === 'CONSUMABLE' && (
                                            <button
                                                className="w-full py-3 rounded-lg font-bold transition-all bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                                                onClick={() => handleUseItem(selectedItemDef!.id)}
                                            >
                                                服 用
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                <span className="text-4xl mb-4 opacity-50">✦</span>
                                <span className="text-sm tracking-widest">选择物品查看详情</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
