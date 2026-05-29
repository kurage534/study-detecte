'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import type { Subject } from '@/lib/types';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { SessionForm } from '@/components/sessions/SessionForm';

interface Props {
  subjects: Subject[];
  onAddSession: (subjectId: string, durationMinutes: number, date: string, notes: string) => void;
}

type Mode = 'focus' | 'short_break' | 'long_break';

const MODE_SECONDS: Record<Mode, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  focus: '集中',
  short_break: '短い休憩',
  long_break: '長い休憩',
};

const MODE_COLORS: Record<Mode, string> = {
  focus: '#6366f1',
  short_break: '#10b981',
  long_break: '#06b6d4',
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerPage({ subjects, onAddSession }: Props) {
  const [mode, setMode] = useState<Mode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(MODE_SECONDS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [completedFocusSecs, setCompletedFocusSecs] = useState(0);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [pendingMinutes, setPendingMinutes] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSeconds = MODE_SECONDS[mode];
  const progress = secondsLeft / totalSeconds;
  const strokeOffset = CIRCUMFERENCE * progress;
  const color = MODE_COLORS[mode];

  const handleComplete = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (mode === 'focus') {
      const elapsed = Math.round(totalSeconds / 60);
      setCompletedFocusSecs((p) => p + totalSeconds);
      setPomodoroCount((c) => {
        const next = c + 1;
        const nextMode: Mode = next % 4 === 0 ? 'long_break' : 'short_break';
        setMode(nextMode);
        setSecondsLeft(MODE_SECONDS[nextMode]);
        return next;
      });

      // Notify
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('集中時間終了！', { body: '休憩しましょう 🎉', icon: '/icon.png' });
      }

      // Prompt to record session
      if (elapsed > 0) {
        setPendingMinutes(elapsed);
        setSessionFormOpen(true);
      }
    } else {
      // Break finished
      setMode('focus');
      setSecondsLeft(MODE_SECONDS.focus);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('休憩終了！', { body: '集中タイムを始めましょう 💪', icon: '/icon.png' });
      }
    }
  }, [mode, totalSeconds]);

  useEffect(() => {
    if (!isRunning) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          handleComplete();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleComplete]);

  function switchMode(m: Mode) {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setMode(m);
    setSecondsLeft(MODE_SECONDS[m]);
    setIsRunning(false);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(MODE_SECONDS[mode]);
    setIsRunning(false);
  }

  function skip() {
    handleComplete();
  }

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const totalCompletedMins = Math.round(completedFocusSecs / 60);

  // Subject for the current timer
  const currentSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-1.5 rounded-full bg-gray-100 p-1">
        {(Object.keys(MODE_LABELS) as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Subject selector */}
      <div className="w-full max-w-xs">
        <Select value={subjectId} onValueChange={setSubjectId}>
          <SelectTrigger>
            <SelectValue placeholder="教科を選択" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                <span className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width={200} height={200} className="-rotate-90">
          {/* Background ring */}
          <circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={10}
          />
          {/* Progress ring */}
          <circle
            cx={100}
            cy={100}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={10}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={CIRCUMFERENCE - strokeOffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span
            className="text-5xl font-bold tabular-nums"
            style={{ color }}
          >
            {pad(mins)}:{pad(secs)}
          </span>
          <span className="mt-1 text-sm font-medium text-gray-500">{MODE_LABELS[mode]}</span>
          {currentSubject && (
            <span className="mt-0.5 text-xs text-gray-400">{currentSubject.name}</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="rounded-full p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="リセット"
        >
          <RotateCcw className="h-5 w-5" />
        </button>

        <button
          onClick={() => setIsRunning((r) => !r)}
          disabled={subjects.length === 0}
          className="rounded-full px-8 py-4 text-white font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50"
          style={{ backgroundColor: color }}
          aria-label={isRunning ? '一時停止' : '開始'}
        >
          {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7" />}
        </button>

        <button
          onClick={skip}
          className="rounded-full p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="スキップ"
        >
          <SkipForward className="h-5 w-5" />
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-6 rounded-xl border bg-white px-6 py-3 shadow-sm">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{pomodoroCount}</p>
          <p className="text-xs text-gray-500">完了セット</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{totalCompletedMins}</p>
          <p className="text-xs text-gray-500">今日の集中分</p>
        </div>
      </div>

      {/* Guide */}
      <p className="text-center text-xs text-gray-400 max-w-xs">
        25分集中 → 5分休憩 × 4セット後に15分の長休憩
        <br />
        集中タイマー終了時に学習記録が自動で作成されます
      </p>

      <SessionForm
        open={sessionFormOpen}
        onClose={() => setSessionFormOpen(false)}
        subjects={subjects}
        initialSubjectId={subjectId}
        onSubmit={(sid, _dur, date, notes) => {
          onAddSession(sid, pendingMinutes, date, notes);
        }}
      />
    </div>
  );
}
