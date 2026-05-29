'use client';

import { clsx } from 'clsx';

interface Props {
  value: 1 | 2 | 3 | 4 | 5;
  onChange?: (v: 1 | 2 | 3 | 4 | 5) => void;
  readonly?: boolean;
  size?: 'sm' | 'md';
}

const LABELS = ['得意', 'やや得意', '普通', 'やや苦手', '苦手'];

export function WeaknessRating({ value, onChange, readonly = false, size = 'md' }: Props) {
  return (
    <div className="flex items-center gap-0.5" title={LABELS[value - 1]}>
      {([1, 2, 3, 4, 5] as const).map((level) => (
        <button
          key={level}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(level)}
          className={clsx(
            'rounded transition-colors',
            size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
            level <= value ? 'bg-amber-400' : 'bg-gray-200',
            !readonly && 'hover:bg-amber-300 cursor-pointer',
            readonly && 'cursor-default'
          )}
          aria-label={`苦手度 ${level}`}
        />
      ))}
      <span className={clsx('ml-1 text-gray-500', size === 'sm' ? 'text-xs' : 'text-xs')}>
        {LABELS[value - 1]}
      </span>
    </div>
  );
}
