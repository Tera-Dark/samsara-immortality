import React, { useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import type { CombatEntity, CombatSkill } from '../types/combat';

export const CombatPanel: React.FC = () => {
    const { currentCombat, executeCombatSkill, fleeCombat, exitCombat } = useGameStore();
    const logContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [currentCombat?.logs]);

    if (!currentCombat) return null;

    const { player, enemy, logs, status } = currentCombat;

    const renderEntity = (entity: CombatEntity, isRight = false) => {
        const hpPercent = Math.max(0, (entity.hp / entity.maxHp) * 100);
        const mpPercent = Math.max(0, (entity.mp / entity.maxMp) * 100);

        return (
            <div className={`flex flex-col gap-2 w-full max-w-xs ${isRight ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-2xl shadow-lg ring-2 ring-transparent transition-all">
                        {isRight ? '👿' : '🥷'}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 font-serif tracking-wide">{entity.name}</h3>
                        <p className="text-xs text-slate-400">{entity.levelStr}</p>
                    </div>
                </div>

                {/* HP Bar */}
                <div className="w-full mt-2">
                    <div className="flex justify-between text-xs mb-1 font-mono text-slate-600">
                        <span>HP</span>
                        <span>{Math.floor(entity.hp)} / {entity.maxHp}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-200 relative">
                        <div
                            className="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-300 ease-out"
                            style={{ width: `${hpPercent}%` }}
                        />
                        {entity.shield > 0 && (
                            <div className="absolute top-0 right-0 h-full bg-cyan-400/50 w-full rounded-full transition-all" style={{ width: `${Math.min(100, (entity.shield / entity.maxHp) * 100)}%` }}></div>
                        )}
                    </div>
                    {entity.shield > 0 && <div className="text-[10px] text-cyan-300 text-right mt-0.5">护盾: {entity.shield}</div>}
                </div>

                {/* MP Bar */}
                <div className="w-full">
                    <div className="flex justify-between text-xs mb-1 font-mono text-slate-600">
                        <span>MP</span>
                        <span>{Math.floor(entity.mp)} / {entity.maxMp}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-200">
                        <div
                            className="h-full bg-gradient-to-r from-blue-700 to-blue-500 transition-all duration-300 ease-out"
                            style={{ width: `${mpPercent}%` }}
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className={`grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-400 mt-2 font-mono ${isRight ? 'text-right' : 'text-left'}`}>
                    <div>ATK: <span className="text-amber-200/90">{entity.atk}</span></div>
                    <div>DEF: <span className="text-slate-600">{entity.def}</span></div>
                    <div>SPD: <span className="text-emerald-300/80">{entity.spd}</span></div>
                    <div>CRI: <span className="text-rose-300/80">{entity.crit}%</span></div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-50/90 backdrop-blur-md animate-fade-in">
            {/* Background elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/50 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-900/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="bg-white border border-slate-200/60 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative z-10 animate-slide-up">
                {/* Header */}
                <div className="bg-slate-50/50 p-4 border-b border-slate-200/80 flex justify-between items-center px-6">
                    <h2 className="text-lg font-serif font-bold tracking-widest text-slate-700">
                        {currentCombat.type === 'TRIBULATION' ? '✨ 九天雷劫' : '⚔️ 遭遇战'} - 第 {currentCombat.turn} 回合
                    </h2>
                    {status === 'ACTIVE' && currentCombat.type !== 'TRIBULATION' && (
                        <button
                            onClick={fleeCombat}
                            className="px-4 py-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded border border-slate-200 transition-colors"
                        >
                            尝试逃跑 (遁术)
                        </button>
                    )}
                </div>

                {/* Main Arena */}
                <div className="flex-1 p-6 sm:p-8 flex flex-col">
                    {/* Entities */}
                    <div className="flex justify-between items-start gap-8 mb-8">
                        {renderEntity(player, false)}
                        <div className="flex-1 flex items-center justify-center relative min-h-[100px]">
                            <div className="text-4xl absolute -mt-4 animate-pulse opacity-20 font-serif tracking-widest text-slate-500">
                                VS
                            </div>
                        </div>
                        {renderEntity(enemy, true)}
                    </div>

                    {/* Combat Log */}
                    <div className="flex-1 bg-slate-50/60 rounded-lg border border-slate-200/80 p-4 overflow-hidden flex flex-col min-h-[200px]">
                        <div className="mb-2 text-xs text-slate-500 font-mono tracking-wider border-b border-slate-200 pb-2">
                            --- 战斗记录 ---
                        </div>
                        <div
                            ref={logContainerRef}
                            className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar"
                        >
                            {logs.map((log, i) => (
                                <div key={i} className="text-sm font-serif leading-relaxed animate-fade-in bg-slate-50 p-2 rounded">
                                    <span className="text-slate-500 text-xs mr-2 font-mono">[{log.turn}]</span>
                                    {log.actorName === '系统' ? (
                                        <span className={log.message.includes('击败') || log.message.includes('逃脱') ? 'text-emerald-400' : 'text-rose-400'}>
                                            {log.message}
                                        </span>
                                    ) : (
                                        <span>
                                            <span className={log.actorName === player.name ? 'text-sky-300' : 'text-rose-300'}>
                                                {log.actorName}
                                            </span>
                                            <span className="text-slate-600 mx-1">
                                                使用 {log.skillName}，
                                            </span>
                                            <span className="text-slate-700">
                                                {log.message.split('】')[1]}
                                            </span>
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action Bar / Status Footer */}
                <div className="bg-slate-50/80 p-5 border-t border-slate-200 flex items-center justify-center min-h-[100px]">
                    {status === 'ACTIVE' ? (
                        <div className="flex flex-wrap gap-3 justify-center w-full max-w-2xl">
                            {player.skills.map((skill: CombatSkill) => {
                                const canAfford = (skill.costType === 'MP' && player.mp >= skill.costAmount) ||
                                    (skill.costType === 'HP' && player.hp > skill.costAmount) ||
                                    skill.costType === 'NONE';

                                return (
                                    <button
                                        key={skill.id}
                                        onClick={() => executeCombatSkill(skill.id)}
                                        disabled={!canAfford}
                                        className={`px-6 py-3 rounded-lg border text-sm font-serif transition-all relative overflow-hidden group
                                            ${canAfford
                                                ? 'bg-slate-800/80 border-slate-600 text-slate-700 hover:bg-slate-700 hover:border-slate-400 hover:shadow-lg hover:-translate-y-0.5'
                                                : 'bg-white/80 border-slate-200 text-slate-500 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        <span className="relative z-10">{skill.name}</span>
                                        {skill.costType !== 'NONE' && (
                                            <div className="text-[10px] mt-1 relative z-10 opacity-70">
                                                消耗: {skill.costAmount} {skill.costType}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center animate-fade-in">
                            <h3 className={`text-2xl font-bold font-serif mb-4 tracking-widest ${status === 'VICTORY' ? 'text-emerald-400' :
                                status === 'FLED' ? 'text-amber-400' : 'text-rose-500'
                                }`}>
                                {status === 'VICTORY' ? '战 斗 胜 利' :
                                    status === 'FLED' ? '脱 离 战 斗' : '战 斗 失 败'}
                            </h3>
                            <button
                                onClick={exitCombat}
                                className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-700 font-medium transition-all"
                            >
                                结束并返回
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
