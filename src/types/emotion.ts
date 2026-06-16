export type BaseEmotion = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'tired' | 'excited' | 'grateful';

export type Intensity = number;
export type EnergyLevel = number;

export interface EmotionEntry {
  id: string;
  timestamp: number;
  emotions: Array<{
    type: BaseEmotion;
    intensity: Intensity;
  }>;
  overallMood: Intensity;
  energyLevel: EnergyLevel;
  context?: {
    location?: string;
    activity?: string;
    people?: string;
    weather?: string;
  };
  thoughts?: {
    automaticThought: string;
    cognitiveDistortion?: string;
    evidenceFor?: string;
    evidenceAgainst?: string;
    alternativeThought?: string;
  };
  physicalSymptoms?: string[];
  note?: string;
}

export interface EmotionTrend {
  period: '7d' | '30d' | '90d';
  dailyAverages: Array<{
    date: string;
    averageMood: number;
    dominantEmotion: BaseEmotion;
  }>;
  patterns: Array<{
    type: 'weekly' | 'monthly' | 'contextual';
    description: string;
    confidence: number;
  }>;
  triggers: Array<{
    factor: string;
    correlation: number;
    occurrence: number;
  }>;
}
