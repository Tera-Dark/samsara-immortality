import { useCallback, useMemo, useState } from 'react';
import {
    AlertTriangle,
    ChevronRight,
    Dna,
    Hammer,
    History,
    Mars,
    Sparkles,
    Star,
    Users,
    Venus,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { CULTIVATION_REALMS, FATE_GRADE_COLORS, FATE_GRADE_NAMES, REALMS } from '../types';
import type { FateEntry, FateGrade, FortuneBuff, NPC, ProfessionStats } from '../types';
import { XianxiaConfig } from '../modules/xianxia/config';
import { hasBond } from '../utils/socialUtils';

const BATTLE_LABELS: Record<string, string> = {
    MAX_HP: '气血上限',
    MAX_MP: '灵力上限',
    ATK: '攻击',
    DEF: '防御',
    SPD: '身法',
    CRIT: '暴击',
    MOVE_SPEED: '脚力',
};

const HIDDEN_BATTLE_KEYS = new Set(['HP', 'MP']);
const MAIN_STATS = ['STR', 'INT', 'POT', 'CHR', 'LUCK'] as const;
const STAT_LABELS: Record<string, string> = {
    STR: '体魄',
    INT: '悟性',
    POT: '资质',
    CHR: '魅力',
    LUCK: '气运',
};
const STAT_DESCRIPTIONS: Record<string, string> = {
    STR: '决定肉身强度与基础生存能力。',
    INT: '影响修行效率、悟道与破境稳定度。',
    POT: '决定吸纳灵气与成长上限。',
    CHR: '影响初见观感与人际互动表现。',
    LUCK: '决定奇遇质量与事件分支收益。',
};

const PROFESSION_META: Record<string, { label: string; mark: string; accent: string; soft: string }> = {
    alchemy: { label: '炼丹之道', mark: '丹', accent: 'text-rose-700', soft: 'bg-rose-50 border-rose-200' },
    artifact: { label: '炼器之道', mark: '器', accent: 'text-sky-700', soft: 'bg-sky-50 border-sky-200' },
    formation: { label: '阵法之道', mark: '阵', accent: 'text-violet-700', soft: 'bg-violet-50 border-violet-200' },
    talisman: { label: '符箓之道', mark: '符', accent: 'text-amber-700', soft: 'bg-amber-50 border-amber-200' },
};

const SELF_TABS = [
    { id: 'ATTR', label: '属性', icon: Dna, desc: '查看体魄、战力与成长面板。' },
    { id: 'FATE', label: '命格', icon: Star, desc: '查看命格、气运与后天特质。' },
    { id: 'REL', label: '关系', icon: Users, desc: '查看当前羁绊与可互动角色。' },
    { id: 'PROF', label: '技艺', icon: Hammer, desc: '查看四艺修习进度。' },
    { id: 'LOG', label: '生平', icon: History, desc: '按时间回看人生轨迹。' },
];

const NPC_TABS = [
    { id: 'ATTR', label: '属性', icon: Dna, desc: '查看可探查到的属性与战力。' },
    { id: 'FATE', label: '命格', icon: Star, desc: '查看可窥见的命格与气数。' },
];

function RadarChart({ values, masked }: { values: { key: string; name: string; val: number }[]; masked?: boolean }) {
    const maxVal = Math.max(20, ...values.map((item) => item.val));
    const radius = 34;
    const center = 60;
    const getPoint = (value: number, index: number) => {
        const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
        return `${center + (value / maxVal) * radius * Math.cos(angle)},${center + (value / maxVal) * radius * Math.sin(angle)}`;
    };
    const getLabelPoint = (index: number) => {
        const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
        const labelRadius = radius + 18;
        return {
            x: center + labelRadius * Math.cos(angle),
            y: center + labelRadius * Math.sin(angle),
        };
    };
    const polygon = values.map((item, index) => getPoint(masked ? 5 : item.val, index)).join(' ');

    return (
        <svg viewBox="0 0 120 120" className="h-full w-full">
            {[0.25, 0.5, 0.75, 1].map((ratio) => (
                <polygon
                    key={ratio}
                    points={values.map((_, index) => getPoint(maxVal * ratio, index)).join(' ')}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                />
            ))}
            {values.map((_, index) => {
                const [x, y] = getPoint(maxVal, index).split(',');
                return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />;
            })}
            <polygon points={polygon} fill={masked ? 'rgba(148,163,184,0.18)' : 'rgba(16,185,129,0.18)'} stroke={masked ? '#64748b' : '#10b981'} strokeWidth="2" />
            {values.map((item, index) => {
                const [cx, cy] = getPoint(masked ? 5 : item.val, index).split(',');
                const labelPoint = getLabelPoint(index);
                return (
                    <g key={item.key}>
                        <circle cx={cx} cy={cy} r="2.5" fill={masked ? '#64748b' : '#10b981'} />
                        <text x={labelPoint.x} y={labelPoint.y - 4} textAnchor="middle" className="fill-slate-500 text-[6px] font-semibold tracking-widest">
                            {item.name}
                        </text>
                        <text x={labelPoint.x} y={labelPoint.y + 5} textAnchor="middle" className={`text-[8px] font-bold ${masked ? 'fill-slate-400' : 'fill-slate-700'}`}>
                            {masked ? '?' : item.val}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

function GradeBadge({ grade, name, small }: { grade: FateGrade; name: string; small?: boolean }) {
    const color = FATE_GRADE_COLORS[grade];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border ${small ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1 text-xs'}`}
            style={{ borderColor: `${color}55`, backgroundColor: `${color}14` }}
        >
            <span className="font-bold" style={{ color }}>
                {FATE_GRADE_NAMES[grade]}
            </span>
            <span className="font-medium" style={{ color }}>
                {name}
            </span>
        </span>
    );
}

function MaskedValue({ value, masked }: { value: string | number; masked?: boolean }) {
    return <span className={masked ? 'select-none blur-[3px]' : ''}>{masked ? '???' : value}</span>;
}

function SectionTitle({ title, desc, accent }: { title: string; desc?: string; accent: string }) {
    return (
        <div className="mb-4 flex items-start gap-3">
            <span className={`mt-1 h-5 w-1.5 rounded-full ${accent}`} />
            <div>
                <div className="text-base font-semibold tracking-wide text-slate-800">{title}</div>
                {desc && <div className="mt-1 text-sm text-slate-500">{desc}</div>}
            </div>
        </div>
    );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
            <div className="text-lg font-semibold text-slate-700">{title}</div>
            <div className="mt-2 text-sm leading-6 text-slate-500">{desc}</div>
        </div>
    );
}

function getAffinityLabel(affinity: number) {
    if (affinity >= 90) return { label: '生死相许', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
    if (affinity >= 70) return { label: '知己莫逆', tone: 'text-violet-700 bg-violet-50 border-violet-200' };
    if (affinity >= 40) return { label: '相谈甚欢', tone: 'text-sky-700 bg-sky-50 border-sky-200' };
    if (affinity >= 10) return { label: '渐生熟络', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    if (affinity <= -60) return { label: '深仇大恨', tone: 'text-red-700 bg-red-50 border-red-200' };
    if (affinity <= -20) return { label: '心存芥蒂', tone: 'text-orange-700 bg-orange-50 border-orange-200' };
    return { label: '泛泛之交', tone: 'text-slate-600 bg-slate-50 border-slate-200' };
}

function getBondText(npc: { relationships?: string[] }) {
    if (hasBond(npc as never, 'DAO_PARTNER')) return '道侣';
    if (hasBond(npc as never, 'SWORN_SIBLING')) return '义亲';
    return null;
}

function getProfessionStage(level: number) {
    if (level >= 9) return '大成';
    if (level >= 7) return '精深';
    if (level >= 4) return '熟练';
    if (level >= 2) return '入门';
    return '初学';
}

function renderJusticeMeter(value: number) {
    const width = Math.min(50, Math.abs(value));
    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center justify-between text-sm text-slate-500">
                <span>立场倾向</span>
                <span className={`font-mono font-semibold ${value > 0 ? 'text-emerald-700' : value < 0 ? 'text-red-600' : 'text-slate-500'}`}>{value}</span>
            </div>
            <div className="flex items-center gap-3">
                <span className="w-8 text-center text-sm text-red-500">邪</span>
                <div className="relative h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-300" />
                    <div
                        className={`h-full rounded-full ${value > 0 ? 'bg-emerald-500' : value < 0 ? 'bg-red-500' : 'bg-slate-300'}`}
                        style={{ width: `${width}%`, marginLeft: value > 0 ? '50%' : `${50 - width}%` }}
                    />
                </div>
                <span className="w-8 text-center text-sm text-emerald-600">正</span>
            </div>
        </div>
    );
}

export const CharacterSheet = () => {
    const gameState = useGameStore((state) => state.gameState);
    const engine = useGameStore((state) => state.engine);
    const toggleCharacterSheet = useUIStore((state) => state.toggleCharacterSheet);
    const inspectTarget = useUIStore((state) => state.inspectTarget);
    const inspectNPC = useUIStore((state) => state.inspectNPC);
    const [activeTab, setActiveTab] = useState('ATTR');
    const [stableUid] = useState(() => Math.random().toString(36).slice(2, 10).toUpperCase());

    const isNPC = !!inspectTarget;
    const tabs = isNPC ? NPC_TABS : SELF_TABS;
    const safeTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : 'ATTR';

    const playerRealmIdx = gameState?.realm_idx ?? 0;
    const npcRealmIdx = REALMS.indexOf(inspectTarget?.realm || '凡人');
    const targetRealmIdx = npcRealmIdx >= 0 ? npcRealmIdx : 0;
    const canSeeStats = !isNPC || playerRealmIdx >= targetRealmIdx;
    const canSeeBattle = !isNPC || playerRealmIdx > targetRealmIdx;
    const canSeeDeep = !isNPC;

    const name = isNPC ? inspectTarget?.name || '' : gameState?.name || '';
    const gender = isNPC ? (inspectTarget?.gender === 'M' ? 'Male' : 'Female') : gameState?.gender || 'Male';
    const age = isNPC ? inspectTarget?.age || 0 : gameState?.age || 0;
    const realm = isNPC ? inspectTarget?.realm || '凡人' : REALMS[gameState?.realm_idx || 0];
    const attributes = isNPC ? inspectTarget?.attributes || {} : gameState?.attributes || {};
    const battleStats = isNPC ? inspectTarget?.battleStats || {} : gameState?.battleStats || {};
    const lifespan = isNPC ? inspectTarget.lifespan : engine?.getLifespan?.() || 60;
    const relation = isNPC ? inspectTarget.relation : null;
    const intimacy = isNPC ? inspectTarget.intimacy : null;
    const backgroundLabel = isNPC ? null : (gameState?.background === 'FARMER' ? '农家子弟' : gameState?.background === 'RICH' ? '修仙世家' : '芸芸众生');
    const fate: FateEntry[] = isNPC ? [] : (gameState?.fate || []);
    const fortuneBuffs: FortuneBuff[] = isNPC ? [] : (gameState?.fortuneBuffs || []);
    const personality = isNPC ? {} : (gameState?.personality || {});

    const mainAttrs = MAIN_STATS.map((key) => ({ key, name: STAT_LABELS[key], val: attributes[key] || 0 }));
    const hiddenStats = useMemo(() => XianxiaConfig.stats.filter((stat) => ['WIL', 'KARMA'].includes(stat.id)), []);
    const specialStats = useMemo(() => XianxiaConfig.stats.filter((stat) => ['TOXIN'].includes(stat.id)), []);
    const bondedNpcs = useMemo(
        () => (gameState?.world.worldNPCs || []).filter((npc) => (npc.relationships || []).includes('DAO_PARTNER') || (npc.relationships || []).includes('SWORN_SIBLING')),
        [gameState?.world.worldNPCs],
    );
    const historyEntries = useMemo(() => [...(gameState?.history || [])].reverse(), [gameState?.history]);
    const tabMeta = tabs.find((tab) => tab.id === safeTab);

    const handleClose = useCallback(() => {
        toggleCharacterSheet(false);
    }, [toggleCharacterSheet]);

    if (!gameState) return null;

    const quickStats = [
        { label: '年龄', value: `${age} 岁`, tone: 'bg-slate-50 border-slate-200 text-slate-700' },
        { label: '寿元', value: `${lifespan}`, tone: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
        !isNPC
            ? { label: '灵石', value: `${attributes.MONEY || 0}`, tone: 'bg-amber-50 border-amber-200 text-amber-700' }
            : { label: '关系', value: relation || '未知', tone: 'bg-sky-50 border-sky-200 text-sky-700' },
        !isNPC
            ? { label: '心境', value: `${attributes.MOOD || 0}`, tone: 'bg-rose-50 border-rose-200 text-rose-700' }
            : { label: '好感', value: `${intimacy ?? '--'}`, tone: 'bg-violet-50 border-violet-200 text-violet-700' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm" onClick={handleClose}>
            <div className="relative flex h-[86vh] w-full max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#fcfcfd,#f8fafc)] shadow-[0_40px_120px_rgba(15,23,42,0.32)]" onClick={(event) => event.stopPropagation()}>
                <button
                    onClick={handleClose}
                    className="absolute right-5 top-5 z-20 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
                >
                    关闭
                </button>

                <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-slate-200 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_36%),linear-gradient(180deg,#ffffff,#f8fafc)] p-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white/90 p-5 shadow-sm">
                        <div className="flex flex-col items-center text-center">
                            <div className="flex h-28 w-28 items-center justify-center rounded-[30px] border border-slate-200 bg-slate-50 text-5xl font-semibold text-slate-700 shadow-inner">
                                {name.slice(0, 1) || '修'}
                            </div>
                            <div className="mt-4 flex items-center gap-2 text-2xl font-semibold tracking-wide text-slate-800">
                                <span>{name}</span>
                                {gender === 'Male' ? <Mars className="h-4 w-4 text-sky-500" /> : <Venus className="h-4 w-4 text-rose-500" />}
                            </div>
                            <div className="mt-3 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm text-emerald-700">
                                {realm}
                            </div>
                            {backgroundLabel && <div className="mt-3 text-sm text-slate-500">{backgroundLabel}</div>}
                            {isNPC && (
                                <div className="mt-3 flex flex-wrap justify-center gap-2">
                                    {relation && <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{relation}</span>}
                                    {getBondText(inspectTarget) && <span className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">{getBondText(inspectTarget)}</span>}
                                </div>
                            )}
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                            {quickStats.map((item) => (
                                <div key={item.label} className={`rounded-2xl border px-3 py-3 ${item.tone}`}>
                                    <div className="text-[11px] tracking-[0.2em] opacity-75">{item.label}</div>
                                    <div className="mt-2 text-lg font-semibold">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <div className="text-[11px] tracking-[0.24em] text-slate-500">档案摘要</div>
                                <div className="mt-1 text-sm text-slate-700">{isNPC ? '目前已知情报' : '当前修行状态'}</div>
                            </div>
                            <Sparkles className="h-4 w-4 text-amber-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="text-xs text-slate-500">身份标识</div>
                                <div className="mt-2 font-mono text-sm text-slate-700">{isNPC ? `NPC · ${inspectTarget.id}` : `UID · ${stableUid}`}</div>
                            </div>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <div className="text-xs text-slate-500">境界阶段</div>
                                <div className="mt-2 text-sm font-semibold text-slate-800">
                                    {isNPC ? realm : CULTIVATION_REALMS[gameState.realm_idx]?.subRealms?.[gameState.sub_realm_idx] || '当前层次未细分'}
                                </div>
                            </div>
                            {!isNPC && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="text-xs text-slate-500">当前路线</div>
                                    <div className="mt-2 text-sm text-slate-700">
                                        {gameState.flags.includes('HAS_CULTIVATION_METHOD') ? '已踏入修行' : '仍在凡俗起步'}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <div className="text-[11px] tracking-[0.24em] text-slate-500">战斗属性</div>
                            {!canSeeBattle && <div className="text-xs text-amber-600">境界不足，部分遮蔽</div>}
                        </div>
                        <div className="custom-scrollbar space-y-2 overflow-y-auto pr-1">
                            {Object.entries(battleStats)
                                .filter(([key]) => !HIDDEN_BATTLE_KEYS.has(key))
                                .map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <span className="text-sm text-slate-600">{BATTLE_LABELS[key] || key}</span>
                                        <span className="font-mono text-sm font-semibold text-slate-800">
                                            <MaskedValue value={Math.floor((value as number) || 0)} masked={!canSeeBattle} />
                                        </span>
                                    </div>
                                ))}
                        </div>
                    </div>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col">
                    <div className="border-b border-slate-200 bg-white/80 px-8 py-6 backdrop-blur-sm">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[11px] tracking-[0.28em] text-slate-400">{isNPC ? '人物观察' : '角色总览'}</div>
                                <div className="mt-2 text-2xl font-semibold tracking-wide text-slate-900">{tabMeta?.label || '角色信息'}</div>
                                <div className="mt-2 text-sm text-slate-500">{tabMeta?.desc}</div>
                            </div>
                            {isNPC && !canSeeStats && (
                                <div className="flex max-w-md items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span>你的境界尚浅，只能观察到此人的表层信息。继续突破后可解锁更深层情报。</span>
                                </div>
                            )}
                        </div>
                        <div className="mt-5 flex flex-wrap gap-2">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const active = safeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all ${
                                            active
                                                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm'
                                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                        }`}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-8 py-8">
                        {safeTab === 'ATTR' && (
                            <div className="space-y-8">
                                <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
                                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                        <SectionTitle title="六维属性" desc="核心资质决定角色成长方向。" accent="bg-emerald-500" />
                                        <div className="mx-auto h-[280px] max-w-[280px]">
                                            <RadarChart values={mainAttrs} masked={!canSeeStats} />
                                        </div>
                                    </div>
                                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                        <SectionTitle title="属性拆解" desc="每一项都直接影响不同玩法的收益。" accent="bg-sky-500" />
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {mainAttrs.map((stat) => (
                                                <div key={stat.key} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="text-sm font-semibold text-slate-800">{stat.name}</div>
                                                        <div className="rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-sm font-semibold text-slate-700">
                                                            <MaskedValue value={stat.val} masked={!canSeeStats} />
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 text-sm leading-6 text-slate-500">{STAT_DESCRIPTIONS[stat.key]}</div>
                                                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                                                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500" style={{ width: `${Math.min(100, Math.max(8, ((stat.val || 0) / 30) * 100))}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {canSeeDeep && hiddenStats.length > 0 && (
                                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                        <SectionTitle title="隐性资质" desc="这些属性通常会在长线玩法里逐渐显露价值。" accent="bg-violet-500" />
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                            {hiddenStats.map((stat) => (
                                                <div key={stat.id} className="rounded-3xl border border-violet-100 bg-violet-50/70 p-4">
                                                    <div className="text-sm font-semibold text-violet-800">{stat.name}</div>
                                                    <div className="mt-3 text-2xl font-mono font-semibold text-violet-700">{attributes[stat.id] || 0}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {canSeeDeep && specialStats.length > 0 && (
                                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                        <SectionTitle title="特殊状态" desc="用于表达中毒、特殊体质等额外状态。" accent="bg-red-500" />
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                            {specialStats.map((stat) => (
                                                <div key={stat.id} className="rounded-3xl border border-red-100 bg-red-50/70 p-4">
                                                    <div className="text-sm font-semibold text-red-800">{stat.name}</div>
                                                    <div className="mt-3 text-2xl font-mono font-semibold text-red-700">{attributes[stat.id] || 0}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {safeTab === 'FATE' && (
                            <div className="space-y-8">
                                {!isNPC && (
                                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                                        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                            <SectionTitle title="先天命格" desc="命格会持续影响长期成长与特殊事件权重。" accent="bg-amber-500" />
                                            {fate.length > 0 ? (
                                                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                    {fate.map((item) => (
                                                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                            <GradeBadge grade={item.grade} name={item.name} />
                                                            <div className="mt-3 text-sm leading-6 text-slate-600">{item.description}</div>
                                                            {item.effects && Object.keys(item.effects).length > 0 && (
                                                                <div className="mt-4 flex flex-wrap gap-2">
                                                                    {Object.entries(item.effects).map(([key, value]) => (
                                                                        <span key={key} className={`rounded-full px-2.5 py-1 text-xs font-mono ${value > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                                            {key} {value > 0 ? '+' : ''}{value}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <EmptyState title="命格未定" desc="暂时还没有可展示的先天命格。后续事件与系统仍可继续补充。" />
                                            )}
                                        </div>
                                        <div className="space-y-6">
                                            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                                <SectionTitle title="正邪之道" desc="角色处世取向会影响后续分支。" accent="bg-slate-500" />
                                                {renderJusticeMeter(personality.JUSTICE || 0)}
                                            </div>
                                            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                                <SectionTitle title="后天特质" desc="事件、剧情与修行经历留下的长期痕迹。" accent="bg-indigo-500" />
                                                {gameState.acquiredTraits?.length ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {gameState.acquiredTraits.map((trait) => (
                                                            <div key={trait.id} className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700" title={trait.description}>
                                                                {trait.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                                                        暂无后天特质。
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {isNPC && (
                                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                        <SectionTitle title="可见命格" desc="受境界与探查能力影响，只能看到部分信息。" accent="bg-amber-500" />
                                        {canSeeStats && fate.length > 0 ? (
                                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                                {fate.map((item) => (
                                                    <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                        <GradeBadge grade={item.grade} name={item.name} />
                                                        <div className="mt-3 text-sm leading-6 text-slate-600">{item.description}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState title="无法窥探" desc="此人的命格与气数仍被迷雾遮掩，后续可通过提升境界继续观察。" />
                                        )}
                                    </div>
                                )}

                                {!isNPC && (
                                    <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                        <SectionTitle title="后天气运" desc="带有效期的增益更适合集中展示剩余时间。" accent="bg-sky-500" />
                                        {fortuneBuffs.length > 0 ? (
                                            <div className="space-y-3">
                                                {fortuneBuffs.map((buff) => (
                                                    <div key={buff.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                                                        <div className="flex flex-wrap items-center justify-between gap-3">
                                                            <GradeBadge grade={buff.grade} name={buff.name} />
                                                            <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono text-slate-600">
                                                                剩余 {buff.remainingMonths}/{buff.durationMonths} 月
                                                            </div>
                                                        </div>
                                                        <div className="mt-3 text-sm leading-6 text-slate-600">{buff.description}</div>
                                                        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    width: `${Math.max(0, Math.min(100, (buff.remainingMonths / Math.max(1, buff.durationMonths)) * 100))}%`,
                                                                    backgroundColor: FATE_GRADE_COLORS[buff.grade],
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="mt-4 flex flex-wrap gap-2">
                                                            {Object.entries(buff.effects).map(([key, value]) => (
                                                                <span key={key} className={`rounded-full px-2.5 py-1 text-xs font-mono ${value > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                                    {key} {value > 0 ? '+' : ''}{value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <EmptyState title="暂无气运" desc="当前没有处于生效中的后天气运增益。" />
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {safeTab === 'REL' && !isNPC && (
                            <div className="space-y-8">
                                <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                    <SectionTitle title="羁绊关系" desc="长期关系单独展示，便于和普通社交对象区分。" accent="bg-rose-500" />
                                    {bondedNpcs.length > 0 ? (
                                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                            {bondedNpcs.map((npc) => (
                                                <div key={`bond-${npc.id}`} className="rounded-3xl border border-rose-200 bg-rose-50/80 p-4">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <div className="text-lg font-semibold text-slate-800">{npc.name}</div>
                                                            <div className="mt-1 text-sm text-rose-700">{getBondText(npc) || '特殊关系'}</div>
                                                        </div>
                                                        <div className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs text-rose-700">
                                                            缘分 {npc.affinity || 0}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 text-sm text-slate-600">{REALMS[npc.realmIndex]} · {npc.position}</div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <EmptyState title="暂无羁绊" desc="继续互动、推进剧情与积累好感，后续可发展为更深层关系。" />
                                    )}
                                </div>

                                <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                    <SectionTitle title="人物关系网" desc="点击角色卡可直接切换到人物详情。" accent="bg-sky-500" />
                                    {gameState.relationships.length > 0 ? (
                                        <div className="grid gap-3 md:grid-cols-2">
                                            {gameState.relationships.map((npc: NPC) => {
                                                const affinityTag = getAffinityLabel(npc.affinity);
                                                return (
                                                    <button
                                                        key={npc.id}
                                                        onClick={() => inspectNPC(npc)}
                                                        className="group rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-left transition-all hover:border-emerald-200 hover:bg-white hover:shadow-sm"
                                                    >
                                                        <div className="flex items-start gap-4">
                                                            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border bg-white text-xl font-semibold ${npc.gender === 'F' ? 'border-rose-200 text-rose-500' : 'border-sky-200 text-sky-500'}`}>
                                                                {npc.name.slice(0, 1)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div>
                                                                        <div className="text-base font-semibold text-slate-800">{npc.name}</div>
                                                                        <div className="mt-1 text-sm text-slate-500">{npc.realm || '凡人'} · {npc.age}/{npc.lifespan} 岁</div>
                                                                    </div>
                                                                    <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                                                                </div>
                                                                <div className="mt-3 flex flex-wrap gap-2">
                                                                    <span className={`rounded-full border px-2.5 py-1 text-xs ${affinityTag.tone}`}>{affinityTag.label}</span>
                                                                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600">{npc.relation}</span>
                                                                    {getBondText(npc) && <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700">{getBondText(npc)}</span>}
                                                                </div>
                                                                <div className="mt-4">
                                                                    <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                                                                        <span>好感</span>
                                                                        <span className="font-mono">{npc.intimacy}</span>
                                                                    </div>
                                                                    <div className="h-2 overflow-hidden rounded-full bg-white">
                                                                        <div className="h-full rounded-full bg-gradient-to-r from-rose-400 to-amber-400" style={{ width: `${Math.max(0, Math.min(100, npc.intimacy || 0))}%` }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <EmptyState title="暂无故人" desc="目前还没有建立关系网络，继续探索世界后这里会逐步热闹起来。" />
                                    )}
                                </div>
                            </div>
                        )}

                        {safeTab === 'PROF' && !isNPC && (
                            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <SectionTitle title="技艺修习" desc="工艺线单独以进度卡展示，便于判断下一个投入方向。" accent="bg-amber-500" />
                                <div className="grid gap-4 md:grid-cols-2">
                                    {Object.entries(gameState.professions).map(([key, stats]) => {
                                        const meta = PROFESSION_META[key] || { label: key, mark: '技', accent: 'text-slate-700', soft: 'bg-slate-50 border-slate-200' };
                                        const profession = stats as ProfessionStats;
                                        const progress = profession.maxExp > 0 ? Math.max(0, Math.min(100, (profession.exp / profession.maxExp) * 100)) : 0;
                                        return (
                                            <div key={key} className={`relative overflow-hidden rounded-[28px] border p-5 ${meta.soft}`}>
                                                <div className="absolute -bottom-4 -right-2 text-7xl font-black text-slate-900/5">{meta.mark}</div>
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <div className={`text-lg font-semibold ${meta.accent}`}>{meta.label}</div>
                                                        <div className="mt-1 text-sm text-slate-500">Lv.{profession.level} · {getProfessionStage(profession.level)}</div>
                                                    </div>
                                                    <div className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-mono text-slate-600">
                                                        {profession.exp}/{profession.maxExp}
                                                    </div>
                                                </div>
                                                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/90">
                                                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-sky-500" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {safeTab === 'LOG' && !isNPC && (
                            <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
                                <SectionTitle title="生平纪事" desc="最新记录置顶，更符合回看和排查剧情进度的习惯。" accent="bg-slate-500" />
                                {historyEntries.length > 0 ? (
                                    <div className="space-y-2">
                                        {historyEntries.map((entry, index) => (
                                            <div key={`${entry}-${index}`} className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                                <div className="w-12 shrink-0 rounded-xl border border-slate-200 bg-white px-2 py-1 text-center text-xs font-mono text-slate-500">
                                                    #{historyEntries.length - index}
                                                </div>
                                                <div className="min-w-0 flex-1 text-sm leading-6 text-slate-600">{entry}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyState title="尚无记载" desc="当前还没有写入生平记录。后续剧情、奇遇与关键行动都会沉淀到这里。" />
                                )}
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};
