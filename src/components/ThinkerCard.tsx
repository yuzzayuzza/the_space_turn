import React from 'react';
import { Thinker } from '../types';
import { ArrowRight } from 'lucide-react';
import { audioAtmosphere } from '../utils/audioAtmosphere';

interface ThinkerCardProps {
  thinker: Thinker;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const ThinkerCard: React.FC<ThinkerCardProps> = ({
  thinker,
  isActive,
  onSelect,
}) => {
  return (
    <div
      onClick={() => {
        onSelect(thinker.id);
        audioAtmosphere.playChime(380);
      }}
      className={`group relative border border-[#121212] p-7 transition-all duration-200 flex flex-col justify-between cursor-pointer select-none ${
        isActive
          ? 'bg-[#121212] text-[#fdfcf8] shadow-md'
          : 'bg-[#fdfcf8] text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8]'
      }`}
    >
      <div>
        {/* Top Editorial Index & Paradigm Header */}
        <div className="flex justify-between items-start mb-4 pb-2 border-b border-current opacity-70">
          <span className="text-[11px] font-mono tracking-widest uppercase">
            {thinker.paradigmName}
          </span>
          <span className="text-xs font-serif italic">
            {thinker.years}
          </span>
        </div>

        {/* Thinker Name in Classic Editorial Display */}
        <h3 className="text-2xl font-serif font-light tracking-tight group-hover:text-[#fdfcf8] transition-colors mb-0.5">
          {thinker.name}
        </h3>
        <p className="text-xs font-serif italic opacity-75 mb-4">
          {thinker.nameEn}
        </p>

        {/* Core Thesis / Concept */}
        <div className="mb-4">
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-60 block mb-1">
            CORE CONCEPT
          </span>
          <p className="text-xs font-serif leading-snug font-medium">
            {thinker.coreConcept}
          </p>
        </div>

        {/* Philosophical Quote Card */}
        <div className={`p-4 border mb-4 text-xs font-serif italic leading-relaxed ${
          isActive
            ? 'border-[#fdfcf8]/30 bg-[#121212]'
            : 'border-[#121212]/20 bg-[#f7f5ee] group-hover:bg-[#1a1a1a] group-hover:border-[#fdfcf8]/20 group-hover:text-[#fdfcf8]'
        }`}>
          “{thinker.quoteZh}”
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {thinker.tags.slice(0, 3).map((tag, i) => (
            <span
              key={i}
              className={`text-[10px] px-2 py-0.5 border font-mono uppercase tracking-wider ${
                isActive
                  ? 'border-[#fdfcf8]/30 text-[#fdfcf8]/80'
                  : 'border-[#121212]/20 text-[#121212]/70 group-hover:border-[#fdfcf8]/30 group-hover:text-[#fdfcf8]/80'
              }`}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-current flex items-center justify-between text-xs font-mono uppercase tracking-wider">
        <span className="text-[11px] font-semibold">
          {isActive ? '[ VIEWING ACTIVE ]' : 'ENTER DOSSIER'}
        </span>
        <ArrowRight
          className="w-4 h-4 transition-transform group-hover:translate-x-1"
        />
      </div>
    </div>
  );
};

