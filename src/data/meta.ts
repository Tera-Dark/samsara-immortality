export interface MetaUpgrade {
    id: string;
    name: string;
    desc: string;
    baseCost: number;
    costScale: number;
    maxLevel: number;
    effectDesc: (lvl: number) => string;
    statKey: string | null; // Corresponds to key in allocStats or null for special handling
}

export const META_UPGRADES: MetaUpgrade[] = [
    // --- 命运类 (Destiny) ---
    {
        id: 'meta_resets',
        name: '逆天改命',
        desc: '增加初始命格重置次数，让你能刷出更好的身世。',
        baseCost: 100,
        costScale: 100,
        maxLevel: 5,
        effectDesc: (lvl: number) => `额外重置: +${lvl} 次`,
        statKey: null
    },
    {
        id: 'meta_karma_boost',
        name: '天道赐福',
        desc: '永久增加轮回结算时获得的轮回点倍率。',
        baseCost: 500,
        costScale: 500,
        maxLevel: 5,
        effectDesc: (lvl: number) => `轮回点获取: +${lvl * 10}%`,
        statKey: null
    },
    {
        id: 'meta_talent_slot',
        name: '多重宿命',
        desc: '允许每一世携带更多的先天天赋。',
        baseCost: 1000,
        costScale: 2000,
        maxLevel: 2,
        effectDesc: (lvl: number) => `天赋槽位: +${lvl}`,
        statKey: null
    },
    // --- 财富/物资类 (Wealth) ---
    {
        id: 'meta_starting_money',
        name: '金玉满堂',
        desc: '投胎时自带伴生铜钱，赢在起跑线上。',
        baseCost: 50,
        costScale: 50,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始铜钱: +${lvl * 50}`,
        statKey: null
    },
    // --- 六维成长类 (Stats) ---
    {
        id: 'meta_str',
        name: '蛮皇血脉',
        desc: '强化神魂基底，转世后初始膂力提升。',
        baseCost: 50,
        costScale: 50,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始膂力: +${lvl}`,
        statKey: 'STR'
    },
    {
        id: 'meta_int',
        name: '道心通明',
        desc: '强化神魂基底，转世后初始悟性提升。',
        baseCost: 50,
        costScale: 50,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始悟性: +${lvl}`,
        statKey: 'INT'
    },
    {
        id: 'meta_chr',
        name: '谪仙降世',
        desc: '强化神魂基底，转世后初始魅力提升。',
        baseCost: 50,
        costScale: 50,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始魅力: +${lvl}`,
        statKey: 'CHR'
    },
    {
        id: 'meta_pot',
        name: '混沌道胎',
        desc: '强化神魂基底，转世后初始根骨提升。',
        baseCost: 50,
        costScale: 50,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始根骨: +${lvl}`,
        statKey: 'POT'
    },
    {
        id: 'meta_mnd',
        name: '太上忘情',
        desc: '强化神魂基底，转世后初始神识提升。',
        baseCost: 50,
        costScale: 50,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始神识: +${lvl}`,
        statKey: 'MND'
    },
    {
        id: 'meta_luck',
        name: '天眷之人',
        desc: '受大千世界天道偏爱，转世后初始气运提升。',
        baseCost: 100,
        costScale: 100,
        maxLevel: 10,
        effectDesc: (lvl: number) => `初始气运: +${lvl}`,
        statKey: 'LUCK'
    }
];
