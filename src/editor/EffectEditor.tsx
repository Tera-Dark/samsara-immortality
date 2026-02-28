import React from 'react';
import type { Effect } from '../types';
import { TEXT_CONSTANTS } from '../data/rules';

interface EffectEditorProps {
    effect: Effect;
    onChange: (effect: Effect) => void;
    label?: string;
}

const STAT_KEYS = Object.keys(TEXT_CONSTANTS.STATS) as (keyof typeof TEXT_CONSTANTS.STATS)[];

export const EffectEditor: React.FC<EffectEditorProps> = ({ effect, onChange, label = '效果' }) => {
    // Extract numeric stats from effect
    const statEntries = Object.entries(effect).filter(
        ([k, v]) => typeof v === 'number' && !['probability'].includes(k)
    ) as [string, number][];

    const handleStatChange = (key: string, value: number) => {
        onChange({ ...effect, [key]: value });
    };

    const handleStatRemove = (key: string) => {
        const next = { ...effect };
        delete next[key];
        onChange(next);
    };

    const handleAddStat = () => {
        // Find a stat not already used
        const used = new Set(statEntries.map(([k]) => k));
        const available = STAT_KEYS.find(k => !used.has(k));
        if (available) {
            onChange({ ...effect, [available]: 1 });
        }
    };

    const handleHistoryChange = (history: string) => {
        if (history) {
            onChange({ ...effect, history });
        } else {
            const next = { ...effect };
            delete next.history;
            onChange(next);
        }
    };

    const handleFlagsChange = (flagsStr: string) => {
        const flags = flagsStr.split(',').map(s => s.trim()).filter(Boolean);
        if (flags.length > 0) {
            onChange({ ...effect, flags });
        } else {
            const next = { ...effect };
            delete next.flags;
            onChange(next);
        }
    };

    return (
        <div className="bg-slate-800/40 border border-slate-600 rounded p-3 space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">{label}</span>
                <button
                    onClick={handleAddStat}
                    className="text-xs px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded hover:bg-emerald-600"
                >
                    + 添加属性
                </button>
            </div>

            {/* Stat Rows */}
            <div className="flex flex-wrap gap-2">
                {statEntries.map(([key, val]) => (
                    <div key={key} className="flex items-center gap-1 bg-slate-700/50 rounded px-2 py-1">
                        <select
                            className="bg-transparent text-xs text-emerald-300 border-none outline-none cursor-pointer"
                            value={key}
                            onChange={e => {
                                const next = { ...effect };
                                delete next[key];
                                next[e.target.value] = val;
                                onChange(next);
                            }}
                        >
                            {STAT_KEYS.map(sk => (
                                <option key={sk} value={sk} className="bg-slate-800">
                                    {TEXT_CONSTANTS.STATS[sk]} ({sk})
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            className="w-16 bg-slate-900 border border-slate-600 rounded px-1 py-0.5 text-xs text-center text-slate-200 outline-none focus:border-emerald-500"
                            value={val}
                            onChange={e => handleStatChange(key, Number(e.target.value) || 0)}
                        />
                        <button
                            onClick={() => handleStatRemove(key)}
                            className="text-slate-500 hover:text-red-400 text-xs px-1"
                        >
                            ×
                        </button>
                    </div>
                ))}
                {statEntries.length === 0 && (
                    <span className="text-xs text-slate-600 italic">无属性修改</span>
                )}
            </div>

            {/* History */}
            <div>
                <label className="block text-xs font-mono text-slate-500 mb-0.5">history（日志文本）</label>
                <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    value={(effect.history as string) || ''}
                    onChange={e => handleHistoryChange(e.target.value)}
                    placeholder="效果触发后的叙述文本..."
                />
            </div>

            {/* Flags */}
            <div>
                <label className="block text-xs font-mono text-slate-500 mb-0.5">flags（逗号分隔）</label>
                <input
                    type="text"
                    className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-slate-200 outline-none focus:border-emerald-500"
                    value={effect.flags ? (effect.flags as string[]).join(', ') : ''}
                    onChange={e => handleFlagsChange(e.target.value)}
                    placeholder="如: HAS_CULTIVATION_METHOD, BG_FARMER"
                />
            </div>
        </div>
    );
};
