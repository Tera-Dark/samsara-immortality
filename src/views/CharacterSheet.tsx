import { useState, useMemo, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { REALMS, FATE_GRADE_COLORS, FATE_GRADE_NAMES } from '../types';
import type { FateGrade, FateEntry, FortuneBuff } from '../types';
import { XianxiaConfig } from '../modules/xianxia/config';

// ─── 常量 ───
const BATTLE_MAP: Record<string, string> = {
    MAX_HP: '气血', MAX_MP: '灵力', ATK: '攻击', DEF: '防御', SPD: '敏捷', CRIT: '暴击', MOVE_SPEED: '脚力'
};
// HP/MP 是运行时当前值，不在 deriveBattleStats 返回中，从面板隐藏
const HIDDEN_BATTLE_KEYS = new Set(['HP', 'MP']);
const MAIN_STATS = ['STR', 'INT', 'POT', 'CHR', 'LUCK'];
const STAT_LABELS: Record<string, string> = {
    STR: '体魄', INT: '悟性', POT: '资质', CHR: '魅力', LUCK: '气运'
};

const TABS_SELF = [
    { id: 'ATTR', label: '属性', icon: '◇' },
    { id: 'FATE', label: '命格', icon: '☆' },
    { id: 'REL', label: '关系', icon: '≡' },
    { id: 'PROF', label: '技艺', icon: '※' },
    { id: 'LOG', label: '生平', icon: '☰' },
];
const TABS_NPC = [
    { id: 'ATTR', label: '属性', icon: '◇' },
    { id: 'FATE', label: '命格', icon: '☆' },
];

// ─── 辅助：五维雷达图 SVG ───
function RadarChart({ values, masked }: { values: { key: string; name: string; val: number }[]; masked?: boolean }) {
    const MAX_VAL = Math.max(20, ...values.map(s => s.val));
    const R = 25, C = 50;
    const pt = (v: number, i: number) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        return `${C + (v / MAX_VAL) * R * Math.cos(a)},${C + (v / MAX_VAL) * R * Math.sin(a)}`;
    };
    const label = (i: number) => {
        const a = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const r = R + 14;
        return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
    };
    const poly = values.map((s, i) => pt(masked ? 5 : s.val, i)).join(' ');

    return (
        <svg viewBox="-5 -5 110 110" className="w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.15)]">
            {[0.25, 0.5, 0.75, 1].map(s => (
                <polygon key={s} points={values.map((_, i) => pt(MAX_VAL * s, i)).join(' ')} fill="none" stroke="#334155" strokeWidth="0.5" opacity={0.5} />
            ))}
            {values.map((_, i) => (
                <line key={i} x1={C} y1={C} x2={pt(MAX_VAL, i).split(',')[0]} y2={pt(MAX_VAL, i).split(',')[1]} stroke="#334155" strokeWidth="0.5" opacity={0.5} />
            ))}
            <polygon points={poly} fill={masked ? 'rgba(100,116,139,0.15)' : 'rgba(16,185,129,0.25)'} stroke={masked ? '#475569' : '#10b981'} strokeWidth="1.5" />
            {values.map((s, i) => {
                const [cx, cy] = pt(masked ? 5 : s.val, i).split(',');
                return <circle key={i} cx={cx} cy={cy} r="2" fill={masked ? '#475569' : '#10b981'} />;
            })}
            {values.map((s, i) => {
                const { x, y } = label(i);
                return (
                    <g key={i}>
                        <text x={x} y={y - 4} textAnchor="middle" className="text-[6px] fill-slate-300 font-serif font-bold tracking-widest">{s.name}</text>
                        <text x={x} y={y + 3} textAnchor="middle" className={`text-[7px] font-mono font-bold ${masked ? 'fill-slate-600' : s.val >= 10 ? 'fill-emerald-400' : 'fill-slate-400'}`}>
                            {masked ? '?' : s.val}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

// ─── 辅助：命格色牌 ───
function GradeBadge({ grade, name, small }: { grade: FateGrade; name: string; small?: boolean }) {
    const color = FATE_GRADE_COLORS[grade];
    return (
        <span className={`inline-flex items-center gap-1 rounded ${small ? 'px-1.5 py-0' : 'px-2 py-0.5'}`}
            style={{ border: `1px solid ${color}50`, background: `${color}15` }}>
            <span className={`font-bold ${small ? 'text-[10px]' : 'text-xs'}`} style={{ color, textShadow: `0 0 6px ${color}80` }}>
                {FATE_GRADE_NAMES[grade]}
            </span>
            <span className={`font-serif ${small ? 'text-[11px]' : 'text-xs'}`} style={{ color }}>{name}</span>
        </span>
    );
}

// ─── 辅助：信息遮蔽 ───
function MaskedText({ text, masked, className }: { text: string | number; masked?: boolean; className?: string }) {
    if (!masked) return <span className={className}>{text}</span>;
    return <span className={`${className} select-none`} style={{ filter: 'blur(4px)', userSelect: 'none' }}>???</span>;
}

// ─── 主组件 ───
export const CharacterSheet = () => {
    const gameState = useGameStore(s => s.gameState);
    const engine = useGameStore(s => s.engine);
    const toggleCharacterSheet = useUIStore(s => s.toggleCharacterSheet);
    const inspectTarget = useUIStore(s => s.inspectTarget);

    const isNPC = !!inspectTarget;
    const tabs = isNPC ? TABS_NPC : TABS_SELF;
    const [activeTab, setActiveTab] = useState('ATTR');

    // ─── 权限计算 ───
    const playerRealmIdx = gameState?.realm_idx ?? 0;
    const npcRealmName = inspectTarget?.realm || '凡人';
    const npcRealmIdx = REALMS.indexOf(npcRealmName);

    const canSeeStats = !isNPC || playerRealmIdx >= (npcRealmIdx >= 0 ? npcRealmIdx : 0);
    const canSeeBattle = !isNPC || playerRealmIdx > (npcRealmIdx >= 0 ? npcRealmIdx : 0);
    const canSeeDeep = !isNPC; // TODO: 特殊天赋「慧眼」判断

    // ─── 目标数据 ───
    const name = isNPC ? inspectTarget.name : gameState?.name || '';
    const gender = isNPC ? (inspectTarget.gender === 'M' ? 'Male' : 'Female') : gameState?.gender || 'Male';
    const age = isNPC ? inspectTarget.age : gameState?.age || 0;
    const realm = isNPC ? (inspectTarget.realm || '凡人') : REALMS[gameState?.realm_idx || 0];
    const attributes = isNPC ? (inspectTarget.attributes || {}) : (gameState?.attributes || {});
    const battleStats = isNPC ? (inspectTarget.battleStats || {}) : (gameState?.battleStats || {});
    const lifespan = isNPC ? inspectTarget.lifespan : engine?.getLifespan?.() || 60;
    const relation = isNPC ? inspectTarget.relation : null;
    const intimacy = isNPC ? inspectTarget.intimacy : null;
    const bgLabel = isNPC ? null : (gameState?.background === 'FARMER' ? '农家子弟' : gameState?.background === 'RICH' ? '修仙世家' : '芸芸众生');

    // UUID that is stable for the lifetime of this component to avoid render impurity 
    const [stableUid] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());

    // 五维数值
    const mainAttrs = MAIN_STATS.map(key => ({
        key, name: STAT_LABELS[key], val: attributes[key] || 0
    }));

    // 隐形资质 + 特殊状态
    const hiddenStats = useMemo(() => XianxiaConfig.stats.filter(s => ['WIL', 'KARMA'].includes(s.id)), []);
    const specialStats = useMemo(() => XianxiaConfig.stats.filter(s => ['TOXIN'].includes(s.id)), []);

    // 当前命格/气运（仅自己有）
    const fate: FateEntry[] = gameState?.fate || [];
    const fortuneBuffs: FortuneBuff[] = gameState?.fortuneBuffs || [];
    const personality = gameState?.personality;

    const handleClose = useCallback(() => {
        toggleCharacterSheet(false);
    }, [toggleCharacterSheet]);

    if (!gameState) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm backdrop-blur-sm animate-fade-in p-4" onClick={handleClose}>
            {/* 主容器 */}
            <div className="w-full max-w-5xl h-[82vh] bg-white border border-slate-200 shadow-xl flex rounded-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}>

                {/* 装饰边框 */}
                <div className="absolute inset-0 pointer-events-none border border-slate-200 rounded-2xl z-20"></div>

                {/* 关闭按钮 */}
                <button onClick={handleClose}
                    className="absolute top-5 right-5 z-50 w-9 h-9 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-300 transition-all group shadow-sm">
                    <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* ─── 左侧：档案卡 ─── */}
                <div className="w-72 shrink-0 bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 flex flex-col relative">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

                    {/* 头像 + 基本信息 */}
                    <div className="p-6 pb-3 flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full border-2 border-slate-200 p-1.5 mb-4 relative group shadow-md">
                            <div className="w-full h-full rounded-full bg-gradient-to-b from-slate-100 to-slate-200 overflow-hidden relative flex items-center justify-center">
                                <span className={`font-serif text-5xl select-none transition-colors duration-500 ${isNPC
                                    ? (gender === 'Female' ? 'text-rose-700 group-hover:text-rose-400' : 'text-sky-700 group-hover:text-sky-400')
                                    : 'text-slate-600 group-hover:text-jade'}`}>
                                    {name[0]}
                                </span>
                                {/* 境界徽章 */}
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2.5 py-px bg-white/90 border border-slate-200 rounded-full shadow-sm">
                                    <span className="text-[11px] font-serif text-emerald-600 tracking-widest">{realm}</span>
                                </div>
                            </div>
                            <div className="absolute inset-0 rounded-full border border-emerald-400/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
                        </div>

                        <div className="text-center space-y-1.5 w-full relative z-10">
                            <h2 className="text-2xl font-serif font-bold text-slate-800 tracking-wider flex items-center justify-center gap-1.5">
                                {name}
                                <span className={`text-sm ${gender === 'Male' ? 'text-blue-400/70' : 'text-rose-400/70'}`}>
                                    {gender === 'Male' ? '♂' : '♀'}
                                </span>
                            </h2>
                            {/* NPC 关系 + 亲密度 */}
                            {isNPC && relation && (
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-[11px] px-2 py-0.5 bg-emerald-950/30 border border-emerald-800/30 rounded-full text-emerald-400 font-serif">{relation}</span>
                                    {intimacy !== null && (
                                        <span className={`text-[11px] flex items-center gap-0.5 ${intimacy > 60 ? 'text-rose-400' : 'text-slate-500'}`}>
                                            好感 {intimacy}
                                        </span>
                                    )}
                                </div>
                            )}
                            <div className="text-xs font-mono text-slate-500 tracking-[0.15em] bg-slate-50 py-1 rounded border border-slate-200 mx-6">
                                {age}岁 / {lifespan}
                            </div>
                            {bgLabel && (
                                <div className="text-[10px] text-slate-600 font-serif tracking-widest">{bgLabel}</div>
                            )}
                        </div>
                    </div>

                    {/* 战斗属性 */}
                    <div className="px-6 flex-1 relative z-10 overflow-y-auto custom-scrollbar">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1 h-3 bg-emerald-500/50 rounded-full"></div>
                            <span className="text-[11px] font-serif text-slate-400 tracking-widest">战斗属性</span>
                        </div>
                        <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            {Object.entries(battleStats).filter(([key]) => !HIDDEN_BATTLE_KEYS.has(key)).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-sm border-b border-slate-200/20 last:border-0 pb-1.5 last:pb-0">
                                    <span className="text-slate-500 font-serif tracking-wide text-[13px]">{BATTLE_MAP[key] || key}</span>
                                    <MaskedText text={val as number} masked={!canSeeBattle} className="font-mono text-slate-700" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 底部标识 */}
                    <div className="p-3 text-[9px] font-mono text-slate-400 text-center border-t border-slate-100">
                        {isNPC ? `NPC · ${inspectTarget.id}` : `UID · ${stableUid}`}
                    </div>
                </div>

                {/* ─── 右侧：Tab 内容 ─── */}
                <div className="flex-1 flex flex-col bg-white min-w-0 relative">


                    {/* Tab 栏 */}
                    <div className="h-14 flex items-end border-b border-slate-200 px-6 gap-1 relative z-10 bg-white">
                        {tabs.map(tab => (
                            <button key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`pb-3 px-4 text-sm font-serif tracking-[0.2em] transition-all relative group
                                    ${activeTab === tab.id ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'}`}>
                                <span className="mr-1 opacity-60">{tab.icon}</span>
                                {tab.label}
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 rounded-t-full" />
                                )}
                                {activeTab !== tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-[2px] bg-slate-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* 内容区 */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 relative z-10">

                        {/* ═══ 属性 Tab ═══ */}
                        {activeTab === 'ATTR' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* 五维雷达图 */}
                                <div>
                                    <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                        <span className="w-1.5 h-5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                                        五维属性
                                        {!canSeeStats && <span className="text-xs text-slate-600 font-normal tracking-normal ml-2">— 境界不足，无法洞悉</span>}
                                    </h3>
                                    <div className="max-w-[280px] mx-auto">
                                        <RadarChart values={mainAttrs} masked={!canSeeStats} />
                                    </div>
                                </div>

                                {/* 隐形资质（仅自己/可见时） */}
                                {canSeeDeep && hiddenStats.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                            <span className="w-1.5 h-5 bg-purple-500 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.5)]"></span>
                                            隐形资质
                                        </h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {hiddenStats.map(stat => (
                                                <div key={stat.id} className="group p-4 bg-white border border-slate-200 hover:border-purple-500/30 hover:bg-purple-900/5 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                                                    <span className="text-slate-500 text-xs text-center font-serif group-hover:text-purple-400 transition-colors tracking-widest">{stat.name}</span>
                                                    <div className="w-full h-px bg-slate-800/50 group-hover:bg-purple-500/20 transition-colors"></div>
                                                    <span className={`font-mono text-xl ${stat.color || 'text-purple-300'}`}>{attributes[stat.id] || 0}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* 特殊状态（仅自己） */}
                                {canSeeDeep && specialStats.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                            <span className="w-1.5 h-5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                                            特殊状态
                                        </h3>
                                        <div className="grid grid-cols-4 gap-3">
                                            {specialStats.map(stat => (
                                                <div key={stat.id} className="p-4 bg-red-950/10 border border-red-900/20 hover:border-red-500/30 rounded-xl flex flex-col items-center gap-2 transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                                    <span className="text-red-400/70 text-xs text-center font-serif tracking-widest">{stat.name}</span>
                                                    <div className="w-full h-px bg-red-900/20"></div>
                                                    <span className={`font-mono text-xl ${stat.color || 'text-red-500'}`}>{attributes[stat.id] || 0}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* NPC 信息不足提示 */}
                                {isNPC && !canSeeStats && (
                                    <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-white/20 text-xs text-slate-500 leading-relaxed font-mono flex gap-3">
                                        <span className="text-lg text-amber-500/50">⚠</span>
                                        <div className="pt-0.5">
                                            对方境界高深，你的修为尚不足以窥探其全貌。<br />
                                            <span className="text-slate-600">提升自身境界后可查看更多信息。</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══ 命格 Tab ═══ */}
                        {activeTab === 'FATE' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* 正邪值（仅自己） */}
                                {!isNPC && personality && (
                                    <div>
                                        <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                            <span className="w-1.5 h-5 bg-slate-400 rounded-full shadow-[0_0_8px_rgba(148,163,184,0.3)]"></span>
                                            正邪之道
                                        </h3>
                                        <div className="bg-white border border-slate-200 rounded-xl p-5">
                                            {(() => {
                                                const val = personality.JUSTICE || 0;
                                                return (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm text-red-400/80 font-serif w-8 text-center">邪</span>
                                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-600"></div>
                                                            <div
                                                                className={`h-full rounded-full transition-all duration-700 ${val > 0 ? 'bg-emerald-500' : val < 0 ? 'bg-red-500' : ''}`}
                                                                style={{
                                                                    width: `${Math.min(50, Math.abs(val))}%`,
                                                                    marginLeft: val > 0 ? '50%' : `${50 - Math.min(50, Math.abs(val))}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <span className="text-sm text-emerald-400/80 font-serif w-8 text-center">正</span>
                                                        <span className={`w-10 text-center font-mono text-lg font-bold ${val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-slate-600'}`}>{val}</span>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                )}

                                {/* 先天命格 */}
                                <div>
                                    <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                        <span className="w-1.5 h-5 bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                                        先天命格
                                    </h3>
                                    {fate.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {fate.map(f => (
                                                <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-amber-500/20 transition-colors group">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <GradeBadge grade={f.grade} name={f.name} />
                                                    </div>
                                                    <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                                                    {f.effects && Object.keys(f.effects).length > 0 && (
                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                            {Object.entries(f.effects).map(([k, v]) => (
                                                                <span key={k} className={`text-[10px] font-mono px-1.5 py-px rounded ${v > 0 ? 'text-emerald-400 bg-emerald-950/30' : 'text-red-400 bg-red-950/30'}`}>
                                                                    {k} {v > 0 ? '+' : ''}{v}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-slate-600 italic font-serif">
                                            {isNPC ? '无法窥探此人命格' : '命格未定'}
                                        </div>
                                    )}
                                </div>

                                {/* 后天气运（仅自己） */}
                                {!isNPC && (
                                    <div>
                                        <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                            <span className="w-1.5 h-5 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]"></span>
                                            后天气运
                                        </h3>
                                        {fortuneBuffs.length > 0 ? (
                                            <div className="space-y-2">
                                                {fortuneBuffs.map(buff => (
                                                    <div key={buff.id} className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-3">
                                                        <GradeBadge grade={buff.grade} name={buff.name} small />
                                                        <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${(buff.remainingMonths / buff.durationMonths) * 100}%`,
                                                                    background: FATE_GRADE_COLORS[buff.grade],
                                                                    opacity: 0.6,
                                                                }} />
                                                        </div>
                                                        <span className="text-[11px] text-slate-500 font-mono tabular-nums w-12 text-right">{buff.remainingMonths}月</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-600 italic font-serif">暂无气运加持</div>
                                        )}
                                    </div>
                                )}

                                {/* 已获特质（仅自己） */}
                                {!isNPC && gameState.acquiredTraits && gameState.acquiredTraits.length > 0 && (
                                    <div>
                                        <h3 className="flex items-center gap-3 text-base font-bold text-slate-600 mb-4 font-serif tracking-widest">
                                            <span className="w-1.5 h-5 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                                            后天特质
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {gameState.acquiredTraits.map(t => (
                                                <div key={t.id} className="px-3 py-1.5 bg-indigo-950/20 border border-indigo-800/30 rounded-lg text-xs text-indigo-300 hover:border-indigo-500/40 transition-colors cursor-default" title={t.description}>
                                                    {t.name}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ═══ 关系 Tab（仅自己）═══ */}
                        {activeTab === 'REL' && !isNPC && (
                            <div className="animate-fade-in">
                                <div className="grid grid-cols-2 gap-3">
                                    {gameState.relationships.map((npc) => {
                                        const inspectNPC = useUIStore.getState().inspectNPC;
                                        return (
                                            <div key={npc.id}
                                                onClick={() => inspectNPC(npc)}
                                                className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-500/30 transition-all hover:bg-emerald-950/5 group cursor-pointer">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-serif text-xl bg-slate-50 border-2 ${npc.gender === 'F'
                                                    ? 'text-rose-400 border-rose-900/30 group-hover:border-rose-500/50'
                                                    : 'text-sky-400 border-sky-900/30 group-hover:border-sky-500/50'
                                                    } transition-colors shadow-lg`}>
                                                    {npc.name[0]}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <div className="flex justify-between items-baseline">
                                                        <span className="font-bold text-base text-slate-700 font-serif truncate group-hover:text-emerald-300 transition-colors">{npc.name}</span>
                                                        <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded text-slate-400 border border-slate-200 shrink-0 ml-2">{npc.relation}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                                                        <span className="px-1.5 py-0.5 rounded bg-slate-800/50">{npc.realm || '凡人'}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span>{npc.age}/{npc.lifespan}岁</span>
                                                            <span className={npc.intimacy > 60 ? 'text-rose-400' : 'text-slate-600'}>好感 {npc.intimacy}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <span className="text-slate-700 text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0">→</span>
                                            </div>
                                        );
                                    })}
                                    {gameState.relationships.length === 0 && (
                                        <div className="col-span-2 flex flex-col items-center justify-center py-16 text-slate-600 font-serif space-y-3 opacity-70">
                                            <div className="text-4xl filter grayscale opacity-50">--</div>
                                            <div className="tracking-widest">举世茫茫，暂无故人...</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ═══ 技艺 Tab（仅自己）═══ */}
                        {activeTab === 'PROF' && !isNPC && (
                            <div className="grid grid-cols-2 gap-4 animate-fade-in">
                                {Object.entries(gameState.professions).map(([key, stats]) => (
                                    <div key={key} className="relative overflow-hidden bg-white border border-slate-200 rounded-xl p-5 group hover:border-emerald-500/30 hover:bg-emerald-950/10 transition-all duration-500">
                                        <div className="absolute -right-3 -bottom-3 text-7xl opacity-[0.03] font-serif font-black text-white group-hover:text-emerald-400 group-hover:opacity-[0.08] transition-all duration-500 pointer-events-none select-none">
                                            {{ 'alchemy': '丹', 'artifact': '器', 'formation': '阵', 'talisman': '符' }[key]}
                                        </div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-serif font-bold text-slate-700 group-hover:text-emerald-400 transition-colors tracking-widest">
                                                    {{ 'alchemy': '炼丹之道', 'artifact': '炼器之道', 'formation': '阵法之道', 'talisman': '符箓之道' }[key]}
                                                </h3>
                                                <p className="text-xs text-slate-500 mt-1 font-mono">Lv.{stats.level} · 入门</p>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs text-slate-500 font-mono">
                                                <span>修炼进度</span>
                                                <span className="group-hover:text-emerald-400 transition-colors">{stats.exp} / {stats.maxExp}</span>
                                            </div>
                                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 shadow-[0_0_8px_#10b981] transition-all duration-1000 ease-out rounded-full" style={{ width: `${(stats.exp / stats.maxExp) * 100}%` }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ═══ 生平 Tab（仅自己）═══ */}
                        {activeTab === 'LOG' && !isNPC && (
                            <div className="animate-fade-in">
                                {gameState.history.length > 0 ? (
                                    <div className="space-y-1 max-h-[55vh] overflow-y-auto custom-scrollbar pr-2">
                                        {gameState.history.map((entry, i) => (
                                            <div key={i} className="flex gap-3 py-1.5 border-b border-slate-200/20 last:border-0 group hover:bg-white/20 px-2 rounded transition-colors">
                                                <span className="text-[10px] text-slate-700 font-mono tabular-nums shrink-0 pt-0.5 w-6 text-right">{i + 1}</span>
                                                <span className="text-xs text-slate-400 leading-relaxed">{entry}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4 opacity-60">
                                        <div className="text-4xl">--</div>
                                        <div className="font-serif tracking-[0.3em]">尚无记载</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Fallback for missing tabs */}
                        {!['ATTR', 'FATE', 'REL', 'PROF', 'LOG'].includes(activeTab) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-4 opacity-60 animate-fade-in">
                                <div className="w-16 h-16 border-2 border-dashed border-slate-200 rounded-full flex items-center justify-center text-lg font-serif text-slate-400">修</div>
                                <div className="font-serif tracking-[0.3em] text-lg">功能修缮中</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
