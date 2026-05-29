'use client';

import { useState } from 'react';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';
import type { Subject, StudySession, ExamRecord } from '@/lib/types';
import { SessionForm } from './SessionForm';
import { SessionList } from './SessionList';
import { ExamForm } from './ExamForm';
import { Button } from '@/components/ui/button';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  examRecords: ExamRecord[];
  onAdd: (subjectId: string, durationMinutes: number, date: string, notes: string) => void;
  onDelete: (id: string) => void;
  onAddExam: (subjectId: string, examName: string, score: number, maxScore: number, date: string) => void;
  onDeleteExam: (id: string) => void;
}

interface ExamListProps {
  examRecords: ExamRecord[];
  subjects: Subject[];
  onDelete: (id: string) => void;
}

function ExamList({ examRecords, subjects, onDelete }: ExamListProps) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const sorted = [...examRecords].sort((a, b) => b.date.localeCompare(a.date));

  if (sorted.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-500">
        <p className="text-lg">テスト記録がありません</p>
        <p className="text-sm mt-1">上のボタンからテスト結果を記録しましょう</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sorted.map((r) => {
        const subject = subjectMap.get(r.subjectId);
        const pct = Math.round((r.score / r.maxScore) * 100);
        return (
          <div key={r.id} className="flex items-center gap-3 rounded-lg border bg-white p-3">
            <span
              className="h-3 w-3 rounded-full shrink-0"
              style={{ backgroundColor: subject?.color ?? '#ccc' }}
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900 truncate">{r.examName}</p>
              <p className="text-xs text-gray-500">{subject?.name} · {r.date}</p>
            </div>
            <span className="text-sm font-medium text-gray-900 shrink-0">
              {r.score}/{r.maxScore}
            </span>
            <span
              className={`text-sm font-medium shrink-0 ${
                pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'
              }`}
            >
              {pct}%
            </span>
            <button
              onClick={() => onDelete(r.id)}
              className="text-gray-300 hover:text-red-500 transition-colors p-0.5"
              aria-label="削除"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function SessionsPage({ subjects, sessions, examRecords, onAdd, onDelete, onAddExam, onDeleteExam }: Props) {
  const [formOpen, setFormOpen] = useState(false);
  const [examFormOpen, setExamFormOpen] = useState(false);
  const [tab, setTab] = useState<'study' | 'exam'>('study');

  const totalMinutes = sessions.reduce((s, r) => s + r.durationMinutes, 0);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['study', 'exam'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {t === 'study' ? '学習記録' : 'テスト結果'}
          </button>
        ))}
      </div>

      {tab === 'study' && (
        <>
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
        </>
      )}

      {tab === 'exam' && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{examRecords.length}件の記録</p>
            <Button size="sm" onClick={() => setExamFormOpen(true)} disabled={subjects.length === 0}>
              <ClipboardList className="h-4 w-4 mr-1" />
              テストを記録
            </Button>
          </div>
          <ExamList examRecords={examRecords} subjects={subjects} onDelete={onDeleteExam} />
          <ExamForm
            open={examFormOpen}
            onClose={() => setExamFormOpen(false)}
            subjects={subjects}
            onSubmit={onAddExam}
          />
        </>
      )}
    </div>
  );
}
