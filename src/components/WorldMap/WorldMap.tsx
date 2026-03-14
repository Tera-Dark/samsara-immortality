import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, Focus, ZoomIn, ZoomOut } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { MapCanvas } from './MapCanvas';
import { MapNode } from './MapNode';
import { getMapVisual } from './mapVisuals';
import type { Location, LocationType, Region, WorldSnapshot } from '../../types/worldTypes';

interface WorldMapProps {
    onClose: () => void;
    onTravel: (locationId: string) => void;
}

const MAP_LEGEND_TYPES = ['REGION_CENTER', 'CITY', 'SECT_HQ', 'MARKET', 'SECRET_REALM', 'RUINS', 'WILDERNESS', 'SPIRIT_VEIN'] as const;
const MAP_FILTER_TYPES: LocationType[] = ['CITY', 'SECT_HQ', 'MARKET', 'SECRET_REALM', 'RUINS', 'WILDERNESS', 'SPIRIT_VEIN', 'MINE', 'HERB_GARDEN', 'INN', 'AUCTION_HOUSE', 'SECT'];

const MapLegend: React.FC = () => (
    <div className="absolute left-4 top-4 z-50 w-72 rounded-3xl border border-slate-700/70 bg-slate-950/75 p-4 text-slate-200 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-400/15 p-2 text-amber-300">
                <Compass className="h-4 w-4" />
            </div>
            <div>
                <div className="text-xs font-mono tracking-[0.3em] text-slate-400">MAP LEGEND</div>
                <h3 className="mt-1 text-sm font-semibold text-white">区域分类</h3>
            </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
            {MAP_LEGEND_TYPES.map((type) => {
                const visual = getMapVisual(type);
                const Icon = visual.icon;
                return (
                    <div key={type} className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/85 px-3 py-2">
                        <div
                            className="flex h-10 w-10 items-center justify-center rounded-2xl border"
                            style={{ background: visual.background, borderColor: visual.border }}
                        >
                            <Icon className="h-4 w-4" color={visual.color} />
                        </div>
                        <div className="min-w-0">
                            <div className="truncate text-sm text-slate-100">{visual.label}</div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">{type}</div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const TravelModal: React.FC<{
    targetName: string;
    days: number;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ targetName, days, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
            className="w-full max-w-sm rounded-3xl border border-amber-500/35 bg-white p-6 shadow-2xl"
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <h3 className="text-center text-xl font-semibold text-slate-900">前往 {targetName}</h3>
            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-center">
                <div className="text-sm text-slate-500">预计耗时</div>
                <div className="my-2 text-4xl font-mono text-slate-900">{days}</div>
                <div className="text-sm text-slate-500">天，途中可能遭遇机缘或危险。</div>
            </div>
            <div className="mt-6 flex gap-3">
                <button onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-2.5 text-slate-700 transition-colors hover:bg-slate-200">
                    取消
                </button>
                <button
                    onClick={onConfirm}
                    className="flex-1 rounded-2xl bg-amber-600 py-2.5 font-semibold text-white shadow-lg shadow-amber-900/25 transition-colors hover:bg-amber-500"
                >
                    出发
                </button>
            </div>
        </motion.div>
    </div>
);

const SelectionBracket: React.FC = () => (
    <motion.div
        className="pointer-events-none absolute -inset-6 z-0"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.25 }}
    >
        <div className="absolute left-0 top-0 h-4 w-4 rounded-tl-sm border-l-2 border-t-2 border-amber-400" />
        <div className="absolute right-0 top-0 h-4 w-4 rounded-tr-sm border-r-2 border-t-2 border-amber-400" />
        <div className="absolute bottom-0 left-0 h-4 w-4 rounded-bl-sm border-b-2 border-l-2 border-amber-400" />
        <div className="absolute bottom-0 right-0 h-4 w-4 rounded-br-sm border-b-2 border-r-2 border-amber-400" />
    </motion.div>
);

export const WorldMap: React.FC<WorldMapProps> = ({ onClose, onTravel }) => {
    const { gameState, travel, engine } = useGameStore();
    const world = gameState.world as WorldSnapshot;
    const [scale, setScale] = useState(1);
    const [travelError, setTravelError] = useState<string | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<{ id: string; name: string } | null>(null);
    const [focusScope, setFocusScope] = useState<'ALL' | 'CURRENT_REGION'>('ALL');
    const [visibleTypes, setVisibleTypes] = useState<LocationType[]>(MAP_FILTER_TYPES);

    const coords = useMemo(() => world.regions.map((region) => region.coord), [world.regions]);
    const padding = 500;
    const minX = Math.min(...coords.map((coord) => coord.x * 20));
    const maxX = Math.max(...coords.map((coord) => coord.x * 20));
    const minY = Math.min(...coords.map((coord) => coord.y * 20));
    const maxY = Math.max(...coords.map((coord) => coord.y * 20));
    const currentRegionId = useMemo(() => {
        const directRegion = world.regions.find((region) => region.id === gameState.location);
        if (directRegion) return directRegion.id;
        return world.regions.find((region) => region.locations.some((location) => location.id === gameState.location))?.id ?? world.regions[0]?.id ?? null;
    }, [gameState.location, world.regions]);

    const visibleRegions = useMemo(() => {
        const scopedRegions = focusScope === 'CURRENT_REGION' && currentRegionId
            ? world.regions.filter((region) => region.id === currentRegionId)
            : world.regions;

        return scopedRegions.map((region) => ({
            ...region,
            locations: region.locations.filter((location) => visibleTypes.includes(location.type)),
        }));
    }, [currentRegionId, focusScope, visibleTypes, world.regions]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;

            if (selectedTarget) {
                setSelectedTarget(null);
                setTravelError(null);
                return;
            }

            onClose();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, selectedTarget]);

    const handleWheel = (event: React.WheelEvent) => {
        event.stopPropagation();
        setScale((current) => Math.max(0.55, Math.min(2.5, current - event.deltaY * 0.001)));
    };

    const handleNodeClick = (targetId: string) => {
        if (targetId === gameState.location) return;
        setTravelError(null);
        setSelectedTarget({ id: targetId, name: getLocationName(targetId, world) });
    };

    const toggleType = (type: LocationType) => {
        setVisibleTypes((current) => {
            if (current.includes(type)) {
                if (current.length === 1) return current;
                return current.filter((item) => item !== type);
            }

            return [...current, type];
        });
    };

    const confirmTravel = () => {
        if (!selectedTarget) return;
        const result = travel(selectedTarget.id);

        if (result.success) {
            onTravel(selectedTarget.id);
            setSelectedTarget(null);
            onClose();
            return;
        }

        setTravelError(result.message);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-950" onWheel={handleWheel}>
            <div
                className="absolute inset-0 opacity-90"
                style={{
                    background:
                        'radial-gradient(circle at top, rgba(30, 41, 59, 0.9), rgba(2, 6, 23, 0.98) 45%), linear-gradient(180deg, rgba(15, 23, 42, 0.35), rgba(2, 6, 23, 1))',
                }}
            />
            <div
                className="absolute inset-0 opacity-20"
                style={{
                    backgroundImage: 'linear-gradient(rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.15) 1px, transparent 1px)',
                    backgroundSize: '64px 64px',
                }}
            />

            <MapLegend />

            <div className="absolute left-4 top-[320px] z-50 w-72 rounded-3xl border border-slate-700/70 bg-slate-950/75 p-4 text-slate-200 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                    <div>
                        <div className="text-xs font-mono tracking-[0.3em] text-slate-400">MAP FILTER</div>
                        <h3 className="mt-1 text-sm font-semibold text-white">视图筛选</h3>
                    </div>
                    <button
                        onClick={() => setFocusScope((scope) => (scope === 'ALL' ? 'CURRENT_REGION' : 'ALL'))}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] transition-colors ${
                            focusScope === 'CURRENT_REGION'
                                ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200'
                                : 'border-slate-700 bg-slate-900 text-slate-300'
                        }`}
                    >
                        <Focus className="h-3.5 w-3.5" />
                        {focusScope === 'CURRENT_REGION' ? '当前区域' : '全图'}
                    </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {MAP_FILTER_TYPES.map((type) => {
                        const visual = getMapVisual(type);
                        const enabled = visibleTypes.includes(type);
                        return (
                            <button
                                key={type}
                                onClick={() => toggleType(type)}
                                className={`rounded-full border px-3 py-1 text-xs transition-all ${
                                    enabled
                                        ? 'bg-white/10 text-white'
                                        : 'border-slate-800 bg-slate-900/80 text-slate-500'
                                }`}
                                style={enabled ? { borderColor: visual.border, color: visual.color, background: visual.background } : undefined}
                            >
                                {visual.label}
                            </button>
                        );
                    })}
                </div>
                <div className="mt-3 text-xs text-slate-400">
                    已显示 {visibleTypes.length} 类地点，当前地图节点 {visibleRegions.reduce((sum, region) => sum + region.locations.length, 0) + visibleRegions.length} 个。
                </div>
            </div>

            {selectedTarget && (
                <TravelModal
                    targetName={selectedTarget.name}
                    days={engine.calculateTravelDays(selectedTarget.id)}
                    onConfirm={confirmTravel}
                    onCancel={() => setSelectedTarget(null)}
                />
            )}

            <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
                <button
                    onClick={() => setScale((current) => Math.min(2.5, current + 0.15))}
                    className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3 text-slate-200 transition-colors hover:text-white"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setScale((current) => Math.max(0.55, current - 0.15))}
                    className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3 text-slate-200 transition-colors hover:text-white"
                >
                    <ZoomOut className="h-4 w-4" />
                </button>
                <button
                    onClick={onClose}
                    className="rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-200 transition-colors hover:text-amber-300"
                >
                    关闭地图 (Esc)
                </button>
            </div>

            {travelError && (
                <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 rounded-2xl border border-red-400/35 bg-red-950/80 px-4 py-2 text-sm text-red-100 shadow-lg backdrop-blur-sm">
                    {travelError}
                </div>
            )}

            {!gameState.tutorialCompleted && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/35 backdrop-blur-sm">
                    <div className="max-w-md rounded-3xl border border-amber-900/40 bg-slate-950/90 p-8 text-center shadow-2xl">
                        <div className="text-3xl text-slate-500">禁</div>
                        <h2 className="mt-3 text-2xl font-semibold text-slate-200">大世界尚未解锁</h2>
                        <p className="mt-3 text-slate-400">你的修为尚浅，还未真正踏入修行界。</p>
                        <p className="mt-2 text-sm text-amber-500">请先完成新手阶段，再来查看完整地图。</p>
                        <button
                            onClick={onClose}
                            className="mt-6 rounded-full border border-slate-700 bg-slate-900 px-6 py-2 text-slate-300 transition-colors hover:text-white"
                        >
                            暂且退下
                        </button>
                    </div>
                </div>
            )}

            <motion.div
                className="relative h-full w-full cursor-move"
                drag
                dragConstraints={{
                    left: -(maxX + padding),
                    right: -(minX - padding),
                    top: -(maxY + padding),
                    bottom: -(minY - padding),
                }}
                style={{ scale, width: '100%', height: '100%', x: 0, y: 0 }}
            >
                <div className="absolute inset-0">
                    <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-1/2 -translate-y-1/2">
                        {visibleRegions.map((region) => {
                            let auraColor = 'rgba(16, 185, 129, 0.22)';
                            if (region.controlledBy?.length) {
                                const sect = world.sects.find((item) => item.id === region.controlledBy[0]);
                                if (sect?.alignment === 'RIGHTEOUS') auraColor = 'rgba(59, 130, 246, 0.22)';
                                if (sect?.alignment === 'EVIL') auraColor = 'rgba(239, 68, 68, 0.22)';
                                if (sect?.alignment === 'NEUTRAL') auraColor = 'rgba(250, 204, 21, 0.22)';
                            }

                            return (
                                <div
                                    key={`aura-${region.id}`}
                                    className="pointer-events-none absolute rounded-full blur-[88px]"
                                    style={{
                                        left: region.coord.x * 20,
                                        top: region.coord.y * 20,
                                        width: 420,
                                        height: 420,
                                        transform: 'translate(-50%, -50%)',
                                        background: `radial-gradient(circle, ${auraColor} 0%, transparent 72%)`,
                                    }}
                                />
                            );
                        })}

                        <div className="absolute left-0 top-0 overflow-visible">
                            <MapCanvas world={world} regions={visibleRegions} />
                        </div>

                        {visibleRegions.map((region: Region) => (
                            <React.Fragment key={region.id}>
                                <div
                                    className="absolute"
                                    style={{ left: region.coord.x * 20, top: region.coord.y * 20, transform: 'translate(-50%, -50%)' }}
                                >
                                    {gameState.location === region.id && <SelectionBracket />}
                                    <div className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-10 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-950/85 px-3 py-1 text-[11px] text-slate-300 shadow-lg">
                                        {region.name}
                                    </div>
                                    <MapNode data={region} isRegionCenter isActive={gameState.location === region.id} onClick={handleNodeClick} />
                                </div>

                                {region.locations.map((location: Location) => (
                                    <div
                                        key={location.id}
                                        className="absolute"
                                        style={{ left: location.coord.x * 20, top: location.coord.y * 20, transform: 'translate(-50%, -50%)' }}
                                    >
                                        {gameState.location === location.id && <SelectionBracket />}
                                        <MapNode data={location} isActive={gameState.location === location.id} onClick={handleNodeClick} />
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-full border border-slate-700 bg-slate-950/80 px-6 py-3 text-slate-200 shadow-2xl backdrop-blur-md">
                <span className="font-semibold text-amber-300">玄黄大世界</span>
                <span className="mx-2 text-slate-600">|</span>
                {world.era.name}
                <span className="mx-2 text-slate-600">|</span>
                <span className="text-sm text-slate-300">当前位置: {getLocationName(gameState.location, world)}</span>
            </div>
        </div>
    );
};

function getLocationName(id: string, world: WorldSnapshot): string {
    for (const region of world.regions) {
        if (region.id === id) return region.name;
        const location = region.locations.find((item) => item.id === id);
        if (location) return `${region.name} · ${location.name}`;
    }

    return '未知地点';
}
