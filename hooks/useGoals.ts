'use client';

import { useState, useEffect } from 'react';
import type { Subject, StudySession, SubjectGoal, EarnedBadge } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';
import { checkNewBadges } from '@/lib/badges';

export function useGoals(subjects: Subject[], sessions: StudySession[]) {
  const [goals, setGoals] = useState<SubjectGoal[]>([]);
  const [earnedBadges, setEarnedBadges] = useState<EarnedBadge[]>([]);
  const [newBadge, setNewBadge] = useState<EarnedBadge | null>(null);

  useEffect(() => {
    const storage = loadStorage();
    setGoals(storage.goals);
    setEarnedBadges(storage.earnedBadges);
  }, []);

  // Check for new badges whenever sessions or goals change
  useEffect(() => {
    if (subjects.length === 0) return;
    const storage = loadStorage();
    const fresh = checkNewBadges(sessions, subjects, storage.goals, storage.earnedBadges);
    if (fresh.length > 0) {
      const updated = [...storage.earnedBadges, ...fresh];
      setEarnedBadges(updated);
      setNewBadge(fresh[fresh.length - 1]);
      saveStorage({ ...storage, earnedBadges: updated });
    }
  }, [sessions, subjects]);

  function setGoal(subjectId: string, weeklyMinutes: number) {
    const storage = loadStorage();
    const existing = storage.goals.filter((g) => g.subjectId !== subjectId);
    const updated = weeklyMinutes > 0
      ? [...existing, { subjectId, weeklyMinutes }]
      : existing;
    setGoals(updated);
    saveStorage({ ...storage, goals: updated });
  }

  function dismissNewBadge() {
    setNewBadge(null);
  }

  return { goals, earnedBadges, newBadge, setGoal, dismissNewBadge };
}
