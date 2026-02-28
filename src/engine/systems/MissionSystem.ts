import { GameEngine } from '../GameEngine';
import { MAIN_QUESTS } from '../../data/missions';
import type { Mission, GenericMissionState } from '../../types/missionTypes';

export class MissionSystem {
    static checkMissions(engine: GameEngine) {
        const activeMissions = engine.state.missions.active;
        // Iterate backwards to allow safe removal
        for (let i = activeMissions.length - 1; i >= 0; i--) {
            const missionState = activeMissions[i];
            const def = MAIN_QUESTS.find(m => m.id === missionState.id);
            if (!def) continue;

            let allObjectivesMet = true;

            // Check Objectives
            for (const obj of def.objectives) {
                let currentVal = 0;

                switch (obj.type) {
                    case 'STAT':
                        // Check Attributes (Attributes are flat now)
                        currentVal = (engine.state.attributes[obj.target] || 0);
                        break;
                    case 'AGE':
                        currentVal = engine.state.age;
                        break;
                    case 'REALM':
                        currentVal = engine.state.realm_idx;
                        break;
                    case 'ITEM': {
                        // Count items in inventory
                        const count = engine.state.inventory.reduce((sum, slot) => slot.itemId === obj.target ? sum + slot.count : sum, 0);
                        currentVal = count;
                        break;
                    }
                    case 'LOCATION':
                        // Check if cur location matches target
                        currentVal = engine.state.location === obj.target ? 1 : 0;
                        break;
                    case 'EVENT':
                        // Check if event ID is in triggeredEvents
                        currentVal = engine.state.triggeredEvents.includes(obj.target) ? 1 : 0;
                        break;
                    case 'SECT':
                        // Check if joined any sect (target='ANY') or specific sect
                        if (obj.target === 'ANY') {
                            currentVal = engine.state.sect ? 1 : 0;
                        } else {
                            currentVal = engine.state.sect === obj.target ? 1 : 0;
                        }
                        break;
                    case 'FLAG':
                        currentVal = engine.state.flags.includes(obj.target) ? 1 : 0;
                        break;
                    case 'INVENTORY': {
                        const count = engine.state.inventory.reduce((sum, slot) => slot.itemId === obj.target ? sum + slot.count : sum, 0);
                        currentVal = count;
                        break;
                    }
                }

                // Update Progress locally
                if (missionState.objectives[obj.id] !== currentVal) {
                    missionState.objectives[obj.id] = currentVal;
                }

                if (currentVal < obj.requiredCount) {
                    allObjectivesMet = false;
                }
            }

            if (allObjectivesMet) {
                this.completeMission(engine, missionState, def);
            }
        }
    }

    static completeMission(engine: GameEngine, missionState: GenericMissionState, def: Mission) {
        // 1. Move to Completed
        engine.state.missions.active = engine.state.missions.active.filter(m => m.id !== missionState.id);
        engine.state.missions.completed.push(missionState.id);

        // 2. Grant Rewards
        const rewards = def.rewards;
        let rewardLog = `完成任务 [${def.title}]！`;

        if (rewards && rewards.effect) {
            const changes = engine.applyEffect(rewards.effect);
            if (changes.length > 0) {
                rewardLog += `\n获得: ${changes.join('，')}`;
            }
        }

        // Log completion
        const currentMonth = engine.state.months % 12;
        const timeStr = currentMonth > 0 ? `[${engine.state.age}岁${currentMonth}月]` : `[${engine.state.age}岁]`;
        engine.state.history.push(`${timeStr} ${rewardLog}`);
        // Also trigger event flavor text?
        if (def.endDialog) {
            engine.state.history.push(`${timeStr} ${def.endDialog}`);
        }

        // 3. Chain Next Mission
        if (def.nextMissionId) {
            this.startMission(engine, def.nextMissionId);
        }
    }

    static startMission(engine: GameEngine, missionId: string) {
        // ID Check
        if (engine.state.missions.active.some(m => m.id === missionId) ||
            engine.state.missions.completed.includes(missionId)) {
            return; // Already active or done
        }

        const def = MAIN_QUESTS.find(m => m.id === missionId);
        if (!def) return;

        // Requirements Check (Prereq logic can go here)
        if (def.minAge && engine.state.age < def.minAge) return;

        // Init State
        const newState: GenericMissionState = {
            id: missionId,
            status: 'ACTIVE',
            objectives: {}
        };

        // Init Objectives Map
        def.objectives.forEach(obj => {
            newState.objectives[obj.id] = 0;
        });

        engine.state.missions.active.push(newState);

        // Log Start
        const currentMonth = engine.state.months % 12;
        const timeStr = currentMonth > 0 ? `[${engine.state.age}岁${currentMonth}月]` : `[${engine.state.age}岁]`;
        engine.state.history.push(`${timeStr} 开启新任务: [${def.title}]`);

        // Force immediate check in case conditions are already met
        this.checkMissions(engine);
    }
}
