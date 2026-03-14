/**
 * AchievementPanel — 成就浏览界面
 */

import React, { useMemo } from 'react';
import { useMetaStore } from '../../store/metaStore';
import { ACHIEVEMENTS, type AchievementCategory } from '../../data/achievements';
import { X, Trophy, Lock, CheckCircle2, Star } from 'lucide-react';

interface AchievementPanelProps {
    onClose: () => void;
}

const CATEGORY_LABELS: Record<AchievementCategory, { text: string; color: string }> = {
    CULTIVATION: { text: '修炼', color: 'text-purple-400' },
    COMBAT: { text: '战斗', color: 'text-red-400' },
    EXPLORATION: { text: '探索', color: 'text-emerald-400' },
    SURVIVAL: { text: '生存', color: 'text-amber-400' },
    REINCARNATION: { text: '轮回', color: 'text-sky-400' },
    COLLECTION: { text: '收集', color: 'text-yellow-400' },
    SOCIAL: { text: '社交', color: 'text-pink-400' },
};

export const AchievementPanel: React.FC<AchievementPanelProps> = ({ onClose }) => {
    const metaState = useMetaStore(s => s.metaState);

    const achievementData = useMemo(() => {
        const unlockedSet = new Set(metaState.achievements);
        return ACHIEVEMENTS.map(ach => ({
            ...ach,
            unlocked: unlockedSet.has(ach.id),
        }));
    }, [metaState.achievements]);

    const unlockedCount = achievementData.filter(a => a.unlocked).length;
    const totalCount = achievementData.length;

    // Group by category
    const grouped = useMemo(() => {
        const map = new Map<AchievementCategory, typeof achievementData>();
        for (const ach of achievementData) {
            const arr = map.get(ach.category) || [];
            arr.push(ach);
            map.set(ach.category, arr);
        }
        return map;
    }, [achievementData]);

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-bold text-slate-100">成就</h2>
                        <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                            {unlockedCount} / {totalCount}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-6 py-3 border-b border-slate-700/50">
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {Array.from(grouped.entries()).map(([category, achs]) => {
                        const cat = CATEGORY_LABELS[category];
                        return (
                            <div key={category}>
                                <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 ${cat.color}`}>
                                    {cat.text}
                                </h3>
                                <div className="space-y-2">
                                    {achs.map(ach => (
                                        <div
                                            key={ach.id}
                                            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                                ach.unlocked
                                                    ? 'border-amber-800/30 bg-amber-900/10'
                                                    : 'border-slate-700/30 bg-slate-800/20 opacity-60'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                ach.unlocked
                                                    ? 'bg-amber-500/20 text-amber-400'
                                                    : 'bg-slate-800 text-slate-600'
                                            }`}>
                                                {ach.unlocked ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold ${ach.unlocked ? 'text-slate-200' : 'text-slate-500'}`}>
                                                        {ach.hidden && !ach.unlocked ? '???' : ach.name}
                                                    </span>
                                                    {ach.unlocks && ach.unlocks.length > 0 && (
                                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-900/30 text-purple-400 shrink-0">
                                                            含解锁
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-slate-500 truncate">
                                                    {ach.hidden && !ach.unlocked ? '达成后揭晓' : ach.description}
                                                </p>
                                                {ach.unlocks && ach.unlocked && (
                                                    <div className="mt-1 flex gap-2 flex-wrap">
                                                        {ach.unlocks.map((u, i) => (
                                                            <span key={i} className="text-[9px] px-1.5 py-0.5 rounded bg-sky-900/20 text-sky-400">
                                                                {u.type === 'TALENT_POOL' ? `天赋池 G${u.grades?.join(',')}` :
                                                                 u.type === 'FEAT' ? `命格 ${u.fateId}` :
                                                                 `功能 ${u.featureId}`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs shrink-0">
                                                <Star className="w-3 h-3 text-amber-500" />
                                                <span className={ach.unlocked ? 'text-amber-400 font-bold' : 'text-slate-600'}>
                                                    +{ach.karmaReward}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
