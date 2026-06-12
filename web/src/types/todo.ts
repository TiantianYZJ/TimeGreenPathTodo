/**
 * 待办事项相关类型定义
 */

export interface TodoLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export interface Todo {
  /** 唯一标识符 */
  id: string;
  /** 待办事项的标题或核心内容 */
  text: string;
  /** 待办事项的日期（YYYY-MM-DD格式） */
  setDate: string;
  /** 待办事项的时间（HH:mm格式） */
  setTime?: string;
  /** 待办事项的详细说明或备注 */
  remarks?: string;
  /** 待办事项的位置信息 */
  location?: TodoLocation;
  /** 待办事项的完成状态（false 或完成时间戳） */
  completed: boolean | number;
  /** 是否收藏/标记为重要 */
  isStar: boolean;
  /** 待办事项的创建时间戳 */
  time: number;
  /** 标签ID数组 */
  tags: number[];
  /** 所属组合ID（数字或字符串，后端返回数字） */
  comboId?: number | string;
  /** 数据版本号，每次修改递增 */
  version: number;
  /** 是否已删除（软删除标记） */
  isDeleted: boolean;
  /** 删除时间戳（isDeleted为true时设置） */
  deletedAt?: number | null;
  /** 最后更新时间戳 */
  updatedAt: number;
}

export interface CreateTodoData {
  text: string;
  setDate: string;
  setTime?: string;
  remarks?: string;
  location?: Todo['location'];
  tags?: number[];
  comboId?: number | string;
}

export interface UpdateTodoData extends Partial<CreateTodoData> {
  completed?: boolean | number;
  isStar?: boolean;
}

export interface TodoFilter {
  status: 'all' | 'completed' | 'uncompleted';
  comboId: number | string | null;
  tagIds: number[];
  dateRange: [string, string] | null;
  keyword: string;
}
