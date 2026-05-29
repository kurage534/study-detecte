'use client';

import { useState, useEffect } from 'react';
import type { WeeklySchedule } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';

export function useWeeklySchedule() {
  const [schedule, setSchedule] = useState<WeeklySchedule[]>([]);

  useEffect(() => {
    setSchedule(loadStorage().weeklySchedule);
  }, []);

  function persist(updated: WeeklySchedule[]) {
    setSchedule(updated);
    const storage = loadStorage();
    saveStorage({ ...storage, weeklySchedule: updated });
  }

  function setSubjectSchedule(subjectId: string, days: number[]) {
    const existing = schedule.find((s) => s.subjectId === subjectId);
    if (existing) {
      persist(schedule.map((s) => s.subjectId === subjectId ? { ...s, days } : s));
    } else {
      persist([...schedule, { subjectId, days }]);
    }
  }

  function getScheduleForDay(day: number): string[] {
    return schedule
      .filter((s) => s.days.includes(day))
      .map((s) => s.subjectId);
  }

  function getTodaySchedule(): string[] {
    return getScheduleForDay(new Date().getDay());
  }

  return { schedule, setSubjectSchedule, getScheduleForDay, getTodaySchedule };
}
