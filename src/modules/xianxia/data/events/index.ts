import type { GameEvent } from '../../../../types';
import { EVENTS as EVENTS_CORE } from './events_core';
import { EVENTS_MORTAL } from './events_mortal';
import { EVENTS_QI } from './events_qi';
import { EVENTS_INFANT } from './events_infant';

// Combine all event arrays into one massive pool for the engine to sample from
export const EVENTS: GameEvent[] = [
    ...EVENTS_CORE,
    ...EVENTS_INFANT,
    ...EVENTS_MORTAL,
    ...EVENTS_QI
];
