import { create } from 'zustand';

import { supabase } from '@/lib/supabase';
import { useHouseholdStore } from '@/store/householdStore';
import { withMutation } from '@/store/mutationStore';
import type {
  Bill,
  BudgetCategory,
  DraftExpense,
  Expense,
  MonthlySummary,
} from '@/types';

export type CategoryInput = Omit<BudgetCategory, 'id' | 'spent'>;

interface BudgetState {
  summary: MonthlySummary;
  categories: BudgetCategory[];
  bills: Bill[];
  expenses: Expense[];
  loading: boolean;

  fetchForActiveHousehold: () => Promise<void>;
  reset: () => void;
  addExpense: (draft: DraftExpense) => Promise<void>;
  updateExpense: (id: string, patch: { amount?: number; note?: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCategory: (input: CategoryInput) => Promise<void>;
  updateCategory: (id: string, patch: Partial<CategoryInput>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const emptySummary: MonthlySummary = {
  monthLabel: '',
  budgeted: 0,
  spent: 0,
};

const activeHouseholdId = (): string =>
  useHouseholdStore.getState().activeHouseholdId;

const monthLabel = (): string =>
  new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export const useBudgetStore = create<BudgetState>((set, get) => ({
  summary: emptySummary,
  categories: [],
  bills: [],
  expenses: [],
  loading: false,

  fetchForActiveHousehold: async () => {
    const householdId = activeHouseholdId();
    if (!householdId) {
      get().reset();
      return;
    }

    set({ loading: true });

    const [catsRes, expensesRes, billsRes] = await Promise.all([
      supabase
        .from('categories_with_spent')
        .select('id, name, iconKey:icon_key, accent, budgeted, spent')
        .eq('household_id', householdId),
      supabase
        .from('expenses')
        .select(
          'id, categoryId:category_id, amount, note, paidById:paid_by_id, createdAt:created_at',
        )
        .eq('household_id', householdId)
        .order('created_at', { ascending: false }),
      supabase
        .from('bills')
        .select('id, name, iconKey:icon_key, accent, amount, status, dueDay:due_day')
        .eq('household_id', householdId)
        .order('due_day', { ascending: true }),
    ]);

    const categories: BudgetCategory[] = (catsRes.data ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      iconKey: c.iconKey,
      accent: c.accent,
      budgeted: Number(c.budgeted),
      spent: Number(c.spent),
    }));

    const expenses: Expense[] = (expensesRes.data ?? []).map((e: any) => ({
      id: e.id,
      categoryId: e.categoryId,
      amount: Number(e.amount),
      note: e.note ?? '',
      paidById: e.paidById,
      createdAt: new Date(e.createdAt).getTime(),
    }));

    const bills: Bill[] = (billsRes.data ?? []).map((b: any) => ({
      id: b.id,
      name: b.name,
      iconKey: b.iconKey,
      accent: b.accent,
      amount: Number(b.amount),
      status: b.status,
      dueDay: b.dueDay,
    }));

    const budgeted = categories.reduce((sum, c) => sum + c.budgeted, 0);
    const spent = categories.reduce((sum, c) => sum + c.spent, 0);

    set({
      categories,
      expenses,
      bills,
      summary: { monthLabel: monthLabel(), budgeted, spent },
      loading: false,
    });
  },

  reset: () =>
    set({
      summary: emptySummary,
      categories: [],
      bills: [],
      expenses: [],
      loading: false,
    }),

  addExpense: async (draft) =>
    withMutation(async () => {
      const householdId = activeHouseholdId();
      if (!householdId || !draft.categoryId || !draft.paidById || draft.amount <= 0) {
        return;
      }
      await supabase.from('expenses').insert({
        household_id: householdId,
        category_id: draft.categoryId,
        paid_by_id: draft.paidById,
        amount: draft.amount,
        note: draft.note,
      });
      await get().fetchForActiveHousehold();
    }),

  updateExpense: async (id, patch) =>
    withMutation(async () => {
      const update: { amount?: number; note?: string } = {};
      if (typeof patch.amount === 'number' && patch.amount > 0) {
        update.amount = patch.amount;
      }
      if (typeof patch.note === 'string') {
        update.note = patch.note;
      }
      await supabase.from('expenses').update(update).eq('id', id);
      await get().fetchForActiveHousehold();
    }),

  deleteExpense: async (id) =>
    withMutation(async () => {
      await supabase.from('expenses').delete().eq('id', id);
      await get().fetchForActiveHousehold();
    }),

  addCategory: async (input) =>
    withMutation(async () => {
      const householdId = activeHouseholdId();
      if (!householdId) return;
      await supabase.from('categories').insert({
        household_id: householdId,
        name: input.name,
        icon_key: input.iconKey,
        accent: input.accent,
        budgeted: input.budgeted,
      });
      await get().fetchForActiveHousehold();
    }),

  updateCategory: async (id, patch) =>
    withMutation(async () => {
      const update: {
        name?: string;
        icon_key?: string;
        accent?: string;
        budgeted?: number;
      } = {};
      if (patch.name !== undefined) update.name = patch.name;
      if (patch.iconKey !== undefined) update.icon_key = patch.iconKey;
      if (patch.accent !== undefined) update.accent = patch.accent;
      if (patch.budgeted !== undefined) update.budgeted = patch.budgeted;
      await supabase.from('categories').update(update).eq('id', id);
      await get().fetchForActiveHousehold();
    }),

  deleteCategory: async (id) =>
    withMutation(async () => {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) {
        // La FK de expenses es ON DELETE RESTRICT: no se puede borrar una
        // categoría que tenga gastos. Surfacearlo arriba si hace falta.
        console.warn('deleteCategory failed:', error.message);
      }
      await get().fetchForActiveHousehold();
    }),
}));

export const selectRemaining = (state: BudgetState): number =>
  state.summary.budgeted - state.summary.spent;
