/**
 * UI 状态管理 Store
 *
 * 管理应用的全局 UI 状态：
 * 侧边栏折叠、主题模式、移动端适配、菜单激活状态、弹窗/加载状态等
 *
 * 此 Store 不涉及业务数据，仅管理界面展示相关的状态，
 * 所有组件都可以安全地读取和修改这些状态。
 */

import { create } from 'zustand';

// ==================== 类型定义 ====================

/** 支持的主题模式 */
export type ThemeMode = 'light' | 'dark';

/** 弹窗标识键名（用于 Record<string, boolean> 的 key） */
type ModalKey =
  | 'addTodo'           // 添加待办弹窗
  | 'editTodo'          // 编辑待办弹窗
  | 'addCombo'          // 添加组合弹窗
  | 'editCombo'         // 编辑组合弹窗
  | 'addTag'            // 添加标签弹窗
  | 'editTag'           // 编辑标签弹窗
  | 'deleteConfirm'     // 删除确认弹窗
  | 'qrCodeLogin'       // 二维码登录弹窗
  | 'collaboration'     // 协作管理弹窗
  | 'joinCollab'        // 加入协作弹窗
  | 'todoDetail'        // 待办详情弹窗
  | 'dataImport'        // 数据导入弹窗
  | 'dataExport'        // 数据导出弹窗
  | 'notifySettings'    // 通知设置弹窗
  | string;             // 允许自定义扩展

/** 加载状态标识键名 */
type LoadingKey =
  | 'global'            // 全局加载
  | 'fetchTodos'        // 获取待办列表
  | 'fetchCombos'       // 获取组合列表
  | 'sync'              // 数据同步
  | 'submit'            // 表单提交
  | 'upload'            // 文件上传
  | string;             // 允许自定义扩展

/** UIStore 状态接口 */
interface UIState {
  /** 侧边栏是否折叠（桌面端） */
  sidebarCollapsed: boolean;
  /** 当前主题模式 */
  themeMode: ThemeMode;
  /** 是否为移动端视图 */
  isMobile: boolean;
  /** 当前激活的菜单项 key */
  activeMenuKey: string;
  /** 各弹窗的显示状态映射 */
  modalVisible: Record<string, boolean>;
  /** 各加载状态的映射 */
  loading: Record<string, boolean>;
}

/** UIStore Actions 接口 */
interface UIActions {
  // ==================== 布局控制 ====================

  /**
   * 切换侧边栏折叠状态
   * 折叠 <-> 展开
   */
  toggleSidebar: () => void;

  /**
   * 设置侧边栏折叠状态
   * @param collapsed 是否折叠
   */
  setSidebarCollapsed: (collapsed: boolean) => void;

  // ==================== 主题控制 ====================

  /**
   * 设置主题模式
   * 同时更新 HTML 根元素的 data-theme 属性以配合 CSS 变量切换
   * @param mode 目标主题模式：'light' 或 'dark'
   */
  setThemeMode: (mode: ThemeMode) => void;

  /**
   * 切换主题模式
   * light -> dark, dark -> light
   */
  toggleThemeMode: () => void;

  // ==================== 响应式控制 ====================

  /**
   * 设置是否为移动端视图
   * 通常由窗口 resize 监听器调用
   * @param value 是否为移动端
   */
  setIsMobile: (value: boolean) => void;

  // ==================== 菜单导航 ====================

  /**
   * 设置当前激活的菜单项
   * @param key 菜单项的唯一标识符
   */
  setActiveMenuKey: (key: string) => void;

  // ==================== 弹窗管理 ====================

  /**
   * 设置指定弹窗的显示/隐藏状态
   * @param key 弹窗标识键
   * @param visible 是否可见
   */
  setModalVisible: (key: ModalKey, visible: boolean) => void;

  /**
   * 显示指定弹窗
   * @param key 弹窗标识键
   */
  showModal: (key: ModalKey) => void;

  /**
   * 隐藏指定弹窗
   * @param key 弹窗标识键
   */
  hideModal: (key: ModalKey) => void;

  /**
   * 隐藏所有弹窗
   * 用于路由切换或全局操作时关闭所有打开的弹窗
   */
  hideAllModals: () => void;

  /**
   * 检查指定弹窗是否正在显示
   * @param key 弹窗标识键
   * @returns 是否可见
   */
  isModalVisible: (key: ModalKey) => boolean;

  // ==================== 加载状态管理 ====================

  /**
   * 设置指定加载状态
   * @param key 加载状态标识键
   * @param isLoading 是否正在加载
   */
  setLoading: (key: LoadingKey, isLoading: boolean) => void;

  /**
   * 开始指定加载状态
   * @param key 加载状态标识键
   */
  startLoading: (key: LoadingKey) => void;

  /**
   * 结束指定加载状态
   * @param key 加载状态标识键
   */
  stopLoading: (key: LoadingKey) => void;

  /**
   * 检查是否有任何加载正在进行
   * @returns 是否存在至少一个活跃的加载状态
   */
  hasAnyLoading: () => boolean;

  /**
   * 检查指定加载状态是否激活
   * @param key 加载状态标识键
   * @returns 是否正在加载
   */
  isLoading: (key: LoadingKey) => boolean;
}

/** UIStore 完整类型 */
type UIStore = UIState & UIActions;

// ==================== 初始状态 ====================

const initialState: UIState = {
  sidebarCollapsed: false,
  themeMode: 'light',
  isMobile: false,
  activeMenuKey: 'home',
  modalVisible: {},
  loading: {},
};

// ==================== Store 创建 ====================

export const useUIStore = create<UIStore>()((set, get) => ({
  // ---------- 初始状态 ----------
  ...initialState,

  // ---------- 布局控制 ----------

  /**
   * 切换侧边栏
   */
  toggleSidebar: (): void => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  /**
   * 设置侧边栏状态
   */
  setSidebarCollapsed: (collapsed: boolean): void => {
    set({ sidebarCollapsed: collapsed });
  },

  // ---------- 主题控制 ----------

  /**
   * 设置主题模式
   * 同步更新 DOM 以触发 CSS 变量切换
   */
  setThemeMode: (mode: ThemeMode): void => {
    set({ themeMode: mode });
    // 同步到 HTML 根元素，供 CSS 变量使用
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', mode);
      // 同时更新 localStorage 以便页面刷新后恢复
      localStorage.setItem('theme-mode', mode);
    }
  },

  /**
   * 切换主题模式
   */
  toggleThemeMode: (): void => {
    const currentMode = get().themeMode;
    get().setThemeMode(currentMode === 'light' ? 'dark' : 'light');
  },

  // ---------- 响应式控制 ----------

  /**
   * 设置移动端标识
   */
  setIsMobile: (value: boolean): void => {
    set({ isMobile: value });
    // 移动端自动收起侧边栏
    if (value) {
      set({ sidebarCollapsed: true });
    }
  },

  // ---------- 菜单导航 ----------

  /**
   * 设置当前激活菜单
   */
  setActiveMenuKey: (key: string): void => {
    set({ activeMenuKey: key });
  },

  // ---------- 弹窗管理 ----------

  /**
   * 设置弹窗显隐
   */
  setModalVisible: (key: ModalKey, visible: boolean): void => {
    set((state) => ({
      modalVisible: { ...state.modalVisible, [key]: visible },
    }));
  },

  /**
   * 显示弹窗
   */
  showModal: (key: ModalKey): void => {
    get().setModalVisible(key, true);
  },

  /**
   * 隐藏弹窗
   */
  hideModal: (key: ModalKey): void => {
    get().setModalVisible(key, false);
  },

  /**
   * 隐藏所有弹窗
   */
  hideAllModals: (): void => {
    // 将所有 true 的值设为 false
    const { modalVisible } = get();
    const resetModals: Record<string, boolean> = {};
    Object.keys(modalVisible).forEach((key) => {
      resetModals[key] = false;
    });
    set({ modalVisible: resetModals });
  },

  /**
   * 检查弹窗是否可见
   */
  isModalVisible: (key: ModalKey): boolean => {
    return get().modalVisible[key] ?? false;
  },

  // ---------- 加载状态管理 ----------

  /**
   * 设置加载状态
   */
  setLoading: (key: LoadingKey, isLoading: boolean): void => {
    set((state) => ({
      loading: { ...state.loading, [key]: isLoading },
    }));
  },

  /**
   * 开始加载
   */
  startLoading: (key: LoadingKey): void => {
    get().setLoading(key, true);
  },

  /**
   * 结束加载
   */
  stopLoading: (key: LoadingKey): void => {
    get().setLoading(key, false);
  },

  /**
   * 检查是否有任何加载在进行
   */
  hasAnyLoading: (): boolean => {
    const { loading } = get();
    return Object.values(loading).some((v) => v === true);
  },

  /**
   * 检查指定加载状态
   */
  isLoading: (key: LoadingKey): boolean => {
    return get().loading[key] ?? false;
  },
}));

// ==================== 选择器 Hooks ====================

/** 获取侧边栏折叠状态 */
export const useSidebarCollapsed = (): boolean =>
  useUIStore((state) => state.sidebarCollapsed);

/** 获取当前主题模式 */
export const useThemeMode = (): ThemeMode =>
  useUIStore((state) => state.themeMode);

/** 获取是否为移动端 */
export const useIsMobile = (): boolean =>
  useUIStore((state) => state.isMobile);

/** 获取当前激活菜单项 */
export const useActiveMenuKey = (): string =>
  useUIStore((state) => state.activeMenuKey);

/** 获取是否为暗色主题 */
export const useIsDarkMode = (): boolean =>
  useUIStore((state) => state.themeMode === 'dark');

/**
 * 创建特定弹窗的状态 Hook 工厂函数
 * 返回该弹窗的 [visible, setVisible] 元组，类似 useState 的用法
 * @param key 弹窗标识键
 * @returns [是否可见, 设置可见性的方法]
 */
export function createModalHook(key: ModalKey) {
  return (): [boolean, (visible: boolean) => void] => {
    const visible = useUIStore((s) => s.modalVisible[key] ?? false);
    const setModalVisible = useUIStore((s) => s.setModalVisible);
    return [visible, (v: boolean) => setModalVisible(key, v)];
  };
}

/**
 * 预定义常用弹窗 Hooks
 * 使用方式: const [visible, setVisible] = useAddTodoModal()
 */
export const useAddTodoModal = createModalHook('addTodo');
export const useEditTodoModal = createModalHook('editTodo');
export const useAddComboModal = createModalHook('addCombo');
export const useEditComboModal = createModalHook('editCombo');
export const useDeleteConfirmModal = createModalHook('deleteConfirm');
export const useQrCodeLoginModal = createModalHook('qrCodeLogin');
