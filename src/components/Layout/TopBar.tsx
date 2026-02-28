
import React from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { REALMS } from '../../types';
import { SpiritAvatar } from '../SpiritAvatar';
import { getNongliDate } from '../../utils/TimeUtils';
import { MAIN_QUESTS } from '../../data/missions';

export const TopBar: React.FC = () => {
    const { gameState, engine } = useGameStore();
    const {
        toggleCharacterSheet,
        toggleInventory,
        toggleSkills,
        toggleMap,
        toggleSettings,
        toggleMissions
    } = useUIStore();

    // Derived Stats
    const ageYears = gameState.age;
    const maxLife = engine.getLifespan();
    const lifePercent = Math.max(0, Math.min(100, ((maxLife - ageYears) / maxLife) * 100));
    const mpValue = gameState.battleStats.MP || 0;
    const spiritStones = gameState.attributes?.MONEY || 0;

    return (
        <div className="shrink-0 border-b border-slate-200 bg-white/80 backdrop-blur-sm relative z-30">
            <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">

                {/* Left: Character Info */}
                <div className="flex items-center gap-4">
                    {/* Avatar & Name */}
                    <div
                        onClick={() => toggleCharacterSheet(true)}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-300 group-hover:border-jade/50 transition-colors bg-slate-100">
                            <SpiritAvatar
                                seed={gameState.name || '道'}
                                realm={REALMS[gameState.realm_idx]}
                            />
                        </div>
                        <div>
                            <div className="text-sm font-serif font-bold text-slate-800 tracking-wider group-hover:text-jade transition-colors truncate max-w-[80px]">{gameState.name}</div>
                            <div className="text-xs font-mono text-slate-500 truncate max-w-[100px]">{REALMS[gameState.realm_idx]} · {ageYears}岁</div>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="w-px h-8 bg-slate-200"></div>

                    {/* Status Bars */}
                    <div className="flex flex-col gap-1">
                        {/* Lifespan */}
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-serif text-emerald-500/80 w-6 text-right">寿元</span>
                            <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${lifePercent}%` }}></div>
                            </div>
                        </div>

                        {/* MP */}
                        {gameState.realm_idx > 0 && (
                            <div className="flex items-center gap-2 animate-fade-in">
                                <span className="text-xs font-serif text-sky-500/80 w-6 text-right">灵力</span>
                                <div className="w-20 h-1 bg-slate-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500/80 rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (mpValue / (gameState.battleStats.MAX_MP || 100)) * 100)}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Spirit Stones */}
                    <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-200 ml-2">
                        <span className="text-xs text-amber-600 font-serif">灵石</span>
                        <span className="text-xs font-mono text-amber-700">{spiritStones}</span>
                    </div>
                </div>

                {/* Center: Active Mission Widget */}
                <div className="flex-1 flex justify-center items-center pointer-events-none">
                    <div
                        onClick={() => toggleMissions(true)}
                        className="pointer-events-auto hidden lg:flex flex-col px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-lg min-w-[200px] cursor-pointer hover:bg-amber-100 hover:border-amber-300 transition-all text-center relative overflow-hidden"
                    >
                        {gameState.missions && gameState.missions.active.length > 0 ? (
                            (() => {
                                const mId = gameState.missions.active[0].id;
                                const mDef = MAIN_QUESTS.find(q => q.id === mId);
                                return (
                                    <>
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent"></div>
                                        <span className="text-xs text-amber-600 font-serif tracking-[0.2em] mb-0.5">
                                            当前天命
                                        </span>
                                        <span className="text-xs text-amber-800 font-serif truncate max-w-[180px]" title={mDef?.description}>
                                            {mDef?.title || mId}
                                        </span>
                                    </>
                                );
                            })()
                        ) : (
                            <span className="text-xs text-slate-500 font-serif tracking-widest my-auto">无牵云挂挂</span>
                        )}
                    </div>
                </div>

                {/* Right: Tools & Time */}
                <div className="flex items-center gap-4">
                    {/* Guide Button */}
                    <button
                        onClick={() => window.open('https://github.com/Start-0/Aeon/blob/main/README.md', '_blank')}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-sky-600 hover:border-sky-300 hover:bg-sky-50 transition-all select-none group"
                        title="游戏指南 (Wiki)"
                    >
                        <span className="text-sm font-serif">?</span>
                    </button>

                    {/* Save Button */}
                    <button
                        onClick={() => useGameStore.getState().saveGame()}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all select-none group"
                        title="保存进度"
                    >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                        </svg>
                    </button>

                    {/* Inventory Button */}
                    <button
                        onClick={() => toggleInventory()}
                        className="px-4 py-1.5 rounded-full border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800 transition-colors font-serif tracking-widest text-sm relative group"
                    >
                        行 囊
                    </button>

                    {/* Skills Button */}
                    <button
                        onClick={() => toggleSkills()}
                        className="px-4 py-1.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 transition-colors font-serif tracking-widest text-sm relative group"
                    >
                        功 法
                    </button>

                    {/* Map Button */}
                    <button
                        onClick={() => toggleMap(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all select-none group"
                        title="世界地图"
                    >
                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path>
                        </svg>
                    </button>

                    {/* Settings Button */}
                    <button
                        onClick={() => toggleSettings(true)}
                        className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 transition-all select-none group"
                        title="系统设置"
                    >
                        <svg className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                    </button>

                    {/* Date */}
                    <div className="text-right">
                        <span className="block text-xs font-mono text-emerald-600/80 tracking-wider">
                            {getNongliDate(gameState.age, gameState.months, gameState.day || 1)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
