
import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { MAIN_QUESTS } from '../data/missions';

interface MissionLogModalProps {
    onClose: () => void;
}

export const MissionLogModal = ({ onClose }: MissionLogModalProps) => {
    const { gameState } = useGameStore();
    const [selectedTab, setSelectedTab] = useState<'ACTIVE' | 'COMPLETED'>('ACTIVE');
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

    const activeMissions = gameState.missions?.active || [];
    const completedMissionIds = gameState.missions?.completed || [];

    // Helper to get mission definition
    const getMissionDef = (id: string) => MAIN_QUESTS.find(m => m.id === id);

    // Filtered lists
    const activeList = activeMissions.map(m => ({ ...m, def: getMissionDef(m.id) })).filter(m => m.def);
    const completedList = completedMissionIds.map(id => ({ id, def: getMissionDef(id) })).filter(m => m.def);

    // Current selection
    const currentList = selectedTab === 'ACTIVE' ? activeList : completedList;
    const selectedMission = currentList.find(m => m.id === selectedMissionId) || currentList[0];

    return (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-4xl h-[600px] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
                    <h2 className="text-lg font-serif font-bold text-slate-700 tracking-[0.2em] flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-amber-400 rounded-full"></span>
                        任务日志
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 flex min-h-0">
                    {/* Left Sidebar: List */}
                    <div className="w-56 bg-slate-50 border-r border-slate-200 flex flex-col">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setSelectedTab('ACTIVE')}
                                className={`flex-1 py-3 text-sm font-serif transition-all relative ${selectedTab === 'ACTIVE'
                                    ? 'text-amber-600 font-bold bg-white'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                            >
                                进行中 ({activeList.length})
                                {selectedTab === 'ACTIVE' && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-amber-400 rounded-full"></div>}
                            </button>
                            <button
                                onClick={() => setSelectedTab('COMPLETED')}
                                className={`flex-1 py-3 text-sm font-serif transition-all relative ${selectedTab === 'COMPLETED'
                                    ? 'text-emerald-600 font-bold bg-white'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'}`}
                            >
                                已完成 ({completedList.length})
                                {selectedTab === 'COMPLETED' && <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-400 rounded-full"></div>}
                            </button>
                        </div>

                        {/* Mission List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                            {currentList.length === 0 ? (
                                <div className="p-4 text-center text-xs text-slate-400 font-serif">
                                    暂无{selectedTab === 'ACTIVE' ? '进行中' : '已完成'}任务
                                </div>
                            ) : (
                                currentList.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedMissionId(item.id)}
                                        className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all ${(selectedMission?.id === item.id)
                                            ? 'bg-white border-slate-200 text-slate-700 shadow-sm'
                                            : 'bg-transparent border-transparent text-slate-500 hover:bg-white/60 hover:text-slate-600'
                                            }`}
                                    >
                                        <div className="text-sm font-bold truncate">{item.def?.title || item.id}</div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">{item.def?.type === 'MAIN' ? '主线' : '支线'}</div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Content: Details */}
                    <div className="flex-1 bg-white p-6 overflow-y-auto custom-scrollbar relative">
                        {selectedMission ? (
                            <div className="max-w-2xl mx-auto space-y-6">
                                {/* Title & Badge */}
                                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h1 className="text-2xl font-serif font-bold text-slate-800 mb-2">{selectedMission.def?.title}</h1>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${selectedTab === 'ACTIVE'
                                                ? 'bg-amber-50 border border-amber-200 text-amber-600'
                                                : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                                                }`}>
                                                {selectedTab === 'ACTIVE' ? '进行中' : '已完成'}
                                            </span>
                                            <span className="text-xs text-slate-400 font-mono">编号: {selectedMission.id}</span>
                                        </div>
                                    </div>
                                    {selectedTab === 'COMPLETED' && (
                                        <div className="w-14 h-14 rounded-full border-2 border-emerald-300 text-emerald-400 flex items-center justify-center font-serif font-bold text-sm rotate-12 select-none">
                                            完成
                                        </div>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                    <p className="text-slate-600 leading-relaxed text-sm">
                                        {selectedMission.def?.description}
                                    </p>
                                </div>

                                {/* Objectives */}
                                <div>
                                    <h3 className="text-sm text-slate-500 tracking-widest mb-3 border-l-2 border-amber-400 pl-3 font-serif">任务目标</h3>
                                    <div className="space-y-2">
                                        {selectedMission.def?.objectives.map((obj) => {
                                            // Get progress if active (objectives is Map<string, number>)
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            const currentCount = ('objectives' in selectedMission && (selectedMission as any).objectives)
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                ? ((selectedMission as any).objectives[obj.id] || 0)
                                                : (selectedTab === 'COMPLETED' ? obj.requiredCount : 0);

                                            const current = currentCount;
                                            const needed = obj.requiredCount;
                                            const isDone = current >= needed;

                                            return (
                                                <div key={obj.id} className={`flex items-center justify-between p-3 rounded-lg border ${isDone
                                                    ? 'bg-emerald-50/50 border-emerald-100'
                                                    : 'bg-white border-slate-100'
                                                    }`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isDone
                                                            ? 'bg-emerald-500 border-emerald-500'
                                                            : 'border-slate-300'
                                                            }`}>
                                                            {isDone && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>}
                                                        </div>
                                                        <span className={`text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                                                            {obj.description}
                                                        </span>
                                                    </div>
                                                    <div className={`text-xs font-mono px-2 py-0.5 rounded ${isDone
                                                        ? 'text-emerald-500 bg-emerald-50'
                                                        : 'text-slate-400 bg-slate-50'
                                                        }`}>
                                                        {current} / {needed}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Rewards */}
                                {selectedMission.def?.rewards && (
                                    <div>
                                        <h3 className="text-sm text-slate-500 tracking-widest mb-3 border-l-2 border-amber-400 pl-3 font-serif">任务奖励</h3>
                                        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm">
                                            <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 font-serif font-bold shrink-0">赏</span>
                                            <span>{selectedMission.def.rewards.text}</span>
                                        </div>
                                    </div>
                                )}

                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300 font-serif text-lg">志</div>
                                <p className="font-serif tracking-widest">请选择一个任务查看详情</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
