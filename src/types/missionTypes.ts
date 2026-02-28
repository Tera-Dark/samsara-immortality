import type { Effect } from './index';

export type MissionType = 'MAIN' | 'SIDE' | 'EVENT';
export type MissionStatus = 'LOCKED' | 'AVAILABLE' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface MissionObjective {
    id: string; // unique within mission
    description: string;
    type: 'STAT' | 'ITEM' | 'REALM' | 'AGE' | 'LOCATION' | 'EVENT' | 'KILL' | 'SECT' | 'FLAG' | 'INVENTORY';
    target: string; // Stat Key, Item ID, Realm ID, etc.
    requiredCount: number;
    currentCount: number;
}

export interface MissionReward {
    text: string;
    effect: Effect; // Re-use generic effect
}

export interface Mission {
    id: string;
    type: MissionType;
    title: string;
    description: string;

    // Prereqs to become AVAILABLE
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    functionPrereq?: (state: any) => boolean; // For static definitions, might need pure data logic later
    prereqMissions?: string[];
    minAge?: number;

    objectives: MissionObjective[];
    rewards: MissionReward;

    // Chain
    nextMissionId?: string;

    // Flavor
    startDialog?: string;
    endDialog?: string;
}

export interface GenericMissionState {
    id: string;
    status: MissionStatus;
    objectives: { [key: string]: number }; // Objective ID -> current count
}
