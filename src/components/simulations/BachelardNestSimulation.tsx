import React, { useEffect, useRef, useState } from 'react';
import {
  Flame,
  Sparkles,
  RotateCcw,
  Compass,
  Archive,
  Eye,
  Info,
  Layers,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface IntimateCabinetSlot {
  id: string;
  slotNumber: string;
  nameZh: string;
  nameFr: string;
  spatialCategory: 'attic' | 'living_drawer' | 'cellar';
  archetype: string; // 空间原型
  psychologicalMeaning: string; // 对人对空间理解的心理学意义
  bachelardInsight: string; // 巴什拉诗学沉思
  relicContent: string; // 抽屉/空间内珍藏
  coordX: number; // 0..1
  coordY: number; // 0..1
}

export const BachelardNestSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active contemplation point
  const [selectedSlotId, setSelectedSlotId] = useState<string>('hearth-warmth');
  const [candlePos, setCandlePos] = useState({ x: 0.50, y: 0.48 });
  const [candleRadius, setCandleRadius] = useState(250);
  const [flameIntensity, setFlameIntensity] = useState(88);
  const [isArchetypeMenuOpen, setIsArchetypeMenuOpen] = useState(false);
  const [isQuoteExpanded, setIsQuoteExpanded] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);

  // 深刻对应《空间的诗学》核心论述的六大空间维度原型（坐标调整向上压缩至画布上半区 0.14 ~ 0.68，保证完全不被底部卡片遮挡）
  const intimateSlots: IntimateCabinetSlot[] = [
    {
      id: 'attic-solitude',
      slotNumber: 'I',
      nameZh: '阁楼 · 白日梦与理性之光',
      nameFr: 'Le Grenier · La Solitude & La Raison',
      spatialCategory: 'attic',
      archetype: '高处的庇护所 (L’Élévation)',
      psychologicalMeaning:
        '人在此将直觉上升为清澈的孤独沉思。斜梁与天窗隔绝了喧嚣尘世，高耸感让心灵安详做梦，是人类意识中理智与超越性的终极象征。',
      bachelardInsight:
        '“在阁楼里，思考上升为理性。屋顶的斜梁将所有散乱的白日梦指向天空的辽阔，家屋在此接纳宇宙的星光。”',
      relicContent: '天窗斜照下的旧望远镜、风动风铃、泛黄诗草稿',
      coordX: 0.50,
      coordY: 0.22,
    },
    {
      id: 'drawer-memory',
      slotNumber: 'II',
      nameZh: '抽屉 · 时间折叠与秘密心灵',
      nameFr: 'Le Tiroir · L’Intimité Cachée',
      spatialCategory: 'living_drawer',
      archetype: '隐秘中心 (L’Armoire & Le Coffre)',
      psychologicalMeaning:
        '在心理学上，储物抽屉是“隐秘灵魂的解剖图”。一个锁着的抽屉守护着完整的潜意识，拉开抽屉不是翻找物品，而是唤醒沉睡的依恋与被折叠的时间。',
      bachelardInsight:
        '“抽屉、箱匣与衣柜不是冷冰冰的几何储物箱，它们是封存秘密的微型宇宙。在抽屉深处，躺着一个不可告人的内心世界。”',
      relicContent: '一把雕花铜钥匙、火漆封缄的昔日信笺、干燥薰衣草',
      coordX: 0.25,
      coordY: 0.46,
    },
    {
      id: 'corner-sanctuary',
      slotNumber: 'III',
      nameZh: '角落 · 存在的安歇避难所',
      nameFr: 'Le Coin · Le Refuge de l’Être',
      spatialCategory: 'living_drawer',
      archetype: '极小存在的拥抱 (Le Nid & Le Coin)',
      psychologicalMeaning:
        '人为何本能地在角落里感到安心？因为角落两面紧闭的墙壁挡住了背后的未知，人类在此如雏鸟回归鸟巢（Nest），将无限浩瀚的宇宙收缩为温暖的安全感。',
      bachelardInsight:
        '“每一个角落都是孤独思想者的静默神龛。当你蜷缩在角落里，你便向世界声明：我在此处，完全被我自己所拥有。”',
      relicContent: '毛毡旧抱枕、阅读静息的残蜡、半卷沉思录',
      coordX: 0.75,
      coordY: 0.46,
    },
    {
      id: 'hearth-warmth',
      slotNumber: 'IV',
      nameZh: '壁炉 · 生命力与亲密核心',
      nameFr: 'Le Foyer · La Flamme Vivante',
      spatialCategory: 'living_drawer',
      archetype: '温暖之源 (Le Feu Bienveillant)',
      psychologicalMeaning:
        '空间因温度而获得生命。火焰提供的不只是物理热量，而是空间的人格化凝聚力。围炉而坐时，散乱的个人意识在此融聚为家庭与归宿感。',
      bachelardInsight:
        '“一盏微弱的烛火、一簇壁炉的余烬，便能击退整座冬夜森林的严寒。人是对火沉思的生物，火给予了空间灵魂。”',
      relicContent: '红橡木柴堆、铜拨火棍、红茶陶杯',
      coordX: 0.50,
      coordY: 0.48,
    },
    {
      id: 'cellar-abyss',
      slotNumber: 'V',
      nameZh: '地窖 · 潜意识深渊与大地之根',
      nameFr: 'La Cave · L’Inconscient & L’Ombre',
      spatialCategory: 'cellar',
      archetype: '幽暗深渊 (Les Racines de la Terre)',
      psychologicalMeaning:
        '家屋的垂直性对抗：如果阁楼代表清醒理智，地窖则是沉睡本能与原始恐惧的埋藏所。它扎根于大地深处，守护不可言说的人类心理暗夜。',
      bachelardInsight:
        '“在地下室里，家屋深深抓握着大地的黑夜。任何人迈向地窖深处，脚步都会自然放缓，如同探访未曾照亮的梦魇与本真。”',
      relicContent: '古老青石瓮、湿润苔藓岩壁、封存旧年葡萄酒',
      coordX: 0.32,
      coordY: 0.70,
    },
    {
      id: 'threshold-secret',
      slotNumber: 'VI',
      nameZh: '暗锁密匣 · 不可侵犯的纯粹私域',
      nameFr: 'Le Secret · Le Coffre Sacré',
      spatialCategory: 'cellar',
      archetype: '秘密守护 (L’Espace Interdit)',
      psychologicalMeaning:
        '空间需要边界感才能建立神圣性。带有精巧机械暗锁的匣子，是主体在面对外部社会规训时，为自己保留的最后一寸绝对自由领地。',
      bachelardInsight:
        '“一个不需要钥匙就能轻易看穿的房子是贫瘠的。真正的空间诗学，永远需要一个上锁的暗格来维系想象力的尊严。”',
      relicContent: '黄铜密码滚轮箱、童年海滩贝壳、遗失日记本',
      coordX: 0.68,
      coordY: 0.70,
    },
  ];

  const activeSlot = intimateSlots.find(s => s.id === selectedSlotId) || intimateSlots[1];

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

    // Warm floating embers and daydream dust particles
    const motes = Array.from({ length: 45 }, () => ({
      x: Math.random() * (containerRef.current?.clientWidth || 800),
      y: Math.random() * (containerRef.current?.clientHeight || 500),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.3 - 0.05,
      radius: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.5 + 0.3,
    }));

    const render = () => {
      time += 0.03;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 500;
      ctx.clearRect(0, 0, w, h);

      const cx = candlePos.x * w;
      const cy = candlePos.y * h;

      // 1. Vertical Architectural Gradient (Attic warmth -> Living intimacy -> Cellar profound darkness)
      const vertGrad = ctx.createLinearGradient(0, 0, 0, h);
      vertGrad.addColorStop(0, '#1c1813'); // Attic warm timber
      vertGrad.addColorStop(0.28, '#181511'); // Living threshold
      vertGrad.addColorStop(0.58, '#13110e'); // Hearth level
      vertGrad.addColorStop(0.85, '#090807'); // Cellar stone roots
      vertGrad.addColorStop(1, '#060505');
      ctx.fillStyle = vertGrad;
      ctx.fillRect(0, 0, w, h);

      // 2. Blueprint Architectural Grid of the House Framework (upper section)
      ctx.strokeStyle = 'rgba(214, 180, 120, 0.08)';
      ctx.lineWidth = 1;
      // Roof Triangle (Symmetric centered on 0.50 axis)
      ctx.beginPath();
      ctx.moveTo(w * 0.12, h * 0.28);
      ctx.lineTo(w * 0.50, h * 0.05);
      ctx.lineTo(w * 0.88, h * 0.28);
      ctx.stroke();

      // Floor dividing beams (Symmetric centered on 0.50 axis)
      const floor1 = h * 0.36;
      const floor2 = h * 0.60;
      const floor3 = h * 0.81;
      ctx.strokeStyle = 'rgba(214, 180, 120, 0.18)';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(w * 0.08, floor1);
      ctx.lineTo(w * 0.92, floor1);
      ctx.moveTo(w * 0.08, floor2);
      ctx.lineTo(w * 0.92, floor2);
      ctx.moveTo(w * 0.08, floor3);
      ctx.lineTo(w * 0.92, floor3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Section Watermarks (High readability contrast, safely aligned with floor line)
      const isMobile = w < 640;
      ctx.font = '600 11px "Noto Serif SC", serif';
      ctx.fillStyle = 'rgba(200, 165, 110, 0.45)';
      ctx.textAlign = 'left';
      if (isMobile) {
        ctx.fillText('Ⅰ · 阁楼层位 (LE GRENIER) · 天空白日梦', w * 0.09, h * 0.14);
        ctx.fillText('Ⅱ · 起居抽屉 (L’INTIMITÉ) · 亲密栖居', w * 0.09, h * 0.40);
        ctx.fillText('Ⅲ · 地窖层位 (LA CAVE) · 潜意识深潜', w * 0.09, h * 0.64);
      } else {
        ctx.fillText('Ⅰ · 阁楼层位 (LE GRENIER) —— 理性之光与天空白日梦', w * 0.09, h * 0.14);
        ctx.fillText('Ⅱ · 起居抽屉 (L’INTIMITÉ) —— 抽屉、壁炉、角落与记忆封存', w * 0.09, h * 0.40);
        ctx.fillText('Ⅲ · 地窖层位 (LA CAVE) —— 大地之根、原始恐惧与潜意识深潜', w * 0.09, h * 0.64);
      }

      // 3. Volumetric Candle Illumination
      const flicker = Math.sin(time * 6) * 3 + Math.sin(time * 11) * 1.5;
      const effR = (candleRadius + flicker * 2) * (flameIntensity / 100);

      const lightGrad = ctx.createRadialGradient(cx, cy, 6, cx, cy, effR * 1.35);
      lightGrad.addColorStop(0, 'rgba(255, 246, 220, 0.35)');
      lightGrad.addColorStop(0.25, 'rgba(245, 158, 11, 0.18)');
      lightGrad.addColorStop(0.55, 'rgba(180, 83, 9, 0.06)');
      lightGrad.addColorStop(0.85, 'rgba(100, 40, 5, 0.015)');
      lightGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lightGrad;
      ctx.fillRect(0, 0, w, h);

      // 4. Render Spatial Archetype Relics & Intimate Nodes
      intimateSlots.forEach(slot => {
        const sx = slot.coordX * w;
        const sy = slot.coordY * h;
        const isSelected = slot.id === selectedSlotId;
        const dist = Math.hypot(sx - cx, sy - cy);
        const illum = Math.max(0, 1 - dist / effR);

        // Halo circle
        const baseRadius = isSelected ? (isMobile ? 20 : 24) : (isMobile ? 15 : 18);
        ctx.beginPath();
        ctx.arc(sx, sy, baseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = isSelected
          ? '#e0b868'
          : `rgba(200, 160, 81, ${Math.max(0.3, illum * 0.85)})`;
        ctx.lineWidth = isSelected ? 2 : 1.2;
        if (isSelected) {
          ctx.fillStyle = 'rgba(45, 36, 26, 0.85)';
          ctx.fill();
        }
        ctx.stroke();

        // Node center marker
        ctx.beginPath();
        ctx.arc(sx, sy, isSelected ? 5 : 3.5, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? '#ffffff' : `rgba(240, 215, 170, ${Math.max(0.45, illum)})`;
        ctx.fill();

        // High contrast readable title
        ctx.font = isSelected ? '600 12px "Noto Serif SC", serif' : '500 11px "Noto Serif SC", serif';
        ctx.fillStyle = isSelected ? '#ffffff' : `rgba(235, 225, 210, ${Math.max(0.7, illum * 0.95)})`;
        ctx.textAlign = 'center';
        const displayName = isMobile ? slot.nameZh.split('·')[0].trim() : slot.nameZh;
        ctx.fillText(displayName, sx, sy - baseRadius - 6);

        // Archetype Subtitle
        if (!isMobile || isSelected) {
          ctx.font = '10px "Noto Serif SC", serif';
          ctx.fillStyle = isSelected ? '#e0b868' : `rgba(200, 160, 81, ${Math.max(0.45, illum * 0.8)})`;
          ctx.fillText(slot.archetype, sx, sy + baseRadius + 13);
        }
      });

      // 5. Floating Dust Motes in Candlelight
      motes.forEach(m => {
        m.x += m.vx;
        m.y += m.vy;
        if (m.x < 0) m.x = w;
        if (m.x > w) m.x = 0;
        if (m.y < 0) m.y = h;
        if (m.y > h) m.y = 0;

        const dist = Math.hypot(m.x - cx, m.y - cy);
        const illum = Math.max(0, 1 - dist / effR);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * (1 + illum * 0.7), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${Math.min(0.85, m.alpha * 0.4 + illum * 0.75)})`;
        ctx.fill();
      });

      // 6. Draw Candle Stick & Living Teardrop Flame
      const waxW = 12;
      const waxH = 32;
      const waxGrad = ctx.createLinearGradient(cx - waxW / 2, cy, cx + waxW / 2, cy);
      waxGrad.addColorStop(0, '#dad2c2');
      waxGrad.addColorStop(0.5, '#fbf9f4');
      waxGrad.addColorStop(1, '#b5a791');
      ctx.fillStyle = waxGrad;
      ctx.fillRect(cx - waxW / 2, cy + 4, waxW, waxH);

      // Brass Holder Dish
      ctx.beginPath();
      ctx.ellipse(cx, cy + waxH + 4, 18, 5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#876020';
      ctx.fill();
      ctx.strokeStyle = '#d4a853';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Wick
      ctx.strokeStyle = '#2b1f14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 4);
      ctx.lineTo(cx + flicker * 0.2, cy - 5);
      ctx.stroke();

      // Living Flame Teardrop
      const flameH = 20 + flicker * 1.5;
      const flameW = 8 + flicker * 0.5;

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy - 4);
      ctx.bezierCurveTo(
        cx - flameW,
        cy - flameH * 0.4,
        cx - flameW * 0.6,
        cy - flameH,
        cx,
        cy - flameH * 1.35
      );
      ctx.bezierCurveTo(
        cx + flameW * 0.6,
        cy - flameH,
        cx + flameW,
        cy - flameH * 0.4,
        cx,
        cy - 4
      );
      ctx.closePath();

      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#fbbf24';
      ctx.shadowBlur = 24;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Inner White Core
      ctx.beginPath();
      ctx.moveTo(cx, cy - 3);
      ctx.bezierCurveTo(
        cx - flameW * 0.45,
        cy - flameH * 0.35,
        cx - flameW * 0.25,
        cy - flameH * 0.75,
        cx,
        cy - flameH * 0.95
      );
      ctx.bezierCurveTo(
        cx + flameW * 0.25,
        cy - flameH * 0.75,
        cx + flameW * 0.45,
        cy - flameH * 0.35,
        cx,
        cy - 3
      );
      ctx.closePath();
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [candlePos, candleRadius, flameIntensity, selectedSlotId]);

  // Click or drag candle anywhere in stage
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    updateCandleCoord(e.clientX, e.clientY);
    audioAtmosphere.playChime(360);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.buttons > 0) {
      updateCandleCoord(e.clientX, e.clientY);
    }
  };

  const updateCandleCoord = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = Math.max(0.1, Math.min(0.9, (clientX - rect.left) / rect.width));
    const ny = Math.max(0.08, Math.min(0.72, (clientY - rect.top) / rect.height)); // keep candle above bottom card
    setCandlePos({ x: nx, y: ny });

    // Auto snap selection if near a node
    intimateSlots.forEach(slot => {
      const dist = Math.hypot(slot.coordX - nx, slot.coordY - ny);
      if (dist < 0.16 && selectedSlotId !== slot.id) {
        setSelectedSlotId(slot.id);
      }
    });
  };

  const selectSpecificSlot = (slot: IntimateCabinetSlot) => {
    setSelectedSlotId(slot.id);
    setCandlePos({ x: slot.coordX, y: slot.coordY });
    audioAtmosphere.playChime(420);
  };

  return (
    <div className="flex flex-col h-full bg-[#141210] text-[#f4eee5] select-none relative overflow-hidden font-serif-sc">
      {/* Top Editorial Archival Bar */}
      <div className="px-3 sm:px-6 py-2.5 sm:py-3.5 bg-[#1d1c1a] border-b border-[#35332f] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 text-xs z-30">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-[#c8a051] animate-pulse shrink-0" />
          <span className="font-serif font-medium tracking-wide text-[#eae5d8] truncate text-xs">
            加斯东·巴什拉：家屋垂直性与亲密内省场
          </span>
          <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#4a4742] text-[#c8a051] bg-[#262422] shrink-0">
            1957
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs text-[#b8afa3]">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Flame className="w-3.5 h-3.5 text-[#c8a051]" />
            <span className="font-serif text-[#d8cfc4] text-[11px] sm:text-xs">烛光:</span>
            <input
              type="range"
              min="160"
              max="340"
              value={candleRadius}
              onChange={e => setCandleRadius(Number(e.target.value))}
              className="w-16 sm:w-20 accent-[#c8a051] cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setCandlePos({ x: 0.50, y: 0.48 });
              setSelectedSlotId('hearth-warmth');
              audioAtmosphere.playChime(320);
            }}
            className="flex items-center gap-1 text-[#c8a051] hover:text-[#f4eee5] transition-colors cursor-pointer border border-[#443a2f] px-2 py-1 bg-[#241f1a]"
            title="复位烛光至正中心"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">居中</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage with Grid Selection Overlay */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="relative flex-1 w-full min-h-[440px] sm:min-h-[500px] overflow-hidden select-none cursor-crosshair bg-[#12100e] touch-none"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Mobile Trigger Button for Archetypes Menu (Never blocks canvas!) */}
        <button
          onClick={() => setIsArchetypeMenuOpen(prev => !prev)}
          className="md:hidden absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-[#1a1714]/95 border border-[#c8a051] px-2.5 py-1 text-xs text-[#c8a051] shadow-lg backdrop-blur-md cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>原型: {activeSlot.nameZh.split(' · ')[0]}</span>
          {isArchetypeMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {/* Mobile Modal Drawer for Archetypes */}
        {isArchetypeMenuOpen && (
          <div
            onClick={() => setIsArchetypeMenuOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <div
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs bg-[#1a1714] border border-[#c8a051]/60 p-4 shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#3d3428]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#c8a051]" />
                  <span className="font-mono text-xs text-[#d4af37] font-semibold">空间原型凝视</span>
                </div>
                <button
                  onClick={() => setIsArchetypeMenuOpen(false)}
                  className="text-[#9e9587] hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {intimateSlots.map(slot => {
                  const isCurrent = slot.id === activeSlot.id;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => {
                        selectSpecificSlot(slot);
                        setIsArchetypeMenuOpen(false);
                      }}
                      className={`px-3 py-2 text-left text-xs border flex items-center justify-between transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-[#c8a051] text-[#141210] border-[#c8a051] font-semibold'
                          : 'bg-[#241f1a]/80 text-[#c8beaf] border-[#382f24] hover:bg-[#2e2721]'
                      }`}
                    >
                      <span className="font-serif">{slot.nameZh.split(' · ')[0]}</span>
                      <span className="font-mono text-[9px] px-1 py-0.5 border border-[#4a3e30]">{slot.slotNumber}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Desktop Vertical Space Selector Sidebar */}
        <aside aria-label="空间原型选择" className="hidden md:flex absolute top-6 right-5 z-20 pointer-events-auto flex-col gap-1.5 bg-[#1a1714]/92 p-2.5 border border-[#3d3428] backdrop-blur-md shadow-2xl max-w-[175px]">
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#3d3428]/80">
            <Sparkles className="w-3.5 h-3.5 text-[#c8a051]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold">
              空间原型凝视
            </span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            {intimateSlots.map(slot => {
              const isCurrent = slot.id === activeSlot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => selectSpecificSlot(slot)}
                  className={`px-2.5 py-1.5 text-left transition-all cursor-pointer border flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-[#c8a051] text-[#141210] border-[#c8a051] font-semibold shadow-md'
                      : 'bg-[#241f1a]/70 text-[#c8beaf] border-[#382f24] hover:border-[#867557] hover:text-[#ffffff] hover:bg-[#2e2721]'
                  }`}
                >
                  <span className="text-xs font-serif leading-tight">
                    {slot.nameZh.split(' · ')[0]}
                  </span>
                  <span
                    className={`font-mono text-[9px] px-1 py-0.2 border ${
                      isCurrent
                        ? 'border-[#141210]/40 text-[#141210] bg-[#e0b868]'
                        : 'border-[#4a3e30] text-[#a89d8d] bg-[#1a1612]'
                    }`}
                  >
                    {slot.slotNumber}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-1 pt-1.5 border-t border-[#3d3428]/60 text-[10px] text-[#9e9587] font-serif leading-tight">
            拖拽烛光或点击原型，照亮隐秘内省场
          </div>
        </aside>

        {/* Standard Archival Epigraph Card with Mobile Collapse/Expand */}
        <div className="absolute bottom-2 sm:bottom-4 left-3 sm:left-6 right-3 sm:right-6 z-30 pointer-events-none">
          <div className="bg-[#1d1c1a]/95 backdrop-blur-md px-3 py-2 sm:p-3.5 border border-[#383631] shadow-xl max-w-3xl mx-auto pointer-events-auto">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] text-[#9e978c] truncate">
                <span className="text-[#c8a051] font-semibold">{activeSlot.nameZh.split(' · ')[0]}</span>
                <span className="hidden sm:inline">• 加斯东·巴什拉《空间的诗学》· 1957</span>
              </div>
              <button
                onClick={() => setIsQuoteExpanded(v => !v)}
                className="text-[10px] font-mono text-[#c8a051] hover:text-[#eae5d8] cursor-pointer flex items-center gap-1 shrink-0 px-2 py-0.5 border border-[#383631]"
              >
                <span>{isQuoteExpanded ? '收起铭文' : '展开铭文'}</span>
                {isQuoteExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>
            {isQuoteExpanded && (
              <div className="mt-2 pt-2 border-t border-[#383631]/70 text-center">
                <p className="text-xs font-serif text-[#eae5d8] leading-relaxed italic">
                  {activeSlot.bachelardInsight}
                </p>
                <div className="mt-1 text-[10px] text-[#c8a051] font-mono">
                  {activeSlot.archetype}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
