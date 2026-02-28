import React from 'react';
import type { Region, Location } from '../../types/worldTypes';
import { motion } from 'framer-motion';

interface MapNodeProps {
    data: Region | Location;
    isRegionCenter?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    onClick?: (id: string) => void;
}

const TYPE_COLORS: Record<string, string> = {
    'CITY': '#4ade80',      // Green
    'SECT_HQ': '#f87171',   // Red
    'SECRET_REALM': '#a78bfa', // Purple
    'WILDERNESS': '#9ca3af', // Gray
    'MINE': '#fbbf24',      // Amber
    'HERB_GARDEN': '#34d399', // Emerald
    'SPIRIT_VEIN': '#60a5fa', // Blue
    'RUINS': '#fb923c',     // Orange
    'MARKET': '#fcd34d',    // Yellow
    'REGION_CENTER': '#e2e8f0', // White
};

export const MapNode: React.FC<MapNodeProps> = ({ data, isRegionCenter, isActive, isLocked, onClick }) => {
    const type = isRegionCenter ? 'REGION_CENTER' : (data as Location).type;
    const color = TYPE_COLORS[type] || '#ffffff';

    // Size based on importance
    const size = isRegionCenter ? 24 : 12;
    const glowSize = isActive ? size * 2.5 : size * 1.5;

    return (
        <div
            className="relative cursor-pointer group flex items-center justify-center p-2"
            onClick={() => onClick && onClick(data.id)}
        >
            {/* Glow Effect */}
            <motion.div
                className="absolute rounded-full opacity-30 select-none pointer-events-none"
                style={{
                    backgroundColor: color,
                    width: glowSize,
                    height: glowSize,
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%'
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Core Node */}
            <div
                className={`relative rounded-full border-2 transition-colors duration-300 ${isActive ? 'border-white' : 'border-transparent'}`}
                style={{
                    width: size,
                    height: size,
                    backgroundColor: isLocked ? '#333' : color,
                    borderColor: isActive ? '#fff' : (isRegionCenter ? 'rgba(255,255,255,0.5)' : 'transparent')
                }}
            >
                {/* Active Indicator Ring */}
                {isActive && (
                    <motion.div
                        className="absolute -inset-1 border border-white rounded-full"
                        animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                )}
            </div>

            {/* Tooltip on Hover */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-1 bg-gray-900/90 text-xs text-white rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700">
                <div className="font-bold text-amber-500">{data.name}</div>
                <div className="text-gray-400 scale-90 origin-top">{isRegionCenter ? (data as Region).terrain : (data as Location).type}</div>
            </div>
        </div>
    );
};
