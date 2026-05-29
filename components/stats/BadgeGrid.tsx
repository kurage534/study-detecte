import type { EarnedBadge, Subject } from '@/lib/types';
import { BADGE_META } from '@/lib/constants';

interface Props {
  badges: EarnedBadge[];
  subjects: Subject[];
}

export function BadgeGrid({ badges, subjects }: Props) {
  const subjectMap = new Map(subjects.map((s) => [s.id, s]));

  if (badges.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 py-6 text-center text-gray-400 text-sm">
        まだバッジがありません。学習を続けると獲得できます！
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {badges.map((badge) => {
        const meta = BADGE_META[badge.type];
        const subject = badge.subjectId ? subjectMap.get(badge.subjectId) : undefined;
        const earnedDate = new Date(badge.earnedAt).toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });

        return (
          <div
            key={badge.id}
            className="flex flex-col items-center rounded-xl border bg-white p-3 text-center shadow-sm"
          >
            <span className="text-3xl">{meta.emoji}</span>
            <p className="mt-1 text-sm font-semibold text-gray-800">{meta.label}</p>
            {subject && (
              <p className="text-xs text-gray-500">{subject.name}</p>
            )}
            <p className="mt-1 text-xs text-gray-400">{earnedDate}</p>
          </div>
        );
      })}
    </div>
  );
}
