'use client';

import { useState, useEffect } from 'react';
import type { ExamRecord } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';

export function useExamRecords() {
  const [examRecords, setExamRecords] = useState<ExamRecord[]>([]);

  useEffect(() => {
    setExamRecords(loadStorage().examRecords);
  }, []);

  function persist(updated: ExamRecord[]) {
    setExamRecords(updated);
    const storage = loadStorage();
    saveStorage({ ...storage, examRecords: updated });
  }

  function addExamRecord(
    subjectId: string,
    examName: string,
    score: number,
    maxScore: number,
    date: string
  ) {
    const newRecord: ExamRecord = {
      id: crypto.randomUUID(),
      subjectId,
      examName,
      score,
      maxScore,
      date,
      createdAt: new Date().toISOString(),
    };
    persist([...examRecords, newRecord]);
  }

  function deleteExamRecord(id: string) {
    persist(examRecords.filter((r) => r.id !== id));
  }

  return { examRecords, addExamRecord, deleteExamRecord };
}
