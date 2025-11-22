import React from 'react';
import { LayerItem } from '../types';
import { Trash2, Eraser, ArrowUp, ArrowDown, MousePointer2 } from 'lucide-react';

interface InspectorPanelProps {
    items: LayerItem[];
    selectedId: string | null;
    activeEraseLayerId: string | null;
    highlightedLayerId: string | null;
    eraserSize: number;
    onUpdateItem: (id: string, updates: Partial<LayerItem>) => void;
    onDeleteItem: (id: string) => void;
    onMoveLayer: (id: string, dir: 1 | -1) => void;
    onSelect: (id: string) => void;
    onToggleErase: (id: string) => void;
    setEraserSize: (size: number) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
    items, selectedId, activeEraseLayerId, highlightedLayerId, eraserSize,
    onUpdateItem, onDeleteItem, onMoveLayer, onSelect, onToggleErase, setEraserSize
}) => {
    
    const selectedItem = items.find(i => i.id === selectedId);

    return (
        <div className="flex flex-col h-full p-4 space-y-6 overflow-y-auto">
            {/* Transform Controls */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                    <MousePointer2 size={12} />
                    Transform
                </h3>
                
                {selectedItem && !activeEraseLayerId ? (
                    <div className="space-y-4 animate-in fade-in duration-300">
                         <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Scale</span>
                                <span className="text-slate-400">{Math.round((selectedItem.w / selectedItem.img.width) * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="10" max="200" 
                                value={(selectedItem.w / selectedItem.img.width) * 100}
                                onChange={(e) => {
                                    const p = parseInt(e.target.value) / 100;
                                    onUpdateItem(selectedItem.id, { w: selectedItem.img.width * p, h: selectedItem.img.height * p });
                                }}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Rotate</span>
                                <span className="text-slate-400">{Math.round(selectedItem.rotation)}°</span>
                            </div>
                            <input 
                                type="range" min="-180" max="180" 
                                value={selectedItem.rotation}
                                onChange={(e) => onUpdateItem(selectedItem.id, { rotation: parseInt(e.target.value) })}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span>Opacity</span>
                                <span className="text-slate-400">{Math.round(selectedItem.opacity * 100)}%</span>
                            </div>
                            <input 
                                type="range" min="0" max="100" 
                                value={selectedItem.opacity * 100}
                                onChange={(e) => onUpdateItem(selectedItem.id, { opacity: parseInt(e.target.value) / 100 })}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                        </div>
                    </div>
                ) : activeEraseLayerId ? (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                         <h4 className="text-sm font-semibold text-red-200 mb-2 flex items-center gap-2">
                             <Eraser size={14} /> Eraser Active
                         </h4>
                         <div className="space-y-1">
                            <div className="flex justify-between text-xs text-red-200/70">
                                <span>Brush Size</span>
                                <span>{eraserSize}px</span>
                            </div>
                            <input 
                                type="range" min="5" max="100" 
                                value={eraserSize}
                                onChange={(e) => setEraserSize(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                            />
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500 italic py-4 text-center border border-dashed border-slate-700 rounded-lg">
                        Select a layer to edit
                    </div>
                )}
            </div>

            {/* Layer List */}
            <div className="flex-1 flex flex-col min-h-0">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex justify-between items-center">
                    <span>Layers</span>
                    <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">{items.length}</span>
                </h3>
                
                <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                    {[...items].reverse().map((item, index) => {
                        // Reverse index for visual stack order (0 is bottom)
                        const actualIndex = items.length - 1 - index;
                        const isSelected = item.id === selectedId;
                        const isErasing = item.id === activeEraseLayerId;
                        const isHighlighted = item.id === highlightedLayerId;

                        return (
                            <div 
                                key={item.id}
                                onClick={() => onSelect(item.id)}
                                className={`
                                    flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 group cursor-pointer
                                    ${isSelected ? 'bg-blue-600/20 border-blue-500/50 shadow-sm shadow-blue-900/20' : 
                                      isErasing ? 'bg-red-900/20 border-red-500/50' :
                                      isHighlighted ? 'bg-blue-400/20 animate-highlight-flash' :
                                      'bg-slate-800/40 border-slate-700/30 hover:bg-slate-800 hover:border-slate-600'}
                                `}
                            >
                                <div 
                                    className="w-10 h-10 bg-slate-900 rounded border border-slate-700 flex-shrink-0 overflow-hidden"
                                >
                                    <img src={item.img.src} alt="layer" className="w-full h-full object-contain" />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="text-xs font-medium truncate text-slate-300">Layer {actualIndex + 1}</div>
                                    <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onMoveLayer(item.id, 1); }}
                                            disabled={actualIndex === items.length - 1}
                                            className="p-1 hover:bg-slate-600 rounded disabled:opacity-30" title="Move Up"
                                        >
                                            <ArrowUp size={12} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onMoveLayer(item.id, -1); }}
                                            disabled={actualIndex === 0}
                                            className="p-1 hover:bg-slate-600 rounded disabled:opacity-30" title="Move Down"
                                        >
                                            <ArrowDown size={12} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onToggleErase(item.id); }}
                                        className={`p-1.5 rounded transition-colors ${isErasing ? 'bg-red-500 text-white' : 'text-slate-400 hover:text-red-400 hover:bg-slate-700'}`}
                                        title="Erase Tool"
                                    >
                                        <Eraser size={14} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded transition-colors"
                                        title="Delete Layer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {items.length === 0 && (
                        <div className="text-xs text-center text-slate-600 py-8">
                            No layers yet.<br/>Add a sticker to start!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};