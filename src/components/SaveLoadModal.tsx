import { useState, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useCreationStore } from '../store/creationStore';
import { useUIStore } from '../store/uiStore';
import { type SaveMeta } from '../types';

interface SaveLoadModalProps {
    mode: 'LOAD' | 'NEW' | 'SAVE';
    onClose: () => void;
}

export const SaveLoadModal = ({ mode, onClose }: SaveLoadModalProps) => {
    const { getSlots, loadGame, saveGame, deleteSave, exportSave, importSave } = useGameStore();
    const [slotsData, setSlotsData] = useState<SaveMeta>(() => getSlots());
    const [confirmOverwrite, setConfirmOverwrite] = useState<number | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
    const [importMessage, setImportMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importTargetSlot, setImportTargetSlot] = useState<number | null>(null);

    const refresh = () => setSlotsData(getSlots());

    const handleSlotClick = (slotId: number) => {
        if (confirmDelete !== null) return;

        const slot = slotsData.slots[slotId];

        if (mode === 'LOAD') {
            if (slot && !slot.empty) {
                if (loadGame(slotId)) {
                    onClose();
                } else {
                    setImportMessage({ text: '存档读取失败：数据损坏或版本不兼容。', type: 'error' });
                }
            }
        } else if (mode === 'NEW') {
            if (slot && !slot.empty && confirmOverwrite !== slotId) {
                setConfirmOverwrite(slotId);
            } else {
                useUIStore.getState().setScene('TALENT');
                useCreationStore.getState().drawTalents();
                useGameStore.setState({ currentSlot: slotId });
                onClose();
            }
        } else if (mode === 'SAVE') {
            if (slot && !slot.empty && confirmOverwrite !== slotId) {
                setConfirmOverwrite(slotId);
            } else {
                saveGame(slotId);
                onClose();
            }
        }
    };

    const handleDeleteClick = (e: React.MouseEvent, slotId: number) => {
        e.stopPropagation();
        setConfirmDelete(slotId);
        setConfirmOverwrite(null);
        setImportMessage(null);
    };

    const handleDeleteConfirm = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirmDelete !== null) {
            deleteSave(confirmDelete);
            setConfirmDelete(null);
            refresh();
        }
    };

    const handleDeleteCancel = (e: React.MouseEvent) => {
        e.stopPropagation();
        setConfirmDelete(null);
    };

    const handleExport = (e: React.MouseEvent, slotId: number) => {
        e.stopPropagation();
        exportSave(slotId);
        setImportMessage({ text: '存档已导出为 JSON 文件。', type: 'success' });
        setTimeout(() => setImportMessage(null), 3000);
    };

    const handleImportClick = (e: React.MouseEvent, slotId: number) => {
        e.stopPropagation();
        setImportTargetSlot(slotId);
        setImportMessage(null);
        fileInputRef.current?.click();
    };

    const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || importTargetSlot === null) return;

        if (!file.name.endsWith('.json')) {
            setImportMessage({ text: '请选择 .json 格式的存档文件。', type: 'error' });
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const jsonData = ev.target?.result as string;
            if (!jsonData) {
                setImportMessage({ text: '文件读取失败。', type: 'error' });
                return;
            }

            const result = importSave(importTargetSlot!, jsonData);
            setImportMessage({
                text: result.message,
                type: result.success ? 'success' : 'error'
            });
            if (result.success) {
                refresh();
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-slate-200 p-8 w-[650px] shadow-2xl rounded-xl relative overflow-hidden flex flex-col max-h-[80vh]">
                {/* Decor */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

                {/* Hidden file input */}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelected}
                    className="hidden"
                />

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-serif text-slate-800 tracking-[0.2em] font-bold" style={{ fontFamily: '"Ma Shan Zheng", serif' }}>
                        {mode === 'LOAD' ? '读取存档' : mode === 'NEW' ? '选择存档位' : '保存进度'}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">✕</button>
                </div>

                {/* Status Message */}
                {importMessage && (
                    <div className={`mb-4 px-4 py-2 rounded text-sm font-serif animate-fade-in ${importMessage.type === 'success'
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                        }`}>
                        {importMessage.text}
                    </div>
                )}

                <div className="space-y-3 overflow-y-auto custom-scrollbar flex-1 p-1">
                    {[0, 1, 2].map(slotId => {
                        const slot = slotsData.slots[slotId];
                        const isEmpty = !slot || slot.empty;
                        const isConfirming = confirmOverwrite === slotId;
                        const isDeleting = confirmDelete === slotId;

                        return (
                            <div
                                key={slotId}
                                onClick={() => handleSlotClick(slotId)}
                                className={`
                                    relative p-5 rounded-lg border transition-all duration-300 cursor-pointer group flex items-center gap-5
                                    ${isEmpty
                                        ? 'bg-slate-50 border-slate-200 border-dashed hover:bg-slate-100 hover:border-slate-300'
                                        : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                                    }
                                    ${isConfirming ? 'border-amber-400 bg-amber-50' : ''}
                                    ${isDeleting ? 'border-red-400 bg-red-50' : ''}
                                `}
                            >
                                {/* Slot Number */}
                                <div className="text-4xl font-serif text-slate-700 font-bold group-hover:text-slate-600 transition-colors">
                                    {slotId + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    {isEmpty ? (
                                        <div className="text-slate-400 font-serif tracking-widest group-hover:text-slate-500">
                                            {mode === 'NEW' ? '新建存档' : '空存档位'}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-1">
                                            <div className="flex justify-between items-center">
                                                <span className="text-lg text-emerald-700 font-serif font-bold tracking-wider">
                                                    {slot.name}
                                                </span>
                                                <span className="text-xs text-slate-400 font-mono">
                                                    {new Date(slot.timestamp).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="text-sm text-slate-500 font-serif">
                                                {slot.summary}
                                            </div>
                                        </div>
                                    )}

                                    {/* Overwrite Prompt */}
                                    {isConfirming && (
                                        <div className="absolute inset-0 bg-white/95 flex items-center justify-center text-amber-600 font-serif tracking-widest z-10 rounded-lg animate-fade-in">
                                            {mode === 'SAVE' ? '覆盖此存档？' : '覆盖并开始新游戏？'} (点击确认)
                                        </div>
                                    )}

                                    {/* Delete Confirmation */}
                                    {isDeleting && (
                                        <div className="absolute inset-0 bg-white/95 flex items-center justify-center gap-4 z-30 rounded-lg animate-fade-in">
                                            <span className="text-red-600 font-serif tracking-widest">确定删除此存档？</span>
                                            <button
                                                onClick={handleDeleteConfirm}
                                                className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors font-serif"
                                            >
                                                确认删除
                                            </button>
                                            <button
                                                onClick={handleDeleteCancel}
                                                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm rounded transition-colors font-serif"
                                            >
                                                取消
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                {!isDeleting && (
                                    <div className="flex items-center gap-1 z-20">
                                        {!isEmpty && (
                                            <button
                                                onClick={(e) => handleExport(e, slotId)}
                                                className="p-2 text-slate-400 hover:text-sky-600 transition-colors"
                                                title="导出存档"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => handleImportClick(e, slotId)}
                                            className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                                            title="导入存档到此存档位"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                                            </svg>
                                        </button>
                                        {!isEmpty && (
                                            <button
                                                onClick={(e) => handleDeleteClick(e, slotId)}
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="删除存档"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
