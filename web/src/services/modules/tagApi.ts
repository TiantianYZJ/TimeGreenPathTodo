/**
 * 标签 API
 * 提供标签的增删改查功能
 */

import { request } from '@/services/api/axios';
import type {
  Tag,
  CreateTagData,
  UpdateTagData,
} from '@/types/tag';
import type {
  TagListResponse,
  TagOperationResponse,
} from '@/services/api/types';

/** 标签 API 模块 */
export const tagApi = {
  /**
   * 获取标签列表（包含系统预设和用户自定义）
   * @returns 系统标签和用户自定义标签
   */
  getList: (): Promise<TagListResponse> => {
    return request.get<TagListResponse>('/tags/list');
  },

  /**
   * 创建自定义标签
   * @param data 标签数据（名称、颜色、图标）
   * @returns 创建后的完整标签对象
   */
  create: (data: CreateTagData): Promise<TagOperationResponse> => {
    return request.post<TagOperationResponse>('/tags/create', data);
  },

  /**
   * 更新标签信息
   * @param id 标签 ID
   * @param data 需要更新的字段
   * @returns 更新后的标签对象
   */
  update: (id: number, data: UpdateTagData): Promise<TagOperationResponse> => {
    return request.put<TagOperationResponse>(`/tags/${id}`, data);
  },

  /**
   * 删除自定义标签
   * 注意：系统预设标签不可删除，删除前需确保无待办使用该标签
   * @param id 标签 ID
   * @returns 操作结果
   */
  delete: (id: number): Promise<{ success: boolean }> => {
    return request.remove(`/tags/${id}`);
  },
};
