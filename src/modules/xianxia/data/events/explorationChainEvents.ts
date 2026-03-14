import type { GameEngine } from '../../../../engine/GameEngine';
import type { GameEvent } from '../../../../types';

const MAP_STAGE_1 = 'ARC_MAP_STAGE_1_DONE';
const MAP_STAGE_2 = 'ARC_MAP_STAGE_2_DONE';
const MAP_STAGE_3 = 'ARC_MAP_STAGE_3_DONE';

export function checkExplorationChainEvents(engine: GameEngine, context?: { action?: string }): GameEvent | null {
    const action = context?.action || '';
    if (!['EXPLORE', 'WORK', 'INTERACT'].includes(action)) return null;

    if (!engine.state.flags.includes(MAP_STAGE_1) && engine.state.age >= 12 && Math.random() < 0.12) {
        return {
            id: 'EVT_CHAIN_MAP_STAGE1',
            title: '残图一角',
            content: '你在旧书页、包货油纸和坊市传闻之间，拼出了一张来历不明的残图。图上标记杂乱，却像是指向某处被遗忘的旧修士落脚点。',
            choices: [
                {
                    text: '把线索细细收好',
                    effect: {
                        flags: [MAP_STAGE_1],
                        INT: 1,
                        items: ['spirit_shard'],
                        history: '你把零碎线索都誊抄下来，准备日后一点点对照查证。',
                    },
                },
                {
                    text: '先按着图上方位去试探',
                    effect: {
                        flags: [MAP_STAGE_1],
                        WIL: 1,
                        MONEY: 6,
                        history: '你按残图大概方位走了一圈，虽然没找到终点，却先摸清了沿路几个可落脚的地方。',
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (engine.state.flags.includes(MAP_STAGE_1) && !engine.state.flags.includes(MAP_STAGE_2) && action === 'EXPLORE' && Math.random() < 0.18) {
        return {
            id: 'EVT_CHAIN_MAP_STAGE2',
            title: '旧碑对照',
            content: '你在荒路旁发现半截风化石碑，碑上的刻痕竟与残图边缘吻合。原来那张图记的不是藏宝之地，而是一串旧时代落脚点。',
            choices: [
                {
                    text: '沿石碑方向继续补图',
                    effect: {
                        flags: [MAP_STAGE_2],
                        DAO: 1,
                        INT: 1,
                        items: ['book_body_art'],
                        history: '你顺着石碑方向继续查找，把残图补完整了一大片，还顺手拾到一卷旧拳谱。',
                    },
                },
                {
                    text: '记下位置，先回坊市打听',
                    effect: {
                        flags: [MAP_STAGE_2],
                        CHR: 1,
                        REP: 1,
                        MONEY: 10,
                        history: '你没有贸然深入，而是带着新线索回坊市打听，意外换到了不少有用消息。',
                    },
                },
            ],
            eventType: 'OPPORTUNITY',
        };
    }

    if (engine.state.flags.includes(MAP_STAGE_2) && !engine.state.flags.includes(MAP_STAGE_3) && engine.state.realm_idx >= 1 && action === 'EXPLORE' && Math.random() < 0.16) {
        return {
            id: 'EVT_CHAIN_MAP_STAGE3',
            title: '旧修落脚处',
            content: '你终于按着残图补完的路线，找到一处不起眼的山壁夹缝。里面没有惊天秘宝，只有一名旧散修留下的修行笔记、器物和一段很长的独行岁月。',
            choices: [
                {
                    text: '细读笔记，收下有用旧物',
                    effect: {
                        flags: [MAP_STAGE_3],
                        items: ['book_fire_art', 'talisman_speed', 'jade_ring'],
                        EXP: 70,
                        DAO: 2,
                        history: '你在狭小石室里坐了许久，读完那名旧散修留下的修行笔记，也带走了几件真正用得上的旧物。',
                    },
                },
                {
                    text: '只誊抄心得，不多取物',
                    effect: {
                        flags: [MAP_STAGE_3],
                        INT: 2,
                        WIL: 1,
                        EXP: 55,
                        history: '你没有把石室搜刮一空，只把最关键的心得誊抄下来，觉得自己似乎更理解散修为什么总爱四处行走了。',
                    },
                },
            ],
            eventType: 'MAIN',
        };
    }

    return null;
}
