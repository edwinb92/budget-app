import { supabase } from '@/lib/supabase';
import { useBudgetStore } from '@/store/budgetStore';
import { useHouseholdStore } from '@/store/householdStore';

// Suscribe a los cambios en vivo del household activo. Cuando otro miembro
// agrega/edita/borra datos, refetcheamos el store correspondiente.
// Devuelve una función de cleanup para desuscribir el canal.
export const subscribeToHousehold = (householdId: string): (() => void) => {
  const refetchBudget = () => {
    void useBudgetStore.getState().fetchForActiveHousehold();
  };
  const refetchHousehold = () => {
    void useHouseholdStore.getState().fetchAll();
  };

  const channel = supabase
    .channel(`household:${householdId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `household_id=eq.${householdId}`,
      },
      refetchBudget,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'categories',
        filter: `household_id=eq.${householdId}`,
      },
      refetchBudget,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bills',
        filter: `household_id=eq.${householdId}`,
      },
      refetchBudget,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'memberships',
        filter: `household_id=eq.${householdId}`,
      },
      refetchHousehold,
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'households',
        filter: `id=eq.${householdId}`,
      },
      refetchHousehold,
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
};
