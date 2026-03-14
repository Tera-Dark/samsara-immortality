import { useMemo, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ALL_QUESTS } from '../data/missions';
import { formatEffectToTags } from '../utils/effectFormatter';
import type { GenericMissionState, Mission, MissionType } from '../types/missionTypes';

interface MissionLogModalProps {
    onClose: () => void;
}

type MissionTab = 'ACTIVE' | 'COMPLETED';

type MissionEntry = {
    id: string;
    def: Mission;
    progress?: GenericMissionState['objectives'];
};

const MISSION_TYPE_LABELS: Record<MissionType, string> = {
    MAIN: '主线',
    SIDE: '支线',
    EVENT: '奇遇',
};

const MISSION_TYPE_STYLES: Record<MissionType, string> = {
    MAIN: 'bg-amber-50 text-amber-700 border-amber-200',
    SIDE: 'bg-sky-50 text-sky-700 border-sky-200',
    EVENT: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
};

export const MissionLogModal = ({ onClose }: MissionLogModalProps) => {
    const missions = useGameStore((state) => state.gameState.missions);
    const [selectedTab, setSelectedTab] = useState<MissionTab>('ACTIVE');
    const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);

    const missionMap = useMemo(() => {
        return new Map(ALL_QUESTS.map((mission) => [mission.id, mission]));
    }, []);

    const activeList = useMemo<MissionEntry[]>(() => {
        const entries: MissionEntry[] = [];

        for (const missionState of missions?.active || []) {
            const def = missionMap.get(missionState.id);
            if (!def) continue;
            entries.push({ id: missionState.id, def, progress: missionState.objectives });
        }

        return entries.sort((a, b) => ALL_QUESTS.findIndex((mission) => mission.id === a.id) - ALL_QUESTS.findIndex((mission) => mission.id === b.id));
    }, [missionMap, missions?.active]);

    const completedList = useMemo<MissionEntry[]>(() => {
        const entries: MissionEntry[] = [];

        for (const id of missions?.completed || []) {
            const def = missionMap.get(id);
            if (!def) continue;
            entries.push({ id, def });
        }

        return entries.sort((a, b) => ALL_QUESTS.findIndex((mission) => mission.id === a.id) - ALL_QUESTS.findIndex((mission) => mission.id === b.id));
    }, [missionMap, missions?.completed]);

    const currentList = selectedTab === 'ACTIVE' ? activeList : completedList;
    const selectedMission =
        currentList.find((mission) => mission.id === selectedMissionId) ??
        currentList[0] ??
        null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="flex h-[680px] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-slate-50 px-6">
                    <div>
                        <div className="text-xs font-mono tracking-[0.35em] text-slate-400">MISSION ARCHIVE</div>
                        <h2 className="mt-1 text-lg font-semibold text-slate-800">任务日志</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-colors hover:text-slate-700"
                        aria-label="关闭任务日志"
                    >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="flex min-h-0 flex-1">
                    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
                        <div className="grid grid-cols-2 border-b border-slate-200 p-2">
                            {([
                                { key: 'ACTIVE', label: `进行中 ${activeList.length}` },
                                { key: 'COMPLETED', label: `已完成 ${completedList.length}` },
                            ] as const).map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setSelectedTab(tab.key)}
                                    className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                                        selectedTab === tab.key
                                            ? 'bg-white font-semibold text-slate-800 shadow-sm'
                                            : 'text-slate-500 hover:bg-white/70 hover:text-slate-700'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto p-3 custom-scrollbar">
                            {currentList.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-4 text-sm text-slate-400">
                                    {selectedTab === 'ACTIVE' ? '当前没有进行中的任务。' : '当前还没有已完成任务。'}
                                </div>
                            ) : (
                                currentList.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setSelectedMissionId(item.id)}
                                        className={`w-full rounded-2xl border p-3 text-left transition-all ${
                                            selectedMission?.id === item.id
                                                ? 'border-slate-300 bg-white shadow-sm'
                                                : 'border-transparent bg-white/40 hover:border-slate-200 hover:bg-white/80'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="truncate text-sm font-semibold text-slate-800">{item.def.title}</div>
                                            <span className={`rounded-full border px-2 py-0.5 text-[10px] ${MISSION_TYPE_STYLES[item.def.type]}`}>
                                                {MISSION_TYPE_LABELS[item.def.type]}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{item.def.description}</p>
                                    </button>
                                ))
                            )}
                        </div>
                    </aside>

                    <section className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar">
                        {selectedMission ? (
                            <div className="mx-auto max-w-3xl space-y-6">
                                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-5">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className={`rounded-full border px-3 py-1 text-xs ${MISSION_TYPE_STYLES[selectedMission.def.type]}`}>
                                                {MISSION_TYPE_LABELS[selectedMission.def.type]}
                                            </span>
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
                                                {selectedTab === 'ACTIVE' ? '进行中' : '已完成'}
                                            </span>
                                        </div>
                                        <h1 className="mt-3 text-3xl font-semibold text-slate-900">{selectedMission.def.title}</h1>
                                        <div className="mt-2 font-mono text-xs tracking-[0.2em] text-slate-400">{selectedMission.id}</div>
                                    </div>
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                                    <div className="text-xs font-mono tracking-[0.25em] text-slate-400">任务概述</div>
                                    <p className="mt-3 leading-7 text-slate-700">{selectedMission.def.description}</p>
                                </div>

                                <div>
                                    <div className="mb-3 text-sm font-semibold text-slate-800">目标进度</div>
                                    <div className="space-y-3">
                                        {selectedMission.def.objectives.map((objective) => {
                                            const currentValue =
                                                selectedTab === 'ACTIVE'
                                                    ? Math.min(selectedMission.progress?.[objective.id] ?? 0, objective.requiredCount)
                                                    : objective.requiredCount;
                                            const progress = Math.min(100, Math.round((currentValue / objective.requiredCount) * 100));
                                            const completed = currentValue >= objective.requiredCount;

                                            return (
                                                <div
                                                    key={objective.id}
                                                    className={`rounded-2xl border p-4 ${
                                                        completed ? 'border-emerald-200 bg-emerald-50/70' : 'border-slate-200 bg-white'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-800">{objective.description}</div>
                                                            <div className="mt-1 text-xs text-slate-400">{objective.type}</div>
                                                        </div>
                                                        <div className="rounded-full bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">
                                                            {currentValue} / {objective.requiredCount}
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <div className="mb-3 text-sm font-semibold text-slate-800">任务奖励</div>
                                    <div className="rounded-3xl border border-amber-200 bg-amber-50/80 p-5">
                                        <div className="text-sm font-medium text-amber-900">{selectedMission.def.rewards.text}</div>
                                        {selectedMission.def.rewards.effect && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {formatEffectToTags(selectedMission.def.rewards.effect).map((tag, index) => (
                                                    <span
                                                        key={`${selectedMission.id}-reward-${index}`}
                                                        className="rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-xs text-amber-800"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-full items-center justify-center">
                                <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-8 py-10 text-center text-slate-400">
                                    选择左侧任务以查看详情。
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};
