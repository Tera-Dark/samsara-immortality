import { useRef, useEffect, useState } from 'react';
import type { FC } from 'react';

interface LogStreamProps {
    logs: string[];
}

// 物品关键词（用于区分属性变化和物品变化）
const ITEM_KEYWORDS = ['灵石', '丹药', '法器', '材料', '功法', '秘籍', '灵草', '灵果', '筑基丹'];

function classifyChange(text: string): 'item' | 'stat' {
    const trimmed = text.trim();
    for (const kw of ITEM_KEYWORDS) {
        if (trimmed.includes(kw)) return 'item';
    }
    return 'stat';
}

export const LogStream: FC<LogStreamProps> = ({ logs }) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [displayCount, setDisplayCount] = useState(100);
    const [autoScroll, setAutoScroll] = useState(true);

    const prevLogCount = useRef(logs.length);

    // Auto-scroll: forcibly scroll to bottom when new logs appear
    useEffect(() => {
        const hasNewLogs = logs.length > prevLogCount.current;
        prevLogCount.current = logs.length;

        if (hasNewLogs && containerRef.current) {
            // Use setTimeout to ensure React has fully committed the DOM changes
            setTimeout(() => {
                if (containerRef.current) {
                    containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
            }, 50);
        }
    }, [logs.length]);

    // Detect user manually scrolling up to show "new logs" button
    const handleScroll = () => {
        if (containerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 80;
            if (isNearBottom !== autoScroll) {
                setAutoScroll(isNearBottom);
            }
        }
    };

    const hasMore = logs.length > displayCount;
    const visibleLogs = logs.slice(-displayCount);

    const loadMore = () => {
        setDisplayCount(prev => Math.min(prev + 100, logs.length));
    };

    return (
        <div
            ref={containerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto custom-scrollbar space-y-3 p-2 relative"
        >
            {/* Load More Button */}
            {hasMore && (
                <div className="text-center py-2">
                    <button
                        onClick={loadMore}
                        className="text-xs text-slate-400 hover:text-emerald-600 transition-colors border border-slate-200 rounded px-3 py-1 bg-white"
                    >
                        加载更多历史记录 (+100)
                    </button>
                </div>
            )}

            {visibleLogs.map((log, index) => {
                // Calculate actual index for display properties if needed, 
                // but here 'i' is just for key/display. 
                // Using log index from the full array might be better for keys if logs are unique strings, 
                // but logs might have dupes. Using index relative to slice is safe for rendering.
                // To keep keys stable when loading more, we should use the index from the END of the array?
                // Or just use the original index?
                const actualIndex = logs.length - visibleLogs.length + index;

                // Simple parsing for log types
                let colorClass = 'text-slate-600';
                if (log.includes('【生活】')) colorClass = 'text-slate-600';
                if (log.includes('【成长】')) colorClass = 'text-emerald-700';
                if (log.includes('【问道】')) colorClass = 'text-sky-700';
                if (log.includes('【闭关】')) colorClass = 'text-amber-700';

                // Parse Timestamp: [X岁] or [X岁Y月]
                const match = log.match(/^(\[.*?\])([\s\S]*)/);
                let timestamp = '';
                let content = log;

                if (match) {
                    timestamp = match[1];
                    content = match[2].trim();
                }

                // Parse Newlines for Stat/Item Changes
                const lines = content.split('\n');
                const mainText = lines[0];
                const changeLines = lines.slice(1).filter(l => l.trim().length > 0);

                // 分类：属性变化 vs 物品变化
                const statChanges: string[] = [];
                const itemChanges: string[] = [];

                for (const line of changeLines) {
                    // 可能一行里用逗号/顿号分隔多个变化
                    const parts = line.split(/[，,、]/).map(s => s.trim()).filter(Boolean);
                    for (const part of parts) {
                        if (classifyChange(part) === 'item') {
                            itemChanges.push(part);
                        } else {
                            statChanges.push(part);
                        }
                    }
                }

                return (
                    <div key={actualIndex} className={`font-mono flex gap-2 ${colorClass} animate-fade-in items-start`}>
                        <span className="w-10 opacity-20 shrink-0 text-right select-none text-xs mt-1">{actualIndex + 1}</span>
                        {timestamp && <span className="text-emerald-700 font-bold shrink-0 text-xs mt-1 whitespace-nowrap">{timestamp}</span>}

                        <div className="flex-1 flex flex-col">
                            {/* Main Text */}
                            <span className="break-words text-sm md:text-base leading-relaxed">{mainText}</span>

                            {/* 属性变化 - 斜体 淡紫色 */}
                            {statChanges.length > 0 && (
                                <span className="italic text-xs mt-0.5 text-purple-600/70">
                                    ⇢ {statChanges.join('　')}
                                </span>
                            )}

                            {/* 物品变化 - 斜体 淡金色 */}
                            {itemChanges.length > 0 && (
                                <span className="italic text-xs mt-0.5 text-amber-600/70">
                                    ⇢ {itemChanges.join('　')}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Scroll Anchor */}
            <div ref={bottomRef} className="h-1" />

            {/* Auto-scroll paused indicator */}
            {!autoScroll && (
                <div
                    onClick={() => { setAutoScroll(true); bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="absolute bottom-4 right-4 bg-emerald-600/90 text-white text-xs px-3 py-1.5 rounded-full cursor-pointer shadow-lg hover:bg-emerald-500 transition-all animate-bounce"
                >
                    ⬇ 有新日志
                </div>
            )}
        </div>
    );
};
