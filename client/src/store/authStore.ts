import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  setToken: (token: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { accessToken, user } = response.data;
          set({
            token: accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, displayName: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            email,
            password,
            displayName,
          });
          const { accessToken, user } = response.data;
          set({
            token: accessToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      setToken: async (token: string) => {
        set({ token, isLoading: true });
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      },

      updateProfile: async (data) => {
        const { token } = get();
        try {
          const response = await api.put('/users/profile', data, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ user: response.data });
        } catch (error: any) {
          set({ error: error.response?.data?.message || 'Update failed' });
          throw error;
        }
      },

      checkAuth: async () => {
        const { token } = get();
        if (!token) {
          set({ isLoading: false, isAuthenticated: false });
          return;
        }

        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({
            user: response.data,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
      onRehydrateStorage: () => (state) => {
        // Check auth on rehydration
        state?.checkAuth();
      },
    }
  )
);
