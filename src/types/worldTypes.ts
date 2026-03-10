
// 1. World Configuration
export interface WorldConfig {
    seed: number;
    name: string;
    description?: string;
    startingEra: string; // e.g. 'CHAOS', 'RISE', 'DECLNE'
    regionCount: number;
    spiritDensityMultiplier: number;
    resourceRichnessMultiplier: number;
    sectCount: number; // Number of initial sects
    npcCount: number; // Number of major NPCs (legacy alias?)
    worldNPCCount: number; // Actual property used in generator
    evilFactionRatio: number; // 0-1
}

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
    seed: 0,
    name: '',
    startingEra: 'RISE',
    regionCount: 20,
    spiritDensityMultiplier: 1.0,
    resourceRichnessMultiplier: 1.0,
    sectCount: 10,
    npcCount: 50,
    worldNPCCount: 50,
    evilFactionRatio: 0.3
};

// 2. Core Entities
export interface WorldSnapshot {
    config: WorldConfig;
    name: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    era: any; // EraTemplate
    regions: Region[];
    sects: Sect[];
    worldNPCs: WorldNPC[];
    resourceNodes: ResourceNode[];
    worldMonth: number;
    globalLuck: number; // 0-100
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    activeWorldEvents: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pastWorldEvents: any[];
}

export interface Coordinate {
    x: number;
    y: number;
}

export interface Region {
    id: string;
    name: string;
    terrain: TerrainType;
    coord: Coordinate;
    description: string;
    spiritDensity: number;
    dangerLevel: number;
    recommendedRealm: number; // Index in REALMS
    locations: Location[];

    // Ownership/Influence
    controlledBy: string[]; // Sect IDs
    adjacentRegions: string[]; // Region IDs
}

/** 地点类型 */
export type LocationType =
    | 'CITY'         // 坊市/城镇
    | 'SECT_HQ'      // 宗门驻地
    | 'SECRET_REALM' // 秘境
    | 'WILDERNESS'   // 荒野
    | 'MINE'         // 矿脉
    | 'HERB_GARDEN'  // 灵药圃
    | 'SPIRIT_VEIN'  // 灵脉
    | 'RUINS'        // 遗迹
    | 'MARKET'       // 交易所
    | 'INN'          // 客栈 [NEW]
    | 'AUCTION_HOUSE'// 拍卖行 [NEW]
    | 'SECT';        // 宗门 (Generic)

export interface Location {
    id: string;
    name: string;
    type: LocationType;
    description: string;
    coord: Coordinate;
    level?: number;
    discovered?: boolean;
    resourceIds?: string[];
    // Specifics
    associatedSectId?: string;
    sectAffiliation?: string;
    resourceLevel?: number;
    regionId: string;
}

// 3. Sects
export type SectRank = 'SCATTERED' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'HOLY_LAND';
export type Alignment = 'RIGHTEOUS' | 'EVIL' | 'NEUTRAL';
export type Doctrine = string; // e.g. 'SWORD', 'ALCHEMY'

export interface Sect {
    id: string;
    name: string;
    rank: SectRank;
    alignment: Alignment;
    doctrine: Doctrine;
    description: string;

    // Structure
    headquarterRegionId?: string; // ID of region where HQ is
    headquarters?: Location;
    territoryRegionIds: string[]; // Controlled regions

    // Members
    leaderId?: string;
    elderIds: string[];
    discipleIds: string[];
    members: string[]; // All NPC IDs
    memberCount?: number;

    // Stats
    power: number;
    resources: number;
    relations: SectRelation[];
    focus: string; // Current strategic focus
    reputation?: number;
    treasury?: number;
    entryRealmRequirement?: number;
    traits?: string[];
}

export interface SectRelation {
    targetSectId: string;
    favorability: number; // -100 to 100
    type: 'ALLIANCE' | 'HOSTILE' | 'TRADE' | 'NEUTRAL' | 'WAR' | 'ALLY' | 'VASSAL';
}

// 4. NPCs (World Level)
export type SectPosition =
    | 'SECT_MASTER'
    | 'GRAND_ELDER'
    | 'ELDER'
    | 'INNER_DISCIPLE'
    | 'OUTER_DISCIPLE'
    | 'WANDERER'
    | 'LEADER' | 'DISCIPLE' | 'GUEST' | 'NONE'; // Legacy support if needed

export interface WorldNPC {
    id: string;
    name: string;
    title?: string;
    titles?: string[];
    realmIndex: number; // Realm Index
    sectId?: string | null;
    position: SectPosition;
    locationId?: string; // Where they are currently
    currentLocationId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    stats?: any; // Simplified stats for world simulation
    personality: string[];
    gender?: 'M' | 'F';
    age?: number;
    lifespan?: number;
    alive?: boolean;
    alignment?: Alignment;
    combatPower?: number;
    knownToPlayer?: boolean;
    playerFavor?: number; // Legacy
    affinity?: number; // -100 to 100 [NEW]
    relationships?: string[]; // [NEW] e.g. 'PARTNER', 'ENEMY'
}

// 5. Resources
export interface ResourceNode {
    id: string;
    name: string;
    type: string;
    regionId: string;
    richness?: number;
    remaining?: number;
    description?: string;
    level?: number;
    yield?: number;
    controlled?: boolean;
    controllerId?: string;
    depleted?: boolean;
}

// 6. Enums & Types
export type TerrainType = string; // 'MOUNTAIN', 'PLAINS', etc.
export type ResourceType = string;
