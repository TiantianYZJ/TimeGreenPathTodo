/**
 * 待办事项 API
 * 提供待办的增删改查、同步、回收站等功能
 */

import { request } from '@/services/api/axios';
import type {
  Todo,
  CreateTodoData,
  UpdateTodoData,
  TodoFilter,
} from '@/types/todo';
import type {
  TodoListResponse,
  CreateTodoResponse,
  UpdateTodoResponse,
  BatchMoveParams,
  BatchMoveResponse,
  SyncParams,
  SyncResponse,
  FullSyncResponse,
  DeletedTodosResponse,
  RestoreTodoResponse,
} from '@/services/api/types';

/** 待办事项 API 模块 */
export const todoApi = {
  // ==================== 基础 CRUD ====================

  /**
   * 获取待办事项列表
   * @param filter 可选的过滤条件
   * @returns 待办列表和总数
   */
  getList: (filter?: Partial<TodoFilter>): Promise<TodoListResponse> => {
    return request.get<TodoListResponse>('/todos/list', { params: { ...filter, pageSize: 9999 } });
  },

  /**
   * 获取单个待办事项详情
   * 后端返回 { success: true, todo: {...} }，需提取 .todo
   * @param id 待办 ID
   * @returns 待办详情
   */
  getById: (id: string): Promise<Todo> => {
    return request.get<{ success: boolean; todo: Todo }>(`/todos/${id}`).then((res) => res.todo);
  },

  /**
   * 创建待办事项
   * 后端返回 { success: true, todo: {...} }，需提取 .todo
   * @param data 待办数据
   * @returns 创建后的完整待办对象
   */
  create: (data: CreateTodoData): Promise<CreateTodoResponse> => {
    return request.post<{ success: boolean; todo: CreateTodoResponse }>('/todos/create', data).then((res) => res.todo);
  },

  /**
   * 更新待办事项
   * 后端返回 { success: true, message, todo: {...} }，需提取 .todo
   * @param id 待办 ID
   * @param data 需要更新的字段
   * @returns 更新后的完整待办对象
   */
  update: (id: string, data: UpdateTodoData): Promise<UpdateTodoResponse> => {
    return request.put<{ success: boolean; message: string; todo: UpdateTodoResponse }>(`/todos/${id}`, data).then((res) => res.todo);
  },

  /**
   * 删除待办事项（软删除）
   * @param id 待办 ID
   * @returns 操作结果
   */
  delete: (id: string): Promise<{ success: boolean }> => {
    return request.remove(`/todos/${id}`);
  },

  // ==================== 批量操作 ====================

  /**
   * 批量移动待办到指定组合
   * @param ids 待办 ID 数组
   * @param comboId 目标组合 ID（null 表示移出组合）
   * @returns 移动结果统计
   */
  batchMove: (ids: string[], comboId: string | null): Promise<BatchMoveResponse> => {
    const params: BatchMoveParams = { ids, comboId };
    return request.post<BatchMoveResponse>('/todos/batch-move', params);
  },

  // ==================== 数据同步 ====================

  /**
   * 增量同步
   * 获取自指定版本以来的变更数据
   * @param localVersion 本地最新版本号
   * @returns 变更数据和服务器版本号
   */
  sync: (localVersion: number): Promise<SyncResponse> => {
    const params: SyncParams = { localVersion };
    return request.post<SyncResponse>('/todos/sync', params);
  },

  /**
   * 全量同步
   * 获取所有待办数据
   * @returns 完整的待办列表和版本号
   */
  fullSync: (): Promise<FullSyncResponse> => {
    return request.get<FullSyncResponse>('/todos/full-sync');
  },

  // ==================== 回收站 ====================

  /**
   * 获取已删除的待办列表
   * @returns 已删除待办列表和总数
   */
  getDeleted: (): Promise<DeletedTodosResponse> => {
    return request.get<DeletedTodosResponse>('/todos/deleted');
  },

  /**
   * 恢复已删除的待办
   * @param todoId 待办 ID
   * @returns 恢复结果和恢复后的待办对象
   */
  restore: (todoId: string): Promise<RestoreTodoResponse> => {
    return request.post<RestoreTodoResponse>(`/todos/restore/${todoId}`);
  },

  /**
   * 永久删除待办
   * @param todoId 待办 ID
   * @returns 操作结果
   */
  permanentDelete: (todoId: string): Promise<{ success: boolean }> => {
    return request.remove<{ success: boolean }>(`/todos/permanent/${todoId}`);
  },
};
