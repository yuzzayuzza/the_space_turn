import React, { useEffect, useRef, useState } from 'react';
import { Milestone, RotateCcw, PlusCircle, Compass, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface OrtNode {
  id: string;
  x: number;
  y: number;
  type: 'bridge' | 'dwelling' | 'boundary';
  name: string;
  gatheringPower: number;
}

export const HeideggerOrtSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [nodes, setNodes] = useState<OrtNode[]>([
    {
      id: 'bridge-1',
      x: 0.5,
      y: 0.48,
      type: 'bridge',
      name: '跨河之桥 (The Bridge)',
      gatheringPower: 1.0,
    },
  ]);
  const [activeTool, setActiveTool] = useState<'bridge' | 'dwelling' | 'boundary'>('dwelling');
  const [gatheringIntensity, setGatheringIntensity] = useState(70);
  const [showFourfold, setShowFourfold] = useState(true);
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

    const render = () => {
      time += 0.02;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);

      // Draw the Primordial River (flowing down the middle)
      const riverX = w * 0.5;
      ctx.fillStyle = 'rgba(20, 30, 45, 0.4)';
      ctx.beginPath();
      ctx.moveTo(riverX - 60, 0);
      ctx.bezierCurveTo(riverX - 30, h * 0.4, riverX - 90, h * 0.7, riverX - 50, h);
      ctx.lineTo(riverX + 50, h);
      ctx.bezierCurveTo(riverX + 90, h * 0.7, riverX + 30, h * 0.4, riverX + 60, 0);
      ctx.closePath();
      ctx.fill();

      // Flowing river stream particles
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        const offset = Math.sin(time + i) * 15;
        ctx.beginPath();
        ctx.moveTo(riverX - 20 + offset, 0);
        ctx.quadraticCurveTo(riverX + offset, h * 0.5, riverX - 10 + offset, h);
        ctx.stroke();
      }

      const isMobile = w < 640;

      // Draw Cartesian grid, warped by placed Ort nodes (The Gathering force!)
      const gridStep = isMobile ? 26 : 32;
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.16)';
      ctx.lineWidth = 1;

      for (let gx = 20; gx < w; gx += gridStep) {
        ctx.beginPath();
        for (let gy = 0; gy < h; gy += 16) {
          let px = gx;
          let py = gy;

          // Warp towards Ort nodes
          nodes.forEach(node => {
            const nx = node.x * w;
            const ny = node.y * h;
            const dx = nx - px;
            const dy = ny - py;
            const dist = Math.hypot(dx, dy);
            const radius = (isMobile ? 130 : 200) * (gatheringIntensity / 50);

            if (dist < radius && dist > 1) {
              const pull = (1 - dist / radius) * 18 * node.gatheringPower;
              px += (dx / dist) * pull;
              py += (dy / dist) * pull;
            }
          });

          if (gy === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw each Ort node and its gathering aura
      nodes.forEach(node => {
        const nx = node.x * w;
        const ny = node.y * h;
        // Dynamically scale gathering radius to fit comfortably within mobile and desktop bounds
        const maxBaseRadius = Math.min(w * (isMobile ? 0.31 : 0.36), h * (isMobile ? 0.25 : 0.30), isMobile ? 126 : 180);
        const radius = maxBaseRadius * (gatheringIntensity / 50);

        // Boundary radiation aura (Grenze as beginning of presencing)
        const radGrad = ctx.createRadialGradient(nx, ny, 10, nx, ny, radius);
        radGrad.addColorStop(0, 'rgba(214, 211, 209, 0.25)');
        radGrad.addColorStop(0.5, 'rgba(168, 162, 158, 0.08)');
        radGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing border ring
        ctx.strokeStyle = 'rgba(214, 211, 209, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(nx, ny, radius * 0.72 + Math.sin(time * 2) * (isMobile ? 3 : 5), 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fourfold (天地神人) Vectors
        if (showFourfold) {
          const directions = [
            { label: '天 (Sky)', dx: 0, dy: -radius * 0.76, align: 'center', vAlign: 'bottom' },
            { label: '地 (Earth)', dx: 0, dy: radius * 0.76, align: 'center', vAlign: 'top' },
            { label: isMobile ? '神 (Divinities)' : '神 (Divinities)', dx: -radius * 0.74, dy: 0, align: 'center', vAlign: 'middle' },
            { label: isMobile ? '人 (Mortals)' : '人 (Mortals)', dx: radius * 0.74, dy: 0, align: 'center', vAlign: 'middle' },
          ];

          ctx.font = isMobile ? '10px "Noto Serif SC", serif' : '11px "Noto Serif SC", serif';
          ctx.fillStyle = 'rgba(235, 230, 220, 0.85)';

          directions.forEach(dir => {
            const tx = nx + dir.dx;
            const ty = ny + dir.dy;

            ctx.strokeStyle = 'rgba(168, 162, 158, 0.28)';
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            ctx.textAlign = 'center';
            let labelX = tx;
            let labelY = ty;
            if (dir.vAlign === 'top') labelY += (isMobile ? 12 : 14);
            if (dir.vAlign === 'bottom') labelY -= (isMobile ? 5 : 6);
            if (dir.vAlign === 'middle') labelY += 4;

            // Strict boundary safety for east-west text
            const textWidth = ctx.measureText(dir.label).width;
            const halfW = textWidth / 2;
            labelX = Math.max(halfW + 6, Math.min(w - halfW - 6, labelX));

            ctx.fillText(dir.label, labelX, labelY);
          });
        }

        // Central Icon / Marker
        ctx.beginPath();
        ctx.arc(nx, ny, isMobile ? 8 : 10, 0, Math.PI * 2);
        ctx.fillStyle = '#e7e5e4';
        ctx.fill();
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = isMobile ? '11px "Noto Serif SC", serif' : '12px "Noto Serif SC", serif';
        ctx.fillStyle = '#f5f5f4';
        ctx.textAlign = 'center';
        const nodeTextWidth = ctx.measureText(node.name).width;
        const nodeHalfW = nodeTextWidth / 2;
        const safeNodeX = Math.max(nodeHalfW + 8, Math.min(w - nodeHalfW - 8, nx));
        ctx.fillText(node.name, safeNodeX, ny + (isMobile ? 22 : 26));
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [nodes, gatheringIntensity, showFourfold]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const names = {
      bridge: '跨度之桥 (Bridge Ort)',
      dwelling: '栖居之所 (Dwelling Ort)',
      boundary: '神圣界碑 (Sacred Boundary)',
    };

    const newNode: OrtNode = {
      id: `node-${Date.now()}`,
      x,
      y,
      type: activeTool,
      name: names[activeTool],
      gatheringPower: activeTool === 'bridge' ? 1.2 : 0.9,
    };

    setNodes(prev => [...prev, newNode]);
    audioAtmosphere.playChime(activeTool === 'bridge' ? 360 : 280);
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0c10] text-stone-200 rounded-xl overflow-hidden border border-stone-800">
      {/* Top Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1d1c1a] border-b border-[#35332f] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse shrink-0" />
          <span className="font-serif font-medium tracking-wide text-[#eae5d8] truncate text-xs">
            马丁·海德格尔：筑居思与场所(Ort)开启
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#4a4742] text-[#c8a051] bg-[#262422] shrink-0">
            1951
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs">聚拢:</span>
            <input
              type="range"
              min="30"
              max="100"
              value={gatheringIntensity}
              onChange={e => setGatheringIntensity(Number(e.target.value))}
              className="w-16 sm:w-20 accent-stone-400 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-1 cursor-pointer hover:text-stone-200 text-[11px] sm:text-xs">
            <input
              type="checkbox"
              checked={showFourfold}
              onChange={e => setShowFourfold(e.target.checked)}
              className="rounded accent-stone-400"
            />
            <span>四重体</span>
          </label>

          <button
            onClick={() => {
              setNodes([]);
              audioAtmosphere.playChime(190);
            }}
            className="flex items-center gap-1 hover:text-stone-200 transition-colors cursor-pointer text-[11px] sm:text-xs"
            title="清空重置为虚空"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>虚空</span>
          </button>
        </div>
      </div>

      {/* Dedicated Tool Selector Bar: Keeps canvas completely unobstructed */}
      <div className="px-3 sm:px-6 py-2 bg-[#171614] border-b border-[#2e2b27] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] sm:text-[11px] text-[#a89f91] font-mono shrink-0 mr-0.5">筑造:</span>
          <button
            onClick={() => setActiveTool('dwelling')}
            className={`px-2.5 sm:px-3 py-1 rounded text-[11px] font-serif transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTool === 'dwelling'
                ? 'bg-[#c8a051] text-[#121110] font-bold shadow'
                : 'bg-[#23211e] text-stone-300 hover:text-white border border-[#3d3831]'
            }`}
          >
            + 筑造栖居
          </button>
          <button
            onClick={() => setActiveTool('bridge')}
            className={`px-2.5 sm:px-3 py-1 rounded text-[11px] font-serif transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTool === 'bridge'
                ? 'bg-[#c8a051] text-[#121110] font-bold shadow'
                : 'bg-[#23211e] text-stone-300 hover:text-white border border-[#3d3831]'
            }`}
          >
            + 架设桥梁
          </button>
          <button
            onClick={() => setActiveTool('boundary')}
            className={`px-2.5 sm:px-3 py-1 rounded text-[11px] font-serif transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTool === 'boundary'
                ? 'bg-[#c8a051] text-[#121110] font-bold shadow'
                : 'bg-[#23211e] text-stone-300 hover:text-white border border-[#3d3831]'
            }`}
          >
            + 确立边界
          </button>
        </div>
        <div className="text-[10px] text-[#8a8275] font-serif hidden sm:block">
          点击画布：将四重体（天地神人）聚拢于具体场所
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[460px] cursor-crosshair overflow-hidden select-none bg-stone-950 touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Floating guidance tag (subtle, non-intrusive) */}
        <div className="absolute top-2.5 right-3 z-20 text-[10px] font-mono text-stone-500 bg-stone-900/60 px-2 py-0.5 rounded border border-stone-800/80 pointer-events-none">
          点按画布以栖居
        </div>

        {/* Bottom Philosophy Annotation with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-4 left-2.5 sm:left-4 right-2.5 sm:right-4 z-30 pointer-events-none">
          <div className="bg-stone-950/92 backdrop-blur-md px-3 py-2 sm:p-4 rounded-xl border border-stone-800 shadow-xl max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-stone-400 font-serif-sc truncate">
                马丁·海德格尔《筑·居·思》(1951) · 场所的聚集
              </span>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#c8a051] hover:text-stone-200 cursor-pointer flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-stone-700/60 rounded"
              >
                <span>{isQuoteExpanded ? '收起' : '展开'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-stone-800 text-center">
                <p className="text-xs font-serif-sc text-stone-200 leading-relaxed italic">
                  “桥梁横跨水流。桥梁不仅连接已经存在的两岸，正是因为桥梁横跨在那里，河流的两岸才作为两岸而显现。桥梁聚集了大地、天空、神圣物与凡人。”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
