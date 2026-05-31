import i18n from '@/i18n';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

const daysBetween = (a: number, b: number): number =>
  Math.round((startOfDay(b) - startOfDay(a)) / MS_PER_DAY);

const localeForDates = (): string =>
  i18n.language === 'es' ? 'es-CR' : 'en-US';

export const formatDayLabel = (ts: number, now: number = Date.now()): string => {
  const diff = daysBetween(ts, now);
  if (diff === 0) return i18n.t('activity.today');
  if (diff === 1) return i18n.t('activity.yesterday');
  const locale = localeForDates();
  if (diff > 1 && diff < 7) {
    return new Date(ts).toLocaleDateString(locale, {
      weekday: 'long',
    });
  }
  return new Date(ts).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
};

export interface DayGroup<T> {
  dayKey: number;
  label: string;
  items: T[];
}

export const groupByDay = <T extends { createdAt: number }>(
  items: T[],
  now: number = Date.now(),
): DayGroup<T>[] => {
  const buckets = new Map<number, T[]>();

  for (const item of items) {
    const key = startOfDay(item.createdAt);
    const existing = buckets.get(key);
    if (existing) {
      existing.push(item);
    } else {
      buckets.set(key, [item]);
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => b - a)
    .map(([dayKey, bucketItems]) => ({
      dayKey,
      label: formatDayLabel(dayKey, now),
      items: bucketItems.sort((a, b) => b.createdAt - a.createdAt),
    }));
};
