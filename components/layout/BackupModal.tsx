'use client';

import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { loadStorage, saveStorage } from '@/lib/storage';

interface Props {
  open: boolean;
  onClose: () => void;
  onRestored: () => void;
}

export function BackupModal({ open, onClose, onRestored }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const data = loadStorage();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `study-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (!parsed.subjects || !parsed.sessions) {
          alert('無効なバックアップファイルです');
          return;
        }
        saveStorage(parsed);
        onRestored();
        onClose();
        alert('データを復元しました。ページを再読み込みします。');
        window.location.reload();
      } catch {
        alert('ファイルの読み込みに失敗しました');
      }
    };
    reader.readAsText(file);
    // reset input
    if (fileRef.current) fileRef.current.value = '';
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>データのバックアップ・復元</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">エクスポート</p>
            <p className="text-xs text-gray-500">
              現在のデータ（教科・学習記録・テスト・カード・バッジ）をJSONファイルとして保存します。
            </p>
            <Button onClick={handleExport} className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              JSONファイルをダウンロード
            </Button>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">インポート</p>
            <p className="text-xs text-gray-500">
              バックアップファイルからデータを復元します。現在のデータは上書きされます。
            </p>
            <Button
              onClick={() => fileRef.current?.click()}
              className="w-full"
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              JSONファイルを選択
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>

          <p className="text-xs text-gray-400 text-center">
            ⚠️ ブラウザのデータ削除やキャッシュクリアでデータが消える場合があります。定期的にバックアップを取ることをおすすめします。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
