/**
 * Zustand 状态管理层统一导出
 *
 * 提供所有 Store 的统一入口，支持两种导入方式：
 *
 * 方式一：直接使用 Store Hook（推荐）
 * ```typescript
 * import { useAuthStore, useTodoStore } from '@/stores';
 * const token = useAuthStore((s) => s.token);
 * const todos = useTodoStore((s) => s.todos);
 * ```
 *
 * 方式二：使用预定义的选择器 Hooks（性能优化）
 * ```typescript
 * import { useAuthToken, useFilteredTodos } from '@/stores';
 * const token = useAuthToken();
 * const todos = useFilteredTodos();
 * ```
 */

// ==================== Store 主 Hook（完整状态 + 操作） ====================

// 认证 Store - 管理登录/登出、Token、用户信息
export { useAuthStore } from './authStore';

// 待办事项 Store - 管理 Todo CRUD、筛选、批量操作、同步、远程协作
export { useTodoStore } from './todoStore';

// 组合 Store - 管理私有组合和共享组合的 CRUD
export { useComboStore } from './comboStore';

// 标签 Store - 管理系统标签和用户自定义标签
export { useTagStore } from './tagStore';

// UI Store - 管理全局界面状态（侧边栏、主题、弹窗等）
export { useUIStore } from './uiStore';

// 导出 UI Store 中的类型定义
export type { ThemeMode } from './uiStore';

// ==================== 选择器 Hooks（细粒度订阅，减少不必要的重渲染） ====================

// --- Auth 选择器 ---
export {
  useAuthToken,
  useCurrentUser,
  useIsAuthenticated,
  useAuthLoading,
} from './authStore';

// --- Todo 选择器 ---
export {
  useTodos,
  useFilteredTodos,
  useTodoFilter,
  useSelectedTodoIds,
  useTodoLoading,
  useTodoError,
  useSelectedCount,
  useTodoTotalCount,
  useFilteredTodoCount,
} from './todoStore';

// --- Combo 选择器 ---
export {
  useCombos,
  useSharedCombos,
  useCurrentCombo,
  useComboLoading,
  useAllComboCount,
} from './comboStore';

// --- Tag 选择器 ---
export {
  useSystemTags,
  useUserTags,
  useAllTags,
  useTagLoading,
  useTagTotalCount,
} from './tagStore';

// --- UI 选择器 ---
export {
  useSidebarCollapsed,
  useThemeMode,
  useIsMobile,
  useActiveMenuKey,
  useIsDarkMode,
  // 弹窗工厂函数和预定义弹窗 Hooks
  createModalHook,
  useAddTodoModal,
  useEditTodoModal,
  useAddComboModal,
  useEditComboModal,
  useDeleteConfirmModal,
  useQrCodeLoginModal,
} from './uiStore';
