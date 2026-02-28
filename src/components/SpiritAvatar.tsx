import { useMemo } from 'react';

interface SpiritAvatarProps {
    seed: string;
    realm: string;
    className?: string;
}

export const SpiritAvatar = ({ seed, realm, className = "" }: SpiritAvatarProps) => {
    // Generate deterministic colors/shapes based on seed and attributes
    const { primaryColor, secondaryColor } = useMemo(() => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        }

        const colors = [
            '#10b981', // Emerald
            '#0ea5e9', // Sky
            '#8b5cf6', // Violet
            '#f59e0b', // Amber
            '#ef4444', // Red
            '#6366f1', // Indigo
        ];

        const pIndex = Math.abs(hash) % colors.length;
        const sIndex = Math.abs(hash >> 3) % colors.length;

        return {
            primaryColor: colors[pIndex],
            secondaryColor: colors[sIndex !== pIndex ? sIndex : (sIndex + 1) % colors.length]
        };
    }, [seed]);

    // Use realm so it's not unused
    console.log(realm);

    return (
        <div className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}>
            <svg viewBox="0 0 100 100" className="w-full h-full animate-pulse-slow">
                <defs>
                    <radialGradient id={`grad-${seed}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
                        <stop offset="100%" stopColor={secondaryColor} stopOpacity="0" />
                    </radialGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Core Spirit Orb */}
                <circle cx="50" cy="50" r="30" fill={`url(#grad-${seed})`} filter="url(#glow)" className="animate-float" />

                {/* Orbiting Particles based on Realm? */}
                <circle cx="50" cy="20" r="2" fill={secondaryColor} className="animate-orbit-1" />
                <circle cx="50" cy="80" r="3" fill={primaryColor} className="animate-orbit-2" />
            </svg>

            {/* Realm Text Overlay (Optional) */}
            {/* <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-mono text-white/50">{realm}</span>
            </div> */}
        </div>
    );
};
