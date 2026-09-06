import React, { useEffect, useRef, useState } from 'react';
import { Milestone, RotateCcw, PlusCircle, Compass, Sparkles } from 'lucide-react';
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

      // Draw Cartesian grid, warped by placed Ort nodes (The Gathering force!)
      const gridStep = 32;
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
            const radius = 220 * (gatheringIntensity / 50);

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
        const radius = 180 * (gatheringIntensity / 50);

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
        ctx.arc(nx, ny, radius * 0.7 + Math.sin(time * 2) * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Fourfold (天地神人) Vectors
        if (showFourfold) {
          const directions = [
            { label: '天 (Sky)', dx: 0, dy: -radius * 0.75 },
            { label: '地 (Earth)', dx: 0, dy: radius * 0.75 },
            { label: '神 (Divinities)', dx: -radius * 0.75, dy: 0 },
            { label: '人 (Mortals)', dx: radius * 0.75, dy: 0 },
          ];

          ctx.font = '11px "Noto Serif SC", serif';
          ctx.fillStyle = 'rgba(214, 211, 209, 0.7)';
          ctx.textAlign = 'center';

          directions.forEach(dir => {
            const tx = nx + dir.dx;
            const ty = ny + dir.dy;

            ctx.strokeStyle = 'rgba(168, 162, 158, 0.25)';
            ctx.beginPath();
            ctx.moveTo(nx, ny);
            ctx.lineTo(tx, ty);
            ctx.stroke();

            ctx.fillText(dir.label, tx, ty + (dir.dy > 0 ? 14 : -6));
          });
        }

        // Central Icon / Marker
        ctx.beginPath();
        ctx.arc(nx, ny, 10, 0, Math.PI * 2);
        ctx.fillStyle = '#e7e5e4';
        ctx.fill();
        ctx.strokeStyle = '#78716c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '12px "Noto Serif SC", serif';
        ctx.fillStyle = '#f5f5f4';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, nx, ny + 26);
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
      <div className="px-6 py-3.5 bg-[#1d1c1a] border-b border-[#35332f] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#eae5d8]">
            马丁·海德格尔：筑居思与场所(Ort)开启
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#4a4742] text-[#c8a051] bg-[#262422]">
            BUILDING DWELLING THINKING · 1951
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <span>聚拢张力:</span>
            <input
              type="range"
              min="30"
              max="100"
              value={gatheringIntensity}
              onChange={e => setGatheringIntensity(Number(e.target.value))}
              className="w-20 accent-stone-400 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-stone-200">
            <input
              type="checkbox"
              checked={showFourfold}
              onChange={e => setShowFourfold(e.target.checked)}
              className="rounded accent-stone-400"
            />
            <span>天地神人四重体</span>
          </label>

          <button
            onClick={() => {
              setNodes([]);
              audioAtmosphere.playChime(190);
            }}
            className="flex items-center gap-1 hover:text-stone-200 transition-colors cursor-pointer"
            title="清空重置为虚空"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>虚空</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        className="relative flex-1 w-full min-h-[460px] cursor-crosshair overflow-hidden select-none bg-stone-950"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Tool Palette Floating Overlay */}
        <div className="absolute top-4 left-4 z-20 bg-stone-900/80 backdrop-blur-md p-1.5 rounded-lg border border-stone-700/60 flex items-center gap-1">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveTool('dwelling');
            }}
            className={`px-3 py-1.5 rounded text-xs font-serif-sc transition-all cursor-pointer ${
              activeTool === 'dwelling'
                ? 'bg-stone-200 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            + 筑造栖居 (Dwelling)
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveTool('bridge');
            }}
            className={`px-3 py-1.5 rounded text-xs font-serif-sc transition-all cursor-pointer ${
              activeTool === 'bridge'
                ? 'bg-stone-200 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            + 架设桥梁 (Bridge)
          </button>
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveTool('boundary');
            }}
            className={`px-3 py-1.5 rounded text-xs font-serif-sc transition-all cursor-pointer ${
              activeTool === 'boundary'
                ? 'bg-stone-200 text-stone-950 font-bold shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            + 确立边界 (Boundary)
          </button>
        </div>

        {/* Bottom Philosophy Annotation */}
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
          <div className="bg-stone-950/85 backdrop-blur-md p-4 rounded-xl border border-stone-800 shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-sm font-serif-sc text-stone-200 leading-relaxed">
              “桥梁横跨水流。桥梁不仅连接已经存在的两岸，正是因为桥梁横跨在那里，河流的两岸才作为两岸而显现。桥梁聚集了大地、天空、神圣物与凡人。”
            </p>
            <span className="block mt-1 text-[11px] text-stone-400 font-serif-sc">
              —— 马丁·海德格尔《筑·居·思》(1951)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
