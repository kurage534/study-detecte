'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Subject, StudySession, SubjectGoal } from '@/lib/types';
import { WeaknessRating } from './WeaknessRating';
import { computeRecommendations } from '@/lib/recommendation';

interface Props {
  subject: Subject;
  sessions: StudySession[];
  goal?: SubjectGoal;
  onWeaknessChange: (id: string, level: 1 | 2 | 3 | 4 | 5) => void;
  onGoalChange: (subjectId: string, weeklyMinutes: number) => void;
  onDelete: (id: string) => void;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export function SubjectCard({ subject, sessions, goal, onWeaknessChange, onGoalChange, onDelete }: Props) {
  const [meta] = computeRecommendations([subject], sessions);
  const [goalInput, setGoalInput] = useState(goal?.weeklyMinutes?.toString() ?? '');

  function handleGoalBlur() {
    const v = parseInt(goalInput, 10);
    onGoalChange(subject.id, isNaN(v) || v <= 0 ? 0 : v);
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: subject.color }}
          />
          <span className="font-semibold text-gray-900 truncate">{subject.name}</span>
          {subject.isPreset && (
            <span className="text-xs text-gray-400 shrink-0">標準</span>
          )}
        </div>
        {!subject.isPreset && (
          <button
            onClick={() => onDelete(subject.id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-0.5"
            aria-label={`${subject.name}を削除`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <WeaknessRating
        value={subject.weaknessLevel}
        onChange={(v) => onWeaknessChange(subject.id, v)}
      />

      <div className="mt-3 flex items-center gap-2">
        <span className="text-xs text-gray-500 shrink-0">週目標</span>
        <input
          type="number"
          min={0}
          value={goalInput}
          onChange={(e) => setGoalInput(e.target.value)}
          onBlur={handleGoalBlur}
          placeholder="分"
          className="w-16 rounded border border-gray-200 px-2 py-0.5 text-xs text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
        <span className="text-xs text-gray-500">分/週</span>
      </div>

      <div className="mt-2 flex gap-4 text-xs text-gray-500">
        <span>累計: {formatMinutes(meta?.totalMinutes ?? 0)}</span>
        <span>
          最終:{' '}
          {meta?.lastStudiedDate
            ? new Date(meta.lastStudiedDate).toLocaleDateString('ja-JP', {
                month: 'short',
                day: 'numeric',
              })
            : '未学習'}
        </span>
      </div>
    </div>
  );
}
