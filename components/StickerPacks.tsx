import React, { useState, useRef } from 'react';
import { PACKS_DATA } from '../constants';
import { StickerPack } from '../types';
import { ChevronLeft, Upload } from 'lucide-react';

interface StickerPacksProps {
    onSelectSticker: (src: string) => void;
}

export const StickerPacks: React.FC<StickerPacksProps> = ({ onSelectSticker }) => {
    const [activePack, setActivePack] = useState<StickerPack | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                onSelectSticker(event.target.result as string);
            }
        };
        reader.readAsDataURL(file);
        
        // Reset input to allow selecting the same file again if needed
        e.target.value = '';
    };

    if (activePack) {
        return (
            <div className="p-4 h-full flex flex-col">
                <button 
                    onClick={() => setActivePack(null)} 
                    className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white mb-4 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back to Packs
                </button>
                <h3 className="text-white font-semibold mb-3">{activePack.name}</h3>
                <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-2 pb-12">
                    {activePack.stickers.map((src, idx) => (
                        <button 
                            key={idx}
                            onClick={() => onSelectSticker(src)}
                            className="aspect-square rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-900/10 transition-all p-2 flex items-center justify-center group"
                        >
                            <img src={src} alt="sticker" className="w-full h-full object-contain group-hover:scale-110 transition-transform" />
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Sticker Packs</h3>
            
            {/* Custom Upload Button */}
            <div className="mb-4">
                <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 px-4 bg-blue-600/10 hover:bg-blue-600/20 border border-dashed border-blue-500/30 hover:border-blue-500/50 rounded-xl flex items-center justify-center gap-3 text-blue-200 font-medium transition-all group"
                >
                    <div className="p-1.5 bg-blue-500 rounded-lg text-white shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                        <Upload size={16} />
                    </div>
                    <span className="text-sm">Upload Custom Sticker</span>
                </button>
                <input 
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCustomUpload}
                />
            </div>

            <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-2 pb-12">
                {PACKS_DATA.map((pack, idx) => (
                    <button 
                        key={idx}
                        onClick={() => setActivePack(pack)}
                        className="flex flex-col items-center p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700 hover:border-slate-600 transition-all text-center group"
                    >
                        <div className="w-12 h-12 mb-2 rounded-full bg-slate-900 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                            <img src={pack.thumbnail} alt={pack.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-medium text-slate-200 line-clamp-1">{pack.name}</span>
                        <span className="text-[10px] text-slate-500 mt-0.5">{pack.stickers.length} items</span>
                    </button>
                ))}
            </div>
            <div className="mt-auto pt-4 text-xs text-slate-500 border-t border-slate-800/50">
                Tip: Click a pack to view stickers.
            </div>
        </div>
    );
};