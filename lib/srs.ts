import type { Flashcard } from './types';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// quality: 0 = forgot (ng), 2 = remembered (ok)
export function scheduleSM2(card: Flashcard, quality: 0 | 2): Flashcard {
  let { easeFactor, interval, repetitions } = card;

  if (quality === 0) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      interval = 1;
    } else if (repetitions === 2) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    easeFactor = Math.max(1.3, easeFactor + 0.1 - (2 - quality) * (0.08 + (2 - quality) * 0.02));
  }

  return {
    ...card,
    repetitions,
    interval,
    easeFactor,
    nextReviewDate: addDays(interval),
  };
}

export function getDueCards(flashcards: Flashcard[]): Flashcard[] {
  const today = todayStr();
  return flashcards.filter((c) => c.nextReviewDate === null || c.nextReviewDate <= today);
}
