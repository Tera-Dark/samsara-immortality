import React from 'react';
import type { EventChoice } from '../types';
import { EffectEditor } from './EffectEditor';

interface ChoiceEditorProps {
    choices: EventChoice[];
    onChange: (choices: EventChoice[]) => void;
}

export const ChoiceEditor: React.FC<ChoiceEditorProps> = ({ choices, onChange }) => {
    const handleAdd = () => {
        onChange([...choices, { text: '新选项', effect: { history: '' } }]);
    };

    const handleRemove = (index: number) => {
        const next = [...choices];
        next.splice(index, 1);
        onChange(next);
    };

    const handleTextChange = (index: number, text: string) => {
        const next = [...choices];
        next[index] = { ...next[index], text };
        onChange(next);
    };

    const handleEffectChange = (index: number, effect: EventChoice['effect']) => {
        const next = [...choices];
        next[index] = { ...next[index], effect };
        onChange(next);
    };

    const handleMoveUp = (index: number) => {
        if (index <= 0) return;
        const next = [...choices];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        onChange(next);
    };

    const handleMoveDown = (index: number) => {
        if (index >= choices.length - 1) return;
        const next = [...choices];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        onChange(next);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">选项列表 ({choices.length})</span>
                <button
                    onClick={handleAdd}
                    className="text-xs px-2 py-0.5 bg-amber-700 text-amber-100 rounded hover:bg-amber-600"
                >
                    + 添加选项
                </button>
            </div>

            {choices.length === 0 && (
                <div className="text-xs text-slate-600 italic text-center py-2">
                    暂无选项（此事件将直接触发 effect）
                </div>
            )}

            {choices.map((choice, idx) => (
                <div
                    key={idx}
                    className="bg-slate-800/30 border border-slate-600 rounded-lg p-3 space-y-2"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-400 font-mono w-6 shrink-0">#{idx + 1}</span>
                        <input
                            type="text"
                            className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm text-slate-200 outline-none focus:border-amber-500"
                            value={choice.text}
                            onChange={e => handleTextChange(idx, e.target.value)}
                            placeholder="选项文本..."
                        />
                        <div className="flex gap-1">
                            <button
                                onClick={() => handleMoveUp(idx)}
                                className="text-slate-500 hover:text-slate-300 text-xs px-1"
                                title="上移"
                            >
                                ↑
                            </button>
                            <button
                                onClick={() => handleMoveDown(idx)}
                                className="text-slate-500 hover:text-slate-300 text-xs px-1"
                                title="下移"
                            >
                                ↓
                            </button>
                            <button
                                onClick={() => handleRemove(idx)}
                                className="text-slate-500 hover:text-red-400 text-xs px-1"
                                title="删除"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                    <EffectEditor
                        effect={choice.effect || {}}
                        onChange={eff => handleEffectChange(idx, eff)}
                        label={`选项 #${idx + 1} 效果`}
                    />
                </div>
            ))}
        </div>
    );
};
