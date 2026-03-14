import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS } from '../types';

export const BreakthroughOverlay = () => {
    const breakthroughMsg = useGameStore(s => s.breakthroughMsg);
    const ackBreakthrough = useGameStore(s => s.ackBreakthrough);
    const realmIdx = useGameStore(s => s.gameState.realm_idx);
    const [isVisible, setIsVisible] = useState(false);
    const isSuccess = breakthroughMsg?.includes('突破成功') || breakthroughMsg?.includes('踏入') || false;

    useEffect(() => {
        if (breakthroughMsg) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsVisible(true);
        }
    }, [breakthroughMsg]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            ackBreakthrough();
        }, 300); // Wait for fade out
    };

    if (!isVisible && !breakthroughMsg) return null;

    // Use current realm name. Note: When breakthrough happens, realm_idx is already updated.
    // So current `realmIdx` is the NEW realm.
    // We can show "晋升" -> REALMS[realmIdx]
    const realmName = REALMS[realmIdx];

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm backdrop-blur-sm transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            onClick={handleClose}
        >
            <div
                className={`relative max-w-lg w-full p-8 text-center transform transition-all duration-700 ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-10'}`}
                onClick={e => e.stopPropagation()}
            >
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/40 to-slate-900/80 rounded-2xl border border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.2)]"></div>

                {/* Decorative Elements */}
                <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-emerald-500/50"></div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-emerald-500/50"></div>

                {/* Content */}
                <div className="relative z-10">
                    <h2 className={`text-4xl font-serif font-bold text-transparent bg-clip-text mb-6 drop-shadow-lg tracking-widest ${isSuccess ? 'bg-gradient-to-r from-emerald-200 via-white to-emerald-200 animate-pulse-slow' : 'bg-gradient-to-r from-amber-200 via-white to-red-200'}`}>
                        {isSuccess ? '突破成功' : '气机震荡'}
                    </h2>

                    <div className="py-8">
                        <div className="text-xl text-slate-400 font-serif mb-2">{isSuccess ? '晋升为' : '当前境界'}</div>
                        <div className={`text-5xl font-serif font-bold animate-float ${isSuccess ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]' : 'text-amber-300 drop-shadow-[0_0_15px_rgba(252,211,77,0.45)]'}`}>
                            {realmName}
                        </div>
                    </div>

                    <p className="text-sm text-slate-200 font-mono bg-black/40 py-2 px-4 rounded inline-block border border-slate-200/30">
                        {breakthroughMsg}
                    </p>

                    <div className="mt-8">
                        <button
                            onClick={handleClose}
                            className={`px-8 py-3 border font-serif rounded-lg transition-all hover:scale-105 active:scale-95 ${isSuccess ? 'bg-emerald-600/20 hover:bg-emerald-600/40 border-emerald-500/50 text-emerald-100' : 'bg-amber-600/20 hover:bg-amber-600/40 border-amber-400/50 text-amber-100'}`}
                        >
                            {isSuccess ? '巩固境界' : '平复气息'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
