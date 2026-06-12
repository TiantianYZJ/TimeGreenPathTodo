import { create } from 'zustand';

type ThemeMode = 'light' | 'dark';

interface UIState {
  sidebarCollapsed: boolean;
  themeMode: ThemeMode;
  isMobile: boolean;
  activeMenuKey: string;
  modalVisible: Record<string, boolean>;
  loading: Record<string, boolean>;
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setActiveMenuKey: (key: string) => void;
  showModal: (key: string) => void;
  hideModal: (key: string) => void;
  hideAllModals: () => void;
  isModalVisible: (key: string) => boolean;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
}

export const useUIStore = create<UIState & UIActions>()((set, get) => ({
  sidebarCollapsed: false,
  themeMode: (localStorage.getItem('theme-mode') as ThemeMode) || 'light',
  isMobile: false,
  activeMenuKey: '/',
  modalVisible: {},
  loading: {},

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  setThemeMode: (mode) => {
    localStorage.setItem('theme-mode', mode);
    document.documentElement.setAttribute('data-theme', mode);
    set({ themeMode: mode });
  },

  toggleThemeMode: () => {
    const next = get().themeMode === 'light' ? 'dark' : 'light';
    get().setThemeMode(next);
  },

  setIsMobile: (isMobile) => {
    set({ isMobile });
    if (isMobile) set({ sidebarCollapsed: true });
  },

  setActiveMenuKey: (key) => set({ activeMenuKey: key }),

  showModal: (key) =>
    set((s) => ({ modalVisible: { ...s.modalVisible, [key]: true } })),
  hideModal: (key) =>
    set((s) => ({ modalVisible: { ...s.modalVisible, [key]: false } })),
  hideAllModals: () => set({ modalVisible: {} }),
  isModalVisible: (key) => get().modalVisible[key] || false,

  setLoading: (key, loading) =>
    set((s) => ({ loading: { ...s.loading, [key]: loading } })),
  isLoading: (key) => get().loading[key] || false,
}));
