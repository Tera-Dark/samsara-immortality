import { useMemo, useState } from 'react';
import { Activity, Heart, Sparkles, Swords, Wind } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { CULTIVATION_REALMS, REALMS } from '../types';

const STAT_CONFIG = [
    { key: 'STR', label: '体魄', accent: 'text-rose-700', bar: 'bg-rose-500', soft: 'bg-rose-50', desc: '影响气血上限与基础防御。' },
    { key: 'MND', label: '神识', accent: 'text-emerald-700', bar: 'bg-emerald-500', soft: 'bg-emerald-50', desc: '影响法力上限、身法与暴击。' },
    { key: 'INT', label: '悟性', accent: 'text-sky-700', bar: 'bg-sky-500', soft: 'bg-sky-50', desc: '影响修炼速度与突破稳定度。' },
    { key: 'POT', label: '资质', accent: 'text-violet-700', bar: 'bg-violet-500', soft: 'bg-violet-50', desc: '影响灵气吸收与术法威力。' },
    { key: 'CHR', label: '魅力', accent: 'text-pink-700', bar: 'bg-pink-500', soft: 'bg-pink-50', desc: '影响初见观感与人际互动。' },
    { key: 'LUCK', label: '气运', accent: 'text-amber-700', bar: 'bg-amber-500', soft: 'bg-amber-50', desc: '影响奇遇品质与额外收益。' },
];

const BATTLE_STATS = [
    { key: 'ATK', label: '攻击', icon: Swords, accent: 'text-rose-700', bg: 'bg-rose-50' },
    { key: 'DEF', label: '防御', icon: Activity, accent: 'text-sky-700', bg: 'bg-sky-50' },
    { key: 'SPD', label: '身法', icon: Wind, accent: 'text-emerald-700', bg: 'bg-emerald-50' },
    { key: 'CRIT', label: '暴击', icon: Sparkles, accent: 'text-amber-700', bg: 'bg-amber-50' },
    { key: 'MOVE_SPEED', label: '脚力', icon: Heart, accent: 'text-violet-700', bg: 'bg-violet-50' },
];

const ResourceBar = ({
    label,
    current,
    max,
    gradient,
}: {
    label: string;
    current: number;
    max: number;
    gradient: string;
}) => {
    const pct = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;
    return (
        <div className="rounded-2xl border border-slate-200 bg-white/10 p-2.5">
            <div className="mb-1.5 flex items-center justify-between text-[10px] tracking-[0.14em] text-slate-300">
                <span>{label}</span>
                <span className="font-mono tracking-normal text-slate-100">{Math.floor(current)} / {Math.floor(max)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
                <div className={`h-full rounded-full bg-gradient-to-r ${gradient}`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
};

const StatCard = ({
    label,
    value,
    accent,
    bar,
    soft,
    desc,
}: {
    label: string;
    value: number;
    accent: string;
    bar: string;
    soft: string;
    desc: string;
}) => {
    const pct = Math.max(8, Math.min(100, (value / 30) * 100));
    return (
        <div className={`group relative rounded-2xl border border-slate-200 px-2.5 py-2.5 ${soft}`}>
            <div className="flex items-center justify-between gap-2">
                <span className={`whitespace-nowrap text-xs font-semibold ${accent}`}>{label}</span>
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-xs font-mono font-bold text-slate-700">{value}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/90">
                <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
            </div>
            <div className="pointer-events-none absolute left-2 right-2 top-[calc(100%+8px)] z-20 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-[11px] leading-5 text-slate-600 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
                {desc}
            </div>
        </div>
    );
};

export const StatsPanel = () => {
    const { gameState, engine } = useGameStore();
    const [showMore, setShowMore] = useState(true);

    const attrs = gameState.attributes || {};
    const battle = gameState.battleStats || {};
    const hp = attrs.HP || 0;
    const maxHp = battle.MAX_HP || 100;
    const mp = attrs.MP || 0;
    const maxMp = battle.MAX_MP || 0;

    const extraStats = useMemo(
        () => engine.moduleConfig.stats.filter((s) =>
            s.visible && !['STR', 'MND', 'INT', 'POT', 'CHR', 'LUCK', 'HP', 'MP', 'MOOD', 'MONEY'].includes(s.id),
        ),
        [engine.moduleConfig.stats],
    );

    const realmLabel = REALMS[gameState.realm_idx] || '凡人';
    const subRealm = gameState.realm_idx > 0 && CULTIVATION_REALMS[gameState.realm_idx]?.subRealms?.[gameState.sub_realm_idx];
    const totalSegments = 10;

    return (
        <div className="flex h-full w-full flex-col gap-2.5 p-1.5 pb-0">
            <div className="overflow-visible rounded-3xl border border-slate-800 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.14),transparent_46%),linear-gradient(180deg,#0f172a,#111827)] p-3 shadow-xl">
                <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                        <div className="text-[10px] tracking-[0.18em] text-amber-200/75">角色命盘</div>
                        <div className="mt-1 break-all text-[15px] font-bold tracking-[0.02em] text-amber-100">{realmLabel}</div>
                        {subRealm && <div className="mt-0.5 break-words text-[10px] text-amber-300/80">{subRealm}</div>}
                    </div>
                    <div className="max-w-[78px] rounded-2xl border border-amber-500/20 bg-white/5 px-2 py-1.5 text-right">
                        <div className="text-[9px] tracking-[0.14em] text-slate-400">当前身份</div>
                        <div className="mt-1 text-[10px] font-medium leading-4 text-slate-100">
                            {gameState.flags.includes('HAS_CULTIVATION_METHOD') ? '修道者' : '凡俗中人'}
                        </div>
                        <div className="mt-1 text-[10px] text-slate-400">{gameState.age} 岁</div>
                    </div>
                </div>

                <div className="mt-3 space-y-2">
                    <ResourceBar label="气血" current={hp} max={maxHp} gradient="from-rose-500 via-red-500 to-orange-500" />
                    {maxMp > 0 && <ResourceBar label="灵力" current={mp} max={maxMp} gradient="from-sky-400 via-blue-500 to-indigo-500" />}
                </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="text-[10px] tracking-[0.16em] text-slate-500">核心属性</div>
                    <div className="text-[10px] text-slate-400">悬停查看详细作用</div>
                </div>
                <div className="grid grid-cols-2 gap-2 overflow-visible">
                    {STAT_CONFIG.map((stat) => (
                        <StatCard
                            key={stat.key}
                            label={stat.label}
                            value={attrs[stat.key] || 0}
                            accent={stat.accent}
                            bar={stat.bar}
                            soft={stat.soft}
                            desc={stat.desc}
                        />
                    ))}
                </div>
            </div>

            {gameState.realm_idx > 0 && (
                <div className="rounded-3xl border border-slate-800 bg-slate-950 p-3 shadow-inner">
                    <div className="mb-2 flex items-center justify-between">
                        <span className="text-[10px] tracking-[0.16em] text-emerald-300/80">周天流转</span>
                        <span className="text-[11px] font-mono text-emerald-400">{Math.floor(gameState.exp)} / {gameState.maxExp}</span>
                    </div>
                    <div className="flex h-3.5 overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
                        {Array.from({ length: totalSegments }).map((_, idx) => {
                            const segSize = gameState.maxExp / totalSegments;
                            const isFull = gameState.exp >= segSize * (idx + 1);
                            const isCurrent = !isFull && gameState.exp > segSize * idx;
                            const pct = isCurrent ? ((gameState.exp - segSize * idx) / segSize) * 100 : 0;
                            return (
                                <div key={idx} className="relative flex-1 border-r border-slate-950 last:border-r-0">
                                    {isFull && <div className="absolute inset-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.45)]" />}
                                    {isCurrent && <div className="absolute inset-y-0 left-0 bg-emerald-400" style={{ width: `${pct}%` }} />}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex min-h-[50px] items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2 text-left transition-colors hover:bg-slate-100"
                >
                    <div>
                        <div className="text-[10px] tracking-[0.16em] text-slate-500">{showMore ? '收起扩展面板' : '展开扩展面板'}</div>
                        <div className="mt-0.5 text-[10px] text-slate-400">战斗数值与额外属性</div>
                    </div>
                    <div className={`text-sm text-slate-400 transition-transform ${showMore ? 'rotate-180' : ''}`}>⌄</div>
                </button>

                {showMore && (
                    <div className="custom-scrollbar min-h-[220px] min-w-0 flex-1 space-y-3 overflow-y-auto p-3">
                        <div>
                            <div className="mb-2.5 text-[10px] tracking-[0.16em] text-slate-500">战斗面板</div>
                            <div className="grid grid-cols-2 gap-2">
                                {BATTLE_STATS.map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.key} className={`rounded-2xl border border-slate-200 px-2.5 py-2.5 ${stat.bg}`}>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                                <Icon className={`h-3.5 w-3.5 ${stat.accent}`} />
                                                <span className="whitespace-nowrap">{stat.label}</span>
                                            </div>
                                            <div className="mt-1.5 text-lg font-mono font-bold text-slate-800">
                                                {Math.floor(battle[stat.key] || 0)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <div className="mb-2.5 text-[10px] tracking-[0.16em] text-slate-500">额外属性</div>
                            <div className="space-y-2">
                                {extraStats.length > 0 ? extraStats.map((stat) => {
                                    const value = attrs[stat.id] || 0;
                                    return (
                                        <div key={stat.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-2.5 py-2">
                                            <span className="whitespace-nowrap text-xs text-slate-600">{stat.name}</span>
                                            <span className="text-xs font-mono font-bold text-slate-800">{Math.floor(value)}</span>
                                        </div>
                                    );
                                }) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
                                        当前没有额外展示属性
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
