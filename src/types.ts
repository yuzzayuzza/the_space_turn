export type ParadigmId = 
  | 'phenomenology'
  | 'sociology'
  | 'psychoanalysis'
  | 'eastern_architecture'
  | 'physics_relativity';

export interface SpatialCoordinates {
  // -100 (pure subjective/internal/dream) to +100 (pure objective/external/grid)
  subjectiveVsObjective: number;
  // -100 (metaphysical/ontological/dwelling) to +100 (socio-political/power/capital)
  ontologicalVsSocial: number;
}

export interface Thinker {
  id: string;
  name: string;
  nameEn: string;
  years: string;
  paradigmId: ParadigmId;
  paradigmName: string;
  avatarIcon: string;
  classicWork: string;
  classicWorkEn: string;
  coreConcept: string;
  coreConceptEn: string;
  thesis: string;
  quoteZh: string;
  quoteEn: string;
  detailedAnalysis: string[];
  interactivePrompt: string;
  coordinates: SpatialCoordinates;
  accentColor: string; // Tailwind color string or hex
  bgGradient: string;
  tags: string[];
}

export interface SpatialScenario {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  readings: {
    thinkerId: string;
    thinkerName: string;
    concept: string;
    interpretation: string;
  }[];
}
