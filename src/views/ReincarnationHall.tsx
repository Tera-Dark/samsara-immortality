import { useMetaStore } from '../store/metaStore';
import { useUIStore } from '../store/uiStore';
import { META_UPGRADES } from '../data/meta';

export const ReincarnationHall = () => {
    const { metaState, purchaseUpgrade } = useMetaStore();

    const getCost = (upgrade: typeof META_UPGRADES[0], level: number) => {
        return upgrade.baseCost + (level * upgrade.costScale);
    };

    return (
        <div className="w-full h-full flex flex-col items-center relative overflow-hidden bg-void">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-100/40 via-void to-void pointer-events-none"></div>

            {/* Header */}
            <div className="shrink-0 pt-12 pb-6 text-center z-10 space-y-4 w-full flex flex-col items-center">
                <div className="text-xs font-mono text-amber-700 tracking-[0.5em] uppercase text-outlined">
                    命运节点
                </div>
                <h2 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-800 to-amber-500 tracking-widest" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                    轮回殿堂
                </h2>

                {/* Karma Display */}
                <div className="flex items-center gap-3 px-5 py-1.5 rounded-full bg-amber-50 border border-amber-300 backdrop-blur-sm mt-4 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-amber-800 font-bold font-mono tracking-widest text-lg text-outlined-strong">{metaState.karma}</span>
                    <span className="text-sm text-amber-600 tracking-widest text-outlined">轮回点</span>
                </div>
            </div>

            {/* Update List */}
            <div className="flex-1 w-full max-w-[1200px] px-6 pb-24 overflow-y-auto no-scrollbar z-10 mask-image-b">
                {/* Hint */}
                {metaState.karma === 0 && (
                    <div className="text-center mb-8 text-slate-600 font-serif tracking-widest text-sm bg-white py-2 rounded-lg border border-slate-200 mx-auto max-w-md text-outlined shadow-sm">
                        提示: 在游戏中度过一生，根据评分可获得轮回点。
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {META_UPGRADES.map(u => {
                        const level = metaState.unlockedUpgrades[u.id] || 0;
                        const cost = getCost(u, level);
                        const canAfford = metaState.karma >= cost;

                        return (
                            <div key={u.id} className="relative group bg-white border border-slate-200 hover:border-amber-300 rounded-xl p-6 transition-all duration-300 hover:bg-amber-50/30 hover:-translate-y-1 hover:shadow-lg flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-serif font-bold text-amber-800 tracking-widest group-hover:text-amber-600 transition-colors text-outlined-strong">{u.name}</h3>
                                    <div className="px-2.5 py-1 rounded-md text-xs font-mono text-amber-700 bg-amber-50 border border-amber-200 font-bold text-outlined">Lv.{level}</div>
                                </div>

                                <p className="text-sm text-slate-600 mb-6 leading-relaxed font-serif min-h-[3em] text-outlined">{u.desc}</p>

                                <div className="mt-auto space-y-4">
                                    <div className="text-sm font-mono flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                                        <span className="text-slate-500 text-outlined">当前效果</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-700 text-outlined">{u.effectDesc(level)}</span>
                                            <span className="text-slate-400">→</span>
                                            <span className="text-emerald-600 font-bold text-outlined-strong">{u.effectDesc(level + 1)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => purchaseUpgrade(u.id, cost)}
                                        disabled={!canAfford}
                                        className={`w-full py-3 rounded-lg border text-sm tracking-[0.3em] font-serif font-bold transition-all duration-300 relative overflow-hidden group/btn text-outlined-strong
                                            ${canAfford
                                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 border-amber-400 text-white hover:from-amber-600 hover:to-amber-700 hover:shadow-lg cursor-pointer'
                                                : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-2 relative z-10">
                                            <span>升级消耗</span>
                                            <span className="font-mono">{cost}</span>
                                        </div>
                                        {canAfford && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Back Button */}
            <div className="absolute bottom-6 z-20 w-full px-6 flex justify-between items-end pointer-events-none">
                <button
                    onClick={() => useUIStore.getState().setScene('MENU')}
                    className="pointer-events-auto flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-400 hover:shadow-md transition-all duration-300 backdrop-blur-md group text-outlined"
                >
                    <span className="group-hover:-translate-x-1 transition-transform">←</span>
                    <span className="text-sm font-mono tracking-widest">返回主菜单</span>
                </button>

            </div>
        </div>
    );
};
