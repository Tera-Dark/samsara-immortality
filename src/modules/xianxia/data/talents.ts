
import type { Talent } from '../../../types';

export const TALENTS: Talent[] = [
    // --- Grade 1: Common (White) 55% ---
    { id: "TAL_W_STR", name: "力气大", grade: 1, description: "体魄+1", modifiers: [{ trigger: 'PASSIVE', stats: { STR: 1 } }] },
    { id: "TAL_W_INT", name: "机灵", grade: 1, description: "悟性+1", modifiers: [{ trigger: 'PASSIVE', stats: { INT: 1 } }] },
    { id: "TAL_W_CHR", name: "样貌端正", grade: 1, description: "魅力+1", modifiers: [{ trigger: 'PASSIVE', stats: { CHR: 1 } }] },
    { id: "TAL_W_LUCK", name: "运气不错", grade: 1, description: "气运+1", modifiers: [{ trigger: 'PASSIVE', stats: { LUCK: 1 } }] },
    { id: "TAL_W_SPD", name: "手脚麻利", grade: 1, description: "身法+1", modifiers: [{ trigger: 'PASSIVE', stats: { SPD: 1 } }] },
    { id: "TAL_W_HP", name: "身体健康", grade: 1, description: "气血+10", modifiers: [{ trigger: 'PASSIVE', battle: { MAX_HP: 10 } }] },
    { id: "TAL_W_EAT", name: "胃口好", grade: 1, description: "自幼饭量大，体魄+0.5", modifiers: [{ trigger: 'PASSIVE', stats: { STR: 0.5 } }] },
    { id: "TAL_W_SLEEP", name: "嗜睡", grade: 1, description: "爱睡觉，梦中偶尔增长悟性", modifiers: [{ trigger: 'TURN_END', stats: { INT: 0.1 }, probability: 0.1 }] },
    { id: "TAL_W_RUN", name: "跑得快", grade: 1, description: "从小就能跑赢狗", modifiers: [{ trigger: 'PASSIVE', stats: { SPD: 1 } }] },
    { id: "TAL_W_BOOK", name: "喜读书", grade: 1, description: "喜欢看书，悟性+1", modifiers: [{ trigger: 'PASSIVE', stats: { INT: 1 } }] },
    { id: "TAL_W_MEDITATE", name: "静心", grade: 1, description: "性格安静，略微提升修炼效率，资质+0.5", modifiers: [{ trigger: 'PASSIVE', stats: { POT: 0.5 } }] },

    // --- Grade 2: Uncommon (Green) 30% ---
    { id: "TAL_G_STR", name: "天生神力", grade: 2, description: "体魄+3", modifiers: [{ trigger: 'PASSIVE', stats: { STR: 3 } }] },
    { id: "TAL_G_INT", name: "过目不忘", grade: 2, description: "悟性+3", modifiers: [{ trigger: 'PASSIVE', stats: { INT: 3 } }] },
    { id: "TAL_G_CHR", name: "一表人才", grade: 2, description: "魅力+3，更容易获得好感", modifiers: [{ trigger: 'PASSIVE', stats: { CHR: 3 } }] },
    { id: "TAL_G_ROOT", name: "四灵根", grade: 2, description: "拥有修仙资质，资质+2，修炼速度×1.5", modifiers: [{ trigger: 'PASSIVE', stats: { POT: 2 } }] },
    { id: "TAL_G_SWORD", name: "剑术天赋", grade: 2, description: "对剑道虽有感悟，身法+2", modifiers: [{ trigger: 'PASSIVE', stats: { SPD: 2 } }], effect: { flags: ['FLAG_SWORD_TALENT'] } },
    { id: "TAL_G_ALCHEMY", name: "丹道小成", grade: 2, description: "对草药敏感，悟性+1", modifiers: [{ trigger: 'PASSIVE', stats: { INT: 1 } }], effect: { flags: ['FLAG_ALCHEMY_TALENT'] } },
    { id: "TAL_G_RICH", name: "小康之家", grade: 2, description: "家境尚可，初始灵石+10", modifiers: [{ trigger: 'PASSIVE', resource: { SPIRIT_STONES: 10 } }] },
    { id: "TAL_G_HARD", name: "坚韧", grade: 2, description: "性格坚韧，意志认定后不易改变", modifiers: [{ trigger: 'PASSIVE', stats: { WIL: 3 } }] },
    { id: "TAL_G_SENSE", name: "灵气亲和", grade: 2, description: "天生对灵气敏感，资质+2，修炼速度间接提升", modifiers: [{ trigger: 'PASSIVE', stats: { POT: 2 } }] },
    { id: "TAL_G_BODY_TRAIN", name: "体术修行", grade: 2, description: "锻体有方，体魄+3，身法+2", modifiers: [{ trigger: 'PASSIVE', stats: { STR: 3, SPD: 2 } }] },

    // --- Grade 3: Rare (Blue) 10% ---
    { id: "TAL_B_ROOT", name: "双灵根", grade: 3, description: "上好的修仙苗子，资质+5，修炼速度×4.0", modifiers: [{ trigger: 'PASSIVE', stats: { POT: 5 } }] },
    { id: "TAL_B_SCHOLAR", name: "状元之才", grade: 3, description: "文曲星下凡，悟性+8", modifiers: [{ trigger: 'PASSIVE', stats: { INT: 8 } }] },
    { id: "TAL_B_SAFE", name: "福星高照", grade: 3, description: "一生平平安安，气运+5", modifiers: [{ trigger: 'PASSIVE', stats: { LUCK: 5 } }] },
    { id: "TAL_B_CHARM", name: "倾国倾城", grade: 3, description: "魅力极高，魅力+8", modifiers: [{ trigger: 'PASSIVE', stats: { CHR: 8 } }] },
    { id: "TAL_B_INSIGHT", name: "灵感敏锐", grade: 3, description: "修炼时偶尔灵光一闪，每回合资质+0.3", modifiers: [{ trigger: 'TURN_END', stats: { POT: 0.3 }, probability: 0.3 }] },
    { id: "TAL_B_MEDITATION", name: "冥想天赋", grade: 3, description: "入定极深，每回合悟性+0.5", modifiers: [{ trigger: 'TURN_END', stats: { INT: 0.5 } }] },

    // --- Grade 4: Epic (Purple) 5% ---
    { id: "TAL_P_ROOT", name: "天灵根", grade: 4, description: "单一属性天灵根，资质+10，悟性+3，修炼速度×6.0", modifiers: [{ trigger: 'PASSIVE', stats: { POT: 10, INT: 3 } }] },
    { id: "TAL_P_BODY", name: "先天道体", grade: 4, description: "天生亲近大道，全属性+3", modifiers: [{ trigger: 'PASSIVE', stats: { ALL: 3 } }] },
    { id: "TAL_P_SWORD", name: "天生剑心", grade: 4, description: "剑道至尊体质，身法+10，攻击力大幅提升", modifiers: [{ trigger: 'PASSIVE', stats: { SPD: 10 }, battle: { ATK: 20 } }] },
    { id: "TAL_P_EYE", name: "灵视之眼", grade: 4, description: "能看到常人看不见的东西，气运+8", modifiers: [{ trigger: 'PASSIVE', stats: { LUCK: 8 } }], effect: { flags: ['FLAG_SPIRIT_EYE'] } },
    { id: "TAL_P_ENLIGHTEN", name: "顿悟之资", grade: 4, description: "修炼中偶尔顿悟，每回合全属性+0.3", modifiers: [{ trigger: 'TURN_END', stats: { ALL: 0.3 }, probability: 0.2 }] },

    // --- Grade 5: Legendary (Orange) 1% ---
    { id: "TAL_O_SYS", name: "残缺的系统", grade: 5, description: "每回合全属性+0.5，并在关键时刻给予提示", modifiers: [{ trigger: 'TURN_END', stats: { ALL: 0.5 } }] },
    { id: "TAL_O_DRAGON", name: "真龙血脉", grade: 5, description: "上古真龙后裔，体魄+20，气血+500", modifiers: [{ trigger: 'PASSIVE', stats: { STR: 20 }, battle: { MAX_HP: 500 } }] },
    { id: "TAL_O_REBIRTH", name: "大能转世", grade: 5, description: "初始悟性+20，自带筑基期功法", modifiers: [{ trigger: 'PASSIVE', stats: { INT: 20 } }], effect: { flags: ['HAS_CULTIVATION_METHOD'] } },

    // --- Grade 6: Mythical (Red) 0.03% ---
    { id: "TAL_R_GOD", name: "位面之子", grade: 6, description: "此方世界的主角，气运+99，初始全属性+10", modifiers: [{ trigger: 'PASSIVE', stats: { LUCK: 99, ALL: 10 } }] },
    { id: "TAL_R_CHAOS", name: "混沌道体", grade: 6, description: "万法归一，修炼速度×10.0，全属性+20", modifiers: [{ trigger: 'PASSIVE', stats: { ALL: 20, POT: 20 } }] }
];

