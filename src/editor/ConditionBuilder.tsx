import React from 'react';
import { CONDITION_TYPES, CONDITION_OPS } from '../types';
import type { Condition } from '../types';

interface ConditionBuilderProps {
    conditions: Condition[];
    onChange: (conditions: Condition[]) => void;
}

export const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ conditions = [], onChange }) => {

    const handleAdd = () => {
        // Use string literals or the first item from constants
        onChange([...conditions, { type: 'STAT', target: 'STR', op: 'GTE', value: 10 }]);
    };

    const handleRemove = (index: number) => {
        const next = [...conditions];
        next.splice(index, 1);
        onChange(next);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (index: number, key: keyof Condition, value: any) => {
        const next = [...conditions];
        next[index] = { ...next[index], [key]: value };
        onChange(next);
    };

    return (
        <div className="space-y-2 p-2 bg-slate-800/50 rounded border border-slate-200">
            <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono text-slate-400">CONDITIONS ({conditions.length})</h4>
                <button
                    onClick={handleAdd}
                    className="text-xs px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded hover:bg-emerald-600"
                >
                    + Add
                </button>
            </div>

            {conditions.length === 0 && (
                <div className="text-xs text-slate-600 italic text-center py-2">No conditions</div>
            )}

            {conditions.map((cond, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-center bg-white/80 p-2 rounded border border-slate-200">
                    {/* Type */}
                    <select
                        className="bg-slate-800 text-xs text-slate-600 border border-slate-200 rounded px-1 py-1 w-24"
                        value={cond.type}
                        onChange={e => handleChange(idx, 'type', e.target.value)}
                    >
                        {CONDITION_TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    {/* Target */}
                    <input
                        className="bg-slate-800 text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 flex-1 min-w-[80px]"
                        value={cond.target}
                        onChange={e => handleChange(idx, 'target', e.target.value)}
                        placeholder="Target (e.g. STR)"
                    />

                    {/* Op */}
                    <select
                        className="bg-slate-800 text-xs text-slate-600 border border-slate-200 rounded px-1 py-1 w-16"
                        value={cond.op}
                        onChange={e => handleChange(idx, 'op', e.target.value)}
                    >
                        {CONDITION_OPS.map(op => (
                            <option key={op} value={op}>{op}</option>
                        ))}
                    </select>

                    {/* Value */}
                    <input
                        className="bg-slate-800 text-xs text-slate-600 border border-slate-200 rounded px-2 py-1 w-20"
                        value={String(cond.value)}
                        onChange={e => {
                            const val = e.target.value;
                            // Basic number parsing if it looks like a number
                            const num = Number(val);
                            handleChange(idx, 'value', isNaN(num) ? val : num);
                        }}
                        placeholder="Value"
                    />

                    {/* Delete */}
                    <button
                        onClick={() => handleRemove(idx)}
                        className="text-slate-500 hover:text-red-400 px-1"
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    );
};
