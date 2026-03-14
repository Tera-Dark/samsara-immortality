import { ALL_QUESTS } from '../data/missions';
import type { PlayerState } from '../types';

export function getMissionDefinition(missionId: string) {
    return ALL_QUESTS.find((mission) => mission.id === missionId) ?? null;
}

export function getPrimaryMission(state: PlayerState) {
    const activeMission =
        state.missions.active.find((mission) => getMissionDefinition(mission.id)?.type === 'MAIN')
        ?? state.missions.active[0];
    if (!activeMission) return null;

    const definition = getMissionDefinition(activeMission.id);
    if (!definition) return null;

    const objective = definition.objectives.find((item) => (activeMission.objectives[item.id] ?? 0) < item.requiredCount) ?? definition.objectives[0] ?? null;
    const current = objective ? Math.min(activeMission.objectives[objective.id] ?? 0, objective.requiredCount) : 0;
    const required = objective?.requiredCount ?? 0;
    const progress = required > 0 ? Math.min(100, Math.round((current / required) * 100)) : 0;

    return {
        state: activeMission,
        definition,
        objective,
        current,
        required,
        progress,
    };
}
