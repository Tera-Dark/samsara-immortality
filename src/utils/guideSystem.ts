import type { PlayerState } from '../types';

export function getGuidance(state: PlayerState): { text: string; subtext?: string } {
    const age = Math.floor(state.months / 12);
    const hasMethod = state.flags.includes('HAS_CULTIVATION_METHOD');
    const isEndingCleared = state.flags.includes('STORY:VOID_LORD_SLAIN');
    const maxAttr = Math.max(0, ...Object.values(state.attributes || {}));

    if (isEndingCleared) {
        return {
            text: '黑潮已绝',
            subtext: '你已完成本轮终局。可继续在人间收尾、收集高阶战利品，或返回主菜单开启下一世。',
        };
    }

    if (age < 3) {
        return {
            text: '茁壮成长',
            subtext: '使用[成长]推进时间，等到 3 岁后会开启更多行动。',
        };
    }

    if (!hasMethod) {
        if (maxAttr < 10) {
            return {
                text: '打熬根骨',
                subtext: '通过[习文]、[劳作]或[历练]先把任意一项属性提上去，为后续仙缘做准备。',
            };
        }

        return {
            text: '寻法问道',
            subtext: '属性已够用，继续通过[历练]、事件遭遇和人物互动寻找真正的修行法门。',
        };
    }

    if (state.realm_idx === 0) {
        return {
            text: '感应灵气',
            subtext: '已得法门，持续使用[吐纳]尝试引气入体，正式踏上修行路。',
        };
    }

    if (state.realm_idx === 1) {
        return {
            text: '筹备筑基',
            subtext: '练气阶段优先积累修为、丹药与资源，想办法拿到筑基丹并准备冲关。',
        };
    }

    if (state.realm_idx === 2 && !state.flags.includes('STORY:BLACK_TIDE_OMEN')) {
        return {
            text: '黑潮前兆',
            subtext: '筑基之后多去[历练]、[互动]与地图探索，尽快触发黑潮主线，游戏的真正中期会从这里展开。',
        };
    }

    if (state.realm_idx === 3 && !state.flags.includes('STORY:ALLIANCE_PLEDGE')) {
        return {
            text: '站上前线',
            subtext: '金丹已成，继续探索并接触修行界势力，尽快加入曙光盟约，主线会明显加速。',
        };
    }

    if (state.realm_idx >= 4 && !state.flags.includes('STORY:VOID_ALTAR_BROKEN')) {
        return {
            text: '清理黑潮支点',
            subtext: '你已进入后期，优先推动祭坛、监军、裂口等主线事件，不要只停留在普通刷修为。',
        };
    }

    if (state.flags.includes('STORY:VOID_ALTAR_BROKEN') && !state.flags.includes('STORY:VOID_RIFT_SEALED')) {
        return {
            text: '准备封裂',
            subtext: '现在该兼顾修为与战备，多跑高阶遗迹、秘境和灵脉，把终局前的资源攒起来。',
        };
    }

    if (state.flags.includes('STORY:VOID_RIFT_SEALED') && !state.flags.includes('STORY:FINAL_MUSTER')) {
        return {
            text: '整军备战',
            subtext: '终局已近，继续触发后期世界事件，把斥候、补给、烽灯、战备这些回响尽量攒齐。',
        };
    }

    if (state.flags.includes('STORY:FINAL_MUSTER') && !state.flags.includes('STORY:VOID_LORD_SLAIN')) {
        return {
            text: '终局将至',
            subtext: '你已具备挑战古主的条件。若还想更稳，可继续刷高阶遗迹、秘境和后期强敌补毕业装备。',
        };
    }

    return {
        text: '修行未尽',
        subtext: '当前没有明显卡点，可以按自己的节奏修炼、探索、炼丹或收集毕业资源。',
    };
}
