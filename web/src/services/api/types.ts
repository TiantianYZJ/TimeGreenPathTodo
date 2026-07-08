/**
 * API 服务层专用类型定义
 * 包含各 API 模块的请求/响应数据结构
 */

import type { ApiResponse } from '@/types/api';
import type { UserInfo } from '@/types/user';
import type { Todo, TodoFilter } from '@/types/todo';
import type { Combo } from '@/types/combo';
import type { Tag } from '@/types/tag';
import type {
  SharedTodo,
  ComboMember,
  CollabRequest,
} from '@/types/collab';

// ==================== 认证相关 ====================

/** 登录响应 */
export interface LoginResponse {
  token: string;
  refreshToken?: string;
  user: UserInfo;
}

/** 二维码登录 - 生成二维码响应 */
export interface QrCodeGenerateResponse {
  /** 二维码图片 URL */
  qrcodeUrl: string;
  /** 场景 ID（用于轮询状态） */
  sceneId: string;
  /** 过期时间（时间戳） */
  expiresAt: number;
}

/** 二维码登录 - 状态查询响应 */
export interface QrCodeStatusResponse {
  /** 当前状态：waiting | scanned | confirmed | expired */
  status: 'waiting' | 'scanned' | 'confirmed' | 'expired';
  /** 确认后返回的 token */
  token?: string;
  /** 确认后返回的用户信息 */
  user?: UserInfo;
}

// ==================== 待办相关 ====================

/** 获取待办列表响应 */
export interface TodoListResponse {
  todos: Todo[];
  total: number;
  page?: number;
  pageSize?: number;
}

/** 获取待办详情响应 */
export type TodoDetailResponse = Todo;

/** 创建待办响应 */
export type CreateTodoResponse = Todo;

/** 更新待办响应 */
export type UpdateTodoResponse = Todo;

/** 批量移动待办请求参数 */
export interface BatchMoveParams {
  /** 待办 ID 列表 */
  ids: string[];
  /** 目标组合 ID */
  comboId: string | null;
}

/** 批量移动响应 */
export interface BatchMoveResponse {
  successCount: number;
  failCount: number;
}

/** 增量同步请求参数 */
export interface SyncParams {
  /** 本地最新版本号 */
  localVersion: number;
}

/** 增量同步响应 */
export interface SyncResponse {
  /** 需要更新的待办列表 */
  updatedTodos: Todo[];
  /** 需要删除的待办 ID 列表 */
  deletedIds: string[];
  /** 服务端最新版本号 */
  serverVersion: number;
}

/** 全量同步响应 */
export interface FullSyncResponse {
  todos: Todo[];
  version: number;
}

/** 已删除待办列表响应 */
export interface DeletedTodosResponse {
  todos: Todo[];
  total?: number;
}

/** 恢复待办响应 */
export interface RestoreTodoResponse {
  success: boolean;
  todo: Todo;
}

// ==================== 组合相关 ====================

/** 获取组合列表响应 */
export interface ComboListResponse {
  combos: Combo[];
}

/** 获取组合详情响应（含成员和共享待办） */
export interface ComboDetailResponse extends Combo {
  members?: ComboMember[];
  sharedTodos?: SharedTodo[];
}

/** 创建组合响应 */
export type CreateComboResponse = Combo;

/** 更新组合响应 */
export type UpdateComboResponse = Combo;

/** 获取成员列表响应 */
export interface MemberListResponse {
  list: ComboMember[];
  total: number;
}

/** 设置成员角色请求参数 */
export interface SetRoleParams {
  role: 'owner' | 'admin' | 'member';
}

/** 设置角色响应 */
export interface SetRoleResponse {
  success: boolean;
  member: ComboMember;
}

// ==================== 协作相关 ====================

/** 加入组合响应 */
export interface JoinCollabResponse {
  success: boolean;
  combo: Combo;
}

/** 发送加入申请响应 */
export interface SendRequestResponse {
  success: boolean;
  requestId: number;
}

/** 获取申请列表响应 */
export interface RequestListResponse {
  list: CollabRequest[];
  total: number;
}

/** 审批操作响应 */
export interface ApproveRejectResponse {
  success: boolean;
  request: CollabRequest;
}

/** 获取共享组合列表响应 */
export interface SharedCombosResponse {
  sharedCombos: Combo[];
}

/** 创建共享待办请求参数 */
export interface CreateSharedTodoParams {
  text: string;
  set_date: string;
  set_time?: string;
  remarks?: string;
  assign_type: 'all' | 'specific';
  tags?: number[];
  assignments?: number[]; // 指定成员用户ID列表
}

/** 共享待办操作响应 */
export interface SharedTodoOperationResponse {
  success: boolean;
  todo: SharedTodo;
}

/** 完成共享待办请求参数 */
export interface CompleteSharedTodoParams {
  completed: boolean;
}

/** 移除成员响应 */
export interface RemoveMemberResponse {
  success: boolean;
}

/** 退出组合响应 */
export interface LeaveCollabResponse {
  success: boolean;
}

// ==================== 标签相关 ====================

/** 获取标签列表响应 */
export interface TagListResponse {
  tags: Tag[];
}

/** 标签操作响应 */
export interface TagOperationResponse {
  success: boolean;
  tag: Tag;
}

// ==================== 统计相关 ====================

/** 统计概览响应 */
export interface StatsOverviewResponse {
  totalTodos: number;
  completedTodos: number;
  uncompletedTodos: number;
  todayCompleted: number;
  weekCompleted: number;
  monthCompleted: number;
  completionRate: number;
  /** 最近7天完成情况 */
  dailyStats: Array<{
    date: string;
    count: number;
  }>;
  /** 按标签统计 */
  tagStats: Array<{
    tagId: number;
    tagName: string;
    count: number;
  }>;
  /** 按组合统计 */
  comboStats: Array<{
    comboId: number;
    comboName: string;
    count: number;
  }>;
}

/** 每日统计响应 */
export interface DailyStatsResponse {
  date: string;
  total: number;
  completed: number;
  uncompleted: number;
  completionRate: number;
  todos: Todo[];
}

// ==================== 通知相关 ====================

/** 订阅消息模板请求参数 */
export interface SubscribeParams {
  templateIds: string[];
}

/** 订阅响应 */
export interface SubscribeResponse {
  success: boolean;
}

/** 设置待办通知请求参数 */
export interface ScheduleNotifyParams {
  todoId: string;
  notifyTime: string; // 格式 HH:mm
  date?: string; // YYYY-MM-DD，不填则每天
  message?: string;
}

/** 设置通知响应 */
export interface ScheduleNotifyResponse {
  success: boolean;
  notificationId: string;
}

/** 通知列表项 */
export interface NotifyItem {
  id: number;
  todoId: string;
  notifyTime: string;
  date?: string;
  message?: string;
  todoText?: string;
  createdAt: string;
}

/** 通知列表响应 */
export interface NotifyListResponse {
  list: NotifyItem[];
  total: number;
}

/** 撤销通知响应 */
export interface CancelNotifyResponse {
  success: boolean;
}
