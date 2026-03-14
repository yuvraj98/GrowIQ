// store/clientStore.js
// Zustand store for client state management
import { create } from 'zustand';

const useClientStore = create((set) => ({
    // State
    clients: [],
    selectedClient: null,
    isLoading: false,

    // Actions
    setClients: (clients) => set({ clients }),
    setSelectedClient: (client) => set({ selectedClient: client }),
    setLoading: (loading) => set({ isLoading: loading }),

    clearSelectedClient: () => set({ selectedClient: null }),
}));

export default useClientStore;
