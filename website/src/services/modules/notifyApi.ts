import { request } from '../api/client';
import type { ApiResponse } from '../../types';

export const notifyApi = {
  subscribe: () =>
    request.post<ApiResponse>('/notify/subscribe'),

  schedule: (todoId: string, notifyTime: string) =>
    request.post<ApiResponse>('/notify/schedule', { todoId, notifyTime }),

  getByTodo: (todoId: string) =>
    request.get<ApiResponse>('/notify/by-todo', { params: { todoId } }),

  getList: () =>
    request.get<ApiResponse>('/notify/list'),

  update: (id: number, notifyTime: string) =>
    request.put<ApiResponse>(`/notify/${id}`, { notifyTime }),

  delete: (id: number) =>
    request.delete<ApiResponse>(`/notify/${id}`),
};
