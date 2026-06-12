import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../services';
import type { UserInfo } from '../types';

interface AuthState {
  token: string | null;
  user: UserInfo | null;
  isLoading: boolean;
}

interface AuthActions {
  setToken: (token: string) => void;
  setUser: (user: UserInfo) => void;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  fetchUserInfo: () => Promise<void>;
  updateUserInfo: (data: { nickname?: string; avatarUrl?: string }) => Promise<void>;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isLoading: false,

      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),

      login: (token, user) => set({ token, user }),

      logout: () => {
        set({ token: null, user: null });
        window.location.href = '/login';
      },

      fetchUserInfo: async () => {
        set({ isLoading: true });
        try {
          const res = await authApi.getUserInfo();
          if (res.success && res.user) {
            set({ user: res.user });
          }
        } catch {
          // Error handled by interceptor
        } finally {
          set({ isLoading: false });
        }
      },

      updateUserInfo: async (data) => {
        const res = await authApi.updateUserInfo(data);
        if (res.success) {
          const { user } = get();
          if (user) {
            set({
              user: {
                ...user,
                ...(data.nickname && { nickname: data.nickname }),
                ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
              },
            });
          }
        }
      },

      isAuthenticated: () => {
        const { token, user } = get();
        return !!(token && user);
      },
    }),
    {
      name: 'timegreen-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
