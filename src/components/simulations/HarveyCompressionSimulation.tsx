import React, { useEffect, useRef, useState } from 'react';
import { FastForward, Globe, Sliders, RotateCcw, Zap } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface CityNode {
  id: string;
  name: string;
  baseX: number;
  baseY: number;
  isCore: boolean;
}

export const HarveyCompressionSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [velocity, setVelocity] = useState(25); // 1 to 100
  const [showGrid, setShowGrid] = useState(true);

  const cities: CityNode[] = [
    { id: 'ny', name: '纽约 (New York)', baseX: 0.28, baseY: 0.38, isCore: true },
    { id: 'ldn', name: '伦敦 (London)', baseX: 0.48, baseY: 0.28, isCore: true },
    { id: 'tyo', name: '东京 (Tokyo)', baseX: 0.82, baseY: 0.42, isCore: true },
    { id: 'sh', name: '上海 (Shanghai)', baseX: 0.74, baseY: 0.52, isCore: true },
    { id: 'par', name: '巴黎 (Paris)', baseX: 0.52, baseY: 0.36, isCore: true },
    { id: 'p1', name: '边缘矿区 (Peripheral Mine)', baseX: 0.15, baseY: 0.75, isCore: false },
    { id: 'p2', name: '内陆腹地 (Hinterland Town)', baseX: 0.38, baseY: 0.82, isCore: false },
    { id: 'p3', name: '荒原哨所 (Outpost)', baseX: 0.88, baseY: 0.8, isCore: false },
  ];

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

    const render = () => {
      time += 0.03;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w * 0.52;
      const cy = h * 0.42;

      // Compression Factor (0 to 0.75)
      const compressFactor = (velocity / 100) * 0.72;

      // Calculate compressed coordinates for each city
      const currentNodes = cities.map(c => {
        const ox = c.baseX * w;
        const oy = c.baseY * h;

        if (c.isCore) {
          // Core cities pulled strongly inward into central nexus
          const nx = ox + (cx - ox) * compressFactor;
          const ny = oy + (cy - oy) * compressFactor;
          return { ...c, x: nx, y: ny };
        } else {
          // Peripheral regions pushed further away / isolated by capital unevenness
          const nx = ox - (cx - ox) * (compressFactor * 0.35);
          const ny = oy - (cy - oy) * (compressFactor * 0.35);
          return { ...c, x: nx, y: ny };
        }
      });

      // 1. Draw warped spacetime grid under capital acceleration
      if (showGrid) {
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.12)';
        ctx.lineWidth = 1;
        const gridStep = 40;

        for (let gx = 0; gx <= w; gx += gridStep) {
          ctx.beginPath();
          for (let gy = 0; gy <= h; gy += 15) {
            let px = gx;
            let py = gy;
            const dist = Math.hypot(px - cx, py - cy);
            const warp = Math.max(0, 1 - dist / 320) * compressFactor * 60;

            px += ((cx - px) / (dist || 1)) * warp;
            py += ((cy - py) / (dist || 1)) * warp;

            if (gy === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
      }

      // 2. Draw Financial Geodesics between core cities
      const coreNodes = currentNodes.filter(c => c.isCore);
      ctx.lineWidth = 1.5;

      for (let i = 0; i < coreNodes.length; i++) {
        for (let j = i + 1; j < coreNodes.length; j++) {
          const n1 = coreNodes[i];
          const n2 = coreNodes[j];

          // Pulsing transaction stream
          const grad = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
          grad.addColorStop(0, 'rgba(249, 115, 22, 0.6)');
          grad.addColorStop(0.5, 'rgba(254, 215, 170, 0.9)');
          grad.addColorStop(1, 'rgba(249, 115, 22, 0.6)');

          ctx.strokeStyle = grad;
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();

          // Traveling transaction packet
          const packetPos = (time * (velocity / 20) + (i + j) * 0.2) % 1;
          const pX = n1.x + (n2.x - n1.x) * packetPos;
          const pY = n1.y + (n2.y - n1.y) * packetPos;

          ctx.beginPath();
          ctx.arc(pX, pY, 3, 0, Math.PI * 2);
          ctx.fillStyle = '#ffedd5';
          ctx.fill();
        }
      }

      // 3. Draw Cities
      currentNodes.forEach(c => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.isCore ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = c.isCore ? '#f97316' : '#78716c';
        ctx.shadowColor = c.isCore ? '#fb923c' : 'transparent';
        ctx.shadowBlur = c.isCore ? 14 : 0;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '11px "Noto Serif SC", serif';
        ctx.fillStyle = c.isCore ? '#ffedd5' : '#a8a29e';
        ctx.textAlign = 'center';
        ctx.fillText(c.name, c.x, c.y + 18);
      });

      // Core Hyperspace Vortex Center
      if (velocity > 60) {
        ctx.beginPath();
        ctx.arc(cx, cy, 35 * compressFactor, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '10px "Space Grotesk", monospace';
        ctx.fillStyle = '#fdba74';
        ctx.fillText('零延迟瞬时资本枢纽', cx, cy - 25 * compressFactor);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [velocity, showGrid]);

  return (
    <div className="flex flex-col h-full bg-[#161412] text-[#f4efe8] select-none relative overflow-hidden">
      {/* Top Editorial Bar */}
      <div className="px-6 py-3.5 bg-[#1d1a17] border-b border-[#352f28] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#eae4d8]">
            大卫·哈维：时空压缩与资本加速 (Time-Space Compression)
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#483f35] text-[#c8a051] bg-[#29231d]">
            GEOGRAPHY OF CAPITAL
          </span>
        </div>

        <div className="flex items-center gap-5 text-[#b5aba0]">
          <div className="flex items-center gap-2">
            <span className="font-serif">资本流转速度:</span>
            <input
              type="range"
              min="5"
              max="100"
              value={velocity}
              onChange={e => {
                setVelocity(Number(e.target.value));
                if (Number(e.target.value) % 15 === 0) {
                  audioAtmosphere.playChime(300 + Number(e.target.value) * 3);
                }
              }}
              className="w-24 accent-[#c8a051] cursor-pointer"
            />
            <span className="font-mono text-[#c8a051] font-bold">{velocity}x 速率</span>
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[#d6cec3]">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={e => setShowGrid(e.target.checked)}
              className="accent-[#c8a051]"
            />
            <span className="font-serif">时空曲率网格</span>
          </label>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[460px] overflow-hidden select-none bg-[#151311]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Tip */}
        <div className="absolute top-4 left-6 z-20 text-[11px] text-[#c8a051] bg-[#201c18]/90 px-3.5 py-1.5 border border-[#3f372e] font-serif flex items-center gap-2">
          <FastForward className="w-3.5 h-3.5" />
          <span>加速滑块：资本流转速率吞噬物理地理，全球核心都会向内吸积坍缩</span>
        </div>

        {/* Bottom Annotation */}
        <div className="absolute bottom-4 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#1c1916]/92 backdrop-blur-md p-4 border border-[#3b342c] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#eae4d8] leading-relaxed italic">
              “资本为了克服自身的流动危机，必须持续用时间消灭空间。物理世界的距离感在高速金融与通信中瞬间熔断，世界被挤压成紧密折叠的枢纽与被遗弃的荒原。”
            </p>
            <span className="block mt-1.5 font-mono text-[10px] text-[#c8a051]">
              大卫·哈维《后现代的状况》· 1989
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
