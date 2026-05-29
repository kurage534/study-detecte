'use client';

import type { StudySession } from '@/lib/types';

interface Props {
  sessions: StudySession[];
}

export function StudyCalendar({ sessions }: Props) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build 84-day window (12 weeks), starting on Sunday
  const endDate = new Date(today);
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 83);

  // Align start to Sunday
  const startDow = startDate.getDay();
  startDate.setDate(startDate.getDate() - startDow);

  // Aggregate minutes per date
  const minutesByDate: Record<string, number> = {};
  for (const s of sessions) {
    const d = s.date.slice(0, 10);
    minutesByDate[d] = (minutesByDate[d] ?? 0) + s.durationMinutes;
  }

  // Build grid: array of weeks (columns), each with 7 days
  const weeks: { date: Date; dateStr: string }[][] = [];
  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    const week: { date: Date; dateStr: string }[] = [];
    for (let d = 0; d < 7; d++) {
      week.push({ date: new Date(cursor), dateStr: cursor.toISOString().slice(0, 10) });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const maxMinutes = Math.max(1, ...Object.values(minutesByDate));

  function getColor(dateStr: string, date: Date): string {
    if (date > endDate) return 'transparent';
    const mins = minutesByDate[dateStr] ?? 0;
    if (mins === 0) return '#e5e7eb'; // gray-200
    const ratio = mins / maxMinutes;
    if (ratio < 0.25) return '#c7d2fe'; // indigo-200
    if (ratio < 0.5)  return '#818cf8'; // indigo-400
    if (ratio < 0.75) return '#4f46e5'; // indigo-600
    return '#3730a3'; // indigo-800
  }

  const DOW_LABELS = ['日', '', '火', '', '木', '', '土'];
  const totalDays = Object.keys(minutesByDate).length;
  const totalMinutes = Object.values(minutesByDate).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-1 overflow-x-auto">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-0.5 shrink-0">
          {DOW_LABELS.map((l, i) => (
            <div key={i} className="h-3 w-4 text-[9px] text-gray-400 flex items-center justify-end pr-0.5">
              {l}
            </div>
          ))}
        </div>
        {/* Heatmap grid */}
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5 shrink-0">
            {week.map(({ date, dateStr }, di) => {
              const mins = minutesByDate[dateStr] ?? 0;
              const isFuture = date > endDate;
              return (
                <div
                  key={di}
                  className="h-3 w-3 rounded-sm"
                  style={{ backgroundColor: getColor(dateStr, date) }}
                  title={isFuture ? '' : `${dateStr}: ${mins}分`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{totalDays}日間学習 · 計{Math.floor(totalMinutes / 60)}時間{totalMinutes % 60}分</span>
        <div className="flex items-center gap-1">
          <span>少</span>
          {['#e5e7eb', '#c7d2fe', '#818cf8', '#4f46e5', '#3730a3'].map((c) => (
            <div key={c} className="h-3 w-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span>多</span>
        </div>
      </div>
    </div>
  );
}
