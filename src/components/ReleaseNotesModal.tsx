import React from 'react';
import { BookOpen, Compass, Sparkles } from 'lucide-react';

interface ReleaseNotesModalProps {
    version: string;
    onClose: () => void;
}

export const ReleaseNotesModal: React.FC<ReleaseNotesModalProps> = ({ version, onClose }) => {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/25 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] shadow-[0_40px_120px_rgba(15,23,42,0.24)]">
                <div className="border-b border-slate-200 px-6 py-5">
                    <div className="text-[11px] tracking-[0.28em] text-emerald-500">WELCOME</div>
                    <div className="mt-2 text-2xl font-semibold text-slate-900">轮回·仙途 {version}</div>
                    <div className="mt-2 text-sm text-slate-500">当前版本已经适合作为公开试玩版体验，下面是本次进入前最值得知道的内容。</div>
                </div>

                <div className="grid gap-5 p-6 lg:grid-cols-3">
                    <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Sparkles className="h-4 w-4" />
                            <span className="text-sm font-semibold">这版能玩什么</span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-emerald-900/85">
                            <div>• 开局成长、命格、任务与早期剧情</div>
                            <div>• 地图探索、地点互动与同地人物经营</div>
                            <div>• 功法、背包、战斗、突破、轮回与存档</div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-sky-200 bg-sky-50 p-5">
                        <div className="flex items-center gap-2 text-sky-700">
                            <Compass className="h-4 w-4" />
                            <span className="text-sm font-semibold">建议怎么开局</span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-sky-900/85">
                            <div>• 先跟着主线任务走，尽快解锁修行能力</div>
                            <div>• 多点地点交互和同地人物，内容密度最高</div>
                            <div>• 通过角色面板判断属性方向，不要前期乱堆行动</div>
                        </div>
                    </div>

                    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-5">
                        <div className="flex items-center gap-2 text-amber-700">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm font-semibold">小提示</span>
                        </div>
                        <div className="mt-3 space-y-2 text-sm leading-6 text-amber-900/85">
                            <div>• `Space` 可重复上一次行动</div>
                            <div>• 设置面板里可以随时查看游玩指南和发布说明</div>
                            <div>• 存档支持导出导入，适合试玩反馈与备份</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
                    <div className="text-xs text-slate-400">该说明只会在新版本首次进入时自动显示一次。</div>
                    <button
                        onClick={onClose}
                        className="rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                    >
                        开始游玩
                    </button>
                </div>
            </div>
        </div>
    );
};
