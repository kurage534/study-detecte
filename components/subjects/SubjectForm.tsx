'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { WeaknessRating } from './WeaknessRating';

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, weaknessLevel: 1 | 2 | 3 | 4 | 5) => void;
}

export function SubjectForm({ open, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim(), level);
    setName('');
    setLevel(3);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>教科を追加</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">教科名</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例: 物理、プログラミング..."
              autoFocus
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700">苦手度</label>
            <WeaknessRating value={level} onChange={setLevel} />
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" className="flex-1" disabled={!name.trim()}>
              追加する
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
