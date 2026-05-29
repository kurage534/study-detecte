import type { Subject, StudySession, SubjectWithMeta } from './types';
import { ALGO_CONFIG } from './constants';

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diffDays(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export function computeRecommendations(
  subjects: Subject[],
  sessions: StudySession[],
  config = ALGO_CONFIG
): SubjectWithMeta[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return subjects
    .map((subject) => {
      const subjectSessions = sessions
        .filter((s) => s.subjectId === subject.id)
        .sort((a, b) => b.date.localeCompare(a.date));

      const lastSession = subjectSessions[0] ?? null;
      const lastStudiedDate = lastSession?.date ?? null;

      const daysSinceLastStudy = lastStudiedDate
        ? diffDays(today, parseDate(lastStudiedDate))
        : Infinity;

      const totalMinutes = subjectSessions.reduce(
        (sum, s) => sum + s.durationMinutes,
        0
      );

      const weaknessScore = (subject.weaknessLevel - 1) / 4;
      const cappedDays = Math.min(
        isFinite(daysSinceLastStudy) ? daysSinceLastStudy : config.maxDaysForFullRecencyScore,
        config.maxDaysForFullRecencyScore
      );
      const recencyScore = cappedDays / config.maxDaysForFullRecencyScore;
      const priorityScore =
        config.weaknessWeight * weaknessScore + config.recencyWeight * recencyScore;

      return {
        ...subject,
        lastStudiedDate,
        daysSinceLastStudy,
        totalMinutes,
        priorityScore,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

export function getPriorityLabel(score: number): { label: string; color: string } {
  if (score >= 0.7) return { label: '要注意', color: 'text-red-500' };
  if (score >= 0.4) return { label: '注意', color: 'text-yellow-500' };
  return { label: '良好', color: 'text-green-500' };
}
