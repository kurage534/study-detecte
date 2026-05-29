'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Subject, StudySession } from '@/lib/types';
import { SessionForm } from './SessionForm';
import { SessionList } from './SessionList';
import { Button } from '@/components/ui/button';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  onAdd: (subjectId: string, durationMinutes: number, date: string, notes: string) => void;
  onDelete: (id: string) => void;
}

export function SessionsPage({ subjects, sessions, onAdd, onDelete }: Props) {
  const [formOpen, setFormOpen] = useState(false);

  const totalMinutes = sessions.reduce((s, r) => s + r.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          累計: {hours > 0 ? `${hours}時間` : ''}{mins > 0 ? `${mins}分` : hours === 0 ? '0分' : ''}
        </p>
        <Button size="sm" onClick={() => setFormOpen(true)} disabled={subjects.length === 0}>
          <Plus className="h-4 w-4 mr-1" />
          記録を追加
        </Button>
      </div>

      <SessionList sessions={sessions} subjects={subjects} onDelete={onDelete} />

      <SessionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        subjects={subjects}
        onSubmit={onAdd}
      />
    </div>
  );
}
