import { create } from 'zustand';

export type TabId = 'dashboard' | 'activity' | 'categories' | 'settings';

interface NavState {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
}

export const useNavStore = create<NavState>((set) => ({
  activeTab: 'dashboard',
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
