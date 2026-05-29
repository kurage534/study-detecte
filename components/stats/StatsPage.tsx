'use client';

import { useState } from 'react';
import type { Subject, StudySession } from '@/lib/types';
import { getStudyStreak, getTotalStudyDays, getDailySummaries, getSubjectTotals } from '@/lib/stats';
import { StreakCard } from './StreakCard';
import { WeeklyChart } from './WeeklyChart';
import { SubjectTimeChart } from './SubjectTimeChart';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
}

type Period = 'week' | 'month';

export function StatsPage({ subjects, sessions }: Props) {
  const [period, setPeriod] = useState<Period>('week');

  const streak = getStudyStreak(sessions);
  const totalDays = getTotalStudyDays(sessions);
  const days = period === 'week' ? 7 : 30;
  const dailySummaries = getDailySummaries(sessions, days);

  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);
  const subjectTotals = getSubjectTotals(subjects, sessions, since);

  return (
    <div className="space-y-5">
      <StreakCard streak={streak} totalDays={totalDays} />

      <div className="flex gap-2">
        {(['week', 'month'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              period === p
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {p === 'week' ? '1週間' : '1ヶ月'}
          </button>
        ))}
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">日別学習時間（分）</h3>
        <WeeklyChart data={dailySummaries} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">教科別学習時間</h3>
        <SubjectTimeChart data={subjectTotals} />
      </div>
    </div>
  );
}
