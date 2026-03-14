import { useEffect, useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { useMetaStore } from '../store/metaStore';
import { useUIStore } from '../store/uiStore';
import { Crown, Sparkles, ScrollText, Home, Swords } from 'lucide-react';
import { REALMS } from '../types';

const REWARD_FLAG = 'ENDING:VOID_LORD_REWARD_CLAIMED';
const READ_FLAG = 'ENDING:VOID_LORD_EPILOGUE_READ';

export const VictoryOverlay = ({ onClose }: { onClose: () => void }) => {
    const gameState = useGameStore((s) => s.gameState);
    const { addKarma, unlockAchievement } = useMetaStore();
    const setScene = useUIStore((s) => s.setScene);
    const realmName = REALMS[gameState.realm_idx] ?? `第 ${gameState.realm_idx} 境`;

    const supportCount = useMemo(() => {
        return (gameState.flags || []).filter((flag) => flag.startsWith('STORY:FINAL_SUPPORT_')).length;
    }, [gameState.flags]);

    const victoryReward = useMemo(() => {
        return 80 + Math.floor(gameState.age / 3) + supportCount * 10 + Math.floor((gameState.realm_idx || 0) * 18);
    }, [gameState.age, gameState.realm_idx, supportCount]);

    useEffect(() => {
        if (gameState.flags.includes(REWARD_FLAG)) return;

        addKarma(victoryReward);
        unlockAchievement('ACH_END_BLACK_TIDE');
        useGameStore.setState((state) => ({
            gameState: {
                ...state.gameState,
                flags: [...state.gameState.flags, REWARD_FLAG],
            },
        }));
    }, [addKarma, gameState.flags, unlockAchievement, victoryReward]);

    const supportHighlights = useMemo(() => {
        const entries = [
            ['STORY:FINAL_SUPPORT_REFUGEES', '流民安顿'],
            ['STORY:FINAL_SUPPORT_SCATTERED', '散修并肩'],
            ['STORY:FINAL_SUPPORT_SUPPLIES', '后勤补给'],
            ['STORY:FINAL_SUPPORT_INTEL', '情报回线'],
            ['STORY:FINAL_SUPPORT_SCOUTS', '斥候先导'],
            ['STORY:FINAL_SUPPORT_SUPPLY', '前线输送'],
            ['STORY:FINAL_SUPPORT_BEACON', '烽灯预警'],
            ['STORY:FINAL_SUPPORT_WAR_FORGE', '战备齐整'],
            ['STORY:FINAL_SUPPORT_RESOLVE', '道心稳固'],
        ] as const;

        return entries
            .filter(([flag]) => gameState.flags.includes(flag))
            .map(([, label]) => label);
    }, [gameState.flags]);

    const endings = useMemo(() => {
        const parts: string[] = [];
        if (gameState.flags.includes('STORY:FINAL_SUPPORT_REFUGEES')) parts.push('你护下来的流民与伤者，终于迎来了能安稳生火做饭的夜晚。');
        if (gameState.flags.includes('STORY:FINAL_SUPPORT_SCATTERED')) parts.push('那些原本四散的散修，第一次真正以同道身份并肩站到了最后。');
        if (gameState.flags.includes('STORY:FINAL_SUPPORT_WAR_FORGE')) parts.push('战前赶制的法器与符箓没有白费，很多本该断掉的命数因此接了回来。');
        if (gameState.flags.includes('STORY:FALLEN_HESITATED')) parts.push('你想起那些差一点坠入归墟的人，也想起自己一路上究竟为何没有停下。');
        if (parts.length === 0) parts.push('黑潮虽退，这方天地仍带着伤，但至少从此又有了重新生长的资格。');
        return parts;
    }, [gameState.flags]);

    const closeEpilogue = () => {
        if (!gameState.flags.includes(READ_FLAG)) {
            useGameStore.setState((state) => ({
                gameState: {
                    ...state.gameState,
                    flags: [...state.gameState.flags, READ_FLAG],
                },
            }));
        }
        onClose();
    };

    return (
        <div className="absolute inset-0 z-[110] bg-amber-50/92 backdrop-blur-xl flex items-center justify-center p-6 overflow-y-auto no-scrollbar">
            <div className="max-w-3xl w-full rounded-[28px] border border-amber-200 bg-white/90 shadow-[0_30px_120px_rgba(120,53,15,0.18)] overflow-hidden">
                <div className="relative px-8 py-10 bg-gradient-to-br from-amber-100 via-white to-orange-50 border-b border-amber-200">
                    <div className="absolute right-8 top-8 w-24 h-24 rounded-full bg-amber-300/20 blur-2xl"></div>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl border border-amber-300 bg-amber-100 flex items-center justify-center shadow-sm">
                            <Crown className="w-8 h-8 text-amber-700" />
                        </div>
                        <div>
                            <div className="text-xs tracking-[0.45em] text-amber-700/70 mb-2">终局已定</div>
                            <h1 className="text-4xl font-serif text-slate-800 tracking-wider">黑潮终绝</h1>
                            <p className="text-sm text-slate-500 mt-2">你已击溃归墟古主，这一世正式走到了结局。</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="text-xs text-slate-500 mb-2">最终境界</div>
                            <div className="text-lg font-serif text-slate-800">{realmName}</div>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                            <div className="text-xs text-slate-500 mb-2">结局年龄</div>
                            <div className="text-2xl font-serif text-slate-800">{gameState.age} 岁</div>
                        </div>
                        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
                            <div className="text-xs text-sky-700/70 mb-2">终局支援</div>
                            <div className="text-3xl font-mono text-sky-700">{supportCount}</div>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                            <div className="text-xs text-amber-700/70 mb-2">天道回响</div>
                            <div className="text-3xl font-mono text-amber-700">+{victoryReward}</div>
                        </div>
                    </div>

                    {supportHighlights.length > 0 && (
                        <div className="rounded-2xl border border-sky-200 bg-sky-50/70 p-5">
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <div className="text-sm font-medium text-sky-900">终局援势已兑现</div>
                                <div className="rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs text-sky-700">
                                    {supportHighlights.length} 项回响
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {supportHighlights.map((label) => (
                                    <span
                                        key={label}
                                        className="rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs text-sky-800"
                                    >
                                        {label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="rounded-2xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center gap-2 text-slate-700 mb-4">
                            <ScrollText className="w-4 h-4 text-amber-600" />
                            <span className="text-sm tracking-wider">余波与后话</span>
                        </div>
                        <div className="space-y-3 text-sm leading-7 text-slate-600 font-serif">
                            <p>归墟古主伏诛之后，天地间那股压了许久的阴冷恶意终于开始退潮。修行界不会因此立刻太平，但至少从今天起，众人终于不是在等着毁灭落下。</p>
                            {endings.map((line, index) => (
                                <p key={index}>{line}</p>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                        <div className="flex items-center gap-2 text-slate-700 mb-4">
                            <Swords className="w-4 h-4 text-amber-600" />
                            <span className="text-sm tracking-wider">此世留名</span>
                        </div>
                        <div className="text-sm text-slate-600 leading-7">
                            最近三条大事记:
                            <div className="mt-3 space-y-2">
                                {(gameState.history.length > 0 ? gameState.history.slice(-3) : ['此世虽已走到尽头，但你留下的余音尚未散去。']).map((entry, index) => (
                                    <div key={index} className="rounded-xl border border-slate-200 bg-white px-4 py-3">{entry}</div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                            onClick={closeEpilogue}
                            className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            继续留在人间
                        </button>
                        <button
                            onClick={() => {
                                closeEpilogue();
                                setScene('MENU');
                            }}
                            className="flex-1 rounded-full border border-amber-300 bg-amber-100 px-6 py-3 text-amber-800 hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            返回主菜单
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
