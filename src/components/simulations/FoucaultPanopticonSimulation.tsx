import React, { useEffect, useRef, useState } from 'react';
import { Eye, ShieldAlert, RotateCcw, Sliders, SplitSquareVertical, Compass, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface CellSubject {
  id: number;
  angle: number; // in radians
  name: string;
  isObserved: boolean;
  disciplineScore: number;
  fidgetOffset: { x: number; y: number };
}

export const FoucaultPanopticonSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<'panopticon' | 'heterotopia'>('panopticon');
  const [beamAngle, setBeamAngle] = useState(0);
  const [beamWidth, setBeamWidth] = useState(0.48); // in radians
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed, setRotationSpeed] = useState(0.014);
  const [panopticIntensity, setPanopticIntensity] = useState(80);
  const [cursorPos, setCursorPos] = useState({ x: 0.35, y: 0.5 });
  const [observedCount, setObservedCount] = useState(0);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let currentBeam = beamAngle;
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

    const cellCount = 18;
    const subjects: CellSubject[] = Array.from({ length: cellCount }, (_, i) => ({
      id: i,
      angle: (i / cellCount) * Math.PI * 2,
      name: `牢房-${String(i + 1).padStart(2, '0')}`,
      isObserved: false,
      disciplineScore: 0.5,
      fidgetOffset: { x: 0, y: 0 },
    }));

    const render = () => {
      time += 0.025;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);
      const isMobile = w < 640;
      const cx = w * 0.5;
      const cy = h * (isMobile ? 0.52 : 0.51);

      if (mode === 'panopticon') {
        if (autoRotate) {
          currentBeam += rotationSpeed;
          if (currentBeam > Math.PI * 2) currentBeam -= Math.PI * 2;
        }

        // Scaled panopticon ring to fit safely within canvas borders on mobile
        const ringRadius = Math.min(w * (isMobile ? 0.27 : 0.33), h * (isMobile ? 0.22 : 0.26));
        const towerRadius = isMobile ? 28 : 34;

        // 1. Subtle Architectural Blueprint Grid Background
        ctx.strokeStyle = 'rgba(235, 230, 218, 0.04)';
        ctx.lineWidth = 1;
        const step = 40;
        for (let x = 0; x < w; x += step) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += step) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        // 2. Panopticon Concentric Architectural Rings
        const wallThickness = Math.max(20, Math.min(24, ringRadius * 0.18));
        ctx.strokeStyle = 'rgba(235, 230, 218, 0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius - wallThickness, 0, Math.PI * 2);
        ctx.arc(cx, cy, ringRadius + wallThickness, 0, Math.PI * 2);
        ctx.stroke();

        // Intermediate fine division ring
        ctx.strokeStyle = 'rgba(235, 230, 218, 0.08)';
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(cx, cy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Radial Partition Walls between cells
        subjects.forEach(sub => {
          const innerR = ringRadius - wallThickness;
          const outerR = ringRadius + wallThickness;
          const px1 = cx + Math.cos(sub.angle) * innerR;
          const py1 = cy + Math.sin(sub.angle) * innerR;
          const px2 = cx + Math.cos(sub.angle) * outerR;
          const py2 = cy + Math.sin(sub.angle) * outerR;

          ctx.strokeStyle = 'rgba(235, 230, 218, 0.12)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px1, py1);
          ctx.lineTo(px2, py2);
          ctx.stroke();
        });

        // 3. Central Inspection Tower (边沁与福柯的全景中央监视塔)
        ctx.beginPath();
        ctx.arc(cx, cy, towerRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#1c1b18';
        ctx.fill();
        ctx.strokeStyle = 'rgba(212, 180, 110, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Tower Inner Slit & Eye
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fillStyle = '#121110';
        ctx.fill();
        ctx.strokeStyle = '#c8a051';
        ctx.stroke();

        // Tower Typography
        ctx.font = '10px "Noto Serif SC", serif';
        ctx.fillStyle = '#eae5d8';
        ctx.textAlign = 'center';
        ctx.fillText('全景监视塔', cx, cy - 6);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#c8a051';
        ctx.fillText('PANOPTICON', cx, cy + 8);

        // 4. Surveillance Searchlight Beam (Warm tungsten / incandescent beam, not harsh cyan neon)
        const beamStartAngle = currentBeam - beamWidth / 2;
        const beamEndAngle = currentBeam + beamWidth / 2;

        const beamGrad = ctx.createRadialGradient(cx, cy, towerRadius, cx, cy, ringRadius + 50);
        beamGrad.addColorStop(0, `rgba(253, 246, 227, ${panopticIntensity / 100 * 0.45})`);
        beamGrad.addColorStop(0.5, `rgba(234, 215, 168, ${panopticIntensity / 100 * 0.20})`);
        beamGrad.addColorStop(0.85, `rgba(200, 175, 120, ${panopticIntensity / 100 * 0.05})`);
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, ringRadius + 45, beamStartAngle, beamEndAngle);
        ctx.closePath();
        ctx.fill();

        // Searchlight Edge Fine Drafting Lines
        ctx.strokeStyle = `rgba(245, 230, 185, ${panopticIntensity / 100 * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(beamStartAngle) * (ringRadius + 45), cy + Math.sin(beamStartAngle) * (ringRadius + 45));
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(beamEndAngle) * (ringRadius + 45), cy + Math.sin(beamEndAngle) * (ringRadius + 45));
        ctx.stroke();

        // 5. Draw Disciplinary Cell Subjects
        let currentWatched = 0;

        subjects.forEach(sub => {
          const cellX = cx + Math.cos(sub.angle) * ringRadius;
          const cellY = cy + Math.sin(sub.angle) * ringRadius;

          // Check if subject is inside the surveillance beam
          let angleDiff = Math.abs(sub.angle - currentBeam);
          if (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;
          const isUnderGaze = angleDiff < beamWidth / 2 + 0.06;

          sub.isObserved = isUnderGaze;
          if (isUnderGaze) currentWatched++;

          if (isUnderGaze) {
            sub.disciplineScore = Math.min(1, sub.disciplineScore + 0.04);
            sub.fidgetOffset.x *= 0.75;
            sub.fidgetOffset.y *= 0.75;
          } else {
            sub.disciplineScore = Math.max(0.15, sub.disciplineScore - 0.015);
            // Subtle autonomous fidgeting / micro-resistance
            sub.fidgetOffset.x = Math.sin(time * 2 + sub.id * 1.5) * 2.8;
            sub.fidgetOffset.y = Math.cos(time * 2 + sub.id * 1.5) * 2.8;
          }

          // Cell boundary circle
          const cellRadius = Math.max(11, Math.min(13, ringRadius * 0.10));
          ctx.strokeStyle = isUnderGaze
            ? 'rgba(253, 246, 227, 0.85)'
            : 'rgba(235, 230, 218, 0.2)';
          ctx.fillStyle = isUnderGaze ? 'rgba(50, 42, 30, 0.6)' : 'rgba(25, 24, 22, 0.5)';
          ctx.lineWidth = isUnderGaze ? 1.5 : 1;

          ctx.beginPath();
          ctx.arc(cellX, cellY, cellRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Subject Figure (Bone white under scrutiny, muted sepia in shadow)
          ctx.beginPath();
          ctx.arc(
            cellX + sub.fidgetOffset.x,
            cellY + sub.fidgetOffset.y,
            isUnderGaze ? 4 : 3,
            0,
            Math.PI * 2
          );
          ctx.fillStyle = isUnderGaze ? '#ffffff' : '#a8a095';
          if (isUnderGaze) {
            ctx.shadowColor = '#fef08a';
            ctx.shadowBlur = 8;
          }
          ctx.fill();
          ctx.shadowBlur = 0;

          // Cell ID label
          ctx.font = '8px "JetBrains Mono", monospace';
          ctx.fillStyle = isUnderGaze ? '#fde047' : 'rgba(235, 230, 218, 0.4)';
          ctx.textAlign = 'center';
          ctx.fillText(
            `#${String(sub.id + 1).padStart(2, '0')}`,
            cellX,
            cellY + (cellY > cy ? 20 : -15)
          );
        });

        setObservedCount(currentWatched);
      } else {
        // 6. Heterotopia Mode (异托邦：镜面与空间的他者性)
        const mirrorX = w * 0.5;

        // Architectural grid
        ctx.strokeStyle = 'rgba(235, 230, 218, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < w; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }

        // Mirror Threshold Centerline (Silvered Etched Mirror Plane)
        ctx.strokeStyle = '#c8a051';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(mirrorX, 0);
        ctx.lineTo(mirrorX, h);
        ctx.stroke();
        ctx.setLineDash([]);

        // Labels (safely positioned and sized)
        const labelY1 = isMobile ? 56 : 68;
        const labelY2 = labelY1 + (isMobile ? 14 : 16);

        ctx.font = isMobile ? '10px "Noto Serif SC", serif' : '12px "Noto Serif SC", serif';
        ctx.fillStyle = '#eae5d8';
        ctx.textAlign = 'center';
        ctx.fillText(isMobile ? '日常规训空间' : '日常规训空间 (Normative Reality)', mirrorX * 0.5, labelY1);
        ctx.font = isMobile ? '7.5px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#9e978c';
        ctx.fillText(isMobile ? 'LOCATED SPACE' : 'LOCATED SPACE · WHERE I PHYSICALLY AM', mirrorX * 0.5, labelY2);

        ctx.font = isMobile ? '10px "Noto Serif SC", serif' : '12px "Noto Serif SC", serif';
        ctx.fillStyle = '#c8a051';
        ctx.fillText(isMobile ? '异托邦：镜中反空间' : '异托邦：镜中反空间 (Heterotopic Mirror)', mirrorX * 1.5, labelY1);
        ctx.font = isMobile ? '7.5px "JetBrains Mono", monospace' : '10px "JetBrains Mono", monospace';
        ctx.fillStyle = '#d4b472';
        ctx.fillText(isMobile ? 'ABSENT MIRROR SPACE' : 'AN ABSENT SPACE · WHERE I AM SEEN', mirrorX * 1.5, labelY2);

        // Real subject position on left
        const rx = cursorPos.x * w;
        const ry = cursorPos.y * h;

        ctx.beginPath();
        ctx.arc(rx, ry, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#eae5d8';
        ctx.fill();
        ctx.strokeStyle = '#9e978c';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = '10px "Noto Serif SC", serif';
        ctx.fillStyle = '#eae5d8';
        ctx.fillText('凝视者之肉身', rx, ry - 16);

        // Inverted Mirror Avatar on right with surreal displacement
        const mirrorDist = mirrorX - rx;
        const mx = mirrorX + mirrorDist;
        const my = ry + Math.sin(time * 2.5) * 16;

        ctx.beginPath();
        ctx.arc(mx, my, 9, 0, Math.PI * 2);
        ctx.fillStyle = '#c8a051';
        ctx.shadowColor = '#c8a051';
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.font = '10px "Noto Serif SC", serif';
        ctx.fillStyle = '#c8a051';
        ctx.fillText('“我在我不在之所”', mx, my - 16);

        // Metaphysical ray connecting the two
        ctx.strokeStyle = 'rgba(200, 160, 81, 0.45)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(mx, my);
        ctx.stroke();

        // Expanding concentric ripples across the mirror plane
        for (let r = 1; r <= 3; r++) {
          const rippleRadius = (time * 25 * r) % 80;
          const alpha = Math.max(0, 1 - rippleRadius / 80) * 0.35;
          ctx.strokeStyle = `rgba(200, 160, 81, ${alpha})`;
          ctx.beginPath();
          ctx.arc(mirrorX, (ry + my) / 2, rippleRadius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [mode, autoRotate, rotationSpeed, beamWidth, panopticIntensity, cursorPos]);

  const updatePointer = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCursorPos({
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    updatePointer(e.clientX, e.clientY);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    updatePointer(e.clientX, e.clientY);
  };

  return (
    <div className="flex flex-col h-full bg-[#161514] text-[#eae5d8] select-none relative overflow-hidden">
      {/* Top Editorial Archival Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1d1c1a] border-b border-[#35332f] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 backdrop-blur-md text-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse shrink-0" />
          <span className="font-serif font-medium tracking-wide text-[#eae5d8] truncate text-xs">
            米歇尔·福柯：全景敞视机制与异托邦
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#4a4742] text-[#c8a051] bg-[#262422] shrink-0">
            DISCIPLINE & TOPOLOGY
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          {/* Mode Switcher */}
          <div className="bg-[#242220] p-0.5 border border-[#3c3a35] flex items-center">
            <button
              onClick={() => {
                setMode('panopticon');
                audioAtmosphere.playChime(350);
              }}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 font-serif text-[11px] sm:text-xs transition-colors cursor-pointer ${
                mode === 'panopticon'
                  ? 'bg-[#eae7dd] text-[#161514] font-medium'
                  : 'text-[#9e9a91] hover:text-[#eae7dd]'
              }`}
            >
              全景敞视
            </button>
            <button
              onClick={() => {
                setMode('heterotopia');
                audioAtmosphere.playChime(460);
              }}
              className={`px-2.5 sm:px-3 py-0.5 sm:py-1 font-serif text-[11px] sm:text-xs transition-colors cursor-pointer ${
                mode === 'heterotopia'
                  ? 'bg-[#eae7dd] text-[#161514] font-medium'
                  : 'text-[#9e9a91] hover:text-[#eae7dd]'
              }`}
            >
              镜面异托邦
            </button>
          </div>

          {mode === 'panopticon' && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[#a8a398]">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[11px] sm:text-xs">扇角:</span>
                <input
                  type="range"
                  min="0.25"
                  max="0.9"
                  step="0.05"
                  value={beamWidth}
                  onChange={e => setBeamWidth(Number(e.target.value))}
                  className="w-14 sm:w-16 accent-[#c8a051] cursor-pointer"
                />
              </div>

              <label className="flex items-center gap-1 cursor-pointer text-[#d4cfc3] text-[11px] sm:text-xs">
                <input
                  type="checkbox"
                  checked={autoRotate}
                  onChange={e => setAutoRotate(e.target.checked)}
                  className="accent-[#c8a051]"
                />
                <span className="font-serif">巡视</span>
              </label>

              <button
                onClick={() => {
                  setBeamAngle(0);
                  audioAtmosphere.playChime(260);
                }}
                className="flex items-center gap-1 text-[#c8a051] hover:text-[#eae5d8] transition-colors cursor-pointer border border-[#3c3a35] px-2 py-0.5 bg-[#242220] text-[11px]"
                title="复位圆环"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="font-mono text-[10px] uppercase">复位</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[500px] overflow-hidden select-none bg-[#161514] touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Top Floating Dossier Readout */}
        <div className="absolute top-2.5 sm:top-3 left-2.5 sm:left-6 right-2.5 sm:right-auto z-20 flex items-center gap-2 pointer-events-none max-w-[94%]">
          {mode === 'panopticon' ? (
            <div className="bg-[#1f1e1b]/92 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 border border-[#3c3933] shadow-lg flex items-center gap-2 truncate">
              <Eye className="w-3.5 h-3.5 text-[#c8a051] shrink-0" />
              <div className="font-mono text-[10px] sm:text-[10.5px] truncate">
                <span className="text-[#a8a398]">监视:</span>{' '}
                <span className="text-[#fef08a] font-bold">{observedCount} 间被视</span>
                <span className="hidden sm:inline text-[#6b675e] mx-1.5">|</span>
                <span className="hidden sm:inline text-[#eae5d8]">“见而不能知，知而不能见”</span>
              </div>
            </div>
          ) : (
            <div className="bg-[#1f1e1b]/92 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 border border-[#3c3933] shadow-lg flex items-center gap-2">
              <SplitSquareVertical className="w-3.5 h-3.5 text-[#c8a051] shrink-0" />
              <div className="font-mono text-[10px] sm:text-[10.5px]">
                <span className="text-[#c8a051] font-bold">镜面：使自身在缺席之所可见</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Archival Epigraph Card with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-3 left-2.5 sm:left-6 right-2.5 sm:right-6 z-30 pointer-events-none">
          <div className="bg-[#1d1c1a]/92 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-3 border border-[#383631] shadow-xl max-w-2xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#9e978c] font-mono truncate">
                {mode === 'panopticon' ? '米歇尔·福柯《规训与惩罚》(1975)' : '米歇尔·福柯《异托邦》(1967)'}
              </span>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#c8a051] hover:text-[#eae5d8] cursor-pointer flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-[#3c3a35] bg-[#242220]"
              >
                <span>{isQuoteExpanded ? '收起' : '展开'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-[#35332f] text-center">
                {mode === 'panopticon' ? (
                  <p className="text-xs font-serif text-[#eae5d8] leading-relaxed italic">
                    “全景敞视建筑是一种奇妙的机器：无论人们出于何种动机来使用它，它所产生的权力效应都是同质的……被规训者不需要手铐脚镣，中央视线的潜在可能性已经让他主动内化了对自我的监视。”
                  </p>
                ) : (
                  <p className="text-xs font-serif text-[#eae5d8] leading-relaxed italic">
                    “镜子是一个没有地方的地方……我在那里发现自己不在我身在之地，而是在一片虚拟的空间里。从那双从镜子深处投向我的眼睛开始，我折返自身，重新审视我自己。”
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
