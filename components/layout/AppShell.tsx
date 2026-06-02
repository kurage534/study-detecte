'use client';

import { useState } from 'react';
import type { TabId } from '@/lib/types';
import { useSubjects } from '@/hooks/useSubjects';
import { useSessions } from '@/hooks/useSessions';
import { useGoals } from '@/hooks/useGoals';
import { useExamRecords } from '@/hooks/useExamRecords';
import { useNotification } from '@/hooks/useNotification';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useWeeklySchedule } from '@/hooks/useWeeklySchedule';
import { TabBar } from './TabBar';
import { BackupModal } from './BackupModal';
import { TodayPage } from '@/components/today/TodayPage';
import { TimerPage } from '@/components/timer/TimerPage';
import { SubjectsPage } from '@/components/subjects/SubjectsPage';
import { CardsPage } from '@/components/cards/CardsPage';
import { SessionsPage } from '@/components/sessions/SessionsPage';
import { StatsPage } from '@/components/stats/StatsPage';
import { BADGE_META } from '@/lib/constants';

const TAB_TITLES: Record<TabId, string> = {
  today:    '今日の学習',
  timer:    'タイマー',
  subjects: '教科管理',
  cards:    '暗記カード',
  sessions: '学習記録',
  stats:    '統計',
};

export function AppShell() {
  const [activeTab, setActiveTab] = useState<TabId>('today');
  const [backupOpen, setBackupOpen] = useState(false);
  const { subjects, addSubject, updateSubjectWeakness, deleteSubject } = useSubjects();
  const { sessions, addSession, deleteSession } = useSessions();
  const { goals, earnedBadges, newBadge, setGoal, dismissNewBadge } = useGoals(subjects, sessions);
  const { examRecords, addExamRecord, deleteExamRecord } = useExamRecords();
  const { showBanner, requestPermission, dismissBanner, permission: notifPermission, notifEnabled, toggleNotification } = useNotification(sessions);
  const { flashcards, addFlashcard, updateFlashcard, deleteFlashcard, reviewFlashcard } = useFlashcards();
  const { schedule, setSubjectSchedule, getTodaySchedule } = useWeeklySchedule();

  const scheduledTodayIds = getTodaySchedule();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
          <button
            onClick={() => setBackupOpen(true)}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="バックアップ・復元"
            title="バックアップ・復元"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      {showBanner && (
        <div className="border-b border-indigo-100 bg-indigo-50 px-4 py-2">
          <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
            <p className="text-sm text-indigo-700">🔔 学習リマインダーを有効にしますか？</p>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={requestPermission}
                className="rounded-full bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700"
              >
                有効にする
              </button>
              <button onClick={dismissBanner} className="text-xs text-indigo-400 hover:text-indigo-600">✕</button>
            </div>
          </div>
        </div>
      )}

      {newBadge && (
        <div className="cursor-pointer border-b border-amber-100 bg-amber-50 px-4 py-2" onClick={dismissNewBadge}>
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <span className="text-2xl">{BADGE_META[newBadge.type].emoji}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-800">バッジ獲得！{BADGE_META[newBadge.type].label}</p>
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
            goals={goals}
            scheduledTodayIds={scheduledTodayIds}
            onAddSession={addSession}
          />
        )}
        {activeTab === 'timer' && (
          <TimerPage subjects={subjects} onAddSession={addSession} />
        )}
        {activeTab === 'subjects' && (
          <SubjectsPage
            subjects={subjects}
            sessions={sessions}
            goals={goals}
            schedule={schedule}
            onAdd={addSubject}
            onWeaknessChange={updateSubjectWeakness}
            onGoalChange={setGoal}
            onDelete={deleteSubject}
            onSetSchedule={setSubjectSchedule}
          />
        )}
        {activeTab === 'cards' && (
          <CardsPage
            subjects={subjects}
            flashcards={flashcards}
            onAdd={addFlashcard}
            onUpdate={updateFlashcard}
            onDelete={deleteFlashcard}
            onReview={reviewFlashcard}
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

      <BackupModal
        open={backupOpen}
        onClose={() => setBackupOpen(false)}
        onRestored={() => {}}
        notifPermission={notifPermission}
        notifEnabled={notifEnabled}
        onRequestPermission={requestPermission}
        onToggleNotification={toggleNotification}
      />
    </div>
  );
}
