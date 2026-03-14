import React, { useMemo, useState } from 'react';
import { Briefcase, Gem, Shield, Sparkles, Sword, User } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { ITEMS } from '../../data/items';
import type { ItemType } from '../../types/itemTypes';
import { AchievementSystem } from '../../engine/systems/AchievementSystem';

interface InventoryPanelProps {
    onClose: () => void;
}

const RARITY_COLORS = {
    COMMON: '#94a3b8',
    UNCOMMON: '#22c55e',
    RARE: '#3b82f6',
    EPIC: '#a855f7',
    LEGENDARY: '#f59e0b',
};

const CATEGORIES: { label: string; value: ItemType | 'ALL' }[] = [
    { label: '全部', value: 'ALL' },
    { label: '法宝', value: 'EQUIPMENT' },
    { label: '丹药', value: 'CONSUMABLE' },
    { label: '材料', value: 'MATERIAL' },
];

function getTypeLabel(type: string) {
    if (type === 'EQUIPMENT') return '法宝';
    if (type === 'CONSUMABLE') return '丹药';
    if (type === 'MATERIAL') return '材料';
    if (type === 'RESOURCE') return '资源';
    return type;
}

function getFallbackIcon(type: string) {
    if (type === 'RESOURCE') return '灵';
    if (type === 'CONSUMABLE') return '丹';
    if (type === 'MATERIAL') return '材';
    if (type === 'EQUIPMENT') return '器';
    return '物';
}

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ onClose }) => {
    const { gameState } = useGameStore();
    const { inventory, equipment, battleStats } = gameState;
    const engine = useGameStore((state) => state.engine);

    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ItemType | 'ALL'>('ALL');
    const [selectedEquipSlot, setSelectedEquipSlot] = useState<'weapon' | 'armor' | 'accessory' | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const syncState = () => {
        AchievementSystem.checkAll(engine);
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleUseItem = (itemId: string) => {
        const result = engine.consumeItem(itemId);
        if (result.success) {
            syncState();
            setActionMessage({ type: 'success', text: `已使用 ${ITEMS[itemId]?.name || '物品'}。` });
        } else {
            setActionMessage({ type: 'error', text: result.message });
        }
    };

    const handleEquipItem = (itemId: string) => {
        const result = engine.equipItem(itemId);
        if (result.success) {
            syncState();
            setActionMessage({ type: 'success', text: `已装备 ${ITEMS[itemId]?.name || '物品'}。` });
        } else {
            setActionMessage({ type: 'error', text: result.message });
        }
    };

    const handleUnequipItem = (slot: 'weapon' | 'armor' | 'accessory') => {
        const result = engine.unequipItem(slot);
        if (result.success) {
            if (selectedEquipSlot === slot) setSelectedEquipSlot(null);
            syncState();
            setActionMessage({ type: 'success', text: '装备已卸下。' });
        } else {
            setActionMessage({ type: 'error', text: result.message });
        }
    };

    const filteredInventory = useMemo(
        () => inventory.filter((slot) => {
            const item = ITEMS[slot.itemId];
            if (!item) return false;
            return selectedCategory === 'ALL' ? true : item.type === selectedCategory;
        }),
        [inventory, selectedCategory],
    );

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
        selectedSlotCount = inventory.find((slot) => slot.itemId === selectedItem)?.count || 0;
    }

    const renderEquipSlot = (label: string, slot: 'weapon' | 'armor' | 'accessory', Icon: React.ElementType) => {
        const itemId = equipment[slot];
        const item = itemId ? ITEMS[itemId] : null;
        const isSelected = selectedEquipSlot === slot;

        return (
            <button
                key={slot}
                onClick={() => {
                    setSelectedItem(null);
                    setSelectedEquipSlot(slot);
                }}
                className={`w-full rounded-[24px] border p-4 text-left transition-all ${isSelected ? 'border-amber-300 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                style={{ borderColor: isSelected ? undefined : (item ? RARITY_COLORS[item.rarity] : undefined) }}
            >
                <div className="mb-2 text-[11px] tracking-[0.22em] text-slate-500">{label}</div>
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500">
                        {item ? <span className="text-2xl">{item.icon || getFallbackIcon(item.type)}</span> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold" style={{ color: item ? RARITY_COLORS[item.rarity] : '#475569' }}>
                            {item ? item.name : '空位'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{item ? getTypeLabel(item.type) : '尚未装备物品'}</div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="flex h-[84vh] w-full max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] shadow-[0_40px_120px_rgba(15,23,42,0.32)]">
                <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 p-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-[22px] border border-slate-200 bg-slate-50">
                                <User className="h-7 w-7 text-slate-500" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-slate-800">{gameState.name}</div>
                                <div className="mt-1 text-sm text-slate-500">装备与行囊总览</div>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3">
                                <div className="text-[11px] tracking-[0.2em] text-rose-700">攻击</div>
                                <div className="mt-2 font-mono text-lg font-semibold text-rose-800">{battleStats.ATK}</div>
                            </div>
                            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3">
                                <div className="text-[11px] tracking-[0.2em] text-sky-700">防御</div>
                                <div className="mt-2 font-mono text-lg font-semibold text-sky-800">{battleStats.DEF}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 flex-1 space-y-3">
                        {renderEquipSlot('武器', 'weapon', Sword)}
                        {renderEquipSlot('防具', 'armor', Shield)}
                        {renderEquipSlot('饰品', 'accessory', Gem)}
                    </div>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col">
                    <div className="border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="text-[11px] tracking-[0.24em] text-slate-400">物品管理</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">背包与装备</div>
                            </div>
                            <button onClick={onClose} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 transition-colors hover:border-red-200 hover:text-red-500">
                                关闭
                            </button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.value}
                                    onClick={() => setSelectedCategory(cat.value)}
                                    className={`rounded-full border px-4 py-2 text-sm transition-all ${selectedCategory === cat.value ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'}`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {actionMessage && (
                        <div className={`mx-6 mt-4 rounded-2xl border px-4 py-3 text-sm ${actionMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                            {actionMessage.text}
                        </div>
                    )}

                    <div className="grid min-h-0 flex-1 gap-0 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="custom-scrollbar overflow-y-auto p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm text-slate-500">当前筛选共 {filteredInventory.length} 件物品</div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                                    <Briefcase className="h-3.5 w-3.5" />
                                    选择物品后可在右侧查看详情
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                                {filteredInventory.map((slot) => {
                                    const item = ITEMS[slot.itemId];
                                    if (!item) return null;
                                    const isSelected = selectedItem === slot.itemId && !isSlotSelected;

                                    return (
                                        <button
                                            key={`${slot.itemId}-${slot.count}`}
                                            onClick={() => {
                                                setSelectedEquipSlot(null);
                                                setSelectedItem(slot.itemId);
                                            }}
                                            className={`group relative aspect-square overflow-hidden rounded-[26px] border p-4 text-left transition-all ${isSelected ? 'border-amber-300 bg-amber-50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                            style={{ borderColor: isSelected ? undefined : RARITY_COLORS[item.rarity] }}
                                        >
                                            <div className="absolute right-3 top-3 rounded-full bg-slate-900 px-2 py-1 text-[11px] font-mono text-white shadow-sm">
                                                {slot.count}
                                            </div>
                                            <div className="flex h-full flex-col justify-between">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-3xl text-slate-700">
                                                    {item.icon || getFallbackIcon(item.type)}
                                                </div>
                                                <div>
                                                    <div className="truncate text-sm font-semibold" style={{ color: RARITY_COLORS[item.rarity] }}>
                                                        {item.name}
                                                    </div>
                                                    <div className="mt-1 text-xs text-slate-500">{getTypeLabel(item.type)}</div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {filteredInventory.length === 0 && (
                                    <div className="col-span-full rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                                        <div className="text-lg font-semibold text-slate-700">这一分类下暂无物品</div>
                                        <div className="mt-2 text-sm text-slate-500">继续探索、战斗或炼制后再回来查看。</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="border-l border-slate-200 bg-slate-50/80 p-6">
                            {selectedItemDef ? (
                                <div className="flex h-full flex-col">
                                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50 text-4xl text-slate-700">
                                            {selectedItemDef.icon || getFallbackIcon(selectedItemDef.type)}
                                        </div>
                                        <div className="mt-4 text-2xl font-semibold" style={{ color: RARITY_COLORS[selectedItemDef.rarity] }}>
                                            {selectedItemDef.name}
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                                                {getTypeLabel(selectedItemDef.type)}
                                            </span>
                                            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                                                {selectedItemDef.rarity}
                                            </span>
                                        </div>
                                        <div className="mt-4 text-sm leading-6 text-slate-600">{selectedItemDef.description}</div>
                                    </div>

                                    {selectedItemDef.statBonuses && (
                                        <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                                                <Sparkles className="h-4 w-4 text-emerald-500" />
                                                词条加成
                                            </div>
                                            <div className="space-y-2">
                                                {Object.entries(selectedItemDef.statBonuses).map(([stat, value]) => (
                                                    <div key={stat} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">
                                                        <span className="text-slate-600">{stat}</span>
                                                        <span className="font-mono font-semibold text-emerald-700">+{value as number}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="space-y-3 text-sm">
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">持有数量</span>
                                                <span className="font-mono font-semibold text-slate-800">{selectedSlotCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-slate-500">单品价值</span>
                                                <span className="font-mono font-semibold text-amber-700">{selectedItemDef.value} 灵石</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4">
                                        {isSlotSelected ? (
                                            <button
                                                className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
                                                onClick={() => handleUnequipItem(selectedEquipSlot)}
                                            >
                                                卸下装备
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                {selectedItemDef.type === 'EQUIPMENT' && (
                                                    <button
                                                        className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
                                                        onClick={() => handleEquipItem(selectedItemDef.id)}
                                                    >
                                                        装备
                                                    </button>
                                                )}
                                                {selectedItemDef.type === 'CONSUMABLE' && (
                                                    <button
                                                        className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
                                                        onClick={() => handleUseItem(selectedItemDef.id)}
                                                    >
                                                        使用
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50">
                                        <Briefcase className="h-7 w-7 text-slate-400" />
                                    </div>
                                    <div className="mt-4 text-lg font-semibold text-slate-700">选择物品查看详情</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-500">
                                        左侧可以查看背包物品，中间网格用于筛选和选择，右侧则集中展示属性与操作按钮。
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </section>
            </div>
        </div>
    );
};
