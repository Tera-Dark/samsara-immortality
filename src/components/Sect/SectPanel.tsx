import React, { useState, useMemo } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SECTS } from '../../data/sects';
import { ITEMS } from '../../data/items';
import { SectSystem } from '../../engine/systems/SectSystem';
import { AchievementSystem } from '../../engine/systems/AchievementSystem';
import {
    Shield, X, Swords, ShoppingBag, Star, LogOut,
    ChevronRight, CheckCircle2, XCircle, Award
} from 'lucide-react';

interface SectPanelProps {
    onClose: () => void;
}

const ALIGNMENT_LABELS = {
    RIGHTEOUS: { text: '正道', color: 'text-sky-400', bg: 'bg-sky-900/20' },
    DEMONIC: { text: '魔道', color: 'text-red-400', bg: 'bg-red-900/20' },
    NEUTRAL: { text: '中立', color: 'text-amber-400', bg: 'bg-amber-900/20' },
};

export const SectPanel: React.FC<SectPanelProps> = ({ onClose }) => {
    const { engine } = useGameStore();
    const [actionMsg, setActionMsg] = useState<string | null>(null);
    const [selectedSectId, setSelectedSectId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'missions' | 'shop'>('missions');

    const sectState = useMemo(() => (engine ? SectSystem.getSectState(engine) : null), [engine]);
    const currentSect = sectState ? SECTS.find(s => s.id === sectState.id) : null;

    const refreshState = () => {
        AchievementSystem.checkAll(engine);
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleJoin = (sectId: string) => {
        if (!engine) return;
        const result = engine.joinSectNew(sectId);
        setActionMsg(result.message);
        if (result.success) refreshState();
    };

    const handleLeave = () => {
        if (!engine) return;
        const result = engine.leaveSect();
        setActionMsg(result.message);
        if (result.success) refreshState();
    };

    const handleMission = (missionId: string) => {
        if (!engine) return;
        const result = engine.doSectMission(missionId);
        setActionMsg(result.message);
        refreshState();
    };

    const handleExchange = (itemId: string) => {
        if (!engine) return;
        const result = engine.exchangeSectItem(itemId);
        setActionMsg(result.message);
        if (result.success) refreshState();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-bold text-slate-100">{currentSect ? currentSect.name : '宗门势力'}</h2>
                        {sectState && currentSect && (
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                {currentSect.ranks[sectState.rankIdx]?.title} | 贡献: {sectState.contribution}
                            </span>
                        )}
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {!sectState ? (
                        <div className="p-6 space-y-4">
                            <p className="text-xs text-slate-500 mb-4">你目前是散修，选择一个宗门加入以获取功法、丹方和任务支持。</p>
                            {SECTS.map(sect => {
                                const check = engine ? SectSystem.canJoin(engine, sect.id) : { canDo: false, reasons: [] };
                                const align = ALIGNMENT_LABELS[sect.alignment];
                                const isSelected = selectedSectId === sect.id;
                                return (
                                    <div key={sect.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg overflow-hidden">
                                        <button onClick={() => setSelectedSectId(isSelected ? null : sect.id)} className="w-full p-4 text-left hover:bg-slate-800 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-base font-bold text-slate-200">{sect.name}</span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${align.bg} ${align.color}`}>{align.text}</span>
                                                    {sect.tags.map(tag => (
                                                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">{tag}</span>
                                                    ))}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {check.canDo ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                                                    <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-500">{sect.description}</p>
                                        </button>

                                        {isSelected && (
                                            <div className="border-t border-slate-700/50 p-4 space-y-3">
                                                <div className="flex gap-2 flex-wrap">
                                                    {sect.ranks.map((r, i) => (
                                                        <div key={i} className="text-[10px] bg-slate-900/50 px-2 py-1 rounded border border-slate-700/50">
                                                            <span className="text-slate-400">{r.title}</span>
                                                            <span className="text-slate-600 ml-1">({r.minContribution}贡献)</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                {check.canDo ? (
                                                    <button onClick={() => handleJoin(sect.id)} className="w-full py-2 bg-blue-700 hover:bg-blue-600 text-white rounded text-sm font-bold transition-all">
                                                        拜入 {sect.name}
                                                    </button>
                                                ) : (
                                                    <div className="text-xs text-red-400">不满足条件：{check.reasons.join('、')}</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : currentSect ? (
                        <div className="flex flex-col">
                            <div className="p-6 border-b border-slate-700/50">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-200">{currentSect.name}</h3>
                                        <p className="text-xs text-slate-500 mt-1">{currentSect.description}</p>
                                    </div>
                                    <button onClick={handleLeave} className="flex items-center gap-1 px-3 py-1.5 rounded bg-slate-800 hover:bg-red-900/30 text-slate-500 hover:text-red-400 text-xs transition-colors">
                                        <LogOut className="w-3 h-3" /> 退出宗门
                                    </button>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div className="bg-slate-800/50 rounded p-2">
                                        <div className="text-[10px] text-slate-500">当前职位</div>
                                        <div className="text-sm font-bold text-sky-400 flex items-center justify-center gap-1">
                                            <Award className="w-3 h-3" /> {currentSect.ranks[sectState.rankIdx]?.title}
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded p-2">
                                        <div className="text-[10px] text-slate-500">贡献点</div>
                                        <div className="text-sm font-bold text-amber-400">{sectState.contribution}</div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded p-2">
                                        <div className="text-[10px] text-slate-500">任务状态</div>
                                        <div className={`text-sm font-bold ${sectState.missionDoneThisMonth ? 'text-slate-500' : 'text-emerald-400'}`}>
                                            {sectState.missionDoneThisMonth ? '本月已完成' : '可接取'}
                                        </div>
                                    </div>
                                </div>
                                {sectState.rankIdx < currentSect.ranks.length - 1 && (
                                    <div className="mt-3">
                                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                            <span>晋升进度</span>
                                            <span>{sectState.contribution} / {currentSect.ranks[sectState.rankIdx + 1].minContribution}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${Math.min(100, (sectState.contribution / currentSect.ranks[sectState.rankIdx + 1].minContribution) * 100)}%` }} />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex border-b border-slate-700/50">
                                <button onClick={() => setActiveTab('missions')} className={`flex-1 py-2 text-xs font-bold text-center transition-colors ${activeTab === 'missions' ? 'text-sky-400 border-b-2 border-sky-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <Swords className="w-3.5 h-3.5 inline mr-1" /> 宗门任务
                                </button>
                                <button onClick={() => setActiveTab('shop')} className={`flex-1 py-2 text-xs font-bold text-center transition-colors ${activeTab === 'shop' ? 'text-amber-400 border-b-2 border-amber-400' : 'text-slate-500 hover:text-slate-300'}`}>
                                    <ShoppingBag className="w-3.5 h-3.5 inline mr-1" /> 贡献兑换
                                </button>
                            </div>

                            <div className="p-6 space-y-3">
                                {activeTab === 'missions'
                                    ? currentSect.missions.map(mission => {
                                        const canDo = sectState.rankIdx >= mission.minRankIdx && !sectState.missionDoneThisMonth;
                                        const locked = sectState.rankIdx < mission.minRankIdx;
                                        return (
                                            <div key={mission.id} className={`p-3 rounded-lg border transition-all ${locked ? 'border-slate-700/30 opacity-50' : canDo ? 'border-slate-600 hover:border-sky-500' : 'border-slate-700/50'}`}>
                                                <div className="flex items-center justify-between mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <Swords className="w-3.5 h-3.5 text-slate-500" />
                                                        <span className="text-sm font-bold text-slate-300">{mission.name}</span>
                                                        {locked && <span className="text-[10px] text-red-400">(需 {currentSect.ranks[mission.minRankIdx]?.title})</span>}
                                                    </div>
                                                    <span className="text-[10px] text-slate-500">{mission.timeCostDays}天</span>
                                                </div>
                                                <p className="text-[10px] text-slate-500 mb-2">{mission.description}</p>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-3 text-[10px] text-slate-500">
                                                        <span>贡献 <span className="text-sky-400 font-bold">+{mission.contributionReward}</span></span>
                                                        <span>灵石 <span className="text-amber-400 font-bold">+{mission.moneyReward}</span></span>
                                                        <span>成功率 <span className={`font-bold ${mission.successRate >= 0.8 ? 'text-emerald-400' : mission.successRate >= 0.6 ? 'text-amber-400' : 'text-red-400'}`}>{Math.round(mission.successRate * 100)}%</span></span>
                                                    </div>
                                                    <button onClick={() => handleMission(mission.id)} disabled={!canDo} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${canDo ? 'bg-sky-700 hover:bg-sky-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                                                        执行
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                    : currentSect.shopItems.map(si => {
                                        const itemDef = ITEMS[si.itemId];
                                        const canAfford = sectState.contribution >= si.contributionCost;
                                        return (
                                            <div key={si.itemId} className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${canAfford ? 'border-slate-600 hover:border-amber-500' : 'border-slate-700/30 opacity-60'}`}>
                                                <span className="text-base w-6 text-center">{itemDef?.icon || '?'}</span>
                                                <div className="flex-1">
                                                    <div className="text-xs font-bold text-slate-300">{itemDef?.name || si.itemId}</div>
                                                    <div className="text-[10px] text-slate-500 truncate">{itemDef?.description}</div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-xs font-bold ${canAfford ? 'text-amber-400' : 'text-red-400'}`}>
                                                        <Star className="w-3 h-3 inline" /> {si.contributionCost}
                                                    </span>
                                                    <button onClick={() => handleExchange(si.itemId)} disabled={!canAfford} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${canAfford ? 'bg-amber-700 hover:bg-amber-600 text-white' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}>
                                                        兑换
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    ) : null}

                    {actionMsg && <div className="mx-6 mb-6 bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 text-xs text-slate-400">{actionMsg}</div>}
                </div>
            </div>
        </div>
    );
};
