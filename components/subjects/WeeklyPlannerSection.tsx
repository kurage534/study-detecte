'use client';

import type { Subject, WeeklySchedule } from '@/lib/types';

interface Props {
  subjects: Subject[];
  schedule: WeeklySchedule[];
  onSetSchedule: (subjectId: string, days: number[]) => void;
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function WeeklyPlannerSection({ subjects, schedule, onSetSchedule }: Props) {
  const scheduleMap = new Map(schedule.map((s) => [s.subjectId, s.days]));

  function toggleDay(subjectId: string, day: number) {
    const current = scheduleMap.get(subjectId) ?? [];
    const next = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort();
    onSetSchedule(subjectId, next);
  }

  if (subjects.length === 0) {
    return (
      <p className="text-sm text-gray-400 text-center py-4">教科を追加してからプランを設定できます</p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Day header */}
      <div className="flex items-center">
        <div className="w-16 shrink-0" />
        {DAY_LABELS.map((label, i) => (
          <div
            key={i}
            className={`flex-1 text-center text-xs font-medium ${
              i === new Date().getDay() ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Subject rows */}
      {subjects.map((subject) => {
        const days = scheduleMap.get(subject.id) ?? [];
        return (
          <div key={subject.id} className="flex items-center">
            <div className="w-16 shrink-0 flex items-center gap-1.5 pr-2">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: subject.color }} />
              <span className="text-xs text-gray-700 truncate">{subject.name}</span>
            </div>
            {DAY_LABELS.map((_, i) => {
              const isOn = days.includes(i);
              const isToday = i === new Date().getDay();
              return (
                <button
                  key={i}
                  onClick={() => toggleDay(subject.id, i)}
                  className={`flex-1 mx-0.5 h-8 rounded-md text-xs font-medium transition-colors ${
                    isOn
                      ? 'text-white'
                      : isToday
                      ? 'bg-indigo-50 text-indigo-300 border border-indigo-200'
                      : 'bg-gray-100 text-gray-300 hover:bg-gray-200'
                  }`}
                  style={isOn ? { backgroundColor: subject.color } : undefined}
                  aria-label={`${subject.name} ${DAY_LABELS[i]}`}
                >
                  {isOn ? '✓' : ''}
                </button>
              );
            })}
          </div>
        );
      })}

      <p className="text-xs text-gray-400 pt-1">
        タップで曜日を設定。今日（{DAY_LABELS[new Date().getDay()]}曜日）に設定した教科は「今日」タブで強調表示されます。
      </p>
    </div>
  );
}
