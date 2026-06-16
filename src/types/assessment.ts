export interface Scale {
  id: string;
  name: string;
  fullName: string;
  description: string;
  questions: ScaleQuestion[];
  scoringRules: ScoringRules;
  interpretation: ScoreInterpretation[];
  source: string;
  reliability?: string;
  validity?: string;
}

export interface ScaleQuestion {
  id: string;
  text: string;
  options: Array<{
    value: number;
    label: string;
  }>;
  reverseScored?: boolean;
}

export interface ScoringRules {
  minScore: number;
  maxScore: number;
  cutoffs: Array<{
    threshold: number;
    label: string;
    severity: 'none' | 'mild' | 'moderate' | 'severe';
    action: string;
  }>;
}

export interface ScoreInterpretation {
  range: [number, number];
  label: string;
  description: string;
  recommendation: string;
}

export interface AssessmentRecord {
  id: string;
  scaleId: string;
  takenAt: number;
  answers: Record<string, number>;
  totalScore: number;
  interpretation: string;
  severity: string;
  comparison?: {
    previousScore: number;
    change: number;
    trend: 'improved' | 'worsened' | 'stable';
  };
}
