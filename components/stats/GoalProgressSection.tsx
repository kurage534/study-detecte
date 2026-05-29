import type { Subject, StudySession, SubjectGoal } from '@/lib/types';

interface Props {
  subjects: Subject[];
  sessions: StudySession[];
  goals: SubjectGoal[];
}

function thisWeekStart(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}分`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}時間${m}分` : `${h}時間`;
}

export function GoalProgressSection({ subjects, sessions, goals }: Props) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));
  const weekStart = thisWeekStart();

  const goalsWithProgress = goals.map((goal) => {
    const subject = subjectMap.get(goal.subjectId);
    if (!subject) return null;

    const weekMinutes = sessions
      .filter((s) => s.subjectId === goal.subjectId && s.date >= weekStart)
      .reduce((sum, s) => sum + s.durationMinutes, 0);

    const pct = Math.min(100, Math.round((weekMinutes / goal.weeklyMinutes) * 100));
    return { subject, weekMinutes, goal, pct };
  }).filter(Boolean) as Array<{
    subject: Subject;
    weekMinutes: number;
    goal: SubjectGoal;
    pct: number;
  }>;

  if (goalsWithProgress.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 py-6 text-center text-gray-400 text-sm">
        目標未設定。教科カードから週の目標時間を設定できます。
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {goalsWithProgress.map(({ subject, weekMinutes, goal, pct }) => (
        <div key={subject.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 font-medium text-gray-700">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              {subject.name}
            </span>
            <span className="text-gray-500">
              {formatMinutes(weekMinutes)} / {formatMinutes(goal.weeklyMinutes)}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-100">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 100 ? '#10b981' : subject.color,
              }}
            />
          </div>
          {pct >= 100 && (
            <p className="mt-0.5 text-right text-xs text-green-600 font-medium">達成！🎉</p>
          )}
        </div>
      ))}
    </div>
  );
}
