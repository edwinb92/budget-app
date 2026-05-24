import { create } from 'zustand';

interface HouseholdEditorState {
  pickerOpen: boolean;
  createOpen: boolean;
  manageOpenForId: string | null;

  openPicker: () => void;
  closePicker: () => void;
  openCreate: () => void;
  closeCreate: () => void;
  openManage: (householdId: string) => void;
  closeManage: () => void;
}

export const useHouseholdEditorStore = create<HouseholdEditorState>((set) => ({
  pickerOpen: false,
  createOpen: false,
  manageOpenForId: null,

  openPicker: () => set({ pickerOpen: true }),
  closePicker: () => set({ pickerOpen: false }),

  openCreate: () => set({ createOpen: true, pickerOpen: false }),
  closeCreate: () => set({ createOpen: false }),

  openManage: (id) => set({ manageOpenForId: id, pickerOpen: false }),
  closeManage: () => set({ manageOpenForId: null }),
}));
