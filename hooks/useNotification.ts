'use client';

import { useState, useEffect } from 'react';
import type { StudySession } from '@/lib/types';

const NOTIF_KEY = 'study-tracker-last-notif';
const BANNER_DISMISSED_KEY = 'study-tracker-notif-dismissed';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useNotification(sessions: StudySession[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    setPermission(Notification.permission);
    setBannerDismissed(localStorage.getItem(BANNER_DISMISSED_KEY) === '1');
  }, []);

  const hasStudiedToday = sessions.some((s) => s.date === todayStr());

  // Fire notification once per day when permission is granted and not studied
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission !== 'granted') return;
    if (hasStudiedToday) return;

    const lastNotif = localStorage.getItem(NOTIF_KEY);
    const today = todayStr();
    if (lastNotif === today) return;

    localStorage.setItem(NOTIF_KEY, today);
    new Notification('学習管理アプリ', {
      body: '今日はまだ学習を記録していません。頑張りましょう！',
      icon: '/icon.png',
    });
  }, [hasStudiedToday]);

  async function requestPermission() {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result);
  }

  function dismissBanner() {
    localStorage.setItem(BANNER_DISMISSED_KEY, '1');
    setBannerDismissed(true);
  }

  const showBanner =
    !bannerDismissed &&
    permission === 'default' &&
    typeof Notification !== 'undefined';

  return { permission, hasStudiedToday, showBanner, requestPermission, dismissBanner };
}
