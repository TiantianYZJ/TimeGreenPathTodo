/**
 * 统计分析 API
 * 提供待办完成情况统计、每日统计等功能
 */

import { request } from '@/services/api/axios';
import type {
  StatsOverviewResponse,
  DailyStatsResponse,
} from '@/services/api/types';

/** 统计 API 模块 */
export const statsApi = {
  /**
   * 获取统计概览数据
   * 包含总数、完成率、按标签/组合/日期的分布统计
   * @returns 统计概览数据
   */
  getOverview: (): Promise<StatsOverviewResponse> => {
    return request.get<StatsOverviewResponse>('/stats/overview');
  },

  /**
   * 获取指定日期的详细统计数据
   * @param date 日期字符串（格式：YYYY-MM-DD）
   * @returns 当日统计详情
   */
  getDailyStats: (date: string): Promise<DailyStatsResponse> => {
    return request.get<DailyStatsResponse>(`/stats/daily/${date}`);
  },
};
