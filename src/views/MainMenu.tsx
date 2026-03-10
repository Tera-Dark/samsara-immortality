import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';
import { SaveLoadModal } from '../components/SaveLoadModal';
import { SettingsModal } from '../components/SettingsModal';
import { Sparkles } from 'lucide-react';

export const MainMenu = () => {
    const { loadGame, getSlots } = useGameStore();
    const [showSettings, setShowSettings] = useState(false);
    const [saveModalMode, setSaveModalMode] = useState<'LOAD' | 'NEW' | null>(null);

    const [hasSaves, setHasSaves] = useState(() => {
        const slots = getSlots();
        return Object.values(slots.slots).some(s => !s.empty);
    });

    const refreshSaves = () => {
        const slots = getSlots();
        setHasSaves(Object.values(slots.slots).some(s => !s.empty));
    };

    const handleContinue = () => {
        const slots = getSlots();
        if (slots.lastPlayedSlot !== -1 && slots.slots[slots.lastPlayedSlot]) {
            loadGame(slots.lastPlayedSlot);
        } else {
            const recent = Object.keys(slots.slots).sort((a, b) => {
                const ta = slots.slots[parseInt(a)]?.timestamp || 0;
                const tb = slots.slots[parseInt(b)]?.timestamp || 0;
                return tb - ta;
            })[0];
            if (recent) loadGame(parseInt(recent));
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/40 via-void/80 to-void pointer-events-none"></div>

            {/* Modals */}
            {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
            {saveModalMode && <SaveLoadModal mode={saveModalMode} onClose={() => { setSaveModalMode(null); refreshSaves(); }} />}

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in space-y-12 w-full max-w-[1200px] mx-auto px-4 z-10 min-h-0 overflow-y-auto no-scrollbar">

                {/* Title Section */}
                <div className="text-center space-y-4">
                    <div className="text-xs font-mono text-emerald-600 tracking-[1em] uppercase opacity-80 mb-2">
                        系统初始化
                    </div>
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <div className="h-[1px] w-12 bg-slate-300"></div>
                        <h1 className="text-5xl md:text-8xl font-serif font-bold tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 text-glow" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                            轮回·仙途
                        </h1>
                        <div className="h-[1px] w-12 bg-slate-300"></div>
                    </div>
                    <div className="text-emerald-600 font-mono text-sm tracking-[0.5em] opacity-80 mb-12">
                        修仙模拟器
                    </div>
                </div>

                <div className="flex flex-col items-center gap-5 w-full max-w-xs md:max-w-sm px-6 mt-4">

                    {/* 主按钮区 */}
                    {hasSaves && (
                        <button
                            onClick={handleContinue}
                            className="w-full px-8 py-4 rounded-lg border border-emerald-500/40 bg-emerald-50 text-emerald-700 font-serif text-lg tracking-[0.3em] relative overflow-hidden group transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-100 hover:shadow-[0_0_30px_rgba(5,150,105,0.1)]"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                            <span className="relative z-10">继续道途</span>
                        </button>
                    )}

                    <button
                        onClick={() => setSaveModalMode('NEW')}
                        className={`w-full px-8 py-4 rounded-lg font-serif text-lg font-bold tracking-[0.3em] relative overflow-hidden group transition-all duration-300 hover:scale-[1.02]
                            ${hasSaves
                                ? 'bg-white text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border border-emerald-200 hover:border-emerald-400 shadow-sm hover:shadow-md'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-500 hover:to-emerald-600 hover:shadow-[0_0_40px_rgba(5,150,105,0.2)]'
                            }`}
                    >
                        {!hasSaves && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>}
                        <span className="relative z-10">{hasSaves ? '再入轮回' : '入世轮回'}</span>
                    </button>

                    {/* Load Game Button */}
                    {hasSaves && (
                        <button
                            onClick={() => setSaveModalMode('LOAD')}
                            className="w-full px-8 py-4 rounded-lg border border-slate-300 bg-white text-slate-600 font-serif text-lg tracking-[0.3em] hover:text-slate-800 hover:bg-slate-50 hover:border-slate-400 transition-all shadow-sm"
                        >
                            <span className="relative z-10">载入存档</span>
                        </button>
                    )}

                    <button
                        onClick={() => useUIStore.getState().setScene('REINCARNATION')}
                        className="w-full px-8 py-4 rounded-lg text-amber-700 font-serif text-lg tracking-[0.3em] transition-all duration-300 hover:text-amber-800 bg-amber-50 border border-amber-200 hover:border-amber-400 hover:bg-amber-100 hover:shadow-md group relative overflow-hidden"
                    >
                        <span className="relative z-10">轮回殿堂</span>
                    </button>

                    {/* 分隔线 */}
                    <div className="flex items-center gap-4 w-full my-1">
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                        <Sparkles className="w-3 h-3 text-slate-400" />
                        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                    </div>

                    {/* 次级按钮区 */}
                    <div className="flex gap-4 w-full">
                        <button
                            onClick={() => useUIStore.getState().setScene('CODEX')}
                            className="flex-1 px-4 py-3 rounded-lg text-slate-500 font-serif text-sm tracking-[0.2em] transition-all duration-300 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                        >
                            万象图鉴
                        </button>
                        <div className="w-px bg-slate-200 my-1"></div>
                        <button
                            onClick={() => setShowSettings(true)}
                            className="flex-1 px-4 py-3 rounded-lg text-slate-500 font-serif text-sm tracking-[0.2em] transition-all duration-300 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                        >
                            系统设置
                        </button>
                    </div>
                </div>
            </div>

            {/* Footer Status */}
            <div className="w-full shrink-0 p-6 flex justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest border-t border-slate-200 bg-void/80 backdrop-blur-sm z-20 mt-auto">
                <div className="flex gap-4">
                    <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        系统在线
                    </span>
                    <span>版本: 0.3.0 (预览版)</span>
                </div>
                <div>
                    存档: {hasSaves ? '已检测' : '无'}
                </div>
            </div>
        </div>
    );
};
