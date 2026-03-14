import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ABODE_LEVELS, HERB_SEEDS } from '../../data/abode';
import { ITEMS } from '../../data/items';
import { AbodeSystem } from '../../engine/systems/AbodeSystem';
import { AchievementSystem } from '../../engine/systems/AchievementSystem';
import {
    Mountain, X, ArrowUpCircle, Sprout, Shovel,
    Trash2, Lock, Sparkles, ChevronRight
} from 'lucide-react';

interface AbodePanelProps {
    onClose: () => void;
}

export const AbodePanel: React.FC<AbodePanelProps> = ({ onClose }) => {
    const { engine, gameState } = useGameStore();
    const [selectedPlot, setSelectedPlot] = useState<number | null>(null);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    const abode = useMemo(() => {
        return engine ? AbodeSystem.getAbodeState(engine) : { level: 0, plots: [] };
    }, [engine]);

    const currentLevel = ABODE_LEVELS[abode.level] || ABODE_LEVELS[0];
    const nextLevel = ABODE_LEVELS[abode.level + 1] || null;
    const availableSeeds = useMemo(() => (engine ? AbodeSystem.getAvailableSeeds(engine) : []), [engine]);

    const refreshState = () => {
        AchievementSystem.checkAll(engine);
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleUpgrade = () => {
        if (!engine) return;
        const result = engine.upgradeAbode();
        setActionMsg(result.message);
        if (result.success) refreshState();
    };

    const handlePlant = (seedId: string) => {
        if (!engine || selectedPlot === null) return;
        const result = engine.plantHerb(selectedPlot, seedId);
        setActionMsg(result.message);
        if (result.success) {
            setSelectedPlot(null);
            refreshState();
        }
    };

    const handleHarvest = (plotIndex: number) => {
        if (!engine) return;
        const result = engine.harvestHerb(plotIndex);
        setActionMsg(result.message);
        if (result.success) refreshState();
    };

    const handleClear = (plotIndex: number) => {
        if (!engine) return;
        const result = engine.clearPlot(plotIndex);
        setActionMsg(result.message);
        if (result.success) refreshState();
    };

    const money = gameState.attributes.MONEY || 0;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Mountain className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-bold text-slate-100">洞府管理</h2>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{currentLevel.name}</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-5">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="text-base font-bold text-slate-200">{currentLevel.name}</h3>
                                <p className="text-xs text-slate-500 mt-1">{currentLevel.description}</p>
                            </div>
                            {nextLevel && (
                                <button
                                    onClick={handleUpgrade}
                                    disabled={money < nextLevel.upgradeCost || (gameState.realm_idx || 0) < nextLevel.minRealmIdx}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-bold transition-all ${money >= nextLevel.upgradeCost && (gameState.realm_idx || 0) >= nextLevel.minRealmIdx ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                >
                                    <ArrowUpCircle className="w-3.5 h-3.5" />
                                    升级 ({nextLevel.upgradeCost} 灵石)
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="bg-slate-900/50 rounded p-2">
                                <div className="text-[10px] text-slate-500">修炼加成</div>
                                <div className="text-sm font-bold text-emerald-400">+{Math.round(currentLevel.cultivationBonus * 100)}%</div>
                            </div>
                            <div className="bg-slate-900/50 rounded p-2">
                                <div className="text-[10px] text-slate-500">灵田上限</div>
                                <div className="text-sm font-bold text-sky-400">{currentLevel.maxPlots} 块</div>
                            </div>
                            <div className="bg-slate-900/50 rounded p-2">
                                <div className="text-[10px] text-slate-500">当前灵石</div>
                                <div className="text-sm font-bold text-amber-400">{money}</div>
                            </div>
                        </div>
                        {nextLevel && (
                            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500">
                                <ChevronRight className="w-3 h-3" />
                                下一阶 {nextLevel.name}（修炼+{Math.round(nextLevel.cultivationBonus * 100)}%，灵田{nextLevel.maxPlots}块，需要{nextLevel.upgradeCost}灵石）
                            </div>
                        )}
                    </div>

                    {currentLevel.maxPlots > 0 && (
                        <div>
                            <div className="text-xs text-slate-500 mb-2 font-bold flex items-center gap-2">
                                <Sprout className="w-3.5 h-3.5" />
                                灵田 ({abode.plots.filter(p => p.herbId).length}/{currentLevel.maxPlots})
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {Array.from({ length: currentLevel.maxPlots }, (_, i) => {
                                    const plot = abode.plots[i] || { herbId: null, growthMonths: 0, mature: false, mutated: false };
                                    const seed = plot.herbId ? HERB_SEEDS.find(s => s.id === plot.herbId) : null;
                                    const harvestItem = seed ? ITEMS[seed.harvestItemId] : null;
                                    return (
                                        <div key={i} className={`rounded-lg border p-3 transition-all ${selectedPlot === i ? 'border-emerald-500 bg-emerald-900/20' : plot.mature ? 'border-amber-500/50 bg-amber-900/10' : plot.herbId ? 'border-emerald-700/30 bg-slate-800/50' : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'}`}>
                                            {plot.herbId && seed ? (
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs font-bold text-slate-300">{seed.name}</span>
                                                        {plot.mutated && <Sparkles className="w-3 h-3 text-amber-400" />}
                                                    </div>
                                                    {plot.mature ? (
                                                        <div>
                                                            <div className="text-[10px] text-amber-400 mb-2">已成熟{plot.mutated ? '（变异）' : ''}</div>
                                                            <button onClick={() => handleHarvest(i)} className="w-full py-1.5 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs font-bold flex items-center justify-center gap-1">
                                                                <Shovel className="w-3 h-3" /> 收获 ({harvestItem?.name})
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <div className="text-[10px] text-slate-500 mb-1.5">生长中 {plot.growthMonths}/{seed.growthMonths} 月</div>
                                                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(100, (plot.growthMonths / seed.growthMonths) * 100)}%` }} />
                                                            </div>
                                                            <button onClick={() => handleClear(i)} className="mt-2 w-full py-1 bg-slate-800 hover:bg-red-900/30 text-slate-500 hover:text-red-400 rounded text-[10px] flex items-center justify-center gap-1 transition-colors">
                                                                <Trash2 className="w-2.5 h-2.5" /> 清除
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <button onClick={() => setSelectedPlot(selectedPlot === i ? null : i)} className="w-full text-center py-4">
                                                    <Sprout className="w-5 h-5 text-slate-600 mx-auto mb-1" />
                                                    <div className="text-[10px] text-slate-600">{selectedPlot === i ? '选择种子...' : '空地（点击种植）'}</div>
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {selectedPlot !== null && (
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-emerald-700/30">
                            <div className="text-xs text-slate-500 mb-2 font-bold">选择种子（消耗灵石购买）</div>
                            <div className="space-y-2">
                                {availableSeeds.map(seed => {
                                    const harvestItem = ITEMS[seed.harvestItemId];
                                    const canAfford = money >= seed.seedPrice;
                                    return (
                                        <button key={seed.id} onClick={() => handlePlant(seed.id)} disabled={!canAfford} className={`w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all ${canAfford ? 'border-slate-600 hover:border-emerald-500 hover:bg-emerald-900/10' : 'border-slate-700/30 opacity-50 cursor-not-allowed'}`}>
                                            <span className="text-base">{harvestItem?.icon || '药'}</span>
                                            <div className="flex-1 text-left">
                                                <div className="text-xs font-bold text-slate-300">{seed.name}</div>
                                                <div className="text-[10px] text-slate-500">{seed.growthMonths}月成熟 | 产出 {harvestItem?.name} x{seed.harvestMin}-{seed.harvestMax}</div>
                                            </div>
                                            <span className={`text-xs font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>{seed.seedPrice} 灵石</span>
                                        </button>
                                    );
                                })}
                                {availableSeeds.length === 0 && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 py-2">
                                        <Lock className="w-3 h-3" /> 升级洞府以解锁更多种子。
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {actionMsg && <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-xs text-slate-400">{actionMsg}</div>}

                    {currentLevel.maxPlots === 0 && (
                        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-lg p-6 text-center text-xs text-slate-500">
                            你的洞府尚未开辟灵田。继续提升境界和洞府等级后，可开启种植功能。
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
