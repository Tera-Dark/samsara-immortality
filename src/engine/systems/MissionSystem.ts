import { GameEngine } from '../GameEngine';
import { ALL_QUESTS } from '../../data/missions';
import type { Mission, GenericMissionState } from '../../types/missionTypes';

export class MissionSystem {
    static checkMissions(engine: GameEngine) {
        this.startAvailableMissions(engine);

        const activeMissions = engine.state.missions.active;
        for (let index = activeMissions.length - 1; index >= 0; index -= 1) {
            const missionState = activeMissions[index];
            const def = this.getMissionDef(missionState.id);
            if (!def) continue;

            let allObjectivesMet = true;

            for (const objective of def.objectives) {
                const currentValue = this.getObjectiveValue(engine, objective.type, objective.target);

                if (missionState.objectives[objective.id] !== currentValue) {
                    missionState.objectives[objective.id] = currentValue;
                }

                if (currentValue < objective.requiredCount) {
                    allObjectivesMet = false;
                }
            }

            if (allObjectivesMet) {
                this.completeMission(engine, missionState, def);
            }
        }
    }

    static completeMission(engine: GameEngine, missionState: GenericMissionState, def: Mission) {
        engine.state.missions.active = engine.state.missions.active.filter((mission) => mission.id !== missionState.id);
        engine.state.missions.completed.push(missionState.id);

        let rewardLog = `完成任务 [${def.title}]`;
        if (def.rewards?.effect) {
            const changes = engine.applyEffect(def.rewards.effect);
            if (changes.length > 0) {
                rewardLog += `\n获得: ${changes.join('、')}`;
            }
        }

        const timeStr = engine.getTimeStr();
        engine.state.history.push(`${timeStr} ${rewardLog}`);

        if (def.endDialog) {
            engine.state.history.push(`${timeStr} ${def.endDialog}`);
        }

        if (def.nextMissionId) {
            this.startMission(engine, def.nextMissionId);
        }

        this.startAvailableMissions(engine);
    }

    static startMission(engine: GameEngine, missionId: string) {
        if (engine.state.missions.active.some((mission) => mission.id === missionId)) return;
        if (engine.state.missions.completed.includes(missionId)) return;

        const def = this.getMissionDef(missionId);
        if (!def) return;
        if (def.minAge && engine.state.age < def.minAge) return;
        if (def.prereqMissions && !def.prereqMissions.every((id) => engine.state.missions.completed.includes(id))) return;
        if (def.functionPrereq && !def.functionPrereq(engine.state)) return;

        const newState: GenericMissionState = {
            id: missionId,
            status: 'ACTIVE',
            objectives: {},
        };

        def.objectives.forEach((objective) => {
            newState.objectives[objective.id] = this.getObjectiveValue(engine, objective.type, objective.target);
        });

        engine.state.missions.active.push(newState);
        engine.state.history.push(`${engine.getTimeStr()} 开启新任务：[${def.title}]`);

        this.checkMissions(engine);
    }

    private static getMissionDef(missionId: string) {
        return ALL_QUESTS.find((mission) => mission.id === missionId);
    }

    private static startAvailableMissions(engine: GameEngine) {
        const hasMainMission =
            engine.state.missions.active.some((mission) => this.getMissionDef(mission.id)?.type === 'MAIN') ||
            engine.state.missions.completed.some((missionId) => this.getMissionDef(missionId)?.type === 'MAIN');

        if (!hasMainMission) {
            const firstAvailableMainMission = ALL_QUESTS.find((mission) => this.canStartMission(engine, mission) && mission.type === 'MAIN');
            if (firstAvailableMainMission) {
                this.startMission(engine, firstAvailableMainMission.id);
                return;
            }
        }

        const autoUnlockableMissions = ALL_QUESTS.filter((mission) => mission.type !== 'MAIN' && this.canStartMission(engine, mission));

        autoUnlockableMissions.forEach((mission) => {
            const newState: GenericMissionState = {
                id: mission.id,
                status: 'ACTIVE',
                objectives: {},
            };

            mission.objectives.forEach((objective) => {
                newState.objectives[objective.id] = this.getObjectiveValue(engine, objective.type, objective.target);
            });

            engine.state.missions.active.push(newState);
            engine.state.history.push(`${engine.getTimeStr()} 开启新任务：[${mission.title}]`);
        });
    }

    private static canStartMission(engine: GameEngine, mission: Mission) {
        if (engine.state.missions.active.some((item) => item.id === mission.id)) return false;
        if (engine.state.missions.completed.includes(mission.id)) return false;
        if (mission.minAge && engine.state.age < mission.minAge) return false;
        if (mission.prereqMissions && !mission.prereqMissions.every((id) => engine.state.missions.completed.includes(id))) return false;
        if (mission.functionPrereq && !mission.functionPrereq(engine.state)) return false;
        return true;
    }

    private static getObjectiveValue(engine: GameEngine, type: Mission['objectives'][number]['type'], target: string) {
        switch (type) {
            case 'STAT':
                return this.getStatObjectiveValue(engine, target);
            case 'AGE':
                return engine.state.age;
            case 'REALM':
                return engine.state.realm_idx;
            case 'ITEM':
            case 'INVENTORY':
                return engine.state.inventory.reduce((sum, slot) => (slot.itemId === target ? sum + slot.count : sum), 0);
            case 'LOCATION':
                return engine.state.location === target ? 1 : 0;
            case 'EVENT':
                return engine.state.triggeredEvents.includes(target) ? 1 : 0;
            case 'SECT':
                return target === 'ANY' ? (engine.state.sect ? 1 : 0) : engine.state.sect === target ? 1 : 0;
            case 'FLAG':
                return engine.state.flags.includes(target) ? 1 : 0;
            case 'KILL':
                return engine.state.inventory.reduce((sum, slot) => (slot.itemId === 'monster_core' ? sum + slot.count : sum), 0);
            default:
                return 0;
        }
    }

    private static getStatObjectiveValue(engine: GameEngine, target: string) {
        if (target.startsWith('ANY_')) {
            const threshold = Number(target.split('_')[1] || 0);
            return Object.values(engine.state.attributes).some((value) => Number(value) >= threshold) ? 1 : 0;
        }

        if (target.startsWith('INTIMACY_')) {
            const threshold = Number(target.split('_')[1] || 0);
            const legacyMet = engine.state.relationships.some((npc) => (npc.intimacy || 0) >= threshold);
            const worldNpcMet = engine.state.world.worldNPCs.some((npc) => (npc.affinity || 0) >= threshold);
            return legacyMet || worldNpcMet ? 1 : 0;
        }

        if (target.startsWith('MONEY_') || target.startsWith('COPPER_')) {
            const threshold = Number(target.split('_')[1] || 0);
            return (engine.state.attributes.MONEY || 0) >= threshold ? 1 : 0;
        }

        const thresholdMatch = target.match(/^([A-Z_]+)_(\d+)$/);
        if (thresholdMatch) {
            const [, statKey, thresholdValue] = thresholdMatch;
            return (engine.state.attributes[statKey] || 0) >= Number(thresholdValue) ? 1 : 0;
        }

        return engine.state.attributes[target] || 0;
    }
}
