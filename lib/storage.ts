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

function migrate(raw: Partial<AppStorage>): AppStorage {
  return {
    subjects: raw.subjects ?? createPresetSubjects(),
    sessions: raw.sessions ?? [],
    goals: raw.goals ?? [],
    earnedBadges: raw.earnedBadges ?? [],
    examRecords: raw.examRecords ?? [],
    version: STORAGE_VERSION,
  };
}

export function loadStorage(): AppStorage {
  if (typeof window === 'undefined') {
    return migrate({});
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedStorage();
    const parsed = JSON.parse(raw) as Partial<AppStorage>;
    return migrate(parsed);
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
  const initial = migrate({});
  saveStorage(initial);
  return initial;
}
