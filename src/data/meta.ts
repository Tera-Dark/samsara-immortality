export interface MetaUpgrade {
    id: string;
    name: string;
    desc: string;
    baseCost: number;
    costScale: number;
    effectDesc: (lvl: number) => string;
    statKey: string | null; // Corresponds to key in allocStats or null for special handling
}

export const META_UPGRADES: MetaUpgrade[] = [
    {
        id: 'meta_resets',
        name: '逆天改命',
        desc: '增加初始命格重置次数',
        baseCost: 100,
        costScale: 100,
        effectDesc: (lvl: number) => `额外重置: +${lvl} 次`,
        statKey: null
    },
    {
        id: 'meta_str',
        name: '蛮皇血脉',
        desc: '增加初始膂力',
        baseCost: 50,
        costScale: 50,
        effectDesc: (lvl: number) => `初始膂力: +${lvl}`,
        statKey: 'STR'
    },
    {
        id: 'meta_int',
        name: '道心通明',
        desc: '增加初始悟性',
        baseCost: 50,
        costScale: 50,
        effectDesc: (lvl: number) => `初始悟性: +${lvl}`,
        statKey: 'INT'
    },
    {
        id: 'meta_chr',
        name: '谪仙降世',
        desc: '增加初始魅力',
        baseCost: 50,
        costScale: 50,
        effectDesc: (lvl: number) => `初始魅力: +${lvl}`,
        statKey: 'CHR'
    },
    {
        id: 'meta_pot',
        name: '混沌道胎',
        desc: '增加初始根骨',
        baseCost: 50,
        costScale: 50,
        effectDesc: (lvl: number) => `初始根骨: +${lvl}`,
        statKey: 'POT'
    },
    {
        id: 'meta_luck',
        name: '天眷之人',
        desc: '增加初始气运',
        baseCost: 100,
        costScale: 100,
        effectDesc: (lvl: number) => `初始气运: +${lvl}`,
        statKey: 'LUCK'
    }
];
