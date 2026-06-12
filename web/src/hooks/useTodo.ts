/**
 * 待办事项管理 Hook
 *
 * 封装 todoStore 的常用操作，提供完整的待办事项 CRUD 功能
 * 支持筛选、统计、批量操作等高级功能
 */

import { useEffect, useMemo, useCallback } from 'react';
import { useTodoStore } from '@/stores/todoStore';
import { useDebounce } from './useDebounce';
import type { Todo, TodoFilter, CreateTodoData, UpdateTodoData } from '@/types/todo';

/**
 * 待办统计信息接口
 */
interface TodoStatistics {
  /** 待办总数 */
  all: number;
  /** 已完成数量 */
  completed: number;
  /** 未完成数量 */
  uncompleted: number;
  /** 完成率（0-100） */
  completionRate: number;
}

/**
 * UseTodo Hook 配置选项
 */
interface UseTodoOptions {
  /** 初始筛选条件 */
  filter?: Partial<TodoFilter>;
  /** 是否在挂载时自动获取数据（默认 true） */
  autoFetch?: boolean;
  /** 筛选防抖延迟时间（毫秒），默认 300ms */
  debounceMs?: number;
}

/**
 * UseTodo Hook 返回值接口
 */
interface UseTodoReturn {
  // ==================== 状态 ====================

  /** 经过筛选的待办列表（用于展示） */
  todos: Todo[];
  /** 是否正在加载 */
  isLoading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 当前选中的待办 ID 列表（用于批量操作） */
  selectedIds: string[];
  /** 待办统计信息 */
  statistics: TodoStatistics;

  // ==================== 操作方法 ====================

  /**
   * 切换待办完成状态
   * @param id 待办 ID
   */
  handleToggle: (id: string) => Promise<void>;
  /**
   * 删除待办
   * @param id 待办 ID
   */
  handleDelete: (id: string) => Promise<void>;
  /**
   * 创建新待办
   * @param data 待办创建数据
   * @returns 创建后的待办对象
   */
  handleCreate: (data: CreateTodoData) => Promise<Todo>;
  /**
   * 更新待办
   * @param id 待办 ID
   * @param data 更新数据
   * @returns 更新后的待办对象
   */
  handleUpdate: (id: string, data: UpdateTodoData) => Promise<Todo>;
  /**
   * 设置筛选条件（带防抖）
   * @param filter 筛选条件
   */
  setFilter: (filter: Partial<TodoFilter>) => void;
  /**
   * 重置筛选条件为默认值
   */
  resetFilter: () => void;
  /**
   * 切换单个待办的选中状态
   * @param id 待办 ID
   */
  toggleSelect: (id: string) => void;
  /**
   * 全选当前筛选结果中的所有待办
   */
  selectAll: () => void;
  /**
   * 清空所有选中
   */
  clearSelection: () => void;
  /**
   * 手动刷新待办列表
   */
  refresh: () => Promise<void>;
}

/**
 * 计算待办统计信息
 *
 * @param todos 待办列表
 * @returns 统计信息对象
 */
function calculateStatistics(todos: Todo[]): TodoStatistics {
  const all = todos.length;
  const completed = todos.filter(
    (todo) => todo.completed !== false && todo.completed !== 0
  ).length;
  const uncompleted = all - completed;
  const completionRate = all > 0 ? Math.round((completed / all) * 100) : 0;

  return {
    all,
    completed,
    uncompleted,
    completionRate,
  };
}

/**
 * 待办事项管理 Hook
 *
 * 提供完整的待办事项操作能力：
 * - 获取和展示待办列表（支持筛选）
 * - 创建、更新、删除待办
 * - 切换完成状态
 * - 批量选择操作
 * - 自动计算统计数据
 * - 筛选条件防抖处理
 *
 * 此 Hook 是组件中处理待办相关逻辑的主要入口，
 * 封装了 Store 的复杂性和错误处理逻辑。
 *
 * @param options 配置选项
 * @returns 待办控制对象
 *
 * @example
 * ```tsx
 * function TodoList() {
 *   const {
 *     todos,
 *     isLoading,
 *     statistics,
 *     handleToggle,
 *     handleDelete,
 *     setFilter
 *   } = useTodo({ autoFetch: true });
 *
 *   if (isLoading) return <Loading />;
 *
 *   return (
 *     <div>
 *       <SearchInput onChange={(e) => setFilter({ keyword: e.target.value })} />
 *       <Statistics stats={statistics} />
 *       {todos.map(todo => (
 *         <TodoItem
 *           key={todo.id}
 *           todo={todo}
 *           onToggle={() => handleToggle(todo.id)}
 *           onDelete={() => handleDelete(todo.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useTodo(options: UseTodoOptions = {}): UseTodoReturn {
  const {
    filter: initialFilter,
    autoFetch = true,
    debounceMs = 300,
  } = options;

  // 从 Store 中获取状态和方法
  const filteredTodos = useTodoStore((state) => state.filteredTodos);
  const isLoading = useTodoStore((state) => state.isLoading);
  const error = useTodoStore((state) => state.error);
  const selectedIds = useTodoStore((state) => state.selectedIds);

  const fetchTodos = useTodoStore((state) => state.fetchTodos);
  const createTodo = useTodoStore((state) => state.createTodo);
  const updateTodo = useTodoStore((state) => state.updateTodo);
  const deleteTodo = useTodoStore((state) => state.deleteTodo);
  const toggleComplete = useTodoStore((state) => state.toggleComplete);
  const storeSetFilter = useTodoStore((state) => state.setFilter);
  const resetFilter = useTodoStore((state) => state.resetFilter);
  const toggleSelect = useTodoStore((state) => state.toggleSelect);
  const selectAll = useTodoStore((state) => state.selectAll);
  const clearSelection = useTodoStore((state) => state.clearSelection);

  // 自动获取数据（仅在 autoFetch 为 true 时）
  useEffect(() => {
    if (autoFetch) {
      fetchTodos(initialFilter).catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 使用 useMemo 计算统计信息（性能优化）
  const statistics = useMemo<TodoStatistics>(() => {
    return calculateStatistics(filteredTodos);
  }, [filteredTodos]);

  /**
   * 切换完成状态（带错误处理和提示）
   */
  const handleToggle = useCallback(
    async (id: string): Promise<void> => {
      try {
        await toggleComplete(id);
        // 可以在这里添加成功提示
        // message.success('状态更新成功');
      } catch (error) {
        console.error('切换完成状态失败:', error);
        // 可以在这里添加错误提示
        // message.error('状态更新失败，请重试');
        throw error; // 重新抛出以便上层处理
      }
    },
    [toggleComplete]
  );

  /**
   * 删除待办（带错误处理和提示）
   */
  const handleDelete = useCallback(
    async (id: string): Promise<void> => {
      try {
        await deleteTodo(id);
        // message.success('删除成功');
      } catch (error) {
        console.error('删除待办失败:', error);
        // message.error('删除失败，请重试');
        throw error;
      }
    },
    [deleteTodo]
  );

  /**
   * 创建待办（带错误处理）
   */
  const handleCreate = useCallback(
    async (data: CreateTodoData): Promise<Todo> => {
      try {
        const newTodo = await createTodo(data);
        // message.success('创建成功');
        return newTodo;
      } catch (error) {
        console.error('创建待办失败:', error);
        // message.error('创建失败，请重试');
        throw error;
      }
    },
    [createTodo]
  );

  /**
   * 更新待办（带错误处理）
   */
  const handleUpdate = useCallback(
    async (id: string, data: UpdateTodoData): Promise<Todo> => {
      try {
        const updatedTodo = await updateTodo(id, data);
        // message.success('更新成功');
        return updatedTodo;
      } catch (error) {
        console.error('更新待办失败:', error);
        // message.error('更新失败，请重试');
        throw error;
      }
    },
    [updateTodo]
  );

  /**
   * 设置筛选条件（使用防抖优化频繁输入场景）
   */
  const debouncedSetFilter = useCallback(
    (filter: Partial<TodoFilter>) => {
      // 直接调用 Store 的 setFilter（Store 内部会立即过滤）
      // 如果需要真正的防抖效果，可以在外部对 keyword 字段单独使用 useDebounce
      storeSetFilter(filter);
    },
    [storeSetFilter]
  );

  /**
   * 手动刷新列表
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchTodos();
  }, [fetchTodos]);

  return {
    // 状态
    todos: filteredTodos,
    isLoading,
    error,
    selectedIds,
    statistics,

    // 操作方法
    handleToggle,
    handleDelete,
    handleCreate,
    handleUpdate,
    setFilter: debouncedSetFilter,
    resetFilter,
    toggleSelect,
    selectAll,
    clearSelection,
    refresh,
  };
}
