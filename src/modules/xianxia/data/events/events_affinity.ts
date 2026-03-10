import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';
import type { WorldNPC } from '../../../../types/worldTypes';
import { REALMS } from '../../../../types';

/**
 * 动态根据好感度/仇恨度生成特殊交互羁绊事件
 */
export function checkAffinityEvents(engine: GameEngine): GameEvent | null {
    const npcs = engine.state.world.worldNPCs;
    const currentLocationId = engine.state.location;

    // 获取当前同一地点的所有活着的 NPC
    const localNPCs = npcs.filter(npc => npc.currentLocationId === currentLocationId && npc.alive);

    // 随机打乱以增加变数
    const shuffled = [...localNPCs].sort(() => Math.random() - 0.5);

    for (const npc of shuffled) {
        const affinity = npc.affinity || 0;

        // 门槛 1：死仇寻仇 (仇恨度 <= -50)
        if (affinity <= -50 && Math.random() < 0.2) {
            return generateRevengeEvent(engine, npc);
        }

        // 门槛 2：道侣送暖/双修 (好感度 >= 80)
        if (affinity >= 80 && Math.random() < 0.2) {
            return generatePartnerEvent(engine, npc);
        }

        // 门槛 3：好友同行/切磋 (好感度 >= 30)
        if (affinity >= 30 && affinity < 80 && Math.random() < 0.1) {
            return generateFriendEvent(engine, npc);
        }
    }

    return null;
}

function generateRevengeEvent(_engine: GameEngine, npc: WorldNPC): GameEvent {
    const realmName = REALMS[npc.realmIndex] || '未知境界';
    return {
        id: `EVT_AFFINITY_REVENGE_${Date.now()}`,
        title: '仇家寻仇',
        content: `你正在赶路，突然一股凌厉的杀气锁定你。定睛一看，竟是你的死仇——【${realmName}】修仙者【${npc.name}】！\n「小贼，今日就是你的死期！」`,
        choices: [
            {
                text: '拼死一战 (触发战斗)',
                // 这里简化工序：若玩家战力远低于对手则大概率重伤
                effect: { history: `你与${npc.name}大战了数百回合。`, HP: -50 }
            },
            {
                text: '交出全部灵石求饶 (失去 500 灵石，屈辱苟活)',
                effect: { history: `你卑躬屈膝，交出了储物袋，${npc.name}冷笑一声离去。`, MOOD: -30 }
            },
            {
                text: '遁术逃走 (需要极高的身法，大概率受轻伤逃亡)',
                effect: { history: `你燃烧精血施展遁术，虽然逃出生天，但也受了伤。`, HP: -20, MP: -50 }
            }
        ],
        eventType: 'CRISIS'
    };
}

function generatePartnerEvent(_engine: GameEngine, npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_PARTNER_${Date.now()}`,
        title: '道侣之约',
        content: `你在打坐时，一道熟悉的传音符飞入手中。原来是【${npc.name}】外出游历归来，特地前来寻你论道双修，畅谈天地法则。`,
        choices: [
            {
                text: '欣然赴约，与其共参大道 (大幅增加修为与心情)',
                effect: { history: `你与${npc.name}双修数日，修为大进。`, EXP: 1000, MOOD: 50, DAO: 2 }
            },
            {
                text: '沉迷苦修，婉言谢绝',
                effect: { history: `你为了追求大道，狠心拒绝了${npc.name}的邀请。`, MOOD: -10 }
            }
        ],
        eventType: 'OPPORTUNITY'
    };
}

function generateFriendEvent(_engine: GameEngine, npc: WorldNPC): GameEvent {
    return {
        id: `EVT_AFFINITY_FRIEND_${Date.now()}`,
        title: '好友切磋',
        content: `你偶遇了好友【${npc.name}】。对方见你修为似有精进，一时技痒，提出想要切磋斗法一番印证所学。`,
        choices: [
            {
                text: '点到为止的切磋 (增加斗法经验)',
                effect: { history: `你与${npc.name}切磋得酣畅淋漓，各有顿悟。`, EXP: 300, MOOD: 10 }
            },
            {
                text: '赠送对方10块灵石作为盘缠 (提升好感)',
                effect: { history: `你慷慨解囊，${npc.name}深受感动，好感大增。` }
            },
            {
                text: '借故推辞',
                effect: { history: `你婉拒了${npc.name}的切磋请求。` }
            }
        ],
        eventType: 'RANDOM'
    };
}
