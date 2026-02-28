import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MapNode } from './MapNode';
import { MapCanvas } from './MapCanvas';
import { motion } from 'framer-motion';
import type { Region, Location, WorldSnapshot } from '../../types/worldTypes';

interface WorldMapProps {
    onClose: () => void;
    onTravel: (locationId: string) => void;
}

// Map Legend Component
const MapLegend: React.FC = () => (
    <div className="absolute top-4 left-4 z-50 bg-black/30 backdrop-blur-sm p-3 rounded-lg border border-gray-700 backdrop-blur-sm">
        <h3 className="text-amber-500 font-bold mb-2 text-sm border-b border-gray-700 pb-1">图例说明</h3>
        <div className="space-y-1 text-xs text-gray-300">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f87171]" /> 宗门驻地 (Sect)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#4ade80]" /> 城镇坊市 (City)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#34d399]" /> 灵药越 (Garden)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#fbbf24]" /> 矿脉 (Mine)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#60a5fa]" /> 灵脉/野外 (Wild)</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#a78bfa]" /> 秘境 (Realm)</div>
        </div>
    </div>
);

// Travel Confirmation Modal
const TravelModal: React.FC<{
    targetName: string;
    days: number;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ targetName, days, onConfirm, onCancel }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
            className="bg-white border border-amber-500/50 p-6 rounded-lg shadow-2xl max-w-sm w-full"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <h3 className="text-xl font-bold text-amber-500 mb-4 text-center">前往 {targetName}</h3>
            <div className="text-center text-gray-300 mb-6">
                <p>路途遥远，预计耗时</p>
                <div className="text-3xl font-mono text-white my-2">{days} <span className="text-base text-gray-500">天</span></div>
                <p className="text-sm text-gray-500">途中可能遭遇机缘或危险...</p>
            </div>
            <div className="flex gap-4">
                <button onClick={onCancel} className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded transition-colors">
                    取消
                </button>
                <button onClick={onConfirm} className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded transition-colors shadow-lg shadow-amber-900/40">
                    出发
                </button>
            </div>
        </motion.div>
    </div>
);

// Selection Bracket Component
const SelectionBracket: React.FC = () => (
    <motion.div
        className="absolute -inset-5 pointer-events-none z-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
    >
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 rounded-tl-sm" />
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 rounded-tr-sm" />
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 rounded-bl-sm" />
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 rounded-br-sm" />
    </motion.div>
);

export const WorldMap: React.FC<WorldMapProps> = ({ onClose, onTravel }) => {
    const { gameState, travel, engine } = useGameStore();
    const world = gameState.world as WorldSnapshot;
    const [scale, setScale] = useState(1);

    // Selection for Travel
    const [selectedTarget, setSelectedTarget] = useState<{ id: string, name: string } | null>(null);

    // Calculate map bounds for drag constraints
    const padding = 500; // Extra space around the edges
    const coords = world.regions.map(r => r.coord);
    const minX = Math.min(...coords.map(c => c.x * 20));
    const maxX = Math.max(...coords.map(c => c.x * 20));
    const minY = Math.min(...coords.map(c => c.y * 20));
    const maxY = Math.max(...coords.map(c => c.y * 20));

    // Limits for zoom
    const minScale = 0.5;
    const maxScale = 3;

    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation();
        const newScale = Math.max(minScale, Math.min(maxScale, scale - e.deltaY * 0.001));
        setScale(newScale);
    };

    const handleNodeClick = (targetId: string) => {
        if (targetId === gameState.location) return;
        const name = getLocationName(targetId, world);
        setSelectedTarget({ id: targetId, name });
    };

    const confirmTravel = () => {
        if (!selectedTarget) return;
        const result = travel(selectedTarget.id);
        if (result.success) {
            onTravel(selectedTarget.id);
            onClose();
        } else {
            console.log(result.message);
        }
        setSelectedTarget(null);
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/90 overflow-hidden flex items-center justify-center catch-events"
            onWheel={handleWheel}
        >
            {/* Legend */}
            <MapLegend />

            {/* Travel Modal */}
            {selectedTarget && (
                <TravelModal
                    targetName={selectedTarget.name}
                    days={engine.calculateTravelDays(selectedTarget.id)}
                    onConfirm={confirmTravel}
                    onCancel={() => setSelectedTarget(null)}
                />
            )}

            {/* Controls */}
            <div className="absolute top-4 right-4 z-50 flex gap-2">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-800 text-white rounded border border-gray-600 hover:bg-gray-700 hover:text-amber-500 transition-colors"
                >
                    关闭地图 (Esc)
                </button>
            </div>

            {/* Tutorial Lock Overlay */}
            {!gameState.tutorialCompleted && (
                <div className="absolute inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center backdrop-blur-sm">
                    <div className="text-center p-8 border border-amber-900/50 bg-black/90 rounded-xl shadow-2xl max-w-md">
                        <div className="text-2xl mb-4 font-serif text-slate-400">禁</div>
                        <h2 className="text-2xl font-bold text-gray-400 mb-2">大世界未解锁</h2>
                        <p className="text-gray-500 mb-6">你的修为尚浅，且未通晓修仙界基本常识。</p>
                        <p className="text-amber-700 text-sm">请先完成「新手入门」教程（或经历初始剧情事件）</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition-colors border border-gray-700"
                        >
                            暂且退下
                        </button>
                    </div>
                </div>
            )}

            {/* Map Viewport */}
            <motion.div
                className="w-full h-full cursor-move relative"
                drag
                dragConstraints={{
                    left: -(maxX + padding),
                    right: -(minX - padding),
                    top: -(maxY + padding),
                    bottom: -(minY - padding)
                }}
                style={{
                    scale,
                    width: '100%',
                    height: '100%',
                    x: 0,
                    y: 0
                }}
            >
                {/* Background Grid/Stars - Now interactive to catch drag events */}
                <div className="absolute -inset-[3000px] opacity-20"
                    style={{
                        backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                {/* Faction/Region Aura Layer */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ width: 0, height: 0 }}>
                    {world.regions.map(r => {
                        // Determine Color based on controlling Sect if any
                        let auraColor = '#10b981'; // Default Green (Neutral/Wild)
                        if (r.controlledBy && r.controlledBy.length > 0) {
                            const sectId = r.controlledBy[0];
                            const sect = world.sects.find(s => s.id === sectId);
                            if (sect) {
                                if (sect.alignment === 'RIGHTEOUS') auraColor = '#3b82f6'; // Blue
                                else if (sect.alignment === 'EVIL') auraColor = '#ef4444'; // Red
                                else auraColor = '#fbbf24'; // Yellow/Amber
                            }
                        }

                        return (
                            <div
                                key={`aura-${r.id}`}
                                className="absolute rounded-full filter blur-[80px] opacity-15 pointer-events-none transition-colors duration-1000"
                                style={{
                                    left: r.coord.x * 20,
                                    top: r.coord.y * 20,
                                    width: '400px',
                                    height: '400px',
                                    transform: 'translate(-50%, -50%)',
                                    backgroundColor: auraColor
                                }}
                            />
                        );
                    })}

                    {/* Connections Layer */}
                    <div className="absolute top-0 left-0 overflow-visible">
                        <MapCanvas world={world} />
                    </div>

                    {/* Nodes Layer */}
                    {world.regions.map((region: Region) => (
                        <React.Fragment key={region.id}>
                            {/* Region Center Node */}
                            <div className="absolute" style={{ left: region.coord.x * 20, top: region.coord.y * 20, transform: 'translate(-50%, -50%)' }}>
                                {gameState.location === region.id && <SelectionBracket />}
                                <MapNode
                                    data={region}
                                    isRegionCenter
                                    isActive={gameState.location === region.id}
                                    onClick={(id) => handleNodeClick(id)}
                                />
                            </div>

                            {/* Sub-locations */}
                            {region.locations.map((loc: Location) => (
                                <div key={loc.id} className="absolute" style={{ left: loc.coord.x * 20, top: loc.coord.y * 20, transform: 'translate(-50%, -50%)' }}>
                                    {gameState.location === loc.id && <SelectionBracket />}
                                    <MapNode
                                        data={loc}
                                        isActive={gameState.location === loc.id}
                                        onClick={(id) => handleNodeClick(id)}
                                    />
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>
            </motion.div>

            {/* Hub / Info Overlay */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm px-6 py-2 rounded-full border border-gray-700 text-gray-300 pointer-events-none backdrop-blur-sm z-50">
                <span className="text-amber-500 font-bold">玄黄大世界</span>
                <span className="mx-2 text-gray-600">|</span>
                {world.era.name}
                <span className="mx-2 text-gray-600">|</span>
                <span className="text-xs">当前位置: {getLocationName(gameState.location, world)}</span>
            </div>
        </div>
    );
};

// Helper to find location name
function getLocationName(id: string, world: WorldSnapshot): string {
    for (const r of world.regions) {
        if (r.id === id) return r.name;
        const loc = r.locations.find((l) => l.id === id);
        if (loc) return `${r.name} · ${loc.name}`;
    }
    return '未知';
}
