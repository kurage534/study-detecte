/* eslint-disable @typescript-eslint/no-explicit-any */
const STUDY_CACHE_NAME = 'study-status-v1';
const STUDY_STATUS_KEY = '/study-status';

const sw = self as any;

sw.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'daily-study-reminder') {
    event.waitUntil(sendDailyReminder());
  }
});

async function sendDailyReminder(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const cache = await caches.open(STUDY_CACHE_NAME);
    const response = await cache.match(STUDY_STATUS_KEY);
    if (response) {
      const data = (await response.json()) as { lastStudyDate?: string };
      if (data.lastStudyDate === today) return;
    }
    await sw.registration.showNotification('今日はまだ勉強していません 📚', {
      body: '学習を記録して習慣を続けましょう！',
      icon: '/icon.png',
      tag: 'daily-study-reminder',
    });
  } catch {
    // ignore
  }
}
