/**
 * 主题管理 Hook
 *
 * 管理应用的主题模式（亮色/暗色），支持：
 * - 从 localStorage 读取用户偏好
 * - 跟随系统主题偏好（prefers-color-scheme）
 * - 手动切换主题并持久化存储
 * - 监听系统主题变化（仅在用户未手动设置时）
 */

import { useState, useEffect, useCallback } from 'react';
import type { ThemeMode } from '@/stores/uiStore';

/** localStorage 中存储主题模式的键名 */
const THEME_STORAGE_KEY = 'theme-mode';

/** 系统媒体查询 */
const DARK_MODE_QUERY = '(prefers-color-scheme: dark)';

/**
 * 主题 Hook 返回值接口
 */
interface UseThemeReturn {
  /** 当前主题模式 */
  themeMode: ThemeMode;
  /** 是否为暗色模式 */
  isDark: boolean;
  /** 切换主题（亮色 <-> 暗色） */
  toggleTheme: () => void;
  /** 设置指定主题模式 */
  setThemeMode: (mode: ThemeMode) => void;
}

/**
 * 从 localStorage 获取用户保存的主题偏好
 *
 * @returns 主题模式字符串，如果没有保存则返回 null
 */
function getStoredTheme(): ThemeMode | null {
  if (typeof window === 'undefined') return null;

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }
  return null;
}

/**
 * 获取系统当前的主题偏好
 *
 * @returns 是否为暗色模式
 */
function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(DARK_MODE_QUERY).matches;
}

/**
 * 应用主题到 DOM
 *
 * 设置 document.documentElement 的 data-theme 属性，
 * 供 CSS 变量和样式选择器使用
 *
 * @param mode 要应用的主题模式
 */
function applyThemeToDOM(mode: ThemeMode): void {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', mode);
  }
}

/**
 * 主题管理 Hook
 *
 * 提供完整的主题切换功能，包括：
 * - 初始化时从 localStorage 读取用户偏好
 * - 如果没有手动设置过，则跟随系统主题
 * - 支持手动切换并持久化到 localStorage
 * - 自动监听系统主题变化（仅当用户未手动设置时）
 *
 * @returns 主题控制对象
 *
 * @example
 * ```tsx
 * function Header() {
 *   const { themeMode, isDark, toggleTheme } = useTheme();
 *
 *   return (
 *     <header>
 *       <button onClick={toggleTheme}>
 *         {isDark ? '🌙' : '☀️'}
 *       </button>
 *     </header>
 *   );
 * }
 * ```
 */
export function useTheme(): UseThemeReturn {
  // 记录用户是否手动设置过主题（用于决定是否跟随系统）
  const [hasUserPreference, setHasUserPreference] = useState<boolean>(() => {
    return getStoredTheme() !== null;
  });

  // 当前主题模式状态
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // 优先使用用户保存的偏好
    const stored = getStoredTheme();
    if (stored) {
      return stored;
    }
    // 否则跟随系统
    return getSystemPrefersDark() ? 'dark' : 'light';
  });

  /**
   * 设置主题模式并应用到 DOM 和 localStorage
   */
  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    applyThemeToDOM(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
    setHasUserPreference(true);
  }, []);

  /**
   * 切换主题模式
   * light <-> dark
   */
  const toggleTheme = useCallback(() => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  // 初始化时应用主题到 DOM
  useEffect(() => {
    applyThemeToDOM(themeMode);
  }, []);

  // 监听系统主题变化
  // 仅在用户未手动设置过主题时才跟随系统
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (hasUserPreference) return; // 用户已手动设置，不跟随系统

    const mediaQueryList = window.matchMedia(DARK_MODE_QUERY);

    const handler = (event: MediaQueryListEvent) => {
      const systemMode: ThemeMode = event.matches ? 'dark' : 'light';
      setThemeModeState(systemMode);
      applyThemeToDOM(systemMode);
      // 不更新 localStorage，保持"未手动设置"的状态
    };

    // 使用现代 API 监听变化
    mediaQueryList.addEventListener('change', handler);

    return () => {
      mediaQueryList.removeEventListener('change', handler);
    };
  }, [hasUserPreference]);

  return {
    themeMode,
    isDark: themeMode === 'dark',
    toggleTheme,
    setThemeMode,
  };
}
