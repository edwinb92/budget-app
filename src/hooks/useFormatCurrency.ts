import { useCallback } from 'react';

import {
  selectActiveHousehold,
  useHouseholdStore,
} from '@/store/householdStore';
import { formatCurrency, getCurrencySymbol } from '@/utils/format';

// Devuelve el código de moneda del household activo (default 'USD').
export const useActiveCurrency = (): string => {
  const household = useHouseholdStore(selectActiveHousehold);
  return household?.currency ?? 'USD';
};

// Devuelve el símbolo ($ / ₡) del household activo.
export const useCurrencySymbol = (): string => {
  const currency = useActiveCurrency();
  return getCurrencySymbol(currency);
};

// Devuelve un formatter (value: number) => string ligado a la moneda activa.
export const useFormatCurrency = (): ((value: number) => string) => {
  const currency = useActiveCurrency();
  return useCallback((value: number) => formatCurrency(value, currency), [currency]);
};
