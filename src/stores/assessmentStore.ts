import { create } from 'zustand';
import {
  saveAssessmentRecord,
  getAssessmentRecords,
  getLatestAssessmentRecord,
  type AssessmentRecordDB,
} from '../db';

export interface AssessmentRecord {
  id: string;
  scaleId: string;
  scaleName: string;
  takenAt: number;
  answers: Record<string, number>;
  totalScore: number;
  interpretation: string;
  severity: string;
  severityLabel: string;
}

interface AssessmentStore {
  records: AssessmentRecord[];
  loading: boolean;
  loadRecords: (scaleId?: string) => Promise<void>;
  addRecord: (record: Omit<AssessmentRecord, 'id'>) => Promise<void>;
  getLatestForScale: (scaleId: string) => Promise<AssessmentRecord | null>;
}

function toDB(record: AssessmentRecord): AssessmentRecordDB {
  return { ...record };
}

function fromDB(record: AssessmentRecordDB): AssessmentRecord {
  return { ...record };
}

export const useAssessmentStore = create<AssessmentStore>((set) => ({
  records: [],
  loading: false,

  loadRecords: async (scaleId) => {
    set({ loading: true });
    try {
      const dbRecords = await getAssessmentRecords(scaleId);
      set({ records: dbRecords.map(fromDB), loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addRecord: async (recordData) => {
    const id = `assess-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const record: AssessmentRecord = { ...recordData, id };
    await saveAssessmentRecord(toDB(record));
    set(state => ({ records: [record, ...state.records] }));
  },

  getLatestForScale: async (scaleId) => {
    const dbRecord = await getLatestAssessmentRecord(scaleId);
    return dbRecord ? fromDB(dbRecord) : null;
  },
}));
