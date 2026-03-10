import { GameEngine } from '../GameEngine';
import type { GameEvent, EventChoice, EventOutcome, Effect } from '../../types';
import { ConditionMatcher } from '../../utils/ConditionMatcher';
import { TEXT_CONSTANTS } from '../../data/rules';
import { ITEMS } from '../../data/items';
import { MissionSystem } from './MissionSystem';
import { CultivationSystem } from './CultivationSystem';
import { checkAffinityEvents } from '../../modules/xianxia/data/events/events_affinity';

export class EventSystem {
    static findEvent(engine: GameEngine, context?: { action?: string }): GameEvent | null {
        // 1. Update World State (Eras) - moved to TimeSystem later, but keep simple for now
        engine.state.world.worldMonth++;

        // 2. High Priority: Dynamic Affinity Events
        const affinityEvent = checkAffinityEvents(engine);
        if (affinityEvent) {
            return affinityEvent;
        }

        // 3. Filter candidates using unified V2 Condition System
        const candidates = engine.events.filter(e => {
            if (engine.state.triggeredEvents.includes(e.id)) return false;

            // Unified Condition Check (V2)
            if (e.conditions && !ConditionMatcher.checkConditions(engine.state, e.conditions, context)) {
                return false;
            }

            // Probability Check (V2)
            if (e.probability !== undefined && Math.random() > e.probability) {
                return false;
            }

            return true;
        });

        if (candidates.length === 0) return null;

        return candidates[Math.floor(Math.random() * candidates.length)];
    }

    /** @deprecated String conditions are no longer supported. Use Condition[] instead. */
    static checkCondition(_engine: GameEngine, cond: string, _context?: { action?: string }): boolean {
        console.warn(`[EventSystem] String condition eval is deprecated and disabled: "${cond}". Migrate to Condition[] objects.`);
        return false;
    }

    static processEvent(engine: GameEngine, event: GameEvent) {
        if (event.branches && event.branches.length > 0) {
            for (const branch of event.branches) {
                const isSuccess = ConditionMatcher.checkConditions(engine.state, branch.check);
                const outcome = isSuccess ? branch.success : branch.failure;

                const changes = this.applyOutcome(engine, outcome);
                engine.state.triggeredEvents.push(event.id);

                let logText = `${event.title || ''}: ${outcome.text}`;
                if (changes.length > 0) {
                    logText += `\n( ${changes.join('，')} )`;
                }
                if (outcome.effect?.history) {
                    logText += `\n${outcome.effect.history}`;
                }

                const currentMonth = engine.state.months % 12;
                const timeStr = currentMonth > 0 ? `[${engine.state.age}岁${currentMonth}月]` : `[${engine.state.age}岁]`;
                engine.state.history.push(`${timeStr} ${logText}`);
                return;
            }
        }

        const changes: string[] = [];
        if (event.effect) {
            changes.push(...this.applyEffect(engine, event.effect));
        }
        engine.state.triggeredEvents.push(event.id);

        const title = event.title;
        const body = event.content || "";

        let logText = "";
        if (title) {
            logText = `${title}: ${body}`;
        } else {
            logText = body || "突发事件";
        }

        if (changes.length > 0) {
            logText += `\n( ${changes.join('，')} )`;
        }
        if (event.effect?.history) {
            logText += `\n${event.effect.history}`;
        }

        const currentMonth = engine.state.months % 12;
        const timeStr = currentMonth > 0 ? `[${engine.state.age}岁${currentMonth}月]` : `[${engine.state.age}岁]`;
        engine.state.history.push(`${timeStr} ${logText}`);
    }

    static applyOutcome(engine: GameEngine, outcome: EventOutcome): string[] {
        const changes: string[] = [];
        if (outcome.effect) {
            changes.push(...this.applyEffect(engine, outcome.effect));
        }
        if (outcome.death) {
            engine.state.alive = false;
        }
        return changes;
    }

    static makeChoice(engine: GameEngine, choice: EventChoice) {
        const currentMonth = engine.state.months % 12;
        const timeStr = currentMonth > 0 ? `[${engine.state.age}岁${currentMonth}月]` : `[${engine.state.age}岁]`;

        let logText = `你选择了：${choice.text}`;

        if (choice.effect) {
            const changes = this.applyEffect(engine, choice.effect);
            if (changes.length > 0) {
                logText += `\n( ${changes.join('，')} )`;
            }
            if (choice.effect.history) {
                logText += `\n${choice.effect.history}`;
            }
        }
        engine.state.history.push(`${timeStr} ${logText}`);
    }

    static applyEffect(engine: GameEngine, effect: Effect): string[] {
        const changes: string[] = [];
        if (!effect) return changes;

        // Stats (Generic & Specific)
        for (const k in effect) {
            if (k === 'flags' || k === 'history' || k === 'stats' || k === 'per_turn' || k === 'items' || k === 'item') continue;

            if (typeof effect[k] === 'number') {
                const val = effect[k];
                engine.state.attributes[k] = (engine.state.attributes[k] || 0) + val;
                const statName = TEXT_CONSTANTS.STATS[k as keyof typeof TEXT_CONSTANTS.STATS] || k;
                changes.push(`${statName} ${val > 0 ? '+' : ''}${val}`);
            }
        }

        // Legacy/Structured Stats support
        if (effect.stats) {
            for (const k in effect.stats) {
                const val = effect.stats[k];
                engine.state.attributes[k] = (engine.state.attributes[k] || 0) + val;
                const statName = TEXT_CONSTANTS.STATS[k as keyof typeof TEXT_CONSTANTS.STATS] || k;
                changes.push(`${statName} ${val > 0 ? '+' : ''}${val}`);
            }
        }

        CultivationSystem.recalculateStats(engine);

        // Special flags
        if (effect.flags) {
            engine.state.flags.push(...effect.flags);
        }

        // Items handling (Calls GameEngine.addItem for now, we leave inventory management in GameEngine or move to InventorySystem later)
        if (effect.item) {
            engine.addItem(effect.item as string, 1);
            const itemName = ITEMS[effect.item as string]?.name || effect.item;
            changes.push(`获得 ${itemName}`);
        }
        if (effect.items) {
            (effect.items as string[]).forEach(id => {
                engine.addItem(id, 1);
                const itemName = ITEMS[id]?.name || id;
                changes.push(`获得 ${itemName}`);
            });
        }

        MissionSystem.checkMissions(engine);

        return changes;
    }
}
