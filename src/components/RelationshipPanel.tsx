import type { FC } from 'react';
import type { NPC } from '../types';
import { useUIStore } from '../store/uiStore';

interface RelationshipPanelProps {
    relations: NPC[];
    compact?: boolean;
}

export const RelationshipPanel: FC<RelationshipPanelProps> = ({ relations = [], compact }) => {
    const inspectNPC = useUIStore(s => s.inspectNPC);

    return (
        <div className={compact ? "space-y-1.5" : "space-y-4"}>
            {!compact && (
                <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 mb-4">人际关系</h3>
            )}
            {relations.length === 0 ? (
                <div className="text-slate-600 text-xs italic">举目无亲...</div>
            ) : (
                relations.map(npc => (
                    <div
                        key={npc.id}
                        onClick={() => inspectNPC(npc)}
                        className={`cursor-pointer group relative ${compact
                            ? 'p-1.5 bg-slate-50 border border-slate-200 rounded'
                            : 'p-3 bg-white/80 border border-slate-200 rounded-sm'
                            } hover:border-emerald-500/40 hover:bg-emerald-900/5 transition-all duration-200`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`${compact ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'} rounded-full border flex items-center justify-center text-slate-600 ${npc.gender === 'F' ? 'bg-rose-900/20 border-rose-900/50' : 'bg-slate-800 border-slate-200'} group-hover:border-emerald-500/40 transition-colors`}>
                                {npc.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <span className={`${compact ? 'text-xs' : 'text-sm'} text-slate-700 font-bold truncate group-hover:text-emerald-300 transition-colors`}>{npc.name}</span>
                                    <span className={`${compact ? 'text-[9px]' : 'text-[10px]'} text-emerald-500 border border-emerald-900/50 px-1 rounded shrink-0`}>{npc.relation}</span>
                                </div>
                                {!compact && (
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] text-amber-500">{npc.realm || '凡人'}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-500">{npc.age}/{npc.lifespan}岁</span>
                                            <span className={`text-[10px] ${npc.intimacy > 60 ? 'text-rose-400' : 'text-slate-600'}`}>好感 {npc.intimacy}</span>
                                        </div>
                                    </div>
                                )}
                                {compact && (
                                    <div className="flex items-center gap-2 text-[9px]">
                                        <span className="text-slate-500">{npc.age}岁</span>
                                        <span className={npc.intimacy > 60 ? 'text-rose-400' : 'text-slate-600'}>好感{npc.intimacy}</span>
                                        <span className="text-slate-700 ml-auto text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">点击查看 →</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};
