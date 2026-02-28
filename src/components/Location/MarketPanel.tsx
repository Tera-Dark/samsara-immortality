import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { ITEMS } from '../../data/items';

interface MarketPanelProps {
    onClose: () => void;
}

export const MarketPanel: React.FC<MarketPanelProps> = ({ onClose }) => {
    const { gameState, engine } = useGameStore();
    const { inventory } = gameState;
    const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');

    // Simple market inventory for now
    // In future: dynamic based on location type/level
    const SHOP_ITEMS = ['healing_pill_small', 'qi_gathering_pill', 'iron'];

    const handleBuy = (itemId: string, price: number) => {
        if (engine.getMoney() < price) {
            alert("灵石不足！");
            return;
        }
        engine.spendMoney(price);
        engine.addItem(itemId, 1);
        useGameStore.setState({ gameState: { ...engine.state } });
    };

    const handleSell = (itemId: string, _count: number, price: number) => {
        if (engine.removeItem(itemId, 1)) {
            engine.earnMoney(price);
            useGameStore.setState({ gameState: { ...engine.state } });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center catch-events z-50">
            <div className="w-[800px] h-[600px] bg-white border border-slate-200 rounded-lg flex flex-col shadow-2xl">
                {/* Header */}
                <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-800/50">
                    <div className="flex gap-4">
                        <h2 className="text-xl font-bold text-blue-400 tracking-wider">坊 市</h2>
                        <div className="flex bg-slate-800 rounded p-1">
                            <button
                                onClick={() => setMode('BUY')}
                                className={`px-4 py-1 rounded transition-all ${mode === 'BUY' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                购买
                            </button>
                            <button
                                onClick={() => setMode('SELL')}
                                className={`px-4 py-1 rounded transition-all ${mode === 'SELL' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'}`}
                            >
                                出售
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {mode === 'BUY' ? (
                        <div className="space-y-2">
                            {SHOP_ITEMS.map(id => {
                                const item = ITEMS[id];
                                if (!item) return null;
                                const price = item.value * 2; // Markup
                                return (
                                    <div key={id} className="flex justify-between items-center bg-slate-800 p-3 rounded">
                                        <div>
                                            <div className="font-bold text-slate-700">{item.name}</div>
                                            <div className="text-xs text-slate-500">{item.description}</div>
                                        </div>
                                        <button
                                            onClick={() => handleBuy(id, price)}
                                            className="bg-blue-700 px-3 py-1 rounded text-white text-sm hover:bg-blue-600"
                                        >
                                            {price} 灵石
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {inventory.map(slot => {
                                const item = ITEMS[slot.itemId];
                                if (!item) return null;
                                const sellPrice = Math.floor(item.value * 0.5); // Markdown
                                return (
                                    <div key={slot.itemId} className="flex justify-between items-center bg-slate-800 p-3 rounded">
                                        <div>
                                            <div className="font-bold text-slate-700">{item.name} x{slot.count}</div>
                                            <div className="text-xs text-slate-500">{item.description}</div>
                                        </div>
                                        <button
                                            onClick={() => handleSell(slot.itemId, 1, sellPrice)}
                                            className="bg-amber-700 px-3 py-1 rounded text-white text-sm hover:bg-amber-600"
                                        >
                                            出售 (+{sellPrice})
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 bg-slate-800/50 flex justify-between items-center">
                    <div className="text-amber-400 font-bold">
                        拥有灵石: {engine.getMoney()}
                    </div>
                    <button onClick={onClose} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded">
                        离开
                    </button>
                </div>
            </div>
        </div>
    );
};
