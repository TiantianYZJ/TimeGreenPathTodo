import { request } from '../api/client';
import type { ApiResponse, Todo, CreateTodoData, UpdateTodoData, DeletedTodo } from '../../types';

export const todoApi = {
  getList: (params?: {
    page?: number;
    pageSize?: number;
    date?: string;
    completed?: number;
    includeDeleted?: boolean;
    comboId?: number;
  }) =>
    request.get<ApiResponse<{ todos: Todo[]; total: number }>>('/todos/list', { params }),

  getById: (id: string) =>
    request.get<ApiResponse<{ todo: Todo }>>(`/todos/${id}`),

  create: (data: CreateTodoData) =>
    request.post<ApiResponse<{ todo: Todo }>>('/todos/create', data),

  update: (id: string, data: UpdateTodoData) =>
    request.put<ApiResponse<{ todo: Todo }>>(`/todos/${id}`, data),

  delete: (id: string) =>
    request.delete<ApiResponse>(`/todos/${id}`),

  batchMove: (todoIds: string[], comboId: number) =>
    request.post<ApiResponse>('/todos/batch-move', { todoIds, comboId }),

  getDeleted: () =>
    request.get<ApiResponse<{ todos: DeletedTodo[] }>>('/todos/deleted'),

  restore: (todoId: string) =>
    request.post<ApiResponse>(`/todos/restore/${todoId}`),

  permanentDelete: (todoId: string) =>
    request.delete<ApiResponse>(`/todos/permanent/${todoId}`),

  fullSync: () =>
    request.get<ApiResponse<{ todos: Todo[]; deletedIds: string[] }>>('/todos/full-sync'),
};
