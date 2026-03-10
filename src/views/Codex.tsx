import { useState, useMemo } from 'react';
import { useUIStore } from '../store/uiStore';
import { TALENTS } from '../modules/xianxia/data/talents';
import { EVENTS } from '../modules/xianxia/data/events/index';
import { XianxiaConfig } from '../modules/xianxia/config';
import { CULTIVATION_REALMS, type Tab } from '../types';
import { TalentCard } from '../components/TalentCard';
import { FateGrid } from './codex/FateGrid';
import { RealmsView } from './codex/RealmsView';
import type { MissionType } from '../types/missionTypes';
import { XIANXIA_SYSTEMS } from '../modules/xianxia/data/systems';
import { ALL_QUESTS, MAIN_QUESTS, SIDE_QUESTS, SPECIAL_QUESTS } from '../data/missions';
import * as LucideIcons from 'lucide-react';

const renderLucideIcon = (iconName: string, className?: string) => {
    const IconComp = LucideIcons[iconName as keyof typeof LucideIcons] as React.ElementType;
    if (!IconComp) return <div className={className} />;
    return <IconComp className={className} strokeWidth={1.5} />;
};


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
                <h2 className="text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-b from-slate-800 to-slate-500 tracking-widest text-glow" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                    万象图鉴
                </h2>
                <div className="text-xs font-mono text-emerald-500/60 tracking-[0.5em] uppercase mt-2">
                    天道数据观测
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mt-6 p-1 bg-white/80 backdrop-blur-md rounded-full border border-slate-200 shadow-sm">
                    {(['TALENTS', 'EVENTS', 'STATS', 'SYSTEMS', 'REALMS', 'QUESTS'] as Tab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => handleTabChange(tab)}
                            className={`px-6 py-2 rounded-full text-sm font-serif tracking-wider transition-all duration-300 ${activeTab === tab
                                ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-200'
                                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent'
                                }`}
                        >
                            {tab === 'TALENTS' && '命格'}
                            {tab === 'EVENTS' && '事件'}
                            {tab === 'STATS' && '属性'}
                            {tab === 'SYSTEMS' && '大千世界'}
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
                                className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all font-serif"
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
                                <div className="mt-2 text-sm text-slate-400 px-1">
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
                            <div className="text-center text-slate-400 py-12 text-base">没有找到匹配「{searchTerm}」的命格</div>
                        )}
                    </div>
                )}

                {/* EVENTS TAB - Fate Grid */}
                {activeTab === 'EVENTS' && (
                    <FateGrid events={EVENTS} />
                )}

                {/* STATS TAB */}
                {activeTab === 'STATS' && (
                    <div className="space-y-8">
                        {/* 提词 */}
                        <div className="bg-slate-900/5 text-slate-700 p-4 rounded-xl border border-slate-200/60 shadow-inner flex items-center gap-4">
                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-serif text-2xl border border-emerald-200 shrink-0">
                                理
                            </div>
                            <div className="text-base leading-relaxed text-slate-600">
                                夫天地造化，分为六脉：<span className="text-red-500 font-bold px-1">体</span>、
                                <span className="text-emerald-500 font-bold px-1">神</span>、
                                <span className="text-indigo-500 font-bold px-1">悟</span>、
                                <span className="text-teal-500 font-bold px-1">骨</span>、
                                <span className="text-pink-500 font-bold px-1">魅</span>、
                                <span className="text-amber-500 font-bold px-1">运</span>。此六者乃修真之根脉，共同孕育肉身强健与法力激荡。
                            </div>
                        </div>

                        {/* 六维核心展示区 */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <span className="w-1.5 h-4 bg-emerald-400 rounded-full"></span>
                                <h3 className="text-xl font-serif font-bold text-slate-700 tracking-widest">造化六维 <span className="text-sm font-mono text-slate-400 font-normal ml-2">CORE ATTRIBUTES</span></h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredStats.filter(s => ['STR', 'MND', 'INT', 'POT', 'CHR', 'LUCK'].includes(s.id)).map(stat => (
                                    <div key={stat.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className="absolute -right-4 -top-4 text-slate-50 text-7xl font-serif font-black pointer-events-none group-hover:scale-110 transition-transform">
                                            {stat.id === 'STR' ? '体' : stat.id === 'MND' ? '神' : stat.id === 'INT' ? '悟' : stat.id === 'POT' ? '骨' : stat.id === 'CHR' ? '魅' : '运'}
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className={`text-2xl font-bold font-serif ${stat.color || 'text-slate-800'}`}>
                                                    {stat.name}
                                                </h3>
                                                <span className="font-mono text-sm text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{stat.id}</span>
                                            </div>
                                            <p className="text-base text-slate-600 mb-4">{stat.description || '暂无描述'}</p>

                                            {/* 衍生映射面版 */}
                                            <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-100/80 mb-3 space-y-2">
                                                <div className="text-xs text-slate-400 font-serif tracking-widest mb-1.5 border-b border-slate-200/50 pb-1">衍生演化规律</div>
                                                {stat.id === 'STR' && (
                                                    <>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">气血上限 (HP)</span><span className="font-mono text-red-500">+20 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">外功防御 (DEF)</span><span className="font-mono text-blue-500">+3 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">基础物理 (ATK)</span><span className="font-mono text-orange-500">+2 / 点</span></div>
                                                    </>
                                                )}
                                                {stat.id === 'MND' && (
                                                    <>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">灵力法脉 (MP)</span><span className="font-mono text-sky-500">+15 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">身法速度 (SPD)</span><span className="font-mono text-teal-500">+2 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">会心一击 (CRIT)</span><span className="font-mono text-orange-500">+0.2% / 点</span></div>
                                                    </>
                                                )}
                                                {stat.id === 'INT' && (
                                                    <>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">大功微调 (ATK)</span><span className="font-mono text-orange-500">+1 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">法力微调 (MP)</span><span className="font-mono text-sky-500">+2 / 点</span></div>
                                                        <div className="flex justify-between text-sm text-indigo-500 col-span-2 pt-1 mt-1 border-t border-indigo-50">主导功法修炼速度与破境概率</div>
                                                    </>
                                                )}
                                                {stat.id === 'POT' && (
                                                    <>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">源初法力 (MP)</span><span className="font-mono text-sky-500">+5 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">灵气大功 (ATK)</span><span className="font-mono text-orange-500">+2 / 点</span></div>
                                                    </>
                                                )}
                                                {stat.id === 'LUCK' && (
                                                    <>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">幸存闪避 (SPD)</span><span className="font-mono text-teal-500">+0.5 / 点</span></div>
                                                        <div className="flex justify-between text-sm"><span className="text-slate-500">气运会心 (CRIT)</span><span className="font-mono text-orange-500">+0.1% / 点</span></div>
                                                        <div className="flex justify-between text-sm text-amber-500 col-span-2 pt-1 mt-1 border-t border-amber-50">干涉所有极小概率的掉落及奇遇</div>
                                                    </>
                                                )}
                                                {stat.id === 'CHR' && (
                                                    <div className="text-sm text-pink-500 py-1">绝世容颜，主导与世间生灵的初见好感及双修成效，暂无直接战斗衍生。</div>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4 text-sm font-mono text-slate-400 border-t border-slate-100 pt-3">
                                                <span>Min: {stat.min ?? '-'}</span>
                                                <span className="mx-auto">Max: {stat.max ?? '-'}</span>
                                                <span>Base: {stat.base}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 派生及状态区 */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                <span className="w-1.5 h-4 bg-slate-400 rounded-full"></span>
                                <h3 className="text-xl font-serif font-bold text-slate-700 tracking-widest">体征与杀伐 <span className="text-sm font-mono text-slate-400 font-normal ml-2">DERIVED STATS</span></h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {filteredStats.filter(s => !['STR', 'MND', 'INT', 'POT', 'CHR', 'LUCK'].includes(s.id)).map(stat => (
                                    <div key={stat.id} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-base font-bold font-serif ${stat.color || 'text-slate-700'}`}>{stat.name}</span>
                                                <span className="font-mono text-xs text-slate-400">{stat.id}</span>
                                            </div>
                                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">{stat.description || '由六维与境界共同主导'}</p>
                                        </div>
                                        <div className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded w-fit">Base: {stat.base}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {filteredStats.length === 0 && (
                            <div className="text-center text-slate-400 py-12 text-base">没有找到匹配「{searchTerm}」的属性</div>
                        )}
                    </div>
                )}

                {/* SYSTEMS TAB */}
                {activeTab === 'SYSTEMS' && (
                    <div className="space-y-8 pb-12">
                        {/* 提词 */}
                        <div className="bg-slate-900/5 text-slate-700 p-5 rounded-xl border border-slate-200/60 shadow-inner flex items-center gap-4">
                            <div className="w-14 h-14 rounded-lg bg-sky-100 flex items-center justify-center text-sky-600 font-serif text-2xl border border-sky-200 shrink-0">
                                蕴
                            </div>
                            <div className="text-base leading-relaxed text-slate-600">
                                修仙不仅是漫长的打坐，大千世界中更蕴含长生百艺与红尘因果。
                                以下为记录于天道法则中的核心干涉系统与交互流派，待有缘人发掘。
                            </div>
                        </div>

                        {/* 分类展示 */}
                        {['CULTIVATION', 'CRAFTING', 'EXPLORATION', 'SOCIAL'].map(category => {
                            const sysList = XIANXIA_SYSTEMS.filter(s => s.category === category);
                            if (sysList.length === 0) return null;

                            const categoryName: Record<string, string> = {
                                'CULTIVATION': '洞天福地',
                                'CRAFTING': '修仙百艺',
                                'EXPLORATION': '天地游历',
                                'SOCIAL': '万世因果'
                            };

                            return (
                                <div key={category}>
                                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200">
                                        <span className="w-1.5 h-4 bg-sky-400 rounded-full"></span>
                                        <h3 className="text-xl font-serif font-bold text-slate-700 tracking-widest">{categoryName[category]} <span className="text-sm font-mono text-slate-400 font-normal ml-2">{category}</span></h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {sysList.map(sys => (
                                            <div key={sys.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-md transition-all group relative overflow-hidden flex flex-col">
                                                <div className="absolute -right-4 -top-4 text-slate-100 opacity-30 pointer-events-none group-hover:scale-110 transition-transform">
                                                    {renderLucideIcon(sys.icon, "w-32 h-32")}
                                                </div>
                                                <div className="flex justify-between items-start mb-3 relative z-10">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            {renderLucideIcon(sys.icon, "w-6 h-6")}
                                                        </span>
                                                        <h3 className="text-2xl font-bold font-serif text-slate-800 tracking-wider text-outlined">{sys.name}</h3>
                                                    </div>
                                                    <span className={`text-xs px-2.5 py-1 rounded border font-mono ${sys.status === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : sys.status === 'WIP' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                        {sys.status}
                                                    </span>
                                                </div>
                                                <p className="text-base text-slate-600 mb-5 flex-1 relative z-10 leading-relaxed">{sys.description}</p>

                                                <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 text-sm space-y-3 relative z-10">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">关联维度:</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {sys.coreStats.map(stat => (
                                                                <span key={stat} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-mono text-xs">{stat}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">核心玩法:</span>
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {sys.features.map(f => (
                                                                <span key={f} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-sky-600 text-xs font-serif">{f}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    {sys.unlockCondition && (
                                                        <div className="flex items-start gap-2 pt-2 border-t border-slate-200/50 mt-2">
                                                            <span className="text-slate-400 shrink-0 mt-0.5 whitespace-nowrap">解锁要求:</span>
                                                            <span className="text-amber-600 font-serif">{sys.unlockCondition}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
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
                                    className="w-full px-5 py-3 rounded-xl bg-white border border-slate-200 text-base text-slate-700 placeholder-slate-400 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-200 transition-all font-serif"
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
                            <div className="flex gap-2 items-center flex-wrap">
                                <span className="text-sm text-slate-400 font-serif">分类:</span>
                                {(['ALL', 'MAIN', 'SIDE', 'EVENT'] as const).map(f => (
                                    <button
                                        key={f}
                                        onClick={() => setQuestFilter(f)}
                                        className={`px-4 py-1.5 rounded-full text-sm font-serif transition-all border ${questFilter === f
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
                                <div className="text-sm text-slate-400 px-1">
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
                                            <span className={`text-sm px-3 py-1 rounded-full border font-medium font-serif ${QUEST_TYPE_COLOR[quest.type]}`}>
                                                {QUEST_TYPE_LABEL[quest.type]}
                                            </span>
                                            <h3 className="text-xl font-serif font-bold text-slate-800 tracking-wider text-outlined">{quest.title}</h3>
                                        </div>
                                        <span className="text-xs font-mono text-slate-400">{quest.id}</span>
                                    </div>

                                    {/* 描述 */}
                                    <p className="text-base text-slate-600 leading-relaxed mb-5">{quest.description}</p>

                                    {/* 前置条件 */}
                                    {(quest.prereqMissions || quest.minAge !== undefined) && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {quest.minAge !== undefined && (
                                                <span className="text-xs font-mono px-3 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                                    最低年龄: {quest.minAge}岁
                                                </span>
                                            )}
                                            {quest.prereqMissions?.map(pre => (
                                                <span key={pre} className="text-xs font-serif px-3 py-1 rounded bg-slate-100 text-slate-500 border border-slate-200">
                                                    前置: {ALL_QUESTS.find(q => q.id === pre)?.title || pre}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* 目标 */}
                                    <div className="mb-4">
                                        <h4 className="text-sm text-slate-400 font-serif tracking-widest mb-2 flex items-center gap-1.5 pt-2">
                                            <span className="w-1 h-3.5 bg-amber-400 rounded-full"></span>
                                            任务目标
                                        </h4>
                                        <div className="space-y-2">
                                            {quest.objectives.map(obj => (
                                                <div key={obj.id} className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-lg border border-slate-100 text-base font-serif">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0"></div>
                                                        <span className="text-slate-700">{obj.description}</span>
                                                    </div>
                                                    <span className="text-sm font-mono text-slate-400">
                                                        {obj.requiredCount > 1 && `需要 ${obj.requiredCount}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 奖励 */}
                                    <div className="pt-2">
                                        <h4 className="text-sm text-slate-400 font-serif tracking-widest mb-2 flex items-center gap-1.5">
                                            <span className="w-1 h-3.5 bg-emerald-400 rounded-full"></span>
                                            任务奖励
                                        </h4>
                                        <div className="px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-base font-serif text-emerald-700 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 font-serif text-xs shrink-0">赏</span>
                                            {quest.rewards.text}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredQuests.length === 0 && (
                            <div className="text-center text-slate-400 py-12 text-base font-serif">
                                {searchTerm ? `没有找到匹配「${searchTerm}」的任务` : '暂无此分类任务'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Back Button */}
            <button
                onClick={() => {
                    const target = useUIStore.getState().previousScene || 'MENU';
                    setScene(target === 'CODEX' ? 'MENU' : target);
                }}
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-400 hover:text-slate-700 transition-all duration-300 group px-4 py-2 rounded-full hover:bg-slate-100"
            >
                <span className="text-xl transition-transform duration-300 group-hover:-translate-x-1">&lt;</span>
                <span className="text-sm font-mono tracking-widest">返回</span>
            </button>

        </div>
    );
};
