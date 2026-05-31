import { create } from 'zustand';

interface ProfileEditorState {
  profileOpen: boolean;
  passwordOpen: boolean;
  languageOpen: boolean;

  openProfile: () => void;
  closeProfile: () => void;
  openPassword: () => void;
  closePassword: () => void;
  openLanguage: () => void;
  closeLanguage: () => void;
}

export const useProfileEditorStore = create<ProfileEditorState>((set) => ({
  profileOpen: false,
  passwordOpen: false,
  languageOpen: false,

  openProfile: () => set({ profileOpen: true }),
  closeProfile: () => set({ profileOpen: false }),
  openPassword: () => set({ passwordOpen: true }),
  closePassword: () => set({ passwordOpen: false }),
  openLanguage: () => set({ languageOpen: true }),
  closeLanguage: () => set({ languageOpen: false }),
}));
