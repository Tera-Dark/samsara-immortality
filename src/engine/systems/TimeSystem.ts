import { GameEngine } from '../GameEngine';
import type { GameEvent } from '../../types';
import type { CombatEntity, CombatState } from '../../types/combat';
import { TalentSystem } from './TalentSystem';
import { MissionSystem } from './MissionSystem';
import { CultivationSystem } from './CultivationSystem';
import { EventSystem } from './EventSystem';

export class TimeSystem {
    static advanceTime(engine: GameEngine, monthsPassed: number, context?: { action?: string }, daysPassed: number = 0): { event: GameEvent | null; message?: string, combat?: { enemy: Partial<CombatEntity>, type: CombatState['type'] } } {
        if (!engine.state.alive) return { event: null, message: "已死亡" };

        // Turn Start Triggers
        TalentSystem.triggerTalents(engine, 'TURN_START');

        // [NEW] Time Advancement Logic
        // Normalize days to 30/month
        engine.state.day = (engine.state.day || 1) + daysPassed;
        let extraMonths = 0;
        while (engine.state.day > 30) {
            engine.state.day -= 30;
            extraMonths++;
        }

        const totalMonthsPassed = monthsPassed + extraMonths;
        engine.state.months += totalMonthsPassed;

        const oldAge = engine.state.age;
        engine.state.age = Math.floor(engine.state.months / 12);

        // [NEW] 气运buff倒计时
        TalentSystem.tickFortuneBuffs(engine, totalMonthsPassed);

        // Age Up Trigger
        if (engine.state.age > oldAge) {
            TalentSystem.triggerTalents(engine, 'AGE_UP');
        }

        if (engine.state.age >= CultivationSystem.getLifespan(engine)) {
            engine.state.alive = false;
            return { event: null, message: "寿元已尽，道消身死..." };
        }

        // [NEW] Passive EXP Gain (with spirit root speed multiplier)
        if (engine.state.realm_idx > 0) {
            const baseGain = 10 * totalMonthsPassed;
            const multi = 1 + (engine.state.attributes.POT || 0) * 0.05 + (engine.state.attributes.INT || 0) * 0.02;
            const rootSpeed = engine.state.cultivationSpeedMultiplier || 1.0;
            engine.state.exp += Math.floor(baseGain * multi * rootSpeed);
            if (engine.state.exp > engine.state.maxExp) {
                engine.state.exp = engine.state.maxExp; // Cap at maxExp until breakthrough
            }
        }

        // Legacy Per Turn (Maintain for now)
        engine.state.talents.forEach(t => {
            if (t.effect?.per_turn?.ALL) {
                for (const k in engine.state.attributes) engine.state.attributes[k] += t.effect.per_turn.ALL;
            }
        });

        // Check Missions
        MissionSystem.checkMissions(engine);

        const breakthroughResult = CultivationSystem.checkBreakthrough(engine);
        const event = EventSystem.findEvent(engine, context);

        // Turn End Triggers
        TalentSystem.triggerTalents(engine, 'TURN_END');

        return {
            event,
            message: breakthroughResult?.message,
            combat: breakthroughResult?.combat
        };
    }
}
