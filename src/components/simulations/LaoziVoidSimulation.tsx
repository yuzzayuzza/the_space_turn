import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RotateCcw, Brush, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface WallSegment {
  x1: number; // normalized 0..1
  y1: number; // normalized 0..1
  x2: number; // normalized 0..1
  y2: number; // normalized 0..1
}

const DEFAULT_WALLS: WallSegment[] = [
  // A traditional courtyard with windows/doors left open, centered adaptively in safe zone
  { x1: 0.20, y1: 0.25, x2: 0.80, y2: 0.25 }, // Top wall
  { x1: 0.80, y1: 0.25, x2: 0.80, y2: 0.73 }, // Right wall
  { x1: 0.20, y1: 0.73, x2: 0.42, y2: 0.73 }, // Bottom wall left
  { x1: 0.58, y1: 0.73, x2: 0.80, y2: 0.73 }, // Bottom wall right (doorway between 0.42 and 0.58)
  { x1: 0.20, y1: 0.25, x2: 0.20, y2: 0.42 }, // Left wall top
  { x1: 0.20, y1: 0.56, x2: 0.20, y2: 0.73 }, // Left wall bottom (window between 0.42 and 0.56)
];

export const LaoziVoidSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [walls, setWalls] = useState<WallSegment[]>(DEFAULT_WALLS);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMouse, setCurrentMouse] = useState<{ x: number; y: number } | null>(null);
  const [voidGlow, setVoidGlow] = useState(80);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating Qi particles within the void
    const qiParticles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      qiParticles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.001,
        vy: -Math.random() * 0.0015 - 0.0003,
        alpha: Math.random() * 0.5 + 0.2,
        size: Math.random() * 2.5 + 1,
      });
    }

    const render = () => {
      time += 0.02;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);

      // Base background: Ethereal parchment ink depth
      ctx.fillStyle = '#0a0d0c';
      ctx.fillRect(0, 0, w, h);

      // Adaptive center of courtyard (centered between top HUD banner and bottom epigraph)
      const cx = w * 0.5;
      const cy = h * 0.49;
      const roomRadius = Math.min(w * 0.30, h * 0.24);

      // Render Void Radiance (虚室生白) in enclosed central areas
      const pulse = Math.sin(time) * 12;
      const voidRad = ctx.createRadialGradient(cx, cy, 15, cx, cy, roomRadius + pulse);
      voidRad.addColorStop(0, `rgba(240, 253, 244, ${(voidGlow / 100) * 0.28})`);
      voidRad.addColorStop(0.5, `rgba(167, 243, 208, ${(voidGlow / 100) * 0.12})`);
      voidRad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = voidRad;
      ctx.fillRect(0, 0, w, h);

      // Qi (气韵) drifting particles through doorways and windows
      qiParticles.forEach(p => {
        p.x += p.vx + Math.sin(time + p.y * 10) * 0.0004;
        p.y += p.vy;

        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;

        const px = p.x * w;
        const py = p.y * h;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 250, 229, ${p.alpha * (voidGlow / 100)})`;
        ctx.fill();
      });

      // Draw all walls ("有" / 实体之梁木) with Calligraphic Ink Texture
      walls.forEach(wall => {
        const x1 = wall.x1 * w;
        const y1 = wall.y1 * h;
        const x2 = wall.x2 * w;
        const y2 = wall.y2 * h;

        ctx.strokeStyle = '#1e2923';
        ctx.lineWidth = Math.max(8, Math.min(14, w * 0.025));
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Inner ink stroke core
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Draw wall drawing in-progress
      if (isDrawing && startPoint && currentMouse) {
        ctx.strokeStyle = '#6ee7b7';
        ctx.setLineDash([6, 4]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(startPoint.x * w, startPoint.y * h);
        ctx.lineTo(currentMouse.x * w, currentMouse.y * h);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Poetic Annotations on the Canvas (Positioned gracefully relative to the room)
      ctx.font = '12px "Noto Serif SC", serif';
      ctx.fillStyle = 'rgba(167, 243, 208, 0.85)';
      ctx.textAlign = 'center';
      ctx.fillText('【虚室生白：虚无之妙用】', cx, cy);

      ctx.font = '11px "Noto Serif SC", serif';
      ctx.fillStyle = 'rgba(134, 167, 137, 0.75)';
      ctx.fillText('【门牖户空：气流吞吐】', cx, h * 0.73 + 18);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [walls, isDrawing, startPoint, currentMouse, voidGlow]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = {
      x: Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height)),
    };
    setIsDrawing(true);
    setStartPoint(pt);
    setCurrentMouse(pt);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDrawing) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = {
      x: Math.max(0.02, Math.min(0.98, (e.clientX - rect.left) / rect.width)),
      y: Math.max(0.02, Math.min(0.98, (e.clientY - rect.top) / rect.height)),
    };
    setCurrentMouse(pt);
  };

  const handlePointerUp = () => {
    if (isDrawing && startPoint && currentMouse && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const pxDist = Math.hypot(
        (currentMouse.x - startPoint.x) * rect.width,
        (currentMouse.y - startPoint.y) * rect.height
      );
      if (pxDist > 12) {
        setWalls(prev => [
          ...prev,
          {
            x1: startPoint.x,
            y1: startPoint.y,
            x2: currentMouse.x,
            y2: currentMouse.y,
          },
        ]);
        audioAtmosphere.playChime(380);
      }
    }
    setIsDrawing(false);
    setStartPoint(null);
    setCurrentMouse(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#131514] text-[#eae7e0] select-none relative overflow-hidden">
      {/* Top Editorial Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1a1c1a] border-b border-[#303632] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#86a789] animate-pulse shrink-0" />
          <span className="font-serif font-medium tracking-wide text-[#eae7e0] truncate text-xs">
            老子：当其无有室之用 · 虚室生白与器用本体
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#3e4a42] text-[#86a789] bg-[#222724] shrink-0">
            TAOIST
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 sm:gap-2 text-[#b0c0b4]">
            <span className="font-serif text-[11px] sm:text-xs">生白明度:</span>
            <input
              type="range"
              min="30"
              max="100"
              value={voidGlow}
              onChange={e => setVoidGlow(Number(e.target.value))}
              className="w-16 sm:w-20 accent-[#86a789] cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setWalls(DEFAULT_WALLS);
              audioAtmosphere.playChime(310);
            }}
            className="flex items-center gap-1 text-[#86a789] hover:text-[#eae7e0] transition-colors cursor-pointer border border-[#37423a] px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#202522] text-[11px]"
            title="恢复预设开敞合院"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">复原</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[460px] cursor-crosshair overflow-hidden select-none bg-[#111312] touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Tip */}
        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-6 right-2.5 sm:right-auto z-20 text-[10px] sm:text-[11px] text-[#86a789] bg-[#1a1d1b]/90 px-2.5 sm:px-3.5 py-1 sm:py-1.5 border border-[#323b35] font-serif flex items-center gap-1.5 sm:gap-2">
          <Brush className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>拖拽/滑动筑墙：实体为“利”，两壁留出的“无”才是真正大用</span>
        </div>

        {/* Bottom Annotation with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-4 left-2.5 sm:left-6 right-2.5 sm:right-6 z-30 pointer-events-none">
          <div className="bg-[#181b19]/92 backdrop-blur-md px-3 py-2 sm:p-4 border border-[#303832] shadow-xl max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#86a789] font-mono truncate">
                老子《道德经》第十一章 · 有之以为利，无之以为用
              </span>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#86a789] hover:text-[#eae7e0] cursor-pointer flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-[#37423a] bg-[#202522]"
              >
                <span>{isQuoteExpanded ? '收起' : '展开'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-[#303832] text-center">
                <p className="text-xs font-serif text-[#eae7e0] leading-relaxed italic">
                  “凿户牖以为室，当其无，有室之用。故有之以为利，无之以为用。”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
