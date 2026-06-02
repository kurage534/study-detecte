'use client';

import { useState, useEffect } from 'react';
import type { StudySession } from '@/lib/types';

const NOTIF_KEY = 'study-tracker-last-notif';
const BANNER_DISMISSED_KEY = 'study-tracker-notif-dismissed';
const STUDY_CACHE_NAME = 'study-status-v1';
const STUDY_STATUS_KEY = '/study-status';

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

async function updateStudyCache(studiedToday: boolean): Promise<void> {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  if (!studiedToday) return;
  try {
    const cache = await caches.open(STUDY_CACHE_NAME);
    await cache.put(
      STUDY_STATUS_KEY,
      new Response(JSON.stringify({ lastStudyDate: todayStr() }), {
        headers: { 'Content-Type': 'application/json' },
      })
    );
  } catch { /* ignore */ }
}

async function registerPeriodicSync(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ps = (reg as any).periodicSync;
    if (!ps) return;
    await ps.register('daily-study-reminder', {
      minInterval: 24 * 60 * 60 * 1000,
    });
  } catch {
    // not supported or engagement score too low — fail silently
  }
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

  // Keep Cache API in sync so the service worker can check study status
  useEffect(() => {
    updateStudyCache(hasStudiedToday);
  }, [hasStudiedToday]);

  // Fire in-app notification once per day when app is open and not studied
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
    if (result === 'granted') {
      await registerPeriodicSync();
    }
  }

  // Register periodic sync if permission was already granted on a previous visit
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    if (Notification.permission === 'granted') {
      registerPeriodicSync();
    }
  }, []);

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
