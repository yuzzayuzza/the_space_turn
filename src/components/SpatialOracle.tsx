import React, { useState } from 'react';
import { Sparkles, Send, ArrowRight, RefreshCw, Compass, Eye, CornerDownRight } from 'lucide-react';
import { SPATIAL_SCENARIOS, THINKERS } from '../data/thinkers';
import { audioAtmosphere } from '../utils/audioAtmosphere';
import {
  interpretSpaceHeuristically,
  SpatialInterpretationResult,
} from '../utils/spatialHermeneuticsEngine';

interface SpatialOracleProps {
  onSelectThinker: (id: string) => void;
}

const QUICK_INSPIRATION_SPACES = [
  '暴雨夜的高铁车厢',
  '凌晨3点的24小时便利店',
  '深夜熄灯后发光的手机屏幕',
  '长满野草的废弃工业园区',
  '美术馆极简白盒子展厅',
  '高层写字楼透明工位隔断',
  '狭窄出租屋的雨夜阳台',
];

export const SpatialOracle: React.FC<SpatialOracleProps> = ({ onSelectThinker }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(SPATIAL_SCENARIOS[0].id);
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customInterpretation, setCustomInterpretation] =
    useState<SpatialInterpretationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  const currentScenario =
    SPATIAL_SCENARIOS.find(s => s.id === selectedScenarioId) || SPATIAL_SCENARIOS[0];

  const handleDeconstructText = async (targetSpace: string) => {
    const p = targetSpace.trim();
    if (!p) return;

    setIsGenerating(true);
    setGenerationStep('正在连线空间哲学九大思想家谱系...');
    audioAtmosphere.playChime(420);

    try {
      setGenerationStep(`正在解构“${p}”的物理质感、光影、动线与权力关系...`);

      // Try server endpoint first (which uses Gemini 3.8 Flash if API key is present)
      const res = await fetch('/api/deconstruct-space', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ space: p }),
      });

      if (res.ok) {
        const data = await res.json();
        setCustomInterpretation(data);
      } else {
        // Fallback to local intelligent semantic hermeneutics engine
        const fallbackData = interpretSpaceHeuristically(p);
        setCustomInterpretation(fallbackData);
      }
    } catch (err) {
      console.warn('Backend call unreachable, using local hermeneutic engine:', err);
      const fallbackData = interpretSpaceHeuristically(p);
      setCustomInterpretation(fallbackData);
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
      audioAtmosphere.playChime(560);
    }
  };

  const handleCustomDeconstruct = () => {
    handleDeconstructText(customPrompt);
  };

  const handleQuickPick = (spaceName: string) => {
    setCustomPrompt(spaceName);
    handleDeconstructText(spaceName);
  };

  return (
    <div className="bg-[#fdfcf8] border border-[#121212] p-8 shadow-sm text-[#121212]">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[#121212]">
        <div>
          <div className="flex items-center gap-2 text-[#121212]/60 text-xs font-mono tracking-widest uppercase mb-1">
            <Sparkles className="w-4 h-4 text-[#121212]" />
            <span>SPATIAL HERMENEUTICS & ORACLE / 空间沉思录</span>
          </div>
          <h2 className="text-2xl font-serif font-light tracking-tight text-[#121212]">
            空间现场沉思：多重哲学棱镜的深度解构
          </h2>
        </div>
        <p className="text-xs text-[#121212]/70 font-serif max-w-md leading-relaxed">
          当同一个具体的现实空间（无论是一趟暴雨中的列车，还是一面深夜发光的手机屏）置于不同学派思想家的注视下，空间的维度与隐蔽意义将如何剧烈展开？
        </p>
      </div>

      {/* Preset Scenarios Selector Tabs */}
      <div className="mb-6">
        <div className="text-[10px] font-mono uppercase tracking-widest text-[#121212]/60 mb-2.5">
          CLASSICAL ARCHIVES / 经典预设场景档案:
        </div>
        <div className="flex flex-wrap gap-2">
          {SPATIAL_SCENARIOS.map(sc => {
            const isSelected = sc.id === selectedScenarioId && !customInterpretation;
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setSelectedScenarioId(sc.id);
                  setCustomInterpretation(null);
                  audioAtmosphere.playChime(320);
                }}
                className={`px-4 py-2.5 text-xs font-serif transition-all cursor-pointer border border-[#121212] ${
                  isSelected
                    ? 'bg-[#121212] text-[#fdfcf8] font-medium shadow-sm'
                    : 'bg-[#fdfcf8] text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8]'
                }`}
              >
                <div className="font-medium text-xs">{sc.title}</div>
                <div className="text-[10px] font-mono uppercase tracking-wider opacity-70 mt-0.5">
                  {sc.category}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Scenario Display or Custom Dynamic Result */}
      {!customInterpretation ? (
        <div className="space-y-6">
          {/* Scenario Overview Banner */}
          <div className="bg-[#f7f5ee] border border-[#121212] p-6 shadow-inner">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#121212]/60 mb-1.5">
              CASE STUDY · {currentScenario.category}
            </div>
            <h3 className="text-xl font-serif font-light text-[#121212] mb-2">
              {currentScenario.title}
            </h3>
            <p className="text-xs text-[#121212]/80 font-serif leading-relaxed">
              {currentScenario.description}
            </p>
          </div>

          {/* Thinker Readings Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentScenario.readings.map((reading, idx) => {
              const thinker = THINKERS.find(t => t.id === reading.thinkerId);
              return (
                <div
                  key={idx}
                  className="bg-[#fdfcf8] border border-[#121212] p-6 flex flex-col justify-between hover:bg-[#f7f5ee] transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#121212]/20">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-[#121212]">
                          {reading.thinkerName}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#121212]/60 px-2 py-0.5 border border-[#121212]/30">
                        {reading.concept}
                      </span>
                    </div>

                    <p className="text-xs text-[#121212]/90 font-serif leading-relaxed my-3">
                      “{reading.interpretation}”
                    </p>
                  </div>

                  {thinker && (
                    <button
                      onClick={() => onSelectThinker(thinker.id)}
                      className="text-[11px] font-mono uppercase tracking-wider text-[#121212] hover:underline flex items-center gap-1 mt-3 pt-2 border-t border-[#121212]/10 cursor-pointer"
                    >
                      <span>VIEW EXPERIMENTAL STAGE →</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Custom Dynamic Generation Result (Directly tailored to the user's input) */
        <div className="space-y-6">
          {/* Diagnostic Dossier Header */}
          <div className="bg-[#f7f5ee] border border-[#121212] p-6 shadow-inner space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#121212]/20">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-[#121212] text-[#fdfcf8]">
                  CUSTOM HERMENEUTICS DOSSIER
                </span>
                <span className="text-xs font-mono text-[#121212]/70">
                  [{customInterpretation.categoryTag}]
                </span>
                {customInterpretation.sourceEngine === 'gemini' && (
                  <span className="text-[10px] font-mono border border-[#121212]/30 px-1.5 py-0.2 text-[#121212]/80">
                    GEMINI 3.8 FLASH
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCustomDeconstruct()}
                  disabled={isGenerating}
                  className="px-3 py-1 border border-[#121212] bg-[#fdfcf8] text-xs font-mono uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>RE-ANALYZE</span>
                </button>
                <button
                  onClick={() => setCustomInterpretation(null)}
                  className="px-3 py-1 border border-[#121212] bg-[#fdfcf8] text-xs font-mono uppercase tracking-wider text-[#121212] hover:bg-[#121212] hover:text-[#fdfcf8] transition-colors cursor-pointer"
                >
                  RETURN TO ARCHIVE
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-light text-[#121212] tracking-tight mb-1">
                “{customInterpretation.space}”
              </h3>
              <p className="text-xs font-mono text-[#121212]/80 tracking-wide mb-2">
                核心辩证题：{customInterpretation.spatialDialectic}
              </p>
              <p className="text-xs font-serif italic text-[#121212]/90 leading-relaxed bg-[#fdfcf8] p-3 border border-[#121212]/20">
                “{customInterpretation.poeticDiagnosis}”
              </p>
            </div>
          </div>

          {/* 4 Tailored Thinker Reading Dossiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customInterpretation.readings.map((r, i) => {
              const thinker = THINKERS.find(t => t.id === r.thinkerId);
              return (
                <div
                  key={i}
                  className="bg-[#fdfcf8] border border-[#121212] p-6 flex flex-col justify-between hover:bg-[#f7f5ee] transition-colors shadow-sm"
                >
                  <div>
                    {/* Header with Thinker Name and Concept Tag */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#121212]/20">
                      <span className="text-xs font-serif font-bold text-[#121212]">
                        {r.thinkerName}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#121212]/70 px-2 py-0.5 border border-[#121212]/30 bg-[#f7f5ee]">
                        {r.concept}
                      </span>
                    </div>

                    {/* Paradigm */}
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#121212]/50 mb-2">
                      PARADIGM: {r.paradigm}
                    </div>

                    {/* Philosopher-Specific Interpretation */}
                    <p className="text-xs text-[#121212]/90 font-serif leading-relaxed mb-4">
                      {r.reading}
                    </p>

                    {/* Provocative Question */}
                    {r.provocativeQuestion && (
                      <div className="p-3 bg-[#f7f5ee] border-l-2 border-[#121212] text-xs font-serif italic text-[#121212]/80 mb-3 flex items-start gap-2">
                        <Eye className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-60" />
                        <span>现场体悟提问：{r.provocativeQuestion}</span>
                      </div>
                    )}
                  </div>

                  {/* Navigation to Simulator */}
                  {thinker ? (
                    <button
                      onClick={() => onSelectThinker(thinker.id)}
                      className="text-[11px] font-mono uppercase tracking-wider text-[#121212] hover:underline flex items-center justify-between mt-2 pt-2 border-t border-[#121212]/10 cursor-pointer"
                    >
                      <span>进入【{thinker.name}】的动态实验场</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="text-[10px] font-mono opacity-40 pt-2 border-t border-[#121212]/10">
                      SPATIAL PHILOSOPHY DOSSIER
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading State Banner */}
      {isGenerating && (
        <div className="my-6 p-4 border border-[#121212] bg-[#121212] text-[#fdfcf8] text-xs font-mono flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-300" />
            <span>{generationStep || '正在汇聚多重哲学视线，进行现场解构...'}</span>
          </div>
          <span className="text-[10px] opacity-70">HERMENEUTIC INQUIRY IN PROGRESS</span>
        </div>
      )}

      {/* Custom Space Input Bar & Quick Inspiration Chips */}
      <div className="mt-10 pt-6 border-t border-[#121212]">
        <label className="block text-xs font-mono uppercase tracking-widest text-[#121212]/70 mb-2">
          INSCRIBE YOUR EXACT SPATIAL CONDITION / 输入你此刻身处的任何空间:
        </label>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCustomDeconstruct()}
            placeholder="输入你身处的任何空间，如：暴雨天的高铁车厢、凌晨的24小时便利店、美术馆白盒子、发光的手机屏幕..."
            className="flex-1 bg-[#fdfcf8] border border-[#121212] px-4 py-2.5 text-xs text-[#121212] placeholder-[#121212]/40 focus:outline-none focus:ring-1 focus:ring-[#121212] font-serif"
          />
          <button
            onClick={handleCustomDeconstruct}
            disabled={isGenerating || !customPrompt.trim()}
            className="px-6 py-2.5 border border-[#121212] bg-[#121212] text-[#fdfcf8] font-mono uppercase tracking-wider text-xs hover:bg-[#fdfcf8] hover:text-[#121212] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isGenerating ? 'DECONSTRUCTING...' : 'DECONSTRUCT / 解构'}</span>
          </button>
        </div>

        {/* Quick Inspiration Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#121212]/50 mr-1 flex items-center gap-1">
            <CornerDownRight className="w-3 h-3" />
            QUICK SPATIAL INQUIRIES:
          </span>
          {QUICK_INSPIRATION_SPACES.map((space, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickPick(space)}
              className="text-[11px] font-serif px-2.5 py-1 border border-[#121212]/30 bg-[#f7f5ee] hover:bg-[#121212] hover:text-[#fdfcf8] transition-colors cursor-pointer"
            >
              {space}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
