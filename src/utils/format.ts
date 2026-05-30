const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  CRC: '₡',
};

export const getCurrencySymbol = (currency: string): string =>
  CURRENCY_SYMBOLS[currency] ?? currency;

export const formatCurrency = (value: number, currency = 'USD'): string => {
  const symbol = getCurrencySymbol(currency);
  const num = Math.round(value).toLocaleString('en-US');
  return `${symbol}${num}`;
};

export const formatPercent = (ratio: number): string => {
  const clamped = Math.max(0, Math.min(1, ratio));
  return `${Math.round(clamped * 100)}%`;
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));
