import { useState } from 'react';
import { TypewriterText } from './TypewriterText';

export interface NarrativeEvent {
    id: string;
    title?: string;
    content: string[]; // 每段话一个字符串
    theme?: 'default' | 'breakthrough' | 'danger' | 'fortune';
    buttonText?: string;
    onClose?: () => void;
}

interface NarrativeOverlayProps {
    event: NarrativeEvent | null;
    onClose?: () => void;
}

export function NarrativeOverlay({ event, onClose }: NarrativeOverlayProps) {
    const [currentParagraphIndex, setCurrentParagraphIndex] = useState(0);
    const [isFullyRevealed, setIsFullyRevealed] = useState(false);

    if (!event) return null;

    const getThemeStyles = () => {
        switch (event.theme) {
            case 'breakthrough':
                return {
                    bg: 'bg-indigo-950/95',
                    title: 'text-indigo-400',
                    text: 'text-indigo-100',
                    border: 'border-indigo-500/30',
                };
            case 'danger':
                return {
                    bg: 'bg-rose-950/95',
                    title: 'text-rose-400',
                    text: 'text-rose-100',
                    border: 'border-rose-500/30',
                };
            case 'fortune':
                return {
                    bg: 'bg-amber-950/95',
                    title: 'text-amber-400',
                    text: 'text-amber-50',
                    border: 'border-amber-500/30',
                };
            default:
                return {
                    bg: 'bg-slate-900/95',
                    title: 'text-slate-300',
                    text: 'text-slate-200',
                    border: 'border-slate-500/30',
                };
        }
    };

    const styles = getThemeStyles();

    const handleParagraphComplete = () => {
        if (currentParagraphIndex < event.content.length - 1) {
            // 下一段
            setTimeout(() => {
                setCurrentParagraphIndex(prev => prev + 1);
            }, 600); // 段落间稍微停顿
        } else {
            setIsFullyRevealed(true);
        }
    };

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-6 ${styles.bg} backdrop-blur-sm transition-all duration-1000 animate-in fade-in`}>
            
            <div className={`max-w-xl w-full flex flex-col items-center justify-center p-8 bg-zinc-950/40 rounded border ${styles.border} shadow-2xl`}>
                
                {event.title && (
                    <div className="mb-10 w-full text-center relative">
                        <div className="absolute inset-x-0 inset-y-1/2 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent"></div>
                        <h2 className={`relative inline-block px-4 bg-transparent text-xl font-serif tracking-widest ${styles.title} drop-shadow-md`}>
                            {event.title}
                        </h2>
                    </div>
                )}

                <div className="w-full flex justify-center items-center">
                    <div className={`font-serif text-lg leading-loose space-y-6 ${styles.text}`}>
                        {event.content.map((paragraph, index) => {
                            // 只渲染到当前允许的段落
                            if (index > currentParagraphIndex) return null;

                            return (
                                <p key={index} className="text-justify indent-8 tracking-wide">
                                    {index === currentParagraphIndex ? (
                                        <TypewriterText 
                                            text={paragraph} 
                                            speed={60} 
                                            onComplete={handleParagraphComplete} 
                                        />
                                    ) : (
                                        <span>{paragraph}</span>
                                    )}
                                </p>
                            );
                        })}
                    </div>
                </div>

                <div className={`mt-16 transition-opacity duration-1000 ${isFullyRevealed ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={() => {
                            if (event.onClose) event.onClose();
                            if (onClose) onClose();
                        }}
                        disabled={!isFullyRevealed}
                        className={`px-8 py-2 border rounded ${styles.border} ${styles.title} hover:bg-white/5 transition-colors font-serif tracking-widest`}
                    >
                        {event.buttonText || '继续'}
                    </button>
                </div>
            </div>
        </div>
    );
}
