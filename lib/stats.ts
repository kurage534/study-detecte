import type { Subject, StudySession, DailySummary, SubjectTotals } from './types';

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function getStudyStreak(sessions: StudySession[]): number {
  if (sessions.length === 0) return 0;

  const uniqueDates = Array.from(new Set(sessions.map((s) => s.date))).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const today = toDateStr(new Date());
  const yesterday = toDateStr(new Date(Date.now() - 86400000));

  // Start from today or yesterday
  const current = uniqueDates[0] === today || uniqueDates[0] === yesterday ? uniqueDates[0] : null;
  if (!current) return 0;

  let streak = 0;
  const dateSet = new Set(uniqueDates);
  const startDate = new Date(current);

  while (dateSet.has(toDateStr(startDate))) {
    streak++;
    startDate.setDate(startDate.getDate() - 1);
  }

  return streak;
}

export function getTotalStudyDays(sessions: StudySession[]): number {
  return new Set(sessions.map((s) => s.date)).size;
}

export function getDailySummaries(
  sessions: StudySession[],
  days: number
): DailySummary[] {
  const result: DailySummary[] = [];
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d);
    const daySessions = sessions.filter((s) => s.date === dateStr);

    const subjectBreakdown: Record<string, number> = {};
    let totalMinutes = 0;

    for (const s of daySessions) {
      subjectBreakdown[s.subjectId] = (subjectBreakdown[s.subjectId] ?? 0) + s.durationMinutes;
      totalMinutes += s.durationMinutes;
    }

    result.push({ date: dateStr, totalMinutes, subjectBreakdown });
  }

  return result;
}

export function getSubjectTotals(
  subjects: Subject[],
  sessions: StudySession[],
  since?: Date
): SubjectTotals[] {
  const filteredSessions = since
    ? sessions.filter((s) => new Date(s.date) >= since)
    : sessions;

  return subjects
    .map((subject) => {
      const totalMinutes = filteredSessions
        .filter((s) => s.subjectId === subject.id)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

      return {
        subjectId: subject.id,
        subjectName: subject.name,
        color: subject.color,
        totalMinutes,
      };
    })
    .filter((t) => t.totalMinutes > 0)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);
}
