import React, { useEffect, useRef, useState } from 'react';
import { Infinity as InfinityIcon, Rotate3d, Sparkles, Sliders, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

export const LacanMobiusSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [rotX, setRotX] = useState(0.5);
  const [rotY, setRotY] = useState(0.4);
  const [speed, setSpeed] = useState(1.0);
  const [particleU, setParticleU] = useState(0); // 0 to 4*PI
  const [currentDomain, setCurrentDomain] = useState<'interior' | 'exterior'>('interior');
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let uProgress = particleU;

    const resize = () => {
      if (!containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const uSegments = 80;
    const vSegments = 4;

    const project = (x: number, y: number, z: number, cx: number, cy: number) => {
      // 3D rotation
      // Rotate around Y
      let x1 = x * Math.cos(rotY) + z * Math.sin(rotY);
      let z1 = -x * Math.sin(rotY) + z * Math.cos(rotY);

      // Rotate around X
      let y2 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
      let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);

      // Perspective projection
      const fov = 480;
      const scale = fov / (fov + z2);

      return {
        px: cx + x1 * scale,
        py: cy + y2 * scale,
        scale,
        depth: z2,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const isMobile = w < 640;
      const cx = w * 0.5;
      const cy = h * (isMobile ? 0.52 : 0.51);

      // Dynamically scaled radius to prevent collision with edges or bottom epigraph
      const maxDim = Math.min(w * (isMobile ? 0.29 : 0.35), h * (isMobile ? 0.22 : 0.27));
      const R = Math.max(78, Math.min(136, maxDim));
      const stripWidth = R * 0.27;

      uProgress += 0.012 * speed;
      if (uProgress > Math.PI * 4) {
        uProgress = 0;
      }
      setParticleU(uProgress);

      const inExterior = uProgress > Math.PI * 2;
      setCurrentDomain(inExterior ? 'exterior' : 'interior');

      // Generate wireframe polygons for Möbius Strip
      // Parametric equations of Möbius strip:
      // u in [0, 2*PI], v in [-w/2, w/2]
      // x = (R + v * cos(u/2)) * cos(u)
      // y = (R + v * cos(u/2)) * sin(u)
      // z = v * sin(u/2)

      const quads: {
        points: { px: number; py: number }[];
        avgDepth: number;
        uIndex: number;
      }[] = [];

      for (let i = 0; i < uSegments; i++) {
        const u0 = (i / uSegments) * Math.PI * 2;
        const u1 = ((i + 1) / uSegments) * Math.PI * 2;

        for (let j = 0; j < vSegments; j++) {
          const v0 = -stripWidth + (j / vSegments) * (stripWidth * 2);
          const v1 = -stripWidth + ((j + 1) / vSegments) * (stripWidth * 2);

          const p00 = project(
            (R + v0 * Math.cos(u0 / 2)) * Math.cos(u0),
            (R + v0 * Math.cos(u0 / 2)) * Math.sin(u0),
            v0 * Math.sin(u0 / 2),
            cx,
            cy
          );

          const p10 = project(
            (R + v0 * Math.cos(u1 / 2)) * Math.cos(u1),
            (R + v0 * Math.cos(u1 / 2)) * Math.sin(u1),
            v0 * Math.sin(u1 / 2),
            cx,
            cy
          );

          const p11 = project(
            (R + v1 * Math.cos(u1 / 2)) * Math.cos(u1),
            (R + v1 * Math.cos(u1 / 2)) * Math.sin(u1),
            v1 * Math.sin(u1 / 2),
            cx,
            cy
          );

          const p01 = project(
            (R + v1 * Math.cos(u0 / 2)) * Math.cos(u0),
            (R + v1 * Math.cos(u0 / 2)) * Math.sin(u0),
            v1 * Math.sin(u0 / 2),
            cx,
            cy
          );

          const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4;

          quads.push({
            points: [p00, p10, p11, p01],
            avgDepth,
            uIndex: i,
          });
        }
      }

      // Sort quads by depth for painter's algorithm
      quads.sort((a, b) => b.avgDepth - a.avgDepth);

      // Render wireframe / surface
      quads.forEach(quad => {
        ctx.beginPath();
        ctx.moveTo(quad.points[0].px, quad.points[0].py);
        for (let k = 1; k < quad.points.length; k++) {
          ctx.lineTo(quad.points[k].px, quad.points[k].py);
        }
        ctx.closePath();

        const depthAlpha = Math.max(0.2, Math.min(0.9, (quad.avgDepth + 150) / 300));
        ctx.fillStyle = `rgba(216, 180, 254, ${0.08 * depthAlpha})`;
        ctx.fill();

        ctx.strokeStyle = `rgba(230, 220, 240, ${0.32 * depthAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Calculate Subject Particle Position
      // For a seamless single-sided journey, u goes from 0 to 4*PI
      // We flip v side if in second turn!
      const currentU = uProgress % (Math.PI * 2);
      const isSecondLoop = uProgress >= Math.PI * 2;
      const currentV = (isSecondLoop ? 1 : -1) * (stripWidth * 0.4);

      const subX = (R + currentV * Math.cos(currentU / 2)) * Math.cos(currentU);
      const subY = (R + currentV * Math.cos(currentU / 2)) * Math.sin(currentU);
      const subZ = currentV * Math.sin(currentU / 2);

      const subProj = project(subX, subY, subZ, cx, cy);

      // Draw Subject Glow
      ctx.beginPath();
      ctx.arc(subProj.px, subProj.py, 8 * subProj.scale, 0, Math.PI * 2);
      ctx.fillStyle = isSecondLoop ? '#f43f5e' : '#a855f7'; // red for radical exterior alterity, purple for intimate ego
      ctx.shadowColor = isSecondLoop ? '#f43f5e' : '#c084fc';
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Subject Label
      ctx.font = '11px "Noto Serif SC", serif';
      ctx.fillStyle = '#f3e8ff';
      ctx.textAlign = 'center';
      ctx.fillText(
        isSecondLoop ? '主体在外部 (Alterity)' : '主体在内部 (Intimacy)',
        subProj.px,
        subProj.py - 16
      );

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [rotX, rotY, speed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };

    setRotY(prev => prev + dx * 0.008);
    setRotX(prev => Math.max(-1.2, Math.min(1.2, prev + dy * 0.008)));
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="flex flex-col h-full bg-[#151417] text-[#ebe7e2] select-none relative overflow-hidden">
      {/* Top Editorial Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1b191e] border-b border-[#343038] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#c4b5fd] animate-pulse shrink-0" />
          <span className="font-serif font-medium tracking-wide text-[#eae5df] truncate text-xs">
            雅克·拉康：无意识拓扑 · 莫比乌斯环与外亲性 (Extimité)
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#484252] text-[#c4b5fd] bg-[#26232c] shrink-0">
            TOPOLOGY
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
          {/* Current Domain Indicator */}
          <div className="flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 bg-[#232029] border border-[#3b3644] text-[11px] sm:text-xs">
            <span className="text-[#a59eb0] hidden sm:inline">态:</span>
            <span
              className={`font-serif font-bold ${
                currentDomain === 'interior' ? 'text-[#e9d5ff]' : 'text-[#fecdd3]'
              }`}
            >
              {currentDomain === 'interior' ? '内在欲望' : '外亲他者'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 text-[#b0a8bb]">
            <span className="font-serif text-[11px] sm:text-xs">速率:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={speed}
              onChange={e => setSpeed(Number(e.target.value))}
              className="w-14 sm:w-16 accent-[#c4b5fd] cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setRotX(0.5);
              setRotY(0.4);
              audioAtmosphere.playChime(440);
            }}
            className="flex items-center gap-1 text-[#c4b5fd] hover:text-[#f3e8ff] transition-colors cursor-pointer border border-[#3b3546] px-2 py-0.5 sm:px-2.5 sm:py-1 bg-[#232029] text-[11px]"
            title="重置3D观察视角"
          >
            <RefreshCw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">重置</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[460px] cursor-grab active:cursor-grabbing overflow-hidden select-none bg-[#131215] touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Tip */}
        <div className="absolute top-2.5 sm:top-4 left-2.5 sm:left-6 right-2.5 sm:right-auto z-20 text-[10px] sm:text-[11px] text-[#c4b5fd] bg-[#1d1b22]/90 px-2.5 sm:px-3.5 py-1 sm:py-1.5 border border-[#36313f] font-serif flex items-center gap-1.5 sm:gap-2">
          <Rotate3d className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
          <span>滑动/拖拽：3D旋转观察莫比乌斯曲面的单侧连续空间</span>
        </div>

        {/* Bottom Annotation with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-4 left-2.5 sm:left-6 right-2.5 sm:right-6 z-30 pointer-events-none">
          <div className="bg-[#19171d]/92 backdrop-blur-md px-3 py-2 sm:p-4 border border-[#342f3d] shadow-xl max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#c4b5fd] font-mono truncate">
                雅克·拉康《精神分析的拓扑学》· 外亲性
              </span>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#c4b5fd] hover:text-[#f3e8ff] cursor-pointer flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-[#3b3546] bg-[#232029]"
              >
                <span>{isQuoteExpanded ? '收起' : '展开'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-[#342f3d] text-center">
                <p className="text-xs font-serif text-[#ebe7e2] leading-relaxed italic">
                  “主体的内部空间没有一堵分明的内墙。莫比乌斯环表明：沿着一条连续的单侧曲面滑行，你无需翻越任何边缘，便会发现那最私密、最核心的‘内’，恰恰是不可抵挡的绝对象征‘外’。”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
