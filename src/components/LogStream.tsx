import { useLayoutEffect, useRef, useState } from 'react';
import type { FC } from 'react';

interface LogStreamProps {
    logs: string[];
}

const ITEM_KEYWORDS = [
    '灵石',
    '丹药',
    '法器',
    '材料',
    '功法',
    '秘籍',
    '灵草',
    '灵果',
    '筑基丹',
];

function classifyChange(text: string): 'item' | 'stat' {
    const trimmed = text.trim();
    return ITEM_KEYWORDS.some((keyword) => trimmed.includes(keyword)) ? 'item' : 'stat';
}

function getLogTone(log: string) {
    if (log.includes('【成长】')) return 'text-emerald-700';
    if (log.includes('【问道】')) return 'text-sky-700';
    if (log.includes('【闭关】')) return 'text-fuchsia-700';
    if (log.includes('【战斗】') || log.includes('战斗')) return 'text-amber-700';
    return 'text-slate-600';
}

export const LogStream: FC<LogStreamProps> = ({ logs }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayCount, setDisplayCount] = useState(100);
    const previousLogCountRef = useRef(logs.length);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const hasNewLogs = logs.length > previousLogCountRef.current;
        previousLogCountRef.current = logs.length;

        requestAnimationFrame(() => {
            if (!containerRef.current) return;
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        });

        if (!hasNewLogs) return;
    }, [logs.length]);

    const hasMore = logs.length > displayCount;
    const visibleLogs = logs.slice(-displayCount);

    return (
        <div ref={containerRef} className="h-full min-h-0 overflow-y-auto p-3 custom-scrollbar">
            {hasMore && (
                <div className="sticky top-0 z-10 flex justify-center pb-2">
                    <button
                        onClick={() => setDisplayCount((count) => Math.min(count + 100, logs.length))}
                        className="rounded-full border border-slate-200 bg-white/95 px-4 py-1.5 text-xs text-slate-500 shadow-sm transition-colors hover:text-emerald-600"
                    >
                        加载更早日志 (+100)
                    </button>
                </div>
            )}

            <div className="space-y-3">
                {visibleLogs.map((log, index) => {
                    const actualIndex = logs.length - visibleLogs.length + index;
                    const toneClass = getLogTone(log);
                    const match = log.match(/^(\[.*?\])([\s\S]*)/);
                    const timestamp = match?.[1] ?? '';
                    const content = (match?.[2] ?? log).trim();
                    const lines = content.split('\n').filter(Boolean);
                    const mainText = lines[0] ?? '';
                    const changeLines = lines.slice(1);

                    const statChanges: string[] = [];
                    const itemChanges: string[] = [];

                    for (const line of changeLines) {
                        const parts = line
                            .split(/[，、]/)
                            .map((part) => part.trim())
                            .filter(Boolean);

                        for (const part of parts) {
                            if (classifyChange(part) === 'item') {
                                itemChanges.push(part);
                            } else {
                                statChanges.push(part);
                            }
                        }
                    }

                    return (
                        <div key={actualIndex} className={`flex items-start gap-3 rounded-2xl border border-transparent px-2 py-1.5 ${toneClass}`}>
                            <span className="mt-0.5 w-10 shrink-0 select-none text-right font-mono text-xs opacity-25">{actualIndex + 1}</span>
                            {timestamp && <span className="mt-0.5 shrink-0 whitespace-nowrap font-mono text-xs text-emerald-700">{timestamp}</span>}
                            <div className="flex-1">
                                <div className="break-words text-sm leading-7 md:text-[15px]">{mainText}</div>
                                {statChanges.length > 0 && <div className="mt-1 text-xs italic text-violet-600/80">属性变动: {statChanges.join('、')}</div>}
                                {itemChanges.length > 0 && <div className="mt-1 text-xs italic text-amber-600/80">物品变动: {itemChanges.join('、')}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
