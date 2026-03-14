// store/authStore.js
// Zustand auth store with persist
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set, get) => ({
            // State
            user: null,
            isAuthenticated: false,
            isLoading: false,

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            login: (user, accessToken, refreshToken) => {
                if (typeof window !== 'undefined') {
                    localStorage.setItem('growiq_access_token', accessToken);
                    localStorage.setItem('growiq_refresh_token', refreshToken);
                }
                set({ user, isAuthenticated: true });
            },

            logout: () => {
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('growiq_access_token');
                    localStorage.removeItem('growiq_refresh_token');
                }
                set({ user: null, isAuthenticated: false });
            },

            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'growiq-auth',
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

export default useAuthStore;
