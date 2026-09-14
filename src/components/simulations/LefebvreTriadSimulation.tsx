import React, { useEffect, useRef, useState } from 'react';
import { Layers, Pencil, RotateCcw, ShieldAlert, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface DriftPoint {
  x: number;
  y: number;
  time: number;
}

export const LefebvreTriadSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Layer toggles
  const [showConceived, setShowConceived] = useState(true); // 构想的空间 (规划网格)
  const [showPerceived, setShowPerceived] = useState(true); // 感知的空间 (日常流动)
  const [showLived, setShowLived] = useState(true); // 体验的空间 (诗意抵抗/占领)

  const [isDrawing, setIsDrawing] = useState(false);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [driftLines, setDriftLines] = useState<DriftPoint[][]>([]);
  const currentLineRef = useRef<DriftPoint[]>([]);

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

    // Commuter flow particles for "Spatial Practice" (normalized coordinates, centered in canvas)
    const commuters: { normX: number; laneFraction: number; speed: number }[] = [];
    for (let i = 0; i < 35; i++) {
      commuters.push({
        normX: Math.random(),
        laneFraction: 0.22 + (i % 6) * 0.08,
        speed: 0.0015 + Math.random() * 0.002,
      });
    }

    const render = () => {
      time += 0.02;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);

      // 1. Layer 1: Conceived Space (空间的表象 / 规划者的冰冷铁律网格)
      if (showConceived) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.18)';
        ctx.lineWidth = 1;
        const cellSize = 50;

        for (let x = 0; x <= w; x += cellSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }

        for (let y = 0; y <= h; y += cellSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // Bureaucratic zoning labels (safely below top prompt)
        ctx.font = '10px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        for (let x = 30; x < w; x += 150) {
          for (let y = 65; y < h - 70; y += 120) {
            ctx.fillText(`ZONE-[${Math.floor(x / 10)}-${Math.floor(y / 10)}]`, x, y);
          }
        }
      }

      // 2. Layer 2: Perceived Space (空间实践 / 机械重复的日常流水通勤线)
      if (showPerceived) {
        commuters.forEach(c => {
          c.normX += c.speed;
          if (c.normX > 1.05) c.normX = -0.05;

          const cx = c.normX * w;
          const cy = c.laneFraction * h;

          // Commuter dots
          ctx.beginPath();
          ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.fill();

          // Tail
          ctx.beginPath();
          ctx.moveTo(cx - 12, cy);
          ctx.lineTo(cx, cy);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.2)';
          ctx.stroke();
        });
      }

      // 3. Layer 3: Lived Space (表象的空间 / 诗意游荡、涂鸦与对城市的权利)
      if (showLived) {
        const allLines = [...driftLines, currentLineRef.current];

        allLines.forEach(line => {
          if (line.length < 2) return;

          ctx.beginPath();
          ctx.moveTo(line[0].x, line[0].y);
          for (let i = 1; i < line.length; i++) {
            ctx.lineTo(line[i].x, line[i].y);
          }
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowColor = '#10b981';
          ctx.shadowBlur = 12;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Sprout blossoming poetic nodes along the drift line
          line.forEach((pt, idx) => {
            if (idx % 8 === 0) {
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#6ee7b7';
              ctx.fill();
            }
          });
        });
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [showConceived, showPerceived, showLived, driftLines]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDrawing(true);
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top, time: Date.now() };
    currentLineRef.current = [pt];
    audioAtmosphere.playChime(520);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top, time: Date.now() };
    currentLineRef.current.push(pt);
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLineRef.current.length > 1) {
      setDriftLines(prev => [...prev, [...currentLineRef.current]]);
    }
    currentLineRef.current = [];
  };

  return (
    <div className="flex flex-col h-full bg-[#151416] text-[#eae5df] select-none relative overflow-hidden">
      {/* Top Editorial Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1c1a1d] border-b border-[#353038] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse shrink-0" />
          <span className="font-serif font-medium tracking-wide text-[#eae5df] truncate text-xs">
            亨利·列斐伏尔：空间三元辩证法与对城市的权利
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#483e4a] text-[#c8a051] bg-[#26212a] shrink-0">
            1974
          </span>
        </div>

        {/* 3-layer Toggles */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          <label className="flex items-center gap-1 cursor-pointer text-[#e2a89d] hover:text-[#f3d3cc] text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={showConceived}
              onChange={e => setShowConceived(e.target.checked)}
              className="accent-[#e2a89d]"
            />
            <span className="font-serif">构想网格</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer text-[#e8c37d] hover:text-[#faebd0] text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={showPerceived}
              onChange={e => setShowPerceived(e.target.checked)}
              className="accent-[#e8c37d]"
            />
            <span className="font-serif">日常流动</span>
          </label>

          <label className="flex items-center gap-1 cursor-pointer text-[#a3c9a8] hover:text-[#d8ebd9] text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={showLived}
              onChange={e => setShowLived(e.target.checked)}
              className="accent-[#a3c9a8]"
            />
            <span className="font-serif">诗意抗争</span>
          </label>

          <button
            onClick={() => {
              setDriftLines([]);
              audioAtmosphere.playChime(260);
            }}
            className="flex items-center gap-1 text-[#c8a051] hover:text-[#eae5df] transition-colors cursor-pointer border border-[#3c3542] px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#231f28] text-[11px]"
            title="清空自由漫游轨迹"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">清空</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[460px] cursor-crosshair overflow-hidden select-none bg-[#121114] touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Prompt */}
        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-6 right-2.5 sm:right-auto z-20 text-[10px] sm:text-[11px] text-[#a3c9a8] bg-[#1c1a20]/90 px-2.5 sm:px-3.5 py-1 sm:py-1.5 border border-[#35303e] font-serif flex items-center gap-1.5 sm:gap-2">
          <Pencil className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>按住/滑动：绘制“情境主义漂移”轨迹，冲破规训网格</span>
        </div>

        {/* Bottom Annotation with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-4 left-2.5 sm:left-6 right-2.5 sm:right-6 z-30 pointer-events-none">
          <div className="bg-[#19171d]/92 backdrop-blur-md px-3 py-2 sm:p-4 border border-[#35303c] shadow-xl max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#c8a051] font-mono truncate">
                亨利·列斐伏尔《空间的生产》· 1974
              </span>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#c8a051] hover:text-[#eae5df] cursor-pointer flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-[#3c3542] bg-[#231f28]"
              >
                <span>{isQuoteExpanded ? '收起' : '展开'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-[#35303c] text-center">
                <p className="text-xs font-serif text-[#eae5df] leading-relaxed italic">
                  “（社会）空间是（社会的）产物。空间不仅是生产发生的地点，它本身就是权力和资本所锻造的商品。真正的人类生活发生于‘表象的空间’——那是对冰冷规划的无休止挪用与反叛。”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
