import React, { useState } from 'react';
import { BookOpen, HeartPulse, ShieldHalf, Sparkles, SquareDashed, Swords } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { SKILLS } from '../../data/skills';
import { AchievementSystem } from '../../engine/systems/AchievementSystem';

interface SkillsPanelProps {
    onClose: () => void;
}

const TYPE_META: Record<string, { color: string; bg: string; border: string; label: string; icon: React.ElementType }> = {
    ATTACK: { color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200', label: '攻击', icon: Swords },
    HEAL: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', label: '治疗', icon: HeartPulse },
    BUFF: { color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', label: '增益', icon: Sparkles },
    DEFENSE: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', label: '防御', icon: ShieldHalf },
};

const ELEMENT_LABELS: Record<string, string> = {
    PHYSICAL: '物理',
    MAGICAL: '灵术',
    TRUE: '真伤',
    LIGHTNING: '雷',
};

function getSkillMeta(type: string) {
    return TYPE_META[type] || { color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200', label: type, icon: BookOpen };
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ onClose }) => {
    const { gameState, engine } = useGameStore();
    const { learnedSkills, equippedSkills, battleStats } = gameState;

    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
    const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const syncState = () => {
        AchievementSystem.checkAll(engine);
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleEquipSkill = (skillId: string, slotIndex: number) => {
        const result = engine.equipSkill(skillId, slotIndex);
        if (result.success) {
            setSelectedSlot(null);
            syncState();
            setActionMessage({ type: 'success', text: '法术已装备。' });
        } else {
            setActionMessage({ type: 'error', text: result.message });
        }
    };

    const handleUnequipSkill = (slotIndex: number) => {
        const result = engine.unequipSkill(slotIndex);
        if (result.success) {
            if (selectedSlot === slotIndex) setSelectedSlot(null);
            syncState();
            setActionMessage({ type: 'success', text: '法术已卸下。' });
        } else {
            setActionMessage({ type: 'error', text: result.message });
        }
    };

    const isSlotSelected = selectedSlot !== null;
    const selectedSkillDef = isSlotSelected
        ? (equippedSkills[selectedSlot ?? 0] ? SKILLS[equippedSkills[selectedSlot ?? 0] as string] : null)
        : (selectedSkill ? SKILLS[selectedSkill] : null);

    const renderSlot = (index: number) => {
        const skillId = equippedSkills[index];
        const skill = skillId ? SKILLS[skillId] : null;
        const selected = selectedSlot === index;
        const meta = getSkillMeta(skill?.type || '');
        const Icon = skill ? meta.icon : SquareDashed;

        return (
            <button
                key={index}
                onClick={() => {
                    setSelectedSkill(null);
                    setSelectedSlot(index);
                }}
                className={`w-full rounded-[24px] border p-4 text-left transition-all ${selected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : `bg-white hover:bg-slate-50 ${skill ? meta.border : 'border-slate-200'}`}`}
            >
                <div className="mb-2 text-[11px] tracking-[0.2em] text-slate-500">法术位 {index + 1}</div>
                <div className="flex items-center gap-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${skill ? meta.border : 'border-slate-200'} ${skill ? meta.bg : 'bg-slate-50'}`}>
                        <Icon className={`h-5 w-5 ${skill ? meta.color : 'text-slate-400'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className={`truncate text-sm font-semibold ${skill ? meta.color : 'text-slate-500'}`}>
                            {skill ? skill.name : '未装备'}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">{skill ? meta.label : '点击后可卸下或覆盖'}</div>
                    </div>
                </div>
            </button>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="flex h-[84vh] w-full max-w-7xl overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] shadow-[0_40px_120px_rgba(15,23,42,0.32)]">
                <aside className="flex w-full max-w-[320px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/80 p-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-indigo-200 bg-indigo-50">
                                <BookOpen className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <div className="text-lg font-semibold text-slate-800">功法与法术</div>
                                <div className="mt-1 text-sm text-slate-500">统一管理已领悟能力</div>
                            </div>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <div className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3">
                                <div className="text-[11px] tracking-[0.2em] text-sky-700">法术上限</div>
                                <div className="mt-2 text-lg font-semibold text-sky-800">4 个</div>
                            </div>
                            <div className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-3">
                                <div className="text-[11px] tracking-[0.2em] text-violet-700">MAX MP</div>
                                <div className="mt-2 text-lg font-mono font-semibold text-violet-800">{battleStats.MAX_MP}</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {[0, 1, 2, 3].map(renderSlot)}
                    </div>
                </aside>

                <section className="flex min-w-0 flex-1 flex-col">
                    <div className="border-b border-slate-200 bg-white px-6 py-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <div className="text-[11px] tracking-[0.24em] text-slate-400">能力管理</div>
                                <div className="mt-2 text-2xl font-semibold text-slate-900">已领悟法术</div>
                            </div>
                            <button onClick={onClose} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 transition-colors hover:border-red-200 hover:text-red-500">
                                关闭
                            </button>
                        </div>
                    </div>

                    {actionMessage && (
                        <div className={`mx-6 mt-4 rounded-2xl border px-4 py-3 text-sm ${actionMessage.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                            {actionMessage.text}
                        </div>
                    )}

                    <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_340px]">
                        <div className="custom-scrollbar overflow-y-auto p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="text-sm text-slate-500">共领悟 {learnedSkills.length} 门法术</div>
                                <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">点击法术查看详情或装备</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
                                {learnedSkills.map((skillId) => {
                                    const skill = SKILLS[skillId];
                                    if (!skill) return null;
                                    const selected = selectedSkill === skillId && !isSlotSelected;
                                    const equipped = equippedSkills.includes(skillId);
                                    const meta = getSkillMeta(skill.type);
                                    const Icon = meta.icon;

                                    return (
                                        <button
                                            key={skillId}
                                            onClick={() => {
                                                setSelectedSlot(null);
                                                setSelectedSkill(skillId);
                                            }}
                                            className={`relative rounded-[28px] border p-4 text-left transition-all ${selected ? 'border-indigo-300 bg-indigo-50 shadow-sm' : `${meta.border} ${meta.bg} hover:shadow-sm`}`}
                                        >
                                            {equipped && (
                                                <div className="absolute right-3 top-3 rounded-full border border-indigo-200 bg-white px-2 py-1 text-[10px] text-indigo-700">
                                                    已装备
                                                </div>
                                            )}
                                            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border bg-white ${meta.border}`}>
                                                <Icon className={`h-6 w-6 ${meta.color}`} />
                                            </div>
                                            <div className={`mt-4 text-sm font-semibold ${meta.color}`}>{skill.name}</div>
                                            <div className="mt-1 text-xs text-slate-500">{meta.label} · {skill.target}</div>
                                        </button>
                                    );
                                })}

                                {learnedSkills.length === 0 && (
                                    <div className="col-span-full rounded-[28px] border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
                                        <div className="text-lg font-semibold text-slate-700">暂未领悟法术</div>
                                        <div className="mt-2 text-sm text-slate-500">后续通过剧情、宗门与奇遇可以逐步解锁。</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="border-l border-slate-200 bg-slate-50/80 p-6">
                            {selectedSkillDef ? (
                                <div className="flex h-full flex-col">
                                    {(() => {
                                        const meta = getSkillMeta(selectedSkillDef.type);
                                        const Icon = meta.icon;
                                        return (
                                            <>
                                                <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                                    <div className={`flex h-20 w-20 items-center justify-center rounded-[24px] border ${meta.border} ${meta.bg}`}>
                                                        <Icon className={`h-10 w-10 ${meta.color}`} />
                                                    </div>
                                                    <div className={`mt-4 text-2xl font-semibold ${meta.color}`}>{selectedSkillDef.name}</div>
                                                    <div className="mt-2 flex flex-wrap gap-2">
                                                        <span className={`rounded-full border px-3 py-1 text-xs ${meta.border} ${meta.bg} ${meta.color}`}>{meta.label}</span>
                                                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{selectedSkillDef.target}</span>
                                                    </div>
                                                    <div className="mt-4 text-sm leading-6 text-slate-600">{selectedSkillDef.description}</div>
                                                </div>

                                                <div className="mt-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                                                    <div className="mb-3 text-sm font-semibold text-slate-800">法术参数</div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                            <div className="text-[11px] text-slate-500">消耗类型</div>
                                                            <div className="mt-2 text-sm font-mono text-slate-800">{selectedSkillDef.costType}</div>
                                                        </div>
                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                            <div className="text-[11px] text-slate-500">消耗数值</div>
                                                            <div className="mt-2 text-sm font-mono text-slate-800">{selectedSkillDef.costAmount}</div>
                                                        </div>
                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                            <div className="text-[11px] text-slate-500">调息</div>
                                                            <div className="mt-2 text-sm font-mono text-slate-800">{selectedSkillDef.cooldown}</div>
                                                        </div>
                                                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                            <div className="text-[11px] text-slate-500">伤害属性</div>
                                                            <div className="mt-2 text-sm font-mono text-slate-800">{ELEMENT_LABELS[selectedSkillDef.damageType || ''] || (selectedSkillDef.damageType || '无')}</div>
                                                        </div>
                                                        {selectedSkillDef.powerMultiplier && (
                                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                                <div className="text-[11px] text-slate-500">威力倍率</div>
                                                                <div className="mt-2 text-sm font-mono text-slate-800">x{selectedSkillDef.powerMultiplier}</div>
                                                            </div>
                                                        )}
                                                        {selectedSkillDef.healMultiplier && (
                                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                                <div className="text-[11px] text-slate-500">治疗倍率</div>
                                                                <div className="mt-2 text-sm font-mono text-slate-800">x{selectedSkillDef.healMultiplier}</div>
                                                            </div>
                                                        )}
                                                        {selectedSkillDef.flatDamage && (
                                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                                                                <div className="text-[11px] text-slate-500">固定伤害</div>
                                                                <div className="mt-2 text-sm font-mono text-slate-800">+{selectedSkillDef.flatDamage}</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}

                                    <div className="mt-auto pt-4">
                                        {isSlotSelected ? (
                                            <button
                                                className="w-full rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-500"
                                                onClick={() => handleUnequipSkill(selectedSlot)}
                                            >
                                                卸下法术
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                {!equippedSkills.includes(selectedSkillDef.id) ? (
                                                    <>
                                                        <div className="text-center text-xs text-slate-500">选择一个法术位进行装备</div>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            {[0, 1, 2, 3].map((slot) => (
                                                                <button
                                                                    key={slot}
                                                                    onClick={() => handleEquipSkill(selectedSkillDef.id, slot)}
                                                                    className={`rounded-2xl px-3 py-3 text-sm font-semibold transition-colors ${equippedSkills[slot] ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                                                                >
                                                                    {slot + 1}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <button className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500" disabled>
                                                        该法术已装备
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-full flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-200 bg-white px-6 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-[24px] border border-slate-200 bg-slate-50">
                                        <BookOpen className="h-7 w-7 text-slate-400" />
                                    </div>
                                    <div className="mt-4 text-lg font-semibold text-slate-700">选择法术查看详情</div>
                                    <div className="mt-2 text-sm leading-6 text-slate-500">左侧管理装备栏，中间挑选法术，右侧查看效果并执行装备操作。</div>
                                </div>
                            )}
                        </aside>
                    </div>
                </section>
            </div>
        </div>
    );
};
