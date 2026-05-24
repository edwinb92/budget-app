import { create } from 'zustand';

interface ExpenseEditorState {
  editingId: string | null;
  open: (expenseId: string) => void;
  close: () => void;
}

export const useExpenseEditorStore = create<ExpenseEditorState>((set) => ({
  editingId: null,
  open: (expenseId) => set({ editingId: expenseId }),
  close: () => set({ editingId: null }),
}));
