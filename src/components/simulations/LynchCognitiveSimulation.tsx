import React, { useEffect, useRef, useState } from 'react';
import {
  Compass,
  MapPin,
  Route,
  Shield,
  Layers,
  Sparkles,
  Sliders,
  RotateCcw,
  Eye,
  Crosshair,
} from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

type ElementType = 'paths' | 'edges' | 'districts' | 'nodes' | 'landmarks';

interface ElementFilter {
  paths: boolean;
  edges: boolean;
  districts: boolean;
  nodes: boolean;
  landmarks: boolean;
}

export const LynchCognitiveSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lynch's 5 Elements visibility filters
  const [layers, setLayers] = useState<ElementFilter>({
    paths: true,
    edges: true,
    districts: true,
    nodes: true,
    landmarks: true,
  });

  // Legibility slider: 0 (Chaotic non-imageable disorientation) -> 100 (Crystalline cognitive coherence)
  const [legibility, setLegibility] = useState<number>(85);

  // User observer / cartographer cursor
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [activeElementInfo, setActiveElementInfo] = useState<string>('扫描中：请在城市网络中探索五大意象要素');

  const toggleLayer = (elem: ElementType) => {
    setLayers(prev => ({ ...prev, [elem]: !prev[elem] }));
    audioAtmosphere.playChime(420);
  };

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

    // City Cognitive Geometry Definitions (Normalized 0 to 1)
    const landmarks = [
      { x: 0.50, y: 0.45, name: '旧城主座天主堂钟楼', icon: '尖塔', height: 48, color: '#f59e0b' },
      { x: 0.82, y: 0.22, name: '滨湾国际金融大厦', icon: '方棱', height: 60, color: '#eab308' },
      { x: 0.18, y: 0.78, name: '古代观测堡垒台', icon: '圆楼', height: 36, color: '#d97706' },
    ];

    const nodes = [
      { x: 0.50, y: 0.45, name: '中央大教堂枢纽广场', radius: 26 },
      { x: 0.32, y: 0.28, name: '北门七星交叉路口', radius: 18 },
      { x: 0.70, y: 0.65, name: '港湾渡轮总站转盘', radius: 22 },
      { x: 0.24, y: 0.55, name: '老城工匠集市转角', radius: 16 },
    ];

    const districts = [
      {
        name: '老城历史肌理区 [Historic Core]',
        poly: [
          { x: 0.14, y: 0.22 },
          { x: 0.48, y: 0.18 },
          { x: 0.52, y: 0.62 },
          { x: 0.18, y: 0.68 },
        ],
        hue: 'rgba(217, 119, 6, 0.12)',
        border: 'rgba(217, 119, 6, 0.4)',
        texture: 'dense_mesh',
      },
      {
        name: '临海现代金融港区 [Financial Bay]',
        poly: [
          { x: 0.56, y: 0.14 },
          { x: 0.88, y: 0.12 },
          { x: 0.90, y: 0.55 },
          { x: 0.62, y: 0.58 },
        ],
        hue: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.4)',
        texture: 'clean_grid',
      },
      {
        name: '大学城与林荫居住区 [Civic Belt]',
        poly: [
          { x: 0.22, y: 0.70 },
          { x: 0.68, y: 0.66 },
          { x: 0.65, y: 0.92 },
          { x: 0.15, y: 0.92 },
        ],
        hue: 'rgba(34, 197, 94, 0.10)',
        border: 'rgba(34, 197, 94, 0.35)',
        texture: 'greenery',
      },
    ];

    // Edges (Rivers, Expressways, Old Walls)
    const edges = [
      {
        name: '青弋江天然断裂水系 (River Edge)',
        points: [
          { x: 0.05, y: 0.38 },
          { x: 0.25, y: 0.40 },
          { x: 0.48, y: 0.55 },
          { x: 0.60, y: 0.72 },
          { x: 0.95, y: 0.85 },
        ],
        color: '#06b6d4',
      },
      {
        name: '高架环线隔断墙 (Elevated Highway Edge)',
        points: [
          { x: 0.54, y: 0.06 },
          { x: 0.54, y: 0.94 },
        ],
        color: '#64748b',
      },
    ];

    // Main Paths
    const paths = [
      // Primary Avenue
      [
        { x: 0.08, y: 0.16 },
        { x: 0.32, y: 0.28 },
        { x: 0.50, y: 0.45 },
        { x: 0.70, y: 0.65 },
        { x: 0.92, y: 0.78 },
      ],
      // Cross Boulevard
      [
        { x: 0.32, y: 0.06 },
        { x: 0.32, y: 0.28 },
        { x: 0.24, y: 0.55 },
        { x: 0.22, y: 0.88 },
      ],
      // Bay Coastal Promenade
      [
        { x: 0.85, y: 0.08 },
        { x: 0.82, y: 0.22 },
        { x: 0.70, y: 0.65 },
        { x: 0.80, y: 0.92 },
      ],
      // Diagonal Connector
      [
        { x: 0.50, y: 0.45 },
        { x: 0.82, y: 0.22 },
      ],
    ];

    // Moving pedestrian / car pulses along paths
    const pulses = Array.from({ length: 18 }, (_, i) => ({
      pathIndex: i % paths.length,
      progress: Math.random(),
      speed: 0.0015 + Math.random() * 0.002,
    }));

    const render = () => {
      time += 0.02;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 520;
      ctx.clearRect(0, 0, w, h);

      // 1. Dark Blueprint Background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#10141a');
      bgGrad.addColorStop(1, '#090c10');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Noise or Disorientation haze based on legibility
      const disorientFactor = (100 - legibility) / 100;
      if (disorientFactor > 0.05) {
        ctx.fillStyle = `rgba(15, 23, 42, ${disorientFactor * 0.65})`;
        ctx.fillRect(0, 0, w, h);

        // Disorientation fog grain
        ctx.fillStyle = `rgba(148, 163, 184, ${disorientFactor * 0.08})`;
        for (let i = 0; i < 40; i++) {
          const gx = Math.sin(time + i) * w * 0.5 + w * 0.5;
          const gy = Math.cos(time * 0.8 + i * 2) * h * 0.5 + h * 0.5;
          ctx.beginPath();
          ctx.arc(gx, gy, 40 + (i % 5) * 15, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Base Street Minor Grid
      ctx.strokeStyle = `rgba(71, 85, 105, ${0.12 * (legibility / 100)})`;
      ctx.lineWidth = 1;
      const gridStep = 30;
      for (let x = 0; x < w; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Render Layer: Districts (区域)
      if (layers.districts) {
        districts.forEach(dist => {
          ctx.beginPath();
          dist.poly.forEach((pt, idx) => {
            const px = pt.x * w;
            const py = pt.y * h;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.closePath();
          ctx.fillStyle = dist.hue;
          ctx.fill();
          ctx.strokeStyle = dist.border;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // District Tag
          const centerX = (dist.poly[0].x + dist.poly[2].x) * 0.5 * w;
          const centerY = (dist.poly[0].y + dist.poly[2].y) * 0.5 * h;
          ctx.font = '10px "Noto Serif SC", serif';
          ctx.fillStyle = 'rgba(241, 245, 249, 0.7)';
          ctx.textAlign = 'center';
          ctx.fillText(dist.name, centerX, centerY);
        });
      }

      // 3. Render Layer: Edges (边界)
      if (layers.edges) {
        edges.forEach(edge => {
          ctx.beginPath();
          edge.points.forEach((pt, idx) => {
            const px = pt.x * w;
            const py = pt.y * h;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.strokeStyle = edge.color;
          ctx.lineWidth = 3.5;
          ctx.shadowColor = edge.color;
          ctx.shadowBlur = 8;
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Double line for boundary separation barrier effect
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.setLineDash([6, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Label
          const midPt = edge.points[Math.floor(edge.points.length / 2)];
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = edge.color;
          ctx.textAlign = 'left';
          ctx.fillText(`[EDGE: ${edge.name}]`, midPt.x * w + 8, midPt.y * h - 8);
        });
      }

      // 4. Render Layer: Paths (道路)
      if (layers.paths) {
        paths.forEach(pth => {
          ctx.beginPath();
          pth.forEach((pt, idx) => {
            const px = pt.x * w;
            const py = pt.y * h;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          // Outer highway glow
          ctx.strokeStyle = 'rgba(248, 113, 113, 0.25)';
          ctx.lineWidth = 7;
          ctx.stroke();
        });

        // Pulses along paths
        pulses.forEach(p => {
          p.progress = (p.progress + p.speed) % 1;
          const curPath = paths[p.pathIndex];
          const totalSegments = curPath.length - 1;
          const segProgress = p.progress * totalSegments;
          const segIndex = Math.min(Math.floor(segProgress), totalSegments - 1);
          const t = segProgress - segIndex;

          const p1 = curPath[segIndex];
          const p2 = curPath[segIndex + 1];

          const curX = (p1.x + (p2.x - p1.x) * t) * w;
          const curY = (p1.y + (p2.y - p1.y) * t) * h;

          ctx.beginPath();
          ctx.arc(curX, curY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = '#f87171';
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // 5. Render Layer: Nodes (节点)
      if (layers.nodes) {
        nodes.forEach(node => {
          const nx = node.x * w;
          const ny = node.y * h;

          // Pulsing node beacon rings
          const pulseR = node.radius + Math.sin(time * 3 + node.x * 10) * 4;
          ctx.beginPath();
          ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(nx, ny, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#c084fc';
          ctx.fill();

          ctx.font = '10px "Noto Serif SC", serif';
          ctx.fillStyle = '#e9d5ff';
          ctx.textAlign = 'center';
          ctx.fillText(`• ${node.name}`, nx, ny + pulseR + 13);
        });
      }

      // 6. Render Layer: Landmarks (标志物)
      if (layers.landmarks) {
        landmarks.forEach(lm => {
          const lx = lm.x * w;
          const ly = lm.y * h;

          // Vertical light cone beam
          const beamGrad = ctx.createLinearGradient(lx, ly, lx, ly - lm.height * 2.2);
          beamGrad.addColorStop(0, lm.color);
          beamGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(lx - 12, ly);
          ctx.lineTo(lx, ly - lm.height * 2.2);
          ctx.lineTo(lx + 12, ly);
          ctx.closePath();
          ctx.fill();

          // Landmark symbol
          ctx.beginPath();
          ctx.arc(lx, ly, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = lm.color;
          ctx.shadowBlur = 12;
          ctx.fill();
          ctx.shadowBlur = 0;

          // Flag pole
          ctx.strokeStyle = lm.color;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lx, ly);
          ctx.lineTo(lx, ly - lm.height);
          ctx.stroke();

          ctx.font = '11px "Noto Serif SC", serif';
          ctx.fillStyle = '#fef08a';
          ctx.textAlign = 'center';
          ctx.fillText(`★ ${lm.name}`, lx, ly - lm.height - 8);
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(254, 240, 138, 0.7)';
          ctx.fillText('LANDMARK · VISUAL ANCHOR', lx, ly - lm.height + 3);
        });
      }

      // 7. Interactive Cognitive Sight Cone from User Cursor
      const cx = cursorPos.x * w;
      const cy = cursorPos.y * h;

      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Sight cone line to nearest landmark
      let nearestLm = landmarks[0];
      let minDst = 9999;
      landmarks.forEach(lm => {
        const dst = Math.hypot(lm.x * w - cx, lm.y * h - cy);
        if (dst < minDst) {
          minDst = dst;
          nearestLm = lm;
        }
      });

      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(cx, cy);
      ctx.lineTo(nearestLm.x * w, nearestLm.y * h);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText(`BEARING: ${nearestLm.name} (${Math.round(minDst)}px)`, cx + 18, cy + 4);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [layers, legibility, cursorPos]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0.04, Math.min(0.96, (e.clientY - rect.top) / rect.height));
    setCursorPos({ x: nx, y: ny });
  };

  return (
    <div className="flex flex-col h-full bg-[#10141a] text-[#f1f5f9] select-none relative overflow-hidden font-serif-sc">
      {/* Top Editorial Archival Bar */}
      <div className="px-6 py-3.5 bg-[#171e27] border-b border-[#2d3a4b] flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#f8fafc]">
            凯文·林奇：城市意象与空间可读性 (The Image of the City)
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#3b82f6] text-[#38bdf8] bg-[#0f172a]">
            COGNITIVE MAPPING · 1960
          </span>
        </div>

        {/* Action Controls & Layer Switches */}
        <div className="flex items-center gap-4 text-xs text-[#cbd5e1]">
          {/* Legibility Slider */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-[#94a3b8]">空间可读性 (Legibility):</span>
            <input
              type="range"
              min="10"
              max="100"
              value={legibility}
              onChange={e => setLegibility(Number(e.target.value))}
              className="w-20 accent-[#38bdf8] cursor-pointer"
              title="调节城市意象在人类大脑中的清晰度"
            />
            <span className="font-mono text-[10px] text-[#38bdf8] w-6">{legibility}%</span>
          </div>

          <button
            onClick={() => {
              setLayers({ paths: true, edges: true, districts: true, nodes: true, landmarks: true });
              setLegibility(85);
              setCursorPos({ x: 0.5, y: 0.5 });
              audioAtmosphere.playChime(380);
            }}
            className="flex items-center gap-1.5 text-[#38bdf8] hover:text-[#f8fafc] transition-colors cursor-pointer border border-[#1e3a8a] px-2.5 py-1 bg-[#1e293b]"
            title="复位城市意象图层"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">重置图层</span>
          </button>
        </div>
      </div>

      {/* Layer Toggle Filter Bar (The 5 Lynch Elements) */}
      <div className="px-6 py-2 bg-[#121820] border-b border-[#243040] flex flex-wrap items-center gap-2 text-xs z-20">
        <span className="text-[10.5px] font-mono text-[#64748b] uppercase tracking-wider mr-2">
          意象五要素过滤:
        </span>

        {/* Paths */}
        <button
          onClick={() => toggleLayer('paths')}
          className={`px-3 py-1 text-xs font-serif transition-colors border cursor-pointer flex items-center gap-1.5 ${
            layers.paths
              ? 'bg-[#f87171] text-[#0f172a] border-[#f87171] font-medium'
              : 'bg-[#1e293b] text-[#94a3b8] border-[#334155]'
          }`}
        >
          <Route className="w-3.5 h-3.5" />
          <span>道路 (Paths)</span>
        </button>

        {/* Edges */}
        <button
          onClick={() => toggleLayer('edges')}
          className={`px-3 py-1 text-xs font-serif transition-colors border cursor-pointer flex items-center gap-1.5 ${
            layers.edges
              ? 'bg-[#06b6d4] text-[#0f172a] border-[#06b6d4] font-medium'
              : 'bg-[#1e293b] text-[#94a3b8] border-[#334155]'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>边界 (Edges)</span>
        </button>

        {/* Districts */}
        <button
          onClick={() => toggleLayer('districts')}
          className={`px-3 py-1 text-xs font-serif transition-colors border cursor-pointer flex items-center gap-1.5 ${
            layers.districts
              ? 'bg-[#d97706] text-[#0f172a] border-[#d97706] font-medium'
              : 'bg-[#1e293b] text-[#94a3b8] border-[#334155]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>区域 (Districts)</span>
        </button>

        {/* Nodes */}
        <button
          onClick={() => toggleLayer('nodes')}
          className={`px-3 py-1 text-xs font-serif transition-colors border cursor-pointer flex items-center gap-1.5 ${
            layers.nodes
              ? 'bg-[#a855f7] text-[#0f172a] border-[#a855f7] font-medium'
              : 'bg-[#1e293b] text-[#94a3b8] border-[#334155]'
          }`}
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>节点 (Nodes)</span>
        </button>

        {/* Landmarks */}
        <button
          onClick={() => toggleLayer('landmarks')}
          className={`px-3 py-1 text-xs font-serif transition-colors border cursor-pointer flex items-center gap-1.5 ${
            layers.landmarks
              ? 'bg-[#eab308] text-[#0f172a] border-[#eab308] font-medium'
              : 'bg-[#1e293b] text-[#94a3b8] border-[#334155]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>标志物 (Landmarks)</span>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        className="relative flex-1 w-full min-h-[500px] overflow-hidden select-none cursor-crosshair bg-[#0d1117]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Top Left Floating Diagnostic Readout */}
        <div className="absolute top-4 left-6 z-20 flex items-center gap-3 pointer-events-none">
          <div className="bg-[#131b26]/90 backdrop-blur-md px-4 py-2 border border-[#23354d] shadow-lg flex items-center gap-3">
            <Compass className="w-4 h-4 text-[#38bdf8]" />
            <div className="font-mono text-[11px] space-x-2">
              <span className="text-[#94a3b8]">COGNITIVE IMAGEABILITY:</span>
              <span className="text-[#38bdf8] font-bold">
                {legibility > 70 ? '清晰可辨 (High)' : legibility > 40 ? '中度辨识 (Moderate)' : '空间失调迷失 (Disorientation)'}
              </span>
              <span className="text-[#475569]">|</span>
              <span className="text-[#94a3b8]">MENTAL MAP:</span>
              <span className="text-[#f1f5f9]">脑中心智地图正在解构几何都市</span>
            </div>
          </div>
        </div>

        {/* Right Explanatory Architectural Sidebar */}
        <aside
          aria-label="城市意象五要素解析"
          className="absolute top-6 right-5 z-20 pointer-events-auto flex flex-col gap-2.5 bg-[#121924]/92 p-3.5 border border-[#233348] backdrop-blur-md shadow-2xl max-w-[215px]"
        >
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#233348]">
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#38bdf8] font-semibold">
              心智地图的五大锚点
            </span>
          </div>

          <div className="space-y-1.5 text-[10.5px] font-serif leading-relaxed text-[#cbd5e1]">
            <p><strong className="text-[#f87171]">道路 (Paths)</strong>：观察者习惯性沿着其移动的动线通道。</p>
            <p><strong className="text-[#06b6d4]">边界 (Edges)</strong>：不被视为道路的线性断裂带（河流、高架桥、古墙）。</p>
            <p><strong className="text-[#d97706]">区域 (Districts)</strong>：具备同质性二阶特征的城市内部片区。</p>
            <p><strong className="text-[#c084fc]">节点 (Nodes)</strong>：观察者进入城市的核心战略聚合点（广场、换乘站）。</p>
            <p><strong className="text-[#fef08a]">标志物 (Landmarks)</strong>：作为外部参照点的视觉灯塔。</p>
          </div>

          <div className="pt-2 border-t border-[#233348] text-[9.5px] text-[#94a3b8] font-serif leading-tight">
            移动光标模拟市民漫步：视线将自动拉出引力罗盘连接至最近标志物。
          </div>
        </aside>

        {/* Bottom Epigraph Card */}
        <div className="absolute bottom-3 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#141d28]/92 backdrop-blur-md px-5 py-3 border border-[#26374d] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#f1f5f9] leading-relaxed italic">
              “一个可读性高的城市，不仅给人以安全感，而且增强了人类体验的潜在深度与强度。在这样一座城市中，迷失方向不仅是不快的，而且将唤起深层的存在主义焦虑。”
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 font-mono text-[10px] text-[#94a3b8]">
              <span>凯文·林奇《城市意象》· 1960</span>
              <span>•</span>
              <span className="text-[#38bdf8]">环境心理与空间意象</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
