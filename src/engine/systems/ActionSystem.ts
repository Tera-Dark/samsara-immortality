import { GameEngine } from '../GameEngine';

import type { GameEvent } from '../../types';
import type { CombatEntity, CombatState } from '../../types/combat';
import { ConditionMatcher } from '../../utils/ConditionMatcher';
import { CHILDHOOD_EVENTS } from '../../modules/xianxia/data/childhoodEvents';


export type ActionType = 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT';

export interface ActionResult {
    success: boolean;
    cost: number;
    log: string;
    event?: GameEvent | null;
    message?: string; // e.g. Breakthrough message
    combat?: { enemy: Partial<CombatEntity>, type: CombatState['type'] };
}

export class ActionSystem {
    private engine: GameEngine;

    constructor(engine: GameEngine) {
        this.engine = engine;
    }

    public perform(action: ActionType): ActionResult {
        let daysCost = 0;
        let logPrefix = '';
        let chosenEvent: GameEvent | null = null;

        // 1. Calculate Results based on Action
        switch (action) {
            case 'GROW': {
                daysCost = 90; // 3 months

                // Filter Events using ConditionMatcher
                const validEvents = CHILDHOOD_EVENTS.filter(e => {
                    // Use ConditionMatcher if conditions array exists
                    if (e.conditions && Array.isArray(e.conditions)) {
                        return ConditionMatcher.checkConditions(this.engine.state, e.conditions);
                    }
                    return true;
                });

                if (validEvents.length > 0) {
                    chosenEvent = validEvents[Math.floor(Math.random() * validEvents.length)];
                    logPrefix = "";
                } else {
                    const flavorTexts = [
                        "春去秋来，又是一季。", "你看着窗外的飞鸟，不知在想些什么。",
                        "个子长高了一些，衣服变短了。", "在田野间奔跑，度过了无忧无虑的时光。",
                        "听村里的老人讲过去的故事。", "帮家里做了一些力所能及的小事。",
                        "对着水缸里的倒影发呆。", "睡了一整天，感觉精神饱满。"
                    ];
                    const randomFlavor = flavorTexts[Math.floor(Math.random() * flavorTexts.length)];

                    if (this.engine.state.attributes.STR !== undefined) {
                        this.engine.state.attributes.STR += 0.5;
                        logPrefix = `【成长】${randomFlavor}\n体魄 +0.5`;
                    } else {
                        logPrefix = `【成长】${randomFlavor}`;
                    }
                }
                break;
            }


            case 'STUDY_LIT': {
                daysCost = 10;
                const gainLit = Math.random() > 0.5 ? 'INT' : 'CHR';
                let changeLog = "";
                if (this.engine.state.attributes[gainLit] !== undefined) {
                    this.engine.state.attributes[gainLit] += 0.5;
                    const statName = gainLit === 'INT' ? '悟性' : '魅力';
                    changeLog = `\n${statName} +0.5`;
                }
                logPrefix = `【习文】研读经书，气质略有提升。${changeLog}`;
                break;
            }



            case 'WORK': {
                daysCost = 30; // 1 Month
                this.engine.state.attributes.MONEY = (this.engine.state.attributes.MONEY || 0) + 1;
                logPrefix = `【生活】平淡的一月过去了，赚取了少许灵石。\n灵石 +1`;
                break;
            }

            case 'CULTIVATE': {
                // 所有角色都有灵根，5岁后可感应灵气自动获得基础功法
                if (!this.engine.state.flags.includes('HAS_CULTIVATION_METHOD') && this.engine.state.age >= 5) {
                    this.engine.state.flags.push('HAS_CULTIVATION_METHOD');
                    this.engine.state.history.push(`${this.engine.getTimeStr()} 你在冥想中感应到了天地灵气，自行领悟了一套基础吐纳之法。`);
                }

                const hasMethod = this.engine.state.flags.includes('HAS_CULTIVATION_METHOD');
                if (!hasMethod) {
                    return { success: false, cost: 0, log: '【违和】你尚无修炼功法，无法纳气。等待灵气感应(**5岁后**)...' };
                }

                const int = this.engine.state.attributes.INT || 10;
                const con = this.engine.state.attributes.CON || 10;
                const rootSpeed = this.engine.state.cultivationSpeedMultiplier || 1.0;
                // Base gain: (INT + CON) * 0.5 + 10, × 灵根修炼倍率
                const gainCult = Math.floor(((int + con) * 0.5 + 10) * rootSpeed);
                this.engine.state.exp = (this.engine.state.exp || 0) + gainCult;

                if (this.engine.state.realm_idx === 0) {
                    logPrefix = `【问道】尝试感应天地灵气，修为略有精进...×${rootSpeed}倍速\n经验 +${gainCult}`;
                    daysCost = 30;
                } else {
                    logPrefix = `【修炼】吐纳天地灵气...×${rootSpeed}倍速\n经验 +${gainCult}`;
                    daysCost = 30;
                }
                break;
            }

            case 'EXPLORE': {
                daysCost = 15;
                logPrefix = '【游历】四处游历了一番...';
                break;
            }
        }

        // 2. Advance Time (pass 0 months, and daysCost)
        const result = this.engine.advanceTime(0, { action: action }, daysCost);

        let finalLog = logPrefix;

        // 3. Process Events (if any)
        if (result.event) {
            this.engine.processEvent(result.event);
        } else if (chosenEvent) {
            this.engine.processEvent(chosenEvent);
        } else {
            // Manual Logging if no event
            if (!result.message && finalLog) {
                const timeStr = this.engine.getTimeStr();
                finalLog = `${timeStr} ${logPrefix}`;
                this.engine.state.history.push(finalLog);
            }
        }

        return {
            success: true,
            cost: daysCost / 30, // Return approx months cost for UI if needed, or update interface
            log: finalLog,
            event: result.event || null,
            message: result.message,
            combat: result.combat
        };
    }
}
