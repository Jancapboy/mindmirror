export type EvidenceLevel = 'strong' | 'moderate' | 'emerging' | 'anecdotal';
export type KnowledgeCategory = 'theory' | 'technique' | 'assessment' | 'crisis';
export type Indication = 'depression' | 'anxiety' | 'stress' | 'insomnia' | 'trauma' | 'self-esteem' | 'relationship';

export type AssessmentRecord = import('./assessment').AssessmentRecord;

export interface PsychologyEntry {
  id: string;
  category: KnowledgeCategory;
  title: string;
  content: string;
  evidenceLevel: EvidenceLevel;
  indications: Indication[];
  contraindications: string[];
  steps?: string[];
  duration?: string;
  frequency?: string;
  resources?: Array<{
    type: 'book' | 'app' | 'website' | 'video';
    title: string;
    url?: string;
  }>;
  tags: string[];
  stats?: {
    recommendedCount: number;
    practicedCount: number;
  };
}

export interface UserPsychProfile {
  primaryConcerns: Indication[];
  assessmentHistory: AssessmentRecord[];
  practicedTechniques: string[];
  techniqueMastery: Map<string, number>;
  preferredApproach?: string;
  riskFlags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface CrisisResource {
  name: string;
  type: 'hotline' | 'hospital' | 'online';
  contact: string;
  available: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  structuredContent?: {
    type: 'breathing_guide' | 'thought_record' | 'technique_steps';
    data: unknown;
  };
  psychologicalBasis?: Array<{
    entryId: string;
    title: string;
  }>;
  riskAssessment?: {
    level: 'none' | 'low' | 'medium' | 'high';
    flags: string[];
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  intent: 'emergency' | 'cognitive_restructuring' | 'daily_review' | 'technique_coaching' | 'general';
  createdAt: number;
  updatedAt: number;
}
