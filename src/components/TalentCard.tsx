import type { Talent } from '../types';

interface TalentCardProps {
    talent: Talent;
    selected: boolean;
    onClick: () => void;
}

// 品阶配置 - 亮色主题适配
const GRADE_STYLES = {
    1: {
        label: '凡品',
        border: 'border-slate-200',
        borderSelected: 'border-slate-400',
        bg: 'bg-white',
        bgSelected: 'bg-slate-50',
        glow: '',
        glowSelected: 'shadow-md',
        labelBg: 'bg-slate-100 text-slate-600 border border-slate-200',
        titleColor: 'text-slate-700',
        descColor: 'text-slate-500',
        icon: '◇',
        accent: 'bg-slate-400',
    },
    2: {
        label: '稀有',
        border: 'border-sky-200',
        borderSelected: 'border-sky-400',
        bg: 'bg-sky-50/40',
        bgSelected: 'bg-sky-50',
        glow: '',
        glowSelected: 'shadow-md shadow-sky-200/50',
        labelBg: 'bg-sky-50 text-sky-700 border border-sky-200',
        titleColor: 'text-sky-700',
        descColor: 'text-sky-600/70',
        icon: '◆',
        accent: 'bg-sky-500',
    },
    3: {
        label: '史诗',
        border: 'border-purple-200',
        borderSelected: 'border-purple-400',
        bg: 'bg-purple-50/40',
        bgSelected: 'bg-purple-50',
        glow: '',
        glowSelected: 'shadow-md shadow-purple-200/50',
        labelBg: 'bg-purple-50 text-purple-700 border border-purple-200',
        titleColor: 'text-purple-700',
        descColor: 'text-purple-600/70',
        icon: '✦',
        accent: 'bg-purple-500',
    },
    4: {
        label: '传说',
        border: 'border-amber-200',
        borderSelected: 'border-amber-400',
        bg: 'bg-amber-50/40',
        bgSelected: 'bg-amber-50',
        glow: '',
        glowSelected: 'shadow-md shadow-amber-200/50',
        labelBg: 'bg-amber-50 text-amber-700 border border-amber-200',
        titleColor: 'text-amber-700',
        descColor: 'text-amber-600/70',
        icon: '★',
        accent: 'bg-amber-500',
    },
    5: {
        label: '传说',
        border: 'border-orange-200',
        borderSelected: 'border-orange-400',
        bg: 'bg-orange-50/40',
        bgSelected: 'bg-orange-50',
        glow: '',
        glowSelected: 'shadow-md shadow-orange-200/50',
        labelBg: 'bg-orange-50 text-orange-700 border border-orange-200',
        titleColor: 'text-orange-700',
        descColor: 'text-orange-600/70',
        icon: '☀',
        accent: 'bg-orange-500',
    },
    6: {
        label: '神话',
        border: 'border-rose-200',
        borderSelected: 'border-rose-400',
        bg: 'bg-rose-50/40',
        bgSelected: 'bg-rose-50',
        glow: '',
        glowSelected: 'shadow-md shadow-rose-200/50',
        labelBg: 'bg-rose-50 text-rose-700 border border-rose-200',
        titleColor: 'text-rose-700',
        descColor: 'text-rose-600/70',
        icon: '👑',
        accent: 'bg-rose-500',
    },
} as const;

export const TalentCard = ({ talent, selected, onClick }: TalentCardProps) => {
    const style = GRADE_STYLES[talent.grade as keyof typeof GRADE_STYLES] || GRADE_STYLES[1];

    return (
        <div
            onClick={onClick}
            className={`
                relative group cursor-pointer rounded-xl overflow-hidden
                flex flex-col min-h-[180px] p-5
                ${selected ? style.bgSelected : style.bg}
                border transition-all duration-300
                ${selected
                    ? `${style.borderSelected} ${style.glowSelected} scale-[1.02]`
                    : `${style.border} ${style.glow} hover:scale-[1.01] hover:shadow-md`
                }
            `}
        >
            {/* 顶部：品阶标签 + 选中标记 */}
            <div className="flex items-center justify-between mb-3">
                <div className={`text-xs font-mono px-2.5 py-1 rounded-md ${style.labelBg} tracking-wider flex items-center gap-1 text-outlined`}>
                    <span>{style.icon}</span>
                    <span>{style.label}</span>
                </div>
                {selected && (
                    <div className="flex items-center gap-1.5 text-emerald-600 animate-fade-in">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs font-serif font-bold tracking-wider">已选</span>
                    </div>
                )}
            </div>

            {/* 命格名称 */}
            <h3 className={`text-xl font-bold mb-3 tracking-widest leading-tight ${style.titleColor} transition-colors text-outlined-strong`} style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                {talent.name}
            </h3>

            {/* 命格描述 */}
            <p className={`text-sm ${style.descColor} font-serif leading-relaxed flex-1 group-hover:opacity-100 transition-opacity text-outlined`}>
                {talent.description}
            </p>

            {/* 底部装饰线 */}
            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 tracking-wider"></span>
                <div className="flex gap-1.5">
                    {Array.from({ length: talent.grade }).map((_, i) => (
                        <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${style.accent}`}
                        />
                    ))}
                </div>
            </div>

            {/* 选中时的边缘发光效果 */}
            {selected && (
                <div className="absolute inset-0 rounded-xl pointer-events-none border-2 border-emerald-400/30 animate-pulse" />
            )}
        </div>
    );
};
