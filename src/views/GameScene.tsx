import { useState, useRef, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { RelationshipPanel } from '../components/RelationshipPanel';
import { LogStream } from '../components/LogStream';
import { StatsPanel } from '../components/StatsPanel';
import { SettingsModal } from '../components/SettingsModal';
import { BreakthroughOverlay } from '../components/BreakthroughOverlay';
import { FatePanel } from '../components/FatePanel';
import { WorldMap } from '../components/WorldMap/WorldMap';
import { InventoryPanel } from '../components/Inventory/InventoryPanel';
import { SkillsPanel } from '../components/Skills/SkillsPanel';
import { LocationActionPanel } from '../components/Location/LocationActionPanel';
import { CombatPanel } from '../components/CombatPanel';
import { MissionLogModal } from '../components/MissionLogModal';
import { MAIN_QUESTS } from '../data/missions';
import { getGuidance } from '../utils/guideSystem';
import { TopBar } from '../components/Layout/TopBar';
import { BookOpen, Info, ChevronRight } from 'lucide-react';
import { GameOverOverlay } from '../components/GameOverOverlay';

import type { ActionType } from '../engine/systems/ActionSystem';

// ... existing imports

export const GameScene = () => {
    const { gameState, engine, currentEvent, currentCombat, performAction, makeChoice } = useGameStore();
    const {
        showInventory, toggleInventory,
        showSkills, toggleSkills,
        showMap, toggleMap,
        showSettings, toggleSettings,
        showMissions, toggleMissions,
        // showInfoPanel is local to GameScene as it's a layout toggle for the sidebar?
        // Original code had [showInfoPanel, setShowInfoPanel].
        // Let's keep showInfoPanel local for now or add to store?
        // It's specific to this view layout, so local is probably fine, but let's check.
    } = useUIStore();

    // Local layout state
    const [showInfoPanel, setShowInfoPanel] = useState(false);

    // [NEW] Action Simplification State
    const lastActionRef = useRef<ActionType | null>(null);
    const [lastActionUI, setLastActionUI] = useState<ActionType | null>(null);
    const [showSecludeModal, setShowSecludeModal] = useState(false);
    const [isSecluding, setIsSecluding] = useState(false);
    const [secludeTarget, setSecludeTarget] = useState(0);
    const [secludeProgress, setSecludeProgress] = useState(0);

    // Derived Stats
    const ageYears = gameState.age;

    // Guidance
    const guidance = getGuidance(gameState);

    // [NEW] Wrap performAction to remember lastAction
    const handleAction = useCallback((action: ActionType) => {
        if (!isSecluding) {
            lastActionRef.current = action;
            setLastActionUI(action);
            performAction(action);
        }
    }, [isSecluding, performAction]);

    // [NEW] Keyboard Shortcut for Spacebar
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !e.repeat) {
                // Ignore if any modal/overlay is open
                if (showInventory || showMap || showSettings || showMissions || currentEvent || currentCombat || engine.checkBreakthrough() || isSecluding || showSecludeModal) return;

                if (lastActionRef.current) {
                    e.preventDefault();
                    handleAction(lastActionRef.current);
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showInventory, showMap, showSettings, showMissions, currentEvent, currentCombat, engine, isSecluding, showSecludeModal, handleAction]);

    // [NEW] Secluded Cultivation Loop
    useEffect(() => {
        if (!isSecluding) return;

        // Stop if interrupted by event, breakthrough, or finished target
        if (currentEvent || engine.checkBreakthrough() || secludeProgress >= secludeTarget || !gameState.alive) {
            setTimeout(() => {
                setIsSecluding(false);
                if (secludeProgress >= secludeTarget && secludeTarget > 0) {
                    useGameStore.getState().engine.state.history.push(`【闭关结束】本次闭关了 ${secludeTarget} 个月。`);
                }
            }, 0);
            return;
        }

        const timer = setTimeout(() => {
            performAction('CULTIVATE');
            setSecludeProgress(p => p + 1);
        }, 150); // fast loop tick

        return () => clearTimeout(timer);
    }, [isSecluding, secludeProgress, secludeTarget, currentEvent, engine, performAction, gameState.alive]);

    const startSeclusion = (months: number) => {
        setSecludeTarget(months);
        setSecludeProgress(0);
        setIsSecluding(true);
        setShowSecludeModal(false);
    };

    return (
        <div className="w-full h-screen flex flex-col bg-void overflow-hidden relative">
            {/* ═══════════ Overlays ═══════════ */}

            {/* 死亡结算界面 (Game Over Overlay) */}
            {!gameState.alive && <GameOverOverlay />}

            {/* 战斗界面 (Combat Overlay) */}
            <CombatPanel />

            {/* 突破界面 (Breakthrough Overlay) */}
            {
                useGameStore(s => s.breakthroughMsg) && (
                    <div className="absolute inset-0 z-50">
                        <BreakthroughOverlay />
                    </div>
                )
            }

            {/* 行囊 (Inventory) */}
            {
                showInventory && (
                    <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                        <InventoryPanel onClose={() => toggleInventory(false)} />
                    </div>
                )
            }

            {/* 功法 (Skills) */}
            {
                showSkills && (
                    <div className="absolute inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                        <SkillsPanel onClose={() => toggleSkills(false)} />
                    </div>
                )
            }

            {/* 地图 (World Map) */}
            {
                showMap && (
                    <div className="absolute inset-0 z-50">
                        <WorldMap
                            onClose={() => toggleMap(false)}
                            onTravel={() => {
                                // Refresh Scene
                                toggleMap(false);
                            }}
                        />
                    </div>
                )
            }

            {/* 设置 (Settings) */}
            {
                showSettings && (
                    <SettingsModal onClose={() => toggleSettings(false)} inGame={true} />
                )
            }

            {/* 任务日志 (Mission Log) */}
            {
                showMissions && (
                    <MissionLogModal onClose={() => toggleMissions(false)} />
                )
            }

            {/* 游戏指南 (Tutorial/Help) */}
            {/* TODO: Add GuideModal component */}

            {/* ═══════════ 顶部信息栏 ═══════════ */}
            <TopBar />

            {/* ═══════════ 主体三栏布局 ═══════════ */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 max-w-[1600px] mx-auto w-full overflow-hidden relative z-0">


                {/* ─── 左侧栏：属性 + 人际 ─── */}
                <div className="w-full lg:w-64 shrink-0 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col lg:overflow-hidden order-2 lg:order-1">

                    {/* 属性区块 */}
                    <div className="p-3 lg:block hidden h-full flex flex-col">
                        <StatsPanel />
                    </div>
                </div>

                {/* Mobile Bottom Bar for Stats/Relations (Alternative to sidebar) */}
                <div className="lg:hidden shrink-0 border-t border-slate-200 p-2 flex gap-2 bg-slate-50 order-3">
                    <div className="flex-1 p-2 text-center text-xs text-slate-500 border border-slate-200 rounded">
                        属性 / 人际 (暂略 - 需适配)
                    </div>
                </div>

                {/* ─── 中央区域：信息栏 + 行动 + 事件 ─── */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0 order-1 lg:order-2 overflow-hidden">

                    {/* ═══ 可展开信息栏 ═══ */}
                    <div className="shrink-0 border-b border-slate-200">
                        {/* 折叠切换按钮 */}
                        <button
                            onClick={() => setShowInfoPanel(!showInfoPanel)}
                            className="w-full flex items-center justify-between px-5 py-2 hover:bg-slate-100 transition-colors group"
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-sky-500/70 shrink-0"></span>
                                <span className="text-xs font-serif text-slate-600 tracking-wider shrink-0">角色信息</span>
                                {/* 收起时摘要标签 */}
                                {!showInfoPanel && (
                                    <div className="flex items-center gap-1.5 ml-2 overflow-hidden">
                                        {(gameState.talents || []).map(t => (
                                            <span key={t.id} className="text-xs px-1 py-px rounded border shrink-0" style={{
                                                color: t.grade >= 5 ? '#f59e0b' : t.grade >= 3 ? '#3b82f6' : t.grade >= 2 ? '#059669' : '#6b7280',
                                                borderColor: `${t.grade >= 5 ? '#f59e0b' : t.grade >= 3 ? '#3b82f6' : t.grade >= 2 ? '#059669' : '#6b7280'}30`,
                                            }}>{t.name}</span>
                                        ))}
                                        {(gameState.fate || []).slice(0, 3).map(f => (
                                            <span key={f.id} className="text-xs px-1 py-px rounded border shrink-0" style={{
                                                color: f.grade >= 5 ? '#f59e0b' : f.grade >= 3 ? '#3b82f6' : '#6b7280',
                                                borderColor: `${f.grade >= 5 ? '#f59e0b' : f.grade >= 3 ? '#3b82f6' : '#6b7280'}30`,
                                            }}>{f.name}</span>
                                        ))}
                                        {(gameState.fortuneBuffs || []).length > 0 && (
                                            <span className="text-xs text-amber-500/60 shrink-0">+{gameState.fortuneBuffs.length}气运</span>
                                        )}
                                        {(gameState.relationships || []).length > 0 && (
                                            <span className="text-xs text-slate-600 shrink-0">·{gameState.relationships.length}人</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <ChevronRight className={`w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-all duration-300 shrink-0 ${showInfoPanel ? 'rotate-90' : ''}`} />
                        </button>

                        {/* 展开内容 */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showInfoPanel ? 'max-h-[280px] opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="max-h-[260px] overflow-y-auto overflow-x-hidden custom-scrollbar px-4 pb-3">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

                                    {/* 列1：正邪 + 特质 */}
                                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs font-mono text-slate-500 tracking-[0.15em]">正 邪</span>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>
                                        {/* 正邪值 */}
                                        {gameState.personality && (() => {
                                            const val = gameState.personality.JUSTICE || 0;
                                            return (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-red-400/70 shrink-0">邪</span>
                                                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden relative">
                                                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-400"></div>
                                                        <div
                                                            className={`h-full rounded-full ${val > 0 ? 'bg-emerald-500' : val < 0 ? 'bg-red-500' : ''}`}
                                                            style={{
                                                                width: `${Math.min(50, Math.abs(val))}%`,
                                                                marginLeft: val > 0 ? '50%' : `${50 - Math.min(50, Math.abs(val))}%`
                                                            }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-emerald-400/70 shrink-0">正</span>
                                                    <span className={`w-6 text-center font-mono text-xs font-bold ${val > 0 ? 'text-emerald-400' : val < 0 ? 'text-red-400' : 'text-slate-600'}`}>{val}</span>
                                                </div>
                                            );
                                        })()}

                                        {/* 已获特质 */}
                                        {gameState.acquiredTraits && gameState.acquiredTraits.length > 0 && (
                                            <div className="mt-2.5 flex flex-wrap gap-1">
                                                {gameState.acquiredTraits.map(t => (
                                                    <div key={t.id} className="px-1.5 py-px bg-indigo-50 border border-indigo-200 rounded text-[9px] text-indigo-700" title={t.description}>
                                                        {t.name}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* 列2：命格 / 气运 */}
                                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs font-mono text-slate-500 tracking-[0.15em]">命 格 / 气 运</span>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>
                                        <FatePanel
                                            fate={gameState.fate || []}
                                            fortuneBuffs={gameState.fortuneBuffs || []}
                                            talents={gameState.talents || []}
                                        />
                                    </div>

                                    {/* 列3：人际关系 */}
                                    <div className="bg-white border border-slate-200 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 mb-2">
                                            <span className="text-xs font-mono text-slate-500 tracking-[0.15em]">人 际 关 系</span>
                                            <div className="flex-1 h-px bg-slate-200"></div>
                                        </div>
                                        <RelationshipPanel relations={gameState.relationships || []} compact />
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 行动区 */}
                    <div className="shrink-0 p-5 border-b border-slate-200">
                        <div className="flex items-center gap-2 mb-4 justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70"></span>
                                <span className="text-xs font-serif text-slate-600 tracking-wider">行动</span>
                            </div>
                            {/* Mobile Guidance */}
                            <div
                                onClick={() => toggleMissions(true)}
                                className="md:hidden text-xs text-indigo-600 cursor-pointer hover:text-indigo-800"
                            >
                                {gameState.missions && gameState.missions.active.length > 0 ? (
                                    (() => {
                                        const mId = gameState.missions.active[0].id;
                                        const mTitle = MAIN_QUESTS.find(q => q.id === mId)?.title || '任务中';
                                        return `任务: ${mTitle}`;
                                    })()
                                ) : (
                                    `目标: ${guidance.text}`
                                )}
                            </div>
                            <div className="flex-1 h-px bg-slate-200 ml-3"></div>
                        </div>

                        {/* Guidance Hint (Above Actions) */}
                        {!currentEvent && (
                            <div className="mb-4 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded text-xs text-indigo-700 flex items-center gap-2 animate-fade-in">
                                <Info className="w-4 h-4 shrink-0 opacity-70" />
                                <span>{guidance.subtext}</span>
                            </div>
                        )}

                        {currentEvent ? (
                            /* ─── 事件面板 ─── */
                            <div className="relative bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden animate-fade-in">
                                {/* 顶部装饰线 */}
                                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent"></div>

                                {/* 标题区 */}
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-slate-300"></div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-500 text-xs">
                                            <BookOpen className="w-3.5 h-3.5" />
                                        </span>
                                        <h4 className="text-lg font-serif font-bold text-slate-800 tracking-widest">{currentEvent.title || '命运的抉择'}</h4>
                                    </div>
                                    <div className="h-px flex-1 max-w-[60px] bg-gradient-to-l from-transparent to-slate-300"></div>
                                </div>

                                {/* 内容区 */}
                                <div className="bg-slate-50/80 border border-slate-100 rounded-lg px-5 py-4 mb-5">
                                    <p className="text-sm text-slate-700 leading-relaxed indent-8">{currentEvent.content}</p>
                                </div>

                                {/* 选项区 */}
                                {currentEvent.choices && currentEvent.choices.length > 0 ? (
                                    <div className={`grid gap-2.5 max-w-xl mx-auto ${currentEvent.choices.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        {currentEvent.choices.map((c, i) => (
                                            <button
                                                key={i}
                                                onClick={() => makeChoice(c)}
                                                className="text-left px-4 py-3 bg-white border border-slate-200 hover:border-emerald-300 rounded-lg text-sm text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50 transition-all tracking-wide group flex items-center gap-3"
                                            >
                                                <span className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-emerald-100 border border-slate-200 group-hover:border-emerald-300 flex items-center justify-center text-[10px] text-slate-400 group-hover:text-emerald-500 shrink-0 transition-colors">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="flex-1">{c.text}</span>
                                                <span className="text-slate-300 group-hover:text-emerald-400 transition-colors text-xs">→</span>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex justify-center">
                                        <button onClick={() => makeChoice({ text: '继续' })} className="px-8 py-2.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 hover:bg-emerald-100 transition-all tracking-widest">
                                            继 续
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* ─── 行动卡组 ─── */
                            <div className="flex flex-col gap-3 relative">
                                {/* 核心行动 */}
                                <div>
                                    {ageYears < 3 ? (
                                        <div className="w-full">
                                            <button onClick={() => handleAction('GROW')} className="w-full xl:w-1/2 flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 hover:border-emerald-300 transition-all group shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-serif text-lg group-hover:scale-110 transition-transform">长</span>
                                                    <div className="text-left">
                                                        <div className="font-bold text-emerald-800 mb-0.5">幼年成长 {lastActionUI === 'GROW' && <span className="text-xs bg-slate-100 text-slate-500 px-1 rounded ml-2">空格键</span>}</div>
                                                        <div className="text-xs text-emerald-600/70">岁月如梭，茁壮成长（推演3个月）</div>
                                                    </div>
                                                </div>
                                                <span className="text-emerald-500/50 group-hover:translate-x-1 transition-transform">→</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            {/* 3岁+：教育与修炼 */}
                                            <div className="grid grid-cols-3 xl:grid-cols-5 gap-2">
                                                {/* 习文 */}
                                                <button onClick={() => handleAction('STUDY_LIT')} className="flex items-center gap-2 p-2 bg-sky-50 border border-sky-200 rounded hover:bg-sky-100 hover:border-sky-300 transition-all group relative">
                                                    <div className="w-7 h-7 rounded shrink-0 bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 font-serif group-hover:scale-110 transition-transform text-xs">文</div>
                                                    <div className="text-left flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-slate-700 group-hover:text-sky-700 transition-colors">习文</div>
                                                        <div className="text-[9px] text-slate-500 truncate">提升悟性/魅力(10天)</div>
                                                    </div>
                                                    {lastActionUI === 'STUDY_LIT' && <div className="absolute right-2 top-2 text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">空格</div>}
                                                </button>

                                                {/* 劳作 */}
                                                <button onClick={() => handleAction('WORK')} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 hover:border-slate-300 transition-all group relative">
                                                    <div className="w-7 h-7 rounded shrink-0 bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600 font-serif group-hover:scale-110 transition-transform text-xs">劳</div>
                                                    <div className="text-left flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-slate-700 group-hover:text-slate-800 transition-colors">劳作</div>
                                                        <div className="text-[9px] text-slate-500 truncate">赚取生计(30天)</div>
                                                    </div>
                                                    {lastActionUI === 'WORK' && <div className="absolute right-2 top-2 text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">空格</div>}
                                                </button>

                                                {/* 历练 */}
                                                <button onClick={() => handleAction('EXPLORE')} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded hover:bg-amber-100 hover:border-amber-300 transition-all group relative">
                                                    <div className="w-7 h-7 rounded shrink-0 bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-serif group-hover:scale-110 transition-transform text-xs">历</div>
                                                    <div className="text-left flex-1 min-w-0">
                                                        <div className="text-xs font-bold text-slate-700 group-hover:text-amber-700 transition-colors">历练</div>
                                                        <div className="text-[9px] text-slate-500 truncate">寻找机缘遭遇(15天)</div>
                                                    </div>
                                                    {lastActionUI === 'EXPLORE' && <div className="absolute right-2 top-2 text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">空格</div>}
                                                </button>

                                                {/* 修炼与闭关 (仅拥有功法时显示) */}
                                                {gameState.flags.includes('HAS_CULTIVATION_METHOD') && (
                                                    <>
                                                        <button onClick={() => handleAction('CULTIVATE')} className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 hover:border-purple-300 transition-all group relative">
                                                            <div className="w-7 h-7 rounded shrink-0 bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 font-serif group-hover:scale-110 transition-transform text-xs">修</div>
                                                            <div className="text-left flex-1 min-w-0">
                                                                <div className="text-xs font-bold text-slate-700 group-hover:text-purple-700 transition-colors">吐纳</div>
                                                                <div className="text-[9px] text-slate-500 truncate">吸纳灵气(30天)</div>
                                                            </div>
                                                            {lastActionUI === 'CULTIVATE' && <div className="absolute right-2 top-2 text-[8px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded">空格</div>}
                                                        </button>

                                                        <button onClick={() => setShowSecludeModal(true)} disabled={isSecluding} className="flex items-center gap-2 p-2 bg-fuchsia-50 border border-fuchsia-200 rounded hover:bg-fuchsia-100 hover:border-fuchsia-300 transition-all group relative overflow-hidden disabled:opacity-50">
                                                            {isSecluding && (
                                                                <div className="absolute inset-0 bg-fuchsia-200/50 animate-pulse"></div>
                                                            )}
                                                            <div className="w-7 h-7 rounded shrink-0 bg-fuchsia-100 border border-fuchsia-300 flex items-center justify-center text-fuchsia-700 font-serif group-hover:scale-110 transition-transform text-xs z-10">关</div>
                                                            <div className="text-left flex-1 min-w-0 z-10">
                                                                <div className="text-xs font-bold text-slate-700 group-hover:text-fuchsia-700 transition-colors">{isSecluding ? '闭关中...' : '闭关'}</div>
                                                                <div className="text-[9px] text-slate-500 truncate">{isSecluding ? `${secludeProgress}/${secludeTarget} 月 (点击中断)` : '连续修炼跳过时间'}</div>
                                                            </div>
                                                            {isSecluding && (
                                                                <div className="absolute bottom-0 left-0 h-0.5 bg-fuchsia-500 transition-all" style={{ width: `${(secludeProgress / secludeTarget) * 100}%` }}></div>
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* 位置面板（紧跟行动卡下方） */}
                                {ageYears >= 3 && (
                                    <div className="border-t border-slate-200 pt-3">
                                        <LocationActionPanel />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ─── 系统日志 ─── */}
                    <div className="flex-1 flex flex-col min-h-0 p-5 pt-3">
                        <div className="flex items-center gap-2 mb-3 shrink-0">
                            <span className="text-xs font-mono text-slate-500 tracking-[0.3em]">系统日志</span>
                            <div className="flex-1 h-px bg-slate-200"></div>
                            <span className="text-xs font-mono text-emerald-500/60">●</span>
                        </div>
                        <div className="flex-1 min-h-0 bg-slate-50 border border-slate-200 rounded-lg overflow-y-auto custom-scrollbar relative">
                            {isSecluding && (
                                <div className="absolute top-2 right-2 bg-fuchsia-100 text-fuchsia-700 text-xs px-2 py-1 rounded border border-fuchsia-300 shadow-md animate-pulse z-10">
                                    闭关中 (第 {Math.floor(secludeProgress / 12)} 年 {secludeProgress % 12} 个月)
                                    <button onClick={() => setIsSecluding(false)} className="ml-3 text-fuchsia-600 hover:text-fuchsia-800 underline decoration-fuchsia-400/50 underline-offset-2">中断</button>
                                </div>
                            )}
                            <LogStream logs={gameState.history} />
                        </div>
                    </div>
                </div>

            </div>

            {/* 闭关设置 Modal */}
            {showSecludeModal && (
                <div className="absolute inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white border border-slate-200 rounded-lg p-6 w-full max-w-sm shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-fuchsia-400 to-purple-400"></div>
                        <h2 className="text-xl font-bold text-slate-800 mb-2 font-serif text-center flex items-center justify-center gap-2">
                            <div className="h-px w-8 bg-gradient-to-r from-transparent to-fuchsia-300"></div>
                            洞府闭关
                            <div className="h-px w-8 bg-gradient-to-l from-transparent to-fuchsia-300"></div>
                        </h2>
                        <p className="text-slate-500 text-sm mb-6 text-center leading-relaxed">
                            闭关期间时间将快速流逝，直到达到设定期限或遭遇突发机缘。<br />
                            <span className="text-amber-600 text-xs">闭关时需保证寿元等基本消耗。</span>
                        </p>

                        <div className="space-y-3">
                            <button onClick={() => startSeclusion(6)} className="w-full py-3 bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-300 rounded text-slate-700 transition-colors flex justify-between px-6">
                                <span>小周天</span>
                                <span className="text-slate-400">半年 (6个月)</span>
                            </button>
                            <button onClick={() => startSeclusion(12)} className="w-full py-3 bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-300 rounded text-slate-700 transition-colors flex justify-between px-6">
                                <span>大周天</span>
                                <span className="text-slate-400">一年 (12个月)</span>
                            </button>
                            <button onClick={() => startSeclusion(60)} className="w-full py-3 bg-slate-50 hover:bg-fuchsia-50 border border-slate-200 hover:border-fuchsia-300 rounded text-slate-700 transition-colors flex justify-between px-6">
                                <span>生死关</span>
                                <span className="text-slate-400">五年 (60个月)</span>
                            </button>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button onClick={() => setShowSecludeModal(false)} className="text-slate-400 hover:text-slate-600 text-sm">暂不闭关</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
