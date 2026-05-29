import type { Subject, BadgeType } from './types';

export const STORAGE_KEY = 'study-tracker-v1';

export const PRESET_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#14b8a6',
];

export const PRESET_SUBJECTS: Omit<Subject, 'id' | 'createdAt'>[] = [
  { name: '数学', weaknessLevel: 3, isPreset: true, color: '#6366f1' },
  { name: '英語', weaknessLevel: 3, isPreset: true, color: '#f59e0b' },
  { name: '国語', weaknessLevel: 3, isPreset: true, color: '#10b981' },
  { name: '理科', weaknessLevel: 3, isPreset: true, color: '#ef4444' },
  { name: '社会', weaknessLevel: 3, isPreset: true, color: '#8b5cf6' },
];

export const ALGO_CONFIG = {
  weaknessWeight: 0.6,
  recencyWeight: 0.4,
  maxDaysForFullRecencyScore: 14,
};

export const STORAGE_VERSION = 2;

export const BADGE_META: Record<BadgeType, { emoji: string; label: string; description: string }> = {
  streak_7:      { emoji: '🔥', label: '7日連続', description: '7日間連続で学習した' },
  streak_30:     { emoji: '🏆', label: '30日連続', description: '30日間連続で学習した' },
  total_10h:     { emoji: '📚', label: '10時間達成', description: '1つの教科で累計10時間学習した' },
  goal_achieved: { emoji: '🎯', label: '週目標達成', description: '教科の週間目標時間を達成した' },
  all_subjects:  { emoji: '🌟', label: '全教科制覇', description: '直近7日間で全教科を学習した' },
};
