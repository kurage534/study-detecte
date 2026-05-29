'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Subject, StudySession, SubjectGoal } from '@/lib/types';
import { SubjectCard } from './SubjectCard';
import { SubjectForm } from './SubjectForm';
import { Button } from '@/components/ui/button';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
  onAdd: (name: string, weaknessLevel: 1 | 2 | 3 | 4 | 5) => void;
  onWeaknessChange: (id: string, level: 1 | 2 | 3 | 4 | 5) => void;
  onGoalChange: (subjectId: string, weeklyMinutes: number) => void;
  onDelete: (id: string) => void;
}

export function SubjectsPage({ subjects, sessions, goals, onAdd, onWeaknessChange, onGoalChange, onDelete }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const goalMap = new Map(goals.map((g) => [g.subjectId, g]));

  return (
    <div className="space-y-4">
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
    </div>
  );
}
