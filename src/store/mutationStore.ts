import { create } from 'zustand';

interface MutationState {
  pendingCount: number;
  start: () => void;
  end: () => void;
}

// Cuenta de cuántas mutaciones (insert/update/delete) están en vuelo.
// La UI usa esto para mostrar un indicador global mientras hay actividad.
export const useMutationStore = create<MutationState>((set) => ({
  pendingCount: 0,
  start: () => set((s) => ({ pendingCount: s.pendingCount + 1 })),
  end: () => set((s) => ({ pendingCount: Math.max(0, s.pendingCount - 1) })),
}));

// Helper para envolver una mutación async. Incrementa el contador al
// arrancar y lo decrementa al terminar, incluso si hubo error.
//
// Uso:
//   addExpense: async (draft) => withMutation(async () => {
//     await supabase.from('expenses').insert(...);
//     await get().fetchForActiveHousehold();
//   })
export const withMutation = async <T>(fn: () => Promise<T>): Promise<T> => {
  useMutationStore.getState().start();
  try {
    return await fn();
  } finally {
    useMutationStore.getState().end();
  }
};
