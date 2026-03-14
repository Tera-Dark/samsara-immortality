import React, { useState } from 'react';
import { MapPin, Sparkles, Store, BedDouble, Pickaxe, ScrollText, Trees, Landmark, Waves, Shield } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { MarketPanel } from './MarketPanel';
import { SectInteractionPanel } from './SectInteractionPanel';
import { NPCListPanel } from './NPCListPanel';
import type { Location } from '../../types/worldTypes';
import type { LocationActionType } from '../../engine/systems/TravelSystem';

type ActionCard = {
    id: string;
    label: string;
    sublabel: string;
    action?: LocationActionType;
    onClick?: () => void;
    tone: 'emerald' | 'amber' | 'sky' | 'orange' | 'violet' | 'blue' | 'slate';
    icon: React.ReactNode;
};

const locationTypeLabel: Record<string, string> = {
    REGION: '区域',
    WILDERNESS: '荒野',
    MINE: '矿脉',
    HERB_GARDEN: '药园',
    SPIRIT_VEIN: '灵脉',
    RUINS: '遗迹',
    SECRET_REALM: '秘境',
    CITY: '城镇',
    MARKET: '坊市',
    INN: '客栈',
    AUCTION_HOUSE: '拍场',
    SECT: '宗门',
    SECT_HQ: '山门',
};

export const LocationActionPanel: React.FC = () => {
    const { gameState, engine } = useGameStore();
    const locationEntity = engine.getLocationEntity(gameState.location);
    const [showMarket, setShowMarket] = useState(false);
    const [actionMessage, setActionMessage] = useState<string | null>(null);

    if (!locationEntity) return null;

    const locationType = 'type' in locationEntity ? (locationEntity as Location).type : 'REGION';
    const locationDescription = 'description' in locationEntity ? locationEntity.description : '你正停留在这片地界，四周暂时还算平静。';

    const runAction = (action: LocationActionType) => {
        const result = engine.performLocationAction(action);
        if (result.event) {
            engine.processEvent(result.event);
        }
        if (result.combat) {
            useGameStore.getState().startCombat(result.combat.enemy, result.combat.type);
        }

        useGameStore.setState({
            gameState: { ...engine.state },
            currentEvent: result.event || null,
            breakthroughMsg: result.timeMessage || null,
        });

        setActionMessage(result.message);
    };

    const runRest = () => {
        const result = engine.rest();
        if (result.event) {
            engine.processEvent(result.event);
        }
        if (result.combat) {
            useGameStore.getState().startCombat(result.combat.enemy, result.combat.type);
        }
        useGameStore.setState({
            gameState: { ...engine.state },
            currentEvent: result.event || null,
            breakthroughMsg: result.timeMessage || null,
        });
        setActionMessage(result.message);
    };

    const actionCards: ActionCard[] = [];

    switch (locationType) {
        case 'WILDERNESS':
            actionCards.push({
                id: 'forage',
                label: '野外搜集',
                sublabel: '搜罗基础材料与低阶收获',
                tone: 'emerald',
                icon: <Trees className="h-4 w-4" />,
                action: 'FORAGE',
            });
            break;
        case 'MINE':
            actionCards.push({
                id: 'mine',
                label: '开采矿脉',
                sublabel: '挖取玄铁与散碎灵石',
                tone: 'amber',
                icon: <Pickaxe className="h-4 w-4" />,
                action: 'MINE',
            });
            break;
        case 'HERB_GARDEN':
            actionCards.push({
                id: 'herb',
                label: '采摘灵药',
                sublabel: '收集药草与可用灵材',
                tone: 'emerald',
                icon: <Sparkles className="h-4 w-4" />,
                action: 'HARVEST_HERBS',
            });
            break;
        case 'SPIRIT_VEIN':
            actionCards.push({
                id: 'meditate',
                label: '灵脉吐纳',
                sublabel: '借地势加快修为增长',
                tone: 'sky',
                icon: <Waves className="h-4 w-4" />,
                action: 'MEDITATE',
            });
            break;
        case 'RUINS':
            actionCards.push({
                id: 'ruins',
                label: '探索遗迹',
                sublabel: '搜寻残阵、碑文与旧藏',
                tone: 'orange',
                icon: <Landmark className="h-4 w-4" />,
                action: 'EXPLORE_RUINS',
            });
            break;
        case 'SECRET_REALM':
            actionCards.push({
                id: 'realm',
                label: '闯入秘境',
                sublabel: '争取稀有战利品与机缘',
                tone: 'violet',
                icon: <Sparkles className="h-4 w-4" />,
                action: 'CHALLENGE_SECRET_REALM',
            });
            break;
        case 'CITY':
            actionCards.push({
                id: 'market',
                label: '进入坊市',
                sublabel: '买卖物品，整理手头资源',
                tone: 'blue',
                icon: <Store className="h-4 w-4" />,
                onClick: () => setShowMarket(true),
            });
            actionCards.push({
                id: 'rumor',
                label: '茶肆听风',
                sublabel: '打探传闻与附近风向',
                tone: 'slate',
                icon: <ScrollText className="h-4 w-4" />,
                action: 'GATHER_INFO',
            });
            break;
        case 'MARKET':
            actionCards.push({
                id: 'rumor-market',
                label: '探问行市',
                sublabel: '摸清物价与可疑消息',
                tone: 'blue',
                icon: <ScrollText className="h-4 w-4" />,
                action: 'GATHER_INFO',
            });
            break;
        case 'INN':
            actionCards.push({
                id: 'rest',
                label: '客房歇息',
                sublabel: '花费 5 灵石恢复状态',
                tone: 'amber',
                icon: <BedDouble className="h-4 w-4" />,
                onClick: runRest,
            });
            break;
        case 'AUCTION_HOUSE':
            actionCards.push({
                id: 'auction',
                label: '参加竞拍',
                sublabel: '用灵石换取少见好货',
                tone: 'violet',
                icon: <Sparkles className="h-4 w-4" />,
                action: 'ATTEND_AUCTION',
            });
            break;
        default:
            break;
    }

    if (['CITY', 'SECT', 'SECT_HQ', 'INN'].includes(locationType) && locationType !== 'INN') {
        actionCards.push({
            id: 'rest-common',
            label: '短暂歇息',
            sublabel: '恢复气血与灵力，整理节奏',
            tone: 'amber',
            icon: <BedDouble className="h-4 w-4" />,
            onClick: runRest,
        });
    }

    const sectId = ('sectAffiliation' in locationEntity ? locationEntity.sectAffiliation : '')
        || ('associatedSectId' in locationEntity ? locationEntity.associatedSectId : '')
        || '';

    return (
        <div className="space-y-3">
            <div className="grid gap-3 xl:grid-cols-[300px_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 bg-[linear-gradient(135deg,rgba(14,165,233,0.08),rgba(16,185,129,0.08))] px-4 py-3">
                        <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold tracking-[0.28em] text-slate-500">
                            <MapPin className="h-3.5 w-3.5 text-rose-500" />
                            当前驻足
                        </div>
                        <div className="text-lg font-bold text-slate-800">{locationEntity.name}</div>
                        <div className="mt-1 text-[11px] font-mono tracking-[0.22em] text-slate-400">
                            {locationTypeLabel[locationType] || locationType}
                        </div>
                    </div>
                    <div className="space-y-3 px-4 py-4">
                        <p className="text-sm leading-6 text-slate-600">{locationDescription}</p>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">灵气</div>
                                <div className="mt-1 text-sm font-semibold text-slate-700">
                                    {'spiritDensity' in locationEntity ? locationEntity.spiritDensity ?? '平稳' : '平稳'}
                                </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-400">人物</div>
                                <div className="mt-1 text-sm font-semibold text-slate-700">
                                    {(gameState.world?.worldNPCs.filter((npc) => npc.currentLocationId === gameState.location && npc.alive).length || 0)} 位
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                        <div>
                            <div className="text-[11px] font-semibold tracking-[0.28em] text-slate-500">地点交互</div>
                            <div className="mt-1 text-sm text-slate-600">基于当前地点的专属操作与驻留反馈</div>
                        </div>
                        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-500">
                            {actionCards.length > 0 ? `${actionCards.length} 项可执行` : '暂无专属事项'}
                        </div>
                    </div>

                    <div className="p-4">
                        {actionMessage && (
                            <div className="mb-3 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
                                {actionMessage}
                            </div>
                        )}

                        {actionCards.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                                {actionCards.map((card) => (
                                    <button
                                        key={card.id}
                                        onClick={() => {
                                            if (card.action) runAction(card.action);
                                            card.onClick?.();
                                        }}
                                        className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${getToneClass(card.tone)}`}
                                    >
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${getToneBadgeClass(card.tone)}`}>
                                                {card.icon}
                                            </div>
                                            <span className="text-xs text-slate-300 transition-colors group-hover:text-slate-500">执行</span>
                                        </div>
                                        <div className="text-sm font-bold text-slate-800">{card.label}</div>
                                        <div className="mt-1 text-xs leading-5 text-slate-500">{card.sublabel}</div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex min-h-[148px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
                                此处暂时没有专属活动
                            </div>
                        )}

                        {(locationType === 'SECT' || locationType === 'SECT_HQ') && sectId && (
                            <div className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
                                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-800">
                                    <Shield className="h-4 w-4" />
                                    宗门事务
                                </div>
                                <SectInteractionPanel sectId={sectId} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <div>
                        <div className="text-[11px] font-semibold tracking-[0.28em] text-slate-500">同地人物</div>
                        <div className="mt-1 text-sm text-slate-600">在此地停留、可进行交流与长期经营关系的人</div>
                    </div>
                </div>
                <div className="p-4">
                    <NPCListPanel />
                </div>
            </div>

            {showMarket && <MarketPanel onClose={() => setShowMarket(false)} />}
        </div>
    );
};

function getToneClass(tone: ActionCard['tone']) {
    switch (tone) {
        case 'emerald':
            return 'border-emerald-200 bg-emerald-50/70 hover:border-emerald-300 hover:bg-emerald-100/80';
        case 'amber':
            return 'border-amber-200 bg-amber-50/70 hover:border-amber-300 hover:bg-amber-100/80';
        case 'sky':
            return 'border-sky-200 bg-sky-50/70 hover:border-sky-300 hover:bg-sky-100/80';
        case 'orange':
            return 'border-orange-200 bg-orange-50/70 hover:border-orange-300 hover:bg-orange-100/80';
        case 'violet':
            return 'border-violet-200 bg-violet-50/70 hover:border-violet-300 hover:bg-violet-100/80';
        case 'blue':
            return 'border-blue-200 bg-blue-50/70 hover:border-blue-300 hover:bg-blue-100/80';
        default:
            return 'border-slate-200 bg-slate-50/80 hover:border-slate-300 hover:bg-slate-100';
    }
}

function getToneBadgeClass(tone: ActionCard['tone']) {
    switch (tone) {
        case 'emerald':
            return 'border-emerald-300 bg-emerald-100 text-emerald-700';
        case 'amber':
            return 'border-amber-300 bg-amber-100 text-amber-700';
        case 'sky':
            return 'border-sky-300 bg-sky-100 text-sky-700';
        case 'orange':
            return 'border-orange-300 bg-orange-100 text-orange-700';
        case 'violet':
            return 'border-violet-300 bg-violet-100 text-violet-700';
        case 'blue':
            return 'border-blue-300 bg-blue-100 text-blue-700';
        default:
            return 'border-slate-300 bg-slate-100 text-slate-700';
    }
}
