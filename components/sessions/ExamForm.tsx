'use client';

import { useState } from 'react';
import type { Subject } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  onSubmit: (
    subjectId: string,
    examName: string,
    score: number,
    maxScore: number,
    date: string
  ) => void;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function ExamForm({ open, onClose, subjects, onSubmit }: Props) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [examName, setExamName] = useState('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [date, setDate] = useState(todayStr());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const s = parseFloat(score);
    const m = parseFloat(maxScore);
    if (!subjectId || !examName.trim() || isNaN(s) || isNaN(m) || m <= 0 || s < 0 || s > m) return;
    onSubmit(subjectId, examName.trim(), s, m, date);
    setExamName('');
    setScore('');
    setMaxScore('100');
    setDate(todayStr());
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>テスト結果を記録</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">教科</label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="教科を選択" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">試験名</label>
            <input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: 期末テスト、模擬試験..."
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">点数</label>
              <input
                type="number"
                min={0}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="85"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">満点</label>
              <input
                type="number"
                min={1}
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="100"
              />
            </div>
          </div>

          {score && maxScore && parseFloat(maxScore) > 0 && (
            <p className="text-center text-sm font-medium text-indigo-600">
              正答率: {Math.round((parseFloat(score) / parseFloat(maxScore)) * 100)}%
            </p>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!subjectId || !examName.trim() || !score || !maxScore}
            >
              記録する
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
