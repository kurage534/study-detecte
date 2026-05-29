'use client';

import { useState } from 'react';
import type { TabId } from '@/lib/types';
import { useSubjects } from '@/hooks/useSubjects';
import { useSessions } from '@/hooks/useSessions';
import { useGoals } from '@/hooks/useGoals';
import { useExamRecords } from '@/hooks/useExamRecords';
import { useNotification } from '@/hooks/useNotification';
import { TabBar } from './TabBar';
import { TodayPage } from '@/components/today/TodayPage';
import { SubjectsPage } from '@/components/subjects/SubjectsPage';
import { SessionsPage } from '@/components/sessions/SessionsPage';
import { StatsPage } from '@/components/stats/StatsPage';
import { BADGE_META } from '@/lib/constants';

const TAB_TITLES: Record<TabId, string> = {
  today: '今日の学習',
  subjects: '教科管理',
  sessions: '学習記録',
  stats: '統計',
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const { subjects, addSubject, updateSubjectWeakness, deleteSubject } = useSubjects();
  const { sessions, addSession, deleteSession } = useSessions();
  const { goals, earnedBadges, newBadge, setGoal, dismissNewBadge } = useGoals(subjects, sessions);
  const { examRecords, addExamRecord, deleteExamRecord } = useExamRecords();
  const { showBanner, requestPermission, dismissBanner } = useNotification(sessions);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
        </div>
      </header>

      {/* Notification permission banner */}
      {showBanner && (
        <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-2">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <p className="text-sm text-indigo-700">
              🔔 学習リマインダーを有効にしますか？
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={requestPermission}
                className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
              >
                有効にする
              </button>
              <button
                onClick={dismissBanner}
                className="text-xs text-indigo-400 hover:text-indigo-600"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New badge toast */}
      {newBadge && (
        <div
          className="cursor-pointer border-b border-amber-100 bg-amber-50 px-4 py-2"
          onClick={dismissNewBadge}
        >
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <span className="text-2xl">{BADGE_META[newBadge.type].emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">
                バッジ獲得！{BADGE_META[newBadge.type].label}
              </p>
              <p className="text-xs text-amber-600">{BADGE_META[newBadge.type].description}</p>
            </div>
            <span className="text-xs text-amber-400">✕</span>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-lg px-4 py-4 pb-24">
        {activeTab === 'today' && (
          <TodayPage
            subjects={subjects}
            sessions={sessions}
            onAddSession={addSession}
          />
        )}
        {activeTab === 'subjects' && (
          <SubjectsPage
            subjects={subjects}
            sessions={sessions}
            goals={goals}
            onAdd={addSubject}
            onWeaknessChange={updateSubjectWeakness}
            onGoalChange={setGoal}
            onDelete={deleteSubject}
          />
        )}
        {activeTab === 'sessions' && (
          <SessionsPage
            subjects={subjects}
            sessions={sessions}
            examRecords={examRecords}
            onAdd={addSession}
            onDelete={deleteSession}
            onAddExam={addExamRecord}
            onDeleteExam={deleteExamRecord}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPage
            subjects={subjects}
            sessions={sessions}
            goals={goals}
            earnedBadges={earnedBadges}
            examRecords={examRecords}
          />
        )}
      </main>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
