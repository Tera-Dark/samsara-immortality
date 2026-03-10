import { useMemo } from 'react';
import { useCreationStore } from '../store/creationStore';
import { useUIStore } from '../store/uiStore';
import { XianxiaConfig } from '../modules/xianxia/config';

// 属性配色方案 - 保持一致但优化细节
const STAT_THEMES: Record<string, { symbol: string; gradient: string; barColor: string; glowColor: string; symbolColor: string; label: string }> = {
    STR: { symbol: '力', label: '武', gradient: 'from-amber-700 to-red-600', barColor: 'bg-gradient-to-r from-red-400 to-red-500', glowColor: 'rgba(220,38,38,0.3)', symbolColor: 'text-red-700 border-red-200 bg-red-50' },
    MND: { symbol: '神', label: '识', gradient: 'from-cyan-700 to-blue-600', barColor: 'bg-gradient-to-r from-cyan-400 to-blue-500', glowColor: 'rgba(6,182,212,0.3)', symbolColor: 'text-cyan-700 border-cyan-200 bg-cyan-50' },
    INT: { symbol: '智', label: '悟', gradient: 'from-violet-700 to-indigo-600', barColor: 'bg-gradient-to-r from-indigo-400 to-indigo-500', glowColor: 'rgba(99,102,241,0.3)', symbolColor: 'text-indigo-700 border-indigo-200 bg-indigo-50' },
    POT: { symbol: '根', label: '骨', gradient: 'from-emerald-700 to-teal-600', barColor: 'bg-gradient-to-r from-emerald-400 to-teal-500', glowColor: 'rgba(16,185,129,0.3)', symbolColor: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    CHR: { symbol: '魅', label: '颜', gradient: 'from-rose-700 to-pink-600', barColor: 'bg-gradient-to-r from-rose-400 to-pink-500', glowColor: 'rgba(236,72,153,0.3)', symbolColor: 'text-rose-700 border-rose-200 bg-rose-50' },
    LUCK: { symbol: '运', label: '道', gradient: 'from-yellow-700 to-amber-500', barColor: 'bg-gradient-to-r from-amber-400 to-yellow-500', glowColor: 'rgba(245,158,11,0.3)', symbolColor: 'text-amber-700 border-amber-200 bg-amber-50' },
};

const TOTAL_POINTS = 24;

export const StatAlloc = () => {
    const { allocStats, availablePoints, updateStat, confirmStats } = useCreationStore();

    // 筛选基础属性
    const baseStats = useMemo(() => {
        return XianxiaConfig.stats.filter(s => s.visible && ['STR', 'MND', 'INT', 'POT', 'CHR', 'LUCK'].includes(s.id));
    }, []);

    const usedPoints = TOTAL_POINTS - availablePoints;
    const canConfirm = availablePoints <= 0;

    return (
        <div className="w-full h-full flex flex-col items-center relative overflow-hidden bg-void">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-sky-100/30 via-void to-void pointer-events-none"></div>

            {/* Header */}
            <div className="shrink-0 pt-12 pb-6 text-center z-10 w-full flex flex-col items-center">
                <div className="text-xs font-mono text-sky-500 tracking-[0.5em] uppercase opacity-60">
                    先天造化
                </div>
                <h2 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 tracking-widest" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                    属性分配
                </h2>
            </div>

            {/* Points Pool */}
            <div className="shrink-0 mb-8 z-10 flex flex-col items-center">
                <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-serif tracking-widest text-sm">可用点数</span>
                    <span className={`text-4xl font-bold transition-all duration-300 ${availablePoints > 0 ? 'text-sky-400 text-glow' : 'text-slate-600'}`}>
                        {availablePoints}
                    </span>
                </div>
                {/* Progress Line */}
                <div className="w-64 h-1 bg-slate-200 rounded-full mt-2 overflow-hidden relative">
                    <div className="absolute inset-0 bg-sky-100"></div>
                    <div
                        className="h-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${(usedPoints / TOTAL_POINTS) * 100}%` }}
                    />
                </div>
            </div>

            {/* Stat Grid */}
            <div className="flex-1 w-full max-w-[800px] px-8 overflow-y-auto no-scrollbar z-10 mx-auto">
                <div className="space-y-4">
                    {baseStats.map(stat => {
                        const theme = STAT_THEMES[stat.id] || STAT_THEMES.STR;
                        const value = allocStats[stat.id] || 0;

                        return (
                            <div key={stat.id} className="group flex items-center gap-6 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100/40 hover:border-slate-300 transition-all duration-300">
                                {/* Icon */}
                                <div className={`w-12 h-12 shrink-0 rounded-lg flex items-center justify-center text-xl font-serif font-bold ${theme.symbolColor} shadow-sm border`}>
                                    {theme.label}
                                </div>

                                {/* Info & Bar */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-baseline mb-2">
                                        <span className="text-lg font-serif font-bold text-slate-700 tracking-widest text-outlined-strong shrink-0 whitespace-nowrap">{stat.name}</span>
                                        <span className="text-sm text-slate-500 ml-4 leading-relaxed">{stat.description}</span>
                                    </div>
                                    <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-200 relative">
                                        <div
                                            className={`h-full ${theme.barColor} transition-all duration-300 relative`}
                                            style={{ width: `${Math.min(100, (value / 30) * 100)}%` }} // Visualizing up to 30 for alloc phase
                                        >
                                            <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/50 blur-[1px]"></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex items-center gap-3 shrink-0 bg-slate-50 rounded-lg p-1 border border-slate-200">
                                    <button
                                        onClick={() => updateStat(stat.id, -1)}
                                        disabled={value <= 0}
                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-white transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-lg leading-none pb-0.5"
                                    >−</button>
                                    <span className="w-8 text-center font-bold text-lg text-slate-700">{value}</span>
                                    <button
                                        onClick={() => updateStat(stat.id, 1)}
                                        disabled={availablePoints <= 0}
                                        className="w-8 h-8 flex items-center justify-center rounded hover:bg-emerald-500/20 text-emerald-500 hover:text-emerald-400 transition-colors disabled:opacity-20 disabled:cursor-not-allowed text-lg leading-none pb-0.5"
                                    >+</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 z-20 w-full px-6 flex justify-between items-center pointer-events-none max-w-[1200px] mx-auto left-1/2 -translate-x-1/2">
                {/* Back Button */}
                <button
                    onClick={() => useUIStore.getState().setScene('TALENT')}
                    className="pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:shadow-md transition-all duration-300 backdrop-blur-md group text-outlined"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-sm font-mono tracking-widest">重选命格</span>
                </button>

                <div className="flex gap-4 pointer-events-auto">
                    {/* Auto Alloc */}
                    <div className="flex bg-white/60 rounded-full border border-slate-200 backdrop-blur-md overflow-hidden p-1">
                        <button
                            onClick={() => useCreationStore.getState().autoAllocate('RANDOM')}
                            className="px-5 py-1.5 rounded-full text-sm font-serif tracking-wider text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors text-outlined"
                        >
                            随缘
                        </button>
                        <button
                            onClick={() => useCreationStore.getState().autoAllocate('AVG')}
                            className="px-5 py-1.5 rounded-full text-sm font-serif tracking-wider text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors text-outlined"
                        >
                            中庸
                        </button>
                    </div>

                    <button
                        onClick={confirmStats}
                        disabled={!canConfirm}
                        className={`flex items-center gap-2 px-10 py-2 rounded-full border text-sm font-serif font-bold tracking-[0.2em] transition-all duration-300 backdrop-blur-md shadow-lg
                            ${canConfirm
                                ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500 hover:shadow-lg'
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span>开始推演</span>
                        {canConfirm && <span className="animate-pulse">→</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
