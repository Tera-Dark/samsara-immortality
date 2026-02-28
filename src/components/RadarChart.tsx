
import React from 'react';

interface RadarChartProps {
    data: { name: string; value: number; max: number }[];
    size?: number;
    color?: string;
}

export const RadarChart: React.FC<RadarChartProps> = ({ data, color = '#10b981' }) => {
    const COUNT = data.length;
    const RADIUS = 40; // Internal SVG units
    const CENTER = 50;
    const MAX_VAL = 20; // Normalization base

    const getPoint = (value: number, index: number, max: number) => {
        const angle = (Math.PI * 2 * index) / COUNT - Math.PI / 2;
        // Normalize value relative to max (capped) specific to the stat or global max?
        // Using global max 20 for visual consistency as per original design
        const r = (Math.min(value, 100) / max) * RADIUS;
        const x = CENTER + r * Math.cos(angle);
        const y = CENTER + r * Math.sin(angle);
        return `${x},${y}`;
    };

    const getLabelPoint = (index: number) => {
        const angle = (Math.PI * 2 * index) / COUNT - Math.PI / 2;
        const r = RADIUS + 12;
        const x = CENTER + r * Math.cos(angle);
        const y = CENTER + r * Math.sin(angle);
        return { x, y };
    };

    const polygonPoints = data.map((s, i) => getPoint(s.value, i, s.max)).join(' ');

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full p-2 drop-shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1].map(scale => (
                <polygon
                    key={scale}
                    points={data.map((_, i) => getPoint(MAX_VAL * scale, i, MAX_VAL)).join(' ')}
                    fill="none"
                    stroke="#334155"
                    strokeWidth="0.5"
                    className="opacity-50"
                />
            ))}

            {/* Axes */}
            {data.map((_, i) => (
                <line
                    key={i}
                    x1={CENTER}
                    y1={CENTER}
                    x2={getPoint(MAX_VAL, i, MAX_VAL).split(',')[0]}
                    y2={getPoint(MAX_VAL, i, MAX_VAL).split(',')[1]}
                    stroke="#334155"
                    strokeWidth="0.5"
                    className="opacity-50"
                />
            ))}

            {/* Data Area */}
            <polygon
                points={polygonPoints}
                fill={`${color}4D`} // 30% opacity hex
                stroke={color}
                strokeWidth="1.5"
                className="animate-[pulse-glow_4s_infinite]"
            />

            {/* Data Points */}
            {data.map((s, i) => {
                const [cx, cy] = getPoint(s.value, i, s.max).split(',');
                return (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r="2"
                        fill={color}
                        className="animate-pulse"
                    />
                );
            })}

            {/* Labels */}
            {data.map((s, i) => {
                const { x, y } = getLabelPoint(i);
                return (
                    <g key={i}>
                        <text
                            x={x}
                            y={y - 3}
                            textAnchor="middle"
                            className="text-[5px] fill-slate-300 font-serif font-bold tracking-widest"
                        >
                            {s.name}
                        </text>
                        <text
                            x={x}
                            y={y + 3}
                            textAnchor="middle"
                            className={`text-[6px] font-mono font-bold ${s.value >= 10 ? 'fill-emerald-400' : 'fill-slate-400'}`}
                        >
                            {s.value}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
};
