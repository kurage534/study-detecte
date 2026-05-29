'use client';

import { useState, useEffect } from 'react';
import type { Flashcard } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';
import { scheduleSM2 } from '@/lib/srs';

export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);

  useEffect(() => {
    setFlashcards(loadStorage().flashcards);
  }, []);

  function persist(updated: Flashcard[]) {
    setFlashcards(updated);
    const storage = loadStorage();
    saveStorage({ ...storage, flashcards: updated });
  }

  function addFlashcard(subjectId: string, front: string, back: string) {
    const card: Flashcard = {
      id: crypto.randomUUID(),
      subjectId,
      front: front.trim(),
      back: back.trim(),
      createdAt: new Date().toISOString(),
      nextReviewDate: null,
      interval: 1,
      easeFactor: 2.5,
      repetitions: 0,
    };
    persist([...flashcards, card]);
  }

  function updateFlashcard(id: string, front: string, back: string) {
    persist(flashcards.map((c) => c.id === id ? { ...c, front: front.trim(), back: back.trim() } : c));
  }

  function deleteFlashcard(id: string) {
    persist(flashcards.filter((c) => c.id !== id));
  }

  function reviewFlashcard(id: string, quality: 0 | 2) {
    persist(flashcards.map((c) => c.id === id ? scheduleSM2(c, quality) : c));
  }

  return { flashcards, addFlashcard, updateFlashcard, deleteFlashcard, reviewFlashcard };
}
