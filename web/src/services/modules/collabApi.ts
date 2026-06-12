/**
 * 协作 API
 * 提供共享组合的加入、审批、共享待办管理等功能
 */

import { request } from '@/services/api/axios';
import type {
  SharedTodo,
  ComboMember,
  CollabRequest,
} from '@/types/collab';
import type {
  JoinCollabResponse,
  SendRequestResponse,
  RequestListResponse,
  ApproveRejectResponse,
  SharedCombosResponse,
  CreateSharedTodoParams,
  SharedTodoOperationResponse,
  CompleteSharedTodoParams,
  RemoveMemberResponse,
  LeaveCollabResponse,
} from '@/services/api/types';

/** 协作 API 模块 */
export const collabApi = {
  // ==================== 加入组合 ====================

  /**
   * 加入共享组合（需管理员审批）
   * @param shareCode 共享邀请码（8位）
   * @returns 操作结果和组合信息
   */
  join: (shareCode: string): Promise<JoinCollabResponse> => {
    return request.post<JoinCollabResponse>('/collab/join', { shareCode });
  },

  /**
   * 自动加入共享组合（无需审批）
   * @param shareCode 共享邀请码（8位）
   * @returns 操作结果和组合信息
   */
  autoJoin: (shareCode: string): Promise<JoinCollabResponse> => {
    return request.post<JoinCollabResponse>('/collab/auto-join', { shareCode });
  },

  /**
   * 发送加入申请
   * @param data 申请参数（包含 shareCode）
   * @returns 操作结果和请求 ID
   */
  request: (data: { shareCode: string }): Promise<SendRequestResponse> => {
    return request.post<SendRequestResponse>('/collab/request', data);
  },

  // ==================== 审批管理 ====================

  /**
   * 获取待处理的加入申请列表
   * @returns 申请列表
   */
  getRequests: (): Promise<RequestListResponse> => {
    return request.get<RequestListResponse>('/collab/requests');
  },

  /**
   * 批准加入申请
   * @param requestId 申请 ID
   * @returns 操作结果
   */
  approveRequest: (requestId: number): Promise<ApproveRejectResponse> => {
    return request.post<ApproveRejectResponse>(
      `/collab/requests/${requestId}/approve`
    );
  },

  /**
   * 拒绝加入申请
   * @param requestId 申请 ID
   * @returns 操作结果
   */
  rejectRequest: (requestId: number): Promise<ApproveRejectResponse> => {
    return request.post<ApproveRejectResponse>(
      `/collab/requests/${requestId}/reject`
    );
  },

  // ==================== 共享组合与待办 ====================

  /**
   * 获取用户加入的共享组合列表
   * @returns 共享组合列表
   */
  getSharedCombos: (): Promise<SharedCombosResponse> => {
    return request.get<SharedCombosResponse>('/collab/shared');
  },

  /**
   * 在共享组合中创建待办
   * @param comboId 共享组合 ID
   * @param data 待办数据
   * @returns 创建后的共享待办对象
   */
  createSharedTodo: (
    comboId: number,
    data: CreateSharedTodoParams
  ): Promise<SharedTodoOperationResponse> => {
    return request.post<SharedTodoOperationResponse>(
      `/collab/shared/${comboId}/todos`,
      data
    );
  },

  /**
   * 更新共享待办
   * @param comboId 共享组合 ID
   * @param todoId 共享待办 ID
   * @param data 需要更新的字段
   * @returns 更新后的共享待办对象
   */
  updateSharedTodo: (
    comboId: number,
    todoId: number,
    data: Partial<CreateSharedTodoParams>
  ): Promise<SharedTodoOperationResponse> => {
    return request.put<SharedTodoOperationResponse>(
      `/collab/shared/${comboId}/todos/${todoId}`,
      data
    );
  },

  /**
   * 删除共享待办
   * @param comboId 共享组合 ID
   * @param todoId 共享待办 ID
   * @returns 操作结果
   */
  deleteSharedTodo: (
    comboId: number,
    todoId: number
  ): Promise<SharedTodoOperationResponse> => {
    return request.remove<SharedTodoOperationResponse>(
      `/collab/shared/${comboId}/todos/${todoId}`
    );
  },

  /**
   * 完成/取消完成共享待办
   * @param comboId 共享组合 ID
   * @param todoId 共享待办 ID
   * @param completed 是否已完成
   * @returns 更新后的共享待办对象
   */
  completeSharedTodo: (
    comboId: number,
    todoId: number,
    completed: boolean
  ): Promise<SharedTodoOperationResponse> => {
    const params: CompleteSharedTodoParams = { completed };
    return request.put<SharedTodoOperationResponse>(
      `/collab/shared/${comboId}/todos/${todoId}/complete`,
      params
    );
  },

  // ==================== 成员管理 ====================

  /**
   * 移除组合成员（仅超管/管理可操作）
   * @param userId 要移除的用户 ID
   * @returns 操作结果
   */
  removeMember: (userId: number): Promise<RemoveMemberResponse> => {
    return request.remove<RemoveMemberResponse>(`/collab/member`, {
      data: { userId },
    });
  },

  /**
   * 退出共享组合
   * @param comboId 组合 ID
   * @returns 操作结果
   */
  leave: (comboId: number): Promise<LeaveCollabResponse> => {
    return request.post<LeaveCollabResponse>('/collab/leave', { comboId });
  },
};
