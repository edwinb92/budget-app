import { create } from 'zustand';

import { useBudgetStore } from '@/store/budgetStore';
import type { AccentName } from '@/theme';

export type EditorMode = 'closed' | 'create' | 'edit';

export interface CategoryDraft {
  name: string;
  iconKey: string;
  accent: AccentName;
  budgeted: number;
}

const emptyDraft: CategoryDraft = {
  name: '',
  iconKey: 'shopping',
  accent: 'violet',
  budgeted: 0,
};

interface CategoryEditorState {
  mode: EditorMode;
  editingId: string | null;
  draft: CategoryDraft;

  openCreate: () => void;
  openEdit: (id: string) => void;
  close: () => void;
  setName: (name: string) => void;
  setIconKey: (key: string) => void;
  setAccent: (accent: AccentName) => void;
  setBudgeted: (value: number) => void;
  save: () => void;
  remove: () => void;
}

export const useCategoryEditorStore = create<CategoryEditorState>((set, get) => ({
  mode: 'closed',
  editingId: null,
  draft: { ...emptyDraft },

  openCreate: () =>
    set({ mode: 'create', editingId: null, draft: { ...emptyDraft } }),

  openEdit: (id) => {
    const category = useBudgetStore
      .getState()
      .categories.find((c) => c.id === id);
    if (!category) return;
    set({
      mode: 'edit',
      editingId: id,
      draft: {
        name: category.name,
        iconKey: category.iconKey,
        accent: category.accent,
        budgeted: category.budgeted,
      },
    });
  },

  close: () =>
    set({ mode: 'closed', editingId: null, draft: { ...emptyDraft } }),

  setName: (name) =>
    set((s) => ({ draft: { ...s.draft, name } })),

  setIconKey: (iconKey) =>
    set((s) => ({ draft: { ...s.draft, iconKey } })),

  setAccent: (accent) =>
    set((s) => ({ draft: { ...s.draft, accent } })),

  setBudgeted: (budgeted) =>
    set((s) => ({ draft: { ...s.draft, budgeted } })),

  save: () => {
    const { mode, editingId, draft } = get();
    if (!draft.name.trim() || draft.budgeted <= 0) return;

    const budget = useBudgetStore.getState();
    if (mode === 'create') {
      budget.addCategory({
        name: draft.name.trim(),
        iconKey: draft.iconKey,
        accent: draft.accent,
        budgeted: draft.budgeted,
      });
    } else if (mode === 'edit' && editingId) {
      budget.updateCategory(editingId, {
        name: draft.name.trim(),
        iconKey: draft.iconKey,
        accent: draft.accent,
        budgeted: draft.budgeted,
      });
    }

    set({ mode: 'closed', editingId: null, draft: { ...emptyDraft } });
  },

  remove: () => {
    const { editingId } = get();
    if (!editingId) return;
    useBudgetStore.getState().deleteCategory(editingId);
    set({ mode: 'closed', editingId: null, draft: { ...emptyDraft } });
  },
}));

export const selectCanSave = (s: CategoryEditorState): boolean =>
  s.draft.name.trim().length > 0 && s.draft.budgeted > 0;
