import { GameEngine } from '../GameEngine';
import type { GameEvent } from '../../types';
import type { CombatEntity, CombatState } from '../../types/combat';
import { TalentSystem } from './TalentSystem';
import { MissionSystem } from './MissionSystem';
import { CultivationSystem } from './CultivationSystem';
import { EventSystem } from './EventSystem';
import { AbodeSystem } from './AbodeSystem';
import { SectSystem } from './SectSystem';
import { AchievementSystem } from './AchievementSystem';

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
        engine.state.world.worldMonth += totalMonthsPassed;

        const oldAge = engine.state.age;
        engine.state.age = Math.floor(engine.state.months / 12);

        // [NEW] 气运buff倒计时
        TalentSystem.tickFortuneBuffs(engine, totalMonthsPassed);

        // [NEW] 灵田生长 tick
        AbodeSystem.tickGrowth(engine, totalMonthsPassed);

        // [NEW] 宗门任务月度重置
        if (totalMonthsPassed > 0) {
            SectSystem.monthlyReset(engine);
        }

        // [NEW] 成就检测
        AchievementSystem.checkAll(engine);

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
            const abodeBonus = 1 + AbodeSystem.getCultivationBonus(engine);
            const realmBonus = 1 + Math.max(0, engine.state.realm_idx - 1) * 0.16;
            engine.state.exp += Math.floor(baseGain * multi * rootSpeed * abodeBonus * realmBonus);
            if (engine.state.exp > engine.state.maxExp) {
                engine.state.exp = engine.state.maxExp; // Cap at maxExp until breakthrough
            }
        }

        // [REMOVED] Legacy per_turn code was double-applying effects.
        // All per-turn effects are now handled exclusively by TalentSystem.triggerTalents() modifiers.

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
