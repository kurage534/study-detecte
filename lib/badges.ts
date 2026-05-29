import type { Subject, StudySession, SubjectGoal, EarnedBadge, BadgeType } from './types';
import { getStudyStreak } from './stats';

function thisWeekStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // Sunday = 0
  return d;
}

function toDateStr(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function alreadyEarned(
  already: EarnedBadge[],
  type: BadgeType,
  subjectId?: string
): boolean {
  return already.some(
    (b) => b.type === type && (subjectId === undefined || b.subjectId === subjectId)
  );
}

export function checkNewBadges(
  sessions: StudySession[],
  subjects: Subject[],
  goals: SubjectGoal[],
  already: EarnedBadge[]
): EarnedBadge[] {
  const newBadges: EarnedBadge[] = [];
  const now = new Date().toISOString();

  // streak_7 / streak_30
  const streak = getStudyStreak(sessions);
  if (streak >= 7 && !alreadyEarned(already, 'streak_7')) {
    newBadges.push({ id: crypto.randomUUID(), type: 'streak_7', earnedAt: now });
  }
  if (streak >= 30 && !alreadyEarned(already, 'streak_30')) {
    newBadges.push({ id: crypto.randomUUID(), type: 'streak_30', earnedAt: now });
  }

  // total_10h (per subject, 600 min)
  for (const subject of subjects) {
    if (alreadyEarned(already, 'total_10h', subject.id)) continue;
    const total = sessions
      .filter((s) => s.subjectId === subject.id)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    if (total >= 600) {
      newBadges.push({
        id: crypto.randomUUID(),
        type: 'total_10h',
        earnedAt: now,
        subjectId: subject.id,
      });
    }
  }

  // goal_achieved (per subject, this week)
  const weekStart = toDateStr(thisWeekStart());
  for (const goal of goals) {
    if (goal.weeklyMinutes <= 0) continue;
    if (alreadyEarned(already, 'goal_achieved', goal.subjectId)) {
      // Check if it's from a previous week — allow re-earning each week
      const lastEarned = already
        .filter((b) => b.type === 'goal_achieved' && b.subjectId === goal.subjectId)
        .sort((a, b) => b.earnedAt.localeCompare(a.earnedAt))[0];
      if (lastEarned && lastEarned.earnedAt >= weekStart + 'T00:00:00.000Z') continue;
    }
    const weekTotal = sessions
      .filter((s) => s.subjectId === goal.subjectId && s.date >= weekStart)
      .reduce((sum, s) => sum + s.durationMinutes, 0);
    if (weekTotal >= goal.weeklyMinutes) {
      newBadges.push({
        id: crypto.randomUUID(),
        type: 'goal_achieved',
        earnedAt: now,
        subjectId: goal.subjectId,
      });
    }
  }

  // all_subjects: all subjects studied within last 7 days
  if (!alreadyEarned(already, 'all_subjects') && subjects.length > 0) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const cutoff = toDateStr(sevenDaysAgo);
    const studiedIds = new Set(
      sessions.filter((s) => s.date >= cutoff).map((s) => s.subjectId)
    );
    if (subjects.every((s) => studiedIds.has(s.id))) {
      newBadges.push({ id: crypto.randomUUID(), type: 'all_subjects', earnedAt: now });
    }
  }

  return newBadges;
}
