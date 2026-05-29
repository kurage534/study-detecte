'use client';

import { useState, useEffect } from 'react';
import type { Subject, Flashcard } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Props {
  open: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectId?: string;
  editCard?: Flashcard;
  onSubmit: (subjectId: string, front: string, back: string) => void;
}

export function FlashcardForm({ open, onClose, subjects, initialSubjectId, editCard, onSubmit }: Props) {
  const [subjectId, setSubjectId] = useState(initialSubjectId ?? subjects[0]?.id ?? '');
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  useEffect(() => {
    if (editCard) {
      setSubjectId(editCard.subjectId);
      setFront(editCard.front);
      setBack(editCard.back);
    } else {
      setFront('');
      setBack('');
      setSubjectId(initialSubjectId ?? subjects[0]?.id ?? '');
    }
  }, [editCard, initialSubjectId, subjects, open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subjectId || !front.trim() || !back.trim()) return;
    onSubmit(subjectId, front, back);
    setFront('');
    setBack('');
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>{editCard ? 'カードを編集' : 'カードを追加'}</DialogTitle>
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
                      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                      {s.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">表（問題・用語）</label>
            <textarea
              value={front}
              onChange={(e) => setFront(e.target.value)}
              rows={3}
              autoFocus
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="例: 光合成とは？"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">裏（答え・説明）</label>
            <textarea
              value={back}
              onChange={(e) => setBack(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="例: 植物が光エネルギーを使って二酸化炭素と水から有機物を合成する反応"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>キャンセル</Button>
            <Button type="submit" className="flex-1" disabled={!front.trim() || !back.trim()}>
              {editCard ? '保存' : '追加'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
