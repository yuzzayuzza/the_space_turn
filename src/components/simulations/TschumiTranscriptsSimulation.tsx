import React, { useEffect, useRef, useState } from 'react';
import {
  Film,
  Zap,
  Play,
  RotateCcw,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

type EventType = 'normal' | 'murder' | 'skate' | 'riot' | 'fall';

interface EventConfig {
  id: EventType;
  titleZh: string;
  titleEn: string;
  descZh: string;
  shockFactor: number;
  hueColor: string;
  colorMeaning: string; // 简要解释当前颜色的空间与事件象征意义
  spaceMorph: 'grid' | 'fracture' | 'explosion' | 'spiral';
  motionPattern: 'calm' | 'frenzy' | 'zigzag' | 'cascade';
}

export const TschumiTranscriptsSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [activeEventType, setActiveEventType] = useState<EventType>('normal');
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [montageMode, setMontageMode] = useState<'triad' | 'superimposed'>('triad');
  const [showLegendModal, setShowLegendModal] = useState<boolean>(false); // 默认不展开占用视野
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // 深刻诠释伯纳德·屈米《曼哈顿转录》中颜色与事件的对应哲学
  const eventConfigs: Record<EventType, EventConfig> = {
    normal: {
      id: 'normal',
      titleZh: '静默日常：线框与走廊',
      titleEn: 'Episode 0: The Grid & Linear Routine',
      descZh: '规整网格立面与单向步行轨迹，形式处于未被激化的几何冷态。',
      shockFactor: 0.1,
      hueColor: '#c8a051', // Blueprint Gold
      colorMeaning: '【琥珀金色】纯粹理性、中性建筑蓝图与未被冲突打扰的冷峻几何秩序。',
      spaceMorph: 'grid',
      motionPattern: 'calm',
    },
    murder: {
      id: 'murder',
      titleZh: '楼顶追逐与谋杀 (The Murder)',
      titleEn: 'Episode 1: The Park & The Murder',
      descZh: '突发凶案刺破建筑立面，身体坠落的狂暴运动撕裂了原本静止的柱廊框架。',
      shockFactor: 2.8,
      hueColor: '#ef4444', // Red of Folie & Blood
      colorMeaning: '【腥红赤焰】屈米拉维莱特公园红（Folie），代表偶发暴力、血光与形式的撕裂。',
      spaceMorph: 'fracture',
      motionPattern: 'cascade',
    },
    skate: {
      id: 'skate',
      titleZh: '地下滑板狂欢 (Subway Skating)',
      titleEn: 'Episode 2: The Street & Rapid Drift',
      descZh: '青年亚文化反叛既定动线，弧线滑行将刚性楼梯与地下隧道重新编码为流体场。',
      shockFactor: 1.9,
      hueColor: '#38bdf8', // Electric Cyan
      colorMeaning: '【流光电蓝】地下霓虹掠影、滑板飞跃矢量与对刚性空间的流动再编码。',
      spaceMorph: 'spiral',
      motionPattern: 'zigzag',
    },
    riot: {
      id: 'riot',
      titleZh: '突发街头集会与冲突 (The Riot)',
      titleEn: 'Episode 3: The Tower & Violent Clash',
      descZh: '大量人群冲击公共广场，空间的监视屏障在偶发集会的高能冲击下全面解体。',
      shockFactor: 3.2,
      hueColor: '#f97316', // High-energy Orange
      colorMeaning: '【燃烧橙黄】集体亢奋、抗争烟火与对规训空间的全面突破冲撞。',
      spaceMorph: 'explosion',
      motionPattern: 'frenzy',
    },
    fall: {
      id: 'fall',
      titleZh: '身体坠落与失重 (The Fall)',
      titleEn: 'Episode 4: The Block & Free Fall',
      descZh: '垂直重力摧毁水平楼板，解构主义红点点阵与急坠矢量产生戏剧性重叠。',
      shockFactor: 2.4,
      hueColor: '#ec4899', // Magenta Gravity
      colorMeaning: '【重力洋红】身体在自由落体中的眩晕感与空间在三维失重下的极端扭结。',
      spaceMorph: 'fracture',
      motionPattern: 'cascade',
    },
  };

  const triggerEvent = (type: EventType) => {
    setActiveEventType(type);
    audioAtmosphere.playChime(type === 'normal' ? 300 : 540);
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

    const cfg = eventConfigs[activeEventType];

    // Helper functions to render the 3 layers so both Triad & Superimposed modes share full fidelity
    const drawSpaceLayer = (cx: number, cy: number, scale: number, shock: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      if (cfg.spaceMorph === 'grid') {
        // Neat orthogonal grid with axonometric room
        ctx.strokeStyle = 'rgba(240, 230, 215, 0.75)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-scale, -scale * 1.1, scale * 2, scale * 2.2);

        // Subdivisions
        ctx.beginPath();
        ctx.moveTo(-scale, 0);
        ctx.lineTo(scale, 0);
        ctx.moveTo(0, -scale * 1.1);
        ctx.lineTo(0, scale * 1.1);
        ctx.strokeStyle = 'rgba(240, 230, 215, 0.35)';
        ctx.stroke();

        // Tschumi red folie accent dot
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-6, -6, 12, 12);
      } else if (cfg.spaceMorph === 'fracture') {
        // Violent shear angles & shattered lines
        const shake = Math.sin(time * 12) * shock * 2.5;
        const angle = Math.sin(time * 2) * 0.22 * shock;
        ctx.rotate(angle);

        ctx.strokeStyle = '#f87171';
        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(-scale - shake, -scale + shake);
        ctx.lineTo(scale * 0.7, -scale * 0.85);
        ctx.lineTo(scale + shake, scale);
        ctx.lineTo(-scale * 0.5, scale * 1.2);
        ctx.closePath();
        ctx.stroke();

        // Splintering fracture rays
        for (let r = 0; r < 5; r++) {
          const ra = (r / 5) * Math.PI * 2 + time;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ra) * scale * 1.2, Math.sin(ra) * scale * 1.2);
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.stroke();
        }
      } else if (cfg.spaceMorph === 'spiral') {
        // Curved deconstructivist warping for skateboarding
        ctx.rotate(time * 0.4);
        for (let ring = 1; ring <= 4; ring++) {
          ctx.beginPath();
          ctx.ellipse(
            0,
            0,
            ring * (scale * 0.45),
            ring * (scale * 0.25),
            time + ring,
            0,
            Math.PI * 2
          );
          ctx.strokeStyle = ring % 2 === 0 ? '#38bdf8' : 'rgba(200, 160, 81, 0.6)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
      } else if (cfg.spaceMorph === 'explosion') {
        // Dispersed fragments flying outward
        const count = 10;
        for (let p = 0; p < count; p++) {
          const pa = (p / count) * Math.PI * 2 + time * 0.4;
          const pDist = scale * (0.5 + Math.sin(time * 3 + p) * 0.45 * shock);
          const px = Math.cos(pa) * pDist;
          const py = Math.sin(pa) * pDist;

          ctx.fillStyle = p % 2 === 0 ? '#f97316' : '#ffffff';
          ctx.fillRect(px - 4, py - 4, 8, 8);

          ctx.strokeStyle = 'rgba(249, 115, 22, 0.5)';
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(px, py);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const drawMovementLayer = (cx: number, cy: number, wSpan: number, hSpan: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      if (cfg.motionPattern === 'calm') {
        const walkY = Math.sin(time * 2) * (hSpan * 0.38);
        ctx.strokeStyle = '#c8a051';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -hSpan * 0.45);
        ctx.lineTo(0, hSpan * 0.45);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, walkY, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#c8a051';
        ctx.beginPath();
        ctx.moveTo(0, walkY);
        ctx.lineTo(0, walkY + 20);
        ctx.stroke();
      } else if (cfg.motionPattern === 'cascade') {
        const pointsCount = 18;
        ctx.beginPath();
        for (let pt = 0; pt < pointsCount; pt++) {
          const prog = pt / pointsCount;
          const vy = -hSpan * 0.45 + prog * (hSpan * 0.9);
          const vx = Math.sin(time * 5 + pt * 0.8) * (wSpan * 0.4);
          if (pt === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        for (let k = 0; k < 3; k++) {
          const phase = ((time * 1.5 + k * 0.33) % 1);
          const fy = -hSpan * 0.45 + phase * (hSpan * 0.9);
          const fx = Math.sin(time * 5 + phase * 10) * (wSpan * 0.4);

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (cfg.motionPattern === 'zigzag') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let step = -4; step <= 4; step++) {
          const sy = step * 24;
          const sx = Math.sin(time * 4 + step * 0.6) * (wSpan * 0.4);
          if (step === -4) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.stroke();

        const skaterX = Math.sin(time * 4) * (wSpan * 0.4);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(skaterX, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (cfg.motionPattern === 'frenzy') {
        for (let b = 0; b < 9; b++) {
          const bx = Math.sin(time * 3 + b * 2.1) * (wSpan * 0.4);
          const by = Math.cos(time * 3.5 + b * 1.7) * (hSpan * 0.38);

          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.arc(bx, by, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(249, 115, 22, 0.45)';
          ctx.beginPath();
          ctx.moveTo(bx, by);
          ctx.lineTo(bx + Math.cos(b) * 18, by + Math.sin(b) * 18);
          ctx.stroke();
        }
      }

      ctx.restore();
    };

    const drawEventLayer = (cx: number, cy: number, shock: number, isMobile: boolean) => {
      ctx.save();
      ctx.translate(cx, cy);

      const eventPulse = Math.sin(time * 4) * 6 * shock;
      const coreRadius = (isMobile ? 24 : 36) + eventPulse;

      for (let ring = 1; ring <= 3; ring++) {
        const rR = coreRadius + ring * ((isMobile ? 10 : 16) + Math.sin(time * 3) * 4);
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(8, rR), 0, Math.PI * 2);
        ctx.strokeStyle = cfg.hueColor;
        ctx.globalAlpha = Math.max(0.15, 0.7 - ring * 0.18);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.beginPath();
      ctx.arc(0, 0, coreRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#201d24';
      ctx.fill();
      ctx.strokeStyle = cfg.hueColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.font = isMobile ? 'bold 10px "Noto Serif SC", serif' : 'bold 12px "Noto Serif SC", serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(activeEventType === 'normal' ? '常规' : '偶发暴突', 0, -2);

      ctx.font = isMobile ? '9px "Noto Serif SC", serif' : '10px "Noto Serif SC", serif';
      ctx.fillStyle = cfg.hueColor;
      ctx.fillText(`${shock.toFixed(1)}x`, 0, isMobile ? 11 : 14);

      ctx.restore();
    };

    const render = () => {
      time += 0.03 * playbackSpeed;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);

      const isMobile = w < 640;
      const currentShock = cfg.shockFactor;
      const topY = isMobile ? 46 : 46;
      // Leave ample clear space for bottom card
      const frameH = Math.max(220, h - topY - (isMobile ? 70 : 85));

      if (montageMode === 'triad') {
        // Clear 3-Column Filmic Strip Layout
        const padX = isMobile ? 8 : 24;
        const colGap = isMobile ? 6 : 12;
        const colW = (w - padX * 2 - colGap * 2) / 3;

        const columns = [
          {
            name: isMobile ? '空间图式' : '第一轨 · 空间图式 (SPACES)',
            sub: '平立剖破裂',
            col: 0,
          },
          {
            name: isMobile ? '运动轨迹' : '第二轨 · 运动轨迹 (MOVEMENTS)',
            sub: '舞蹈身体动线',
            col: 1,
          },
          {
            name: isMobile ? '偶发事件' : '第三轨 · 偶发事件 (EVENTS)',
            sub: '戏剧冲突与暴力',
            col: 2,
          },
        ];

        columns.forEach(c => {
          const fx = padX + c.col * (colW + colGap);

          // Column frame container
          ctx.fillStyle = '#151318';
          ctx.fillRect(fx, topY, colW, frameH);

          // Fine Architectural Border & Tschumi Film Sprocket Holes
          ctx.strokeStyle = activeEventType === 'normal' ? '#35313d' : 'rgba(200, 160, 81, 0.45)';
          ctx.lineWidth = 1.2;
          ctx.strokeRect(fx, topY, colW, frameH);

          // Filmstrip sprocket perforations
          const sprockets = isMobile ? 4 : 7;
          for (let s = 0; s < sprockets; s++) {
            const sx = fx + 6 + s * ((colW - 16) / Math.max(1, sprockets - 1));
            ctx.fillStyle = '#221f27';
            ctx.fillRect(sx - 2, topY + 3, 4, 5);
            ctx.fillRect(sx - 2, topY + frameH - 8, 4, 5);
          }

          // Header Text (Comfortable vertical separation)
          ctx.font = isMobile ? '600 10.5px "Noto Serif SC", serif' : '600 12px "Noto Serif SC", serif';
          ctx.fillStyle = activeEventType === 'normal' ? '#f5efe6' : '#fbbf24';
          ctx.textAlign = 'left';
          ctx.fillText(c.name, fx + (isMobile ? 4 : 10), isMobile ? 22 : topY - 18);

          if (!isMobile) {
            ctx.font = '10px "Noto Serif SC", serif';
            ctx.fillStyle = '#aba3b5';
            ctx.fillText(c.sub, fx + 10, topY - 4);
          }

          const midX = fx + colW * 0.5;
          const midY = topY + frameH * 0.5;

          if (c.col === 0) {
            drawSpaceLayer(midX, midY, Math.min(colW, frameH) * 0.28, currentShock);
          } else if (c.col === 1) {
            drawMovementLayer(midX, midY, colW * 0.8, frameH * 0.7);
          } else if (c.col === 2) {
            drawEventLayer(midX, midY, currentShock, isMobile);
          }
        });
      } else {
        // Superimposed Montage Mode - All 3 layers simultaneously superimposed in one collision stage
        const padX = isMobile ? 12 : 32;
        const frameW = w - padX * 2;
        const cx = w * 0.5;
        const cy = topY + frameH * 0.5;

        // Filmstrip outer container
        ctx.fillStyle = '#141217';
        ctx.fillRect(padX, topY, frameW, frameH);
        ctx.strokeStyle = cfg.hueColor;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(padX, topY, frameW, frameH);

        // Sprocket perforations
        const sprockets = isMobile ? 8 : 16;
        for (let s = 0; s < sprockets; s++) {
          const sx = padX + 12 + s * ((frameW - 24) / (sprockets - 1));
          ctx.fillStyle = '#201d25';
          ctx.fillRect(sx - 3, topY + 4, 6, 6);
          ctx.fillRect(sx - 3, topY + frameH - 10, 6, 6);
        }

        // Title and epigraph text with strict vertical line separation to prevent overlap
        ctx.font = isMobile ? '600 11px "Noto Serif SC", serif' : '600 12.5px "Noto Serif SC", serif';
        ctx.fillStyle = cfg.hueColor;
        ctx.textAlign = 'left';
        const titleText = isMobile
          ? '三元共时重叠场 (空间×运动×事件)'
          : '三元共时重叠场 (SUPERIMPOSED COLLISION FIELD) —— 空间 × 运动 × 事件';
        ctx.fillText(titleText, padX + (isMobile ? 4 : 12), isMobile ? 18 : topY - 18);

        ctx.font = isMobile ? '9px "Noto Serif SC", serif' : '10px "Noto Serif SC", serif';
        ctx.fillStyle = '#aba3b5';
        const quoteText = isMobile
          ? (w < 380 ? '“形式因事件的暴力撕裂而展现本真”' : '“空间因运动而具方向，形式因事件撕裂展现本真”')
          : '“空间因运动而具有方向，形式因事件的暴力撕裂而展现本真”';
        ctx.fillText(quoteText, padX + (isMobile ? 4 : 12), isMobile ? 34 : topY - 4);

        // 1. Base architectural space layer
        drawSpaceLayer(cx, cy, Math.min(frameW, frameH) * 0.32, currentShock);

        // 2. Active motion layer (full movement trajectories cutting through the space)
        drawMovementLayer(cx, cy, frameW * 0.55, frameH * 0.75);

        // 3. Shockwave event pulse layer
        drawEventLayer(cx, cy, currentShock, isMobile);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [activeEventType, playbackSpeed, montageMode]);

  const activeCfg = eventConfigs[activeEventType];

  return (
    <div className="flex flex-col h-full bg-[#131216] text-[#eae5df] select-none relative overflow-hidden font-serif-sc">
      {/* Top Editorial Archival Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1d1c1a] border-b border-[#35332f] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div
            className="w-2 h-2 rounded-full animate-pulse shadow-sm shrink-0"
            style={{ backgroundColor: activeCfg.hueColor }}
          />
          <span className="font-serif font-medium tracking-wide text-[#eae5d8] truncate text-xs">
            伯纳德·屈米：曼哈顿转录（空间·运动·事件三联蒙太奇）
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#4a4742] text-[#c8a051] bg-[#262422] shrink-0">
            1981
          </span>
        </div>

        {/* Action Controls & Legend Toggle */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#b3abbc]">
          <button
            onClick={() => setShowLegendModal(prev => !prev)}
            className={`flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 border transition-colors cursor-pointer text-[11px] sm:text-xs ${
              showLegendModal
                ? 'bg-[#c8a051] text-[#141210] border-[#c8a051] font-semibold'
                : 'bg-[#27232e] text-[#c8a051] border-[#443a4e] hover:text-[#f5efe6]'
            }`}
            title="查看色彩谱系与空间含义"
          >
            <HelpCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>释义</span>
          </button>

          <div className="bg-[#24202b] p-0.5 border border-[#3b3445] flex items-center">
            <button
              onClick={() => {
                setMontageMode('triad');
                audioAtmosphere.playChime(360);
              }}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 font-serif text-[11px] sm:text-xs transition-colors cursor-pointer ${
                montageMode === 'triad'
                  ? 'bg-[#eae5dd] text-[#131215] font-semibold'
                  : 'text-[#a39aa9] hover:text-[#eae5dd]'
              }`}
            >
              三轨独立
            </button>
            <button
              onClick={() => {
                setMontageMode('superimposed');
                audioAtmosphere.playChime(460);
              }}
              className={`px-2 sm:px-2.5 py-0.5 sm:py-1 font-serif text-[11px] sm:text-xs transition-colors cursor-pointer ${
                montageMode === 'superimposed'
                  ? 'bg-[#eae5dd] text-[#131215] font-semibold'
                  : 'text-[#a39aa9] hover:text-[#eae5dd]'
              }`}
            >
              重叠场
            </button>
          </div>

          <button
            onClick={() => triggerEvent('normal')}
            className="flex items-center gap-1 text-[#c8a051] hover:text-[#eae5df] transition-colors cursor-pointer border border-[#443a4e] px-2 py-0.5 bg-[#27232e] text-[11px]"
            title="恢复静默几何状态"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">重置</span>
          </button>
        </div>
      </div>

      {/* Dedicated Episode Selector Bar: completely clears canvas view */}
      <div className="px-3 sm:px-6 py-2 bg-[#141218] border-b border-[#2d2737] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <span className="font-mono text-[9.5px] sm:text-[10px] uppercase tracking-wider text-[#a89fad] px-1 py-0.5 shrink-0">
            剧目:
          </span>

          {(
            [
              { id: 'normal', label: '1.静默日常', color: '#c8a051' },
              { id: 'murder', label: '2.凶杀案', color: '#ef4444' },
              { id: 'skate', label: '3.滑板狂欢', color: '#38bdf8' },
              { id: 'riot', label: '4.街头暴动', color: '#f97316' },
              { id: 'fall', label: '5.坠落失重', color: '#ec4899' },
            ] as const
          ).map(ev => {
            const isCurrent = activeEventType === ev.id;
            return (
              <button
                key={ev.id}
                onClick={() => triggerEvent(ev.id)}
                className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-serif transition-all cursor-pointer border flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap rounded ${
                  isCurrent
                    ? 'bg-[#312b3a] border-[#c8a051] text-[#ffffff] font-bold shadow-lg'
                    : 'bg-[#1e1a24] border-[#3d3648] text-[#c5bccd] hover:border-[#867b93] hover:text-[#ffffff]'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                  style={{ backgroundColor: ev.color }}
                />
                <span>{ev.label}</span>
              </button>
            );
          })}
        </div>

        <div className="text-[11px] font-mono text-[#c8a051] shrink-0 hidden md:block">
          EPISODE: {activeCfg.titleEn}
        </div>
      </div>

      {/* Main Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[500px] overflow-hidden select-none bg-[#111013] touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Compact Color Meaning Floating Tooltip */}
        {showLegendModal && (
          <div className="absolute top-12 sm:top-14 left-2.5 sm:left-6 right-2.5 sm:right-auto max-w-sm z-20 pointer-events-auto">
            <div className="bg-[#1a1720]/95 backdrop-blur-md p-3 border border-[#433b4e] shadow-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#352e3e] pb-1">
                <span className="font-mono font-bold text-[#c8a051] text-[11px]">
                  ◈ 色彩谱系与空间释义
                </span>
                <button
                  onClick={() => setShowLegendModal(false)}
                  className="text-[#9e95a7] hover:text-[#ffffff] cursor-pointer text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-start gap-2 pt-0.5">
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: activeCfg.hueColor }}
                />
                <p className="text-[#f1ece3] font-serif text-[11px] leading-relaxed">
                  {activeCfg.colorMeaning}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Standard Archival Epigraph Card with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-4 left-2.5 sm:left-6 right-2.5 sm:right-6 z-30 pointer-events-none">
          <div className="bg-[#1d1c1a]/92 backdrop-blur-md px-3 py-2 sm:p-4 border border-[#383631] shadow-xl max-w-3xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-[#9e978c] font-mono truncate">
                伯纳德·屈米《曼哈顿转录》· 震荡系数: {activeCfg.shockFactor.toFixed(1)}x
              </span>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#c8a051] hover:text-[#eae5d8] cursor-pointer flex items-center gap-1 shrink-0 px-1.5 py-0.5 border border-[#443a4e] bg-[#27232e]"
              >
                <span>{isQuoteExpanded ? '收起' : '展开'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-[#383631] text-center">
                <p className="text-xs font-serif text-[#eae5d8] leading-relaxed italic">
                  “建筑从来不是由墙体与柱子单独构成的。唯有当不可预料的‘事件’与身体激烈的‘运动’撞击冰冷的形式时，真正的建筑学才告诞生。没有无事件的建筑，没有无暴力的形式。”
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
