'use client';

import { useState } from 'react';
import type { Subject, StudySession, SubjectGoal, EarnedBadge, ExamRecord } from '@/lib/types';
import { getStudyStreak, getTotalStudyDays, getDailySummaries, getSubjectTotals } from '@/lib/stats';
import { StreakCard } from './StreakCard';
import { WeeklyChart } from './WeeklyChart';
import { SubjectTimeChart } from './SubjectTimeChart';
import { GoalProgressSection } from './GoalProgressSection';
import { BadgeGrid } from './BadgeGrid';
import { ExamScoreChart } from './ExamScoreChart';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
  earnedBadges: EarnedBadge[];
  examRecords: ExamRecord[];
}

type Period = 'week' | 'month';

export function StatsPage({ subjects, sessions, goals, earnedBadges, examRecords }: Props) {
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
    <div className="space-y-6">
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

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">週の目標達成状況</h3>
        <GoalProgressSection subjects={subjects} sessions={sessions} goals={goals} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">テスト結果</h3>
        <ExamScoreChart examRecords={examRecords} subjects={subjects} />
      </div>

      <div>
        <h3 className="mb-2 text-sm font-medium text-gray-700">獲得バッジ ({earnedBadges.length})</h3>
        <BadgeGrid badges={earnedBadges} subjects={subjects} />
      </div>
    </div>
  );
}
