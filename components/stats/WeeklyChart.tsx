'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { DailySummary } from '@/lib/types';

interface Props {
  data: DailySummary[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function WeeklyChart({ data }: Props) {
  const chartData = data.map((d) => ({
    date: formatDateLabel(d.date),
    分: d.totalMinutes,
  }));

  const hasData = data.some((d) => d.totalMinutes > 0);

  if (!hasData) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
        学習記録がありません
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} unit="分" />
        <Tooltip formatter={(v) => [`${v}分`, '学習時間']} />
        <Line
          type="monotone"
          dataKey="分"
          stroke="#6366f1"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
