import { request } from '../api/client';
import type { ApiResponse, SharedTodo, CollabRequest, Combo } from '../../types';

export const collabApi = {
  join: (shareCode: string) =>
    request.post<ApiResponse<{ combo: Combo; isMember: boolean; hasPendingRequest: boolean }>>('/collab/join', { shareCode }),

  autoJoin: (shareCode: string) =>
    request.post<ApiResponse>('/collab/auto-join', { shareCode }),

  sendRequest: (shareCode: string, message?: string) =>
    request.post<ApiResponse>('/collab/request', { shareCode, message }),

  getRequests: (comboId: number) =>
    request.get<ApiResponse<{ requests: CollabRequest[] }>>('/collab/requests', { params: { comboId } }),

  approveRequest: (requestId: number) =>
    request.post<ApiResponse>(`/collab/requests/${requestId}/approve`),

  rejectRequest: (requestId: number) =>
    request.post<ApiResponse>(`/collab/requests/${requestId}/reject`),

  getSharedCombos: () =>
    request.get<ApiResponse<{ combos: Combo[] }>>('/collab/shared'),

  createSharedTodo: (comboId: number, data: {
    text: string;
    setDate?: string;
    setTime?: string;
    remarks?: string;
    assignType?: string;
    excludeType?: string;
    assignUserIds?: number[];
    images?: string[];
    location?: { name: string; address?: string; latitude: number; longitude: number } | null;
  }) =>
    request.post<ApiResponse<{ todo: SharedTodo }>>(`/collab/shared/${comboId}/todos`, data),

  updateSharedTodo: (comboId: number, todoId: number, data: Record<string, unknown>) =>
    request.put<ApiResponse>(`/collab/shared/${comboId}/todos/${todoId}`, data),

  completeSharedTodo: (comboId: number, todoId: number) =>
    request.put<ApiResponse>(`/collab/shared/${comboId}/todos/${todoId}/complete`),

  deleteSharedTodo: (comboId: number, todoId: number) =>
    request.delete<ApiResponse>(`/collab/shared/${comboId}/todos/${todoId}`),

  removeMember: (comboId: number, userId: number) =>
    request.delete<ApiResponse>('/collab/member', { params: { comboId, userId } }),

  leave: (comboId: number) =>
    request.post<ApiResponse>('/collab/leave', { comboId }),
};
