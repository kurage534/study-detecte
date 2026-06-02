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
  notifPermission: NotificationPermission;
  notifEnabled: boolean;
  onRequestPermission: () => void;
  onToggleNotification: (enabled: boolean) => void;
}

export function BackupModal({ open, onClose, onRestored, notifPermission, notifEnabled, onRequestPermission, onToggleNotification }: Props) {
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
    if (fileRef.current) fileRef.current.value = '';
  }

  const notifSupported = typeof Notification !== 'undefined';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm mx-4">
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">

          {/* 通知設定 */}
          <div className="rounded-xl border bg-gray-50 p-4 space-y-3">
            <p className="text-sm font-medium text-gray-700">🔔 通知設定</p>

            {!notifSupported ? (
              <p className="text-xs text-gray-400">このブラウザは通知に対応していません</p>
            ) : notifPermission === 'denied' ? (
              <div className="space-y-1">
                <p className="text-xs text-red-500 font-medium">通知がブロックされています</p>
                <p className="text-xs text-gray-400">
                  ブラウザの設定から手動で許可してください。<br />
                  アドレスバー左の🔒アイコン → 通知 → 許可
                </p>
              </div>
            ) : notifPermission === 'default' ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-500">通知を許可すると、未学習の日にリマインダーが届きます。</p>
                <Button onClick={onRequestPermission} className="w-full" variant="outline" size="sm">
                  通知を許可する
                </Button>
              </div>
            ) : (
              /* granted */
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-700">学習リマインダー</p>
                  <p className="text-xs text-gray-400">未学習の日に通知を送る</p>
                </div>
                <button
                  onClick={() => onToggleNotification(!notifEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                  }`}
                  aria-label={notifEnabled ? '通知をオフにする' : '通知をオンにする'}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      notifEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* バックアップ */}
          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">💾 エクスポート</p>
            <p className="text-xs text-gray-500">
              教科・学習記録・テスト・カード・バッジをJSONファイルで保存します。
            </p>
            <Button onClick={handleExport} className="w-full" variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              JSONファイルをダウンロード
            </Button>
          </div>

          <div className="rounded-xl border bg-gray-50 p-4 space-y-2">
            <p className="text-sm font-medium text-gray-700">📂 インポート</p>
            <p className="text-xs text-gray-500">
              バックアップから復元します。現在のデータは上書きされます。
            </p>
            <Button
              onClick={() => fileRef.current?.click()}
              className="w-full"
              variant="outline"
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              JSONファイルを選択
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          </div>

          <p className="text-xs text-gray-400 text-center">
            ブラウザのキャッシュクリアでデータが消える場合があります。定期的にバックアップを取ってください。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
