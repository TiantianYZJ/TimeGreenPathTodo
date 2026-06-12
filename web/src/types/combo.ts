/**
 * 组合相关类型定义
 */

export interface Combo {
  /** 组合ID */
  id: number;
  /** 创建者用户ID */
  user_id: number;
  /** 组合名称 */
  name: string;
  /** 组合图标（TDesign图标名） */
  icon: string;
  /** 组合颜色（HEX格式） */
  color: string;
  /** 是否共享组合（0/1） */
  is_shared: number;
  /** 共享邀请码（仅共享组合有，8位） */
  share_code?: string;
  /** 成员上限（仅共享组合有） */
  member_limit?: number;
  /** 待办数量 */
  todo_count: number;
  /** 创建时间 */
  created_at: string;
  /** 更新时间 */
  updated_at?: string | null;
}

export interface CreateComboData {
  name: string;
  icon: string;
  color: string;
  is_shared?: boolean;
  member_limit?: number;
}

export interface UpdateComboData extends Partial<CreateComboData> {}
