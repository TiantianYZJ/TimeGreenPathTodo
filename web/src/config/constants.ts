/**
 * 业务常量定义
 */

/** 默认标签颜色 */
export const TAG_COLORS: readonly string[] = [
  '#1677FF', // 蓝色
  '#52C41A', // 绿色
  '#FAAD14', // 橙色
  '#FF4D4F', // 红色
  '#722ED1', // 紫色
  '#13C2C2', // 青色
  '#EB2F96', // 品红
  '#FA8C16', // 金橙
  '#2F54EB', // 靛蓝
  '#A0D911', // 酸橙绿
] as const;

/** 默认组合图标 */
export const COMBO_ICONS: readonly string[] = [
  'folder',
  'star',
  'heart',
  'thunderbolt',
  'bulb',
  'book',
  'tool',
  'rocket',
  'crown',
  'gift',
] as const;

/** 默认组合颜色 */
export const COMBO_COLORS: readonly string[] = [
  '#1677FF',
  '#52C41A',
  '#FAAD14',
  '#FF4D4F',
  '#722ED1',
  '#13C2C2',
  '#EB2F96',
  '#FA8C16',
  '#2F54EB',
  '#A0D911',
] as const;

/** 待办状态 */
export const TODO_STATUS = {
  ALL: 'all' as const,
  COMPLETED: 'completed' as const,
  UNCOMPLETED: 'uncompleted' as const,
} as const;

export type TodoStatus = (typeof TODO_STATUS)[keyof typeof TODO_STATUS];

/** 组合成员角色 */
export const MEMBER_ROLES = {
  OWNER: 'owner' as const,
  ADMIN: 'admin' as const,
  MEMBER: 'member' as const,
} as const;

export type MemberRole = (typeof MEMBER_ROLES)[keyof typeof MEMBER_ROLES];

/** 共享待办分配类型 */
export const ASSIGN_TYPES = {
  ALL: 'all' as const,
  SPECIFIC: 'specific' as const,
} as const;

export type AssignType = (typeof ASSIGN_TYPES)[keyof typeof ASSIGN_TYPES];

/** 数据上限默认值 */
export const DEFAULT_LIMITS = {
  TODO_LIMIT: 100,
  COMBO_LIMIT: 10,
  COLLAB_LIMIT: 5,
} as const;

/** 回收站保留天数 */
export const TRASH_RETENTION_DAYS = 30;

/** 日期格式 */
export const DATE_FORMAT = {
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm',
  DATETIME: 'YYYY-MM-DD HH:mm',
} as const;

/** 分页默认值 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  DEFAULT_PAGE: 1,
} as const;

/** 本地存储键名 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER_INFO: 'userInfo',
  TODOS: 'todos',
  COMBOS: 'combos',
  TAGS: 'tags',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;
