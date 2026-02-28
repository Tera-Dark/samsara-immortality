import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { SKILLS } from '../../data/skills';

interface SkillsPanelProps {
    onClose: () => void;
}

const TYPE_COLORS: Record<string, string> = {
    'ATTACK': '#ef4444', // red
    'HEAL': '#10b981', // emerald
    'BUFF': '#3b82f6', // blue
    'DEFENSE': '#f59e0b', // amber
};

const ELEMENT_COLORS: Record<string, string> = {
    'PHYSICAL': '#a3a3a3',
    'MAGICAL': '#8b5cf6',
    'TRUE': '#facc15',
    'LIGHTNING': '#38bdf8',
};

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ onClose }) => {
    const { gameState, engine } = useGameStore();
    const { learnedSkills, equippedSkills, battleStats } = gameState;

    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

    const syncState = () => {
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleEquipSkill = (skillId: string, slotIndex: number) => {
        const res = engine.equipSkill(skillId, slotIndex);
        if (res.success) {
            setSelectedSlot(null);
            syncState();
        } else {
            alert(res.message);
        }
    };

    const handleUnequipSkill = (slotIndex: number) => {
        const res = engine.unequipSkill(slotIndex);
        if (res.success) {
            if (selectedSlot === slotIndex) setSelectedSlot(null);
            syncState();
        } else {
            alert(res.message);
        }
    };

    const isSlotSelected = selectedSlot !== null;
    let selectedSkillDef = null;

    if (isSlotSelected) {
        const eqId = equippedSkills[selectedSlot];
        if (eqId) {
            selectedSkillDef = SKILLS[eqId];
        }
    } else if (selectedSkill) {
        selectedSkillDef = SKILLS[selectedSkill];
    }

    const renderSkillSlot = (index: number) => {
        const skillId = equippedSkills[index];
        const skill = skillId ? SKILLS[skillId] : null;
        const isSelected = selectedSlot === index;

        return (
            <div className="mb-4">
                <div className="text-xs text-slate-500 mb-1 pl-1">法术位 {index + 1}</div>
                <div
                    className={`h-16 bg-slate-800 border-2 rounded cursor-pointer relative group transition-all flex items-center px-4
                        ${isSelected ? 'border-amber-500 bg-slate-700' : 'border-slate-200 hover:border-slate-500'}
                    `}
                    onClick={() => {
                        setSelectedSkill(null);
                        setSelectedSlot(index);
                    }}
                    style={{ borderColor: isSelected ? undefined : (skill ? TYPE_COLORS[skill.type] : undefined) }}
                >
                    <div className="text-2xl mr-4 opacity-80">
                        {skill ? (skill.type === 'ATTACK' ? '⚔️' : skill.type === 'HEAL' ? '💚' : '🛡️') : '🈳'}
                    </div>
                    <div className="flex-1 overflow-hidden">
                        {skill ? (
                            <div className="truncate text-sm font-bold" style={{ color: TYPE_COLORS[skill.type] }}>{skill.name}</div>
                        ) : (
                            <div className="text-slate-500 text-sm">未装备</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center catch-events z-50 animate-fade-in">
            <div className="w-[1000px] h-[650px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-800/50">
                    <h2 className="text-xl font-bold text-amber-500 tracking-wider">功法 & 法术</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        关闭 (Esc)
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Left Panel: Equipped Slots */}
                    <div className="w-64 border-r border-slate-200 bg-slate-800/20 p-6 flex flex-col overflow-y-auto">
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-bold text-slate-700 mb-2">出战法术</h3>
                            <p className="text-xs text-slate-400">最多可装备4个主动法术</p>
                            <p className="text-xs text-blue-400 mt-1">
                                MAX MP: {battleStats.MAX_MP}
                            </p>
                        </div>
                        {renderSkillSlot(0)}
                        {renderSkillSlot(1)}
                        {renderSkillSlot(2)}
                        {renderSkillSlot(3)}
                    </div>

                    {/* Middle Panel: Learned Skills Grid */}
                    <div className="flex-1 flex flex-col">
                        <div className="px-6 pt-6 pb-2 border-b border-slate-200 flex justify-between items-end">
                            <h3 className="text-lg font-bold text-slate-600">已领悟功法</h3>
                            <span className="text-xs text-slate-500">共 {learnedSkills.length} 门</span>
                        </div>
                        <div className="flex-1 p-6 overflow-y-auto grid grid-cols-4 gap-4 content-start">
                            {learnedSkills.map((skillId, idx) => {
                                const skill = SKILLS[skillId];
                                if (!skill) return null;
                                const isSelected = selectedSkill === skillId && !isSlotSelected;
                                const isEquipped = equippedSkills.includes(skillId);

                                return (
                                    <div
                                        key={idx}
                                        className={`aspect-square bg-slate-800 border-2 rounded-lg cursor-pointer relative group transition-all flex flex-col items-center justify-center
                                            ${isSelected ? 'border-amber-500 bg-slate-700 scale-105 shadow-lg z-10' : 'border-slate-200 hover:border-slate-500'}
                                        `}
                                        onClick={() => {
                                            setSelectedSlot(null);
                                            setSelectedSkill(skillId);
                                        }}
                                        style={{ borderColor: isSelected ? undefined : TYPE_COLORS[skill.type] }}
                                    >
                                        {isEquipped && (
                                            <div className="absolute top-1 right-1 text-[10px] font-bold text-white bg-indigo-500/80 px-1.5 rounded shadow">
                                                已装备
                                            </div>
                                        )}
                                        <div className="text-4xl mb-2 opacity-80">
                                            {skill.type === 'ATTACK' ? '⚔️' : skill.type === 'HEAL' ? '💚' : '🛡️'}
                                        </div>
                                        <div className="text-sm font-bold truncate px-2 w-full text-center" style={{ color: TYPE_COLORS[skill.type] }}>
                                            {skill.name}
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest">
                                            {skill.type}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Empty placeholders */}
                            {Array.from({ length: Math.max(0, 16 - learnedSkills.length) }).map((_, i) => (
                                <div key={`empty-${i}`} className="aspect-square bg-white border border-slate-200 rounded-lg opacity-30"></div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel: Details */}
                    <div className="w-80 border-l border-slate-200 bg-slate-800/30 p-6 flex flex-col relative shadow-[-10px_0_20px_rgba(0,0,0,0.2)]">
                        {selectedSkillDef ? (
                            <>
                                <div className="text-5xl mb-6 text-center drop-shadow-lg mt-4">
                                    {selectedSkillDef.type === 'ATTACK' ? '⚔️' : selectedSkillDef.type === 'HEAL' ? '💚' : '🛡️'}
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-center drop-shadow" style={{ color: TYPE_COLORS[selectedSkillDef.type] }}>
                                    {selectedSkillDef.name}
                                </h3>
                                <div className="text-xs text-slate-400 mb-6 uppercase tracking-widest text-center">
                                    {selectedSkillDef.type} · {selectedSkillDef.target}
                                </div>

                                <div className="bg-white/80 p-4 border border-slate-200 rounded-lg mb-6">
                                    <div className="text-sm text-slate-600 leading-relaxed min-h-[60px]">
                                        {selectedSkillDef.description}
                                    </div>

                                    <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 mb-1">消耗类型</span>
                                            <span className="text-slate-600 font-mono">{selectedSkillDef.costType}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 mb-1">消耗数值</span>
                                            <span className="text-blue-400 font-mono">{selectedSkillDef.costAmount}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-slate-500 mb-1">调息(回合)</span>
                                            <span className="text-rose-400 font-mono">{selectedSkillDef.cooldown}</span>
                                        </div>
                                        {selectedSkillDef.damageType && (
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 mb-1">威力属性</span>
                                                <span className="font-mono" style={{ color: ELEMENT_COLORS[selectedSkillDef.damageType] || '#fff' }}>
                                                    {selectedSkillDef.damageType}
                                                </span>
                                            </div>
                                        )}
                                        {selectedSkillDef.powerMultiplier && (
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 mb-1">威力倍率</span>
                                                <span className="text-emerald-400 font-mono">x{selectedSkillDef.powerMultiplier}</span>
                                            </div>
                                        )}
                                        {selectedSkillDef.flatDamage && (
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 mb-1">固定伤害</span>
                                                <span className="text-emerald-400 font-mono">+{selectedSkillDef.flatDamage}</span>
                                            </div>
                                        )}
                                        {selectedSkillDef.healMultiplier && (
                                            <div className="flex flex-col">
                                                <span className="text-slate-500 mb-1">治疗倍率</span>
                                                <span className="text-emerald-400 font-mono">x{selectedSkillDef.healMultiplier}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1"></div>

                                {/* Action Buttons */}
                                {isSlotSelected ? (
                                    <button
                                        className="w-full py-3 rounded-lg font-bold transition-all bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-900/20"
                                        onClick={() => handleUnequipSkill(selectedSlot)}
                                    >
                                        卸下法术
                                    </button>
                                ) : (
                                    <>
                                        {!equippedSkills.includes(selectedSkillDef.id) ? (
                                            <div className="flex flex-col gap-2">
                                                <div className="text-xs text-slate-500 text-center mb-1">选择一个法术位装备</div>
                                                <div className="grid grid-cols-4 gap-2">
                                                    {[0, 1, 2, 3].map(slot => (
                                                        <button
                                                            key={slot}
                                                            className={`py-2 rounded font-bold transition-all text-sm
                                                                ${equippedSkills[slot]
                                                                    ? 'bg-slate-700 hover:bg-rose-600 text-white border border-slate-600'
                                                                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg border border-indigo-500'}
                                                            `}
                                                            onClick={() => handleEquipSkill(selectedSkillDef!.id, slot)}
                                                            title={equippedSkills[slot] ? '覆盖当前法术' : '装备法术'}
                                                        >
                                                            {slot + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                className="w-full py-3 rounded-lg font-bold transition-all bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600"
                                                disabled
                                            >
                                                已装备
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                                <span className="text-4xl mb-4 opacity-50">✦</span>
                                <span className="text-sm tracking-widest">选择法术查看详情</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
