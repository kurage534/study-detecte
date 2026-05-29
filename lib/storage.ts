import type { AppStorage, Subject } from './types';
import { STORAGE_KEY, PRESET_SUBJECTS, STORAGE_VERSION } from './constants';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function createPresetSubjects(): Subject[] {
  return PRESET_SUBJECTS.map((preset) => ({
    ...preset,
    id: generateId(),
    createdAt: new Date().toISOString(),
  }));
}

export function loadStorage(): AppStorage {
  if (typeof window === 'undefined') {
    return { subjects: createPresetSubjects(), sessions: [], version: STORAGE_VERSION };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStorage();
    const parsed = JSON.parse(raw) as AppStorage;
    return parsed;
  } catch {
    return seedStorage();
  }
}

export function saveStorage(data: AppStorage): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

function seedStorage(): AppStorage {
  const initial: AppStorage = {
    subjects: createPresetSubjects(),
    sessions: [],
    version: STORAGE_VERSION,
  };
  saveStorage(initial);
  return initial;
}
