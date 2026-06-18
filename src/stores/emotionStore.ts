import { create } from 'zustand';
import {
  saveEmotionEntry,
  getEmotionEntries,
  getEmotionEntryById,
  deleteEmotionEntry,
  type EmotionEntryDB,
} from '../db';

export type BaseEmotion = 'happy' | 'calm' | 'anxious' | 'sad' | 'angry' | 'tired' | 'excited' | 'grateful';

export interface EmotionEntry {
  id: string;
  timestamp: number;
  emotions: Array<{ type: BaseEmotion; intensity: number }>;
  overallMood: number;
  energyLevel: number;
  context?: {
    location?: string;
    activity?: string;
    people?: string;
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

interface EmotionStore {
  entries: EmotionEntry[];
  loading: boolean;
  hasTodayEntry: boolean;
  loadEntries: (limit?: number) => Promise<void>;
  addEntry: (entry: Omit<EmotionEntry, 'id'>) => Promise<void>;
  updateEntry: (entry: EmotionEntry) => Promise<void>;
  removeEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => Promise<EmotionEntry | null>;
  getEntriesByDateRange: (start: number, end: number) => Promise<EmotionEntry[]>;
  getTodayMood: () => number | null;
}

function toDB(entry: EmotionEntry): EmotionEntryDB {
  return { ...entry, emotions: entry.emotions.map(e => ({ type: e.type, intensity: e.intensity })) };
}

function fromDB(entry: EmotionEntryDB): EmotionEntry {
  return { ...entry, emotions: entry.emotions.map(e => ({ type: e.type as BaseEmotion, intensity: e.intensity })) };
}

export const useEmotionStore = create<EmotionStore>((set, get) => ({
  entries: [],
  loading: false,
  hasTodayEntry: false,

  loadEntries: async (limit = 30) => {
    set({ loading: true });
    try {
      const dbEntries = await getEmotionEntries(limit);
      const entries = dbEntries.map(fromDB);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const hasToday = entries.some(e => e.timestamp >= today.getTime());
      set({ entries, hasTodayEntry: hasToday, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addEntry: async (entryData) => {
    const id = `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const entry: EmotionEntry = { ...entryData, id };
    await saveEmotionEntry(toDB(entry));
    set(state => ({ entries: [entry, ...state.entries], hasTodayEntry: true }));
  },

  updateEntry: async (entry) => {
    await saveEmotionEntry(toDB(entry));
    set(state => ({
      entries: state.entries.map(e => (e.id === entry.id ? entry : e)),
    }));
  },

  removeEntry: async (id) => {
    await deleteEmotionEntry(id);
    set(state => ({
      entries: state.entries.filter(e => e.id !== id),
    }));
  },

  getEntry: async (id) => {
    const found = get().entries.find(e => e.id === id);
    if (found) return found;
    const dbEntry = await getEmotionEntryById(id);
    return dbEntry ? fromDB(dbEntry) : null;
  },

  getEntriesByDateRange: async (start, end) => {
    const dbEntries = await getEmotionEntries(undefined, start, end);
    return dbEntries.map(fromDB);
  },

  getTodayMood: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntry = get().entries.find(e => e.timestamp >= today.getTime());
    return todayEntry ? todayEntry.overallMood : null;
  },
}));
