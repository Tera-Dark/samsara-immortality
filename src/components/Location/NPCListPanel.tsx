import React, { useMemo, useState } from 'react';
import { ChevronRight, HeartHandshake, MessageCircle, ScrollText, Swords, UserRound } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/uiStore';
import type { WorldNPC } from '../../types/worldTypes';
import { REALMS } from '../../types';
import {
    applyBond,
    canFormBond,
    hasBond,
    runBondActivity,
} from '../../utils/socialUtils';

type ExtraInteractionMode =
    | 'GIFT'
    | 'ASK_GUIDANCE'
    | 'TRAVEL_TOGETHER'
    | 'COMMISSION'
    | 'NIGHT_TALK'
    | 'BOND_SWORN'
    | 'BOND_PARTNER'
    | 'BOND_ACTIVITY';

function hasMonthlyFlag(flags: string[], prefix: string, npcId: string, month: number) {
    return flags.includes(`${prefix}:${npcId}:${month}`);
}

function pushUniqueFlag(flags: string[], flag: string) {
    if (!flags.includes(flag)) flags.push(flag);
}

function getAffinityMeta(affinity: number) {
    if (affinity >= 90) return { label: '生死相许', tone: 'text-rose-700 border-rose-200 bg-rose-50' };
    if (affinity >= 70) return { label: '知己莫逆', tone: 'text-violet-700 border-violet-200 bg-violet-50' };
    if (affinity >= 40) return { label: '相谈甚欢', tone: 'text-sky-700 border-sky-200 bg-sky-50' };
    if (affinity >= 10) return { label: '渐生熟络', tone: 'text-emerald-700 border-emerald-200 bg-emerald-50' };
    if (affinity <= -60) return { label: '深仇大恨', tone: 'text-red-700 border-red-200 bg-red-50' };
    if (affinity <= -20) return { label: '心存芥蒂', tone: 'text-orange-700 border-orange-200 bg-orange-50' };
    return { label: '泛泛之交', tone: 'text-slate-600 border-slate-200 bg-slate-50' };
}

function getBondLabel(npc: WorldNPC) {
    if (hasBond(npc, 'DAO_PARTNER')) return '道侣';
    if (hasBond(npc, 'SWORN_SIBLING')) return '义亲';
    return null;
}

function getRealmName(index: number) {
    return REALMS[index] || '未知境界';
}

export const NPCListPanel: React.FC = () => {
    const { gameState, interactNPC } = useGameStore();
    const inspectNPC = useUIStore((state) => state.inspectNPC);
    const locationId = gameState.location;
    const [selectedNPC, setSelectedNPC] = useState<WorldNPC | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const npcsHere = useMemo(
        () => gameState.world?.worldNPCs.filter((npc: WorldNPC) => npc.currentLocationId === locationId && npc.alive) || [],
        [gameState.world, locationId],
    );

    const syncAfterLocalChange = (message?: string) => {
        const liveEngine = useGameStore.getState().engine;
        useGameStore.setState({
            gameState: { ...liveEngine.state },
            breakthroughMsg: null,
        });
        if (message) setFeedback(message);
    };

    const runExtraInteraction = (npc: WorldNPC, mode: ExtraInteractionMode) => {
        const liveEngine = useGameStore.getState().engine;
        const affinity = npc.affinity || 0;
        const currentMonth = liveEngine.state.months;
        let message = '';

        if (mode === 'GIFT') {
            const giftCost = 10;
            if ((liveEngine.state.attributes.MONEY || 0) < giftCost) {
                setFeedback(`赠礼至少需要 ${giftCost} 灵石。`);
                return;
            }
            liveEngine.state.attributes.MONEY -= giftCost;
            npc.affinity = affinity + 12;
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_SCENE:GIFT:${npc.id}`);
            message = `你为 ${npc.name} 准备了一份价值 ${giftCost} 灵石的薄礼，对方明显对你亲近了几分。`;
        } else if (mode === 'ASK_GUIDANCE') {
            if (affinity < 10) {
                setFeedback(`${npc.name} 仍对你有所保留，还不愿认真点拨。`);
                return;
            }
            const expGain = 12 + npc.realmIndex * 6;
            liveEngine.state.exp = Math.min(liveEngine.state.maxExp, liveEngine.state.exp + expGain);
            npc.affinity = affinity + 4;
            if (Math.random() < 0.25) {
                liveEngine.state.attributes.INT = (liveEngine.state.attributes.INT || 0) + 1;
            }
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_SCENE:GUIDANCE:${npc.id}`);
            message = `你向 ${npc.name} 请教修行心得，额外获得修为 ${expGain}。`;
        } else if (mode === 'TRAVEL_TOGETHER') {
            if (affinity < 20) {
                setFeedback('关系还不够亲近，对方暂时不会与你结伴同行。');
                return;
            }
            if (hasMonthlyFlag(liveEngine.state.flags, 'SOCIAL_COOLDOWN:TRAVEL', npc.id, currentMonth)) {
                setFeedback(`${npc.name} 本月已经与你同行过一次，先留些余味。`);
                return;
            }
            const expGain = 18 + npc.realmIndex * 5;
            liveEngine.state.exp = Math.min(liveEngine.state.maxExp, liveEngine.state.exp + expGain);
            liveEngine.state.attributes.MOOD = (liveEngine.state.attributes.MOOD || 0) + 6;
            if (Math.random() < 0.4) {
                liveEngine.addItem('spirit_shard', 1);
            } else {
                liveEngine.state.attributes.LUCK = (liveEngine.state.attributes.LUCK || 0) + 1;
            }
            npc.affinity = affinity + 6;
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_COOLDOWN:TRAVEL:${npc.id}:${currentMonth}`);
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_SCENE:TRAVEL:${npc.id}`);
            message = `你与 ${npc.name} 结伴游历半日，沿途互通见闻，心境与修为都增长了几分。`;
        } else if (mode === 'COMMISSION') {
            const cost = 12;
            if (affinity < 30) {
                setFeedback('交情还不够深，贸然托付事务只会显得唐突。');
                return;
            }
            if (hasMonthlyFlag(liveEngine.state.flags, 'SOCIAL_COOLDOWN:COMMISSION', npc.id, currentMonth)) {
                setFeedback('这个月你已经托付过对方事务了，先等等结果再说。');
                return;
            }
            if ((liveEngine.state.attributes.MONEY || 0) < cost) {
                setFeedback(`托付事务至少需要 ${cost} 灵石打点。`);
                return;
            }
            liveEngine.state.attributes.MONEY -= cost;
            npc.affinity = affinity + 5;
            liveEngine.state.attributes.REP = (liveEngine.state.attributes.REP || 0) + 1;
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_COOLDOWN:COMMISSION:${npc.id}:${currentMonth}`);
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_SCENE:COMMISSION:${npc.id}`);
            message = `你托付 ${npc.name} 替你打探门路并处理一些杂事，花费不多，但也算种下了一笔人情。`;
        } else if (mode === 'NIGHT_TALK') {
            if (affinity < 45) {
                setFeedback('还没到可以彻夜长谈的程度。');
                return;
            }
            if (hasMonthlyFlag(liveEngine.state.flags, 'SOCIAL_COOLDOWN:NIGHT_TALK', npc.id, currentMonth)) {
                setFeedback('这个月你们已经有过一次长谈了。');
                return;
            }
            liveEngine.state.attributes.MOOD = (liveEngine.state.attributes.MOOD || 0) + 8;
            liveEngine.state.attributes.WIL = (liveEngine.state.attributes.WIL || 0) + 1;
            if (hasBond(npc, 'DAO_PARTNER')) {
                liveEngine.state.exp = Math.min(liveEngine.state.maxExp, liveEngine.state.exp + 36 + npc.realmIndex * 8);
            } else if (hasBond(npc, 'SWORN_SIBLING')) {
                liveEngine.state.attributes.REP = (liveEngine.state.attributes.REP || 0) + 1;
            } else if (Math.random() < 0.35) {
                liveEngine.state.attributes.DAO = (liveEngine.state.attributes.DAO || 0) + 1;
            }
            npc.affinity = affinity + 4;
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_COOLDOWN:NIGHT_TALK:${npc.id}:${currentMonth}`);
            pushUniqueFlag(liveEngine.state.flags, `SOCIAL_SCENE:NIGHT_TALK:${npc.id}`);
            message = `夜深之后，你与 ${npc.name} 对坐长谈，许多平日不便说出口的话终于都说开了。`;
        } else if (mode === 'BOND_SWORN') {
            if (!canFormBond(npc, affinity, 'SWORN_SIBLING')) {
                setFeedback('对方尚未与你情义深厚到可以结义。');
                return;
            }
            message = applyBond(liveEngine, npc, 'SWORN_SIBLING');
        } else if (mode === 'BOND_PARTNER') {
            if (!canFormBond(npc, affinity, 'DAO_PARTNER')) {
                setFeedback('情意尚未走到结为道侣的地步。');
                return;
            }
            message = applyBond(liveEngine, npc, 'DAO_PARTNER');
        } else {
            if (hasBond(npc, 'DAO_PARTNER')) {
                message = runBondActivity(liveEngine, npc, 'DAO_PARTNER');
            } else if (hasBond(npc, 'SWORN_SIBLING')) {
                message = runBondActivity(liveEngine, npc, 'SWORN_SIBLING');
            } else {
                setFeedback('你们尚未缔结长期关系。');
                return;
            }
        }

        if (['GIFT', 'ASK_GUIDANCE', 'TRAVEL_TOGETHER', 'COMMISSION', 'NIGHT_TALK'].includes(mode)) {
            liveEngine.state.history.push(`${liveEngine.getTimeStr()} ${message}`);
        }

        const result = liveEngine.advanceTime(0, { action: 'INTERACT' }, mode === 'TRAVEL_TOGETHER' ? 8 : 5);
        if (result.event) liveEngine.processEvent(result.event);
        if (result.combat) useGameStore.getState().startCombat(result.combat.enemy, result.combat.type);

        useGameStore.setState({
            gameState: { ...liveEngine.state },
            currentEvent: result.event || null,
            breakthroughMsg: result.message || null,
        });

        setFeedback(message);
        setSelectedNPC(null);
    };

    if (npcsHere.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white px-4 text-center">
                <UserRound className="h-8 w-8 text-slate-300" />
                <div className="mt-3 text-sm font-medium text-slate-600">此地暂无其他修士</div>
                <div className="mt-1 text-xs text-slate-400">换个地点探索，或等时间推进后再来看看。</div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
                <div className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] text-amber-700">
                    附近修士 {npcsHere.length}
                </div>
                <div className="text-xs text-slate-400">优先选中一名角色后再展开操作</div>
            </div>

            {feedback && (
                <div className="mb-3 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-800">
                    {feedback}
                </div>
            )}

            <div className="custom-scrollbar flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                {npcsHere.map((npc) => {
                    const affinity = npc.affinity || 0;
                    const affinityMeta = getAffinityMeta(affinity);
                    const bondLabel = getBondLabel(npc);
                    const canSworn = canFormBond(npc, affinity, 'SWORN_SIBLING');
                    const canPartner = canFormBond(npc, affinity, 'DAO_PARTNER');
                    const selected = selectedNPC?.id === npc.id;

                    return (
                        <div
                            key={npc.id}
                            className={`rounded-[24px] border p-4 transition-all ${selected ? 'border-emerald-200 bg-emerald-50/40 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'}`}
                        >
                            <button
                                className="flex w-full items-start gap-4 text-left"
                                onClick={() => setSelectedNPC(selected ? null : npc)}
                            >
                                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl font-semibold text-slate-700">
                                    {npc.name.slice(0, 1)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="truncate text-base font-semibold text-slate-800">
                                                {npc.name}
                                                {npc.title && <span className="ml-2 text-sm font-normal text-amber-600">[{npc.title}]</span>}
                                            </div>
                                            <div className="mt-1 text-sm text-slate-500">
                                                {getRealmName(npc.realmIndex)} · {npc.position}
                                            </div>
                                        </div>
                                        <ChevronRight className={`mt-1 h-4 w-4 shrink-0 text-slate-300 transition-transform ${selected ? 'rotate-90 text-emerald-500' : ''}`} />
                                    </div>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        <span className={`rounded-full border px-2.5 py-1 text-xs ${affinityMeta.tone}`}>{affinityMeta.label}</span>
                                        <span className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-700">
                                            缘分 {affinity}
                                        </span>
                                        {bondLabel && (
                                            <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs text-violet-700">
                                                {bondLabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>

                            {selected && (
                                <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
                                    <div className="grid gap-2 md:grid-cols-3">
                                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                                            <div className="text-[11px] tracking-[0.2em] text-slate-500">年龄</div>
                                            <div className="mt-2 text-sm font-medium text-slate-700">{npc.age ?? '未知'}</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                                            <div className="text-[11px] tracking-[0.2em] text-slate-500">寿元</div>
                                            <div className="mt-2 text-sm font-medium text-slate-700">{npc.lifespan ?? '未知'}</div>
                                        </div>
                                        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3">
                                            <div className="text-[11px] tracking-[0.2em] text-slate-500">身份</div>
                                            <div className="mt-2 text-sm font-medium text-slate-700">{npc.position}</div>
                                        </div>
                                    </div>

                                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                                        <button
                                            className="rounded-2xl border border-sky-200 bg-sky-50 px-3 py-3 text-sm text-sky-800 transition-colors hover:bg-sky-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                interactNPC(npc, 'TALK');
                                                syncAfterLocalChange(`你与 ${npc.name} 交谈了一番。`);
                                                setSelectedNPC(null);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                交谈
                                            </div>
                                        </button>
                                        <button
                                            className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-3 text-sm text-amber-800 transition-colors hover:bg-amber-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                interactNPC(npc, 'SPAR');
                                                syncAfterLocalChange(`你与 ${npc.name} 切磋了一场。`);
                                                setSelectedNPC(null);
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Swords className="h-4 w-4" />
                                                切磋
                                            </div>
                                        </button>
                                        <button
                                            className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                inspectNPC({
                                                    id: npc.id,
                                                    name: npc.name,
                                                    gender: npc.gender || 'M',
                                                    relation: bondLabel || '路人',
                                                    desc: npc.title || npc.position,
                                                    intimacy: npc.affinity || 0,
                                                    affinity: npc.affinity || 0,
                                                    relationships: npc.relationships || [],
                                                    age: npc.age || 0,
                                                    lifespan: npc.lifespan || 0,
                                                    alive: true,
                                                    realm: getRealmName(npc.realmIndex),
                                                    attributes: {},
                                                    battleStats: {
                                                        MAX_HP: 0,
                                                        MAX_MP: 0,
                                                        ATK: 0,
                                                        DEF: 0,
                                                        SPD: 0,
                                                        CRIT: 0,
                                                    },
                                                });
                                            }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <ScrollText className="h-4 w-4" />
                                                查看档案
                                            </div>
                                        </button>
                                        <button
                                            className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-800 transition-colors hover:bg-emerald-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                runExtraInteraction(npc, 'GIFT');
                                            }}
                                        >
                                            赠礼
                                        </button>
                                        <button
                                            className="rounded-2xl border border-violet-200 bg-violet-50 px-3 py-3 text-sm text-violet-800 transition-colors hover:bg-violet-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                runExtraInteraction(npc, 'ASK_GUIDANCE');
                                            }}
                                        >
                                            请教
                                        </button>
                                        {affinity >= 20 && (
                                            <button
                                                className="rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-3 text-sm text-cyan-800 transition-colors hover:bg-cyan-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    runExtraInteraction(npc, 'TRAVEL_TOGETHER');
                                                }}
                                            >
                                                结伴同游
                                            </button>
                                        )}
                                        {affinity >= 30 && (
                                            <button
                                                className="rounded-2xl border border-lime-200 bg-lime-50 px-3 py-3 text-sm text-lime-800 transition-colors hover:bg-lime-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    runExtraInteraction(npc, 'COMMISSION');
                                                }}
                                            >
                                                托付事务
                                            </button>
                                        )}
                                        {affinity >= 45 && (
                                            <button
                                                className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm text-indigo-800 transition-colors hover:bg-indigo-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    runExtraInteraction(npc, 'NIGHT_TALK');
                                                }}
                                            >
                                                夜谈
                                            </button>
                                        )}
                                        {(canSworn || hasBond(npc, 'SWORN_SIBLING')) && !hasBond(npc, 'DAO_PARTNER') && (
                                            <button
                                                className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-3 py-3 text-sm text-fuchsia-800 transition-colors hover:bg-fuchsia-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    runExtraInteraction(npc, hasBond(npc, 'SWORN_SIBLING') ? 'BOND_ACTIVITY' : 'BOND_SWORN');
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <HeartHandshake className="h-4 w-4" />
                                                    {hasBond(npc, 'SWORN_SIBLING') ? '并肩论道' : '结义'}
                                                </div>
                                            </button>
                                        )}
                                        {(canPartner || hasBond(npc, 'DAO_PARTNER')) && (
                                            <button
                                                className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-800 transition-colors hover:bg-rose-100"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    runExtraInteraction(npc, hasBond(npc, 'DAO_PARTNER') ? 'BOND_ACTIVITY' : 'BOND_PARTNER');
                                                }}
                                            >
                                                {hasBond(npc, 'DAO_PARTNER') ? '共修' : '结为道侣'}
                                            </button>
                                        )}
                                        <button
                                            className="md:col-span-2 xl:col-span-3 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-700 transition-colors hover:bg-red-100"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                interactNPC(npc, 'KILL');
                                                syncAfterLocalChange(`你对 ${npc.name} 露出了敌意。`);
                                                setSelectedNPC(null);
                                            }}
                                        >
                                            敌对出手
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
