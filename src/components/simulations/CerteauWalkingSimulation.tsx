import React, { useEffect, useRef, useState } from 'react';
import {
  Footprints,
  Eye,
  RotateCcw,
  Sparkles,
  Compass,
  Sliders,
  Maximize2,
  Minimize2,
  Navigation,
  Wind,
} from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface WalkerParticle {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  history: { x: number; y: number }[];
  style: 'subversive' | 'drifter' | 'shortcut' | 'compliant';
  color: string;
  name?: string;
  tacticMode: 'shortcut' | 'loiter' | 'wander' | 'cross';
  tacticTimer: number;
}

interface UrbanBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  zoneType: 'panoptic_tower' | 'financial_grid' | 'surveilled_mall' | 'monument';
}

export const CerteauWalkingSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Perspective mode: 
  // 'voyeur' = 世贸大厦110层俯瞰（概念之城 Concept City / 抽象几何 / 规训网格）
  // 'walker' = 街头漫步者（空间实践 Practiced Space / 诗意游击 / 肉体行话）
  const [perspective, setPerspective] = useState<'voyeur' | 'walker'>('walker');

  // Simulation controls
  const [tacticalAgency, setTacticalAgency] = useState<number>(75); // 0 = 完全受制于规划规训, 100 = 纯粹游击解构
  const [walkerCount, setWalkerCount] = useState<number>(36);
  const [userTrailActive, setUserTrailActive] = useState<boolean>(true);
  const [tacticalFreedomRate, setTacticalFreedomRate] = useState<number>(68);

  // User interactive walker cursor position
  const [userWalker, setUserWalker] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [userBreadcrumbs, setUserBreadcrumbs] = useState<{ x: number; y: number; time: number }[]>([]);

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

    // Initialize City Blocks (The Concept City Grid / 概念之城理性网格)
    const blocks: UrbanBlock[] = [
      { x: 0.12, y: 0.14, w: 0.22, h: 0.22, name: '世贸金融立方', zoneType: 'financial_grid' },
      { x: 0.40, y: 0.14, w: 0.20, h: 0.22, name: '行政全景枢纽', zoneType: 'panoptic_tower' },
      { x: 0.66, y: 0.14, w: 0.22, h: 0.22, name: '资本矩阵中心', zoneType: 'financial_grid' },
      { x: 0.12, y: 0.44, w: 0.22, h: 0.22, name: '规训消费大厦', zoneType: 'surveilled_mall' },
      { x: 0.40, y: 0.44, w: 0.20, h: 0.22, name: '理性几何广场', zoneType: 'monument' },
      { x: 0.66, y: 0.44, w: 0.22, h: 0.22, name: '标准化公寓集群', zoneType: 'financial_grid' },
      { x: 0.12, y: 0.74, w: 0.22, h: 0.16, name: '物流控制港', zoneType: 'surveilled_mall' },
      { x: 0.40, y: 0.74, w: 0.20, h: 0.16, name: '中央规训绿地', zoneType: 'monument' },
      { x: 0.66, y: 0.74, w: 0.22, h: 0.16, name: '国家档案网格', zoneType: 'panoptic_tower' },
    ];

    // Grid road intersections for lawful walking
    const roadX = [0.06, 0.36, 0.62, 0.91];
    const roadY = [0.08, 0.38, 0.68, 0.92];

    // Initialize Walker Particles
    const walkers: WalkerParticle[] = Array.from({ length: walkerCount }, (_, i) => {
      const isSubversive = Math.random() < tacticalAgency / 100;
      return {
        id: i,
        x: Math.random() * 0.8 + 0.1,
        y: Math.random() * 0.8 + 0.1,
        targetX: Math.random() * 0.8 + 0.1,
        targetY: Math.random() * 0.8 + 0.1,
        speed: 0.0018 + Math.random() * 0.0025,
        history: [],
        style: isSubversive
          ? (i % 3 === 0 ? 'shortcut' : i % 3 === 1 ? 'drifter' : 'subversive')
          : 'compliant',
        color: isSubversive
          ? (i % 2 === 0 ? '#eab308' : '#f59e0b') // Golden tactical luminescence
          : '#71717a', // Compliant grey
        tacticMode: 'wander',
        tacticTimer: Math.random() * 100,
      };
    });

    const render = () => {
      time += 0.02;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 520;
      ctx.clearRect(0, 0, w, h);

      // 1. Background Atmosphere: Voyeur is cold geometric dark slate, Walker is warm intimate charcoal
      if (perspective === 'voyeur') {
        // Cold blueprint grey grid of the Concept City
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#0f141c');
        bgGrad.addColorStop(1, '#090d14');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Technical Cartographic Grid Lines (The Planner's Abstract Map)
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
        ctx.lineWidth = 1;
        const gridStep = 32;
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
      } else {
        // Warm living street atmosphere
        const bgGrad = ctx.createLinearGradient(0, 0, w, h);
        bgGrad.addColorStop(0, '#151311');
        bgGrad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Cobblestone / Street Grain Texture (Living street)
        ctx.strokeStyle = 'rgba(214, 180, 120, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 48) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += 48) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }

      // 2. Draw Concept City Blocks (The Structural Place / 静态地点与权力建筑物)
      blocks.forEach(blk => {
        const bx = blk.x * w;
        const by = blk.y * h;
        const bw = blk.w * w;
        const bh = blk.h * h;

        if (perspective === 'voyeur') {
          // Rigid Blueprint Aesthetics (Cold, Panoptic, Cartesian)
          ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(bx, by, bw, bh);

          // Inner crosshairs & security zones
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
          ctx.beginPath();
          ctx.moveTo(bx + 6, by + 6);
          ctx.lineTo(bx + bw - 6, by + bh - 6);
          ctx.moveTo(bx + bw - 6, by + 6);
          ctx.lineTo(bx + 6, by + bh - 6);
          ctx.stroke();

          // Technical Label
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = '#38bdf8';
          ctx.textAlign = 'left';
          ctx.fillText(`ZONE [${blk.name}]`, bx + 8, by + 16);
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
          ctx.fillText('STRATEGY · GEOMETRIC DISCIPLINE', bx + 8, by + 28);
        } else {
          // Street Level: Blocks are massive shadowy physical silhouettes, framing the pedestrian canyons
          ctx.fillStyle = 'rgba(24, 22, 20, 0.85)';
          ctx.fillRect(bx, by, bw, bh);
          ctx.strokeStyle = 'rgba(120, 113, 108, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(bx, by, bw, bh);

          // Warm Ambient Glow in alleys
          ctx.font = '10px "Noto Serif SC", serif';
          ctx.fillStyle = 'rgba(168, 162, 158, 0.5)';
          ctx.textAlign = 'left';
          ctx.fillText(blk.name, bx + 10, by + 20);

          // Subtle poetic mark
          ctx.font = '9px "Noto Serif SC", serif';
          ctx.fillStyle = 'rgba(200, 160, 81, 0.35)';
          ctx.fillText('等待被漫步者穿透的建筑外壳', bx + 10, by + 34);
        }
      });

      // 3. Render Official Red-Line Pedestrian Corridors (Planned Strategy vs Deviant Tactics)
      if (perspective === 'voyeur') {
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        // Draw designated planned routes
        roadX.forEach(rx => {
          ctx.beginPath();
          ctx.moveTo(rx * w, 0);
          ctx.lineTo(rx * w, h);
          ctx.stroke();
        });
        roadY.forEach(ry => {
          ctx.beginPath();
          ctx.moveTo(0, ry * h);
          ctx.lineTo(w, ry * h);
          ctx.stroke();
        });
        ctx.setLineDash([]);
      }

      // 4. Update and Render Walkers (The Tactical Speech Acts of Space)
      let deviantCount = 0;

      walkers.forEach(walker => {
        // Movement Logic: Strategy obedience vs Tactical agency
        const isTactical = walker.style !== 'compliant';
        if (isTactical) deviantCount++;

        // If compliant, stick strictly to grid axes (roadX, roadY)
        if (!isTactical || tacticalAgency < 25) {
          // Walk strictly on corridors
          const nearestRoadX = roadX.reduce((prev, curr) => Math.abs(curr - walker.x) < Math.abs(prev - walker.x) ? curr : prev);
          const nearestRoadY = roadY.reduce((prev, curr) => Math.abs(curr - walker.y) < Math.abs(prev - walker.y) ? curr : prev);
          
          const dx = nearestRoadX - walker.x;
          const dy = nearestRoadY - walker.y;
          if (Math.abs(dx) > 0.02) {
            walker.x += Math.sign(dx) * walker.speed;
          } else {
            walker.y += Math.sin(time + walker.id) * walker.speed * 1.2;
          }
        } else {
          // TACTICAL WALKING: Short-cuts (Synecdoche), Loitering (Metaphor), Free drift across blocks
          const dx = walker.targetX - walker.x;
          const dy = walker.targetY - walker.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 0.04) {
            // Re-target new destination (often cutting diagonally through plazas or forbidden green belts)
            walker.targetX = Math.random() * 0.84 + 0.08;
            walker.targetY = Math.random() * 0.84 + 0.08;
            walker.tacticTimer = Math.random() * 80;
          } else {
            walker.x += (dx / dist) * walker.speed * (tacticalAgency / 50);
            walker.y += (dy / dist) * walker.speed * (tacticalAgency / 50);
          }
        }

        // Boundary wrap
        if (walker.x < 0.04) walker.x = 0.96;
        if (walker.x > 0.96) walker.x = 0.04;
        if (walker.y < 0.04) walker.y = 0.96;
        if (walker.y > 0.96) walker.y = 0.04;

        // Record history trail (The Footprint Poem / 身体行话轨迹)
        const currentPx = { x: walker.x * w, y: walker.y * h };
        walker.history.push(currentPx);
        const maxHistory = perspective === 'walker' ? 45 : 20;
        if (walker.history.length > maxHistory) {
          walker.history.shift();
        }

        // 5. Draw Footprint Threads (行走轨迹之织物)
        if (walker.history.length > 1) {
          ctx.beginPath();
          ctx.moveTo(walker.history[0].x, walker.history[0].y);
          for (let k = 1; k < walker.history.length; k++) {
            ctx.lineTo(walker.history[k].x, walker.history[k].y);
          }

          if (perspective === 'walker') {
            // Glowing golden liquid luminescence for practiced space
            ctx.strokeStyle = isTactical ? 'rgba(234, 179, 8, 0.45)' : 'rgba(168, 162, 158, 0.15)';
            ctx.lineWidth = isTactical ? 2 : 1;
            ctx.shadowColor = isTactical ? '#facc15' : 'transparent';
            ctx.shadowBlur = isTactical ? 6 : 0;
            ctx.stroke();
            ctx.shadowBlur = 0;
          } else {
            // Cold surveillance thread in Voyeur mode
            ctx.strokeStyle = isTactical ? 'rgba(251, 191, 36, 0.25)' : 'rgba(100, 116, 139, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // 6. Draw Particle Figure
        ctx.beginPath();
        ctx.arc(currentPx.x, currentPx.y, isTactical ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = perspective === 'walker'
          ? (isTactical ? '#fef08a' : '#a8a29e')
          : (isTactical ? '#eab308' : '#64748b');
        ctx.fill();
      });

      // Calculate Tactical Freedom Index
      const freedomRate = Math.round((deviantCount / walkers.length) * 100);
      setTacticalFreedomRate(freedomRate);

      // 7. Interactive User Walker (You are the Walker in the City)
      const ux = userWalker.x * w;
      const uy = userWalker.y * h;

      // Draw User Walker Ripple and Aureole
      ctx.beginPath();
      const rippleR = 14 + Math.sin(time * 4) * 4;
      ctx.arc(ux, uy, rippleR, 0, Math.PI * 2);
      ctx.strokeStyle = '#c8a051';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ux, uy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#eab308';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw User Walker's Personal Poetic Trail
      if (userTrailActive && userBreadcrumbs.length > 1) {
        ctx.beginPath();
        ctx.moveTo(userBreadcrumbs[0].x * w, userBreadcrumbs[0].y * h);
        for (let i = 1; i < userBreadcrumbs.length; i++) {
          ctx.lineTo(userBreadcrumbs[i].x * w, userBreadcrumbs[i].y * h);
        }
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.85)';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 8. User Floating Tooltip
      ctx.font = '11px "Noto Serif SC", serif';
      ctx.fillStyle = '#eae5d8';
      ctx.textAlign = 'center';
      ctx.fillText('漫步者之足：正在践行空间', ux, uy - 24);
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = '#c8a051';
      ctx.fillText('WALKING RHETORIC', ux, uy - 12);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [perspective, tacticalAgency, walkerCount, userWalker, userBreadcrumbs, userTrailActive]);

  // Handle pointer move / drag for the user walker
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0.04, Math.min(0.96, (e.clientY - rect.top) / rect.height));

    setUserWalker({ x: nx, y: ny });
    setUserBreadcrumbs(prev => {
      const next = [...prev, { x: nx, y: ny, time: Date.now() }];
      return next.slice(-60); // Keep last 60 points
    });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    handlePointerMove(e);
    audioAtmosphere.playChime(460);
  };

  return (
    <div className="flex flex-col h-full bg-[#141210] text-[#eae5df] select-none relative overflow-hidden font-serif-sc">
      {/* Top Editorial Archival Bar */}
      <div className="px-6 py-3.5 bg-[#1d1c1a] border-b border-[#35332f] flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#eae5d8]">
            米歇尔·德·塞托：漫步之诗与空间战术 (The Practice of Everyday Life)
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#4a4742] text-[#c8a051] bg-[#262422]">
            WALKING IN THE CITY · 1980
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 text-xs text-[#b8afa3]">
          {/* Dual Perspective Switcher */}
          <div className="bg-[#242220] p-0.5 border border-[#3c3a35] flex items-center">
            <button
              onClick={() => {
                setPerspective('voyeur');
                audioAtmosphere.playChime(320);
              }}
              className={`px-3 py-1 font-serif text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                perspective === 'voyeur'
                  ? 'bg-[#eae7dd] text-[#161514] font-medium'
                  : 'text-[#9e9a91] hover:text-[#eae7dd]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>世贸110F俯瞰 (规划策略)</span>
            </button>
            <button
              onClick={() => {
                setPerspective('walker');
                audioAtmosphere.playChime(480);
              }}
              className={`px-3 py-1 font-serif text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${
                perspective === 'walker'
                  ? 'bg-[#c8a051] text-[#161514] font-medium'
                  : 'text-[#9e9a91] hover:text-[#eae7dd]'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>街头漫步者 (游击战术)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-serif text-[#d8cfc4]">战术能动性:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={tacticalAgency}
              onChange={e => setTacticalAgency(Number(e.target.value))}
              className="w-20 accent-[#c8a051] cursor-pointer"
              title="调节普通行人对规划红线的偏离程度"
            />
            <span className="font-mono text-[10px] text-[#c8a051] w-6">{tacticalAgency}%</span>
          </div>

          <button
            onClick={() => {
              setUserBreadcrumbs([]);
              setUserWalker({ x: 0.5, y: 0.5 });
              audioAtmosphere.playChime(380);
            }}
            className="flex items-center gap-1.5 text-[#c8a051] hover:text-[#f4eee5] transition-colors cursor-pointer border border-[#443a2f] px-2.5 py-1 bg-[#241f1a]"
            title="清空轨迹"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">清空步轨</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative flex-1 w-full min-h-[500px] overflow-hidden select-none cursor-crosshair bg-[#12100e]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Top Floating Telemetry Readout */}
        <div className="absolute top-3.5 left-6 z-20 flex items-center gap-3 pointer-events-none">
          {perspective === 'voyeur' ? (
            <div className="bg-[#121620]/90 backdrop-blur-md px-3.5 py-1.5 border border-[#2b3a55] shadow-lg flex items-center gap-2.5">
              <Eye className="w-3.5 h-3.5 text-[#38bdf8]" />
              <div className="font-mono text-[10.5px] space-x-2">
                <span className="text-[#94a3b8]">CONCEPT CITY (世贸顶层):</span>
                <span className="text-[#38bdf8] font-bold">俯瞰全景的冷峻肉体抽离</span>
                <span className="text-[#475569]">|</span>
                <span className="text-[#94a3b8]">ORDER:</span>
                <span className="text-[#cbd5e1]">几何规训网格与统计学数字</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#1f1a14]/90 backdrop-blur-md px-3.5 py-1.5 border border-[#443a2a] shadow-lg flex items-center gap-2.5">
              <Footprints className="w-3.5 h-3.5 text-[#c8a051]" />
              <div className="font-mono text-[10.5px] space-x-2">
                <span className="text-[#a89e8f]">TACTICAL FREEDOM (漫步实践):</span>
                <span className="text-[#fef08a] font-bold">{tacticalFreedomRate}% 步轨撕裂规训红线</span>
                <span className="text-[#635848]">|</span>
                <span className="text-[#a89e8f]">PRINCIPLE:</span>
                <span className="text-[#eae5d8]">“空间是被践行着的地点”</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Vertical Explanatory Sidebar */}
        <aside
          aria-label="策略与战术解析"
          className="absolute top-6 right-5 z-20 pointer-events-auto flex flex-col gap-2 bg-[#1a1714]/92 p-3 border border-[#3d3428] backdrop-blur-md shadow-2xl max-w-[210px]"
        >
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-[#3d3428]/80">
            <Sparkles className="w-3.5 h-3.5 text-[#c8a051]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold">
              德·塞托核心范式
            </span>
          </div>

          <div className="space-y-2 text-xs font-serif leading-relaxed">
            <div
              className={`p-2 border transition-all ${
                perspective === 'voyeur'
                  ? 'bg-[#1e293b]/70 border-[#38bdf8] text-[#e2e8f0]'
                  : 'bg-[#241f1a]/50 border-[#382f24] text-[#a89d8d]'
              }`}
            >
              <div className="font-bold text-[11px] text-[#38bdf8] flex items-center justify-between">
                <span>策略 (Strategy)</span>
                <span className="font-mono text-[9px] uppercase">LE LIEU</span>
              </div>
              <p className="mt-1 text-[10.5px] leading-normal">
                规划师与国家的几何权力，占据固定基地，将城市抽象为俯瞰图纸。
              </p>
            </div>

            <div
              className={`p-2 border transition-all ${
                perspective === 'walker'
                  ? 'bg-[#2d2417]/80 border-[#c8a051] text-[#fef08a]'
                  : 'bg-[#241f1a]/50 border-[#382f24] text-[#a89d8d]'
              }`}
            >
              <div className="font-bold text-[11px] text-[#c8a051] flex items-center justify-between">
                <span>战术 (Tactics)</span>
                <span className="font-mono text-[9px] uppercase">L’ESPACE</span>
              </div>
              <p className="mt-1 text-[10.5px] leading-normal text-[#eae5d8]">
                弱者的游击时间艺术：穿小巷、抄近道、驻足流连，用双脚把冷冰冰的“地点”踩踏成鲜活的“空间”。
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#3d3428]/60 text-[10px] text-[#9e9587] font-serif leading-tight">
            在画布上任意拖拽移动：以光痕践行您专属的漫步修辞学
          </div>
        </aside>

        {/* Bottom Archival Epigraph Card */}
        <div className="absolute bottom-3 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#1d1c1a]/92 backdrop-blur-md px-4 py-3 border border-[#383631] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            {perspective === 'voyeur' ? (
              <>
                <p className="text-xs font-serif text-[#eae5d8] leading-relaxed italic">
                  “站在世贸大厦第110层往下看，人们变成了窥视狂（Voyeur）。总体化的城市不过是一幅几何学的虚构之画，真正的生命与行走经验在高空被彻底抽空。”
                </p>
                <div className="mt-1 flex items-center justify-center gap-3 font-mono text-[10px] text-[#9e978c]">
                  <span>米歇尔·德·塞托《日常生活实践》· 1980</span>
                  <span>•</span>
                  <span className="text-[#38bdf8]">概念之城：规训制图学与几何盲视</span>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-serif text-[#eae5d8] leading-relaxed italic">
                  “空间是被践行着的地点（Space is a practiced place）。街道由几何规划建立为地点，正是漫步者的双脚，如同言语使用语法一般，将它转化为充满诗意与抵抗的空间。”
                </p>
                <div className="mt-1 flex items-center justify-center gap-3 font-mono text-[10px] text-[#9e978c]">
                  <span>米歇尔·德·塞托《日常生活实践》· 1980</span>
                  <span>•</span>
                  <span className="text-[#c8a051]">漫步修辞：提喻（抄近道）与隐喻（流连驻足）</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
