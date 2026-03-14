import type { CombatState } from '../types/combat';
import type { GameEngine } from '../engine/GameEngine';
import { ITEMS } from '../data/items';

interface RewardProfile {
    money: [number, number];
    exp: [number, number];
    itemDrops?: Array<{
        itemId: string;
        chance: number;
        min?: number;
        max?: number;
    }>;
}

const DEFAULT_REWARD: RewardProfile = {
    money: [3, 8],
    exp: [12, 24],
};

const REWARD_PROFILES: Record<string, RewardProfile> = {
    wild_boar: {
        money: [2, 5],
        exp: [8, 18],
        itemDrops: [{ itemId: 'iron', chance: 0.25 }],
    },
    cave_snake: {
        money: [3, 7],
        exp: [12, 24],
        itemDrops: [
            { itemId: 'spirit_herb', chance: 0.2 },
            { itemId: 'monster_core', chance: 0.15 },
        ],
    },
    grave_robber: {
        money: [6, 14],
        exp: [14, 28],
        itemDrops: [
            { itemId: 'spirit_shard', chance: 0.5, min: 1, max: 3 },
            { itemId: 'book_body_art', chance: 0.08 },
        ],
    },
    thug: {
        money: [4, 10],
        exp: [10, 20],
        itemDrops: [{ itemId: 'iron', chance: 0.2 }],
    },
    qi_cultivator_rogue: {
        money: [10, 24],
        exp: [35, 70],
        itemDrops: [
            { itemId: 'spirit_shard', chance: 0.65, min: 2, max: 5 },
            { itemId: 'qi_gathering_pill', chance: 0.18 },
        ],
    },
    demon_wolf: {
        money: [18, 36],
        exp: [55, 100],
        itemDrops: [
            { itemId: 'monster_core', chance: 0.7 },
            { itemId: 'spirit_herb', chance: 0.25 },
        ],
    },
    marsh_spirit: {
        money: [20, 42],
        exp: [60, 110],
        itemDrops: [
            { itemId: 'spirit_herb', chance: 0.55, min: 1, max: 2 },
            { itemId: 'talisman_armor', chance: 0.16 },
        ],
    },
    wandering_blade: {
        money: [24, 50],
        exp: [70, 125],
        itemDrops: [
            { itemId: 'iron_sword', chance: 0.3 },
            { itemId: 'book_sword_art', chance: 0.12 },
        ],
    },
    sect_disciple: {
        money: [30, 60],
        exp: [90, 160],
        itemDrops: [
            { itemId: 'monster_core', chance: 0.45 },
            { itemId: 'talisman_armor', chance: 0.25 },
            { itemId: 'book_sword_art', chance: 0.1 },
        ],
    },
    story_void_altar_guard: {
        money: [80, 140],
        exp: [260, 420],
        itemDrops: [
            { itemId: 'qi_gathering_pill', chance: 0.35, min: 1, max: 2 },
            { itemId: 'talisman_armor', chance: 0.24 },
        ],
    },
    story_black_tide_emissary: {
        money: [120, 200],
        exp: [360, 560],
        itemDrops: [
            { itemId: 'talisman_speed', chance: 0.28 },
            { itemId: 'spirit_shard', chance: 0.8, min: 4, max: 8 },
        ],
    },
    story_fallen_elder: {
        money: [160, 260],
        exp: [420, 680],
        itemDrops: [
            { itemId: 'monster_core', chance: 0.75, min: 1, max: 2 },
            { itemId: 'book_body_art', chance: 0.14 },
        ],
    },
    story_void_beast: {
        money: [260, 420],
        exp: [900, 1400],
        itemDrops: [
            { itemId: 'monster_core', chance: 0.9, min: 2, max: 3 },
            { itemId: 'talisman_armor', chance: 0.45, min: 1, max: 2 },
        ],
    },
    story_void_lord: {
        money: [520, 880],
        exp: [1800, 2600],
        itemDrops: [
            { itemId: 'talisman_speed', chance: 0.6, min: 1, max: 2 },
            { itemId: 'talisman_armor', chance: 0.6, min: 1, max: 2 },
            { itemId: 'century_ginseng', chance: 0.4, min: 1, max: 2 },
        ],
    },
    story_void_lord_true: {
        money: [680, 1080],
        exp: [2200, 3200],
        itemDrops: [
            { itemId: 'pure_spirit_stone', chance: 0.8, min: 2, max: 3 },
            { itemId: 'major_heal_pill', chance: 0.5, min: 1, max: 2 },
            { itemId: 'purple_cloud_fruit', chance: 0.45, min: 1, max: 2 },
            { itemId: 'voidbreaker_blade', chance: 0.18 },
            { itemId: 'dawnfire_robe', chance: 0.18 },
            { itemId: 'mirror_of_returning_dawn', chance: 0.18 },
        ],
    },
    void_reaver: {
        money: [180, 320],
        exp: [520, 820],
        itemDrops: [
            { itemId: 'beast_blood', chance: 0.55, min: 1, max: 2 },
            { itemId: 'pure_spirit_stone', chance: 0.2 },
        ],
    },
    starfall_remnant: {
        money: [260, 440],
        exp: [820, 1260],
        itemDrops: [
            { itemId: 'ice_lotus', chance: 0.38, min: 1, max: 2 },
            { itemId: 'pure_spirit_stone', chance: 0.35, min: 1, max: 2 },
            { itemId: 'book_phantom_step', chance: 0.14 },
        ],
    },
    black_tide_overseer: {
        money: [420, 720],
        exp: [1400, 2100],
        itemDrops: [
            { itemId: 'pure_spirit_stone', chance: 0.5, min: 1, max: 2 },
            { itemId: 'beast_blood', chance: 0.6, min: 2, max: 3 },
            { itemId: 'major_heal_pill', chance: 0.25 },
        ],
    },
};

const randomInRange = ([min, max]: [number, number]) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

export function resolveCombatRewards(engine: GameEngine, combat: CombatState): string[] {
    if (combat.status !== 'VICTORY' || combat.type === 'TRIBULATION' || combat.type === 'SPARRING') {
        return [];
    }

    const enemyId = combat.enemy.id;
    const profile = REWARD_PROFILES[enemyId] || DEFAULT_REWARD;
    const luck = engine.state.attributes.LUCK || 0;
    const dropBonus = Math.min(0.2, luck * 0.005);
    const rewardLines: string[] = [];

    const money = randomInRange(profile.money);
    if (money > 0) {
        engine.earnMoney(money);
        rewardLines.push(`灵石 +${money}`);
    }

    const expGain = Math.min(engine.state.maxExp, engine.state.exp + randomInRange(profile.exp)) - engine.state.exp;
    if (expGain > 0) {
        engine.state.exp += expGain;
        rewardLines.push(`修为 +${expGain}`);
    }

    for (const drop of profile.itemDrops || []) {
        if (Math.random() < drop.chance + dropBonus) {
            const count = randomInRange([drop.min || 1, drop.max || drop.min || 1]);
            engine.addItem(drop.itemId, count);
            rewardLines.push(`获得 ${ITEMS[drop.itemId]?.name || drop.itemId} x${count}`);
        }
    }

    if (rewardLines.length > 0) {
        engine.state.history.push(`${engine.getTimeStr()}【战利】击败${combat.enemy.name}：${rewardLines.join('，')}`);
    }

    return rewardLines;
}
