import { create } from "zustand";

export type ModalType =
    | "createServer"

interface ModalData {
    apiUrl?: string;
    query?: Record<string, any>;
}

interface ModalStore {
    type: ModalType | null;
    data: ModalData;
    isOpen: boolean;
    onOpen: (type: ModalType, data?: ModalData) => void;
    onClose: () => void;
}

export const useModal = create<ModalStore>(
    (
        set: (arg0: { isOpen: boolean; type: ModalType | null; data?: ModalData }) => any
    ) => ({
        type: null,
        data: {},
        isOpen: false,
        onOpen: (type: any, data = {}) => set({ isOpen: true, type, data }),
        onClose: () => set({ type: null, isOpen: false }),
    })
);
