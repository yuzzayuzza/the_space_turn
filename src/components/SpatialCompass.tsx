import React, { useState } from 'react';
import { Thinker } from '../types';
import { Compass, Sparkles, ArrowRight } from 'lucide-react';
import { audioAtmosphere } from '../utils/audioAtmosphere';

interface SpatialCompassProps {
  thinkers: Thinker[];
  activeThinkerId: string;
  onSelectThinker: (id: string) => void;
}

export const SpatialCompass: React.FC<SpatialCompassProps> = ({
  thinkers,
  activeThinkerId,
  onSelectThinker,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const activeThinker = thinkers.find(t => t.id === (hoveredId || activeThinkerId)) || thinkers[0];

  return (
    <div className="bg-[#fdfcf8] border border-[#121212] p-8 shadow-sm text-[#121212]">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#121212]">
        <div>
          <div className="flex items-center gap-2 text-[#121212]/60 text-xs font-mono tracking-widest uppercase mb-1">
            <Compass className="w-4 h-4 text-[#121212]" />
            <span>PHILOSOPHICAL SPATIAL MATRIX / CARTOGRAPHY</span>
          </div>
          <h2 className="text-2xl font-serif font-light tracking-tight text-[#121212]">
            空间思想罗盘与坐标系
          </h2>
        </div>
        <p className="text-xs text-[#121212]/70 font-serif max-w-md leading-relaxed">
          将十位空间思想家投射于“主观感知 ↔ 客观几何”与“本体栖居 ↔ 社会生产”的张力象限之中。轻触节点可快速切换核心思想与动态诠释。
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* The 2D Quadrant Canvas Container */}
        <div className="lg:col-span-8 relative w-full aspect-square max-w-[520px] mx-auto bg-[#f7f5ee] border border-[#121212] p-8 select-none shadow-inner">
          {/* Editorial Hairline Grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#12121210_1px,transparent_1px),linear-gradient(to_bottom,#12121210_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          {/* Crosshair Axes */}
          <div className="absolute left-6 right-6 top-1/2 h-[1px] bg-[#121212] -translate-y-1/2" />
          <div className="absolute top-6 bottom-6 left-1/2 w-[1px] bg-[#121212] -translate-x-1/2" />

          {/* Quadrant Axis Labels in Editorial Type */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-[#121212] bg-[#fdfcf8] px-2.5 py-1 border border-[#121212]">
            社会政治与生产 [SOCIAL / POWER]
          </div>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-[#121212] bg-[#fdfcf8] px-2.5 py-1 border border-[#121212]">
            存在本体与栖居 [ONTOLOGY / DWELLING]
          </div>
          <div className="absolute left-3 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-mono uppercase tracking-widest text-[#121212] bg-[#fdfcf8] px-2 py-1 border border-[#121212]">
            主观经验与知觉
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-[10px] font-mono uppercase tracking-widest text-[#121212] bg-[#fdfcf8] px-2 py-1 border border-[#121212]">
            客观几何与规训
          </div>

          {/* Thinker Nodes Placed in Quadrant */}
          {thinkers.map(t => {
            const posX = 50 + (t.coordinates.subjectiveVsObjective / 100) * 40;
            const posY = 50 - (t.coordinates.ontologicalVsSocial / 100) * 40;

            const isSelected = t.id === activeThinkerId;
            const isHovered = t.id === hoveredId;

            return (
              <div
                key={t.id}
                onMouseEnter={() => setHoveredId(t.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => {
                  onSelectThinker(t.id);
                  audioAtmosphere.playChime(360);
                }}
                style={{
                  left: `${posX}%`,
                  top: `${posY}%`,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 z-20 ${
                  isSelected || isHovered ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-serif font-bold shadow-sm transition-colors ${
                    isSelected || isHovered
                      ? 'bg-[#121212] text-[#fdfcf8] border-[#121212]'
                      : 'bg-[#fdfcf8] text-[#121212] border-[#121212]'
                  }`}
                >
                  {t.name.slice(0, 1)}
                </div>

                <span
                  className={`block text-[10px] whitespace-nowrap mt-1 font-serif text-center px-1 border transition-colors ${
                    isSelected
                      ? 'bg-[#121212] text-[#fdfcf8] font-bold border-[#121212]'
                      : 'text-[#121212] bg-[#fdfcf8] border-[#121212]/40'
                  }`}
                >
                  {t.name.split('·').pop() || t.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right Details Panel for Selected / Hovered Thinker */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-[#f7f5ee] border border-[#121212] p-7">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#121212]/30 mb-3">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#121212]/70">
                {activeThinker.paradigmName}
              </span>
              <span className="text-xs font-serif italic text-[#121212]/70">
                {activeThinker.years}
              </span>
            </div>

            <h3 className="text-2xl font-serif font-light text-[#121212] mb-1">
              {activeThinker.name}
            </h3>
            <p className="text-xs font-serif italic text-[#121212]/70 mb-4">
              {activeThinker.nameEn}
            </p>

            <div className="text-xs font-serif text-[#121212] mb-5 p-4 bg-[#fdfcf8] border border-[#121212]/30 italic leading-relaxed">
              “{activeThinker.quoteZh}”
            </div>

            <div className="mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#121212]/60 block mb-1">
                CLASSIC WORK & CONCEPT
              </span>
              <p className="text-xs font-serif text-[#121212] font-semibold mb-0.5">
                {activeThinker.classicWork}
              </p>
              <p className="text-xs text-[#121212]/80 font-serif">
                {activeThinker.coreConcept}
              </p>
            </div>

            <p className="text-xs text-[#121212]/80 font-serif leading-relaxed mb-6">
              {activeThinker.thesis}
            </p>
          </div>

          <button
            onClick={() => {
              onSelectThinker(activeThinker.id);
              audioAtmosphere.playChime(480);
            }}
            className="w-full py-2.5 px-4 border border-[#121212] bg-[#121212] text-[#fdfcf8] text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#fdfcf8] hover:text-[#121212] transition-colors cursor-pointer"
          >
            <span>ENTER SIMULATION / 进入实验场</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
