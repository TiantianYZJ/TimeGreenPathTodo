/**
 * 组合 API
 * 提供组合的增删改查、成员管理等功能
 */

import { request } from '@/services/api/axios';
import type {
  Combo,
  CreateComboData,
  UpdateComboData,
} from '@/types/combo';
import type {
  ComboListResponse,
  ComboDetailResponse,
  MemberListResponse,
  SetRoleParams,
  SetRoleResponse,
} from '@/services/api/types';

/** 组合 API 模块 */
export const comboApi = {
  // ==================== 基础 CRUD ====================

  /**
   * 获取组合列表
   * @returns 组合列表和总数
   */
  getList: (): Promise<ComboListResponse> => {
    return request.get<ComboListResponse>('/combos/list');
  },

  /**
   * 获取组合详情（含成员列表和共享待办）
   * @param id 组合 ID
   * @returns 组合详细信息，包含成员和待办数据
   */
  getById: (id: number): Promise<ComboDetailResponse> => {
    return request.get<ComboDetailResponse>(`/combos/${id}`);
  },

  /**
   * 创建组合
   * @param data 组合创建数据（名称、图标、颜色等）
   * @returns 创建后的完整组合对象
   */
  create: (data: CreateComboData): Promise<Combo> => {
    return request.post<Combo>('/combos/create', data);
  },

  /**
   * 更新组合信息
   * @param id 组合 ID
   * @param data 需要更新的字段
   * @returns 更新后的组合对象
   */
  update: (id: number, data: UpdateComboData): Promise<Combo> => {
    return request.put<Combo>(`/combos/${id}`, data);
  },

  /**
   * 删除组合
   * @param id 组合 ID
   * @returns 操作结果
   */
  delete: (id: number): Promise<{ success: boolean }> => {
    return request.remove(`/combos/${id}`);
  },

  // ==================== 成员管理 ====================

  /**
   * 获取组合成员列表
   * @param comboId 组合 ID
   * @returns 成员列表和总数
   */
  getMembers: (comboId: number): Promise<MemberListResponse> => {
    return request.get<MemberListResponse>(`/combos/${comboId}/members`);
  },

  /**
   * 设置成员角色
   * @param comboId 组合 ID
   * @param userId 目标用户 ID
   * @param role 新角色：owner | admin | member
   * @returns 设置结果和更新后的成员信息
   */
  setMemberRole: (
    comboId: number,
    userId: number,
    role: SetRoleParams['role']
  ): Promise<SetRoleResponse> => {
    const params: SetRoleParams = { role };
    return request.put<SetRoleResponse>(
      `/combos/${comboId}/members/${userId}/role`,
      params
    );
  },
};
