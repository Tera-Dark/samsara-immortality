import React from 'react';
import type { RealmDefinition } from '../../types';

interface RealmsViewProps {
    activeRealms: RealmDefinition[];
}

export const RealmsView: React.FC<RealmsViewProps> = ({ activeRealms }) => {
    return (
        <div className="flex flex-col items-center gap-8 py-4">
            {activeRealms.map((realm, index) => (
                <div key={realm.id} className="relative group w-full max-w-2xl">
                    {/* Connector Line */}
                    {index < activeRealms.length - 1 && (
                        <div className="absolute left-1/2 top-full h-8 w-px bg-slate-300 -translate-x-1/2 z-0"></div>
                    )}

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 p-6 bg-white/60 border border-slate-200 rounded-2xl backdrop-blur-md transition-all duration-300 hover:bg-slate-100/60 hover:border-emerald-400/30">

                        <div className="shrink-0 relative">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-slate-300 shadow-inner group-hover:shadow-md transition-shadow">
                                <div className="w-16 h-16 rounded-full border border-dashed animate-[spin_10s_linear_infinite] opacity-50 border-emerald-500"></div>
                                <span className="absolute text-2xl font-bold font-serif text-emerald-600 text-outlined-strong">
                                    {realm.name[0]}
                                </span>
                            </div>
                            <div className="absolute -bottom-2 w-full text-center">
                                <span className="bg-slate-50 px-2 text-xs text-slate-500 font-mono border border-slate-200 rounded text-outlined">
                                    Lv.{index}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-2xl font-serif font-bold tracking-widest mb-1 text-slate-700 group-hover:text-emerald-600 transition-colors text-outlined-strong">
                                {realm.name}
                            </h3>
                            <p className="text-sm text-slate-500 italic mb-2 font-serif opacity-80 text-outlined">"{realm.flavor}"</p>
                            <p className="text-sm text-slate-600 leading-relaxed mb-4 text-outlined">{realm.desc}</p>

                            {/* Sub-realms */}
                            {realm.subRealms && realm.subRealms.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {realm.subRealms.map(sub => (
                                        <span key={sub} className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Modifiers Grid */}
                            <div className="grid grid-cols-2 gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                {realm.modifiers.lifespanBonus !== undefined && (
                                    <div className="flex justify-between">
                                        <span className="text-outlined">寿元加成:</span>
                                        <span className="text-emerald-600 font-bold text-outlined-strong">+{realm.modifiers.lifespanBonus}年</span>
                                    </div>
                                )}
                                {realm.modifiers.stats && Object.entries(realm.modifiers.stats).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="text-outlined">{k}:</span>
                                        <span className="text-slate-700 font-mono text-outlined">+{v}</span>
                                    </div>
                                ))}
                                {realm.modifiers.attributes && Object.entries(realm.modifiers.attributes).map(([k, v]) => (
                                    <div key={k} className="flex justify-between">
                                        <span className="text-outlined">{k}:</span>
                                        <span className="text-slate-700 font-mono text-outlined">+{v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Breakthrough Info */}
                        <div className="shrink-0 w-full md:w-36 text-center md:border-l md:border-slate-200 md:pl-4">
                            <div className="text-sm text-slate-500 mb-1 text-outlined">突破条件</div>
                            {realm.breakthrough.probability && (
                                <div className="text-sm mb-2 text-outlined">
                                    成功率: <span className="text-amber-600 font-bold">{realm.breakthrough.probability * 100}%</span>
                                </div>
                            )}
                            {realm.breakthrough.stats && (
                                <div className="flex flex-col gap-0.5 text-xs text-slate-500 text-outlined">
                                    {Object.entries(realm.breakthrough.stats).map(([k, v]) => (
                                        <span key={k}>{k} &ge; {v}</span>
                                    ))}
                                </div>
                            )}
                            {realm.breakthrough.items && (
                                <div className="mt-2 pt-2 border-t border-slate-200">
                                    <div className="text-xs text-slate-500 text-outlined">所需丹药:</div>
                                    {realm.breakthrough.items.map(item => (
                                        <div key={item} className="text-xs text-rose-600 font-bold text-outlined">{item}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};
