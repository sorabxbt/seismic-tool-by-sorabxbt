import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CanvasWorkspace } from './components/CanvasWorkspace';
import { StickerPacks } from './components/StickerPacks';
import { InspectorPanel } from './components/InspectorPanel';
import { CircularSlider } from './components/CircularSlider';
import { LayerItem } from './types';
import { Download, Upload, Trash2 } from 'lucide-react';

export default function App() {
  const [items, setItems] = useState<LayerItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeEraseLayerId, setActiveEraseLayerId] = useState<string | null>(null);
  const [baseImg, setBaseImg] = useState<HTMLImageElement | null>(null);
  const [eraserSize, setEraserSize] = useState(50);
  const [highlightedLayerId, setHighlightedLayerId] = useState<string | null>(null);
  
  // Refs for imperative actions
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleAddItem = useCallback((src: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
      const initialSize = Math.min(140, img.width * 0.4);
      
      // Create mask canvas for eraser
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = img.width;
      maskCanvas.height = img.height;
      const ctx = maskCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, img.width, img.height);
      }

      const newItem: LayerItem = {
        id,
        img,
        x: 210, // Center of 420x420 canvas
        y: 210,
        w: initialSize,
        h: initialSize,
        rotation: 0,
        opacity: 1,
        maskCanvas
      };

      setItems(prev => [...prev, newItem]);
      setSelectedId(id);
      setActiveEraseLayerId(null);
      setHighlightedLayerId(id);
      setTimeout(() => setHighlightedLayerId(null), 500);
    };
  }, []);

  const handleUploadBaseImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      setBaseImg(img);
      // Reset items to center if needed, or keep them relative.
      // For simplicity, we center items on new canvas
      setItems(prev => prev.map(i => ({ ...i, x: 210, y: 210 })));
    };
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `seismic-creation-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClear = () => {
    setItems([]);
    setBaseImg(null);
    setSelectedId(null);
    setActiveEraseLayerId(null);
  };

  const handleUpdateItem = (id: string, updates: Partial<LayerItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleDeleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (activeEraseLayerId === id) setActiveEraseLayerId(null);
  };

  const handleMoveLayer = (id: string, direction: 1 | -1) => {
    const index = items.findIndex(i => i.id === id);
    if (index === -1) return;
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= items.length) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(newIndex, 0, movedItem);
    setItems(newItems);
    setHighlightedLayerId(id);
    setTimeout(() => setHighlightedLayerId(null), 500);
  };

  // Update cursor based on mode
  useEffect(() => {
    document.body.style.cursor = activeEraseLayerId ? 'crosshair' : 'default';
  }, [activeEraseLayerId]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0b1020] text-slate-200">
      {/* Header */}
      <header className="p-4 border-b border-slate-800 shadow-lg text-center bg-slate-900/50 z-10">
        <h1 className="text-xl font-semibold text-white flex justify-center items-center gap-2 flex-wrap">
          <span>A free tool for the Seismic community —</span>
          <a href="https://x.com/sorabxbt" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 group cursor-pointer">
            <span className="font-extrabold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              sorabxbt
            </span>
            <span className="w-7 h-7 rounded-full overflow-hidden border border-slate-500 bg-slate-800">
               {/* Placeholder logo */}
               <img src="https://picsum.photos/id/64/100/100" className="w-full h-full object-cover" alt="logo" />
            </span>
          </a>
        </h1>
      </header>

      {/* Main Grid */}
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-[300px_1fr_360px] gap-6 p-4 lg:p-6 overflow-hidden">
        
        {/* Left Panel: Sticker Packs */}
        <aside className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden order-2 lg:order-1 h-[30vh] lg:h-auto">
            <StickerPacks onSelectSticker={handleAddItem} />
        </aside>

        {/* Center: Canvas & Controls */}
        <section className="flex flex-col items-center space-y-6 overflow-y-auto order-1 lg:order-2 py-2">
          
          {/* Canvas Card */}
          <div className="relative p-4 bg-slate-800/60 rounded-2xl border border-slate-700 shadow-2xl backdrop-blur-sm">
            <CanvasWorkspace
              ref={canvasRef}
              items={items}
              baseImg={baseImg}
              selectedId={selectedId}
              activeEraseLayerId={activeEraseLayerId}
              eraserSize={eraserSize}
              onSelect={id => {
                setSelectedId(id);
                if (id !== activeEraseLayerId) setActiveEraseLayerId(null);
              }}
              onUpdateItem={handleUpdateItem}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 w-full max-w-xl px-4">
            <div className="flex-1 min-w-[140px] bg-slate-900/50 p-3 rounded-xl border border-slate-800 shadow-lg">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-900/20"
              >
                <Upload size={18} />
                <span>Upload Photo</span>
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleUploadBaseImage} 
              />
            </div>

            <div className="flex-1 min-w-[140px] bg-slate-900/50 p-3 rounded-xl border border-slate-800 shadow-lg">
              <button 
                onClick={handleDownload}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-emerald-900/20"
              >
                <Download size={18} />
                <span>Download</span>
              </button>
            </div>

            <div className="flex-1 min-w-[140px] bg-slate-900/50 p-3 rounded-xl border border-slate-800 shadow-lg">
              <button 
                onClick={handleClear}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-lg transition-all border border-slate-600"
              >
                <Trash2 size={18} />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Circular Slider */}
          <div className="w-full max-w-4xl mt-auto hidden lg:block">
            <CircularSlider />
          </div>
        </section>

        {/* Right Panel: Inspector */}
        <aside className="bg-slate-900/50 rounded-xl border border-slate-800 shadow-xl flex flex-col overflow-hidden order-3 lg:order-3 h-[40vh] lg:h-auto">
          <InspectorPanel 
            items={items}
            selectedId={selectedId}
            activeEraseLayerId={activeEraseLayerId}
            highlightedLayerId={highlightedLayerId}
            eraserSize={eraserSize}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
            onMoveLayer={handleMoveLayer}
            onSelect={id => {
               setSelectedId(id);
               setActiveEraseLayerId(null);
            }}
            onToggleErase={id => {
              if (activeEraseLayerId === id) {
                setActiveEraseLayerId(null);
              } else {
                setActiveEraseLayerId(id);
                setSelectedId(null); // Deselect for transformation when erasing
              }
            }}
            setEraserSize={setEraserSize}
          />
        </aside>

      </main>

      {/* Footer */}
      <footer className="p-4 text-xs text-center border-t border-slate-800 text-slate-500 bg-slate-900/80">
        We love seeing what you make! Once your masterpiece is ready, share it on social media and tag @sorabxbt.
      </footer>
    </div>
  );
}