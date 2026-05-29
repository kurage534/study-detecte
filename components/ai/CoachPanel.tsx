'use client';

import { useState } from 'react';
import type { Subject, StudySession, SubjectGoal } from '@/lib/types';
import { getStudyStreak } from '@/lib/stats';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
}

const CACHE_KEY = 'coach-advice-cache';

interface CacheEntry {
  advice: string;
  date: string; // "YYYY-MM-DD"
}

function loadCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry = JSON.parse(raw) as CacheEntry;
    const today = new Date().toISOString().slice(0, 10);
    return entry.date === today ? entry : null;
  } catch {
    return null;
  }
}

function saveCache(advice: string) {
  try {
    const entry: CacheEntry = { advice, date: new Date().toISOString().slice(0, 10) };
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export function CoachPanel({ subjects, sessions, goals }: Props) {
  const cached = typeof window !== 'undefined' ? loadCache() : null;
  const [advice, setAdvice] = useState<string | null>(cached?.advice ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchAdvice() {
    setLoading(true);
    setError(null);

    const subjectMap = new Map(subjects.map((s) => [s.id, s]));

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().slice(0, 10);

    const recentSessions = sessions
      .filter((s) => s.date >= cutoffStr)
      .map((s) => ({
        date: s.date,
        subjectName: subjectMap.get(s.subjectId)?.name ?? '不明',
        durationMinutes: s.durationMinutes,
      }));

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartStr = weekStart.toISOString().slice(0, 10);

    const goalList = goals.map((g) => {
      const subject = subjectMap.get(g.subjectId);
      const achieved = sessions
        .filter((s) => s.subjectId === g.subjectId && s.date >= weekStartStr)
        .reduce((sum, s) => sum + s.durationMinutes, 0);
      return {
        subjectName: subject?.name ?? '不明',
        weeklyMinutes: g.weeklyMinutes,
        achievedMinutes: achieved,
      };
    });

    try {
      const res = await fetch('/api/coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjects.map((s) => ({ name: s.name, weaknessLevel: s.weaknessLevel })),
          recentSessions,
          goals: goalList,
          streak: getStudyStreak(sessions),
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? 'エラーが発生しました');
      } else {
        setAdvice(data.advice);
        saveCache(data.advice);
      }
    } catch {
      setError('ネットワークエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-indigo-50 to-purple-50 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xl">🤖</span>
        <h3 className="text-sm font-semibold text-gray-800">AIコーチ</h3>
      </div>

      {advice ? (
        <>
          <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{advice}</div>
          <button
            onClick={fetchAdvice}
            disabled={loading}
            className="text-xs text-indigo-500 hover:text-indigo-700 disabled:opacity-50"
          >
            {loading ? '生成中…' : '再生成する'}
          </button>
        </>
      ) : (
        <button
          onClick={fetchAdvice}
          disabled={loading || subjects.length === 0}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '生成中…' : 'AIコーチにアドバイスを聞く'}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded p-2">{error}</p>
      )}
    </div>
  );
}
