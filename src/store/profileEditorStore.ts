import { create } from 'zustand';

interface ProfileEditorState {
  profileOpen: boolean;
  passwordOpen: boolean;

  openProfile: () => void;
  closeProfile: () => void;
  openPassword: () => void;
  closePassword: () => void;
}

export const useProfileEditorStore = create<ProfileEditorState>((set) => ({
  profileOpen: false,
  passwordOpen: false,

  openProfile: () => set({ profileOpen: true }),
  closeProfile: () => set({ profileOpen: false }),
  openPassword: () => set({ passwordOpen: true }),
  closePassword: () => set({ passwordOpen: false }),
}));
