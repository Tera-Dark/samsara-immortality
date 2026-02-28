import type { FC } from 'react';
import type { FateEntry, FortuneBuff, FateGrade, Talent } from '../types';
import { FATE_GRADE_NAMES, FATE_GRADE_COLORS } from '../types';

interface FatePanelProps {
    fate: FateEntry[];
    fortuneBuffs: FortuneBuff[];
    talents?: Talent[];
}

/** 等级色牌组件 */
const GradeBadge: FC<{ grade: FateGrade; name: string; small?: boolean }> = ({ grade, name, small }) => {
    const color = FATE_GRADE_COLORS[grade];
    const gradeName = FATE_GRADE_NAMES[grade];

    return (
        <span
            className={`inline-flex items-center gap-1 rounded ${small ? 'px-1.5 py-0' : 'px-2 py-0.5'}`}
            style={{
                border: `1px solid ${color}50`,
                background: `${color}15`,
            }}
        >
            {/* 等级徽章 */}
            <span
                className={`font-bold ${small ? 'text-[10px]' : 'text-xs'}`}
                style={{
                    color: color,
                    textShadow: `0 0 6px ${color}80`,
                }}
            >
                {gradeName}
            </span>
            {/* 名称 */}
            <span
                className={`font-serif ${small ? 'text-[11px]' : 'text-xs'}`}
                style={{ color: color }}
            >
                {name}
            </span>
        </span>
    );
};

/** 先天命格 + 后天气运面板 */
export const FatePanel: FC<FatePanelProps> = ({ fate = [], fortuneBuffs = [], talents = [] }) => {
    return (
        <div className="space-y-3">
            {/* 先天命格(天赋) */}
            {talents.length > 0 && (
                <div>
                    <div className="text-[10px] text-slate-600 tracking-wider mb-1.5 font-mono">先天天赋</div>
                    <div className="flex flex-wrap gap-1.5">
                        {talents.map(t => {
                            const color = FATE_GRADE_COLORS[t.grade as FateGrade] || '#6b7280';
                            const gradeName = FATE_GRADE_NAMES[t.grade as FateGrade] || '凡';
                            return (
                                <div key={t.id} className="group relative">
                                    <span
                                        className="inline-flex items-center gap-1 rounded px-2 py-0.5"
                                        style={{ border: `1px solid ${color}50`, background: `${color}15` }}
                                    >
                                        <span className="font-bold text-xs" style={{ color, textShadow: `0 0 6px ${color}80` }}>{gradeName}</span>
                                        <span className="font-serif text-xs" style={{ color }}>{t.name}</span>
                                    </span>
                                    <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1
                                        opacity-0 group-hover:opacity-100 pointer-events-none
                                        transition-opacity duration-200
                                        bg-white/95 border border-slate-200 rounded-md px-2.5 py-1.5
                                        min-w-[160px] text-center shadow-xl">
                                        <p className="text-xs text-slate-600 whitespace-nowrap">{t.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 先天命格 */}
            <div>
                <div className="text-[10px] text-slate-600 tracking-wider mb-1.5 font-mono">先天命格</div>
                <div className="flex flex-wrap gap-1.5">
                    {fate.length > 0 ? (
                        fate.map(f => (
                            <div key={f.id} className="group relative">
                                <GradeBadge grade={f.grade} name={f.name} />
                                {/* Hover Tooltip */}
                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1
                                    opacity-0 group-hover:opacity-100 pointer-events-none
                                    transition-opacity duration-200
                                    bg-white/95 border border-slate-200 rounded-md px-2.5 py-1.5
                                    min-w-[160px] text-center shadow-xl">
                                    <p className="text-xs text-slate-600 whitespace-nowrap">{f.description}</p>
                                    {f.effects && Object.keys(f.effects).length > 0 && (
                                        <p className="text-[10px] text-emerald-400/80 mt-0.5">
                                            {Object.entries(f.effects).map(([k, v]) =>
                                                `${k} ${v > 0 ? '+' : ''}${v}`
                                            ).join('  ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-slate-600 italic">命格未定</span>
                    )}
                </div>
            </div>

            {/* 后天气运 */}
            <div>
                <div className="text-[10px] text-slate-600 tracking-wider mb-1.5 font-mono">后天气运</div>
                <div className="space-y-1">
                    {fortuneBuffs.length > 0 ? (
                        fortuneBuffs.map(buff => (
                            <div key={buff.id} className="group relative flex items-center gap-2">
                                <GradeBadge grade={buff.grade} name={buff.name} small />
                                {/* 剩余时间进度条 */}
                                <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(buff.remainingMonths / buff.durationMonths) * 100}%`,
                                            background: FATE_GRADE_COLORS[buff.grade],
                                            opacity: 0.6,
                                        }}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-600 tabular-nums w-10 text-right shrink-0">
                                    {buff.remainingMonths}月
                                </span>
                                {/* Hover Tooltip */}
                                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-1
                                    opacity-0 group-hover:opacity-100 pointer-events-none
                                    transition-opacity duration-200
                                    bg-white/95 border border-slate-200 rounded-md px-2.5 py-1.5
                                    min-w-[180px] text-center shadow-xl">
                                    <p className="text-xs text-slate-600">{buff.description}</p>
                                    <p className="text-[10px] text-amber-400/80 mt-0.5">
                                        {Object.entries(buff.effects).map(([k, v]) =>
                                            `${k} ${v > 0 ? '+' : ''}${v}`
                                        ).join('  ')}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        剩余 {buff.remainingMonths}/{buff.durationMonths} 月
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <span className="text-xs text-slate-600 italic">暂无气运加持</span>
                    )}
                </div>
            </div>
        </div>
    );
};
