import { useAuthStore } from '../stores';

export function useAuth() {
  const { token, user, isAuthenticated, logout } = useAuthStore();

  const hasRole = (role: 'admin' | 'owner' | 'admin' | 'member') => {
    if (role === 'admin') return user?.isAdmin || false;
    return false;
  };

  return {
    token,
    user,
    isAuthenticated: isAuthenticated(),
    isAdmin: user?.isAdmin || false,
    logout,
    hasRole,
  };
}
