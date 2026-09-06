import React, { useState } from 'react';
import { Header } from './components/Header';
import { SimulationStudio } from './components/SimulationStudio';
import { ThinkerCard } from './components/ThinkerCard';
import { SpatialCompass } from './components/SpatialCompass';
import { SpatialOracle } from './components/SpatialOracle';
import { THINKERS, PARADIGMS } from './data/thinkers';
import { ParadigmId } from './types';
import { Orbit, Compass, Sparkles, Layers, BookOpen } from 'lucide-react';
import { audioAtmosphere } from './utils/audioAtmosphere';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'studio' | 'catalog' | 'compass' | 'oracle'>('studio');
  const [selectedParadigm, setSelectedParadigm] = useState<ParadigmId | 'all'>('all');
  const [activeThinkerId, setActiveThinkerId] = useState<string>('bachelard');

  const filteredThinkers =
    selectedParadigm === 'all'
      ? THINKERS
      : THINKERS.filter(t => t.paradigmId === selectedParadigm);

  const handleSelectThinker = (id: string) => {
    setActiveThinkerId(id);
    setCurrentTab('studio');
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#121212] flex flex-col selection:bg-[#121212] selection:text-[#fdfcf8]">
      {/* Universal Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        selectedParadigm={selectedParadigm}
        onSelectParadigm={setSelectedParadigm}
      />

      {/* Main Editorial Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Editorial Masthead Banner */}
        <div className="mb-10 border border-[#121212] bg-[#fdfcf8] p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[11px] uppercase font-mono tracking-[0.3em] font-bold text-[#121212]">
                    THE SPATIAL COMPENDIUM
                  </span>
                  <div className="h-[1px] w-12 bg-[#121212]"></div>
                  <span className="text-[11px] font-serif italic text-[#121212]/70">
                    人类知觉的九维拓扑
                  </span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl leading-[0.95] font-light tracking-tighter mb-5 font-serif text-[#121212]">
                  Towards a <br />
                  <span className="italic font-normal">Philosophy</span> of Space
                </h1>

                <p className="text-sm sm:text-base max-w-2xl leading-relaxed font-serif font-light text-[#121212]/80">
                  空间从来不仅是笛卡尔式的冷峻容器。在现象学、社会学与精神分析的凝视下，它是记忆庇护的角落、具身肉身的视界、权力规训的网络、欲望滑移的单侧曲面、抑或虚室生白的呼吸大用。
                </p>
              </div>
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between h-full border-t lg:border-t-0 lg:border-l border-[#121212] pt-6 lg:pt-0 lg:pl-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest pb-2 border-b border-[#121212]/30">
                  <span className="text-[#121212]/60">CURATION</span>
                  <span className="font-bold text-[#121212]">09 THINKERS</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest pb-2 border-b border-[#121212]/30">
                  <span className="text-[#121212]/60">PARADIGMS</span>
                  <span className="font-bold text-[#121212]">05 SCHOOLS</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono uppercase tracking-widest pb-2 border-b border-[#121212]/30">
                  <span className="text-[#121212]/60">EDITION</span>
                  <span className="font-bold text-[#121212]">VOL. XXIV — NO. 12</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#121212]">
                <p className="font-mono text-[10px] uppercase tracking-widest text-[#121212]/60">
                  A Visual Compendium of Spatial Interpretation & Phenomenology
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab 1: Studio / Dynamic Interactive Simulation View */}
        {currentTab === 'studio' && (
          <SimulationStudio
            activeThinkerId={activeThinkerId}
            onSelectThinker={setActiveThinkerId}
          />
        )}

        {/* Tab 2: Catalog of Thinkers Grid */}
        {currentTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#121212]">
              <span className="text-xs font-mono uppercase tracking-widest text-[#121212]/70">
                ARCHIVE INDEX — 共呈现 {filteredThinkers.length} 位空间思想家
              </span>
              <span className="text-xs font-serif italic text-[#121212]/60">
                Click any dossier to enter simulation
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredThinkers.map(thinker => (
                <ThinkerCard
                  key={thinker.id}
                  thinker={thinker}
                  isActive={thinker.id === activeThinkerId}
                  onSelect={handleSelectThinker}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Spatial Philosophical Compass Matrix */}
        {currentTab === 'compass' && (
          <SpatialCompass
            thinkers={THINKERS}
            activeThinkerId={activeThinkerId}
            onSelectThinker={handleSelectThinker}
          />
        )}

        {/* Tab 4: Spatial Hermeneutic Oracle */}
        {currentTab === 'oracle' && (
          <SpatialOracle onSelectThinker={handleSelectThinker} />
        )}
      </main>

      {/* Editorial Classic Colophon Footer */}
      <footer className="w-full border-t border-[#121212] bg-[#fdfcf8] mt-12 py-8 text-xs text-[#121212] font-serif select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8 text-xs">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#121212]/50">CONCEPT</span>
              <span className="font-serif italic text-sm">Ontological Resonance</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#121212]/50">LOCATION</span>
              <span className="font-serif italic text-sm">Non-Euclidean Void</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#121212]/50">STATUS</span>
              <span className="font-serif italic text-sm">Expanding / Contracting</span>
            </div>
          </div>

          <div className="text-xs font-mono uppercase tracking-widest text-[#121212]/80">
            VOL. XXIV — NO. 12 · 空间谱系
          </div>
        </div>
      </footer>
    </div>
  );
}
