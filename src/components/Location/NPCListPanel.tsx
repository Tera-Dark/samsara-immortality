import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import type { WorldNPC } from '../../types/worldTypes';
import { REALMS } from '../../types';

export const NPCListPanel: React.FC = () => {
    const { gameState, interactNPC } = useGameStore();
    const locationId = gameState.location;

    const npcsHere = gameState.world?.worldNPCs.filter((npc: WorldNPC) => npc.currentLocationId === locationId && npc.alive) || [];

    const [selectedNPC, setSelectedNPC] = useState<WorldNPC | null>(null);

    if (npcsHere.length === 0) {
        return (
            <div className="bg-white border border-slate-200 rounded-lg p-3 h-full flex items-center justify-center">
                <span className="text-slate-400 text-xs">此处暂无其他修士</span>
            </div>
        );
    }

    return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 h-full flex flex-col">
            {/* 标题 */}
            <div className="flex items-center gap-1.5 mb-2 shrink-0">
                <span className="w-4 h-4 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 text-[8px] font-serif">人</span>
                <span className="font-bold text-slate-600 text-xs">附近修士</span>
                <span className="text-[10px] text-slate-400 font-mono">({npcsHere.length})</span>
                <div className="flex-1 h-px bg-slate-100"></div>
            </div>

            {/* NPC 列表 */}
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-0.5">
                {npcsHere.map(npc => (
                    <div
                        key={npc.id}
                        className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${selectedNPC?.id === npc.id
                            ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                            }`}
                        onClick={() => setSelectedNPC(selectedNPC?.id === npc.id ? null : npc)}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-emerald-600">
                                {npc.name}
                                {npc.title && <span className="text-[10px] text-amber-500 ml-1 font-normal">[{npc.title}]</span>}
                            </span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-mono">
                                {REALMS[npc.realmIndex]}
                            </span>
                        </div>

                        {selectedNPC?.id === npc.id && (
                            <div className="mt-2 pt-2 border-t border-slate-200 animate-fade-in">
                                <div className="text-[10px] text-slate-400 mb-1.5 flex gap-3">
                                    <span>年龄: {npc.age}</span>
                                    <span>寿元: {npc.lifespan}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        className="flex-1 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 hover:border-sky-300 rounded text-xs transition-colors"
                                        onClick={(e) => { e.stopPropagation(); interactNPC(npc, 'TALK'); setSelectedNPC(null); }}
                                    >
                                        交谈
                                    </button>
                                    <button
                                        className="flex-1 py-1 bg-amber-50 hover:bg-amber-100 text-amber-600 border border-amber-200 hover:border-amber-300 rounded text-xs transition-colors"
                                        onClick={(e) => { e.stopPropagation(); interactNPC(npc, 'SPAR'); setSelectedNPC(null); }}
                                    >
                                        切磋
                                    </button>
                                    <button
                                        className="flex-1 py-1 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 hover:border-red-300 rounded text-xs transition-colors"
                                        onClick={(e) => { e.stopPropagation(); interactNPC(npc, 'KILL'); setSelectedNPC(null); }}
                                    >
                                        截杀
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
