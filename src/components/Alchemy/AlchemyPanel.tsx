import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ALCHEMY_RECIPES, PILL_QUALITY_LABELS, type PillQuality } from '../../data/alchemy';
import { ITEMS } from '../../data/items';
import { AlchemySystem } from '../../engine/systems/AlchemySystem';
import { AchievementSystem } from '../../engine/systems/AchievementSystem';
import { FlaskConical, X, Flame, CheckCircle2, XCircle, Sparkles, AlertTriangle } from 'lucide-react';

interface AlchemyPanelProps {
    onClose: () => void;
}

const QUALITY_COLORS: Record<PillQuality, string> = {
    WASTE: 'text-slate-400',
    COMMON: 'text-emerald-400',
    GOOD: 'text-blue-400',
    PERFECT: 'text-amber-400',
};

const RARITY_BORDER: Record<string, string> = {
    COMMON: 'border-slate-500/50',
    UNCOMMON: 'border-emerald-500/50',
    RARE: 'border-blue-500/50',
    EPIC: 'border-purple-500/50',
    LEGENDARY: 'border-amber-500/50',
};

export const AlchemyPanel: React.FC<AlchemyPanelProps> = ({ onClose }) => {
    const { engine, gameState } = useGameStore();
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [lastResult, setLastResult] = useState<{ success: boolean; quality?: PillQuality; message: string } | null>(null);
    const [isRefining, setIsRefining] = useState(false);

    const realmIdx = gameState.realm_idx || 0;
    const hasAlchemy = gameState.flags.includes('HAS_ALCHEMY');

    const availableRecipes = useMemo(() => ALCHEMY_RECIPES.filter(r => r.minRealmIdx <= realmIdx), [realmIdx]);
    const selectedRecipe = availableRecipes.find(r => r.id === selectedRecipeId) || null;

    const materialCheck = useMemo(() => {
        if (!selectedRecipe || !engine) return { canDo: false, missing: [] as string[] };
        return AlchemySystem.canRefine(engine, selectedRecipe.id);
    }, [selectedRecipe, engine]);

    const successRate = useMemo(() => {
        if (!selectedRecipe || !engine) return 0;
        return AlchemySystem.calculateSuccessRate(engine, selectedRecipe);
    }, [selectedRecipe, engine]);

    const handleRefine = () => {
        if (!selectedRecipe || !engine) return;
        setIsRefining(true);

        setTimeout(() => {
            const result = engine.refineAlchemy(selectedRecipe.id);
            setLastResult({
                success: result.success,
                quality: result.quality,
                message: result.message,
            });
            setIsRefining(false);
            AchievementSystem.checkAll(engine);
            useGameStore.setState({ gameState: { ...engine.state } });
        }, 800);
    };

    const proficiency = gameState.attributes.ALCHEMY_PROF || 0;

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <FlaskConical className="w-5 h-5 text-orange-400" />
                        <h2 className="text-lg font-bold text-slate-100">炼丹术</h2>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">熟练度 {proficiency}</span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {!hasAlchemy ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
                        <h3 className="text-lg font-bold text-slate-300 mb-2">丹道未启</h3>
                        <p className="text-sm text-slate-500 max-w-md">
                            你尚未领悟炼丹之道。需要达到炼气期，并尝试执行“炼丹”行动后才能开启此功能。
                        </p>
                    </div>
                ) : (
                    <div className="flex-1 flex overflow-hidden">
                        <div className="w-72 border-r border-slate-700 flex flex-col">
                            <div className="p-3 border-b border-slate-700/50">
                                <div className="text-xs text-slate-500">可用丹方 ({availableRecipes.length}/{ALCHEMY_RECIPES.length})</div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                                {availableRecipes.map(recipe => {
                                    const resultItem = ITEMS[recipe.resultItemId];
                                    const isSelected = selectedRecipeId === recipe.id;
                                    const check = AlchemySystem.canRefine(engine, recipe.id);
                                    return (
                                        <button
                                            key={recipe.id}
                                            onClick={() => {
                                                setSelectedRecipeId(recipe.id);
                                                setLastResult(null);
                                            }}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${isSelected ? 'bg-orange-900/30 border border-orange-500/50 shadow-lg' : 'bg-slate-800/50 border border-transparent hover:bg-slate-800 hover:border-slate-600'}`}
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-base ${RARITY_BORDER[resultItem?.rarity || 'COMMON'].replace('border', 'text').replace('/50', '')}`}>{resultItem?.icon || '丹'}</span>
                                                <span className="text-sm font-bold text-slate-200 truncate">{recipe.name}</span>
                                                {check.canDo ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-auto" /> : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0 ml-auto" />}
                                            </div>
                                            <div className="text-[10px] text-slate-500 truncate">{resultItem?.name || recipe.resultItemId} x{recipe.resultCount}</div>
                                        </button>
                                    );
                                })}
                                {availableRecipes.length === 0 && <div className="text-center text-xs text-slate-600 py-8 italic">尚无可用丹方</div>}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
                            {selectedRecipe ? (
                                <div className="p-6 space-y-5">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-100 mb-2">{selectedRecipe.name}</h3>
                                        <p className="text-sm text-slate-400 leading-relaxed">{selectedRecipe.description}</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                                            <div className="text-[10px] text-slate-500 mb-1">难度系数</div>
                                            <div className={`text-lg font-bold ${selectedRecipe.difficulty >= 70 ? 'text-red-400' : selectedRecipe.difficulty >= 40 ? 'text-amber-400' : 'text-emerald-400'}`}>{selectedRecipe.difficulty}</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                                            <div className="text-[10px] text-slate-500 mb-1">成功率</div>
                                            <div className={`text-lg font-bold ${successRate >= 0.7 ? 'text-emerald-400' : successRate >= 0.4 ? 'text-amber-400' : 'text-red-400'}`}>{Math.round(successRate * 100)}%</div>
                                        </div>
                                        <div className="bg-slate-800/50 rounded-lg p-3 text-center border border-slate-700/50">
                                            <div className="text-[10px] text-slate-500 mb-1">耗时</div>
                                            <div className="text-lg font-bold text-sky-400">{selectedRecipe.timeCostDays}天</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-bold">所需材料</div>
                                        <div className="space-y-2">
                                            {selectedRecipe.materials.map((mat, i) => {
                                                const itemDef = ITEMS[mat.itemId];
                                                const slot = gameState.inventory.find(s => s.itemId === mat.itemId);
                                                const have = slot?.count || 0;
                                                const enough = have >= mat.count;
                                                return (
                                                    <div key={i} className={`flex items-center gap-3 p-2.5 rounded-lg border ${enough ? 'bg-emerald-900/10 border-emerald-700/30' : 'bg-red-900/10 border-red-700/30'}`}>
                                                        <span className="text-base w-6 text-center">{itemDef?.icon || '?'}</span>
                                                        <span className="text-sm text-slate-300 flex-1">{itemDef?.name || mat.itemId}</span>
                                                        <span className={`text-sm font-bold ${enough ? 'text-emerald-400' : 'text-red-400'}`}>{have} / {mat.count}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-slate-500 mb-2 font-bold">预期产出</div>
                                        <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                            <span className="text-xl">{ITEMS[selectedRecipe.resultItemId]?.icon || '丹'}</span>
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-200">{ITEMS[selectedRecipe.resultItemId]?.name || selectedRecipe.resultItemId}</div>
                                                <div className="text-[10px] text-slate-500">基础产出 x{selectedRecipe.resultCount} | 极品额外 +1</div>
                                            </div>
                                            <div className="text-right text-[10px] text-slate-500">
                                                <div>熟练度 +{selectedRecipe.proficiencyGain}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {lastResult && (
                                        <div className={`p-4 rounded-lg border ${lastResult.success ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-red-900/20 border-red-500/30'}`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                {lastResult.success ? <Sparkles className={`w-4 h-4 ${QUALITY_COLORS[lastResult.quality || 'COMMON']}`} /> : <Flame className="w-4 h-4 text-red-400" />}
                                                <span className={`text-sm font-bold ${lastResult.success ? QUALITY_COLORS[lastResult.quality || 'COMMON'] : 'text-red-400'}`}>
                                                    {lastResult.success ? `炼丹成功 · ${PILL_QUALITY_LABELS[lastResult.quality || 'COMMON']}` : '炼丹失败 · 炉毁药散'}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-400 whitespace-pre-wrap">{lastResult.message}</div>
                                        </div>
                                    )}

                                    <button
                                        onClick={handleRefine}
                                        disabled={!materialCheck.canDo || isRefining}
                                        className={`w-full py-3 rounded-lg text-sm font-bold transition-all ${materialCheck.canDo && !isRefining ? 'bg-orange-700 hover:bg-orange-600 text-white shadow-lg' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        {isRefining ? '丹火升腾中...' : '开炉炼丹'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex-1 flex items-center justify-center text-slate-600 text-sm">从左侧选择一张丹方查看详情。</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
