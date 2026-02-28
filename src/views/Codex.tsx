import { useState, useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { TALENTS } from '../modules/xianxia/data/talents';
import { EVENTS } from '../modules/xianxia/data/events/index';
import { XianxiaConfig } from '../modules/xianxia/config';
import { CULTIVATION_REALMS, type Tab } from '../types';
import { TalentCard } from '../components/TalentCard';
import { FateGrid } from './codex/FateGrid';
import { RealmsView } from './codex/RealmsView';
import { ALL_QUESTS, MAIN_QUESTS, SIDE_QUESTS, SPECIAL_QUESTS } from '../data/missions';
import type { MissionType } from '../types/missionTypes';


export const Codex = () => {
    const [activeTab, setActiveTab] = useState<Tab>('TALENTS');
    const [searchTerm, setSearchTerm] = useState('');
    const [questFilter, setQuestFilter] = useState<MissionType | 'ALL'>('ALL');
    const { setScene } = useUIStore();

    // 搜索过滤：命格
    const filteredTalents = useMemo(() => {
        if (!searchTerm.trim()) return TALENTS;
        const term = searchTerm.trim().toLowerCase();
        return TALENTS.filter(t =>
            t.name.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term)
        );
    }, [searchTerm]);

    // 搜索过滤：属性
    const filteredStats = useMemo(() => {
        if (!searchTerm.trim()) return XianxiaConfig.stats;
        const term = searchTerm.trim().toLowerCase();
        return XianxiaConfig.stats.filter(s =>
            s.name.toLowerCase().includes(term) ||
            s.id.toLowerCase().includes(term) ||
            (s.description || '').toLowerCase().includes(term)
        );
    }, [searchTerm]);

    // 搜索过滤：任务
    const filteredQuests = useMemo(() => {
        let quests = questFilter === 'ALL' ? ALL_QUESTS
            : questFilter === 'MAIN' ? MAIN_QUESTS
                : questFilter === 'SIDE' ? SIDE_QUESTS
                    : SPECIAL_QUESTS;
        if (searchTerm.trim()) {
            const term = searchTerm.trim().toLowerCase();
            quests = quests.filter(q =>
                q.title.toLowerCase().includes(term) ||
                q.description.toLowerCase().includes(term) ||
                q.id.toLowerCase().includes(term)
            );
        }
        return quests;
    }, [searchTerm, questFilter]);

    // 切换 tab 时清空搜索
    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setSearchTerm('');
        if (tab === 'QUESTS') setQuestFilter('ALL');
    };

    const QUEST_TYPE_LABEL: Record<MissionType, string> = {
        MAIN: '主线',
        SIDE: '支线',
        EVENT: '特殊'
    };
    const QUEST_TYPE_COLOR: Record<MissionType, string> = {
        MAIN: 'text-amber-600 bg-amber-50 border-amber-200',
        SIDE: 'text-sky-600 bg-sky-50 border-sky-200',
        EVENT: 'text-purple-600 bg-purple-50 border-purple-200'
    };

    return (
        <div className="w-full h-full flex flex-col items-center relative overflow-hidden bg-void">
            {/* Background Decor */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-200/50 via-void to-void pointer-events-none"></div>

            {/* Header */}
            <div className="shrink-0 pt-10 pb-4 text-center z-10 w-full flex flex-col items-center bg-gradient-to-b from-void via-void/95 to-transparent">
                <h2 className="text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 tracking-widest text-glow" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                    万象图鉴
                </h2>
                <div className="text-[10px] font-mono text-emerald-500/60 tracking-[0.5em] uppercase mt-1">
                    天道数据观测
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 p-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-sm">
                    {(['TALENTS', 'EVENTS', 'STATS', 'REALMS', 'QUESTS'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-6 py-1.5 rounded-full text-xs font-serif tracking-wider transition-all duration-300 ${activeTab === tab
                                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
                                }`}
                        >
                            {tab === 'TALENTS' && '命格'}
                            {tab === 'EVENTS' && '事件'}
                            {tab === 'STATS' && '属性'}
                            {tab === 'REALMS' && '境界'}
                            {tab === 'QUESTS' && '任务'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full max-w-[1400px] px-6 pb-24 overflow-y-auto no-scrollbar z-10 mx-auto mt-4">

                {/* TALENTS TAB */}
                {activeTab === 'TALENTS' && (
                    <div>
                        {/* 搜索框 */}
                        <div className="mb-5 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="搜索命格（名称或描述）..."
                                className="w-full px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
                                >
                                    ✕
                                </button>
                            )}
                            {searchTerm && (
                                <div className="mt-1 text-xs text-slate-400">
                                    找到 {filteredTalents.length} / {TALENTS.length} 个命格
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredTalents.map(t => (
                                <TalentCard
                                    key={t.id}
                                    talent={t}
                                    selected={false}
                                    onClick={() => { }}
                                />
                            ))}
                        </div>
                        {filteredTalents.length === 0 && searchTerm && (
                            <div className="text-center text-slate-400 py-12 text-sm">没有找到匹配「{searchTerm}」的命格</div>
                        )}
                    </div>
                )}

                {/* EVENTS TAB - Fate Grid */}
                {activeTab === 'EVENTS' && (
                    <FateGrid events={EVENTS} />
                )}

                {/* STATS TAB */}
                {activeTab === 'STATS' && (
                    <div>
                        {/* 搜索框 */}
                        <div className="mb-5 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="搜索属性（名称或描述）..."
                                className="w-full px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
                                >
                                    ✕
                                </button>
                            )}
                            {searchTerm && (
                                <div className="mt-1 text-xs text-slate-400">
                                    找到 {filteredStats.length} / {XianxiaConfig.stats.length} 个属性
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredStats.map(stat => (
                                <div key={stat.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className={`text-xl font-bold font-serif ${stat.color || 'text-slate-800'}`}>
                                            {stat.name}
                                        </h3>
                                        <span className="font-mono text-xs text-slate-400">{stat.id}</span>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-3 min-h-[2.5em]">{stat.description || '暂无描述'}</p>
                                    <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                                        <span className="bg-slate-100 px-2 py-1 rounded">Min: {stat.min ?? '-'}</span>
                                        <span className="bg-slate-100 px-2 py-1 rounded">Max: {stat.max ?? '-'}</span>
                                        <span className="bg-slate-100 px-2 py-1 rounded">Base: {stat.base}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {filteredStats.length === 0 && searchTerm && (
                            <div className="text-center text-slate-400 py-12 text-sm">没有找到匹配「{searchTerm}」的属性</div>
                        )}
                    </div>
                )}

                {/* REALMS TAB */}
                {activeTab === 'REALMS' && (
                    <RealmsView
                        activeRealms={CULTIVATION_REALMS}
                    />
                )}

                {/* QUESTS TAB */}
                {activeTab === 'QUESTS' && (
                    <div>
                        {/* 搜索框 + 分类筛选 */}
                        <div className="mb-5 space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="搜索任务（标题或描述）..."
                                    className="w-full px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-sm"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                            {/* 分类按钮 */}
                            <div className="flex gap-2 items-center">
                                <span className="text-xs text-slate-400 font-serif">分类:</span>
                                {(['ALL', 'MAIN', 'SIDE', 'EVENT'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setQuestFilter(f)}
                                        className={`px-3 py-1 rounded-full text-xs font-serif transition-all border ${questFilter === f
                                            ? (f === 'MAIN' ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                : f === 'SIDE' ? 'bg-sky-50 text-sky-700 border-sky-200'
                                                    : f === 'EVENT' ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        {f === 'ALL' ? `全部 (${ALL_QUESTS.length})` : `${QUEST_TYPE_LABEL[f]} (${f === 'MAIN' ? MAIN_QUESTS.length : f === 'SIDE' ? SIDE_QUESTS.length : SPECIAL_QUESTS.length})`}
                                    </button>
                                ))}
                            </div>
                            {searchTerm && (
                                <div className="text-xs text-slate-400">
                                    找到 {filteredQuests.length} 个任务
                                </div>
                            )}
                        </div>

                        {/* 任务列表 */}
                        <div className="space-y-4">
                            {filteredQuests.map(quest => (
                                <div key={quest.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-slate-300 transition-all">
                                    {/* 标题行 */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${QUEST_TYPE_COLOR[quest.type]}`}>
                                                {QUEST_TYPE_LABEL[quest.type]}
                                            </span>
                                            <h3 className="text-lg font-serif font-bold text-slate-800">{quest.title}</h3>
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400">{quest.id}</span>
                                    </div>

                                    {/* 描述 */}
                                    <p className="text-sm text-slate-600 leading-relaxed mb-4">{quest.description}</p>

                                    {/* 前置条件 */}
                                    {(quest.prereqMissions || quest.minAge !== undefined) && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {quest.minAge !== undefined && (
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                                    最低年龄: {quest.minAge}岁
                                                </span>
                                            )}
                                            {quest.prereqMissions?.map(pre => (
                                                <span key={pre} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                                    前置: {ALL_QUESTS.find(q => q.id === pre)?.title || pre}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* 目标 */}
                                    <div className="mb-3">
                                        <h4 className="text-xs text-slate-400 font-serif tracking-widest mb-2 flex items-center gap-1.5">
                                            <span className="w-1 h-3 bg-amber-400 rounded-full"></span>
                                            任务目标
                                        </h4>
                                        <div className="space-y-1.5">
                                            {quest.objectives.map(obj => (
                                                <div key={obj.id} className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                                                        <span className="text-slate-700">{obj.description}</span>
                                                    </div>
                                                    <span className="text-xs font-mono text-slate-400">
                                                        {obj.requiredCount > 1 && `需要 ${obj.requiredCount}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 奖励 */}
                                    <div>
                                        <h4 className="text-xs text-slate-400 font-serif tracking-widest mb-2 flex items-center gap-1.5">
                                            <span className="w-1 h-3 bg-emerald-400 rounded-full"></span>
                                            任务奖励
                                        </h4>
                                        <div className="px-3 py-2 bg-emerald-50/50 border border-emerald-100 rounded-lg text-sm text-emerald-700 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 font-serif text-xs shrink-0">赏</span>
                                            {quest.rewards.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredQuests.length === 0 && (
                            <div className="text-center text-slate-400 py-12 text-sm font-serif">
                                {searchTerm ? `没有找到匹配「${searchTerm}」的任务` : '暂无此分类任务'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Back Button */}
            {/* Back Button */}
            <button
                onClick={() => {
                    const target = useUIStore.getState().previousScene || 'MENU';
                    setScene(target === 'CODEX' ? 'MENU' : target);
                }}
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-all duration-300 group px-4 py-2 rounded-full hover:bg-slate-100"
            >
                <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">&lt;</span>
                <span className="text-xs font-mono tracking-widest">返回</span>
            </button>

        </div>
    );
};
