import type { FC } from 'react';
import type { NPC } from '../types';
import { useUIStore } from '../store/uiStore';

interface RelationshipPanelProps {
    relations: NPC[];
    compact?: boolean;
}

export const RelationshipPanel: FC<RelationshipPanelProps> = ({ relations = [], compact }) => {
    const inspectNPC = useUIStore((s) => s.inspectNPC);

    return (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
            {!compact && (
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h3 className="text-xs uppercase tracking-[0.28em] text-slate-500">人际关系</h3>
                    <span className="text-[11px] text-slate-400">{relations.length} 位</span>
                </div>
            )}

            {relations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
                    暂无可追溯关系
                </div>
            ) : (
                relations.map((npc) => (
                    <button
                        key={npc.id}
                        onClick={() => inspectNPC(npc)}
                        className={`group w-full cursor-pointer text-left transition-all hover:-translate-y-0.5 ${
                            compact
                                ? 'rounded-2xl border border-slate-200 bg-white px-3 py-2.5 hover:border-emerald-300 hover:bg-emerald-50'
                                : 'rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`flex items-center justify-center rounded-2xl border text-sm font-bold ${
                                compact ? 'h-10 w-10' : 'h-12 w-12'
                            } ${
                                npc.gender === 'F'
                                    ? 'border-rose-200 bg-rose-50 text-rose-700'
                                    : 'border-sky-200 bg-sky-50 text-sky-700'
                            }`}>
                                {npc.name[0]}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="truncate text-sm font-semibold text-slate-800 group-hover:text-emerald-700">{npc.name}</div>
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-500">
                                        {npc.relation}
                                    </span>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                                    <span>{npc.realm || '凡人'}</span>
                                    <span>·</span>
                                    <span>{npc.age}/{npc.lifespan}岁</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                                        <div
                                            className={`h-full rounded-full ${npc.intimacy >= 60 ? 'bg-rose-500' : npc.intimacy >= 30 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                            style={{ width: `${Math.min(100, Math.max(6, npc.intimacy))}%` }}
                                        />
                                    </div>
                                    <span className={`text-[11px] font-mono ${npc.intimacy >= 60 ? 'text-rose-600' : 'text-slate-500'}`}>
                                        好感 {npc.intimacy}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </button>
                ))
            )}
        </div>
    );
};
