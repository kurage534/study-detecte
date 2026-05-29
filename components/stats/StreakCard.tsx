import { Flame, CalendarCheck } from 'lucide-react';

interface Props {
  streak: number;
  totalDays: number;
}

export function StreakCard({ streak, totalDays }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
        <Flame className="h-6 w-6 mx-auto mb-1 text-orange-500" />
        <p className="text-3xl font-bold text-gray-900">{streak}</p>
        <p className="text-xs text-gray-500 mt-0.5">連続学習日数</p>
      </div>
      <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
        <CalendarCheck className="h-6 w-6 mx-auto mb-1 text-indigo-500" />
        <p className="text-3xl font-bold text-gray-900">{totalDays}</p>
        <p className="text-xs text-gray-500 mt-0.5">累計学習日数</p>
      </div>
    </div>
  );
}
