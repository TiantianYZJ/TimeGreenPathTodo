/**
 * API 服务层统一导出
 *
 * 使用示例：
 * ```typescript
 * import { authApi, todoApi } from '@/services';
 *
 * // 登录
 * const { token, user } = await authApi.login({ account, password });
 *
 * // 获取待办列表
 * const { list, total } = await todoApi.getList();
 * ```
 */

// Axios 实例和请求方法
export { default as apiClient, request } from '@/services/api/axios';

// 服务层类型定义
export type {
  // 认证相关
  LoginResponse,
  QrCodeGenerateResponse,
  QrCodeStatusResponse,
  // 待办相关
  TodoListResponse,
  CreateTodoResponse,
  UpdateTodoResponse,
  BatchMoveParams,
  BatchMoveResponse,
  SyncParams,
  SyncResponse,
  FullSyncResponse,
  DeletedTodosResponse,
  RestoreTodoResponse,
  // 组合相关
  ComboListResponse,
  ComboDetailResponse,
  MemberListResponse,
  SetRoleParams,
  SetRoleResponse,
  // 协作相关
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
  // 标签相关
  TagListResponse,
  TagOperationResponse,
  // 统计相关
  StatsOverviewResponse,
  DailyStatsResponse,
  // 通知相关
  SubscribeParams,
  SubscribeResponse,
  ScheduleNotifyParams,
  ScheduleNotifyResponse,
} from '@/services/api/types';

// API 模块
export { authApi } from '@/services/modules/authApi';
export { todoApi } from '@/services/modules/todoApi';
export { comboApi } from '@/services/modules/comboApi';
export { collabApi } from '@/services/modules/collabApi';
export { tagApi } from '@/services/modules/tagApi';
export { statsApi } from '@/services/modules/statsApi';
export { notifyApi } from '@/services/modules/notifyApi';

// WebSocket 实时协作服务
export { wsService } from '@/services/websocket/socket';
export { offlineManager } from '@/services/websocket/offlineManager';
export type {
  WSEventType,
  WSMessage,
  OfflineActionType,
  OfflineAction,
} from '@/services/websocket/socket';
