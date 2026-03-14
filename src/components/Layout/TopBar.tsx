import React from 'react';
import { BookOpen, Briefcase, Compass, Save, Settings, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import { REALMS } from '../../types';
import { SpiritAvatar } from '../SpiritAvatar';
import { getNongliDate } from '../../utils/TimeUtils';
import { getPrimaryMission } from '../../utils/missionUtils';

export const TopBar: React.FC = () => {
    const { gameState, engine } = useGameStore();
    const {
        toggleCharacterSheet,
        toggleInventory,
        toggleSkills,
        toggleMap,
        toggleSettings,
        toggleMissions,
    } = useUIStore();

    const ageYears = gameState.age;
    const maxLife = engine.getLifespan();
    const lifePercent = Math.max(0, Math.min(100, ((maxLife - ageYears) / Math.max(1, maxLife)) * 100));
    const spiritStones = gameState.attributes?.MONEY || 0;
    const primaryMission = getPrimaryMission(gameState);
    const supportCount = (gameState.flags || []).filter((flag) => flag.startsWith('STORY:FINAL_SUPPORT_')).length;
    const isEndingCleared = gameState.flags.includes('STORY:VOID_LORD_SLAIN');
    const isFinalArc = gameState.flags.includes('STORY:FINAL_MUSTER') && !isEndingCleared;

    return (
        <div className="relative z-30 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-sm">
            <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex min-w-0 items-center gap-2.5">
                    <button
                        onClick={() => toggleCharacterSheet(true)}
                        className="group flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition-all hover:border-emerald-300 hover:bg-emerald-50"
                    >
                        <div className="h-10 w-10 overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
                            <SpiritAvatar seed={gameState.name || '道'} realm={REALMS[gameState.realm_idx]} />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-[13px] font-bold tracking-wide text-slate-800 group-hover:text-emerald-700">{gameState.name}</div>
                            <div className="mt-0.5 text-[11px] text-slate-500">{REALMS[gameState.realm_idx]} · {ageYears}岁</div>
                            {(isEndingCleared || supportCount > 0) && (
                                <div className="mt-1 flex flex-wrap gap-1.5">
                                    {isEndingCleared && (
                                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] text-emerald-700">
                                            本轮已通关
                                        </span>
                                    )}
                                    {supportCount > 0 && (
                                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-700">
                                            终局支援 {supportCount}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </button>

                    <div className="hidden rounded-2xl border border-slate-200 bg-white px-3 py-2 lg:block">
                        <div className="mb-1 flex items-center justify-between gap-3 text-[10px] text-slate-500">
                            <span>寿元余势</span>
                            <span className="font-mono">{Math.max(0, maxLife - ageYears)} / {maxLife}</span>
                        </div>
                        <div className="h-2 w-36 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${lifePercent}%` }} />
                        </div>
                    </div>

                    <div className="hidden items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 lg:flex">
                        <Sparkles className="h-4 w-4 text-amber-600" />
                        <div>
                            <div className="text-[10px] text-amber-700">灵石</div>
                            <div className="text-[13px] font-mono font-bold text-amber-800">{spiritStones}</div>
                        </div>
                    </div>
                </div>

                <div className="pointer-events-none hidden flex-1 justify-center lg:flex">
                    <button
                        onClick={() => toggleMissions(true)}
                        className={`pointer-events-auto min-w-[220px] max-w-[340px] rounded-2xl border px-3 py-1.5 text-left transition-all ${
                            isEndingCleared
                                ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 hover:bg-emerald-100'
                                : isFinalArc
                                    ? 'border-sky-200 bg-sky-50 hover:border-sky-300 hover:bg-sky-100'
                                    : 'border-amber-200 bg-amber-50 hover:border-amber-300 hover:bg-amber-100'
                        }`}
                    >
                        {isEndingCleared ? (
                            <>
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] tracking-[0.18em] text-emerald-700">本轮终局</span>
                                    <span className="rounded-full border border-emerald-300 bg-white/70 px-2 py-0.5 text-[10px] text-emerald-700">
                                        已通关
                                    </span>
                                </div>
                                <div className="mt-0.5 truncate text-xs font-semibold text-emerald-900">
                                    黑潮终绝，尘劫暂平
                                </div>
                                <div className="mt-0.5 truncate text-[10px] leading-4 text-emerald-800/85">
                                    你可继续收尾游历、补全成就与战利品，或回到主菜单开启下一世。
                                </div>
                                {supportCount > 0 && (
                                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-emerald-700/80">
                                        <span>终局援势已兑现</span>
                                        <span>{supportCount} 项</span>
                                    </div>
                                )}
                            </>
                        ) : primaryMission ? (
                            <>
                                <div className="flex items-center justify-between gap-2">
                                    <span className={`text-[10px] tracking-[0.18em] ${isFinalArc ? 'text-sky-700' : 'text-amber-700'}`}>当前追踪</span>
                                    <div className="flex items-center gap-1.5">
                                        {supportCount > 0 && (
                                            <span className="rounded-full border border-sky-300 bg-white/80 px-2 py-0.5 text-[10px] text-sky-700">
                                                支援 {supportCount}
                                            </span>
                                        )}
                                        <span className={`rounded-full border bg-white/70 px-2 py-0.5 text-[10px] ${isFinalArc ? 'border-sky-300 text-sky-700' : 'border-amber-300 text-amber-700'}`}>
                                            {gameState.missions.active.length} 项进行中
                                        </span>
                                    </div>
                                </div>
                                <div className={`mt-0.5 truncate text-xs font-semibold ${isFinalArc ? 'text-sky-900' : 'text-amber-900'}`} title={primaryMission.definition.description}>
                                    {primaryMission.definition.title}
                                </div>
                                <div className={`mt-0.5 truncate text-[10px] leading-4 ${isFinalArc ? 'text-sky-800/85' : 'text-amber-800/85'}`}>
                                    {primaryMission.objective?.description ?? '查看任务详情'}
                                </div>
                                <div className={`mt-1.5 h-1.5 overflow-hidden rounded-full ${isFinalArc ? 'bg-sky-200/80' : 'bg-amber-200/80'}`}>
                                    <div className={`h-full rounded-full ${isFinalArc ? 'bg-sky-500' : 'bg-amber-500'}`} style={{ width: `${primaryMission.progress}%` }} />
                                </div>
                            </>
                        ) : (
                            <div className="text-sm text-slate-500">暂时没有激活任务，先按当前引导继续推进。</div>
                        )}
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <div className="hidden text-right lg:block">
                        <div className="text-[10px] text-slate-400">时令</div>
                        <div className="text-[11px] font-mono text-emerald-700">{getNongliDate(gameState.age, gameState.months, gameState.day || 1)}</div>
                    </div>

                    <button
                        onClick={() => useGameStore.getState().saveGame()}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                        title="保存进度"
                    >
                        <Save className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => toggleInventory()}
                        className="hidden items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 transition-all hover:border-amber-300 hover:bg-amber-100 md:flex"
                    >
                        <Briefcase className="h-4 w-4" />
                        行囊
                    </button>

                    <button
                        onClick={() => toggleSkills()}
                        className="hidden items-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-800 transition-all hover:border-indigo-300 hover:bg-indigo-100 md:flex"
                    >
                        <BookOpen className="h-4 w-4" />
                        功法
                    </button>

                    <button
                        onClick={() => toggleMap(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                        title="世界地图"
                    >
                        <Compass className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() => toggleSettings(true)}
                        className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                        title="系统设置"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
