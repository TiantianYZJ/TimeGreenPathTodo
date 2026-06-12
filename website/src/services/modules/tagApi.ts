import { request } from '../api/client';
import type { ApiResponse, Tag, CreateTagData, UpdateTagData } from '../../types';

export const tagApi = {
  getList: () =>
    request.get<ApiResponse<{ tags: Tag[] }>>('/tags/list'),

  create: (data: CreateTagData) =>
    request.post<ApiResponse<{ tag: Tag }>>('/tags/create', data),

  update: (id: number, data: UpdateTagData) =>
    request.put<ApiResponse>(`/tags/${id}`, data),

  delete: (id: number) =>
    request.delete<ApiResponse>(`/tags/${id}`),
};
