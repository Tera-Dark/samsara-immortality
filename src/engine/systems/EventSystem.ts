import { GameEngine } from '../GameEngine';
import type { GameEvent, EventChoice, EventOutcome, Effect } from '../../types';
import { ConditionMatcher } from '../../utils/ConditionMatcher';
import { TEXT_CONSTANTS } from '../../data/rules';
import { ITEMS } from '../../data/items';
import { MissionSystem } from './MissionSystem';
import { CultivationSystem } from './CultivationSystem';
import { checkStartStoryEvents } from '../../modules/xianxia/data/events/startStoryEvents';
import { checkMainStoryEvents } from '../../modules/xianxia/data/events/events_mainStory';
import { checkStoryHumanityEvents } from '../../modules/xianxia/data/events/storyHumanityEvents';
import { checkStoryWorldPulseEvents } from '../../modules/xianxia/data/events/storyWorldPulseEvents';
import { checkStoryFactionEvents } from '../../modules/xianxia/data/events/storyFactionEvents';
import { checkAffinityEvents } from '../../modules/xianxia/data/events/events_affinity';
import { checkSpecialNpcEvents } from '../../modules/xianxia/data/events/specialNpcEvents';
import { checkExplorationChainEvents } from '../../modules/xianxia/data/events/explorationChainEvents';

export class EventSystem {
    static findEvent(engine: GameEngine, context?: { action?: string }): GameEvent | null {
        // 1. Opening story chain
        const startStoryEvent = checkStartStoryEvents(engine, context);
        if (startStoryEvent) {
            return startStoryEvent;
        }

        // 2. Main story chain
        const mainStoryEvent = checkMainStoryEvents(engine, context);
        if (mainStoryEvent) {
            return mainStoryEvent;
        }

        // 3. Main-story social texture and recurring characters
        const storyHumanityEvent = checkStoryHumanityEvents(engine, context);
        if (storyHumanityEvent) {
            return storyHumanityEvent;
        }

        // 4. World pulse events around the main story
        const storyWorldPulseEvent = checkStoryWorldPulseEvents(engine, context);
        if (storyWorldPulseEvent) {
            return storyWorldPulseEvent;
        }

        // 5. Enemy and faction recurring characters
        const storyFactionEvent = checkStoryFactionEvents(engine, context);
        if (storyFactionEvent) {
            return storyFactionEvent;
        }

        // 6. High Priority: Special NPC story chain
        const specialNpcEvent = checkSpecialNpcEvents(engine, context);
        if (specialNpcEvent) {
            return specialNpcEvent;
        }

        // 7. Exploration clue chains
        const explorationChainEvent = checkExplorationChainEvents(engine, context);
        if (explorationChainEvent) {
            return explorationChainEvent;
        }

        // 8. Dynamic Affinity Events
        const affinityEvent = checkAffinityEvents(engine);
        if (affinityEvent) {
            return affinityEvent;
        }

        // 9. Filter candidates using unified V2 Condition System
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
    static checkCondition(engine: GameEngine, cond: string, context?: { action?: string }): boolean {
        void engine;
        void context;
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

        if (typeof effect.EXP === 'number') {
            const expGain = Math.max(0, Math.floor(effect.EXP));
            if (expGain > 0) {
                const applied = Math.min(engine.state.maxExp, engine.state.exp + expGain) - engine.state.exp;
                if (applied > 0) {
                    engine.state.exp += applied;
                    changes.push(`修为 +${applied}`);
                }
            }
        }

        if (engine.state.battleStats && typeof effect.HP === 'number') {
            engine.state.battleStats.HP = Math.max(0, Math.min(
                engine.state.battleStats.MAX_HP,
                (engine.state.battleStats.HP || 0) + effect.HP,
            ));
            changes.push(`生命 ${effect.HP > 0 ? '+' : ''}${effect.HP}`);
        }

        if (engine.state.battleStats && typeof effect.MP === 'number') {
            engine.state.battleStats.MP = Math.max(0, Math.min(
                engine.state.battleStats.MAX_MP,
                (engine.state.battleStats.MP || 0) + effect.MP,
            ));
            changes.push(`法力 ${effect.MP > 0 ? '+' : ''}${effect.MP}`);
        }

        // Stats (Generic & Specific)
        for (const k in effect) {
            if (['flags', 'history', 'stats', 'per_turn', 'items', 'item', 'random_stats', 'random_items', 'EXP', 'HP', 'MP'].includes(k)) continue;

            if (typeof effect[k] === 'number') {
                const val = effect[k] as number;
                engine.state.attributes[k] = (engine.state.attributes[k] || 0) + val;
                const statName = TEXT_CONSTANTS.STATS[k as keyof typeof TEXT_CONSTANTS.STATS] || k;
                changes.push(`${statName} ${val > 0 ? '+' : ''}${val}`);
            }
        }

        // Random Stats
        if (effect.random_stats && effect.random_stats.pool.length > 0) {
            const { pool, totalAmount } = effect.random_stats;
            const increments: Record<string, number> = {};
            for (let i = 0; i < totalAmount; i++) {
                const stat = pool[Math.floor(Math.random() * pool.length)];
                increments[stat] = (increments[stat] || 0) + 1;
            }
            for (const [stat, amt] of Object.entries(increments)) {
                engine.state.attributes[stat] = (engine.state.attributes[stat] || 0) + amt;
                const statName = TEXT_CONSTANTS.STATS[stat as keyof typeof TEXT_CONSTANTS.STATS] || stat;
                changes.push(`${statName} +${amt}`);
            }
        }

        // Random Items
        if (effect.random_items && effect.random_items.pool.length > 0) {
            const { pool, totalCount } = effect.random_items;
            const itemCounts: Record<string, number> = {};
            for (let i = 0; i < totalCount; i++) {
                const item = pool[Math.floor(Math.random() * pool.length)];
                itemCounts[item] = (itemCounts[item] || 0) + 1;
            }
            for (const [item, count] of Object.entries(itemCounts)) {
                engine.addItem(item, count);
                const itemName = ITEMS[item]?.name || item;
                changes.push(`获得 ${itemName} x${count}`);
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
