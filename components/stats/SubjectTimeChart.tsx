'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import type { SubjectTotals } from '@/lib/types';

interface Props {
  data: SubjectTotals[];
}

export function SubjectTimeChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
        学習記録がありません
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.subjectName,
    分: d.totalMinutes,
    color: d.color,
  }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 10 }} unit="分" />
        <Tooltip formatter={(v) => [`${v}分`, '学習時間']} />
        <Bar dataKey="分" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
