/**
 * 消息通知 API
 * 提供订阅消息模板、设置待办提醒等功能
 */

import { request } from '@/services/api/axios';
import type {
  SubscribeParams,
  SubscribeResponse,
  ScheduleNotifyParams,
  ScheduleNotifyResponse,
} from '@/services/api/types';

/** 通知 API 模块 */
export const notifyApi = {
  /**
   * 订阅消息模板
   * 用于获取用户授权发送订阅消息
   * @param data 需要订阅的模板 ID 列表
   * @returns 订阅结果
   */
  subscribe: (data: SubscribeParams): Promise<SubscribeResponse> => {
    return request.post<SubscribeResponse>('/notify/subscribe', data);
  },

  /**
   * 设置待办通知提醒
   * 为指定待办配置定时推送通知
   * @param data 通知参数（待办ID、时间、日期、自定义消息等）
   * @returns 设置结果，包含通知 ID
   */
  schedule: (data: ScheduleNotifyParams): Promise<ScheduleNotifyResponse> => {
    return request.post<ScheduleNotifyResponse>('/notify/schedule', data);
  },
};
