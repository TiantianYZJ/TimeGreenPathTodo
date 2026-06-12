/**
 * 协作相关类型定义
 */

export interface SharedTodoCreator {
  id: number;
  nickname: string;
  avatar: string;
}

export interface SharedTodoAssignment {
  user_id: number;
  nickname: string;
  avatar_url: string;
  completed_at: number;
}

export interface SharedTodo {
  /** 共享待办ID */
  id: number;
  /** 所属共享组合ID */
  combo_id: number;
  /** 创建者用户ID */
  creator_id: number;
  /** 待办内容 */
  text: string;
  /** 日期 */
  set_date: string;
  /** 时间 */
  set_time?: string;
  /** 备注 */
  remarks?: string;
  /** 分配类型：all（全员）/ specific（指定成员） */
  assign_type: 'all' | 'specific';
  /** 标签ID数组（JSON字符串） */
  tags: string;
  /** 全员完成时间戳 */
  completed_at: number;
  /** 是否已删除 */
  is_deleted: boolean;
  /** 创建时间 */
  created_at: string;
  /** 创建者信息 */
  creator?: SharedTodoCreator;
  /** 分配记录 */
  assignments?: SharedTodoAssignment[];
}

export interface ComboMember {
  id: number;
  combo_id: number;
  user_id: number;
  /** 角色：owner（超管）/ admin（管理）/ member（成员） */
  role: 'owner' | 'admin' | 'member';
  nickname: string;
  joined_at: string;
}

export interface CollabRequest {
  id: number;
  combo_id: number;
  user_id: number;
  nickname: string;
  avatar_url: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface JoinCollabParams {
  shareCode: string;
}
