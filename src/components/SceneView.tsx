import React from 'react';
import type { SceneData } from '../types/meta';

interface SceneViewProps {
    scene: SceneData;
    onChoice?: (choiceIndex: number) => void;
}

const PositionMap: Record<string, string> = {
    'left': 'left-[10%] bottom-0',
    'center': 'left-1/2 -translate-x-1/2 bottom-0',
    'right': 'right-[10%] bottom-0',
    'left-center': 'left-[30%] bottom-0',
    'right-center': 'right-[30%] bottom-0',
};

export const SceneView: React.FC<SceneViewProps> = ({ scene, onChoice }) => {
    // 1. Background Layer
    const bgStyle = scene.background
        ? { backgroundImage: `url(${scene.background})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : { backgroundColor: '#0f172a' }; // Default slate-950

    const effectClass = scene.effect ? `animate-${scene.effect}` : '';

    return (
        <div className={`relative w-full h-full overflow-hidden select-none ${effectClass}`} style={bgStyle}>
            {/* Overlay Gradient for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* 2. Character Layer */}
            <div className="absolute inset-x-0 bottom-0 h-4/5 pointer-events-none flex items-end justify-center z-10 px-8">
                {scene.characters.map((char) => (
                    <div
                        key={char.id}
                        className={`absolute transition-all duration-500 ease-in-out ${PositionMap[char.position] || PositionMap['center']}`}
                        style={{ height: '85%' }} // Fixed height for sprites
                    >
                        {/* Placeholder Sprite if no image */}
                        {char.image ? (
                            <img src={char.image} alt={char.name} className="h-full object-contain filter drop-shadow-2xl" />
                        ) : (
                            <div className="h-full w-64 bg-slate-700/50 border-2 border-slate-500/50 backdrop-blur-sm flex items-center justify-center rounded-t-xl">
                                <span className="text-4xl opacity-50">👤</span>
                            </div>
                        )}

                        {/* Name Tag (Optional debug) */}
                        {/* <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded">{char.name || char.id}</div> */}
                    </div>
                ))}
            </div>

            {/* 3. Dialogue Layer */}
            <div className="absolute bottom-0 w-full p-6 z-20 flex flex-col items-center">
                {scene.dialogue && (
                    <div className="w-full max-w-4xl glass-panel p-6 rounded-xl animate-slide-up relative overflow-hidden group">
                        {/* Decorative Corner */}
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/5 to-transparent pointer-events-none"></div>

                        {/* Speaker Name */}
                        <div className="mb-3 flex items-center gap-3">
                            <span className="text-gold font-bold text-xl font-serif tracking-widest text-glow">
                                {scene.dialogue.speaker}
                            </span>
                            <div className="h-px flex-1 bg-gradient-to-r from-gold/50 to-transparent"></div>
                        </div>

                        {/* Content */}
                        <div className="text-slate-700 text-lg leading-relaxed font-serif min-h-[4rem] drop-shadow-md">
                            {scene.dialogue.content}
                        </div>
                    </div>
                )}

                {/* 4. Choices Layer */}
                {scene.choices && scene.choices.length > 0 && (
                    <div className="flex flex-col gap-3 mt-6 w-full max-w-xl animate-fade-in">
                        {scene.choices.map((choice, idx) => (
                            <button
                                key={idx}
                                onClick={() => onChoice && onChoice(idx)}
                                className="w-full py-4 px-8 glass-card rounded text-slate-700 hover:text-white hover:border-jade/50 font-serif text-lg tracking-widest relative overflow-hidden group uppercase"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-jade">❖</span>
                                    {choice.text}
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-jade">❖</span>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
