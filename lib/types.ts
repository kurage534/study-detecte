export type SubjectId = string;

export interface Subject {
  id: SubjectId;
  name: string;
  weaknessLevel: 1 | 2 | 3 | 4 | 5;
  isPreset: boolean;
  createdAt: string;
  color: string;
}

export interface StudySession {
  id: string;
  subjectId: SubjectId;
  durationMinutes: number;
  date: string; // "YYYY-MM-DD"
  notes: string;
  createdAt: string;
}

export interface AppStorage {
  subjects: Subject[];
  sessions: StudySession[];
  version: number;
}

export interface SubjectWithMeta extends Subject {
  lastStudiedDate: string | null;
  daysSinceLastStudy: number;
  totalMinutes: number;
  priorityScore: number;
}

export interface DailySummary {
  date: string; // "YYYY-MM-DD"
  totalMinutes: number;
  subjectBreakdown: Record<SubjectId, number>;
}

export interface SubjectTotals {
  subjectId: SubjectId;
  subjectName: string;
  color: string;
  totalMinutes: number;
}

export type TabId = 'today' | 'subjects' | 'sessions' | 'stats';
