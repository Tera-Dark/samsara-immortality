import { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';

export const Terminal = () => {
    const history = useGameStore(state => state.gameState.history);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    return (
        <div className="bg-primary-950 font-mono text-sm leading-relaxed p-0 h-full overflow-hidden flex flex-col rounded-sm border border-slate-200">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-200 text-xs text-slate-500">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-700"></div>
                </div>
                <div>事件日志.log</div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <div className="flex flex-col space-y-2">
                    {history.length === 0 && (
                        <div className="text-slate-600 italic">// 系统初始化完成。等待事件触发...</div>
                    )}

                    {history.map((line, idx) => (
                        <div key={idx} className="break-words animate-in fade-in slide-in-from-left-2 duration-300">
                            {line.startsWith('>') ? (
                                <div className="flex gap-2 text-gold-400 bg-gold-950/20 p-2 border-l-2 border-gold-500">
                                    <span>&gt;</span>
                                    <span className="font-bold">{line.substring(1)}</span>
                                </div>
                            ) : (
                                <div className="text-slate-600 pl-2 border-l border-slate-200 hover:border-slate-600 transition-colors">
                                    <span className="text-slate-600 mr-2">[{idx + 1}]</span>
                                    {line}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
};
