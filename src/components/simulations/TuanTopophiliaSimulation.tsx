import React, { useEffect, useRef, useState } from 'react';
import {
  Heart,
  Sparkles,
  Compass,
  RotateCcw,
  Sun,
  Home,
  Clock,
  Feather,
} from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface MemoryAnchor {
  id: number;
  x: number;
  y: number;
  label: string;
  intensity: number; // 0 to 1
  dwellTime: number; // seconds spent here
  auraRadius: number;
  quote: string;
}

export const TuanTopophiliaSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Experience state slider: 0 = Pure Abstract Space (冷峻无垠、自由但荒凉的几何网格) 
  // -> 100 = Intimate Living Place (温情饱满、记忆凝固的恋地家园)
  const [placeNess, setPlaceNess] = useState<number>(65);

  // Active interaction: user holding pointer down to "dwell & attach"
  const [isDwelling, setIsDwelling] = useState<boolean>(false);
  const [dwellCoord, setDwellCoord] = useState<{ x: number; y: number } | null>(null);

  // Memory anchors created by dwell time
  const [anchors, setAnchors] = useState<MemoryAnchor[]>([
    {
      id: 1,
      x: 0.35,
      y: 0.42,
      label: '故居庭院老樟树下',
      intensity: 0.9,
      dwellTime: 12,
      auraRadius: 55,
      quote: '“童年夏夜的蝉鸣与竹椅”',
    },
    {
      id: 2,
      x: 0.68,
      y: 0.60,
      label: '黄昏靠窗的无名书店',
      intensity: 0.75,
      dwellTime: 8,
      auraRadius: 46,
      quote: '“一杯热茶与翻页的微光”',
    },
    {
      id: 3,
      x: 0.52,
      y: 0.75,
      label: '初次挥手告别的老站台',
      intensity: 0.85,
      dwellTime: 10,
      auraRadius: 50,
      quote: '“列车轰鸣带不走的湿润视线”',
    },
  ]);

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
      const h = containerRef.current?.clientHeight || 520;
      ctx.clearRect(0, 0, w, h);

      // Background interpolates from cold interstellar indigo (Space) to warm deep sepia/charcoal (Place)
      const tPlace = placeNess / 100;
      const rBg = Math.round(15 * (1 - tPlace) + 26 * tPlace);
      const gBg = Math.round(18 * (1 - tPlace) + 21 * tPlace);
      const bBg = Math.round(26 * (1 - tPlace) + 18 * tPlace);

      ctx.fillStyle = `rgb(${rBg}, ${gBg}, ${bBg})`;
      ctx.fillRect(0, 0, w, h);

      // 1. Draw "Pure Space" Elements: Infinite Open Grid & Wandering Cosmic Vectors
      const gridOpacity = (1 - tPlace * 0.8) * 0.25;
      ctx.strokeStyle = `rgba(148, 163, 184, ${gridOpacity})`;
      ctx.lineWidth = 1;
      const gridSpacing = 40;
      for (let x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 2. Draw "Free Vector Particles" (Unrooted wanderers in space)
      const wandererCount = Math.round(24 * (1 - tPlace * 0.6));
      ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
      for (let i = 0; i < wandererCount; i++) {
        const wx = ((Math.sin(time * 0.4 + i * 1.5) * 0.45 + 0.5) * w);
        const wy = ((Math.cos(time * 0.3 + i * 2.1) * 0.45 + 0.5) * h);
        ctx.beginPath();
        ctx.arc(wx, wy, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw "Topophilic Memory Auras" (Places where meaning has crystallized)
      anchors.forEach(anc => {
        const ax = anc.x * w;
        const ay = anc.y * h;
        const baseRadius = anc.auraRadius * (0.6 + tPlace * 0.7);

        // Breathing organic aura (Water-ink blooming gradient)
        const radGrad = ctx.createRadialGradient(ax, ay, 0, ax, ay, baseRadius);
        radGrad.addColorStop(0, `rgba(245, 158, 11, ${0.45 * tPlace * anc.intensity})`);
        radGrad.addColorStop(0.4, `rgba(217, 119, 6, ${0.22 * tPlace * anc.intensity})`);
        radGrad.addColorStop(1, 'rgba(217, 119, 6, 0)');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(ax, ay, baseRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core Golden Warm Hearth (The hearth of dwelling)
        const hearthPulse = 6 + Math.sin(time * 3 + anc.id) * 1.8;
        ctx.beginPath();
        ctx.arc(ax, ay, hearthPulse, 0, Math.PI * 2);
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 16 * tPlace;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Radiating nostalgic rings
        ctx.beginPath();
        const ringR = baseRadius * 0.7 + Math.sin(time * 2 + anc.id) * 4;
        ctx.arc(ax, ay, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.35 * tPlace})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Typographic Label & Quote
        ctx.font = '12px "Noto Serif SC", serif';
        ctx.fillStyle = '#fef3c7';
        ctx.textAlign = 'center';
        ctx.fillText(anc.label, ax, ay - baseRadius * 0.6 - 12);

        ctx.font = 'italic 10px "Noto Serif SC", serif';
        ctx.fillStyle = 'rgba(253, 230, 138, 0.85)';
        ctx.fillText(anc.quote, ax, ay + baseRadius * 0.6 + 18);

        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(217, 119, 6, 0.75)';
        ctx.fillText(`ATTACHMENT: ${Math.round(anc.intensity * 100)}% · DWELL: ${anc.dwellTime}YRS`, ax, ay - baseRadius * 0.6);
      });

      // 4. Draw Ongoing Dwelling / Attachment Action (User holding click)
      if (isDwelling && dwellCoord) {
        const dx = dwellCoord.x * w;
        const dy = dwellCoord.y * h;

        const dwellR = 25 + Math.sin(time * 6) * 6;
        ctx.beginPath();
        ctx.arc(dx, dy, dwellR, 0, Math.PI * 2);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '11px "Noto Serif SC", serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('正在以停留与眷恋沉淀地方……', dx, dy - dwellR - 10);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [placeNess, anchors, isDwelling, dwellCoord]);

  // Handle pointer interactions to create/nurture a Place
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / rect.width));
    const ny = Math.max(0.08, Math.min(0.92, (e.clientY - rect.top) / rect.height));

    setIsDwelling(true);
    setDwellCoord({ x: nx, y: ny });
    audioAtmosphere.playChime(450);
  };

  const handlePointerUp = () => {
    if (isDwelling && dwellCoord) {
      // Create a newly crystallized Place anchor at dwellCoord
      const newAnchor: MemoryAnchor = {
        id: Date.now(),
        x: dwellCoord.x,
        y: dwellCoord.y,
        label: '心神停驻的新地方',
        intensity: 0.85,
        dwellTime: 1,
        auraRadius: 48,
        quote: '“此心安处，便由几何虚空化为吾乡”',
      };
      setAnchors(prev => [...prev.slice(-4), newAnchor]);
      audioAtmosphere.playChime(520);
    }
    setIsDwelling(false);
    setDwellCoord(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#171512] text-[#fbf8f2] select-none relative overflow-hidden font-serif-sc">
      {/* Top Editorial Archival Bar */}
      <div className="px-6 py-3.5 bg-[#211d19] border-b border-[#3b342c] flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#fef3c7]">
            段义孚：空间与地方·恋地情结 (Space and Place & Topophilia)
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#d97706] text-[#fef08a] bg-[#292218]">
            HUMANISTIC GEOGRAPHY · 1977
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 text-xs text-[#d5cbbf]">
          {/* Space to Place Transition Slider */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-[#b8ab9a]">空间 ↔ 地方 (Place-ness):</span>
            <input
              type="range"
              min="0"
              max="100"
              value={placeNess}
              onChange={e => setPlaceNess(Number(e.target.value))}
              className="w-24 accent-[#f59e0b] cursor-pointer"
              title="调节从冷硬未知空间向温情地方的质变程度"
            />
            <span className="font-mono text-[10px] text-[#f59e0b] w-6">{placeNess}%</span>
          </div>

          <button
            onClick={() => {
              setAnchors([
                {
                  id: 1,
                  x: 0.35,
                  y: 0.42,
                  label: '故居庭院老樟树下',
                  intensity: 0.9,
                  dwellTime: 12,
                  auraRadius: 55,
                  quote: '“童年夏夜的蝉鸣与竹椅”',
                },
                {
                  id: 2,
                  x: 0.68,
                  y: 0.60,
                  label: '黄昏靠窗的无名书店',
                  intensity: 0.75,
                  dwellTime: 8,
                  auraRadius: 46,
                  quote: '“一杯热茶与翻页的微光”',
                },
              ]);
              setPlaceNess(65);
              audioAtmosphere.playChime(380);
            }}
            className="flex items-center gap-1.5 text-[#f59e0b] hover:text-[#fef3c7] transition-colors cursor-pointer border border-[#634825] px-2.5 py-1 bg-[#2e2316]"
            title="复位记忆锚点"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">重置锚点</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full min-h-[500px] overflow-hidden select-none cursor-pointer bg-[#14120f]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Top Left Diagnostic Readout */}
        <div className="absolute top-4 left-6 z-20 flex items-center gap-3 pointer-events-none">
          <div className="bg-[#241e18]/90 backdrop-blur-md px-4 py-2 border border-[#4d3c26] shadow-lg flex items-center gap-3">
            <Heart className="w-4 h-4 text-[#f59e0b]" />
            <div className="font-mono text-[11px] space-x-2">
              <span className="text-[#a89c8d]">ONTOLOGICAL TRANSFORMATION:</span>
              <span className="text-[#fef08a] font-bold">
                {placeNess < 30 ? '开放荒凉之空间 (Open Space)' : placeNess < 70 ? '记忆凝结中的场域 (Transitional)' : '深情归宿之地方 (Intimate Place)'}
              </span>
              <span className="text-[#594935]">|</span>
              <span className="text-[#a89c8d]">TOPOPHILIA:</span>
              <span className="text-[#fbf8f2]">人对土地与生俱来的依恋之光</span>
            </div>
          </div>
        </div>

        {/* Right Explanatory Architectural Sidebar */}
        <aside
          aria-label="空间与地方解析"
          className="absolute top-6 right-5 z-20 pointer-events-auto flex flex-col gap-2.5 bg-[#211b15]/92 p-3.5 border border-[#423321] backdrop-blur-md shadow-2xl max-w-[215px]"
        >
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#423321]">
            <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#f59e0b] font-semibold">
              空间 ⟷ 地方的质变
            </span>
          </div>

          <div className="space-y-2 text-[10.5px] font-serif leading-relaxed text-[#eae2d5]">
            <p>
              <strong className="text-[#93c5fd]">空间 (Space)</strong>：给予自由，允许行动，但无依无凭，是未知的旷野。
            </p>
            <p>
              <strong className="text-[#fef08a]">地方 (Place)</strong>：提供安全、停歇与归属。因为人在其中投射了爱、记忆与时间，冰冷的坐标被凝固为温暖的港湾。
            </p>
          </div>

          <div className="pt-2 border-t border-[#423321] text-[9.5px] text-[#b0a190] font-serif leading-tight">
            在画布任意空处【长按鼠标并松开】：以您的目光与眷恋凝固一个新的“地方”。
          </div>
        </aside>

        {/* Bottom Epigraph Card */}
        <div className="absolute bottom-3 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#241e17]/92 backdrop-blur-md px-5 py-3 border border-[#4a3924] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#fef3c7] leading-relaxed italic">
              “什么是地方？地方是安全的庇护所，空间则是自由。我们依恋前者，渴望后者……从空间到地方，正是人类赋予世界以意义、将荒野转化为家园的生命历程。”
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 font-mono text-[10px] text-[#b8ab9a]">
              <span>段义孚《空间与地方：经验的视角》· 1977</span>
              <span>•</span>
              <span className="text-[#f59e0b]">人文地理与地方感</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
