'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Subject, StudySession, SubjectGoal, WeeklySchedule } from '@/lib/types';
import { SubjectCard } from './SubjectCard';
import { SubjectForm } from './SubjectForm';
import { WeeklyPlannerSection } from './WeeklyPlannerSection';
import { Button } from '@/components/ui/button';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
  schedule: WeeklySchedule[];
  onAdd: (name: string, weaknessLevel: 1 | 2 | 3 | 4 | 5) => void;
  onWeaknessChange: (id: string, level: 1 | 2 | 3 | 4 | 5) => void;
  onGoalChange: (subjectId: string, weeklyMinutes: number) => void;
  onDelete: (id: string) => void;
  onSetSchedule: (subjectId: string, days: number[]) => void;
}

type Tab = 'subjects' | 'planner';

export function SubjectsPage({ subjects, sessions, goals, schedule, onAdd, onWeaknessChange, onGoalChange, onDelete, onSetSchedule }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('subjects');
  const goalMap = new Map(goals.map((g) => [g.subjectId, g]));

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {([['subjects', '教科一覧'], ['planner', '週次プラン']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
              tab === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'subjects' ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{subjects.length}教科登録中</p>
            <Button size="sm" onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              追加
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subjects.map((s) => (
              <SubjectCard
                key={s.id}
                subject={s}
                sessions={sessions}
                goal={goalMap.get(s.id)}
                onWeaknessChange={onWeaknessChange}
                onGoalChange={onGoalChange}
                onDelete={onDelete}
              />
            ))}
          </div>

          <SubjectForm
            open={formOpen}
            onClose={() => setFormOpen(false)}
            onSubmit={onAdd}
          />
        </>
      ) : (
        <WeeklyPlannerSection
          subjects={subjects}
          schedule={schedule}
          onSetSchedule={onSetSchedule}
        />
      )}
    </div>
  );
}
