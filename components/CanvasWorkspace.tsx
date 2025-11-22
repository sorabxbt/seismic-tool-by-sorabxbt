import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { LayerItem } from '../types';

interface CanvasWorkspaceProps {
  items: LayerItem[];
  baseImg: HTMLImageElement | null;
  selectedId: string | null;
  activeEraseLayerId: string | null;
  eraserSize: number;
  onSelect: (id: string | null) => void;
  onUpdateItem: (id: string, updates: Partial<LayerItem>) => void;
}

export const CanvasWorkspace = forwardRef<HTMLCanvasElement, CanvasWorkspaceProps>(
  ({ items, baseImg, selectedId, activeEraseLayerId, eraserSize, onSelect, onUpdateItem }, ref) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    // Expose the internal ref to parent via forwardRef
    useImperativeHandle(ref, () => internalCanvasRef.current!);

    // Interaction State
    const isDragging = useRef(false);
    const isErasing = useRef(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const dragOffset = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });

    // Helper: Draw function
    const draw = () => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const width = 420;
      const height = 420;

      // Ensure canvas physical size matches visual size * dpr
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);
      } else {
        ctx.clearRect(0, 0, width, height);
      }

      // Draw Background
      // Fill dark
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      if (baseImg) {
        const ratio = baseImg.width / baseImg.height;
        let drawW = width, drawH = height, drawX = 0, drawY = 0;
        if (width / height > ratio) {
          drawH = height;
          drawW = drawH * ratio;
          drawX = (width - drawW) / 2;
        } else {
          drawW = width;
          drawH = drawW / ratio;
          drawY = (height - drawH) / 2;
        }
        ctx.drawImage(baseImg, drawX, drawY, drawW, drawH);
      }

      // Draw Items
      items.forEach(item => {
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate((item.rotation * Math.PI) / 180);
        ctx.globalAlpha = item.opacity;

        const drawW = item.w;
        const drawH = item.h;
        const drawX = -drawW / 2;
        const drawY = -drawH / 2;

        if (item.maskCanvas) {
          // Create temp canvas to apply mask
          const temp = document.createElement('canvas');
          temp.width = item.img.width;
          temp.height = item.img.height;
          const tCtx = temp.getContext('2d');
          if (tCtx) {
             tCtx.drawImage(item.img, 0, 0);
             tCtx.globalCompositeOperation = 'destination-in';
             tCtx.drawImage(item.maskCanvas, 0, 0);
             ctx.drawImage(temp, drawX, drawY, drawW, drawH);
          }
        } else {
          ctx.drawImage(item.img, drawX, drawY, drawW, drawH);
        }

        // Selection Highlight
        if (item.id === selectedId && !activeEraseLayerId) {
          ctx.strokeStyle = 'rgba(96, 165, 250, 0.8)';
          ctx.lineWidth = 2;
          ctx.strokeRect(drawX, drawY, drawW, drawH);
          
          // Corner handles (visual only)
          ctx.fillStyle = '#60a5fa';
          const handleSize = 6;
          ctx.fillRect(drawX - handleSize/2, drawY - handleSize/2, handleSize, handleSize);
          ctx.fillRect(drawX + drawW - handleSize/2, drawY + drawH - handleSize/2, handleSize, handleSize);
        }

        ctx.restore();
      });

      // Eraser Brush Cursor Preview
      if (activeEraseLayerId) {
        // We draw the cursor only if we have mouse pos, but let's just use CSS cursor mostly.
        // Here we can draw a ring at lastPos if needed, but simple CSS is often smoother.
      }
    };

    // Trigger draw on prop updates
    useEffect(() => {
      requestAnimationFrame(draw);
    }, [items, baseImg, selectedId, activeEraseLayerId]);


    // Pointer Handlers
    const getPointerPos = (e: React.PointerEvent) => {
      const canvas = internalCanvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const r = canvas.getBoundingClientRect();
      const width = 420; // logical width
      const height = 420; // logical height
      return {
        x: (e.clientX - r.left) * (width / r.width),
        y: (e.clientY - r.top) * (height / r.height)
      };
    };

    const handlePointerDown = (e: React.PointerEvent) => {
        const { x, y } = getPointerPos(e);
        lastPos.current = { x, y };
        const canvas = internalCanvasRef.current;
        if(canvas) canvas.setPointerCapture(e.pointerId);

        // Eraser Logic
        if (activeEraseLayerId) {
            const item = items.find(i => i.id === activeEraseLayerId);
            if (item) {
                isErasing.current = true;
                eraseAt(item, x, y);
                requestAnimationFrame(draw);
            }
            return;
        }

        // Selection/Drag Logic (Reverse iterate to hit top items first)
        let foundId: string | null = null;
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            // Simple bounding box check (ignoring rotation for hit test simplicity or implementing math)
            // Implementing rotation-aware hit test:
            const dx = x - item.x;
            const dy = y - item.y;
            const angle = -item.rotation * (Math.PI / 180);
            const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
            const ly = dx * Math.sin(angle) + dy * Math.cos(angle);
            
            if (lx >= -item.w/2 && lx <= item.w/2 && ly >= -item.h/2 && ly <= item.h/2) {
                foundId = item.id;
                dragOffset.current = { x: lx, y: ly }; // Offset from center in local space
                // actually simpler: store offset from center in screen space is tricky with rotation.
                // Let's store simple screen delta.
                dragStart.current = { x, y };
                dragOffset.current = { x: item.x - x, y: item.y - y };
                break;
            }
        }

        if (foundId) {
            onSelect(foundId);
            isDragging.current = true;
        } else {
            onSelect(null);
        }
        requestAnimationFrame(draw);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        const { x, y } = getPointerPos(e);
        
        if (activeEraseLayerId && isErasing.current) {
            const item = items.find(i => i.id === activeEraseLayerId);
            if (item) {
                // Interpolate for smoother erasing
                const dist = Math.hypot(x - lastPos.current.x, y - lastPos.current.y);
                const steps = Math.ceil(dist / (eraserSize * 0.2));
                for (let i = 0; i <= steps; i++) {
                    const t = i / steps;
                    const ix = lastPos.current.x + (x - lastPos.current.x) * t;
                    const iy = lastPos.current.y + (y - lastPos.current.y) * t;
                    eraseAt(item, ix, iy);
                }
                requestAnimationFrame(draw);
            }
        } else if (isDragging.current && selectedId) {
            onUpdateItem(selectedId, {
                x: x + dragOffset.current.x,
                y: y + dragOffset.current.y
            });
            // We rely on parent state update triggering useEffect -> draw
            // If perf is bad, we can mutate a local ref and draw, then sync on up.
            // But for sticker app, this is fine.
        }
        
        lastPos.current = { x, y };
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        isDragging.current = false;
        isErasing.current = false;
        const canvas = internalCanvasRef.current;
        if(canvas) canvas.releasePointerCapture(e.pointerId);
    };

    const eraseAt = (item: LayerItem, x: number, y: number) => {
        if (!item.maskCanvas) return;
        
        // Transform screen coords to mask image coords
        const dx = x - item.x;
        const dy = y - item.y;
        const angle = -item.rotation * (Math.PI / 180);
        const lx = dx * Math.cos(angle) - dy * Math.sin(angle);
        const ly = dx * Math.sin(angle) + dy * Math.cos(angle);

        // lx, ly are relative to center of sticker in pixels (visual size)
        // Need to map to original image pixels
        const scaleX = item.img.width / item.w;
        const scaleY = item.img.height / item.h;

        const maskX = (lx + item.w / 2) * scaleX; // Shift center to top-left
        const maskY = (ly + item.h / 2) * scaleY;

        const ctx = item.maskCanvas.getContext('2d');
        if (ctx) {
            ctx.save();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(maskX, maskY, (eraserSize * scaleX) / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    };

    return (
      <canvas
        ref={internalCanvasRef}
        width={420}
        height={420}
        className="w-[420px] h-[420px] max-w-full max-h-[70vh] aspect-square touch-none cursor-crosshair shadow-inner bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGA4A8MwACA/m4GBgQGkHiQOswAyDqQHZADJCEY00QCSCIqNIBw2AQB+OQ0u2r9yOQAAAABJRU5ErkJggg==')] bg-opacity-5 rounded-lg"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
    );
  }
);