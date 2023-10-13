import { create } from 'zustand';

interface useLooseModalStore {
  isOpen: boolean;
  confirm: boolean;
  onOpen: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

export const useLooseModal = create<useLooseModalStore>((set) => ({
  isOpen: false,
  confirm: false,
  onOpen: () => set({ isOpen: true}),
  onClose: () => set({ isOpen: false}),
  onConfirm: () => set({ confirm: true}),
}));
