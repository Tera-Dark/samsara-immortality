import { useGameStore } from '../store/gameStore';
import { REALMS, CULTIVATION_REALMS } from '../types';

// Stat color mapping for visual distinction
const STAT_CONFIG: { key: string; label: string; color: string; bg: string }[] = [
    { key: 'STR', label: '体魄', color: 'text-red-400', bg: 'bg-red-500' },
    { key: 'INT', label: '悟性', color: 'text-sky-400', bg: 'bg-sky-500' },
    { key: 'POT', label: '资质', color: 'text-violet-400', bg: 'bg-violet-500' },
    { key: 'CHR', label: '魅力', color: 'text-pink-400', bg: 'bg-pink-500' },
    { key: 'LUCK', label: '气运', color: 'text-amber-400', bg: 'bg-amber-500' },
];

const StatBar = ({ label, value, color, bg, max = 30 }: { label: string; value: number; color: string; bg: string; max?: number }) => {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="flex items-center gap-2 py-1">
            <span className={`text-sm font-serif w-10 shrink-0 ${color} font-bold`}>{label}</span>
            <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${bg}`}
                    style={{ width: `${pct}%`, opacity: 0.7 }}
                />
            </div>
            <span className="text-sm font-mono text-slate-700 w-8 text-right font-bold">{value}</span>
        </div>
    );
};

export const StatsPanel = () => {
    const { gameState, engine } = useGameStore();

    const MAIN_STATS_KEYS = ['STR', 'INT', 'POT', 'CHR', 'LUCK'];

    // 额外属性
    const extraStats = engine.moduleConfig.stats.filter(s =>
        s.visible && !MAIN_STATS_KEYS.includes(s.id)
    );

    return (
        <div className="flex flex-col h-full w-full p-2 gap-3">
            {/* ─── 境界与修为 ─── */}
            <div className="flex flex-col items-center gap-1 shrink-0 bg-white rounded-lg p-2 border border-slate-200">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
                    <span className="text-sm font-serif font-bold text-emerald-200 tracking-widest relative">
                        {REALMS[gameState.realm_idx] || '凡人'}
                        {gameState.realm_idx > 0 && CULTIVATION_REALMS[gameState.realm_idx]?.subRealms && CULTIVATION_REALMS[gameState.realm_idx].subRealms!.length > 0 ? (
                            <span className="ml-1 text-emerald-400/80">· {CULTIVATION_REALMS[gameState.realm_idx].subRealms![gameState.sub_realm_idx]}</span>
                        ) : null}
                    </span>
                </div>
                {/* 进度条 */}
                {gameState.realm_idx > 0 && (
                    <div className="w-full flex flex-col items-center group relative px-2">
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                                style={{ width: `${Math.min(100, Math.max(0, (gameState.exp / gameState.maxExp) * 100))}%` }}
                            />
                        </div>
                        <span className="text-xs font-mono text-slate-500 mt-1">
                            {gameState.exp} / {gameState.maxExp}
                        </span>
                    </div>
                )}
            </div>

            {/* ─── 五维属性条 ─── */}
            <div className="shrink-0 bg-white rounded-lg p-3 border border-slate-200">
                <div className="text-xs font-mono text-slate-500 mb-2 tracking-wider">| 五维</div>
                {STAT_CONFIG.map(stat => (
                    <StatBar
                        key={stat.key}
                        label={stat.label}
                        value={gameState.attributes?.[stat.key] || 0}
                        color={stat.color}
                        bg={stat.bg}
                    />
                ))}
            </div>

            {/* ─── 战斗属性 ─── */}
            <div className="shrink-0 bg-white rounded-lg p-3 border border-slate-200">
                <div className="text-xs font-mono text-slate-500 mb-2 tracking-wider">| 战斗</div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                        { k: 'ATK', n: '攻击', c: 'text-red-300' },
                        { k: 'DEF', n: '防御', c: 'text-blue-300' },
                        { k: 'SPD', n: '身法', c: 'text-green-300' },
                        { k: 'CRIT', n: '暴击', c: 'text-orange-300' },
                        { k: 'MOVE_SPEED', n: '脚力', c: 'text-teal-300' },
                    ].map(s => (
                        <div key={s.k} className="flex justify-between items-center px-1 py-0.5">
                            <span className={`text-sm font-serif ${s.c}`}>{s.n}</span>
                            <span className="text-sm text-slate-700 font-mono font-bold">{gameState.battleStats[s.k] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── 其他属性 (可滚动) ─── */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white rounded-lg border border-slate-200">
                <div className="text-xs font-mono text-slate-500 px-3 pt-2 pb-1 tracking-wider shrink-0">| 其他</div>
                <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-3 space-y-0.5">
                    {/* 灵石 */}
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-sm font-serif text-amber-400">灵石</span>
                        <span className="text-sm font-mono text-amber-300 font-bold">{gameState.attributes?.MONEY || 0}</span>
                    </div>
                    {/* 心情 */}
                    <div className="flex justify-between items-center py-1 border-b border-slate-200">
                        <span className="text-sm font-serif text-emerald-400">心情</span>
                        <span className={`text-sm font-mono font-bold ${(gameState.attributes?.MOOD || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                            {gameState.attributes?.MOOD || 0}
                        </span>
                    </div>

                    {extraStats.map(stat => {
                        const val = gameState.attributes?.[stat.id] || 0;
                        if (stat.id === 'MOOD' || stat.id === 'MONEY') return null; // Already shown above
                        return (
                            <div key={stat.id} className="flex items-center justify-between py-1 border-b border-slate-200/20">
                                <span className="text-sm text-slate-600 font-serif">{stat.name}</span>
                                <span className={`text-sm font-mono font-bold ${val > 0 ? 'text-slate-800' : 'text-slate-600'}`}>{val}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
