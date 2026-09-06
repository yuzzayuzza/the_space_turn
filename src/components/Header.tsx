import React, { useState } from 'react';
import { Compass, Volume2, VolumeX, Sparkles, Layers, BookOpen, Orbit } from 'lucide-react';
import { ParadigmId } from '../types';
import { PARADIGMS } from '../data/thinkers';
import { audioAtmosphere } from '../utils/audioAtmosphere';

interface HeaderProps {
  currentTab: 'studio' | 'catalog' | 'compass' | 'oracle';
  onSelectTab: (tab: 'studio' | 'catalog' | 'compass' | 'oracle') => void;
  selectedParadigm: ParadigmId | 'all';
  onSelectParadigm: (p: ParadigmId | 'all') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  selectedParadigm,
  onSelectParadigm,
}) => {
  const [isAudioActive, setIsAudioActive] = useState(false);

  const toggleSound = () => {
    const active = audioAtmosphere.toggle();
    setIsAudioActive(active);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#fdfcf8]/95 backdrop-blur-md border-b border-[#121212] select-none text-[#121212]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Title - Editorial Style */}
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 border border-[#121212] bg-[#121212] text-[#fdfcf8] flex items-center justify-center font-serif-sc font-normal text-sm shadow-sm">
            空
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs uppercase tracking-[0.3em] font-mono font-bold text-[#121212]">
                THE SPATIAL TURN — 001
              </span>
              <span className="hidden md:inline-block text-[10px] uppercase tracking-widest px-1.5 py-0.5 border border-[#121212]/30 text-[#121212]/70 font-mono">
                COMPENDIUM
              </span>
            </div>
            <h1 className="text-sm font-serif font-light tracking-wide text-[#121212] hidden sm:block">
              空间谱系：人对空间的九重理解 <span className="italic opacity-60 text-xs font-normal">/ Dimensions of Space</span>
            </h1>
          </div>
        </div>

        {/* View Switcher Tabs - Editorial Aesthetic */}
        <nav className="flex items-center gap-1 border border-[#121212] p-0.5 bg-[#fdfcf8]">
          <button
            onClick={() => {
              onSelectTab('studio');
              audioAtmosphere.playChime(360);
            }}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'studio'
                ? 'bg-[#121212] text-[#fdfcf8] font-semibold'
                : 'text-[#121212]/70 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>动态沉浸场</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('catalog');
              audioAtmosphere.playChime(380);
            }}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'catalog'
                ? 'bg-[#121212] text-[#fdfcf8] font-semibold'
                : 'text-[#121212]/70 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>九大谱系</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('compass');
              audioAtmosphere.playChime(400);
            }}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'compass'
                ? 'bg-[#121212] text-[#fdfcf8] font-semibold'
                : 'text-[#121212]/70 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>空间哲学罗盘</span>
          </button>

          <button
            onClick={() => {
              onSelectTab('oracle');
              audioAtmosphere.playChime(420);
            }}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase tracking-[0.15em] transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'oracle'
                ? 'bg-[#121212] text-[#fdfcf8] font-semibold'
                : 'text-[#121212]/70 hover:text-[#121212] hover:bg-[#121212]/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>空间沉思录</span>
          </button>
        </nav>

        {/* Ambient Tone Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all border border-[#121212] cursor-pointer ${
              isAudioActive
                ? 'bg-[#121212] text-[#fdfcf8]'
                : 'bg-transparent text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8]'
            }`}
            title="切换哲学环境冥想和声 (432Hz)"
          >
            {isAudioActive ? (
              <>
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 opacity-60" />
                <span>SOUND OFF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Secondary Sub-Navigation for Paradigm Filter when on catalog view */}
      {currentTab === 'catalog' && (
        <div className="border-t border-[#121212] bg-[#f7f5ee] px-4 sm:px-8 py-2.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-3 text-xs font-mono uppercase tracking-wider">
            <span className="text-[#121212]/50 whitespace-nowrap text-[11px]">PARADIGM:</span>
            <button
              onClick={() => onSelectParadigm('all')}
              className={`px-3 py-1 text-xs whitespace-nowrap cursor-pointer transition-colors border border-[#121212] ${
                selectedParadigm === 'all'
                  ? 'bg-[#121212] text-[#fdfcf8]'
                  : 'bg-[#fdfcf8] text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8]'
              }`}
            >
              全部流派 [ALL]
            </button>
            {PARADIGMS.map(p => (
              <button
                key={p.id}
                onClick={() => onSelectParadigm(p.id)}
                className={`px-3 py-1 text-xs whitespace-nowrap cursor-pointer transition-colors border border-[#121212] ${
                  selectedParadigm === p.id
                    ? 'bg-[#121212] text-[#fdfcf8]'
                    : 'bg-[#fdfcf8] text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8]'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
