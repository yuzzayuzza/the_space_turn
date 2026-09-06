import React, { useEffect, useRef, useState } from 'react';
import { Eye, Waves, Sparkles, RotateCcw } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

export const MerleauPontyBodySimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0.5, y: 0.5 });
  const [viscosity, setViscosity] = useState(65);
  const [horizonRadius, setHorizonRadius] = useState(190);
  const [isBreathing, setIsBreathing] = useState(true);
  const ripplesRef = useRef<Ripple[]>([]);

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

    // Grid nodes for the "Flesh of the World" (世界之肉)
    const cols = 28;
    const rows = 18;

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const bodyX = cursorPos.x * w;
      const bodyY = cursorPos.y * h;

      const breath = isBreathing ? Math.sin(time) * 16 : 0;
      const currentHorizon = horizonRadius + breath;

      // Soft Alabaster & Warm Amber Flesh Gradient (No cyan neon)
      const grad = ctx.createRadialGradient(bodyX, bodyY, 12, bodyX, bodyY, currentHorizon * 1.4);
      grad.addColorStop(0, 'rgba(235, 225, 205, 0.16)');
      grad.addColorStop(0.45, 'rgba(200, 185, 160, 0.06)');
      grad.addColorStop(0.85, 'rgba(160, 145, 120, 0.015)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Render Tactile Ripples
      ripplesRef.current.forEach((r, idx) => {
        r.radius += 2.2;
        r.alpha *= 0.96;

        ctx.strokeStyle = `rgba(200, 160, 81, ${r.alpha * 0.8})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (r.alpha < 0.01) {
          ripplesRef.current.splice(idx, 1);
        }
      });

      // Calculate deformed grid points
      const points: { x: number; y: number; focus: number }[][] = [];

      for (let r = 0; r <= rows; r++) {
        points[r] = [];
        for (let c = 0; c <= cols; c++) {
          const originX = (c / cols) * w;
          const originY = (r / rows) * h;

          const dx = originX - bodyX;
          const dy = originY - bodyY;
          const dist = Math.hypot(dx, dy);

          // Embodied displacement
          let defX = originX;
          let defY = originY;

          if (dist < currentHorizon && dist > 1) {
            const factor = 1 - dist / currentHorizon;
            const displacement = Math.sin(factor * Math.PI) * (viscosity * 0.4);
            defX += (dx / dist) * displacement;
            defY += (dy / dist) * displacement;
          }

          const focus = Math.max(0, 1 - dist / currentHorizon);
          points[r][c] = { x: defX, y: defY, focus };
        }
      }

      // Draw horizontal lines of the perceptual web
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const p = points[r][c];
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(235, 230, 220, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw vertical lines of the perceptual web
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const p = points[r][c];
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(235, 230, 220, 0.12)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw focal nodes in high-attention field
      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const p = points[r][c];
          if (p.focus > 0.25) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.focus * 2.8, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(200, 160, 81, ${p.focus * 0.75})`;
            ctx.fill();
          }
        }
      }

      // Draw Body-Subject Center (肉身主体)
      ctx.beginPath();
      ctx.arc(bodyX, bodyY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#c8a051';
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Subtle outward pulse
      ctx.beginPath();
      ctx.arc(bodyX, bodyY, 14 + Math.sin(time * 3) * 3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(200, 160, 81, 0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [cursorPos, viscosity, horizonRadius, isBreathing]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripplesRef.current.push({
      x,
      y,
      radius: 5,
      maxRadius: 180,
      alpha: 0.8,
    });
    audioAtmosphere.playChime(420);
  };

  return (
    <div className="flex flex-col h-full bg-[#151416] text-[#eae5df] select-none relative overflow-hidden">
      {/* Top Editorial Bar */}
      <div className="px-6 py-3.5 bg-[#1b1a1d] border-b border-[#333036] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#eae5df]">
            莫里斯·梅洛-庞蒂：身体图式与世界之肉 (The Flesh)
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#443f4a] text-[#c8a051] bg-[#252229]">
            PHENOMENOLOGY OF PERCEPTION
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#aba4b2]">
          <div className="flex items-center gap-2">
            <span className="font-serif">知觉黏滞感:</span>
            <input
              type="range"
              min="20"
              max="100"
              value={viscosity}
              onChange={e => setViscosity(Number(e.target.value))}
              className="w-18 accent-[#c8a051] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-serif">视界半径:</span>
            <input
              type="range"
              min="120"
              max="260"
              value={horizonRadius}
              onChange={e => setHorizonRadius(Number(e.target.value))}
              className="w-18 accent-[#c8a051] cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer hover:text-[#eae5df]">
            <input
              type="checkbox"
              checked={isBreathing}
              onChange={e => setIsBreathing(e.target.checked)}
              className="accent-[#c8a051]"
            />
            <span className="font-serif">呼吸脉动</span>
          </label>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        className="relative flex-1 w-full min-h-[460px] cursor-none overflow-hidden select-none bg-[#131214]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Tip Indicator */}
        <div className="absolute top-4 left-6 z-20 text-[11px] text-[#c8a051] bg-[#1e1c20]/90 px-3.5 py-1.5 border border-[#37323d] font-serif">
          移动光标：肉身作为知觉的原点扰动空间织锦；点击画布激发触觉震颤涟漪
        </div>

        {/* Bottom Annotation */}
        <div className="absolute bottom-4 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#18171a]/92 backdrop-blur-md p-4 border border-[#34303b] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#eae5df] leading-relaxed italic">
              “我的身体并非处于客观空间之中的几何箱体，它是空间借以开启的始原之源。看者与可见者、触者与被触者在此交错缠绕。”
            </p>
            <span className="block mt-1.5 font-mono text-[10px] text-[#c8a051]">
              莫里斯·梅洛-庞蒂《知觉现象学》· 1945
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
