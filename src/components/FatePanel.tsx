import type { FC } from 'react';
import { Sparkles, Star } from 'lucide-react';
import type { FateEntry, FateGrade, FortuneBuff, Talent } from '../types';
import { FATE_GRADE_COLORS, FATE_GRADE_NAMES } from '../types';

interface FatePanelProps {
    fate: FateEntry[];
    fortuneBuffs: FortuneBuff[];
    talents?: Talent[];
}

const GradeBadge: FC<{ grade: FateGrade; name: string; small?: boolean }> = ({ grade, name, small }) => {
    const color = FATE_GRADE_COLORS[grade];
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border ${small ? 'px-2 py-1 text-[11px]' : 'px-2.5 py-1 text-xs'}`}
            style={{ borderColor: `${color}55`, backgroundColor: `${color}14` }}
        >
            <span className="font-bold" style={{ color }}>
                {FATE_GRADE_NAMES[grade]}
            </span>
            <span className="font-medium" style={{ color }}>
                {name}
            </span>
        </span>
    );
};

const EmptyBlock: FC<{ title: string }> = ({ title }) => (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
        {title}
    </div>
);

export const FatePanel: FC<FatePanelProps> = ({ fate = [], fortuneBuffs = [], talents = [] }) => {
    return (
        <div className="space-y-4">
            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    <div className="text-sm font-semibold text-slate-800">先天底色</div>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="mb-2 text-[11px] tracking-[0.22em] text-slate-500">先天天赋</div>
                        {talents.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {talents.map((talent) => (
                                    <div key={talent.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                                        <GradeBadge grade={talent.grade as FateGrade} name={talent.name} />
                                        <div className="mt-2 text-xs leading-5 text-slate-500">{talent.description}</div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyBlock title="暂无先天天赋" />
                        )}
                    </div>

                    <div>
                        <div className="mb-2 text-[11px] tracking-[0.22em] text-slate-500">先天命格</div>
                        {fate.length > 0 ? (
                            <div className="grid gap-3 sm:grid-cols-2">
                                {fate.map((entry) => (
                                    <div key={entry.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                        <GradeBadge grade={entry.grade} name={entry.name} />
                                        <div className="mt-2 text-xs leading-5 text-slate-600">{entry.description}</div>
                                        {entry.effects && Object.keys(entry.effects).length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {Object.entries(entry.effects).map(([key, value]) => (
                                                    <span key={key} className={`rounded-full px-2 py-1 text-[11px] font-mono ${value > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                        {key} {value > 0 ? '+' : ''}{value}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <EmptyBlock title="命格未定" />
                        )}
                    </div>
                </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-sky-500" />
                    <div className="text-sm font-semibold text-slate-800">后天气运</div>
                </div>
                {fortuneBuffs.length > 0 ? (
                    <div className="space-y-3">
                        {fortuneBuffs.map((buff) => (
                            <div key={buff.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <GradeBadge grade={buff.grade} name={buff.name} small />
                                    <div className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-mono text-slate-600">
                                        {buff.remainingMonths}/{buff.durationMonths} 月
                                    </div>
                                </div>
                                <div className="mt-2 text-xs leading-5 text-slate-600">{buff.description}</div>
                                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                                    <div
                                        className="h-full rounded-full"
                                        style={{
                                            width: `${Math.max(0, Math.min(100, (buff.remainingMonths / Math.max(1, buff.durationMonths)) * 100))}%`,
                                            backgroundColor: FATE_GRADE_COLORS[buff.grade],
                                        }}
                                    />
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {Object.entries(buff.effects).map(([key, value]) => (
                                        <span key={key} className={`rounded-full px-2 py-1 text-[11px] font-mono ${value > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            {key} {value > 0 ? '+' : ''}{value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyBlock title="暂无气运加持" />
                )}
            </section>
        </div>
    );
};
