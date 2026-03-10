export const SURNAMES = "李王张刘陈杨赵黄周吴徐孙胡朱高林何郭马罗梁宋郑谢韩唐冯于董萧程曹袁邓许傅沈曾彭吕苏卢蒋蔡贾丁魏薛叶阎余潘杜戴夏钟汪田任姜范方石姚谭廖邹熊金陆郝孔白崔康毛邱秦江史顾侯邵孟龙万段雷钱汤尹黎葛墨".split('');
export const MALE_NAMES = "伟刚勇毅俊峰强军平保东文辉力明永健世广志义兴良海山仁波宁贵福生龙元全国胜学祥才发武新利清飞彬富顺信子杰涛昌成康星光天达安岩中茂进林有坚和彪博诚先敬震振壮会思群豪心邦承乐绍功松善厚庆磊民友裕河哲江超浩亮政谦亨奇固之轮翰朗伯宏言若鸣朋斌梁栋维启克伦翔旭鹏泽晨辰士以建家致树炎德行时泰盛雄琛钧冠策腾楠榕风航弘".split('');
export const FEMALE_NAMES = "灵瑶碧青凝雪梦紫月幻香静柔婉兰竹菊梅若微音烟雨霜露冰云霞凤鸾莺蝶舞琴棋书画诗酒茶花仙神圣玄素雅慧巧美娜静淑惠珠翠雅芝玉萍红娥玲芬芳燕彩春菊兰凤洁梅琳素云莲真环雪荣爱妹霞香月莺媛艳瑞凡佳嘉琼勤珍贞莉桂娣叶璧璐娅琦晶妍茜秋珊莎锦黛青倩婷姣婉娴瑾颖露瑶怡婵雁蓓纨仪荷丹蓉眉君琴蕊薇菁梦岚苑婕馨瑗琰韵融园艺咏卿聪澜纯毓悦昭冰爽琬茗羽希宁欣飘育滢馥筠柔竹霭凝晓欢霄枫芸菲寒伊亚宜可姬舒影荔枝思丽".split('');

// Xianxia Enhanced Names
export const MALE_NAMES_XX = "玄天道法尊神圣灵虚空寂灭绝尘缘劫运命理气数阴阳五行八卦九宫乾坤坎离震兑巽艮元始通明真如自在无为有为太上忘情".split('');
export const FEMALE_NAMES_XX = "瑶池紫府玄女素娥霓裳羽衣广寒清虚灵宝道德太真元君仙姑神女圣母娘娘妃嫔媵嫱姊妹姑嫂婆媳孙甥".split('');

// Combine standard and enhanced for now, can be sophisticated later
export const MALE_POOL = [...MALE_NAMES, ...MALE_NAMES_XX];
export const FEMALE_POOL = [...FEMALE_NAMES, ...FEMALE_NAMES_XX];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepMerge<T>(target: any, source: any): T {
    if (source === undefined) return target;
    if (source === null) return null as unknown as T;
    if (typeof source !== 'object') return source;
    if (Array.isArray(source)) {
        return source as unknown as T; // Replace arrays entirely safely
    }

    // It's an object
    const output = { ...target };
    Object.keys(source).forEach(key => {
        if (source[key] === undefined) {
            // keep target
        } else if (source[key] === null) {
            output[key] = null;
        } else if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
            if (!(key in target) || target[key] === null || target[key] === undefined) {
                output[key] = source[key];
            } else {
                output[key] = deepMerge(target[key], source[key]);
            }
        } else {
            output[key] = source[key];
        }
    });
    return output as T;
}

export function generateName(gender: 'M' | 'F' = 'M'): string {
    const surname = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
    const namePool = gender === 'M' ? MALE_POOL : FEMALE_POOL;
    // 1 or 2 character given name
    const len = Math.random() > 0.3 ? 2 : 1;
    let givenName = "";
    for (let i = 0; i < len; i++) {
        givenName += namePool[Math.floor(Math.random() * namePool.length)];
    }
    return surname + givenName;
}

import type { BattleStats } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateNPC(relation: string, gender: 'M' | 'F'): any {
    const age = 20 + Math.floor(Math.random() * 30); // Parent age
    const lifespan = 60 + Math.floor(Math.random() * 40);

    // Random Stats
    const attributes: Record<string, number> = {
        STR: 10 + Math.floor(Math.random() * 20),
        MND: 10 + Math.floor(Math.random() * 20),
        INT: 10 + Math.floor(Math.random() * 20),
        CHR: 10 + Math.floor(Math.random() * 20),
        MNY: 10 + Math.floor(Math.random() * 20),
        POT: Math.floor(Math.random() * 30), // Was ROOT, now POT
        LUCK: Math.floor(Math.random() * 10),
        KARMA: 0
    };

    const battleStats = deriveBattleStats(attributes, 0); // Presume Mortal

    return {
        id: Math.random().toString(36).substr(2, 9),
        name: generateName(gender),
        gender,
        relation,
        desc: '普通凡人',
        intimacy: 50 + Math.floor(Math.random() * 30),
        age,
        lifespan,
        alive: true,
        realm: '凡人',
        attributes,
        battleStats
    };
}

export function deriveBattleStats(attributes: Record<string, number>, realmIdx: number): BattleStats {
    // 六维核心换算公式 (Six Dimensions Core)
    const realmBonus = realmIdx * 100;

    // Safely access attributes
    const STR = attributes.STR || 0; // 体魄: 影响血量、防御、物理攻击
    const MND = attributes.MND || 0; // 神识: 影响法力、身法、暴击率
    const INT = attributes.INT || 0; // 悟性: 影响修炼速度、突破概率
    const POT = attributes.POT || attributes.ROOT || 0; // 资质: 灵气亲和，增补部分法力和法术攻击
    const LUCK = attributes.LUCK || 0; // 气运: 影响极少数特殊概率补正

    // Base calculation
    const baseStats: BattleStats = {
        MAX_HP: Math.floor(STR * 20 + realmBonus * 10),
        MAX_MP: Math.floor(MND * 15 + POT * 5 + INT * 2 + realmBonus * 5),
        ATK: Math.floor(STR * 2 + POT * 2 + INT * 1 + realmBonus * 1),
        DEF: Math.floor(STR * 3 + realmBonus * 0.5),
        SPD: Math.floor(MND * 2 + LUCK * 0.5 + realmBonus * 0.2),
        CRIT: Math.floor(MND * 0.2 + LUCK * 0.1),
        MOVE_SPEED: Math.floor(20 + (MND * 0.5) + (STR * 0.2) + (realmIdx * 10)) // Base 20 + bonuses
    };
    return baseStats;
}

export function getSolarTerm(month: number, day: number): string {
    // 简化版二十四节气 (Based on Fixed 30 Days/Month)
    // Month is 0-11, Day is 1-30
    const terms = [
        ['小寒', '大寒'], // Month 0 (Jan?) - Actually in Lunar/Cultivation calendar usually starts Spring.
        // Let's align with Spring Start at Month 0 for "New Year"? 
        // Or standard Gregorian? 
        // Cultivation usually: Month 0 = Spring Start?
        // Let's stick to standard Chinese Calendar Approx:
        // Month 0 (1st Month): 立春 (Spring Begins), 雨水
        ['立春', '雨水'],
        ['惊蛰', '春分'],
        ['清明', '谷雨'],
        ['立夏', '小满'],
        ['芒种', '夏至'],
        ['小暑', '大暑'],
        ['立秋', '处暑'],
        ['白露', '秋分'],
        ['寒露', '霜降'],
        ['立冬', '小雪'],
        ['大雪', '冬至'],
        ['小寒', '大寒']
    ];

    // Simple split: 1-15 = First Term, 16-30 = Second Term
    const monthIdx = month % 12; // Ensure wrap
    const termIdx = day <= 15 ? 0 : 1;

    return terms[monthIdx][termIdx];
}
