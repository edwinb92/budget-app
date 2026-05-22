import { create } from 'zustand';

import type { DraftExpense } from '@/types';
import { useBudgetStore } from '@/store/budgetStore';

export const WIZARD_STEPS = ['category', 'amount', 'note', 'person'] as const;
export type WizardStep = (typeof WIZARD_STEPS)[number];

const emptyDraft: DraftExpense = {
  categoryId: null,
  amount: 0,
  note: '',
  paidById: null,
};

interface WizardState {
  isOpen: boolean;
  stepIndex: number;
  draft: DraftExpense;

  open: () => void;
  close: () => void;
  next: () => void;
  back: () => void;
  setCategoryId: (id: string) => void;
  setAmount: (value: number) => void;
  setNote: (value: string) => void;
  setPaidById: (id: string) => void;
  save: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  isOpen: false,
  stepIndex: 0,
  draft: { ...emptyDraft },

  open: () =>
    set({ isOpen: true, stepIndex: 0, draft: { ...emptyDraft } }),

  close: () =>
    set({ isOpen: false, stepIndex: 0, draft: { ...emptyDraft } }),

  next: () =>
    set((s) => ({
      stepIndex: Math.min(s.stepIndex + 1, WIZARD_STEPS.length - 1),
    })),

  back: () =>
    set((s) => ({ stepIndex: Math.max(s.stepIndex - 1, 0) })),

  setCategoryId: (id) =>
    set((s) => ({ draft: { ...s.draft, categoryId: id } })),

  setAmount: (value) =>
    set((s) => ({ draft: { ...s.draft, amount: value } })),

  setNote: (value) =>
    set((s) => ({ draft: { ...s.draft, note: value } })),

  setPaidById: (id) =>
    set((s) => ({ draft: { ...s.draft, paidById: id } })),

  save: () => {
    const { draft } = get();
    if (!draft.categoryId || !draft.paidById || draft.amount <= 0) return;

    useBudgetStore.getState().addExpense(draft);
    set({ isOpen: false, stepIndex: 0, draft: { ...emptyDraft } });
  },
}));

export const selectCanAdvance = (s: WizardState): boolean => {
  const step = WIZARD_STEPS[s.stepIndex];
  switch (step) {
    case 'category':
      return s.draft.categoryId !== null;
    case 'amount':
      return s.draft.amount > 0;
    case 'note':
      return true;
    case 'person':
      return s.draft.paidById !== null;
    default:
      return false;
  }
};
