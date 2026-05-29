'use client';

import { useState, useEffect } from 'react';
import type { StudySession } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';

export function useSessions() {
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    setSessions(loadStorage().sessions);
  }, []);

  function persist(updated: StudySession[]) {
    setSessions(updated);
    const storage = loadStorage();
    saveStorage({ ...storage, sessions: updated });
  }

  function addSession(
    subjectId: string,
    durationMinutes: number,
    date: string,
    notes: string
  ) {
    const newSession: StudySession = {
      id: crypto.randomUUID(),
      subjectId,
      durationMinutes,
      date,
      notes,
      createdAt: new Date().toISOString(),
    };
    persist([...sessions, newSession]);
  }

  function deleteSession(id: string) {
    persist(sessions.filter((s) => s.id !== id));
  }

  return { sessions, addSession, deleteSession };
}
