import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { ModuleConfig } from '../types/meta';

export const ConfigEditor: React.FC = () => {
    const { engine, updateRuntimeConfig } = useGameStore();
    const [statsJson, setStatsJson] = useState(() =>
        JSON.stringify(engine.moduleConfig.stats, null, 2)
    );
    const [resourcesJson, setResourcesJson] = useState(() =>
        JSON.stringify(engine.moduleConfig.resources, null, 2)
    );
    const [error, setError] = useState('');

    const handleApply = (field: 'stats' | 'resources', json: string) => {
        try {
            const parsed = JSON.parse(json) as ModuleConfig['stats'] | ModuleConfig['resources'];
            updateRuntimeConfig(field, parsed);
            setError('');
            alert(`✓ ${field === 'stats' ? '属性配置' : '资源配置'}已更新`);
        } catch (e) {
            setError(`JSON 解析失败: ${(e as Error).message}`);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            {error && (
                <div className="text-xs text-red-400 bg-red-900/20 rounded p-2">{error}</div>
            )}

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-emerald-400 font-bold">属性定义 (Stats)</h3>
                    <button
                        onClick={() => handleApply('stats', statsJson)}
                        className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded text-xs"
                    >
                        应用更改
                    </button>
                </div>
                <textarea
                    className="w-full h-64 bg-slate-900 border border-slate-600 rounded p-3 text-xs text-slate-200 font-mono outline-none focus:border-emerald-500 resize-y"
                    value={statsJson}
                    onChange={e => setStatsJson(e.target.value)}
                />
            </div>

            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-amber-400 font-bold">资源定义 (Resources)</h3>
                    <button
                        onClick={() => handleApply('resources', resourcesJson)}
                        className="px-3 py-1 bg-amber-700 hover:bg-amber-600 text-white rounded text-xs"
                    >
                        应用更改
                    </button>
                </div>
                <textarea
                    className="w-full h-48 bg-slate-900 border border-slate-600 rounded p-3 text-xs text-slate-200 font-mono outline-none focus:border-amber-500 resize-y"
                    value={resourcesJson}
                    onChange={e => setResourcesJson(e.target.value)}
                />
            </div>
        </div>
    );
};
