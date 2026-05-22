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
