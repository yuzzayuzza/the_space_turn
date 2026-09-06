import React, { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Radio,
  Server,
  Zap,
  RotateCcw,
  Sparkles,
  Sliders,
  Layers,
  Cpu,
} from 'lucide-react';
import { audioAtmosphere } from '../../utils/audioAtmosphere';

interface CyberNode {
  id: number;
  name: string;
  category: 'financial_hub' | 'server_farm' | 'satellite_relay';
  x: number;
  y: number; // in cyber layer (upper)
  physicalX: number;
  physicalY: number; // in physical layer (lower)
  trafficRate: number;
}

export const CastellsFlowsSimulation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Flow Dominance Slider: 0 = Traditional Places dominate (深厚泥土、地方社区)
  // -> 100 = Flows completely colonize and bypass Places (流动空间主导，光纤资本脱离大地)
  const [flowDominance, setFlowDominance] = useState<number>(80);

  // Selected active cyber stream
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);

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

    // Global Cyber-Nodes connecting the Space of Flows
    const cyberNodes: CyberNode[] = [
      { id: 1, name: '纽约华尔街高频算法节点', category: 'financial_hub', x: 0.18, y: 0.22, physicalX: 0.18, physicalY: 0.78, trafficRate: 98 },
      { id: 2, name: '伦敦金融城跨洋海缆登陆点', category: 'financial_hub', x: 0.42, y: 0.16, physicalX: 0.42, physicalY: 0.80, trafficRate: 92 },
      { id: 3, name: '东京高速交易主机集群', category: 'financial_hub', x: 0.82, y: 0.20, physicalX: 0.82, physicalY: 0.82, trafficRate: 88 },
      { id: 4, name: '北欧极地巨型服务器农场', category: 'server_farm', x: 0.62, y: 0.12, physicalX: 0.62, physicalY: 0.74, trafficRate: 75 },
      { id: 5, name: '低轨近地量子中继卫星群', category: 'satellite_relay', x: 0.50, y: 0.05, physicalX: 0.50, physicalY: 0.72, trafficRate: 99 },
    ];

    // Inter-hub fiber connection links
    const cyberLinks = [
      [0, 1],
      [1, 2],
      [1, 3],
      [0, 4],
      [2, 4],
      [3, 4],
      [0, 3],
    ];

    // Data packet particles moving along cyber links
    const packets = Array.from({ length: 28 }, (_, i) => ({
      linkIndex: i % cyberLinks.length,
      progress: Math.random(),
      speed: 0.006 + Math.random() * 0.008,
      size: 2 + Math.random() * 2,
    }));

    const render = () => {
      time += 0.02;
      const w = containerRef.current?.clientWidth || 800;
      const h = containerRef.current?.clientHeight || 520;
      ctx.clearRect(0, 0, w, h);

      const splitY = h * 0.52; // Division line between Flows (top) and Places (bottom)
      const tFlow = flowDominance / 100;

      // 1. Dual Canvas Backgrounds
      // Upper Half: Cyberspace Void (Dark deep tech navy/cyan)
      const upperGrad = ctx.createLinearGradient(0, 0, 0, splitY);
      upperGrad.addColorStop(0, '#040d1a');
      upperGrad.addColorStop(1, '#091829');
      ctx.fillStyle = upperGrad;
      ctx.fillRect(0, 0, w, splitY);

      // Lower Half: Physical Ground / Place (Warm shadowy brick brown/charcoal)
      const lowerGrad = ctx.createLinearGradient(0, splitY, 0, h);
      lowerGrad.addColorStop(0, '#151311');
      lowerGrad.addColorStop(1, '#0c0a08');
      ctx.fillStyle = lowerGrad;
      ctx.fillRect(0, splitY, w, h - splitY);

      // 2. Horizon Division Line (The Rupture between Flow and Place)
      ctx.beginPath();
      ctx.moveTo(0, splitY);
      ctx.lineTo(w, splitY);
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + tFlow * 0.4})`;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8 * tFlow;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Section Labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText('▲ 流动空间 [THE SPACE OF FLOWS] · 光纤信号与瞬时无时间资本', 16, 24);

      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#a8a29e';
      ctx.fillText('▼ 场所空间 [THE SPACE OF PLACES] · 具身肉身与地方历史街区', 16, splitY + 24);

      // 3. Lower Physical Ground Silhouette (The Place Layer)
      // Draw quiet city silhouettes, chimneys, old apartments
      ctx.fillStyle = `rgba(40, 36, 32, ${0.8 - tFlow * 0.35})`;
      for (let x = 0; x < w; x += 32) {
        const bldH = 40 + Math.sin(x * 0.05) * 25 + (x % 5) * 8;
        ctx.fillRect(x, h - bldH, 28, bldH);

        // Warm cozy windows of everyday living
        if (Math.sin(x + time * 0.1) > 0) {
          ctx.fillStyle = `rgba(251, 191, 36, ${0.4 * (1 - tFlow * 0.6)})`;
          ctx.fillRect(x + 6, h - bldH + 12, 5, 8);
          ctx.fillStyle = `rgba(40, 36, 32, ${0.8 - tFlow * 0.35})`;
        }
      }

      // 4. Vertical "Disembodiment" Tether Beams (Data sucking up from Places to Flows)
      cyberNodes.forEach(node => {
        const cx = node.x * w;
        const cy = node.y * splitY * 0.8 + 30;
        const px = node.physicalX * w;
        const py = node.physicalY * h;

        // Upward data extraction light stream
        ctx.beginPath();
        ctx.setLineDash([4, 6]);
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.15 + tFlow * 0.25})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // 5. Upper Cyber Layer: Render High-Speed Fiber Topology
      cyberLinks.forEach(([idxA, idxB]) => {
        const a = cyberNodes[idxA];
        const b = cyberNodes[idxB];
        const ax = a.x * w;
        const ay = a.y * splitY * 0.8 + 30;
        const bx = b.x * w;
        const by = b.y * splitY * 0.8 + 30;

        // Base Cable
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.strokeStyle = `rgba(14, 165, 233, ${0.25 + tFlow * 0.45})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 6. Data Packets flying across Links at speed proportional to flowDominance
      packets.forEach(pkt => {
        const link = cyberLinks[pkt.linkIndex];
        const a = cyberNodes[link[0]];
        const b = cyberNodes[link[1]];

        pkt.progress = (pkt.progress + pkt.speed * (0.5 + tFlow * 1.5)) % 1;
        const ax = a.x * w;
        const ay = a.y * splitY * 0.8 + 30;
        const bx = b.x * w;
        const by = b.y * splitY * 0.8 + 30;

        const curX = ax + (bx - ax) * pkt.progress;
        const curY = ay + (by - ay) * pkt.progress;

        ctx.beginPath();
        ctx.arc(curX, curY, pkt.size, 0, Math.PI * 2);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 7. Cyber Hub Nodes
      cyberNodes.forEach(node => {
        const cx = node.x * w;
        const cy = node.y * splitY * 0.8 + 30;

        // Radiant pulsation ring
        const ringR = 14 + Math.sin(time * 4 + node.id) * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = '10.5px "Noto Serif SC", serif';
        ctx.fillStyle = '#e0f2fe';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, cx, cy - ringR - 6);

        ctx.font = '8.5px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`BANDWIDTH: ${node.trafficRate} GB/S · ZERO-TIME`, cx, cy + ringR + 14);
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [flowDominance]);

  return (
    <div className="flex flex-col h-full bg-[#080d14] text-[#f1f5f9] select-none relative overflow-hidden font-serif-sc">
      {/* Top Editorial Archival Bar */}
      <div className="px-6 py-3.5 bg-[#0f172a] border-b border-[#1e293b] flex flex-wrap items-center justify-between gap-3 text-xs z-30">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
          <span className="font-serif font-medium tracking-wide text-[#f8fafc]">
            曼纽尔·卡斯特尔：流动空间 vs 场所空间 (The Space of Flows)
          </span>
          <span className="font-mono text-[10px] tracking-widest uppercase px-2 py-0.5 border border-[#0284c7] text-[#38bdf8] bg-[#0c4a6e]">
            THE NETWORK SOCIETY · 1996
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 text-xs text-[#cbd5e1]">
          {/* Flow Dominance Slider */}
          <div className="flex items-center gap-2">
            <span className="font-serif text-[#94a3b8]">网络流动主导率:</span>
            <input
              type="range"
              min="10"
              max="100"
              value={flowDominance}
              onChange={e => setFlowDominance(Number(e.target.value))}
              className="w-24 accent-[#38bdf8] cursor-pointer"
              title="调节数字化光纤网络脱离大地、主导物理场所的程度"
            />
            <span className="font-mono text-[10px] text-[#38bdf8] w-6">{flowDominance}%</span>
          </div>

          <button
            onClick={() => {
              setFlowDominance(80);
              audioAtmosphere.playChime(380);
            }}
            className="flex items-center gap-1.5 text-[#38bdf8] hover:text-[#f8fafc] transition-colors cursor-pointer border border-[#0369a1] px-2.5 py-1 bg-[#0c4a6e]"
            title="复位网络状态"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="font-mono text-[10px] uppercase">重置拓扑</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        className="relative flex-1 w-full min-h-[500px] overflow-hidden select-none cursor-crosshair bg-[#040810]"
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-10" />

        {/* Top Left Diagnostic Readout */}
        <div className="absolute top-4 left-6 z-20 flex items-center gap-3 pointer-events-none">
          <div className="bg-[#0f172a]/90 backdrop-blur-md px-4 py-2 border border-[#1e3a8a] shadow-lg flex items-center gap-3">
            <Radio className="w-4 h-4 text-[#38bdf8]" />
            <div className="font-mono text-[11px] space-x-2">
              <span className="text-[#94a3b8]">SPATIAL REGIME:</span>
              <span className="text-[#38bdf8] font-bold">
                {flowDominance > 75 ? '流动空间彻底统治大地 (Flows Domination)' : '场所与网络拉锯平衡 (Interconnected)'}
              </span>
              <span className="text-[#334155]">|</span>
              <span className="text-[#94a3b8]">TEMPORALITY:</span>
              <span className="text-[#f1f5f9]">无时间的时间 (Timeless Time)</span>
            </div>
          </div>
        </div>

        {/* Right Explanatory Architectural Sidebar */}
        <aside
          aria-label="流动空间与场所空间解析"
          className="absolute top-6 right-5 z-20 pointer-events-auto flex flex-col gap-2.5 bg-[#0b1322]/92 p-3.5 border border-[#1e3250] backdrop-blur-md shadow-2xl max-w-[215px]"
        >
          <div className="flex items-center gap-1.5 pb-2 border-b border-[#1e3250]">
            <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#38bdf8] font-semibold">
              卡斯特尔双层拓扑
            </span>
          </div>

          <div className="space-y-2 text-[10.5px] font-serif leading-relaxed text-[#cbd5e1]">
            <p>
              <strong className="text-[#38bdf8]">流动空间 (Flows)</strong>：由通信网络、超级电脑节点、资本流构成的物质组织形式，在空间上断裂却在功能上无缝连接。
            </p>
            <p>
              <strong className="text-[#fbbf24]">场所空间 (Places)</strong>：人们真实生活、生老病死的地理社区。在全球化网络下，场所正面临被资本旁路、边缘化的危险。
            </p>
          </div>

          <div className="pt-2 border-t border-[#1e3250] text-[9.5px] text-[#94a3b8] font-serif leading-tight">
            拖动“流动主导率”滑块：观察上层数字光纤如何将权力抽离出下层物理聚落。
          </div>
        </aside>

        {/* Bottom Epigraph Card */}
        <div className="absolute bottom-3 left-6 right-6 z-30 pointer-events-none">
          <div className="bg-[#0f172a]/92 backdrop-blur-md px-5 py-3 border border-[#1e293b] shadow-xl max-w-2xl mx-auto text-center pointer-events-auto">
            <p className="text-xs font-serif text-[#f1f5f9] leading-relaxed italic">
              “流动空间并没有消灭地点，但它彻底打乱了地方的逻辑。主导性的权力过程组织在流动空间中，而绝大多数人的生活与经验依然锚定在场所空间里。”
            </p>
            <div className="mt-1 flex items-center justify-center gap-3 font-mono text-[10px] text-[#94a3b8]">
              <span>曼纽尔·卡斯特尔《网络社会的崛起》· 1996</span>
              <span>•</span>
              <span className="text-[#38bdf8]">网络社会与流动空间</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
