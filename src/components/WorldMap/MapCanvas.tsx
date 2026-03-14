import React from 'react';
import type { WorldSnapshot, Coordinate, Region } from '../../types/worldTypes';
import { motion } from 'framer-motion';

interface MapCanvasProps {
    world: WorldSnapshot;
    regions?: Region[];
}

export const MapCanvas: React.FC<MapCanvasProps> = ({ world, regions }) => {
    // 1. Collect all lines we want to draw
    const lines: Array<{ from: Coordinate; to: Coordinate; key: string; type: 'REGION' | 'LOCATION' }> = [];
    const visibleRegions = regions ?? world.regions;

    // Map Region ID to Coordinate for easy lookup
    const regionCoords: Record<string, Coordinate> = {};
    visibleRegions.forEach(r => regionCoords[r.id] = r.coord);

    visibleRegions.forEach(region => {
        // A. Region to Region (Adjacency)
        region.adjacentRegions.forEach(adjId => {
            const adjCoord = regionCoords[adjId];
            if (adjCoord) {
                // Check if line already exists (bidirectional check)
                const key1 = `${region.id}-${adjId}`;
                const key2 = `${adjId}-${region.id}`;
                if (!lines.some(l => l.key === key1 || l.key === key2)) {
                    lines.push({
                        from: region.coord,
                        to: adjCoord,
                        key: key1,
                        type: 'REGION'
                    });
                }
            }
        });

        // B. Region Center to Locations
        region.locations.forEach(loc => {
            lines.push({
                from: region.coord,
                to: loc.coord,
                key: `${region.id}-${loc.id}`,
                type: 'LOCATION'
            });
        });
    });

    return (
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-visible" style={{ zIndex: 0 }}>
            {lines.map(line => (
                <motion.line
                    key={line.key}
                    x1={line.from.x * 20}
                    y1={line.from.y * 20}
                    x2={line.to.x * 20}
                    y2={line.to.y * 20}
                    stroke={line.type === 'REGION' ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.08)"}
                    strokeWidth={line.type === 'REGION' ? 1.5 : 0.8}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            ))}
        </svg>
    );
};
