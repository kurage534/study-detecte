'use client';

import { useState } from 'react';
import type { SubjectWithMeta, Subject } from '@/lib/types';
import { getPriorityLabel } from '@/lib/recommendation';
import { WeaknessRating } from '@/components/subjects/WeaknessRating';
import { SessionForm } from '@/components/sessions/SessionForm';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface Props {
  item: SubjectWithMeta;
  rank: number;
  subjects: Subject[];
  onAddSession: (subjectId: string, durationMinutes: number, date: string, notes: string) => void;
}


function formatLastStudied(days: number): string {
  if (!isFinite(days)) return '未学習';
  if (days === 0) return '今日';
  if (days === 1) return '昨日';
  return `${days}日前`;
}

export function RecommendationCard({ item, rank, subjects, onAddSession }: Props) {
  const [open, setOpen] = useState(false);
  const { label, color } = getPriorityLabel(item.priorityScore);
  const isTop3 = rank <= 3;

  return (
    <>
      <div
        className={clsx(
          'rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md',
          isTop3 && 'border-indigo-200 ring-1 ring-indigo-100'
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-lg font-bold text-gray-300 w-5 shrink-0">#{rank}</span>
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-gray-900 truncate">{item.name}</span>
            {isTop3 && (
              <span className="shrink-0 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                おすすめ
              </span>
            )}
            {item.isScheduledToday && (
              <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                今日の予定
              </span>
            )}
          </div>
          <span className={clsx('shrink-0 text-sm font-medium', color)}>{label}</span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="space-y-1">
            <WeaknessRating value={item.weaknessLevel} readonly size="sm" />
            <p className="text-xs text-gray-500">
              最終学習: {formatLastStudied(item.daysSinceLastStudy)}
            </p>
          </div>
          <Button size="sm" onClick={() => setOpen(true)}>
            記録する
          </Button>
        </div>
      </div>

      <SessionForm
        open={open}
        onClose={() => setOpen(false)}
        subjects={subjects}
        initialSubjectId={item.id}
        onSubmit={onAddSession}
      />
    </>
  );
}
