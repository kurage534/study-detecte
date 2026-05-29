'use client';

import { useState } from 'react';
import { Plus, Play, Pencil, Trash2 } from 'lucide-react';
import type { Subject, Flashcard } from '@/lib/types';
import { getDueCards } from '@/lib/srs';
import { FlashcardForm } from './FlashcardForm';
import { FlashcardView } from './FlashcardView';
import { Button } from '@/components/ui/button';

interface Props {
  subjects: Subject[];
  flashcards: Flashcard[];
  onAdd: (subjectId: string, front: string, back: string) => void;
  onUpdate: (id: string, front: string, back: string) => void;
  onDelete: (id: string) => void;
  onReview: (id: string, quality: 0 | 2) => void;
}

type ReviewMode = 'all' | 'due';

export function CardsPage({ subjects, flashcards, onAdd, onUpdate, onDelete, onReview }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | undefined>();
  const [reviewSubjectId, setReviewSubjectId] = useState<string | null>(null);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id ?? '');

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const dueCards = getDueCards(flashcards);
  const dueCount = dueCards.length;

  // Group cards by subject
  const bySubject = subjects.map((s) => ({
    subject: s,
    cards: flashcards.filter((c) => c.subjectId === s.id),
    dueCount: dueCards.filter((c) => c.subjectId === s.id).length,
  })).filter((g) => g.cards.length > 0 || subjects.length <= 5);

  // Review mode
  if (reviewSubjectId) {
    const subject = subjectMap.get(reviewSubjectId);
    const baseCards = reviewMode === 'due'
      ? dueCards.filter((c) => c.subjectId === reviewSubjectId)
      : flashcards.filter((c) => c.subjectId === reviewSubjectId);
    if (subject && baseCards.length > 0) {
      return (
        <FlashcardView
          cards={baseCards}
          subject={subject}
          onClose={() => setReviewSubjectId(null)}
          onReview={onReview}
        />
      );
    }
    setReviewSubjectId(null);
  }

  const filteredCards = flashcards.filter((c) => c.subjectId === selectedSubjectId);
  const filteredDue = dueCards.filter((c) => c.subjectId === selectedSubjectId).length;

  return (
    <div className="space-y-4">
      {/* Due cards banner */}
      {dueCount > 0 && (
        <div className="rounded-xl bg-indigo-50 border border-indigo-200 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-indigo-800">今日の復習 {dueCount}枚</p>
            <p className="text-xs text-indigo-500">期限が来たカードを復習しましょう</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const firstSubjectWithDue = bySubject.find((g) => g.dueCount > 0);
              if (firstSubjectWithDue) {
                setSelectedSubjectId(firstSubjectWithDue.subject.id);
                setReviewMode('due');
                setReviewSubjectId(firstSubjectWithDue.subject.id);
              }
            }}
          >
            <Play className="h-4 w-4 mr-1" />
            復習する
          </Button>
        </div>
      )}

      {/* Subject filter tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {bySubject.map(({ subject, cards, dueCount: dc }) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubjectId(subject.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedSubjectId === subject.id ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={selectedSubjectId === subject.id ? { backgroundColor: subject.color } : undefined}
          >
            {subject.name}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
              selectedSubjectId === subject.id ? 'bg-white/20' : 'bg-gray-200'
            }`}>
              {cards.length}
            </span>
            {dc > 0 && (
              <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white">
                {dc}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {filteredCards.length}枚
          {filteredDue > 0 && (
            <span className="ml-2 text-indigo-600 font-medium">(復習 {filteredDue}枚)</span>
          )}
        </p>
        <div className="flex gap-2">
          {filteredCards.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setReviewMode('all'); setReviewSubjectId(selectedSubjectId); }}
            >
              <Play className="h-4 w-4 mr-1" />
              全て復習
            </Button>
          )}
          <Button size="sm" onClick={() => { setEditCard(undefined); setFormOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" />
            追加
          </Button>
        </div>
      </div>

      {/* Card list */}
      {filteredCards.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500">
          <p className="text-lg">カードがありません</p>
          <p className="text-sm mt-1">「追加」ボタンからカードを作りましょう</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredCards.map((card) => {
            const isDue = card.nextReviewDate === null || card.nextReviewDate <= new Date().toISOString().slice(0, 10);
            return (
              <div key={card.id} className={`rounded-xl border bg-white p-4 shadow-sm ${isDue ? 'border-indigo-200' : ''}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 text-sm">{card.front}</p>
                      {isDue && card.repetitions > 0 && (
                        <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-600 shrink-0">復習</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{card.back}</p>
                    {card.nextReviewDate && (
                      <p className="mt-1 text-[10px] text-gray-400">次の復習: {card.nextReviewDate}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => { setEditCard(card); setFormOpen(true); }}
                      className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      aria-label="編集"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(card.id)}
                      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="削除"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <FlashcardForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditCard(undefined); }}
        subjects={subjects}
        initialSubjectId={selectedSubjectId}
        editCard={editCard}
        onSubmit={(sid, front, back) => {
          if (editCard) {
            onUpdate(editCard.id, front, back);
          } else {
            onAdd(sid, front, back);
          }
        }}
      />
    </div>
  );
}
