import React from 'react';
import { useGameStore } from '../../store/gameStore';
import type { Sect } from '../../types/worldTypes';
import { DOCTRINE_TEMPLATES, SECT_RANK_TEMPLATES } from '../../modules/xianxia/data/worldTemplates';

interface SectInteractionPanelProps {
    sectId: string;
}

export const SectInteractionPanel: React.FC<SectInteractionPanelProps> = ({ sectId }) => {
    const { gameState, engine } = useGameStore();
    const sect = gameState.world?.sects.find((s: Sect) => s.id === sectId);

    if (!sect) {
        return <div className="p-4 text-center text-slate-500 text-xs">无法获取宗门信息。</div>;
    }

    const docLabel = DOCTRINE_TEMPLATES.find(d => d.doctrine === sect.doctrine)?.label || '修仙';
    const rankLabel = SECT_RANK_TEMPLATES.find(r => r.rank === sect.rank)?.label || '宗门';
    const alignLabel = sect.alignment === 'RIGHTEOUS' ? '正道' : sect.alignment === 'EVIL' ? '魔道' : '中立';

    const isMember = gameState.sect === sect.id;
    const requiredRealm = sect.entryRealmRequirement || 0;
    const canJoin = !gameState.sect && gameState.realm_idx >= requiredRealm;
    const joinReason = gameState.sect ? '你已有宗门。' : (gameState.realm_idx < requiredRealm ? '境界不足。' : '');

    const handleJoin = () => {
        const result = engine.joinSect(sect.id);
        useGameStore.setState({ gameState: { ...engine.state } });
        if (!result.success) {
            alert(result.message);
        }
    };

    return (
        <div className="col-span-2 bg-white border border-slate-200/60 rounded-lg p-4 flex flex-col gap-3">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-lg font-serif font-bold text-amber-500 tracking-wider">
                        {sect.name}
                    </h3>
                    <div className="text-[10px] text-slate-400 mt-1 flex gap-2">
                        <span className="px-1 bg-slate-800 rounded">{alignLabel}</span>
                        <span className="px-1 bg-slate-800 rounded">{docLabel}</span>
                        <span className="px-1 bg-slate-800 rounded">{rankLabel}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-slate-600">底蕴实力</div>
                    <div className="text-lg font-mono text-emerald-400">{sect.power}</div>
                </div>
            </div>

            <p className="text-xs text-slate-400 italic">
                {sect.description}
            </p>

            <div className="mt-2 pt-2 border-t border-slate-200 flex gap-2 justify-end">
                {isMember ? (
                    <button className="px-4 py-2 bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 rounded cursor-not-allowed">
                        已是本门弟子
                    </button>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={!canJoin}
                        className={`px-4 py-2 border rounded transition-colors ${canJoin
                            ? 'bg-amber-900/40 border-amber-800/50 text-amber-200 hover:bg-amber-800/60 hover:text-amber-100'
                            : 'bg-slate-800 text-slate-500 border-slate-200 cursor-not-allowed grayscale opacity-70'}`}
                        title={joinReason}
                    >
                        拜入宗门
                    </button>
                )}
            </div>
        </div>
    );
};
