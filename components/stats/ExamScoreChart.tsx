'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import type { ExamRecord, Subject } from '@/lib/types';

interface Props {
  examRecords: ExamRecord[];
  subjects: Subject[];
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export function ExamScoreChart({ examRecords, subjects }: Props) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  if (examRecords.length === 0) {
    return (
      <div className="flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm">
        テスト記録がありません
      </div>
    );
  }

  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const filtered = selectedSubjectId === 'all'
    ? examRecords
    : examRecords.filter((r) => r.subjectId === selectedSubjectId);

  // Build chart data: each date is a point, grouped by subject
  const usedSubjectIds = Array.from(new Set(filtered.map((r) => r.subjectId)));
  const sortedRecords = [...filtered].sort((a, b) => a.date.localeCompare(b.date));

  // Build rows: one row per (date, examName, subjectId) with normalized score
  const chartData = sortedRecords.map((r) => {
    const label = formatDateLabel(r.date);
    const subject = subjectMap.get(r.subjectId);
    return {
      key: `${r.date}-${r.id}`,
      label: `${label} ${r.examName}`,
      date: r.date,
      [subject?.name ?? r.subjectId]: Math.round((r.score / r.maxScore) * 100),
    };
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setSelectedSubjectId('all')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            selectedSubjectId === 'all'
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          全教科
        </button>
        {subjects
          .filter((s) => examRecords.some((r) => r.subjectId === s.id))
          .map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectId(s.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedSubjectId === s.id
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={selectedSubjectId === s.id ? { backgroundColor: s.color } : undefined}
            >
              {s.name}
            </button>
          ))}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} interval={0} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
          <Tooltip formatter={(v) => [`${v}%`, '正答率']} />
          {usedSubjectIds.length > 1 && <Legend />}
          {usedSubjectIds.map((sid) => {
            const subject = subjectMap.get(sid);
            if (!subject) return null;
            return (
              <Line
                key={sid}
                type="monotone"
                dataKey={subject.name}
                stroke={subject.color}
                strokeWidth={2}
                dot={{ r: 4 }}
                connectNulls
              />
            );
          })}
        </LineChart>
      </ResponsiveContainer>

      <div className="space-y-1.5">
        {sortedRecords.slice().reverse().map((r) => {
          const subject = subjectMap.get(r.subjectId);
          const pct = Math.round((r.score / r.maxScore) * 100);
          return (
            <div key={r.id} className="flex items-center gap-2 rounded-lg border bg-white p-2.5 text-sm">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: subject?.color ?? '#ccc' }}
              />
              <span className="flex-1 truncate text-gray-700">
                {subject?.name} — {r.examName}
              </span>
              <span className="font-medium text-gray-900">
                {r.score}/{r.maxScore}点
              </span>
              <span
                className={`shrink-0 font-medium ${
                  pct >= 80 ? 'text-green-600' : pct >= 60 ? 'text-yellow-600' : 'text-red-500'
                }`}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
