import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { REALMS, CULTIVATION_REALMS } from '../types';

// 六维属性及派生说明
const STAT_CONFIG = [
    { key: 'STR', label: '体魄', color: 'text-red-400', bg: 'bg-red-500', desc: '影响气血上限与基础防御' },
    { key: 'MND', label: '神识', color: 'text-emerald-400', bg: 'bg-emerald-500', desc: '影响法力上限、身法与暴击' },
    { key: 'INT', label: '悟性', color: 'text-sky-400', bg: 'bg-sky-500', desc: '影响修炼速度与突破概率' },
    { key: 'POT', label: '资质', color: 'text-violet-400', bg: 'bg-violet-500', desc: '影响灵气吸收与法术威力' },
    { key: 'CHR', label: '魅力', color: 'text-pink-400', bg: 'bg-pink-500', desc: '影响人际初见好感与双修' },
    { key: 'LUCK', label: '气运', color: 'text-amber-400', bg: 'bg-amber-500', desc: '影响奇遇品质与掉落福报' },
];

const StatBar = ({ label, value, color, bg, desc }: { label: string; value: number; color: string; bg: string; desc: string }) => {
    const max = 30; // 假设常规基准满值，可视情况溢出
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="py-2 border-b border-slate-100/50 last:border-0 group relative">
            <div className="flex items-center justify-between mb-1.5 z-10 relative">
                <div className="flex items-center gap-2">
                    <span className={`text-sm font-serif font-bold ${color}`}>{label}</span>
                    <span className="text-sm font-mono text-slate-800 font-bold">{value}</span>
                </div>
                <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity absolute right-0 bg-white/90 px-1 rounded">
                    {desc}
                </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden relative z-0">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${bg} opacity-80`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

// 气血/灵力专属条
const ResourceBar = ({ label, current, max, colorHint }: { label: string; current: number; max: number; colorHint: 'red' | 'blue' | 'green' }) => {
    const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;

    let gradients = '';
    if (colorHint === 'red') { gradients = 'from-rose-500 to-red-600'; }
    else if (colorHint === 'blue') { gradients = 'from-sky-400 to-blue-600'; }
    else if (colorHint === 'green') { gradients = 'from-emerald-400 to-green-600'; }

    return (
        <div className="relative w-full h-6 bg-slate-800 rounded shadow-inner overflow-hidden border border-slate-700/50 group">
            {/* 流光倒影 */}
            <div
                className={`absolute top-0 left-0 bottom-0 bg-gradient-to-r ${gradients} transition-all duration-500 ease-out`}
                style={{ width: `${pct}%` }}
            >
                <div className="absolute inset-0 bg-white/20 w-full h-1/2"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center px-2">
                <span className="text-[10px] font-bold tracking-widest text-white/90 drop-shadow-md z-10 flex gap-2">
                    <span>{label}</span>
                    <span className="font-mono">{Math.floor(current)} / {Math.floor(max)}</span>
                </span>
            </div>
        </div>
    );
}

export const StatsPanel = () => {
    const { gameState, engine } = useGameStore();
    const [showMore, setShowMore] = useState(false);

    const HP = gameState.attributes?.HP || 0;
    const MAX_HP = gameState.battleStats?.MAX_HP || 100;
    const MP = gameState.attributes?.MP || 0;
    const MAX_MP = gameState.battleStats?.MAX_MP || 0;
    const MOOD = gameState.attributes?.MOOD || 0;

    const MAIN_STATS_KEYS = ['STR', 'MND', 'INT', 'POT', 'CHR', 'LUCK'];

    // 过滤掉主界面已特殊展示的属性，剩下的扔进详细面板
    const extraStats = engine.moduleConfig.stats.filter(s =>
        s.visible && !MAIN_STATS_KEYS.includes(s.id) && s.id !== 'HP' && s.id !== 'MP' && s.id !== 'MOOD' && s.id !== 'MONEY'
    );

    // 计算修仙周天分格 (大周天=10小节)
    const totalSegments = 10;

    return (
        <div className="flex flex-col h-full w-full gap-3 p-2 pb-0">
            {/* 顶层：境界 + 生命法力 (深色修仙风格底) */}
            <div className="relative overflow-hidden bg-slate-900 rounded-xl p-4 shadow-lg border border-slate-700/60 shrink-0">
                {/* 仙侠国风边角装饰 */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/30 rounded-tl-xl pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/30 rounded-br-xl pointer-events-none"></div>

                <div className="flex flex-col items-center gap-1 mb-4 relative z-10">
                    <span className="text-xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-500 tracking-[0.2em] filter drop-shadow">
                        {REALMS[gameState.realm_idx] || '凡人'}
                        {gameState.realm_idx > 0 && CULTIVATION_REALMS[gameState.realm_idx]?.subRealms && CULTIVATION_REALMS[gameState.realm_idx].subRealms!.length > 0 ? (
                            <span className="ml-1 text-amber-200/80 text-sm">· {CULTIVATION_REALMS[gameState.realm_idx].subRealms![gameState.sub_realm_idx]}</span>
                        ) : null}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">第 {gameState.age} 岁 | {gameState.flags.includes('HAS_CULTIVATION_METHOD') ? '修道者' : '凡夫俗子'}</span>
                </div>

                <div className="flex flex-col gap-2 relative z-10">
                    <ResourceBar label="气血" current={HP} max={MAX_HP} colorHint="red" />
                    {MAX_MP > 0 && <ResourceBar label="灵运" current={MP} max={MAX_MP} colorHint="blue" />}
                </div>
            </div>

            {/* 核心区：六维属性 */}
            <div className="shrink-0 bg-white rounded-xl p-4 shadow-sm border border-slate-200/60 relative overflow-hidden">
                <div className="absolute -right-4 -top-2 text-slate-100 text-6xl opacity-40 pointer-events-none select-none font-serif font-black">根骨</div>

                <div className="text-xs font-serif text-slate-500 mb-3 tracking-widest flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span> 命脉根骨
                    </span>
                    <span className="text-[9px] text-slate-400">悬浮查看派生</span>
                </div>

                <div className="flex flex-col">
                    {STAT_CONFIG.map(stat => (
                        <StatBar
                            key={stat.key}
                            label={stat.label}
                            value={gameState.attributes?.[stat.key] || 0}
                            color={stat.color}
                            bg={stat.bg}
                            desc={stat.desc}
                        />
                    ))}
                </div>
            </div>

            {/* 大周天修仙进度条 (始终在六维之下，信息之上) */}
            {gameState.realm_idx > 0 && (
                <div className="shrink-0 bg-slate-900 rounded-xl p-3 border border-slate-700/60 shadow-inner relative overflow-hidden group">
                    {/* 周天进度网格底纹 */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, transparent 9px, #fff 10px)', backgroundSize: '10% 100%' }}></div>

                    <div className="flex justify-between items-center mb-1.5 relative z-10">
                        <span className="text-xs font-serif text-amber-200/80 tracking-widest flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>周天流转
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400/80">{Math.floor(gameState.exp)} / {gameState.maxExp}</span>
                    </div>

                    <div className="relative w-full h-3.5 bg-slate-800 rounded-sm overflow-hidden flex shadow-inner border border-slate-700/50">
                        {Array.from({ length: totalSegments }).map((_, idx) => {
                            const segSize = gameState.maxExp / totalSegments;
                            const isFull = gameState.exp >= segSize * (idx + 1);
                            const isCurrent = !isFull && gameState.exp > segSize * idx;
                            const pct = isCurrent ? ((gameState.exp - segSize * idx) / segSize) * 100 : 0;

                            return (
                                <div key={idx} className="flex-1 border-r border-slate-900/80 last:border-0 relative">
                                    {isFull && (
                                        <div className="absolute inset-0 bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                    )}
                                    {isCurrent && (
                                        <div
                                            className="absolute top-0 left-0 bottom-0 bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-300"
                                            style={{ width: `${pct}%` }}
                                        ></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 其他详细信息 (折叠收纳) */}
            <div className="flex-1 min-h-0 bg-white rounded-xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden mb-2">
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 border-b border-slate-100 hover:bg-indigo-50/50 transition-colors group"
                >
                    <span className="text-xs font-serif text-slate-600 group-hover:text-indigo-600 transition-colors tracking-widest">{showMore ? '收起详情' : '展开战力与名鉴'}</span>
                    <svg className={`w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-transform ${showMore ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {showMore && (
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-2 opacity-100 animate-fade-in space-y-4">
                        {/* 战斗面板 */}
                        <div>
                            <div className="text-[10px] font-mono text-slate-400 mb-2 tracking-widest border-b border-slate-100 pb-1">武道杀伐</div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                {[
                                    { k: 'ATK', n: '大攻', c: 'text-red-400' },
                                    { k: 'DEF', n: '防御', c: 'text-blue-400' },
                                    { k: 'SPD', n: '身法', c: 'text-green-400' },
                                    { k: 'CRIT', n: '会心', c: 'text-orange-400' },
                                    { k: 'MOVE_SPEED', n: '脚力', c: 'text-teal-400' },
                                ].map(s => (
                                    <div key={s.k} className="flex justify-between items-center py-0.5 border-b border-slate-50/50">
                                        <span className={`text-xs font-serif ${s.c}`}>{s.n}</span>
                                        <span className="text-sm text-slate-700 font-mono font-bold">{Math.floor(gameState.battleStats[s.k] || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 杂项面板 */}
                        <div className="pb-2">
                            <div className="text-[10px] font-mono text-slate-400 mb-2 tracking-widest border-b border-slate-100 pb-1">造化身家</div>
                            <div className="space-y-1">
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-xs font-serif text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-amber-400"></span>灵石</span>
                                    <span className="text-sm font-mono text-amber-600 font-bold">{gameState.attributes?.MONEY || 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-xs font-serif text-emerald-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-sm bg-emerald-400"></span>心情</span>
                                    <span className={`text-sm font-mono font-bold ${MOOD >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {MOOD}
                                    </span>
                                </div>
                                {extraStats.map(stat => {
                                    const val = gameState.attributes?.[stat.id] || 0;
                                    return (
                                        <div key={stat.id} className="flex items-center justify-between py-1 border-b border-slate-50 last:border-0">
                                            <span className="text-xs text-slate-500 font-serif flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-slate-300"></span>{stat.name}</span>
                                            <span className={`text-sm font-mono font-bold ${val > 0 ? 'text-slate-700' : 'text-slate-400'}`}>{Math.floor(val)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
