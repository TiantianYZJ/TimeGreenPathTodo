import { request } from '../api/client';
import type { ApiResponse, Combo, CreateComboData, UpdateComboData, ComboMember } from '../../types';

export const comboApi = {
  getList: () =>
    request.get<ApiResponse<{ combos: Combo[] }>>('/combos/list'),

  getById: (id: number) =>
    request.get<ApiResponse<{ combo: Combo }>>(`/combos/${id}`),

  create: (data: CreateComboData) =>
    request.post<ApiResponse<{ combo: Combo; id: number; shareCode: string | null }>>('/combos/create', data),

  update: (id: number, data: UpdateComboData) =>
    request.put<ApiResponse<{ combo: Combo }>>(`/combos/${id}`, data),

  delete: (id: number, action?: 'delete_todos') =>
    request.delete<ApiResponse>(`/combos/${id}`, { params: action ? { action } : undefined }),

  getMembers: (id: number) =>
    request.get<ApiResponse<{ members: ComboMember[] }>>(`/combos/${id}/members`),

  setMemberRole: (comboId: number, userId: number, role: string) =>
    request.put<ApiResponse>(`/combos/${comboId}/members/${userId}/role`, { role }),
};
