import type { Talent } from '../types';

export const TALENTS: Talent[] = [
    {
        id: "TALENT_NORMAL_STR",
        name: "天生神力",
        grade: 1,
        description: "体质+3",
        effect: { STR: 3 }
    },
    {
        id: "TALENT_RARE_ROOT",
        name: "天灵根",
        grade: 2,
        description: "潜力+5，悟性+2",
        effect: { POT: 5, INT: 2 }
    },
    {
        id: "TALENT_EPIC_SYS",
        name: "残缺的系统",
        grade: 3,
        description: "每回合全属性+1",
        effect: { per_turn: { ALL: 1 } }
    },
    {
        id: "TALENT_LEGEND_REBIRTH",
        name: "【仙帝重生】",
        grade: 4,
        description: "初始全属性+20，必定触发'觉醒记忆'事件",
        effect: { ALL: 20, flags: ["FLAG_REBIRTH"] }
    }
];
