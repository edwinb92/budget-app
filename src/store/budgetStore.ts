import { create } from 'zustand';

import { mockBills, mockCategories, mockExpenses, mockSummary } from '@/data/mockData';
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

  addExpense: (draft: DraftExpense) => void;
  updateExpense: (id: string, patch: { amount?: number; note?: string }) => void;
  deleteExpense: (id: string) => void;
  addCategory: (input: CategoryInput) => void;
  updateCategory: (id: string, patch: Partial<CategoryInput>) => void;
  deleteCategory: (id: string) => void;
}

const makeId = (prefix: string): string =>
  `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const sumCategoriesBudget = (cats: BudgetCategory[]): number =>
  cats.reduce((sum, c) => sum + c.budgeted, 0);

const sumCategoriesSpent = (cats: BudgetCategory[]): number =>
  cats.reduce((sum, c) => sum + c.spent, 0);

export const useBudgetStore = create<BudgetState>((set) => ({
  summary: mockSummary,
  categories: mockCategories,
  bills: mockBills,
  expenses: mockExpenses,

  addExpense: (draft) => {
    if (!draft.categoryId || !draft.paidById || draft.amount <= 0) return;

    const expense: Expense = {
      id: makeId('e'),
      categoryId: draft.categoryId,
      amount: draft.amount,
      note: draft.note,
      paidById: draft.paidById,
      createdAt: Date.now(),
    };

    set((s) => ({
      expenses: [expense, ...s.expenses],
      categories: s.categories.map((c) =>
        c.id === draft.categoryId
          ? { ...c, spent: c.spent + draft.amount }
          : c,
      ),
      summary: { ...s.summary, spent: s.summary.spent + draft.amount },
    }));
  },

  updateExpense: (id, patch) => {
    set((s) => {
      const existing = s.expenses.find((e) => e.id === id);
      if (!existing) return s;

      const nextAmount =
        typeof patch.amount === 'number' && patch.amount > 0
          ? patch.amount
          : existing.amount;
      const nextNote =
        typeof patch.note === 'string' ? patch.note : existing.note;

      const delta = nextAmount - existing.amount;

      return {
        expenses: s.expenses.map((e) =>
          e.id === id ? { ...e, amount: nextAmount, note: nextNote } : e,
        ),
        categories: s.categories.map((c) =>
          c.id === existing.categoryId
            ? { ...c, spent: c.spent + delta }
            : c,
        ),
        summary: { ...s.summary, spent: s.summary.spent + delta },
      };
    });
  },

  deleteExpense: (id) => {
    set((s) => {
      const existing = s.expenses.find((e) => e.id === id);
      if (!existing) return s;

      return {
        expenses: s.expenses.filter((e) => e.id !== id),
        categories: s.categories.map((c) =>
          c.id === existing.categoryId
            ? { ...c, spent: Math.max(0, c.spent - existing.amount) }
            : c,
        ),
        summary: {
          ...s.summary,
          spent: Math.max(0, s.summary.spent - existing.amount),
        },
      };
    });
  },

  addCategory: (input) => {
    set((s) => {
      const newCategory: BudgetCategory = {
        id: makeId('cat'),
        spent: 0,
        ...input,
      };
      const categories = [...s.categories, newCategory];
      return {
        categories,
        summary: { ...s.summary, budgeted: sumCategoriesBudget(categories) },
      };
    });
  },

  updateCategory: (id, patch) => {
    set((s) => {
      const categories = s.categories.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      );
      return {
        categories,
        summary: { ...s.summary, budgeted: sumCategoriesBudget(categories) },
      };
    });
  },

  deleteCategory: (id) => {
    set((s) => {
      const categories = s.categories.filter((c) => c.id !== id);
      const expenses = s.expenses.filter((e) => e.categoryId !== id);
      return {
        categories,
        expenses,
        summary: {
          ...s.summary,
          budgeted: sumCategoriesBudget(categories),
          spent: sumCategoriesSpent(categories),
        },
      };
    });
  },
}));

export const selectRemaining = (state: BudgetState): number =>
  state.summary.budgeted - state.summary.spent;
