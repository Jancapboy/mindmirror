// IndexedDB 封装 - 心镜数据层
const DB_NAME = 'mindscape-ai';
const DB_VERSION = 1;

export interface DBSchema {
  emotionEntries: {
    key: string;
    value: EmotionEntryDB;
  };
  assessmentRecords: {
    key: string;
    value: AssessmentRecordDB;
  };
  chatMessages: {
    key: string;
    value: ChatMessageDB;
  };
  settings: {
    key: string;
    value: unknown;
  };
}

export interface EmotionEntryDB {
  id: string;
  timestamp: number;
  emotions: Array<{ type: string; intensity: number }>;
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

export interface AssessmentRecordDB {
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

export interface ChatMessageDB {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

let dbInstance: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('emotionEntries')) {
        const store = db.createObjectStore('emotionEntries', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('assessmentRecords')) {
        const store = db.createObjectStore('assessmentRecords', { keyPath: 'id' });
        store.createIndex('scaleId', 'scaleId', { unique: false });
        store.createIndex('takenAt', 'takenAt', { unique: false });
      }

      if (!db.objectStoreNames.contains('chatMessages')) {
        const store = db.createObjectStore('chatMessages', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };
  });
}

// ===== Emotion Entries =====
export async function saveEmotionEntry(entry: EmotionEntryDB): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emotionEntries', 'readwrite');
    const store = tx.objectStore('emotionEntries');
    const request = store.put(entry);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getEmotionEntries(
  limit?: number,
  startTime?: number,
  endTime?: number
): Promise<EmotionEntryDB[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emotionEntries', 'readonly');
    const store = tx.objectStore('emotionEntries');
    const index = store.index('timestamp');
    const request = index.openCursor(null, 'prev');
    const results: EmotionEntryDB[] = [];

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor) {
        resolve(results);
        return;
      }
      const entry = cursor.value as EmotionEntryDB;
      if (startTime && entry.timestamp < startTime) {
        resolve(results);
        return;
      }
      if (endTime && entry.timestamp > endTime) {
        cursor.continue();
        return;
      }
      results.push(entry);
      if (limit && results.length >= limit) {
        resolve(results);
        return;
      }
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getEmotionEntryById(id: string): Promise<EmotionEntryDB | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emotionEntries', 'readonly');
    const store = tx.objectStore('emotionEntries');
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteEmotionEntry(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('emotionEntries', 'readwrite');
    const store = tx.objectStore('emotionEntries');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ===== Assessment Records =====
export async function saveAssessmentRecord(record: AssessmentRecordDB): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('assessmentRecords', 'readwrite');
    const store = tx.objectStore('assessmentRecords');
    const request = store.put(record);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAssessmentRecords(scaleId?: string): Promise<AssessmentRecordDB[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('assessmentRecords', 'readonly');
    const store = tx.objectStore('assessmentRecords');

    let request: IDBRequest;
    if (scaleId) {
      const index = store.index('scaleId');
      request = index.openCursor(scaleId, 'prev');
    } else {
      const index = store.index('takenAt');
      request = index.openCursor(null, 'prev');
    }

    const results: AssessmentRecordDB[] = [];
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (!cursor) {
        resolve(results);
        return;
      }
      results.push(cursor.value);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getLatestAssessmentRecord(scaleId: string): Promise<AssessmentRecordDB | null> {
  const records = await getAssessmentRecords(scaleId);
  return records[0] || null;
}

// ===== Settings =====
export async function saveSetting(id: string, value: unknown): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    const request = store.put({ id, value });
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSetting<T>(id: string): Promise<T | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    const request = store.get(id);
    request.onsuccess = () => {
      const result = request.result;
      resolve(result ? (result.value as T) : null);
    };
    request.onerror = () => reject(request.error);
  });
}
