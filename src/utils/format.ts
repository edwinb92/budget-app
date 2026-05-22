export const formatCurrency = (value: number, currency = 'USD'): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString('en-US')}`;
  }
};

export const formatPercent = (ratio: number): string => {
  const clamped = Math.max(0, Math.min(1, ratio));
  return `${Math.round(clamped * 100)}%`;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
