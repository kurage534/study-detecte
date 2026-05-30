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

type Mode = 'focus' | 'short_break' | 'long_break' | 'custom';

const PRESET_SECONDS: Record<Exclude<Mode, 'custom'>, number> = {
  focus: 25 * 60,
  short_break: 5 * 60,
  long_break: 15 * 60,
};

const MODE_LABELS: Record<Mode, string> = {
  focus: '集中',
  short_break: '短い休憩',
  long_break: '長い休憩',
  custom: 'カスタム',
};

const MODE_COLORS: Record<Mode, string> = {
  focus: '#6366f1',
  short_break: '#10b981',
  long_break: '#06b6d4',
  custom: '#f59e0b',
};

const QUICK_MINUTES = [5, 10, 15, 20, 30, 45, 60, 90];

const TIMER_STATE_KEY = 'timer-active-state';

interface SavedTimerState {
  endTime: number;         // Date.now() + remaining ms
  mode: Mode;
  subjectId: string;
  totalSeconds: number;
  customTotalSecs: number;
  pomodoroCount: number;
  completedFocusSecs: number;
}

function saveTimerState(state: SavedTimerState) {
  try {
    localStorage.setItem(TIMER_STATE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function clearTimerState() {
  try {
    localStorage.removeItem(TIMER_STATE_KEY);
  } catch { /* ignore */ }
}

function loadTimerState(): SavedTimerState | null {
  try {
    const raw = localStorage.getItem(TIMER_STATE_KEY);
    return raw ? (JSON.parse(raw) as SavedTimerState) : null;
  } catch {
    return null;
  }
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

const RADIUS = 88;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function TimerPage({ subjects, onAddSession }: Props) {
  const [mode, setMode] = useState<Mode>('focus');
  const [customMinutes, setCustomMinutes] = useState('30');
  const [customTotalSecs, setCustomTotalSecs] = useState(30 * 60);
  const [secondsLeft, setSecondsLeft] = useState(PRESET_SECONDS.focus);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? '');
  const [completedFocusSecs, setCompletedFocusSecs] = useState(0);
  const [sessionFormOpen, setSessionFormOpen] = useState(false);
  const [pendingMinutes, setPendingMinutes] = useState(0);

  // Absolute end timestamp when timer is running
  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSecondsRef = useRef(PRESET_SECONDS.focus);

  const totalSeconds = mode === 'custom' ? customTotalSecs : PRESET_SECONDS[mode];
  totalSecondsRef.current = totalSeconds;

  const isStudyMode = mode === 'focus' || mode === 'custom';

  const handleComplete = useCallback((completedTotalSecs: number, currentMode: Mode, currentPomodoroCount: number) => {
    clearTimerState();
    endTimeRef.current = null;
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setSecondsLeft(0);

    const studyMode = currentMode === 'focus' || currentMode === 'custom';

    if (studyMode) {
      const elapsed = Math.round(completedTotalSecs / 60);
      setCompletedFocusSecs((p) => p + completedTotalSecs);

      if (currentMode === 'focus') {
        const next = currentPomodoroCount + 1;
        setPomodoroCount(next);
        const nextMode: Exclude<Mode, 'custom'> = next % 4 === 0 ? 'long_break' : 'short_break';
        setMode(nextMode);
        setSecondsLeft(PRESET_SECONDS[nextMode]);
      }

      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('タイマー終了！', { body: 'お疲れ様でした 🎉', icon: '/icon.png' });
      }

      if (elapsed > 0) {
        setPendingMinutes(elapsed);
        setSessionFormOpen(true);
      }
    } else {
      setMode('focus');
      setSecondsLeft(PRESET_SECONDS.focus);
      if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
        new Notification('休憩終了！', { body: '集中タイムを始めましょう 💪', icon: '/icon.png' });
      }
    }
  }, []);

  // Restore timer state on mount (including after app close)
  useEffect(() => {
    const saved = loadTimerState();
    if (!saved) return;
    const remaining = Math.ceil((saved.endTime - Date.now()) / 1000);
    if (remaining <= 0) {
      // Timer finished while app was closed
      clearTimerState();
      handleComplete(saved.totalSeconds, saved.mode, saved.pomodoroCount);
    } else {
      // Restore running timer
      setMode(saved.mode);
      setSubjectId(saved.subjectId);
      setCustomTotalSecs(saved.customTotalSecs);
      setPomodoroCount(saved.pomodoroCount);
      setCompletedFocusSecs(saved.completedFocusSecs);
      setSecondsLeft(remaining);
      endTimeRef.current = saved.endTime;
      setIsRunning(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main tick: recompute from wall clock time
  useEffect(() => {
    if (!isRunning || endTimeRef.current === null) return;

    const tick = () => {
      const remaining = Math.ceil((endTimeRef.current! - Date.now()) / 1000);
      if (remaining <= 0) {
        handleComplete(totalSecondsRef.current, mode, pomodoroCount);
      } else {
        setSecondsLeft(remaining);
      }
    };

    tick(); // run immediately to sync after visibility change
    intervalRef.current = setInterval(tick, 500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, handleComplete, mode, pomodoroCount]);

  // Recalculate when tab becomes visible again
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === 'visible' && isRunning && endTimeRef.current !== null) {
        const remaining = Math.ceil((endTimeRef.current - Date.now()) / 1000);
        if (remaining <= 0) {
          handleComplete(totalSecondsRef.current, mode, pomodoroCount);
        } else {
          setSecondsLeft(remaining);
        }
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isRunning, handleComplete, mode, pomodoroCount]);

  function startTimer() {
    endTimeRef.current = Date.now() + secondsLeft * 1000;
    saveTimerState({
      endTime: endTimeRef.current,
      mode,
      subjectId,
      totalSeconds,
      customTotalSecs,
      pomodoroCount,
      completedFocusSecs,
    });
    setIsRunning(true);
  }

  function pauseTimer() {
    clearTimerState();
    endTimeRef.current = null;
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function toggleRunning() {
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  }

  function switchMode(m: Mode) {
    pauseTimer();
    setMode(m);
    if (m === 'custom') {
      const mins = parseInt(customMinutes, 10);
      const secs = isNaN(mins) || mins <= 0 ? 30 * 60 : mins * 60;
      setCustomTotalSecs(secs);
      setSecondsLeft(secs);
    } else {
      setSecondsLeft(PRESET_SECONDS[m]);
    }
  }

  function applyCustomTime(mins: number) {
    if (mins <= 0) return;
    const secs = mins * 60;
    setCustomTotalSecs(secs);
    setSecondsLeft(secs);
    pauseTimer();
  }

  function handleCustomInputBlur() {
    const mins = parseInt(customMinutes, 10);
    if (!isNaN(mins) && mins > 0) applyCustomTime(mins);
  }

  function reset() {
    pauseTimer();
    if (mode === 'custom') {
      setSecondsLeft(customTotalSecs);
    } else {
      setSecondsLeft(PRESET_SECONDS[mode]);
    }
  }

  function skip() {
    handleComplete(totalSeconds, mode, pomodoroCount);
  }

  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const strokeOffset = CIRCUMFERENCE * progress;
  const color = MODE_COLORS[mode];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const totalCompletedMins = Math.round(completedFocusSecs / 60);
  const currentSubject = subjects.find((s) => s.id === subjectId);

  return (
    <div className="flex flex-col items-center space-y-5">
      {/* Mode tabs */}
      <div className="flex flex-wrap justify-center gap-1.5 rounded-2xl bg-gray-100 p-1">
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

      {/* Custom time input */}
      {mode === 'custom' && (
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={360}
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              onBlur={handleCustomInputBlur}
              disabled={isRunning}
              className="w-20 rounded-lg border border-gray-300 px-3 py-2 text-center text-lg font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
            />
            <span className="text-sm text-gray-600">分</span>
            <button
              onClick={() => {
                const m = parseInt(customMinutes, 10);
                if (!isNaN(m) && m > 0) applyCustomTime(m);
              }}
              disabled={isRunning}
              className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-medium text-white hover:bg-amber-600 disabled:opacity-50"
            >
              セット
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_MINUTES.map((m) => (
              <button
                key={m}
                onClick={() => {
                  setCustomMinutes(String(m));
                  applyCustomTime(m);
                }}
                disabled={isRunning}
                className="rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-600 hover:border-amber-400 hover:text-amber-600 transition-colors disabled:opacity-50"
              >
                {m}分
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subject selector */}
      {isStudyMode && (
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
      )}

      {/* Running indicator */}
      {isRunning && (
        <p className="text-xs text-green-600 font-medium">● アプリを閉じてもタイマーは動き続けます</p>
      )}

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width={200} height={200} className="-rotate-90">
          <circle cx={100} cy={100} r={RADIUS} fill="none" stroke="#e5e7eb" strokeWidth={10} />
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
          <span className="text-5xl font-bold tabular-nums" style={{ color }}>
            {pad(mins)}:{pad(secs)}
          </span>
          <span className="mt-1 text-sm font-medium text-gray-500">{MODE_LABELS[mode]}</span>
          {currentSubject && isStudyMode && (
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
          onClick={toggleRunning}
          disabled={subjects.length === 0 && isStudyMode}
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
