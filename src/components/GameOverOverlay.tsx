import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useMetaStore } from '../store/metaStore';
import { useUIStore } from '../store/uiStore';
import { Skull, Sparkles, ScrollText, ArrowRight } from 'lucide-react';

export const GameOverOverlay = () => {
    const gameState = useGameStore(s => s.gameState);
    const { addKarma } = useMetaStore();
    const setScene = useUIStore(s => s.setScene);
    const [calculatedKarma, setCalculatedKarma] = useState(0);
    const [animationStep, setAnimationStep] = useState(0);
    const [statsTotal, setStatsTotal] = useState(0);

    useEffect(() => {
        // Calculate Score
        let score = 10; // Base Karma

        // Age Score (1 point per 5 years)
        const ageYears = Math.floor(gameState.age / 12);
        score += Math.floor(ageYears / 5);

        // Stats Score (1 point per 5 total stats)
        const currentTotalStats = Object.values(gameState.attributes || {}).reduce((a, b) => Number(a) + Number(b), 0);
        setStatsTotal(currentTotalStats);
        score += Math.floor(currentTotalStats / 5);

        // Apply Karma Multiplier from Meta Upgrades
        const karmaBoostLevel = useMetaStore.getState().metaState.unlockedUpgrades['meta_karma_boost'] || 0;
        const multiplier = 1 + (karmaBoostLevel * 0.1);

        const finalKarma = Math.floor(score * multiplier);
        setCalculatedKarma(finalKarma);

        // Reward Karma (only once)
        addKarma(finalKarma);

        // Sequence Animations
        const t1 = setTimeout(() => setAnimationStep(1), 500);
        const t2 = setTimeout(() => setAnimationStep(2), 1500);
        const t3 = setTimeout(() => setAnimationStep(3), 2500);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleReincarnate = () => {
        setScene('MENU');
    };

    return (
        <div className="absolute inset-0 z-[100] bg-void/90 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto no-scrollbar">
            <div className={`max-w-xl w-full flex flex-col items-center transition-all duration-1000 ${animationStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

                {/* Header */}
                <div className="flex flex-col items-center mb-10 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                        <Skull className="w-10 h-10 text-slate-400" />
                    </div>
                    <div className="text-sm font-mono tracking-[0.5em] text-slate-500 mb-4">
                        道 消 身 死
                    </div>
                    <h1 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-500 tracking-widest text-outlined-strong">
                        轮回流转
                    </h1>
                </div>

                {/* Main Stats Card */}
                <div className={`w-full bg-slate-900 border border-slate-700/50 rounded-2xl p-6 md:p-8 mb-8 shadow-2xl transition-all duration-1000 delay-300 relative overflow-hidden ${animationStep >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                    {/* Background decor */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-amber-500/5 rounded-full blur-[40px]"></div>
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-40 h-40 bg-slate-500/10 rounded-full blur-[50px]"></div>

                    <div className="relative z-10 space-y-6">
                        {/* Life Stats */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-black/20 p-4 rounded-xl border border-slate-800/50">
                                <div className="text-xs text-slate-500 tracking-wider mb-2">享年</div>
                                <div className="text-2xl text-slate-300 font-serif">
                                    {Math.floor(gameState.age / 12)} <span className="text-sm text-slate-500">岁</span>
                                </div>
                            </div>
                            <div className="bg-black/20 p-4 rounded-xl border border-slate-800/50">
                                <div className="text-xs text-slate-500 tracking-wider mb-2">最高道行</div>
                                <div className="text-2xl text-slate-300 font-mono tracking-wider">
                                    {statsTotal} <span className="text-sm text-slate-500 font-sans">点</span>
                                </div>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="border-t border-slate-800/50 pt-5 mt-2">
                            <div className="flex items-center gap-2 mb-3">
                                <ScrollText className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-400 tracking-wider">生平卷宗</span>
                            </div>
                            <div className="bg-black/40 rounded-lg p-4 text-sm text-slate-400 leading-relaxed font-serif italic line-clamp-3">
                                {gameState.history.length > 0
                                    ? gameState.history.slice(-3).map((h, i) => <div key={i} className="mb-1">{h}</div>)
                                    : "平淡无奇的一生，犹如朝露。"}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Karma Award */}
                <div className={`w-full bg-gradient-to-r from-amber-900/10 via-amber-600/10 to-transparent border border-amber-500/20 rounded-2xl p-6 mb-8 flex items-center justify-between transition-all duration-1000 delay-500 relative overflow-hidden ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400/0 via-amber-400/50 to-amber-400/0"></div>

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-amber-500" />
                        </div>
                        <div>
                            <div className="text-xs text-amber-500/70 tracking-widest mb-1">天道反哺</div>
                            <div className="text-slate-300 text-sm">凝聚真灵，提取轮回点</div>
                        </div>
                    </div>

                    <div className="text-right relative z-10">
                        <div className="text-xs text-slate-500 mb-1">本次获得</div>
                        <div className="text-3xl font-mono font-bold text-amber-500 text-glow-amber">
                            +{calculatedKarma}
                        </div>
                    </div>
                </div>

                {/* Reincarnate Button */}
                <button
                    onClick={handleReincarnate}
                    className={`group w-full md:w-auto px-10 py-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-slate-500 rounded-full transition-all duration-300 flex items-center justify-center gap-3 ${animationStep >= 3 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
                    <span className="text-slate-300 font-serif tracking-widest">再入轮回</span>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1 transition-all" />
                </button>
            </div>
        </div>
    );
};
