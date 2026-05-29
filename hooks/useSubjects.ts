'use client';

import { useState, useEffect } from 'react';
import type { Subject } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';
import { PRESET_COLORS } from '@/lib/constants';

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    setSubjects(loadStorage().subjects);
  }, []);

  function persist(updated: Subject[]) {
    setSubjects(updated);
    const storage = loadStorage();
    saveStorage({ ...storage, subjects: updated });
  }

  function addSubject(name: string, weaknessLevel: 1 | 2 | 3 | 4 | 5) {
    const usedColors = subjects.map((s) => s.color);
    const color =
      PRESET_COLORS.find((c) => !usedColors.includes(c)) ??
      PRESET_COLORS[subjects.length % PRESET_COLORS.length];

    const newSubject: Subject = {
      id: crypto.randomUUID(),
      name,
      weaknessLevel,
      isPreset: false,
      createdAt: new Date().toISOString(),
      color,
    };
    persist([...subjects, newSubject]);
  }

  function updateSubjectWeakness(id: string, level: 1 | 2 | 3 | 4 | 5) {
    persist(subjects.map((s) => (s.id === id ? { ...s, weaknessLevel: level } : s)));
  }

  function deleteSubject(id: string) {
    const subject = subjects.find((s) => s.id === id);
    if (!subject || subject.isPreset) return;
    persist(subjects.filter((s) => s.id !== id));
  }

  return { subjects, addSubject, updateSubjectWeakness, deleteSubject };
}
