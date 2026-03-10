import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { MarketPanel } from './MarketPanel';
import { SectInteractionPanel } from './SectInteractionPanel';
import { NPCListPanel } from './NPCListPanel';
import type { Location } from '../../types/worldTypes';

export const LocationActionPanel: React.FC = () => {
    const { gameState, engine } = useGameStore();
    const { location } = gameState;
    const locationEntity = engine.getLocationEntity(location);
    const [showMarket, setShowMarket] = useState(false);

    if (!locationEntity) return null;

    const isCity = 'type' in locationEntity && locationEntity.type === 'CITY';
    const isSect = 'type' in locationEntity && (locationEntity.type === 'SECT' || locationEntity.type === 'SECT_HQ');
    const isInn = 'type' in locationEntity && locationEntity.type === 'INN';
    const isAuction = 'type' in locationEntity && locationEntity.type === 'AUCTION_HOUSE';
    const isWild = !isCity && !isSect && !isInn && !isAuction;
    const locType = 'type' in locationEntity ? (locationEntity as Location).type : 'REGION';

    const handleGather = () => {
        const result = engine.gather();
        useGameStore.setState({ gameState: { ...engine.state } });
        if (!result.success) alert(result.message);
    };

    const handleRest = () => {
        const result = engine.rest();
        useGameStore.setState({ gameState: { ...engine.state } });
        if (!result.success) alert(result.message);
    };

    return (
        <div className="flex gap-3 items-stretch">
            {/* 位置信息 + 地点动作 */}
            <div className="flex gap-2 items-stretch shrink-0">
                {/* 位置标签 */}
                <div className="w-24 shrink-0 bg-white border border-slate-200 rounded-lg flex flex-col items-center justify-center p-2 text-center">
                    <span className="w-5 h-5 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-500 text-[10px] font-serif mb-1">地</span>
                    <span className="text-xs font-bold text-slate-700 truncate w-full">{locationEntity.name}</span>
                    <span className="text-[9px] text-slate-400 mt-0.5 font-mono tracking-wider">{locType}</span>
                </div>

                {/* 地点专属动作 */}
                {isWild && (
                    <>
                        <button onClick={handleGather} className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 hover:border-emerald-300 rounded-lg flex items-center gap-2 px-3 py-2 transition-all group">
                            <div className="w-7 h-7 rounded bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-serif text-xs group-hover:scale-110 transition-transform">采</div>
                            <div className="text-left leading-tight">
                                <div className="text-xs font-bold text-emerald-700">采集</div>
                                <div className="text-[9px] text-emerald-600/70">消耗 5天</div>
                            </div>
                        </button>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 px-3 py-2 opacity-50 cursor-not-allowed">
                            <div className="w-7 h-7 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-serif text-xs">坐</div>
                            <div className="text-left leading-tight">
                                <div className="text-xs font-bold text-slate-400">打坐</div>
                                <div className="text-[9px] text-slate-400">暂未开放</div>
                            </div>
                        </div>
                    </>
                )}

                {isCity && (
                    <button onClick={() => setShowMarket(true)} className="bg-blue-50 hover:bg-blue-100 border border-blue-200 hover:border-blue-300 rounded-lg flex items-center gap-2 px-3 py-2 transition-all group">
                        <div className="w-7 h-7 rounded bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700 font-serif text-xs group-hover:scale-110 transition-transform">市</div>
                        <div className="text-left leading-tight">
                            <div className="text-xs font-bold text-blue-700">坊市</div>
                            <div className="text-[9px] text-blue-600/70">买卖物品</div>
                        </div>
                    </button>
                )}

                {isInn && (
                    <button onClick={handleRest} className="bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 rounded-lg flex items-center gap-2 px-3 py-2 transition-all group">
                        <div className="w-7 h-7 rounded bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-700 font-serif text-xs group-hover:scale-110 transition-transform">栈</div>
                        <div className="text-left leading-tight">
                            <div className="text-xs font-bold text-amber-700">客房歇息</div>
                            <div className="text-[9px] text-amber-600/70">5灵石/恢复状态</div>
                        </div>
                    </button>
                )}

                {isAuction && (
                    <button onClick={() => alert('拍卖行即将于下个阶段开放！')} className="bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300 rounded-lg flex items-center gap-2 px-3 py-2 transition-all group">
                        <div className="w-7 h-7 rounded bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-700 font-serif text-xs group-hover:scale-110 transition-transform">拍</div>
                        <div className="text-left leading-tight">
                            <div className="text-xs font-bold text-purple-700">参加竞拍</div>
                            <div className="text-[9px] text-purple-600/70">淘换高阶法宝</div>
                        </div>
                    </button>
                )}

                {isSect && (
                    <SectInteractionPanel sectId={('sectAffiliation' in locationEntity ? locationEntity.sectAffiliation : '') || ''} />
                )}

                {isWild && (
                    <div className="flex items-center text-slate-500 text-[10px] px-3 border border-dashed border-slate-200 rounded-lg bg-slate-50">
                        此处荒芜，无事可做
                    </div>
                )}
            </div>

            {/* NPC 列表 */}
            <div className="flex-1 min-w-0">
                <NPCListPanel />
            </div>

            {showMarket && <MarketPanel onClose={() => setShowMarket(false)} />}
        </div>
    );
};
