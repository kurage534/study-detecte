'use client';

import { Trash2 } from 'lucide-react';
import type { Subject, StudySession } from '@/lib/types';

interface Props {
  sessions: StudySession[];
  subjects: Subject[];
  onDelete: (id: string) => void;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  });
}

export function SessionList({ sessions, subjects, onDelete }: Props) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const sorted = [...sessions].sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.createdAt.localeCompare(a.createdAt);
  });

  // Group by date
  const groups: Map<string, StudySession[]> = new Map();
  for (const s of sorted) {
    const list = groups.get(s.date) ?? [];
    list.push(s);
    groups.set(s.date, list);
  }

  if (sessions.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500">
        <p className="text-lg">記録がありません</p>
        <p className="text-sm mt-1">上のボタンから学習を記録しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Array.from(groups.entries()).map(([date, items]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-medium text-gray-500">{formatDate(date)}</p>
          <div className="space-y-2">
            {items.map((session: StudySession) => {
              const subject = subjectMap.get(session.subjectId);
              return (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-lg border bg-white p-3"
                >
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: subject?.color ?? '#ccc' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900">
                      {subject?.name ?? '削除された教科'}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-gray-500 truncate">{session.notes}</p>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 shrink-0">
                    {formatMinutes(session.durationMinutes)}
                  </span>
                  <button
                    onClick={() => onDelete(session.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
