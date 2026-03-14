/**
 * 世界生成器
 * 
 * 核心流程：seed → RNG → 分步生成 → WorldSnapshot
 * 
 * 生成顺序：
 * 1. 纪元
 * 2. 区域 (含地形、灵气、危险度)
 * 3. 宗门 (含道统、阵营、等级)
 * 4. 安置宗门到区域
 * 5. 世界NPC (宗主/长老/弟子/散修)
 * 6. 资源节点
 * 7. 宗门关系网络
 * 8. 区域邻接关系
 */

import type {
    WorldConfig, WorldSnapshot, Region, Location, Sect,
    WorldNPC, ResourceNode, SectRelation,
    TerrainType, Alignment, Doctrine, SectRank, SectPosition,
    Coordinate,
} from '../types/worldTypes';
import { DEFAULT_WORLD_CONFIG } from '../types/worldTypes';
import { SeededRandom } from '../utils/SeededRandom';
import { REALMS } from '../types';
import {
    SECT_NAME_PREFIX, SECT_NAME_SUFFIX,
    REGION_NAME_PREFIX, REGION_NAME_SUFFIX,
    TERRAIN_TEMPLATES, LOCATION_TEMPLATES,
    DOCTRINE_TEMPLATES, SECT_RANK_TEMPLATES,
    POSITION_TEMPLATES, RESOURCE_NAMES,
    NPC_TITLES, PERSONALITY_TAGS, ERA_TEMPLATES,
    LOCATION_DESCRIPTORS,
} from '../modules/xianxia/data/worldTemplates';
import { generateName } from '../utils/DataUtils';

// ─── 辅助名称池 ─── (用于地点名随机字)
const LOCATION_CHAR_POOL = '灵玄幽碧苍翠寒焰云雾星月龙凤瑶琼仙古太清紫金赤黑'.split('');

export class WorldGenerator {
    private rng: SeededRandom;
    private config: WorldConfig;
    private options: { silent: boolean };

    constructor(config?: Partial<WorldConfig>, options: { silent?: boolean } = {}) {
        this.config = { ...DEFAULT_WORLD_CONFIG, ...config };
        this.options = { silent: false, ...options };

        if (this.config.seed === 0) {
            this.config.seed = Math.floor(Math.random() * 0x7FFFFFFF);
        }
        this.rng = new SeededRandom(this.config.seed);

        // 如果未指定名称，随机生成一个
        if (!config?.name) {
            this.config.name = this.generateRandomWorldName();
        }
    }

    private generateRandomWorldName(): string {
        const prefix = this.rng.pick(['玄黄', '紫薇', '太虚', '万古', '神荒', '灵源', '九幽', '苍穹', '星罗', '混沌']);
        const suffix = this.rng.pick(['界', '大陆', '域', '天', '星', '神州']);
        return prefix + suffix;
    }

    /** 生成完整世界快照 */
    generate(): WorldSnapshot {
        if (!this.options.silent) {
            console.log(`[WorldGen] 种子: ${this.config.seed}, 开始生成世界「${this.config.name}」...`);
        }

        // 1. 纪元
        const era = this.generateEra();
        if (!this.options.silent) console.log(`[WorldGen] 纪元: ${era.name}`);

        // 2. 区域
        const regions = this.generateRegions();
        if (!this.options.silent) console.log(`[WorldGen] 区域: ${regions.length} 个`);

        // 3. 宗门
        const sects = this.generateSects();
        if (!this.options.silent) console.log(`[WorldGen] 宗门: ${sects.length} 个`);

        // 4. 安置宗门
        this.placeSects(regions, sects);

        // 5. 世界NPC
        const worldNPCs = this.generateWorldNPCs(sects, regions);
        if (!this.options.silent) console.log(`[WorldGen] 世界NPC: ${worldNPCs.length} 个`);

        // 6. 资源节点
        const resourceNodes = this.generateResourceNodes(regions);
        if (!this.options.silent) console.log(`[WorldGen] 资源节点: ${resourceNodes.length} 个`);

        // 7. 宗门关系
        this.establishRelations(sects);

        // 8. 区域邻接
        this.linkRegions(regions);

        // 9. 为宗门生成驻地地点
        this.generateSectHeadquarters(regions, sects);

        const snapshot: WorldSnapshot = {
            config: { ...this.config },
            name: this.config.name || '苍穹大陆',
            era,
            regions,
            sects,
            worldNPCs,
            resourceNodes,
            worldMonth: 0,
            globalLuck: 50,
            activeWorldEvents: [],
            pastWorldEvents: [],
        };

        if (!this.options.silent) {
            console.log(`[WorldGen] 世界「${snapshot.name}」生成完毕!`);
        }
        return snapshot;
    }

    // ═══════════════════════════════════════
    //  Step 1: 纪元
    // ═══════════════════════════════════════

    private generateEra() {
        const template = ERA_TEMPLATES.find(e => e.id === this.config.startingEra)
            || this.rng.pick(ERA_TEMPLATES);
        return { ...template };
    }

    // ═══════════════════════════════════════
    //  Step 2: 区域
    // ═══════════════════════════════════════

    private generateRegions(): Region[] {
        const regions: Region[] = [];
        const terrainWeights = TERRAIN_TEMPLATES.map(t => t.weight);
        const terrainTypes = TERRAIN_TEMPLATES.map(t => t);
        const usedNames = new Set<string>();

        // 布局参数
        const centerX = 50;
        const centerY = 50;
        const radius = 35; // 大陆半径

        for (let i = 0; i < this.config.regionCount; i++) {
            const template = this.rng.weightedPick(terrainTypes, terrainWeights);
            const name = this.generateRegionName(template.type, usedNames);
            usedNames.add(name);

            // 坐标生成：第一个区域在中心，其余环绕
            let coord: Coordinate;
            if (i === 0) {
                coord = { x: centerX, y: centerY };
            } else {
                const angle = ((i - 1) / (this.config.regionCount - 1)) * Math.PI * 2;
                // 添加随机扰动 (Jitter)
                const jitterX = this.rng.nextInt(-5, 5);
                const jitterY = this.rng.nextInt(-5, 5);
                coord = {
                    x: Math.round(centerX + Math.cos(angle) * radius + jitterX),
                    y: Math.round(centerY + Math.sin(angle) * radius + jitterY)
                };
            }

            const spiritVar = this.rng.nextFloat(-0.3, 0.3);
            const dangerVar = this.rng.nextInt(-2, 2);

            const region: Region = {
                id: this.rng.uid('reg'),
                name,
                terrain: template.type,
                coord,
                description: `${name}，${this.describeRegion(template.type)}`,
                spiritDensity: Math.max(0.1, +(template.baseSpiritDensity * this.config.spiritDensityMultiplier + spiritVar).toFixed(2)),
                dangerLevel: Math.max(1, Math.min(10, template.baseDangerLevel + dangerVar)),
                recommendedRealm: Math.min(REALMS.length - 1, Math.max(0, Math.floor((template.baseDangerLevel + dangerVar) / 2))),
                locations: [],
                controlledBy: [],
                adjacentRegions: [],
            };

            // 每个区域生成 2~5 个子地点
            const locCount = this.rng.nextInt(2, 5);
            for (let j = 0; j < locCount; j++) {
                // 地点坐标：在区域中心周围随机分布
                const locAngle = this.rng.next() * Math.PI * 2;
                const locRadius = this.rng.nextInt(3, 12); // 区域内半径
                const locCoord = {
                    x: Math.round(region.coord.x + Math.cos(locAngle) * locRadius),
                    y: Math.round(region.coord.y + Math.sin(locAngle) * locRadius)
                };

                // 边界检查 (0-100)
                locCoord.x = Math.max(2, Math.min(98, locCoord.x));
                locCoord.y = Math.max(2, Math.min(98, locCoord.y));

                const locTemplate = this.rng.weightedPick(
                    LOCATION_TEMPLATES,
                    LOCATION_TEMPLATES.map(t => t.weight)
                );
                const locName = this.generateLocationName(locTemplate.namePatterns);
                const loc: Location = {
                    id: this.rng.uid('loc'),
                    name: locName,
                    type: locTemplate.type,
                    coord: locCoord,
                    description: this.rng.pick(LOCATION_DESCRIPTORS[locTemplate.type] || ['未知之地']),
                    regionId: region.id,
                    level: Math.max(1, Math.min(10, region.dangerLevel + this.rng.nextInt(-1, 1))),
                    discovered: locTemplate.type === 'CITY', // 坊市默认已探索
                    resourceIds: [],
                };
                region.locations.push(loc);
            }

            regions.push(region);
        }

        return regions;
    }

    private generateRegionName(terrain: TerrainType, used: Set<string>): string {
        const suffixes = REGION_NAME_SUFFIX[terrain];
        let name: string;
        let attempts = 0;
        do {
            name = this.rng.pick(REGION_NAME_PREFIX) + this.rng.pick(suffixes);
            attempts++;
        } while (used.has(name) && attempts < 20);
        return name;
    }

    private generateLocationName(patterns: string[]): string {
        const pattern = this.rng.pick(patterns);
        const char = this.rng.pick(LOCATION_CHAR_POOL) + this.rng.pick(LOCATION_CHAR_POOL);
        return pattern.replace('{地名}', char);
    }

    private describeRegion(terrain: TerrainType): string {
        const descs: Record<TerrainType, string[]> = {
            MOUNTAIN: ['高耸入云的山脉，灵气充沛', '连绵不绝的群峰，常有修仙者出没'],
            PLAINS: ['一望无际的平原，适宜凡人生活', '沃野千里，灵气稀薄但物产丰富'],
            FOREST: ['古树参天的密林，暗藏菁英灵兽', '终年雾霭弥漫的神秘丛林'],
            DESERT: ['黄沙漫天的荒漠，寸草不生', '炽热干燥的沙海，偶有遗迹浮现'],
            SWAMP: ['瘴气弥漫的沼泽，毒虫横行', '幽暗阴冷的泽地，深处暗藏凶险'],
            OCEAN: ['浩瀚无垠的海域，深处有龙族遗迹', '波涛汹涌的灵海，岛屿星罗棋布'],
            VOLCANO: ['岩浆翻涌的火域，蕴含罕见灵矿', '终年喷发的火山群，危险至极'],
            SNOW: ['终年积雪的寒域，灵气凛冽纯净', '冰天雪地的极寒之境，常有寒属灵材'],
            ABYSS: ['暗无天日的深渊，魔气冲天', '连通冥界的虚空裂缝，凶险万分'],
        };
        return this.rng.pick(descs[terrain]);
    }

    // ═══════════════════════════════════════
    //  Step 3: 宗门
    // ═══════════════════════════════════════

    private generateSects(): Sect[] {
        const sects: Sect[] = [];
        const usedNames = new Set<string>();

        // 按配置比例分配正邪
        const evilCount = Math.round(this.config.sectCount * this.config.evilFactionRatio);
        const righteousCount = Math.round(this.config.sectCount * 0.4);
        const neutralCount = this.config.sectCount - evilCount - righteousCount;

        const alignments: Alignment[] = [
            ...Array(righteousCount).fill('RIGHTEOUS' as Alignment),
            ...Array(neutralCount).fill('NEUTRAL' as Alignment),
            ...Array(evilCount).fill('EVIL' as Alignment),
        ];
        this.rng.shuffle(alignments);

        for (let i = 0; i < this.config.sectCount; i++) {
            const alignment = alignments[i] || 'NEUTRAL';

            // 选择道统 (考虑阵营偏好)
            const doctrine = this.pickDoctrine(alignment);

            // 选择等级
            const rankTemplate = this.rng.weightedPick(
                SECT_RANK_TEMPLATES,
                SECT_RANK_TEMPLATES.map(t => t.weight)
            );

            // 生成名称
            const name = this.generateSectName(alignment, usedNames);
            usedNames.add(name);

            const power = this.rng.nextInt(rankTemplate.powerRange[0], rankTemplate.powerRange[1]);

            const sect: Sect = {
                id: this.rng.uid('sect'),
                name,
                rank: rankTemplate.rank,
                alignment,
                doctrine,
                description: this.generateSectDescription(name, doctrine, alignment, rankTemplate.rank),
                power,
                reputation: this.rng.nextInt(10, power),
                leaderId: '', // 由 NPC 生成步骤填充
                elderIds: [],
                discipleIds: [],
                members: [], // Added to satisfy TS
                resources: 0, // Changed from {} to 0 to satisfy TS
                focus: 'CULTIVATION', // Added to satisfy TS
                headquarterRegionId: '', // 由安置步骤填充
                territoryRegionIds: [],
                relations: [],
                traits: this.generateSectTraits(doctrine, alignment),
                entryRealmRequirement: Math.max(0, Math.floor(rankTemplate.minLeaderRealm / 2)),
                treasury: this.rng.nextInt(power * 100, power * 500),
            };

            sects.push(sect);
        }

        return sects;
    }

    private pickDoctrine(alignment: Alignment): Doctrine {
        // 根据阵营对道统做加权
        const filtered = DOCTRINE_TEMPLATES.map(d => {
            let w = d.weight;
            if (alignment === 'EVIL' && d.righteousBias > 0.6) w *= 0.2;
            if (alignment === 'EVIL' && d.righteousBias < 0.3) w *= 3;
            if (alignment === 'RIGHTEOUS' && d.righteousBias < 0.3) w *= 0.1;
            if (alignment === 'RIGHTEOUS' && d.righteousBias > 0.6) w *= 2;
            return { item: d.doctrine, weight: w };
        });
        return this.rng.weightedPick(
            filtered.map(f => f.item),
            filtered.map(f => f.weight)
        );
    }

    private generateSectName(alignment: Alignment, used: Set<string>): string {
        let name: string;
        let attempts = 0;
        do {
            // 邪派偏好用邪道前缀(池后半段)
            const prefixPool = alignment === 'EVIL'
                ? SECT_NAME_PREFIX.slice(Math.floor(SECT_NAME_PREFIX.length * 0.6))
                : SECT_NAME_PREFIX.slice(0, Math.floor(SECT_NAME_PREFIX.length * 0.8));
            name = this.rng.pick(prefixPool) + this.rng.pick(SECT_NAME_SUFFIX);
            attempts++;
        } while (used.has(name) && attempts < 30);
        return name;
    }

    private generateSectDescription(name: string, doctrine: Doctrine, alignment: Alignment, rank: SectRank): string {
        const docLabel = DOCTRINE_TEMPLATES.find(d => d.doctrine === doctrine)?.label || '修仙';
        const rankLabel = SECT_RANK_TEMPLATES.find(r => r.rank === rank)?.label || '宗门';
        const alignLabel = alignment === 'RIGHTEOUS' ? '正道' : alignment === 'EVIL' ? '魔道' : '中立';
        return `${name}，${alignLabel}${rankLabel}，以${docLabel}为尊。`;
    }

    private generateSectTraits(doctrine: Doctrine, alignment: Alignment): string[] {
        const docLabel = DOCTRINE_TEMPLATES.find(d => d.doctrine === doctrine)?.label || '修仙';
        const alignLabel = alignment === 'RIGHTEOUS' ? '正道' : alignment === 'EVIL' ? '魔道' : '中立';
        const extra = this.rng.pick(['底蕴深厚', '新锐崛起', '隐世不出', '广纳门徒', '唯才是举', '严苛门规']);
        return [docLabel, alignLabel, extra];
    }

    // ═══════════════════════════════════════
    //  Step 4: 安置宗门到区域
    // ═══════════════════════════════════════

    private placeSects(regions: Region[], sects: Sect[]): void {
        // 按实力排序，强宗优先选地盘
        const sorted = [...sects].sort((a, b) => b.power - a.power);

        for (const sect of sorted) {
            // 寻找最适合的区域
            const scored = regions.map(r => {
                const terrain = TERRAIN_TEMPLATES.find(t => t.type === r.terrain);
                let score = 0;

                // 阵营匹配
                if (terrain?.suitableAlignments.includes(sect.alignment)) score += 30;

                // 道统地形匹配
                const docTemplate = DOCTRINE_TEMPLATES.find(d => d.doctrine === sect.doctrine);
                if (docTemplate?.preferredTerrains.includes(r.terrain)) score += 20;

                // 灵气浓度高的区域更受欢迎
                score += r.spiritDensity * 10;

                // 避免过度拥挤
                score -= r.controlledBy.length * 15;

                // 随机扰动
                score += this.rng.nextFloat(-5, 5);

                return { region: r, score };
            });

            scored.sort((a, b) => b.score - a.score);
            const best = scored[0].region;

            sect.headquarterRegionId = best.id;
            sect.territoryRegionIds = [best.id];
            best.controlledBy.push(sect.id);

            // 大宗门/圣地占据多个区域
            if (sect.rank === 'LARGE' || sect.rank === 'HOLY_LAND') {
                const extraCount = sect.rank === 'HOLY_LAND' ? 2 : 1;
                const available = scored.slice(1, 1 + extraCount * 2);
                for (let i = 0; i < Math.min(extraCount, available.length); i++) {
                    sect.territoryRegionIds.push(available[i].region.id);
                    available[i].region.controlledBy.push(sect.id);
                }
            }
        }
    }

    // ═══════════════════════════════════════
    //  Step 5: 世界NPC
    // ═══════════════════════════════════════

    private generateWorldNPCs(sects: Sect[], regions: Region[]): WorldNPC[] {
        const npcs: WorldNPC[] = [];
        let remaining = this.config.worldNPCCount;

        // 为每个宗门生成核心成员
        for (const sect of sects) {
            const rankTemplate = SECT_RANK_TEMPLATES.find(r => r.rank === sect.rank)!;
            const leaderRealm = Math.max(rankTemplate.minLeaderRealm, this.rng.nextInt(rankTemplate.minLeaderRealm, Math.min(REALMS.length - 1, rankTemplate.minLeaderRealm + 2)));

            // 宗主
            const leader = this.createWorldNPC(sect, 'SECT_MASTER', leaderRealm, sect.headquarterRegionId || '');
            npcs.push(leader);
            sect.leaderId = leader.id;
            remaining--;

            // 长老
            const elderCount = this.rng.nextInt(rankTemplate.elderRange[0], rankTemplate.elderRange[1]);
            for (let i = 0; i < elderCount && remaining > 0; i++) {
                const pos: SectPosition = i === 0 ? 'GRAND_ELDER' : 'ELDER';
                const offset = POSITION_TEMPLATES.find(p => p.position === pos)?.realmOffset || -1;
                const realm = Math.max(0, leaderRealm + offset + this.rng.nextInt(-1, 0));
                const elder = this.createWorldNPC(sect, pos, realm, sect.headquarterRegionId || '');
                npcs.push(elder);
                sect.elderIds.push(elder.id);
                remaining--;
            }

            // 弟子
            const discipleCount = this.rng.nextInt(2, Math.min(6, rankTemplate.memberRange[1] - elderCount - 1));
            for (let i = 0; i < discipleCount && remaining > 0; i++) {
                const pos: SectPosition = this.rng.chance(0.4) ? 'INNER_DISCIPLE' : 'OUTER_DISCIPLE';
                const offset = POSITION_TEMPLATES.find(p => p.position === pos)?.realmOffset || -3;
                const realm = Math.max(0, leaderRealm + offset + this.rng.nextInt(-1, 1));
                const disc = this.createWorldNPC(sect, pos, realm, sect.headquarterRegionId || '');
                npcs.push(disc);
                sect.discipleIds.push(disc.id);
                remaining--;
            }
        }

        // 剩余名额 → 散修
        while (remaining > 0) {
            const region = this.rng.pick(regions);
            const realm = this.rng.nextInt(0, Math.min(3, REALMS.length - 1));
            const wanderer = this.createWorldNPC(null, 'WANDERER', realm, region.id);
            npcs.push(wanderer);
            remaining--;
        }

        return npcs;
    }

    private createWorldNPC(
        sect: Sect | null,
        position: SectPosition,
        realmIndex: number,
        regionId: string,
    ): WorldNPC {
        const gender = this.rng.chance(0.5) ? 'M' as const : 'F' as const;
        const alignment = sect?.alignment || this.rng.pick(['RIGHTEOUS', 'NEUTRAL', 'EVIL'] as Alignment[]);

        // 年龄与境界相关
        const baseAge = 20 + realmIndex * 30 + this.rng.nextInt(0, 50);
        const lifespan = 60 + realmIndex * 80 + this.rng.nextInt(0, 40);

        // 战力 = 境界 * 100 + 随机
        const combatPower = realmIndex * 100 + this.rng.nextInt(-20, 50);

        // 性格标签
        const tags = PERSONALITY_TAGS[alignment] || PERSONALITY_TAGS.NEUTRAL;
        const personality = this.rng.pickN(tags, this.rng.nextInt(1, 3));

        // 称号 (高境界NPC)
        let title: string | undefined;
        if (realmIndex >= 4 && sect) {
            const titlePool = NPC_TITLES[sect.doctrine] || [];
            if (titlePool.length > 0) title = this.rng.pick(titlePool);
        }

        return {
            id: this.rng.uid('npc'),
            name: generateName(gender),
            gender,
            title,
            realmIndex,
            age: baseAge,
            lifespan,
            alive: true,
            sectId: sect?.id || null,
            position,
            currentLocationId: regionId, // Optional mapped to currentLocationId
            alignment,
            personality,
            combatPower: Math.max(1, combatPower),
            knownToPlayer: false,
            playerFavor: 0,
            affinity: 0,
            relationships: [],
        };
    }

    // ═══════════════════════════════════════
    //  Step 6: 资源节点
    // ═══════════════════════════════════════

    private generateResourceNodes(regions: Region[]): ResourceNode[] {
        const nodes: ResourceNode[] = [];
        let remaining = Math.floor(20 * (this.config.resourceRichnessMultiplier || 1.0)); // Fallback if missing


        for (const region of regions) {
            const terrain = TERRAIN_TEMPLATES.find(t => t.type === region.terrain);
            if (!terrain) continue;

            // 每个区域至少 1 个资源，最多按比例
            const count = Math.max(1, Math.round(remaining / Math.max(1, regions.length - regions.indexOf(region))));
            const actual = Math.min(count, remaining, this.rng.nextInt(1, 4));

            for (let i = 0; i < actual; i++) {
                const resType = this.rng.pick(terrain.resourceTypes);
                const namePool = RESOURCE_NAMES[resType] || ['未知资源'];
                const name = this.rng.pick(namePool);

                const node: ResourceNode = {
                    id: this.rng.uid('res'),
                    name,
                    type: resType,
                    description: `位于${region.name}的${name}`,
                    regionId: region.id,
                    level: Math.max(1, Math.min(10, region.dangerLevel + this.rng.nextInt(-1, 1))),
                    yield: +this.rng.nextFloat(0.5, 2.0).toFixed(2),
                    controlled: region.controlledBy.length > 0 && this.rng.chance(0.6),
                    controllerId: region.controlledBy.length > 0 ? this.rng.pick(region.controlledBy) : undefined,
                    depleted: false,
                };

                nodes.push(node);

                if (region.locations.length > 0) {
                    const loc = this.rng.pick(region.locations);
                    if (!loc.resourceIds) loc.resourceIds = [];
                    loc.resourceIds.push(node.id);
                }

                remaining--;
                if (remaining <= 0) break;
            }
            if (remaining <= 0) break;
        }

        return nodes;
    }

    // ═══════════════════════════════════════
    //  Step 7: 宗门关系
    // ═══════════════════════════════════════

    private establishRelations(sects: Sect[]): void {
        for (let i = 0; i < sects.length; i++) {
            for (let j = i + 1; j < sects.length; j++) {
                const a = sects[i];
                const b = sects[j];

                let favorability = 0;

                // 阵营影响
                if (a.alignment === b.alignment) favorability += 30;
                if (a.alignment === 'RIGHTEOUS' && b.alignment === 'EVIL') favorability -= 60;
                if (a.alignment === 'EVIL' && b.alignment === 'RIGHTEOUS') favorability -= 60;

                // 道统影响 (同道统竞争)
                if (a.doctrine === b.doctrine) favorability -= 15;

                // 地盘冲突
                const sharedTerritory = a.territoryRegionIds.some(id => b.territoryRegionIds.includes(id));
                if (sharedTerritory) favorability -= 20;

                // 随机扰动
                favorability += this.rng.nextInt(-20, 20);

                // 钳制到 [-100, 100]
                favorability = Math.max(-100, Math.min(100, favorability));

                const type: SectRelation['type'] =
                    favorability > 40 ? 'ALLIANCE' :
                        favorability < -40 ? 'HOSTILE' :
                            favorability > 10 ? 'TRADE' : 'NEUTRAL';

                a.relations.push({ targetSectId: b.id, favorability, type });
                b.relations.push({ targetSectId: a.id, favorability, type });
            }
        }
    }

    // ═══════════════════════════════════════
    //  Step 8: 区域邻接
    // ═══════════════════════════════════════

    private linkRegions(regions: Region[]): void {
        // 简单链式 + 随机交叉连接
        for (let i = 0; i < regions.length; i++) {
            // 链式连接
            if (i + 1 < regions.length) {
                const a = regions[i];
                const b = regions[i + 1];
                if (!a.adjacentRegions.includes(b.id)) a.adjacentRegions.push(b.id);
                if (!b.adjacentRegions.includes(a.id)) b.adjacentRegions.push(a.id);
            }

            // 随机交叉（约30%几率与另一个非相邻区域连接）
            if (this.rng.chance(0.3) && regions.length > 3) {
                const other = this.rng.pick(regions.filter(r => r.id !== regions[i].id && !regions[i].adjacentRegions.includes(r.id)));
                if (other) {
                    regions[i].adjacentRegions.push(other.id);
                    other.adjacentRegions.push(regions[i].id);
                }
            }
        }

        // 首尾连通 (环形世界)
        if (regions.length > 2) {
            const first = regions[0];
            const last = regions[regions.length - 1];
            if (!first.adjacentRegions.includes(last.id)) {
                first.adjacentRegions.push(last.id);
                last.adjacentRegions.push(first.id);
            }
        }
    }

    // ═══════════════════════════════════════
    //  Step 9: 宗门驻地地点
    // ═══════════════════════════════════════

    private generateSectHeadquarters(regions: Region[], sects: Sect[]): void {
        for (const sect of sects) {
            const region = regions.find(r => r.id === sect.headquarterRegionId);
            if (!region) continue;

            // 坐标：在区域中心附近，尽量不与现有地点重叠
            // 简单起见，随机一个偏移
            const angle = this.rng.next() * Math.PI * 2;
            const dist = this.rng.nextInt(4, 10);
            const hqCoord = {
                x: Math.round(region.coord.x + Math.cos(angle) * dist),
                y: Math.round(region.coord.y + Math.sin(angle) * dist)
            };

            // 边界检查
            hqCoord.x = Math.max(2, Math.min(98, hqCoord.x));
            hqCoord.y = Math.max(2, Math.min(98, hqCoord.y));

            const hqLoc: Location = {
                id: this.rng.uid('loc'),
                name: `${sect.name}山门`,
                type: 'SECT_HQ',
                coord: hqCoord,
                description: `${sect.name}的总部所在，${this.rng.pick(LOCATION_DESCRIPTORS['SECT_HQ'])}`,
                regionId: region.id,
                level: Math.min(10, Math.floor(sect.power / 10)),
                discovered: false,
                sectAffiliation: sect.id, // Replace sectId
                resourceIds: [],
            };

            region.locations.push(hqLoc);
        }
    }
}
