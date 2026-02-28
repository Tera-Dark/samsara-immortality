import { useCreationStore } from '../store/creationStore';
import { useMetaStore } from '../store/metaStore';
import { useUIStore } from '../store/uiStore';
import { TalentCard } from './TalentCard';



export const TalentSelect = () => {
    const { availableTalents, selectedTalentIds, selectTalent, confirmTalents, talentResetCount, resetTalents } = useCreationStore();
    const metaState = useMetaStore(s => s.metaState);
    const canConfirm = selectedTalentIds.length === 3;

    // Calculate reset cost/limits
    const maxResets = 3 + (metaState.unlockedUpgrades['meta_resets'] || 0);
    const resetsRemaining = Math.max(0, maxResets - talentResetCount);

    return (
        <div className="w-full h-full flex flex-col items-center relative overflow-hidden bg-void">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-emerald-100/30 via-void to-void pointer-events-none"></div>

            {/* Header */}
            <div className="shrink-0 pt-12 pb-6 text-center z-10 w-full flex flex-col items-center">
                <div className="text-xs font-mono text-emerald-500 tracking-[0.5em] uppercase opacity-60">
                    逆天改命
                </div>
                <h2 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 tracking-widest" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                    先天命格
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent mt-4"></div>
            </div>

            {/* Counter */}
            <div className="shrink-0 flex justify-center items-baseline gap-2 mb-6 z-10">
                <span className="text-xs text-slate-500 font-mono tracking-widest uppercase text-outlined">已选命格</span>
                <span className={`text-xl font-mono font-bold transition-colors duration-300 ${canConfirm ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {selectedTalentIds.length}
                </span>
                <span className="text-slate-600 font-mono">/</span>
                <span className="text-slate-600 font-mono">3</span>
            </div>

            {/* Main Content Area - Grid */}
            <div className="flex-1 w-full max-w-[1200px] px-6 pb-24 overflow-y-auto no-scrollbar z-10 mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {availableTalents.map(t => (
                        <TalentCard
                            key={t.id}
                            talent={t}
                            selected={selectedTalentIds.includes(t.id)}
                            onClick={() => selectTalent(t.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Footer / Controls */}
            <div className="absolute bottom-6 z-20 w-full px-6 flex justify-between items-center pointer-events-none max-w-[1200px] mx-auto left-1/2 -translate-x-1/2">
                {/* Back Button */}
                <button
                    onClick={() => useUIStore.getState().setScene('MENU')}
                    className="pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:shadow-md transition-all duration-300 backdrop-blur-md group text-outlined"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-sm font-mono tracking-widest">重返轮回</span>
                </button>

                <div className="flex gap-4 pointer-events-auto">
                    {/* Reset Button */}
                    <button
                        onClick={resetTalents}
                        disabled={resetsRemaining <= 0}
                        className={`flex items-center gap-2 px-6 py-2 rounded-full border text-sm font-mono tracking-widest transition-all duration-300 backdrop-blur-md
                            ${resetsRemaining > 0
                                ? 'bg-white/60 border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 hover:border-slate-400'
                                : 'bg-white border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <svg className={`w-3.5 h-3.5 ${resetsRemaining > 0 ? 'group-hover:rotate-180 transition-transform' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        <span>重置 ({resetsRemaining}/{maxResets})</span>
                    </button>

                    {/* Confirm Button */}
                    <button
                        onClick={confirmTalents}
                        disabled={!canConfirm}
                        className={`flex items-center gap-2 px-8 py-2 rounded-full border text-sm font-serif font-bold tracking-[0.2em] transition-all duration-300 backdrop-blur-md shadow-lg
                            ${canConfirm
                                ? 'bg-emerald-600 border-emerald-400 text-white hover:bg-emerald-500 hover:shadow-lg'
                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        <span>确认天命</span>
                        {canConfirm && <span className="animate-pulse">→</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};
