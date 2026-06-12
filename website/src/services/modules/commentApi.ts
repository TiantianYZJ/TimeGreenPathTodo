import { request } from '../api/client';
import type { ApiResponse, Comment } from '../../types';

export const commentApi = {
  getList: (sharedTodoId: number) =>
    request.get<ApiResponse<{ comments: Comment[] }>>(`/comments/${sharedTodoId}`),

  create: (sharedTodoId: number, data: {
    content: string;
    parentId?: number;
    replyToUserId?: number;
  }) =>
    request.post<ApiResponse<{ comment: Comment }>>(`/comments/${sharedTodoId}`, data),

  delete: (commentId: number) =>
    request.delete<ApiResponse>(`/comments/${commentId}`),
};
