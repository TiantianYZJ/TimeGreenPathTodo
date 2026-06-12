/**
 * 待办事项状态管理 Store
 *
 * 使用 zustand + devtools 中间件实现
 * 管理待办事项的完整生命周期：获取、创建、更新、删除、筛选、同步、远程协作等
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { todoApi } from '@/services';
import type {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodoFilter,
} from '@/types/todo';
import type {
  TodoListResponse,
  SyncResponse,
  FullSyncResponse,
  BatchMoveResponse,
} from '@/services/api/types';

// ==================== 类型定义 ====================

/** TodoStore 状态接口 */
interface TodoState {
  /** 完整的待办事项列表（原始数据） */
  todos: Todo[];
  /** 根据当前过滤器计算后的待办列表（展示用） */
  filteredTodos: Todo[];
  /** 当前生效的筛选条件 */
  currentFilter: TodoFilter;
  /** 当前选中的待办 ID 列表（用于批量操作） */
  selectedIds: string[];
  /** 是否正在加载数据 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
}

/** TodoStore Actions 接口 */
interface TodoActions {
  // ==================== 数据获取 ====================

  /**
   * 获取待办事项列表
   * 可传入可选的筛选条件，不传则使用当前 currentFilter
   * @param filter 可选的筛选条件，用于临时覆盖当前筛选
   * @throws API 请求失败时抛出错误
   */
  fetchTodos: (filter?: Partial<TodoFilter>) => Promise<void>;

  // ==================== 单项 CRUD ====================

  /**
   * 创建新待办事项
   * 创建成功后将新待办插入到列表头部（最新优先）
   * @param data 待办创建数据
   * @returns 创建后的完整待办对象
   * @throws 创建失败时抛出错误
   */
  createTodo: (data: CreateTodoData) => Promise<Todo>;

  /**
   * 更新指定待办事项
   * 更新成功后同步更新本地列表中对应项
   * @param id 待办 ID
   * @param data 需要更新的字段
   * @returns 更新后的完整待办对象
   * @throws 更新失败时抛出错误
   */
  updateTodo: (id: string, data: UpdateTodoData) => Promise<Todo>;

  /**
   * 删除待办事项（软删除）
   * 调用 API 执行软删除后从本地列表中移除该条目
   * @param id 待办 ID
   * @throws 删除失败时抛出错误
   */
  deleteTodo: (id: string) => Promise<void>;

  /**
   * 切换待办的完成状态
   * 未完成 -> 完成时间戳(Date.now())
   * 已完成 -> false（未完成）
   * @param id 待办 ID
   * @throws 操作失败时抛出错误
   */
  toggleComplete: (id: string) => Promise<void>;

  /**
   * 切换待办的收藏状态
   * @param id 待办 ID
   * @throws 操作失败时抛出错误
   */
  toggleStar: (id: string) => Promise<void>;

  // ==================== 批量操作 ====================

  /**
   * 批量删除待办事项
   * 逐个调用 deleteTodo 或使用批量接口
   * @param ids 待办 ID 数组
   * @returns 成功/失败计数
   * @throws 操作失败时抛出错误
   */
  batchDelete: (ids: string[]) => Promise<{ successCount: number; failCount: number }>;

  /**
   * 批量移动待办到指定组合
   * 移动完成后刷新列表以反映最新状态
   * @param ids 待办 ID 数组
   * @param comboId 目标组合 ID，null 表示移出组合
   * @returns 移动结果统计
   * @throws 操作失败时抛出错误
   */
  batchMoveToCombo: (ids: string[], comboId: string | null) => Promise<BatchMoveResponse>;

  // ==================== 筛选与选择 ====================

  /**
   * 设置/合并筛选条件
   * 将新条件与现有条件浅合并后重新计算 filteredTodos
   * @param filter 要更新的筛选字段（部分或全部）
   */
  setFilter: (filter: Partial<TodoFilter>) => void;

  /**
   * 重置筛选条件为默认值
   */
  resetFilter: () => void;

  /**
   * 切换单个待办的选中状态
   * 已选中则取消选中，未选中则添加
   * @param id 待办 ID
   */
  toggleSelect: (id: string) => void;

  /**
   * 全选当前 filteredTodos 中所有待办
   */
  selectAll: () => void;

  /**
   * 清空所有选中状态
   */
  clearSelection: () => void;

  // ==================== 数据同步 ====================

  /**
   * 增量同步到云端
   * 将本地变更推送到服务端并拉取远程变更
   * @throws 同步失败时抛出错误
   */
  syncToCloud: () => Promise<SyncResponse>;

  /**
   * 从云端全量同步
   * 拉取服务端全部数据覆盖本地
   * @throws 同步失败时抛出错误
   */
  syncFromCloud: () => Promise<FullSyncResponse>;

  // ==================== WebSocket 远程操作 ====================
  // 以下方法由 WebSocket 消息触发，用于实时协作场景

  /**
   * 远程添加待办（其他用户通过 WebSocket 推送的新待办）
   * 将远程待办插入到列表头部
   * @param todo 远程推送的待办对象
   */
  addTodoFromRemote: (todo: Todo) => void;

  /**
   * 远程更新待办（其他用户修改了待办内容）
   * 在本地列表中找到对应项并更新
   * @param todo 远程推送的更新后待办对象
   */
  updateTodoFromRemote: (todo: Todo) => void;

  /**
   * 远程删除待办（其他用户删除了待办）
   * 从本地列表中移除对应项
   * @param id 被删除的待办 ID
   */
  removeTodoFromRemote: (id: string) => void;

  /**
   * 远程切换完成状态（其他用户标记了完成/未完成）
   * 在本地列表中更新对应待办的 completed 字段
   * @param id 待办 ID
   * @param completed 新的完成状态值
   */
  toggleCompleteFromRemote: (id: string, completed: boolean | number) => void;
}

/** TodoStore 完整类型 */
type TodoStore = TodoState & TodoActions;

// ==================== 常量与默认值 ====================

/** 默认筛选条件 */
const DEFAULT_FILTER: TodoFilter = {
  status: 'all',
  comboId: null,
  tagIds: [],
  dateRange: null,
  keyword: '',
};

/** 初始状态 */
const initialState: TodoState = {
  todos: [],
  filteredTodos: [],
  currentFilter: { ...DEFAULT_FILTER },
  selectedIds: [],
  isLoading: false,
  error: null,
};

// ==================== 内部辅助函数 ====================

/**
 * 根据筛选条件对待办列表进行过滤
 *
 * 支持多维度的复合筛选：
 * - status: 全部 / 已完成 / 未完成
 * - comboId: 所属组合过滤
 * - tagIds: 标签过滤（交集逻辑：需包含所有指定标签）
 * - dateRange: 日期范围过滤
 * - keyword: 关键词搜索（匹配标题和备注）
 *
 * @param todos 原始待办列表
 * @param filter 筛选条件
 * @returns 过滤后的待办列表
 */
function applyFilter(todos: Todo[], filter: TodoFilter): Todo[] {
  let result = [...todos];

  // 1. 按完成状态筛选
  if (filter.status === 'completed') {
    result = result.filter((todo) => todo.completed !== false && todo.completed !== 0);
  } else if (filter.status === 'uncompleted') {
    result = result.filter((todo) => todo.completed === false || todo.completed === 0);
  }
  // 'all' 不做过滤

  // 2. 按所属组合筛选（兼容数字/字符串类型）
  if (filter.comboId !== null && filter.comboId !== undefined) {
    result = result.filter((todo) => {
      if (!todo.comboId) return false;
      return String(todo.comboId) === String(filter.comboId);
    });
  }

  // 3. 按标签筛选（交集：必须包含所有指定的标签ID，兼容数字/字符串）
  if (filter.tagIds && filter.tagIds.length > 0) {
    result = result.filter((todo) => {
      if (!todo.tags || todo.tags.length === 0) return false;
      const todoTagStrs = todo.tags.map((t) => String(t));
      return filter.tagIds!.every((tagId) => todoTagStrs.includes(String(tagId)));
    });
  }

  // 4. 按日期范围筛选
  if (filter.dateRange && filter.dateRange[0] && filter.dateRange[1]) {
    const [startDate, endDate] = filter.dateRange;
    result = result.filter((todo) => {
      return todo.setDate >= startDate && todo.setDate <= endDate;
    });
  }

  // 5. 按关键词搜索（模糊匹配标题和备注）
  if (filter.keyword && filter.keyword.trim() !== '') {
    const keyword = filter.keyword.trim().toLowerCase();
    result = result.filter(
      (todo) =>
        todo.text.toLowerCase().includes(keyword) ||
        (todo.remarks && todo.remarks.toLowerCase().includes(keyword))
    );
  }

  return result;
}

/**
 * 计算当前最大版本号
 * 用于增量同步时确定本地最新版本
 * @param todos 待办列表
 * @returns 最大版本号，无数据时返回 0
 */
function getMaxVersion(todos: Todo[]): number {
  if (todos.length === 0) return 0;
  return Math.max(...todos.map((t) => t.version ?? 0));
}

// ==================== Store 创建 ====================

export const useTodoStore = create<TodoStore>()(
  devtools(
    (set, get) => ({
      // ---------- 初始状态 ----------
      ...initialState,

      // ---------- 数据获取 ----------

      /**
       * 获取待办列表
       * 支持可选参数临时覆盖当前筛选条件
       */
      fetchTodos: async (filter?: Partial<TodoFilter>): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          const effectiveFilter = filter
            ? { ...get().currentFilter, ...filter }
            : get().currentFilter;
          const response: TodoListResponse = await todoApi.getList(effectiveFilter);

          // 后端返回 { todos: [...], total, page, pageSize }
          const newTodos = response.todos ?? [];
          const newCurrentFilter = effectiveFilter;

          set({
            todos: newTodos,
            filteredTodos: applyFilter(newTodos, newCurrentFilter),
            currentFilter: newCurrentFilter,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : '获取待办列表失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ---------- 单项 CRUD ----------

      /**
       * 创建待办
       * 成功后插入到列表头部
       */
      createTodo: async (data: CreateTodoData): Promise<Todo> => {
        set({ isLoading: true, error: null });
        try {
          const newTodo = await todoApi.create(data);
          const { todos, currentFilter } = get();
          const updatedTodos = [newTodo, ...todos];

          set({
            todos: updatedTodos,
            filteredTodos: applyFilter(updatedTodos, currentFilter),
            isLoading: false,
          });

          return newTodo;
        } catch (error) {
          const message = error instanceof Error ? error.message : '创建待办失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      /**
       * 更新待办
       * 在列表中找到对应 ID 的项进行替换更新
       */
      updateTodo: async (id: string, data: UpdateTodoData): Promise<Todo> => {
        set({ isLoading: true, error: null });
        try {
          const updatedTodo = await todoApi.update(id, data);
          const { todos, currentFilter } = get();
          const updatedTodos = todos.map((todo) =>
            todo.id === id ? updatedTodo : todo
          );

          set({
            todos: updatedTodos,
            filteredTodos: applyFilter(updatedTodos, currentFilter),
            isLoading: false,
          });

          return updatedTodo;
        } catch (error) {
          const message = error instanceof Error ? error.message : '更新待办失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      /**
       * 删除待办（软删除）
       * 从本地列表中移除该条目
       */
      deleteTodo: async (id: string): Promise<void> => {
        set({ isLoading: true, error: null });
        try {
          await todoApi.delete(id);
          const { todos, currentFilter, selectedIds } = get();
          const updatedTodos = todos.filter((todo) => todo.id !== id);
          const updatedSelectedIds = selectedIds.filter((sid) => sid !== id);

          set({
            todos: updatedTodos,
            filteredTodos: applyFilter(updatedTodos, currentFilter),
            selectedIds: updatedSelectedIds,
            isLoading: false,
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : '删除待办失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      /**
       * 切换完成状态（乐观更新：先更新本地UI，再同步API）
       * false/0 -> Date.now()（已完成）
       * 时间戳 -> false（取消完成）
       */
      toggleComplete: async (id: string): Promise<void> => {
        const { todos, currentFilter } = get();
        const targetTodo = todos.find((t) => t.id === id);
        if (!targetTodo) {
          throw new Error(`未找到 ID 为 ${id} 的待办事项`);
        }

        // 计算新的完成状态
        const newCompleted: boolean | number =
          targetTodo.completed === false || targetTodo.completed === 0
            ? Date.now()
            : false;

        // 乐观更新：立即更新本地状态
        const optimisticTodos = todos.map((todo) =>
          todo.id === id ? { ...todo, completed: newCompleted } : todo
        );
        set({
          todos: optimisticTodos,
          filteredTodos: applyFilter(optimisticTodos, currentFilter),
        });

        // 后台同步到服务器（失败时回滚）
        try {
          await todoApi.update(id, { completed: newCompleted });
        } catch (error) {
          // 回滚到原始状态
          set({
            todos,
            filteredTodos: applyFilter(todos, currentFilter),
          });
          throw error;
        }
      },

      /**
       * 切换收藏状态（乐观更新：先更新本地UI，再同步API）
       */
      toggleStar: async (id: string): Promise<void> => {
        const { todos, currentFilter } = get();
        const targetTodo = todos.find((t) => t.id === id);
        if (!targetTodo) {
          throw new Error(`未找到 ID 为 ${id} 的待办事项`);
        }

        const newIsStar = !targetTodo.isStar;

        // 乐观更新：立即更新本地状态
        const optimisticTodos = todos.map((todo) =>
          todo.id === id ? { ...todo, isStar: newIsStar } : todo
        );
        set({
          todos: optimisticTodos,
          filteredTodos: applyFilter(optimisticTodos, currentFilter),
        });

        // 后台同步到服务器（失败时回滚）
        try {
          await todoApi.update(id, { isStar: newIsStar });
        } catch (error) {
          set({
            todos,
            filteredTodos: applyFilter(todos, currentFilter),
          });
          throw error;
        }
      },

      // ---------- 批量操作 ----------

      /**
       * 批量删除
       * 逐个调用删除接口
       */
      batchDelete: async (
        ids: string[]
      ): Promise<{ successCount: number; failCount: number }> => {
        let successCount = 0;
        let failCount = 0;

        for (const id of ids) {
          try {
            await todoApi.delete(id);
            successCount++;
          } catch {
            failCount++;
          }
        }

        // 刷新列表以反映删除结果
        const { todos, currentFilter, selectedIds } = get();
        const deletedSet = new Set(ids);
        const updatedTodos = todos.filter((todo) => !deletedSet.has(todo.id));
        const updatedSelectedIds = selectedIds.filter((sid) => !deletedSet.has(sid));

        set({
          todos: updatedTodos,
          filteredTodos: applyFilter(updatedTodos, currentFilter),
          selectedIds: updatedSelectedIds,
        });

        return { successCount, failCount };
      },

      /**
       * 批量移动到组合
       */
      batchMoveToCombo: async (
        ids: string[],
        comboId: string | null
      ): Promise<BatchMoveResponse> => {
        set({ isLoading: true, error: null });
        try {
          const response = await todoApi.batchMove(ids, comboId);

          // 移动后刷新列表以获取最新的 comboId 信息
          await get().fetchTodos();

          // 清空选择
          set({ selectedIds: [], isLoading: false });

          return response;
        } catch (error) {
          const message = error instanceof Error ? error.message : '批量移动失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ---------- 筛选与选择 ----------

      /**
       * 合并更新筛选条件
       * 浅合并后自动重新计算 filteredTodos
       */
      setFilter: (filter: Partial<TodoFilter>): void => {
        const { todos, currentFilter } = get();
        const newFilter = { ...currentFilter, ...filter };
        set({
          currentFilter: newFilter,
          filteredTodos: applyFilter(todos, newFilter),
        });
      },

      /**
       * 重置筛选条件为默认值
       */
      resetFilter: (): void => {
        const { todos } = get();
        set({
          currentFilter: { ...DEFAULT_FILTER },
          filteredTodos: applyFilter(todos, DEFAULT_FILTER),
        });
      },

      /**
       * 切换单个选中状态
       */
      toggleSelect: (id: string): void => {
        const { selectedIds } = get();
        const isSelected = selectedIds.includes(id);

        set({
          selectedIds: isSelected
            ? selectedIds.filter((sid) => sid !== id)
            : [...selectedIds, id],
        });
      },

      /**
       * 全选当前 filteredTodos
       */
      selectAll: (): void => {
        const { filteredTodos } = get();
        set({
          selectedIds: filteredTodos.map((todo) => todo.id),
        });
      },

      /**
       * 清空所有选中
       */
      clearSelection: (): void => {
        set({ selectedIds: [] });
      },

      // ---------- 数据同步 ----------

      /**
       * 增量同步到云端
       * 将本地最新版本号发送给服务端，获取差异变更
       */
      syncToCloud: async (): Promise<SyncResponse> => {
        set({ isLoading: true, error: null });
        try {
          const localVersion = getMaxVersion(get().todos);
          const syncResult = await todoApi.sync(localVersion);

          // 应用服务端返回的变更
          const { todos: currentTodos, currentFilter } = get();

          // 1. 更新已变更的待办
          let updatedTodos = currentTodos.map((localTodo) => {
            const remoteUpdate = syncResult.updatedTodos.find(
              (r) => r.id === localTodo.id
            );
            return remoteUpdate ?? localTodo;
          });

          // 2. 添加新增的远程待办（本地没有的）
          const localIdSet = new Set(currentTodos.map((t) => t.id));
          const newRemoteTodos = syncResult.updatedTodos.filter(
            (r) => !localIdSet.has(r.id)
          );
          updatedTodos = [...newRemoteTodos, ...updatedTodos];

          // 3. 删除被远程删除的待办
          if (syncResult.deletedIds.length > 0) {
            const deletedIdSet = new Set(syncResult.deletedIds);
            updatedTodos = updatedTodos.filter((t) => !deletedIdSet.has(t.id));
          }

          set({
            todos: updatedTodos,
            filteredTodos: applyFilter(updatedTodos, currentFilter),
            isLoading: false,
          });

          return syncResult;
        } catch (error) {
          const message = error instanceof Error ? error.message : '增量同步失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      /**
       * 从云端全量同步
       * 用服务端完整数据替换本地数据
       */
      syncFromCloud: async (): Promise<FullSyncResponse> => {
        set({ isLoading: true, error: null });
        try {
          const fullSyncResult = await todoApi.fullSync();

          const { currentFilter } = get();
          set({
            todos: fullSyncResult.todos,
            filteredTodos: applyFilter(fullSyncResult.todos, currentFilter),
            isLoading: false,
          });

          return fullSyncResult;
        } catch (error) {
          const message = error instanceof Error ? error.message : '全量同步失败';
          set({ isLoading: false, error: message });
          throw error;
        }
      },

      // ---------- WebSocket 远程操作 ----------

      /**
       * 远程添加待办
       * 其他用户通过 WebSocket 推送的新待办
       */
      addTodoFromRemote: (todo: Todo): void => {
        const { todos, currentFilter } = get();
        // 避免重复添加
        if (todos.some((t) => t.id === todo.id)) return;

        const updatedTodos = [todo, ...todos];
        set({
          todos: updatedTodos,
          filteredTodos: applyFilter(updatedTodos, currentFilter),
        });
      },

      /**
       * 远程更新待办
       * 其他用户通过 WebSocket 推送的待办更新
       */
      updateTodoFromRemote: (todo: Todo): void => {
        const { todos, currentFilter } = get();
        const updatedTodos = todos.map((t) => (t.id === todo.id ? todo : t));

        set({
          todos: updatedTodos,
          filteredTodos: applyFilter(updatedTodos, currentFilter),
        });
      },

      /**
       * 远程删除待办
       * 其他用户通过 WebSocket 推送的删除通知
       */
      removeTodoFromRemote: (id: string): void => {
        const { todos, currentFilter, selectedIds } = get();
        const updatedTodos = todos.filter((t) => t.id !== id);
        const updatedSelectedIds = selectedIds.filter((sid) => sid !== id);

        set({
          todos: updatedTodos,
          filteredTodos: applyFilter(updatedTodos, currentFilter),
          selectedIds: updatedSelectedIds,
        });
      },

      /**
       * 远程切换完成状态
       * 其他用户通过 WebSocket 推送的状态变更
       */
      toggleCompleteFromRemote: (id: string, completed: boolean | number): void => {
        const { todos, currentFilter } = get();
        const updatedTodos = todos.map((t) =>
          t.id === id ? { ...t, completed } : t
        );

        set({
          todos: updatedTodos,
          filteredTodos: applyFilter(updatedTodos, currentFilter),
        });
      },
    }),
    {
      name: 'TodoStore',
    }
  )
);

// ==================== 选择器 Hooks ====================

/** 获取待办列表（原始数据） */
export const useTodos = (): Todo[] =>
  useTodoStore((state) => state.todos);

/** 获取经过筛选的待办列表 */
export const useFilteredTodos = (): Todo[] =>
  useTodoStore((state) => state.filteredTodos);

/** 获取当前筛选条件 */
export const useTodoFilter = (): TodoFilter =>
  useTodoStore((state) => state.currentFilter);

/** 获取选中的待办 ID 列表 */
export const useSelectedTodoIds = (): string[] =>
  useTodoStore((state) => state.selectedIds);

/** 获取是否正在加载 */
export const useTodoLoading = (): boolean =>
  useTodoStore((state) => state.isLoading);

/** 获取错误信息 */
export const useTodoError = (): string | null =>
  useTodoStore((state) => state.error);

/** 获取选中数量 */
export const useSelectedCount = (): number =>
  useTodoStore((state) => state.selectedIds.length);

/** 获取待办总数 */
export const useTodoTotalCount = (): number =>
  useTodoStore((state) => state.todos.length);

/** 获取筛选后的数量 */
export const useFilteredTodoCount = (): number =>
  useTodoStore((state) => state.filteredTodos.length);
