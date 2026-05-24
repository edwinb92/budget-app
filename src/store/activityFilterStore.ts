import { create } from 'zustand';

interface ActivityFilterState {
  categoryId: string | null;
  setCategoryFilter: (categoryId: string) => void;
  clearFilter: () => void;
}

export const useActivityFilterStore = create<ActivityFilterState>((set) => ({
  categoryId: null,
  setCategoryFilter: (categoryId) => set({ categoryId }),
  clearFilter: () => set({ categoryId: null }),
}));
