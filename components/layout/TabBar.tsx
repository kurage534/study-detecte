import { CalendarDays, BookOpen, PenLine, BarChart2 } from 'lucide-react';
import type { TabId } from '@/lib/types';
import { clsx } from 'clsx';

interface Props {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'today', label: '今日', Icon: CalendarDays },
  { id: 'subjects', label: '教科', Icon: BookOpen },
  { id: 'sessions', label: '記録', Icon: PenLine },
  { id: 'stats', label: '統計', Icon: BarChart2 },
];

export function TabBar({ activeTab, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white">
      <div className="mx-auto flex max-w-lg">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={clsx(
              'flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors',
              activeTab === id ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label={label}
          >
            <Icon className="h-5 w-5" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
