import React, { useState } from 'react';
import { BookOpen, Info, SlidersHorizontal } from 'lucide-react';
import { useUIStore } from '../store/uiStore';

interface SettingsModalProps {
    onClose: () => void;
    inGame?: boolean;
}

const RELEASE_VERSION = '0.9.0';

const TABS = [
    { id: 'SETTINGS', label: '基础设置', icon: SlidersHorizontal },
    { id: 'GUIDE', label: '游玩指南', icon: BookOpen },
    { id: 'ABOUT', label: '发布说明', icon: Info },
] as const;

type TabId = typeof TABS[number]['id'];

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, inGame = false }) => {
    const { settings, setVolume, setScene } = useUIStore();
    const [activeTab, setActiveTab] = useState<TabId>('SETTINGS');

    const handleReturnToMain = () => {
        setScene('MENU');
        onClose();
    };

    const handleOpenCodex = () => {
        setScene('CODEX');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
            <div className="relative flex h-[78vh] w-full max-w-4xl overflow-hidden rounded-[28px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] shadow-xl">
                <div className="absolute top-0 left-0 h-0.5 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-400"></div>

                <aside className="flex w-full max-w-[240px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/90 p-5">
                    <div>
                        <div className="text-[11px] tracking-[0.3em] text-slate-400">系统面板</div>
                        <h2 className="mt-3 text-2xl font-bold tracking-wide text-slate-800">设置</h2>
                        <div className="mt-2 text-sm text-slate-500">版本 {RELEASE_VERSION}</div>
                    </div>

                    <div className="mt-6 space-y-2">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm transition-all ${
                                        active
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : 'border-transparent bg-white text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {inGame && (
                        <div className="mt-auto grid grid-cols-2 gap-3 pt-4">
                            <button
                                onClick={handleOpenCodex}
                                className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm text-indigo-700 transition-colors hover:bg-indigo-100"
                            >
                                图鉴
                            </button>
                            <button
                                onClick={handleReturnToMain}
                                className="rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-sm text-red-600 transition-colors hover:bg-red-100"
                            >
                                主菜单
                            </button>
                        </div>
                    )}
                </aside>

                <section className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                        <div>
                            <div className="text-[11px] tracking-[0.22em] text-slate-400">系统设置</div>
                            <div className="mt-2 text-2xl font-semibold text-slate-900">
                                {activeTab === 'SETTINGS' && '基础设置'}
                                {activeTab === 'GUIDE' && '游玩指南'}
                                {activeTab === 'ABOUT' && '发布说明'}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 transition-colors hover:border-red-200 hover:text-red-500"
                        >
                            关闭
                        </button>
                    </div>

                    <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-6">
                        {activeTab === 'SETTINGS' && (
                            <div className="space-y-5">
                                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="mb-3 flex items-center justify-between text-sm">
                                        <span className="text-slate-700">主音量</span>
                                        <span className="font-mono font-semibold text-emerald-700">{settings.volume}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={settings.volume}
                                        onChange={(event) => setVolume(parseInt(event.target.value, 10))}
                                        className="w-full cursor-pointer appearance-none rounded-lg accent-emerald-500"
                                    />
                                    <div className="mt-2 flex justify-between text-[10px] text-slate-400">
                                        <span>静音</span>
                                        <span>均衡</span>
                                        <span>最大</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'GUIDE' && (
                            <div className="grid gap-5 lg:grid-cols-2">
                                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="text-lg font-semibold text-slate-800">前 30 分钟建议</div>
                                    <div className="mt-3 space-y-3 text-sm leading-6 text-slate-600">
                                        <div>1. 先沿主线任务推进，优先解锁基础修行能力。</div>
                                        <div>2. 多查看同地人物与地点交互，前期内容密度主要在这里。</div>
                                        <div>3. 资源紧时先练属性与关系，不要急着频繁闭关。</div>
                                        <div>4. 打开角色信息与图鉴，能快速判断成长方向。</div>
                                    </div>
                                </div>
                                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="text-lg font-semibold text-slate-800">快捷操作</div>
                                    <div className="mt-3 space-y-3 text-sm text-slate-600">
                                        <div><span className="font-mono text-slate-800">Space</span>：重复上一次行动</div>
                                        <div><span className="font-mono text-slate-800">Ctrl + E</span>：打开事件编辑器</div>
                                        <div>点击顶部任务卡：查看当前任务详情</div>
                                        <div>点击角色卡 / NPC 卡：打开详细人物信息</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'ABOUT' && (
                            <div className="space-y-5">
                                <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                                    <div className="text-lg font-semibold text-slate-800">当前发布状态</div>
                                    <div className="mt-3 text-sm leading-7 text-slate-600">
                                        当前版本已经具备完整可游玩的单局体验，包括成长、修行、地图、社交、命格、任务、战斗、存档与轮回等核心闭环。
                                        适合作为首个公开试玩版发布。
                                    </div>
                                </div>

                                <div className="grid gap-5 lg:grid-cols-2">
                                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="text-base font-semibold text-slate-800">已具备</div>
                                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                                            <div>• 开局到早期修行的稳定流程</div>
                                            <div>• 地图、地点、人物与互动反馈</div>
                                            <div>• 角色信息、背包、功法、任务、图鉴</div>
                                            <div>• 自动存档、多槽位、导入导出</div>
                                        </div>
                                    </div>
                                    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
                                        <div className="text-base font-semibold text-slate-800">发布后继续补强</div>
                                        <div className="mt-3 space-y-2 text-sm text-slate-600">
                                            <div>• 更多中后期剧情与宗门分支</div>
                                            <div>• 更丰富的技能、美术与音频表现</div>
                                            <div>• 更系统的数值平衡与数据埋点</div>
                                            <div>• Steam/网页发布物料与截图集</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="border-t border-slate-200 px-6 py-4">
                        <button
                            onClick={onClose}
                            className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                        >
                            完成
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
};
