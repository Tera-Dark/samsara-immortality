import React from 'react';
import { motion } from 'framer-motion';
import type { Region, Location } from '../../types/worldTypes';
import { getMapVisual } from './mapVisuals';

interface MapNodeProps {
    data: Region | Location;
    isRegionCenter?: boolean;
    isActive?: boolean;
    isLocked?: boolean;
    onClick?: (id: string) => void;
}

export const MapNode: React.FC<MapNodeProps> = ({ data, isRegionCenter, isActive, isLocked, onClick }) => {
    const type = isRegionCenter ? 'REGION_CENTER' : (data as Location).type;
    const visual = getMapVisual(type);
    const Icon = visual.icon;
    const size = isRegionCenter ? 54 : 40;
    const glowSize = isRegionCenter ? 96 : 72;

    return (
        <button
            type="button"
            className="group relative flex cursor-pointer items-center justify-center p-2"
            onClick={() => onClick?.(data.id)}
        >
            <motion.div
                className="pointer-events-none absolute rounded-full blur-xl"
                style={{
                    width: glowSize,
                    height: glowSize,
                    background: `radial-gradient(circle, ${visual.glow} 0%, transparent 72%)`,
                }}
                animate={{ scale: isActive ? [1, 1.15, 1] : [0.95, 1.08, 0.95], opacity: [0.45, 0.8, 0.45] }}
                transition={{ duration: isActive ? 1.8 : 3, repeat: Infinity, ease: 'easeInOut' }}
            />

            <motion.div
                className="relative flex items-center justify-center overflow-hidden rounded-2xl border shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:scale-105"
                style={{
                    width: size,
                    height: size,
                    background: isLocked ? 'rgba(30, 41, 59, 0.85)' : `linear-gradient(135deg, ${visual.background}, rgba(15, 23, 42, 0.9))`,
                    borderColor: isActive ? '#ffffff' : visual.border,
                    boxShadow: isActive ? `0 0 0 1px ${visual.border}, 0 0 28px ${visual.glow}` : `0 12px 30px rgba(2, 6, 23, 0.35)`,
                }}
                animate={isActive ? { y: [0, -3, 0] } : { y: [0, -1.5, 0] }}
                transition={{ duration: isActive ? 1.5 : 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
                <div
                    className="absolute inset-0 opacity-80"
                    style={{
                        background: `radial-gradient(circle at top left, ${visual.border} 0%, transparent 48%)`,
                    }}
                />
                <Icon className="relative z-10" size={isRegionCenter ? 22 : 16} color={isLocked ? '#64748b' : visual.color} strokeWidth={2.2} />
            </motion.div>

            {isActive && (
                <motion.div
                    className="pointer-events-none absolute inset-0 rounded-3xl border"
                    style={{ borderColor: visual.border }}
                    animate={{ scale: [1, 1.18], opacity: [0.8, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
            )}

            <div className="pointer-events-none absolute left-1/2 top-full z-50 mt-3 w-max -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-950/90 px-3 py-2 text-left opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                <div className="text-sm font-semibold text-white">{data.name}</div>
                <div className="mt-1 text-[11px] text-slate-300">{isRegionCenter ? (data as Region).terrain : visual.label}</div>
            </div>
        </button>
    );
};
