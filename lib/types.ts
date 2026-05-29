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

export interface SubjectGoal {
  subjectId: SubjectId;
  weeklyMinutes: number;
}

export type BadgeType =
  | 'streak_7'
  | 'streak_30'
  | 'total_10h'
  | 'goal_achieved'
  | 'all_subjects';

export interface EarnedBadge {
  id: string;
  type: BadgeType;
  earnedAt: string;
  subjectId?: SubjectId;
}

export interface ExamRecord {
  id: string;
  subjectId: SubjectId;
  examName: string;
  score: number;
  maxScore: number;
  date: string; // "YYYY-MM-DD"
  createdAt: string;
}

export interface AppStorage {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
  earnedBadges: EarnedBadge[];
  examRecords: ExamRecord[];
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
