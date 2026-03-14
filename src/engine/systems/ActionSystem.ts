import { GameEngine } from '../GameEngine';

import type { GameEvent } from '../../types';
import type { CombatEntity, CombatState } from '../../types/combat';
import { ConditionMatcher } from '../../utils/ConditionMatcher';
import { applyActionBondSupport } from '../../utils/socialUtils';
import { CHILDHOOD_EVENTS } from '../../modules/xianxia/data/childhoodEvents';

export type ActionType = 'WORK' | 'CULTIVATE' | 'EXPLORE' | 'GROW' | 'STUDY_LIT' | 'REFINE_ALCHEMY';

export interface ActionResult {
    success: boolean;
    cost: number;
    log: string;
    event?: GameEvent | null;
    message?: string;
    combat?: { enemy: Partial<CombatEntity>, type: CombatState['type'] };
    alchemyRecipeId?: string;
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

        switch (action) {
            case 'GROW': {
                daysCost = 90;

                const validEvents = CHILDHOOD_EVENTS.filter(e => {
                    if (e.conditions && Array.isArray(e.conditions)) {
                        return ConditionMatcher.checkConditions(this.engine.state, e.conditions);
                    }
                    return true;
                });

                if (validEvents.length > 0) {
                    chosenEvent = validEvents[Math.floor(Math.random() * validEvents.length)];
                } else {
                    const flavorTexts = [
                        '春去秋来，又是一季。',
                        '你看着窗外飞鸟，不知在想些什么。',
                        '个子长高了一些，衣服也短了一截。',
                        '你在田野间奔跑，度过了一段无忧无虑的时光。',
                        '你听村里的老人讲起旧年故事。',
                        '你帮家里做了些力所能及的小事。',
                        '你对着水缸里的倒影发了会儿呆。',
                        '你睡了很长的一觉，醒来觉得精神饱满。',
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
                const studyOutcomes = [
                    { stat: 'INT', amount: 1, text: '你在字句间捕捉到前人的思路，心神愈发通透。', label: '悟性' },
                    { stat: 'CHR', amount: 1, text: '你反复揣摩辞章声律，谈吐与气质都沉稳了几分。', label: '魅力' },
                    { stat: 'WIL', amount: 1, text: '长久静坐读书让你心绪渐定，意志更坚。', label: '意志' },
                ];
                const outcome = studyOutcomes[Math.floor(Math.random() * studyOutcomes.length)];
                let changeLog = '';

                if (this.engine.state.attributes[outcome.stat] !== undefined) {
                    this.engine.state.attributes[outcome.stat] += outcome.amount;
                    changeLog = `\n${outcome.label} +${outcome.amount}`;
                }

                if (Math.random() < 0.25) {
                    this.engine.state.attributes.REP = (this.engine.state.attributes.REP || 0) + 1;
                    changeLog += '\n声望 +1';
                }

                logPrefix = `【习文】${outcome.text}${changeLog}`;
                break;
            }

            case 'WORK': {
                daysCost = 30;
                const baseIncome = this.engine.state.age >= 12 ? 3 : 2;
                this.engine.state.attributes.MONEY = (this.engine.state.attributes.MONEY || 0) + baseIncome;

                const sideFindRoll = Math.random();
                let bonusLog = '';
                if (sideFindRoll < 0.18) {
                    this.engine.addItem('iron', 1);
                    bonusLog = '\n获得 玄铁 x1';
                } else if (sideFindRoll < 0.3) {
                    this.engine.addItem('spirit_shard', 2);
                    bonusLog = '\n获得 灵石碎片 x2';
                } else if (sideFindRoll < 0.38) {
                    this.engine.state.attributes.REP = (this.engine.state.attributes.REP || 0) + 1;
                    bonusLog = '\n声望 +1';
                }

                logPrefix = `【生计】你忙碌了整整一月，总算换回一些实在收入。\n灵石 +${baseIncome}${bonusLog}`;
                break;
            }

            case 'CULTIVATE': {
                const hasMethod = this.engine.state.flags.includes('HAS_CULTIVATION_METHOD');
                if (!hasMethod) {
                    return {
                        success: false,
                        cost: 0,
                        log: '【未得法门】你尚未掌握吐纳修行之法，强行打坐只会徒耗心神。多去探索、读书或与人接触，也许会先找到那扇门。',
                    };
                }

                const int = this.engine.state.attributes.INT || 10;
                const con = this.engine.state.attributes.CON || 10;
                const rootSpeed = this.engine.state.cultivationSpeedMultiplier || 1.0;
                const realmIdx = this.engine.state.realm_idx || 0;
                const realmBonus = 1 + Math.max(0, realmIdx - 1) * 0.14;
                const gainCult = Math.floor((((int + con) * 0.5) + 10 + realmIdx * 6) * rootSpeed * realmBonus);
                this.engine.state.exp = (this.engine.state.exp || 0) + gainCult;

                if (this.engine.state.realm_idx === 0) {
                    logPrefix = `【问道】你依照法门调匀呼吸，尝试感应天地灵气。\n修为 +${gainCult}`;
                } else {
                    logPrefix = `【修炼】你运转功法吐纳灵气，修为稳步精进。\n修为 +${gainCult}`;
                }
                daysCost = 30;
                break;
            }

            case 'EXPLORE': {
                daysCost = 15;
                const mortalExploreRewards = [
                    { itemId: 'spirit_herb', count: 1, text: '你在山路边采到一株沾着露气的灵草。' },
                    { itemId: 'iron', count: 1, text: '你在废弃矿坑边捡到一块还能用的玄铁。' },
                    { itemId: 'spirit_shard', count: 3, text: '你在乱石缝里翻出几枚残缺灵石碎片。' },
                ];

                if ((this.engine.state.realm_idx || 0) === 0 && Math.random() < 0.55) {
                    const reward = mortalExploreRewards[Math.floor(Math.random() * mortalExploreRewards.length)];
                    this.engine.addItem(reward.itemId, reward.count);
                    const rewardText = reward.itemId === 'spirit_herb'
                        ? '灵草 x1'
                        : reward.itemId === 'iron'
                            ? '玄铁 x1'
                            : '灵石碎片 x3';
                    logPrefix = `【游历】${reward.text}\n获得 ${rewardText}`;
                } else {
                    const realmIdx = this.engine.state.realm_idx || 0;
                    if (realmIdx >= 3 && Math.random() < 0.45) {
                        const expGain = 28 + realmIdx * 16;
                        this.engine.state.exp = Math.min(this.engine.state.maxExp, this.engine.state.exp + expGain);
                        logPrefix = `【游历】你在历练途中与乱局交锋，对天地气机与自身所学都有了更深体会。\n修为 +${expGain}`;
                        break;
                    }
                    const gains = [
                        { stat: 'SPD', amount: 1, text: '翻山越岭让你的脚程更轻快。', label: '身法' },
                        { stat: 'WIL', amount: 1, text: '独自赶路让你的胆气与意志都强了几分。', label: '意志' },
                        { stat: 'LUCK', amount: 1, text: '一路有惊无险，你隐约觉得运气正慢慢站到你这边。', label: '气运' },
                    ];
                    const gain = gains[Math.floor(Math.random() * gains.length)];
                    this.engine.state.attributes[gain.stat] = (this.engine.state.attributes[gain.stat] || 0) + gain.amount;
                    logPrefix = `【游历】${gain.text}\n${gain.label} +${gain.amount}`;
                }
                break;
            }

            case 'REFINE_ALCHEMY': {
                if (!this.engine.state.flags.includes('HAS_ALCHEMY') && (this.engine.state.realm_idx || 0) >= 1) {
                    this.engine.state.flags.push('HAS_ALCHEMY');
                    this.engine.state.history.push(`${this.engine.getTimeStr()} 你对药草与灵材的理解终于迈过门槛，可以尝试炼丹了。`);
                }
                if (!this.engine.state.flags.includes('HAS_ALCHEMY')) {
                    return { success: false, cost: 0, log: '【炼丹】你尚未入道，无法炼丹。至少要踏入炼气期。' };
                }

                daysCost = 15;
                logPrefix = '【炼丹】你在丹炉前静心坐定，细细调火，准备开炉。';
                break;
            }
        }

        const result = this.engine.advanceTime(0, { action }, daysCost);

        let finalLog = logPrefix;
        const support = applyActionBondSupport(this.engine, action);
        if (support) {
            finalLog = finalLog ? `${finalLog}\n${support.message}` : support.message;
        }

        if (result.event) {
            this.engine.processEvent(result.event);
        } else if (chosenEvent) {
            this.engine.processEvent(chosenEvent);
        } else if (!result.message && finalLog) {
            const timeStr = this.engine.getTimeStr();
            finalLog = `${timeStr} ${finalLog}`;
            this.engine.state.history.push(finalLog);
        }

        return {
            success: true,
            cost: daysCost / 30,
            log: finalLog,
            event: result.event || null,
            message: result.message,
            combat: result.combat,
        };
    }
}
