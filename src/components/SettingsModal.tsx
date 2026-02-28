import React from 'react';
import { useUIStore } from '../store/uiStore';


interface SettingsModalProps {
    onClose: () => void;
    inGame?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, inGame = false }) => {
    const { settings, setVolume, setScene } = useUIStore();


    const handleReturnToMain = () => {
        if (inGame) {
            // Optional: Auto-save or prompt?
        }
        setScene('MENU');
        onClose();
    };

    const handleOpenCodex = () => {
        setScene('CODEX');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 p-8 w-[420px] shadow-xl space-y-6 rounded-2xl relative overflow-hidden">
                {/* Top accent bar */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"></div>

                {/* Title */}
                <div className="text-center pt-2">
                    <h2 className="text-2xl font-serif text-slate-700 tracking-[0.3em] font-bold">系统设置</h2>
                    <div className="w-16 h-px bg-emerald-400/50 mx-auto mt-2"></div>
                </div>

                <div className="space-y-5">
                    {/* Volume Control */}
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="flex items-center gap-2 text-slate-600 font-serif tracking-widest">
                                <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
                                主音量
                            </span>
                            <span className="text-emerald-600 font-mono text-base font-bold">{settings.volume}%</span>
                        </div>
                        <input
                            type="range"
                            min="0" max="100"
                            value={settings.volume}
                            onChange={(e) => setVolume(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                        />
                        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>0</span>
                            <span>50</span>
                            <span>100</span>
                        </div>
                    </div>

                    {/* In-Game Actions */}
                    {inGame && (
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleOpenCodex}
                                className="px-4 py-4 bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 text-sm font-serif tracking-widest flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                            >
                                <span className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 group-hover:bg-indigo-100 group-hover:scale-110 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                </span>
                                <span>查看图鉴</span>
                            </button>
                            <button
                                onClick={handleReturnToMain}
                                className="px-4 py-4 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-xl border border-slate-200 hover:border-red-300 transition-all duration-300 text-sm font-serif tracking-widest flex flex-col items-center gap-2 group shadow-sm hover:shadow-md"
                            >
                                <span className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-400 group-hover:border-red-200 group-hover:scale-110 transition-all">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                                </span>
                                <span>返回主页</span>
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex justify-center pt-1">
                    <button
                        onClick={onClose}
                        className="px-10 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-300 text-sm tracking-[0.2em] shadow-md hover:shadow-lg active:scale-95 font-medium"
                    >
                        保存并关闭
                    </button>
                </div>
            </div>
        </div>
    );
};
