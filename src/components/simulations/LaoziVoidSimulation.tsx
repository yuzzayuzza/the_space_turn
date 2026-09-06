import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, RotateCcw, Brush, Layers } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export const LaoziVoidSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [walls, setWalls] = useState<WallSegment[]>([
    // A traditional courtyard with windows/doors left open
    { x1: 200, y1: 140, x2: 440, y2: 140 }, // Top wall
    { x1: 440, y1: 140, x2: 440, y2: 360 }, // Right wall
    { x1: 200, y1: 360, x2: 300, y2: 360 }, // Bottom wall left
    { x1: 360, y1: 360, x2: 440, y2: 360 }, // Bottom wall right (doorway between 300 and 360!)
    { x1: 200, y1: 140, x2: 200, y2: 220 }, // Left wall top
    { x1: 200, y1: 280, x2: 200, y2: 360 }, // Left wall bottom (window between 220 and 280!)
  ]);

  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentMouse, setCurrentMouse] = useState<{ x: number; y: number } | null>(null);
  const [voidGlow, setVoidGlow] = useState(80);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      if (!containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Floating Qi particles within the void
    const qiParticles: { x: number; y: number; vx: number; vy: number; alpha: number; size: number }[] = [];
    for (let i = 0; i < 50; i++) {
      qiParticles.push({
        x: Math.random() * 800,
        y: Math.random() * 500,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        alpha: Math.random() * 0.5 + 0.2,
        size: Math.random() * 3 + 1,
      });
    }

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      // Base background: Ethereal parchment ink depth
      ctx.fillStyle = '#0a0d0c';
      ctx.fillRect(0, 0, w, h);

      // Render Void Radiance (虚室生白) in enclosed central areas
      const pulse = Math.sin(time) * 15;
      const voidRad = ctx.createRadialGradient(320, 250, 20, 320, 250, 160 + pulse);
      voidRad.addColorStop(0, `rgba(240, 253, 244, ${(voidGlow / 100) * 0.25})`);
      voidRad.addColorStop(0.5, `rgba(167, 243, 208, ${(voidGlow / 100) * 0.1})`);
      voidRad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = voidRad;
      ctx.fillRect(0, 0, w, h);

      // Qi (气韵) drifting particles through doorways and windows
      qiParticles.forEach(p => {
        p.x += p.vx + Math.sin(time + p.y * 0.01) * 0.2;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 250, 229, ${p.alpha * (voidGlow / 100)})`;
        ctx.fill();
      });

      // Draw all walls ("有" / 实体之梁木) with Calligraphic Ink Texture
      walls.forEach(w => {
        ctx.strokeStyle = '#1e2923';
        ctx.lineWidth = 14;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(w.x1, w.y1);
        ctx.lineTo(w.x2, w.y2);
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
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(currentMouse.x, currentMouse.y);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Poetic Annotations on the Canvas
      ctx.font = '13px "Noto Serif SC", serif';
      ctx.fillStyle = 'rgba(167, 243, 208, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText('【门牖户空：气流吞吐之口】', 330, 395);
      ctx.fillText('【虚室生白：虚无之妙用】', 320, 250);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [walls, isDrawing, startPoint, currentMouse, voidGlow]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    setIsDrawing(true);
    setStartPoint(pt);
    setCurrentMouse(pt);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    if (isDrawing) {
      setCurrentMouse(pt);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && startPoint && currentMouse) {
      const dist = Math.hypot(currentMouse.x - startPoint.x, currentMouse.y - startPoint.y);
      if (dist > 15) {
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
      <div className="px-6 py-3.5 bg-[#1a1c1a] border-b border-[#303632] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#86a789] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#eae7e0]">
            老子：当其无有室之用 · 虚室生白与器用本体
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#3e4a42] text-[#86a789] bg-[#222724]">
            TAOIST ONTOLOGY
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-[#b0c0b4]">
            <span className="font-serif">虚空生白明度:</span>
            <input
              type="range"
              min="30"
              max="100"
              value={voidGlow}
              onChange={e => setVoidGlow(Number(e.target.value))}
              className="w-20 accent-[#86a789] cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setWalls([
                { x1: 200, y1: 140, x2: 440, y2: 140 },
                { x1: 440, y1: 140, x2: 440, y2: 360 },
                { x1: 200, y1: 360, x2: 300, y2: 360 },
                { x1: 360, y1: 360, x2: 440, y2: 360 },
                { x1: 200, y1: 140, x2: 200, y2: 220 },
                { x1: 200, y1: 280, x2: 200, y2: 360 },
              ]);
              audioAtmosphere.playChime(310);
            }}
            className="flex items-center gap-1.5 text-[#86a789] hover:text-[#eae7e0] transition-colors cursor-pointer border border-[#37423a] px-2.5 py-1 bg-[#202522]"
            title="恢复预设开敞合院"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">复原合院</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 w-full min-h-[460px] cursor-crosshair overflow-hidden select-none bg-[#111312]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Tip */}
        <div className="absolute top-4 left-6 z-20 text-[11px] text-[#86a789] bg-[#1a1d1b]/90 px-3.5 py-1.5 border border-[#323b35] font-serif flex items-center gap-2">
          <Brush className="w-3.5 h-3.5" />
          <span>拖拽鼠标筑墙：实体为“利”，两壁相交所留出的“无”才是容纳呼吸与生命的真正大用</span>
        </div>

        {/* Bottom Annotation */}
        <div className="absolute bottom-4 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#181b19]/92 backdrop-blur-md p-4 border border-[#303832] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#eae7e0] leading-relaxed italic">
              “凿户牖以为室，当其无，有室之用。故有之以为利，无之以为用。”
            </p>
            <span className="block mt-1.5 font-mono text-[10px] text-[#86a789]">
              老子《道德经》第十一章
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
