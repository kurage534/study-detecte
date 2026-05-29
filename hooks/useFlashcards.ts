'use client';

import { useState, useEffect } from 'react';
import type { Flashcard } from '@/lib/types';
import { loadStorage, saveStorage } from '@/lib/storage';

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
    };
    persist([...flashcards, card]);
  }

  function updateFlashcard(id: string, front: string, back: string) {
    persist(flashcards.map((c) => c.id === id ? { ...c, front: front.trim(), back: back.trim() } : c));
  }

  function deleteFlashcard(id: string) {
    persist(flashcards.filter((c) => c.id !== id));
  }

  return { flashcards, addFlashcard, updateFlashcard, deleteFlashcard };
}
