import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { SaveLoadModal } from '../components/SaveLoadModal';
import { SettingsModal } from '../components/SettingsModal';
import { ReleaseNotesModal } from '../components/ReleaseNotesModal';

const RELEASE_VERSION = '0.9.0';

export const MainMenu = () => {
    const { loadGame, getSlots } = useGameStore();
    const [showSettings, setShowSettings] = useState(false);
    const [showReleaseNotes, setShowReleaseNotes] = useState(false);
    const [saveModalMode, setSaveModalMode] = useState<'LOAD' | 'NEW' | null>(null);

    const [hasSaves, setHasSaves] = useState(() => {
        const slots = getSlots();
        return Object.values(slots.slots).some((slot) => !slot.empty);
    });

    const refreshSaves = () => {
        const slots = getSlots();
        setHasSaves(Object.values(slots.slots).some((slot) => !slot.empty));
    };

    React.useEffect(() => {
        const seenVersion = localStorage.getItem('aeon_release_notes_seen');
        if (seenVersion !== RELEASE_VERSION) {
            setShowReleaseNotes(true);
        }
    }, []);

    const handleCloseReleaseNotes = () => {
        localStorage.setItem('aeon_release_notes_seen', RELEASE_VERSION);
        setShowReleaseNotes(false);
    };

    const handleContinue = () => {
        const slots = getSlots();
        if (slots.lastPlayedSlot !== -1 && slots.slots[slots.lastPlayedSlot]) {
            if (!loadGame(slots.lastPlayedSlot)) {
                setSaveModalMode('LOAD');
            }
            return;
        }

        const recent = Object.keys(slots.slots).sort((a, b) => {
            const ta = slots.slots[parseInt(a, 10)]?.timestamp || 0;
            const tb = slots.slots[parseInt(b, 10)]?.timestamp || 0;
            return tb - ta;
        })[0];

        if (recent && !loadGame(parseInt(recent, 10))) {
            setSaveModalMode('LOAD');
        }
    };

    return (
        <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/40 via-void/80 to-void"></div>

            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            {showReleaseNotes && <ReleaseNotesModal version={RELEASE_VERSION} onClose={handleCloseReleaseNotes} />}
            {saveModalMode && <SaveLoadModal mode={saveModalMode} onClose={() => { setSaveModalMode(null); refreshSaves(); }} />}

            <div className="z-10 mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 flex-col items-center justify-center space-y-12 overflow-y-auto px-4 animate-fade-in no-scrollbar">
                <div className="space-y-4 text-center">
                    <div className="mb-2 text-xs font-mono uppercase tracking-[1em] text-emerald-600 opacity-80">System Boot</div>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <div className="h-[1px] w-12 bg-slate-300"></div>
                        <h1 className='mb-4 bg-gradient-to-b from-slate-800 to-slate-500 bg-clip-text text-5xl font-serif font-bold tracking-tighter text-transparent md:text-8xl text-glow' style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                            轮回·仙途
                        </h1>
                        <div className="h-[1px] w-12 bg-slate-300"></div>
                    </div>
                    <div className="mb-12 text-sm font-mono tracking-[0.5em] text-emerald-600 opacity-80">修仙人生模拟</div>
                </div>

                <div className="mt-4 flex w-full max-w-xs flex-col items-center gap-5 px-6 md:max-w-sm">
                    {hasSaves && (
                        <button
                            onClick={handleContinue}
                            className="group relative w-full overflow-hidden rounded-lg border border-emerald-500/40 bg-emerald-50 px-8 py-4 text-lg tracking-[0.3em] text-emerald-700 transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-[0_0_30px_rgba(5,150,105,0.1)]"
                        >
                            <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 transition-transform duration-700 group-hover:translate-x-[100%]"></div>
                            <span className="relative z-10">继续旅程</span>
                        </button>
                    )}

                    <button
                        onClick={() => setSaveModalMode('NEW')}
                        className={`group relative w-full overflow-hidden rounded-lg px-8 py-4 text-lg font-bold tracking-[0.3em] transition-all duration-300 hover:scale-[1.02] ${
                            hasSaves
                                ? 'border border-emerald-200 bg-white text-emerald-700 shadow-sm hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-800 hover:shadow-md'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 hover:shadow-[0_0_40px_rgba(5,150,105,0.2)]'
                        }`}
                    >
                        {!hasSaves && <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-[100%]"></div>}
                        <span className="relative z-10">{hasSaves ? '再入轮回' : '入世轮回'}</span>
                    </button>

                    {hasSaves && (
                        <button
                            onClick={() => setSaveModalMode('LOAD')}
                            className="w-full rounded-lg border border-slate-300 bg-white px-8 py-4 text-lg tracking-[0.3em] text-slate-600 shadow-sm transition-all hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800"
                        >
                            载入存档
                        </button>
                    )}

                    <button
                        onClick={() => useUIStore.getState().setScene('REINCARNATION')}
                        className="group relative w-full overflow-hidden rounded-lg border border-amber-200 bg-amber-50 px-8 py-4 text-lg tracking-[0.3em] text-amber-700 transition-all duration-300 hover:border-amber-400 hover:bg-amber-100 hover:text-amber-800 hover:shadow-md"
                    >
                        <span className="relative z-10">轮回殿堂</span>
                    </button>

                    <div className="my-1 flex w-full items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        <Sparkles className="h-3 w-3 text-slate-400" />
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    </div>

                    <div className="flex w-full gap-4">
                        <button
                            onClick={() => useUIStore.getState().setScene('CODEX')}
                            className="flex-1 rounded-lg border border-transparent px-4 py-3 text-sm tracking-[0.2em] text-slate-500 transition-all duration-300 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                        >
                            万象图鉴
                        </button>
                        <div className="my-1 w-px bg-slate-200"></div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex-1 rounded-lg border border-transparent px-4 py-3 text-sm tracking-[0.2em] text-slate-500 transition-all duration-300 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                        >
                            系统设置
                        </button>
                    </div>

                    <button
                        onClick={() => setShowReleaseNotes(true)}
                        className="text-xs tracking-[0.22em] text-slate-400 transition-colors hover:text-emerald-600"
                    >
                        查看版本说明
                    </button>
                </div>
            </div>

            <div className="z-20 mt-auto flex w-full shrink-0 justify-between border-t border-slate-200 bg-void/80 p-6 text-[10px] font-mono uppercase tracking-widest text-slate-500 backdrop-blur-sm">
                <div className="flex gap-4">
                    <span className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500"></span>
                        系统在线
                    </span>
                    <span>版本: {RELEASE_VERSION} 公开试玩版</span>
                </div>
                <div>存档: {hasSaves ? '已检测' : '无'}</div>
            </div>
        </div>
    );
};
