import { useState, useEffect } from 'react';

interface TypewriterTextProps {
    text: string;
    speed?: number; // 毫秒/字
    delay?: number; // 初始延迟
    onComplete?: () => void;
    className?: string;
}

export function TypewriterText({ text, speed = 50, delay = 0, onComplete, className = '' }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText('');
        setIsComplete(false);

        if (!text) return;

        let currentIndex = 0;
        let timeoutId: ReturnType<typeof setInterval>;

        const startTyping = () => {
            timeoutId = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText((prev) => prev + text.charAt(currentIndex));
                    currentIndex++;
                } else {
                    clearInterval(timeoutId);
                    setIsComplete(true);
                    if (onComplete) onComplete();
                }
            }, speed);
        };

        const initialDelayId = setTimeout(startTyping, delay);

        return () => {
            clearTimeout(initialDelayId);
            clearInterval(timeoutId);
        };
    }, [text, speed, delay, onComplete]);

    return (
        <span className={`${className} ${!isComplete ? "after:content-['|'] after:animate-pulse after:ml-0.5" : ''}`}>
            {displayedText}
        </span>
    );
}
