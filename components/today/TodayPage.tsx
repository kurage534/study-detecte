'use client';

import type { Subject, StudySession, SubjectGoal } from '@/lib/types';
import { computeRecommendations } from '@/lib/recommendation';
import { RecommendationCard } from './RecommendationCard';
import { CoachPanel } from '@/components/ai/CoachPanel';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
  scheduledTodayIds: string[];
  onAddSession: (subjectId: string, durationMinutes: number, date: string, notes: string) => void;
}

export function TodayPage({ subjects, sessions, goals, scheduledTodayIds, onAddSession }: Props) {
  const recommendations = computeRecommendations(subjects, sessions, scheduledTodayIds);
  const today = new Date().toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">{today}</p>

      {recommendations.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500">
          <p className="text-lg">教科が登録されていません</p>
          <p className="text-sm mt-1">「教科」タブから追加してください</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((item, i) => (
            <RecommendationCard
              key={item.id}
              item={item}
              rank={i + 1}
              subjects={subjects}
              onAddSession={onAddSession}
            />
          ))}
        </div>
      )}

      <CoachPanel subjects={subjects} sessions={sessions} goals={goals} />
    </div>
  );
}
