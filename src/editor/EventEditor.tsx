import React, { useMemo, useState } from 'react';
import { ScrollText } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Condition, Effect, EventChoice, GameEvent } from '../types';
import { ChoiceEditor } from './ChoiceEditor';
import { ConditionBuilder } from './ConditionBuilder';
import { EffectEditor } from './EffectEditor';

type EventCategory = 'ALL' | 'CORE' | 'INFANT' | 'MORTAL' | 'QI' | 'CHILDHOOD';

function categorizeEvent(id: string): EventCategory {
    if (id.startsWith('EVT_INF_')) return 'INFANT';
    if (id.startsWith('EVT_MORTAL_')) return 'MORTAL';
    if (id.startsWith('EVT_QI_') || id.startsWith('EVT_MARKET_') || id.startsWith('EVT_SECT_') || id.startsWith('EVT_AUCTION_') || id.startsWith('EVT_DEMONIC_') || id.startsWith('EVT_SUDDEN_') || id.startsWith('EVT_SAVING_')) return 'QI';
    if (id.startsWith('evt_c_')) return 'CHILDHOOD';
    return 'CORE';
}

const CATEGORY_LABELS: Record<EventCategory, string> = {
    ALL: '全部',
    CORE: '核心事件',
    INFANT: '婴幼儿',
    MORTAL: '凡人阶段',
    QI: '炼气阶段',
    CHILDHOOD: '童年成长',
};

const CATEGORY_COLORS: Record<EventCategory, string> = {
    ALL: 'text-slate-300',
    CORE: 'text-amber-400',
    INFANT: 'text-pink-400',
    MORTAL: 'text-emerald-400',
    QI: 'text-sky-400',
    CHILDHOOD: 'text-orange-400',
};

function createBlankEvent(): GameEvent {
    return {
        id: `EVT_NEW_${Date.now().toString(36).toUpperCase()}`,
        title: '新事件',
        content: '在此输入事件描述...',
        conditions: [],
        choices: [],
    };
}

export const EventEditor: React.FC = () => {
    const { engine, upsertRuntimeEvent, deleteRuntimeEvent } = useGameStore();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [category, setCategory] = useState<EventCategory>('ALL');
    const [editedEvent, setEditedEvent] = useState<GameEvent | null>(null);
    const [jsonMode, setJsonMode] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const [jsonError, setJsonError] = useState('');
    const [importText, setImportText] = useState('');
    const [showImport, setShowImport] = useState(false);

    const events = engine.events;

    const filteredEvents = useMemo(() => {
        return events.filter(event => {
            const matchSearch = searchTerm === ''
                || event.id.toLowerCase().includes(searchTerm.toLowerCase())
                || (event.title && event.title.includes(searchTerm))
                || (event.content && event.content.includes(searchTerm));
            const matchCategory = category === 'ALL' || categorizeEvent(event.id) === category;
            return matchSearch && matchCategory;
        });
    }, [events, searchTerm, category]);

    const categoryCounts = useMemo(() => {
        const counts: Record<EventCategory, number> = { ALL: events.length, CORE: 0, INFANT: 0, MORTAL: 0, QI: 0, CHILDHOOD: 0 };
        events.forEach(event => {
            counts[categorizeEvent(event.id)]++;
        });
        return counts;
    }, [events]);

    const loadEventIntoEditor = (eventId: string | null) => {
        setSelectedEventId(eventId);
        if (!eventId) {
            setEditedEvent(null);
            setJsonMode(false);
            setJsonText('');
            setJsonError('');
            return;
        }

        const source = events.find(event => event.id === eventId);
        const cloned = source ? JSON.parse(JSON.stringify(source)) as GameEvent : null;
        setEditedEvent(cloned);
        setJsonMode(false);
        setJsonText('');
        setJsonError('');
    };

    const handleSave = () => {
        if (!editedEvent) return;
        upsertRuntimeEvent(editedEvent);
        alert('已保存到运行时事件池，刷新页面后会重置。');
    };

    const handleNew = () => {
        const newEvent = createBlankEvent();
        upsertRuntimeEvent(newEvent);
        setCategory('ALL');
        loadEventIntoEditor(newEvent.id);
    };

    const handleDelete = () => {
        if (!editedEvent) return;
        if (!confirm(`确定删除事件 "${editedEvent.title || editedEvent.id}"？`)) return;
        deleteRuntimeEvent(editedEvent.id);
        loadEventIntoEditor(null);
    };

    const handleJsonApply = () => {
        try {
            const parsed = JSON.parse(jsonText) as GameEvent;
            if (!parsed.id || !parsed.content) {
                setJsonError('JSON 必须包含 id 和 content 字段');
                return;
            }
            setEditedEvent(parsed);
            setJsonError('');
            setJsonMode(false);
        } catch (error) {
            setJsonError(`JSON 解析错误: ${(error as Error).message}`);
        }
    };

    const handleExportSelected = () => {
        if (!editedEvent) return;
        const json = JSON.stringify(editedEvent, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${editedEvent.id}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleExportAll = () => {
        const target = category === 'ALL' ? events : filteredEvents;
        const json = JSON.stringify(target, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `events_${category.toLowerCase()}_export.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleImport = () => {
        try {
            const parsed = JSON.parse(importText);
            const importedEvents: GameEvent[] = Array.isArray(parsed) ? parsed : [parsed];
            let added = 0;
            for (const event of importedEvents) {
                if (!event.id || !event.content) continue;
                upsertRuntimeEvent(event);
                added++;
            }
            setShowImport(false);
            setImportText('');
            alert(`成功导入 ${added} 个事件`);
        } catch (error) {
            alert(`JSON 解析失败: ${(error as Error).message}`);
        }
    };

    const handleConditionChange = (conditions: Condition[]) => {
        if (!editedEvent) return;
        setEditedEvent({ ...editedEvent, conditions });
    };

    const handleChoicesChange = (choices: EventChoice[]) => {
        if (!editedEvent) return;
        const nextEvent = { ...editedEvent, choices };
        if (choices.length > 0 && nextEvent.effect) {
            delete nextEvent.effect;
        }
        setEditedEvent(nextEvent);
    };

    const handleDirectEffectChange = (effect: Effect) => {
        if (!editedEvent) return;
        setEditedEvent({ ...editedEvent, effect });
    };

    const toggleJsonMode = () => {
        const nextMode = !jsonMode;
        setJsonMode(nextMode);
        if (nextMode && editedEvent) {
            setJsonText(JSON.stringify(editedEvent, null, 2));
            setJsonError('');
        }
    };

    return (
        <div className="flex h-full gap-4">
            <div className="w-80 flex flex-col gap-2 h-full shrink-0">
                <div className="flex gap-2">
                    <button
                        onClick={handleNew}
                        className="flex-1 text-xs px-2 py-1.5 bg-emerald-700 text-white rounded hover:bg-emerald-600 transition-colors"
                    >
                        + 新建事件
                    </button>
                    <button
                        onClick={() => setShowImport(!showImport)}
                        className="text-xs px-2 py-1.5 bg-blue-700 text-white rounded hover:bg-blue-600 transition-colors"
                    >
                        导入
                    </button>
                    <button
                        onClick={handleExportAll}
                        className="text-xs px-2 py-1.5 bg-slate-700 text-white rounded hover:bg-slate-600 transition-colors"
                    >
                        导出
                    </button>
                </div>

                {showImport && (
                    <div className="bg-slate-800 border border-blue-500/30 rounded p-2 space-y-2">
                        <textarea
                            className="w-full h-32 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-slate-200 font-mono outline-none focus:border-blue-500 resize-none"
                            value={importText}
                            onChange={e => setImportText(e.target.value)}
                            placeholder="粘贴 JSON 事件数据（对象或数组）..."
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleImport}
                                className="flex-1 text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500"
                            >
                                确认导入
                            </button>
                            <button
                                onClick={() => {
                                    setShowImport(false);
                                    setImportText('');
                                }}
                                className="text-xs px-2 py-1 bg-slate-700 text-white rounded hover:bg-slate-600"
                            >
                                取消
                            </button>
                        </div>
                    </div>
                )}

                <input
                    type="text"
                    placeholder="搜索事件 ID / 标题 / 内容..."
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-slate-200 focus:border-emerald-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />

                <div className="flex flex-wrap gap-1">
                    {(Object.keys(CATEGORY_LABELS) as EventCategory[]).map(item => (
                        <button
                            key={item}
                            onClick={() => setCategory(item)}
                            className={`text-xs px-2 py-1 rounded transition-colors ${category === item
                                ? 'bg-slate-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {CATEGORY_LABELS[item]} ({categoryCounts[item]})
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto bg-slate-800/50 border border-slate-700 rounded-lg p-1.5 space-y-0.5 custom-scrollbar">
                    {filteredEvents.map(event => {
                        const eventCategory = categorizeEvent(event.id);
                        return (
                            <button
                                key={event.id}
                                onClick={() => loadEventIntoEditor(event.id)}
                                className={`w-full text-left p-2 rounded text-sm hover:bg-slate-700/50 transition-colors ${selectedEventId === event.id
                                    ? 'bg-emerald-900/40 border border-emerald-500/40'
                                    : 'border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-mono ${CATEGORY_COLORS[eventCategory]}`}>
                                        {CATEGORY_LABELS[eventCategory]}
                                    </span>
                                    {event.choices && event.choices.length > 0 && (
                                        <span className="text-[10px] bg-amber-700/30 text-amber-300 px-1 rounded">
                                            {event.choices.length} 选项
                                        </span>
                                    )}
                                    {event.branches && event.branches.length > 0 && (
                                        <span className="text-[10px] bg-red-700/30 text-red-300 px-1 rounded">
                                            分支
                                        </span>
                                    )}
                                </div>
                                <div className="font-bold text-slate-200 text-xs mt-0.5">{event.title || '无标题'}</div>
                                <div className="text-[10px] text-slate-500 font-mono truncate">{event.id}</div>
                            </button>
                        );
                    })}
                    {filteredEvents.length === 0 && (
                        <div className="text-xs text-slate-600 italic text-center py-4">无匹配事件</div>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-slate-800/30 border border-slate-700 rounded-lg h-full overflow-hidden flex flex-col">
                {editedEvent ? (
                    <>
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-800/60 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <h3 className="text-lg font-serif font-bold text-emerald-400">{editedEvent.title || '无标题'}</h3>
                                <span className="text-xs font-mono text-slate-500">{editedEvent.id}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={toggleJsonMode}
                                    className={`px-3 py-1 rounded text-xs transition-colors ${jsonMode
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    {jsonMode ? '可视化模式' : 'JSON 模式'}
                                </button>
                                <button
                                    onClick={handleExportSelected}
                                    className="px-3 py-1 bg-slate-700 text-slate-300 rounded text-xs hover:bg-slate-600"
                                >
                                    导出
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="px-3 py-1 bg-red-800 text-red-200 rounded text-xs hover:bg-red-700"
                                >
                                    删除
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs"
                                >
                                    保存
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">
                            {jsonMode ? (
                                <div className="space-y-2">
                                    <textarea
                                        className="w-full h-[60vh] bg-slate-900 border border-slate-600 rounded p-3 text-xs text-slate-200 font-mono outline-none focus:border-purple-500 resize-none"
                                        value={jsonText}
                                        onChange={e => setJsonText(e.target.value)}
                                    />
                                    {jsonError && (
                                        <div className="text-xs text-red-400 bg-red-900/20 rounded p-2">{jsonError}</div>
                                    )}
                                    <button
                                        onClick={handleJsonApply}
                                        className="px-4 py-1.5 bg-purple-700 text-white rounded text-sm hover:bg-purple-600"
                                    >
                                        应用 JSON
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">ID</label>
                                            <input
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-300 font-mono"
                                                value={editedEvent.id}
                                                onChange={e => setEditedEvent({ ...editedEvent, id: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">标题</label>
                                            <input
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                                                value={editedEvent.title || ''}
                                                onChange={e => setEditedEvent({ ...editedEvent, title: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">触发概率 (0~1，空表示必触发)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                                                value={editedEvent.probability ?? ''}
                                                onChange={e => {
                                                    const value = e.target.value;
                                                    if (value === '') {
                                                        const nextEvent = { ...editedEvent };
                                                        delete nextEvent.probability;
                                                        setEditedEvent(nextEvent);
                                                    } else {
                                                        setEditedEvent({ ...editedEvent, probability: Number(value) });
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-mono text-slate-500 mb-1">事件类型</label>
                                            <select
                                                className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 outline-none focus:border-emerald-500"
                                                value={editedEvent.eventType || ''}
                                                onChange={e => {
                                                    const value = e.target.value as GameEvent['eventType'];
                                                    if (value) {
                                                        setEditedEvent({ ...editedEvent, eventType: value });
                                                    } else {
                                                        const nextEvent = { ...editedEvent };
                                                        delete nextEvent.eventType;
                                                        setEditedEvent(nextEvent);
                                                    }
                                                }}
                                            >
                                                <option value="">无</option>
                                                <option value="MAIN">主线 MAIN</option>
                                                <option value="RANDOM">随机 RANDOM</option>
                                                <option value="CRISIS">危机 CRISIS</option>
                                                <option value="OPPORTUNITY">机遇 OPPORTUNITY</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">事件描述</label>
                                        <textarea
                                            className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1.5 text-sm text-slate-200 h-24 outline-none focus:border-emerald-500 resize-y"
                                            value={editedEvent.content || ''}
                                            onChange={e => setEditedEvent({ ...editedEvent, content: e.target.value })}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-mono text-slate-500 mb-1">触发条件</label>
                                        <ConditionBuilder
                                            conditions={editedEvent.conditions || []}
                                            onChange={handleConditionChange}
                                        />
                                    </div>

                                    <div className="border-t border-slate-700 pt-4">
                                        <div className="flex items-center gap-4 mb-3">
                                            <span className="text-sm font-bold text-slate-300">事件结果</span>
                                            <div className="flex gap-2 text-xs">
                                                <button
                                                    onClick={() => {
                                                        if (!editedEvent.choices || editedEvent.choices.length === 0) {
                                                            setEditedEvent({
                                                                ...editedEvent,
                                                                choices: [{ text: '选项一', effect: {} }],
                                                                effect: undefined,
                                                            });
                                                        }
                                                    }}
                                                    className={`px-2 py-1 rounded ${(editedEvent.choices && editedEvent.choices.length > 0)
                                                        ? 'bg-amber-700 text-white'
                                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    多选项模式
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditedEvent({
                                                            ...editedEvent,
                                                            choices: undefined,
                                                            effect: editedEvent.effect || {},
                                                        });
                                                    }}
                                                    className={`px-2 py-1 rounded ${(!editedEvent.choices || editedEvent.choices.length === 0)
                                                        ? 'bg-emerald-700 text-white'
                                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                                        }`}
                                                >
                                                    直接效果模式
                                                </button>
                                            </div>
                                        </div>

                                        {editedEvent.choices && editedEvent.choices.length > 0 ? (
                                            <ChoiceEditor choices={editedEvent.choices} onChange={handleChoicesChange} />
                                        ) : (
                                            <EffectEditor effect={editedEvent.effect || {}} onChange={handleDirectEffectChange} label="直接效果" />
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <ScrollText className="w-10 h-10 text-slate-600 mb-4" />
                        <div className="text-lg italic">选择一个事件进行编辑</div>
                        <div className="text-xs mt-2">或点击“新建事件”创建</div>
                    </div>
                )}
            </div>
        </div>
    );
};
