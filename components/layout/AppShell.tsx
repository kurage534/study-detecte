'use client';

import { useState } from 'react';
import type { TabId } from '@/lib/types';
import { useSubjects } from '@/hooks/useSubjects';
import { useSessions } from '@/hooks/useSessions';
import { TabBar } from './TabBar';
import { TodayPage } from '@/components/today/TodayPage';
import { SubjectsPage } from '@/components/subjects/SubjectsPage';
import { SessionsPage } from '@/components/sessions/SessionsPage';
import { StatsPage } from '@/components/stats/StatsPage';

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-lg">
          <h1 className="text-lg font-bold text-gray-900">{TAB_TITLES[activeTab]}</h1>
        </div>
      </header>

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
            onAdd={addSubject}
            onWeaknessChange={updateSubjectWeakness}
            onDelete={deleteSubject}
          />
        )}
        {activeTab === 'sessions' && (
          <SessionsPage
            subjects={subjects}
            sessions={sessions}
            onAdd={addSession}
            onDelete={deleteSession}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPage subjects={subjects} sessions={sessions} />
        )}
      </main>

      <TabBar activeTab={activeTab} onChange={setActiveTab} />
    </div>
  );
}
