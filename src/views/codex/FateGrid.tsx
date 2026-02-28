import React, { useState, useMemo } from 'react';
import type { GameEvent, Condition } from '../../types';

interface FateGridProps {
    events: GameEvent[];
}

// 事件类型配色 (亮色主题)
const EVENT_TYPE_CONFIG: Record<string, { color: string, bg: string, border: string, label: string, icon: string }> = {
    MAIN: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: '主线', icon: '⚔' },
    CRISIS: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: '危机', icon: '⚡' },
    OPPORTUNITY: { color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', label: '机缘', icon: '✦' },
    RANDOM: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', label: '随机', icon: '◎' },
    DEFAULT: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: '事件', icon: '◈' },
};

const getTypeConfig = (evt: GameEvent) => {
    if (evt.eventType && EVENT_TYPE_CONFIG[evt.eventType]) return EVENT_TYPE_CONFIG[evt.eventType];
    if (evt.title?.includes('灾') || evt.title?.includes('死') || evt.title?.includes('魔')) return EVENT_TYPE_CONFIG.CRISIS;
    return EVENT_TYPE_CONFIG.DEFAULT;
};

// 从 V2 条件提取年龄
const getEventAge = (evt: GameEvent): number | undefined => {
    if (!evt.conditions) return undefined;
    const ageCond = evt.conditions.find(c => c.type === 'AGE' && c.op === 'EQ');
    return ageCond ? Number(ageCond.value) : undefined;
};

// 格式化条件
const formatConditions = (conditions?: Condition[]): string => {
    if (!conditions || conditions.length === 0) return '无';
    return conditions.map(c => {
        const t = c.target ? `${c.target} ` : '';
        return `${c.type}:${t}${c.op} ${c.value}`;
    }).join(', ');
};

// 分组逻辑
type GroupKey = 'MAIN' | 'CRISIS' | 'OPPORTUNITY' | 'RANDOM' | 'OTHER';

const groupEvent = (evt: GameEvent): GroupKey => {
    if (evt.eventType === 'MAIN') return 'MAIN';
    if (evt.eventType === 'CRISIS') return 'CRISIS';
    if (evt.eventType === 'OPPORTUNITY') return 'OPPORTUNITY';
    if (evt.eventType === 'RANDOM') return 'RANDOM';
    if (evt.title?.includes('灾') || evt.title?.includes('死') || evt.title?.includes('魔')) return 'CRISIS';
    return 'OTHER';
};

const GROUP_LABELS: Record<GroupKey, { label: string, icon: string, color: string }> = {
    MAIN: { label: '主线事件', icon: '⚔', color: 'text-amber-700' },
    CRISIS: { label: '危机灾厄', icon: '⚡', color: 'text-rose-700' },
    OPPORTUNITY: { label: '天降机缘', icon: '✦', color: 'text-sky-700' },
    RANDOM: { label: '随机杂闻', icon: '◎', color: 'text-slate-600' },
    OTHER: { label: '其他事件', icon: '◈', color: 'text-emerald-700' },
};

const GROUP_ORDER: GroupKey[] = ['MAIN', 'CRISIS', 'OPPORTUNITY', 'RANDOM', 'OTHER'];

export const FateGrid: React.FC<FateGridProps> = ({ events }) => {
    const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeGroupFilter, setActiveGroupFilter] = useState<GroupKey | 'ALL'>('ALL');
    const [sortBy, setSortBy] = useState<'age' | 'name' | 'type'>('age');

    // 筛选+搜索
    const filteredEvents = useMemo(() => {
        let result = events;

        // 分组筛选
        if (activeGroupFilter !== 'ALL') {
            result = result.filter(e => groupEvent(e) === activeGroupFilter);
        }

        // 搜索
        if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            result = result.filter(e =>
                e.title?.toLowerCase().includes(q) ||
                e.id.toLowerCase().includes(q) ||
                e.content?.toLowerCase().includes(q)
            );
        }

        // 排序
        result = [...result].sort((a, b) => {
            if (sortBy === 'age') {
                return (getEventAge(a) ?? 999) - (getEventAge(b) ?? 999);
            }
            if (sortBy === 'name') {
                return (a.title || '').localeCompare(b.title || '');
            }
            return (a.eventType || '').localeCompare(b.eventType || '');
        });

        return result;
    }, [events, activeGroupFilter, searchQuery, sortBy]);

    // 按组分组显示
    const groupedEvents = useMemo(() => {
        if (activeGroupFilter !== 'ALL') {
            return [{ key: activeGroupFilter as GroupKey, events: filteredEvents }];
        }
        const groups: { key: GroupKey, events: GameEvent[] }[] = [];
        for (const gk of GROUP_ORDER) {
            const items = filteredEvents.filter(e => groupEvent(e) === gk);
            if (items.length > 0) groups.push({ key: gk, events: items });
        }
        return groups;
    }, [filteredEvents, activeGroupFilter]);

    // 统计
    const stats = useMemo(() => {
        const counts: Record<GroupKey, number> = { MAIN: 0, CRISIS: 0, OPPORTUNITY: 0, RANDOM: 0, OTHER: 0 };
        events.forEach(e => counts[groupEvent(e)]++);
        return counts;
    }, [events]);

    return (
        <>
            {/* 工具栏 */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* 搜索框 */}
                <div className="relative flex-1 max-w-md">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="搜索事件名称、ID 或内容..."
                        className="w-full px-4 py-2.5 pl-10 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all font-serif"
                    />
                    <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </div>

                <div className="flex gap-2 items-center">
                    {/* 排序 */}
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'age' | 'name' | 'type')}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-600 font-serif focus:outline-none focus:border-emerald-400"
                    >
                        <option value="age">按年龄排序</option>
                        <option value="name">按名称排序</option>
                        <option value="type">按类型排序</option>
                    </select>

                    {/* 统计 */}
                    <div className="text-xs text-slate-400 font-mono">
                        {filteredEvents.length}/{events.length}
                    </div>
                </div>
            </div>

            {/* 分类标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setActiveGroupFilter('ALL')}
                    className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider border transition-all ${activeGroupFilter === 'ALL'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                        }`}
                >
                    全部 ({events.length})
                </button>
                {GROUP_ORDER.map(gk => (
                    <button
                        key={gk}
                        onClick={() => setActiveGroupFilter(gk === activeGroupFilter ? 'ALL' : gk)}
                        className={`px-4 py-1.5 rounded-full text-xs font-serif tracking-wider border transition-all ${activeGroupFilter === gk
                                ? `${EVENT_TYPE_CONFIG[gk]?.bg || 'bg-emerald-50'} ${EVENT_TYPE_CONFIG[gk]?.color || 'text-emerald-700'} ${EVENT_TYPE_CONFIG[gk]?.border || 'border-emerald-200'}`
                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                            }`}
                    >
                        {GROUP_LABELS[gk].icon} {GROUP_LABELS[gk].label} ({stats[gk]})
                    </button>
                ))}
            </div>

            {/* 分组事件列表 */}
            <div className="space-y-8">
                {groupedEvents.map(group => (
                    <div key={group.key}>
                        {/* 分组标题 */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`text-xl ${GROUP_LABELS[group.key].color}`}>{GROUP_LABELS[group.key].icon}</span>
                            <h3 className={`text-lg font-serif font-bold tracking-wider ${GROUP_LABELS[group.key].color}`}>
                                {GROUP_LABELS[group.key].label}
                            </h3>
                            <span className="text-xs text-slate-400 font-mono">({group.events.length})</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                        </div>

                        {/* 事件卡片网格 */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                            {group.events.map(evt => {
                                const config = getTypeConfig(evt);
                                const age = getEventAge(evt);
                                const choiceCount = evt.choices?.length || 0;

                                return (
                                    <div
                                        key={evt.id}
                                        onClick={() => setSelectedEvent(evt)}
                                        className={`
                                            p-4 rounded-lg border cursor-pointer transition-all duration-200 group
                                            bg-white hover:shadow-md hover:-translate-y-0.5
                                            ${config.border} hover:border-slate-300
                                        `}
                                    >
                                        {/* 头部：类型标签 + 年龄 */}
                                        <div className="flex items-center justify-between mb-2">
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${config.bg} ${config.color} ${config.border} border font-serif`}>
                                                {config.icon} {config.label}
                                            </span>
                                            {age !== undefined && (
                                                <span className="text-[10px] text-slate-400 font-mono">{age}岁</span>
                                            )}
                                        </div>

                                        {/* 事件名 */}
                                        <h4 className="text-sm font-serif font-bold text-slate-800 mb-1 truncate group-hover:text-emerald-700 transition-colors">
                                            {evt.title || evt.id}
                                        </h4>

                                        {/* 内容预览 */}
                                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-2 leading-relaxed">
                                            {evt.content || '暂无描述'}
                                        </p>

                                        {/* 底部信息 */}
                                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                            {choiceCount > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-emerald-500">◇</span> {choiceCount}个选项
                                                </span>
                                            )}
                                            {evt.conditions && evt.conditions.length > 0 && (
                                                <span className="flex items-center gap-1">
                                                    <span className="text-amber-500">⊙</span> {evt.conditions.length}条件
                                                </span>
                                            )}
                                            <span className="font-mono opacity-50 ml-auto truncate max-w-[80px]">{evt.id}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="text-center py-16">
                        <div className="text-4xl mb-4 text-slate-300">◈</div>
                        <div className="text-slate-400 font-serif">未找到匹配的事件</div>
                        <div className="text-xs text-slate-400 mt-1">尝试更改搜索条件或分类筛选</div>
                    </div>
                )}
            </div>

            {/* 详情弹窗 */}
            {selectedEvent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setSelectedEvent(null)}>
                    <div
                        className={`relative w-full max-w-lg p-8 rounded-xl border bg-white shadow-2xl ${getTypeConfig(selectedEvent).border}`}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* 顶部 ID + 年龄标签 */}
                        <div className="absolute -top-3 -left-3 bg-slate-50 px-3 py-1 border border-slate-200 text-xs font-mono text-slate-400 rounded">
                            {selectedEvent.id}
                        </div>
                        <div className="absolute top-4 right-4">
                            {(() => {
                                const age = getEventAge(selectedEvent); return age !== undefined ? (
                                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{age}岁</span>
                                ) : null;
                            })()}
                        </div>

                        {/* 标题 */}
                        <h2 className={`text-2xl font-bold font-serif mb-2 ${getTypeConfig(selectedEvent).color}`}>
                            {selectedEvent.title}
                        </h2>

                        {/* 标签 */}
                        <div className="flex gap-2 mb-5">
                            <span className={`text-xs px-2.5 py-1 rounded-full border ${getTypeConfig(selectedEvent).border} ${getTypeConfig(selectedEvent).color} ${getTypeConfig(selectedEvent).bg}`}>
                                {getTypeConfig(selectedEvent).icon} {getTypeConfig(selectedEvent).label}
                            </span>
                        </div>

                        {/* 触发条件 */}
                        {selectedEvent.conditions && selectedEvent.conditions.length > 0 && (
                            <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="text-[10px] text-slate-400 font-mono mb-1.5 tracking-wider">触发条件</div>
                                <div className="text-xs text-slate-600 font-mono">{formatConditions(selectedEvent.conditions)}</div>
                            </div>
                        )}

                        {/* 内容 */}
                        <p className="text-slate-700 leading-relaxed text-base mb-6 font-serif">
                            {selectedEvent.content}
                        </p>

                        {/* 选项/效果 */}
                        <div className="space-y-3">
                            {selectedEvent.choices ? (
                                <div className="space-y-2">
                                    <div className="text-[10px] text-slate-400 font-mono tracking-wider mb-2">分支选项</div>
                                    {selectedEvent.choices.map((c, i) => (
                                        <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-slate-700 font-bold font-serif">{c.text}</span>
                                                {c.conditions && <span className="text-[10px] text-amber-600 font-mono">{formatConditions(c.conditions)}</span>}
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-mono">
                                                {JSON.stringify(c.effect).replace(/["{}]/g, '').replace(/,/g, ', ')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : selectedEvent.effect && (
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-[10px] text-slate-400 font-mono mb-1 tracking-wider">效果</div>
                                    <div className="text-xs text-slate-600 font-mono">
                                        {JSON.stringify(selectedEvent.effect).replace(/["{}]/g, '').replace(/,/g, ', ')}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm font-serif"
                            onClick={() => setSelectedEvent(null)}
                        >
                            关闭
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};
