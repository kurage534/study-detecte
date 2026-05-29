'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Check, X } from 'lucide-react';
import type { Flashcard, Subject } from '@/lib/types';

interface Props {
  cards: Flashcard[];
  subject: Subject;
  onClose: () => void;
}

export function FlashcardView({ cards, subject, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<Record<string, 'ok' | 'ng'>>({});
  const [finished, setFinished] = useState(false);

  const card = cards[index];
  const okCount = Object.values(results).filter((v) => v === 'ok').length;
  const ngCount = Object.values(results).filter((v) => v === 'ng').length;

  function next(result?: 'ok' | 'ng') {
    if (result && card) {
      setResults((r) => ({ ...r, [card.id]: result }));
    }
    if (index + 1 >= cards.length) {
      setFinished(true);
    } else {
      setIndex((i) => i + 1);
      setFlipped(false);
    }
  }

  function restart() {
    setIndex(0);
    setFlipped(false);
    setResults({});
    setFinished(false);
  }

  if (finished) {
    return (
      <div className="flex flex-col items-center space-y-6 py-8">
        <div
          className="h-14 w-14 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: subject.color + '22' }}
        >
          🎉
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">完了！</p>
          <p className="text-sm text-gray-500 mt-1">{cards.length}枚を復習しました</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">{okCount}</p>
            <p className="text-xs text-gray-500">覚えた</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-red-500">{ngCount}</p>
            <p className="text-xs text-gray-500">要復習</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={restart}
            className="flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <RotateCcw className="h-4 w-4" /> もう一度
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="flex flex-col items-center space-y-5">
      {/* Header */}
      <div className="flex w-full items-center justify-between">
        <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">← 戻る</button>
        <span className="text-sm text-gray-500">{index + 1} / {cards.length}</span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-gray-100">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${((index) / cards.length) * 100}%`, backgroundColor: subject.color }}
        />
      </div>

      {/* Card */}
      <div
        className="relative w-full cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => setFlipped((f) => !f)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            minHeight: '220px',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 bg-white p-6 shadow-md"
            style={{ backfaceVisibility: 'hidden', borderColor: subject.color + '44' }}
          >
            <span className="mb-3 text-xs font-medium uppercase tracking-wider text-gray-400">問題</span>
            <p className="text-center text-lg font-medium text-gray-900">{card.front}</p>
            <p className="mt-4 text-xs text-gray-400">タップで答えを確認</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border-2 p-6 shadow-md"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundColor: subject.color + '11',
              borderColor: subject.color + '66',
            }}
          >
            <span className="mb-3 text-xs font-medium uppercase tracking-wider" style={{ color: subject.color }}>答え</span>
            <p className="text-center text-lg font-medium text-gray-900">{card.back}</p>
          </div>
        </div>
      </div>

      {/* Result buttons (visible after flip) */}
      {flipped ? (
        <div className="flex w-full gap-3">
          <button
            onClick={() => next('ng')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-red-200 bg-red-50 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
          >
            <X className="h-4 w-4" /> もう一度
          </button>
          <button
            onClick={() => next('ok')}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 py-3 text-sm font-medium text-green-600 hover:bg-green-100 transition-colors"
          >
            <Check className="h-4 w-4" /> 覚えた
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <button
            onClick={() => { setIndex((i) => Math.max(0, i - 1)); setFlipped(false); }}
            disabled={index === 0}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => next()}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
