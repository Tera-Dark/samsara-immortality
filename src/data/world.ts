export interface WorldEntity {
    id: string;
    name: string;
    type: 'SECT' | 'NATION' | 'LOCATION';
    desc: string;
    traits: string[];
}

export const SECTS: WorldEntity[] = [
    {
        id: 'KUNLUN',
        name: '昆仑虚',
        type: 'SECT',
        desc: '万法之源，正道执牛耳者。位于极西之地，常年积雪，只有身具大气运者方可寻得山门。',
        traits: ['剑修', '正道', '隐世']
    },
    {
        id: 'BLOOD_SEA',
        name: '血海魔门',
        type: 'SECT',
        desc: '以杀证道，门徒行事乖张狠辣。位于无尽血海深处，修仙界人人得而诛之。',
        traits: ['魔修', '杀伐', '掠夺']
    },
    {
        id: 'ALCHEMY_TOWER',
        name: '丹塔',
        type: 'SECT',
        desc: '中立势力，垄断了天下八成的丹药供给。不问世事，只求丹道极致。',
        traits: ['炼丹', '中立', '富可敌国']
    }
];

export const NATIONS: WorldEntity[] = [
    {
        id: 'GREAT_ZHOU',
        name: '大周皇朝',
        type: 'NATION',
        desc: '凡尘界最强盛的皇朝，疆域辽阔。皇室传言有龙族血脉，受国运庇护，万邪不侵。',
        traits: ['凡人', '皇权', '国运']
    },
    {
        id: 'BEAST_MTS',
        name: '十万大山',
        type: 'NATION',
        desc: '妖兽横行之地，人族禁区。深处有化形大妖占山为王，自成一国。',
        traits: ['妖族', '蛮荒', '禁地']
    }
];
