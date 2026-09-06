import React from 'react';
import { Thinker } from '../types';
import { THINKERS } from '../data/thinkers';
import { BachelardNestSimulation } from './simulations/BachelardNestSimulation';
import { HeideggerOrtSimulation } from './simulations/HeideggerOrtSimulation';
import { MerleauPontyBodySimulation } from './simulations/MerleauPontyBodySimulation';
import { LefebvreTriadSimulation } from './simulations/LefebvreTriadSimulation';
import { FoucaultPanopticonSimulation } from './simulations/FoucaultPanopticonSimulation';
import { LacanMobiusSimulation } from './simulations/LacanMobiusSimulation';
import { LaoziVoidSimulation } from './simulations/LaoziVoidSimulation';
import { HarveyCompressionSimulation } from './simulations/HarveyCompressionSimulation';
import { TschumiTranscriptsSimulation } from './simulations/TschumiTranscriptsSimulation';
import { CerteauWalkingSimulation } from './simulations/CerteauWalkingSimulation';
import { TuanTopophiliaSimulation } from './simulations/TuanTopophiliaSimulation';
import { LynchCognitiveSimulation } from './simulations/LynchCognitiveSimulation';
import { CastellsFlowsSimulation } from './simulations/CastellsFlowsSimulation';
import { BookOpen, Sparkles, Compass, Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';
import { audioAtmosphere } from '../utils/audioAtmosphere';

interface SimulationStudioProps {
  activeThinkerId: string;
  onSelectThinker: (id: string) => void;
}

export const SimulationStudio: React.FC<SimulationStudioProps> = ({
  activeThinkerId,
  onSelectThinker,
}) => {
  const currentThinker = THINKERS.find(t => t.id === activeThinkerId) || THINKERS[0];
  const currentIndex = THINKERS.findIndex(t => t.id === currentThinker.id);

  const prevThinker = THINKERS[(currentIndex - 1 + THINKERS.length) % THINKERS.length];
  const nextThinker = THINKERS[(currentIndex + 1) % THINKERS.length];

  const renderActiveSimulation = () => {
    switch (currentThinker.id) {
      case 'bachelard':
        return <BachelardNestSimulation />;
      case 'heidegger':
        return <HeideggerOrtSimulation />;
      case 'merleau-ponty':
        return <MerleauPontyBodySimulation />;
      case 'lefebvre':
        return <LefebvreTriadSimulation />;
      case 'foucault':
        return <FoucaultPanopticonSimulation />;
      case 'certeau':
        return <CerteauWalkingSimulation />;
      case 'lacan':
        return <LacanMobiusSimulation />;
      case 'laozi':
        return <LaoziVoidSimulation />;
      case 'harvey':
        return <HarveyCompressionSimulation />;
      case 'tschumi':
        return <TschumiTranscriptsSimulation />;
      case 'tuan':
        return <TuanTopophiliaSimulation />;
      case 'lynch':
        return <LynchCognitiveSimulation />;
      case 'castells':
        return <CastellsFlowsSimulation />;
      default:
        return <BachelardNestSimulation />;
    }
  };

  return (
    <div className="space-y-8 text-[#121212]">
      {/* Thinkers Editorial Selector Strip */}
      <div className="bg-[#fdfcf8] p-3 border border-[#121212] flex items-center gap-2 overflow-x-auto shadow-sm">
        <span className="text-[11px] font-mono uppercase tracking-widest text-[#121212]/50 whitespace-nowrap pl-2 pr-1">
          INDEX:
        </span>
        {THINKERS.map(t => {
          const isSelected = t.id === currentThinker.id;
          return (
            <button
              key={t.id}
              onClick={() => {
                onSelectThinker(t.id);
                audioAtmosphere.playChime(350);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-serif whitespace-nowrap transition-all cursor-pointer border border-[#121212] ${
                isSelected
                  ? 'bg-[#121212] text-[#fdfcf8] font-medium'
                  : 'bg-[#fdfcf8] text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8]'
              }`}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: isSelected ? '#fdfcf8' : t.accentColor }}
              />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Simulation View Stage Framed in Editorial Ink Border */}
      <div className="w-full h-[620px] overflow-hidden shadow-sm relative border border-[#121212] bg-[#121212]">
        {renderActiveSimulation()}
      </div>

      {/* Editorial Dossier & Deep Hermeneutics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Essential Quote & Thesis (The Editorial Dossier) */}
        <div className="lg:col-span-5 bg-[#fdfcf8] border border-[#121212] p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#121212]/30">
            <span className="text-[11px] font-mono uppercase tracking-widest text-[#121212]/70">
              {currentThinker.paradigmName}
            </span>
            <span className="text-xs font-serif italic text-[#121212]/70">
              {currentThinker.years}
            </span>
          </div>

          <div>
            <h2 className="text-3xl font-serif font-light tracking-tight text-[#121212] mb-1">
              {currentThinker.name}
            </h2>
            <p className="text-xs font-serif italic text-[#121212]/70">
              {currentThinker.nameEn} — 《{currentThinker.classicWork}》
            </p>
          </div>

          {/* Key Quote Box in Classic Editorial Callout */}
          <div className="p-5 border-l-2 border-[#121212] bg-[#f7f5ee] text-sm font-serif italic leading-relaxed text-[#121212]">
            <p className="mb-2">“{currentThinker.quoteZh}”</p>
            <p className="text-xs font-serif text-[#121212]/60 not-italic">
              {currentThinker.quoteEn}
            </p>
          </div>

          {/* Core Thesis */}
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#121212]/60 block mb-1.5">
              SPATIAL THESIS (论题)
            </span>
            <p className="text-xs font-serif text-[#121212]/90 leading-relaxed">
              {currentThinker.thesis}
            </p>
          </div>

          {/* Switcher Footer */}
          <div className="pt-4 border-t border-[#121212]/30 flex items-center justify-between font-mono text-xs uppercase tracking-wider">
            <button
              onClick={() => onSelectThinker(prevThinker.id)}
              className="flex items-center gap-1.5 text-[#121212]/70 hover:text-[#121212] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{prevThinker.name}</span>
            </button>
            <button
              onClick={() => onSelectThinker(nextThinker.id)}
              className="flex items-center gap-1.5 text-[#121212]/70 hover:text-[#121212] transition-colors cursor-pointer"
            >
              <span>{nextThinker.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Three-Point Deep Hermeneutics */}
        <div className="lg:col-span-7 bg-[#fdfcf8] border border-[#121212] p-8 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#121212]/30">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#121212]">
              <Lightbulb className="w-4 h-4" />
              <span>EPISTEMOLOGY OF THE INTERACTION / 三重视角解构</span>
            </div>
            <span className="text-xs font-serif italic text-[#121212]/50">03 Notes</span>
          </div>

          <div className="space-y-3">
            {currentThinker.detailedAnalysis.map((point, idx) => {
              const [heading, ...rest] = point.split('：');
              return (
                <div
                  key={idx}
                  className="bg-[#f7f5ee] border border-[#121212]/20 p-5 transition-colors hover:border-[#121212]"
                >
                  <div className="text-xs font-serif font-bold text-[#121212] mb-1.5 flex items-center gap-2">
                    <span className="font-mono text-[11px] opacity-50">0{idx + 1}.</span>
                    <span>{heading}</span>
                  </div>
                  <p className="text-xs text-[#121212]/80 font-serif leading-relaxed">
                    {rest.join('：')}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Interactive Guidance Footer - Inverted Editorial Contrast */}
          <div className="p-4 border border-[#121212] bg-[#121212] text-[#fdfcf8] text-xs font-serif flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-mono uppercase tracking-widest text-[10px] text-amber-300 block mb-0.5">
                INTERACTIVE INTENTION / 交互指引:
              </span>
              <span className="opacity-90 leading-relaxed font-light">
                {currentThinker.interactivePrompt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
