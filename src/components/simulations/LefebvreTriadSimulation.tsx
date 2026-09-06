import React, { useEffect, useRef, useState } from 'react';
import { Layers, Pencil, RotateCcw, ShieldAlert, Sparkles } from 'lucide-react';
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
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Commuter flow particles for "Spatial Practice"
    const commuters: { x: number; y: number; speed: number; lane: number }[] = [];
    for (let i = 0; i < 40; i++) {
      commuters.push({
        x: Math.random() * 800,
        y: 100 + Math.floor(Math.random() * 6) * 55,
        speed: 1.2 + Math.random() * 1.5,
        lane: Math.floor(Math.random() * 6),
      });
    }

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

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

        // Bureaucratic zoning labels
        ctx.font = '10px "Space Grotesk", monospace';
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        for (let x = 30; x < w; x += 150) {
          for (let y = 30; y < h - 80; y += 120) {
            ctx.fillText(`ZONE-[${Math.floor(x / 10)}-${Math.floor(y / 10)}]`, x, y);
          }
        }
      }

      // 2. Layer 2: Perceived Space (空间实践 / 机械重复的日常流水通勤线)
      if (showPerceived) {
        commuters.forEach(c => {
          c.x += c.speed;
          if (c.x > w + 20) c.x = -20;

          // Commuter dots
          ctx.beginPath();
          ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.fill();

          // Tail
          ctx.beginPath();
          ctx.moveTo(c.x - 12, c.y);
          ctx.lineTo(c.x, c.y);
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

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setIsDrawing(true);
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top, time: Date.now() };
    currentLineRef.current = [pt];
    audioAtmosphere.playChime(520);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pt = { x: e.clientX - rect.left, y: e.clientY - rect.top, time: Date.now() };
    currentLineRef.current.push(pt);
  };

  const handleMouseUp = () => {
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
      <div className="px-6 py-3.5 bg-[#1c1a1d] border-b border-[#353038] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#eae5df]">
            亨利·列斐伏尔：空间三元辩证法与对城市的权利
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#483e4a] text-[#c8a051] bg-[#26212a]">
            PRODUCTION OF SPACE
          </span>
        </div>

        {/* 3-layer Toggles */}
        <div className="flex items-center gap-4 text-xs">
          <label className="flex items-center gap-1.5 cursor-pointer text-[#e2a89d] hover:text-[#f3d3cc]">
            <input
              type="checkbox"
              checked={showConceived}
              onChange={e => setShowConceived(e.target.checked)}
              className="accent-[#e2a89d]"
            />
            <span className="font-serif">构想的规训网格</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#e8c37d] hover:text-[#faebd0]">
            <input
              type="checkbox"
              checked={showPerceived}
              onChange={e => setShowPerceived(e.target.checked)}
              className="accent-[#e8c37d]"
            />
            <span className="font-serif">感知的日常流动</span>
          </label>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#a3c9a8] hover:text-[#d8ebd9]">
            <input
              type="checkbox"
              checked={showLived}
              onChange={e => setShowLived(e.target.checked)}
              className="accent-[#a3c9a8]"
            />
            <span className="font-serif">体验的诗意抗争</span>
          </label>

          <button
            onClick={() => {
              setDriftLines([]);
              audioAtmosphere.playChime(260);
            }}
            className="flex items-center gap-1.5 text-[#c8a051] hover:text-[#eae5df] transition-colors cursor-pointer border border-[#3c3542] px-2.5 py-1 bg-[#231f28]"
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="relative flex-1 w-full min-h-[460px] cursor-crosshair overflow-hidden select-none bg-[#121114]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Prompt */}
        <div className="absolute top-4 left-6 z-20 text-[11px] text-[#a3c9a8] bg-[#1c1a20]/90 px-3.5 py-1.5 border border-[#35303e] font-serif flex items-center gap-2">
          <Pencil className="w-3.5 h-3.5" />
          <span>按住鼠标拖拽：绘制“情境主义漂移”自由轨迹，冲破规训网格</span>
        </div>

        {/* Bottom Annotation */}
        <div className="absolute bottom-4 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#19171d]/92 backdrop-blur-md p-4 border border-[#35303c] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#eae5df] leading-relaxed italic">
              “（社会）空间是（社会的）产物。空间不仅是生产发生的地点，它本身就是权力和资本所锻造的商品。真正的人类生活发生于‘表象的空间’——那是对冰冷规划的无休止挪用与反叛。”
            </p>
            <span className="block mt-1.5 font-mono text-[10px] text-[#c8a051]">
              亨利·列斐伏尔《空间的生产》· 1974
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
