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
  initialSubjectId?: string;
  onSubmit: (subjectId: string, durationMinutes: number, date: string, notes: string) => void;
}

const QUICK_MINUTES = [15, 30, 45, 60, 90, 120];

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function SessionForm({ open, onClose, subjects, initialSubjectId, onSubmit }: Props) {
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? subjects[0]?.id ?? '');
  const [duration, setDuration] = useState('30');
  const [date, setDate] = useState(todayStr());
  const [notes, setNotes] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const mins = parseInt(duration, 10);
    if (!subjectId || isNaN(mins) || mins <= 0) return;
    onSubmit(subjectId, mins, date, notes);
    setDuration('30');
    setNotes('');
    setDate(todayStr());
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>学習を記録</DialogTitle>
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
            <label className="text-sm font-medium text-gray-700">学習時間（分）</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {QUICK_MINUTES.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setDuration(String(m))}
                  className={`rounded-full px-3 py-0.5 text-xs border transition-colors ${
                    duration === String(m)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'border-gray-300 text-gray-600 hover:border-indigo-400'
                  }`}
                >
                  {m}分
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="分"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">日付</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">メモ（任意）</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="学習内容など..."
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" className="flex-1">
              記録する
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
