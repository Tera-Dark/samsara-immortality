import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { EventEditor } from './EventEditor';
import { ConfigEditor } from './ConfigEditor';
import { ScrollText, Wrench, Settings } from 'lucide-react';

export const EditorLayout: React.FC = () => {
    const { engine } = useGameStore();
    const [activeTab, setActiveTab] = useState<'CONFIG' | 'EVENTS'>('EVENTS');

    return (
        <div className="flex h-screen w-full bg-gray-950 text-gray-200 font-sans overflow-hidden">
            {/* Sidebar */}
            <div className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <div className="font-bold text-lg text-emerald-400 font-serif flex items-center gap-2"><Settings className="w-4 h-4" /> 事件编辑器</div>
                    <div className="text-xs text-slate-500 mt-1">Ctrl+E 切换</div>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    <button
                        onClick={() => setActiveTab('EVENTS')}
                        className={`w-full text-left px-4 py-2.5 rounded text-sm transition-colors ${activeTab === 'EVENTS'
                            ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                            : 'hover:bg-gray-800 text-slate-400 border border-transparent'
                            }`}
                    >
                        <span className="flex items-center gap-2"><ScrollText className="w-4 h-4" /> 事件管理</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('CONFIG')}
                        className={`w-full text-left px-4 py-2.5 rounded text-sm transition-colors ${activeTab === 'CONFIG'
                            ? 'bg-emerald-800/50 text-emerald-300 border border-emerald-700/50'
                            : 'hover:bg-gray-800 text-slate-400 border border-transparent'
                            }`}
                    >
                        <span className="flex items-center gap-2"><Wrench className="w-4 h-4" /> 配置编辑</span>
                    </button>
                </div>
                <div className="p-3 border-t border-gray-800 text-xs text-gray-600 space-y-1">
                    <p>模块: {engine.moduleConfig.name}</p>
                    <p>版本: {engine.moduleConfig.version}</p>
                    <p>事件总数: {engine.events.length}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Toolbar */}
                <div className="h-12 bg-gray-900 border-b border-gray-800 flex items-center px-6 justify-between">
                    <h2 className="font-bold text-sm text-slate-300">
                        {activeTab === 'CONFIG' ? <span className="flex items-center gap-2"><Wrench className="w-4 h-4" /> 配置编辑</span> : <span className="flex items-center gap-2"><ScrollText className="w-4 h-4" /> 事件管理</span>}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => {
                                engine.hotReload(engine.moduleConfig, engine.events);
                                alert('✓ 更改已应用到运行中的引擎');
                            }}
                            className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 rounded text-xs text-white transition-colors"
                        >
                            热重载引擎
                        </button>
                    </div>
                </div>

                {/* Editor Area */}
                <div className="flex-1 overflow-auto p-4 bg-gray-950">
                    {activeTab === 'CONFIG' && <ConfigEditor />}
                    {activeTab === 'EVENTS' && <EventEditor />}
                </div>
            </div>
        </div>
    );
};
