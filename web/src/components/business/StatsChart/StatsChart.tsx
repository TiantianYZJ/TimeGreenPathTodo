/**
 * StatsChart - 统计图表组件
 *
 * 功能：
 * - 封装 echarts-for-react 的 ReactECharts 组件
 * - 支持柱状图、折线图、饼图三种类型
 * - 自动适配容器大小
 * - 暗色主题下自动切换图表配色
 * - 空数据时显示空状态提示
 * - 加载状态骨架屏
 */

import React, { memo, useMemo, useRef, useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Empty, Spin } from 'antd';
import { useTheme } from '@/hooks/useTheme';
import styles from './StatsChart.module.css';

/** 图表支持的数据结构 */
export interface ChartDataItem {
  name: string;
  value: number;
  category?: string;
}

export interface ChartData {
  /** X 轴分类标签（柱状图/折线图）或名称（饼图） */
  categories: string[];
  /** 数据值数组 */
  values: number[];
  /** 详细数据项（饼图使用） */
  items?: ChartDataItem[];
}

export interface StatsChartProps {
  /** 图表数据 */
  data: ChartData;
  /** 图表类型 */
  type?: 'bar' | 'line' | 'pie';
  /** 图表标题 */
  title?: string;
  /** 是否正在加载 */
  loading?: boolean;
  /** 高度（默认 300px） */
  height?: number | string;
  /** 自定义颜色序列 */
  colors?: string[];
}

/** 默认品牌色系 */
const DEFAULT_COLORS = [
  '#00b26a',
  '#1890ff',
  '#faad14',
  '#ff4d4f',
  '#722ed1',
  '#13c2c2',
  '#eb2f96',
  '#fa8c16',
];

/** 暗色主题下的图表配置调整 */
const DARK_CHART_COLORS = [
  '#3ddaa0',
  '#69b1ff',
  '#ffc53d',
  '#ff7875',
  '#b37feb',
  '#36cfc9',
  '#ff85c0',
  '#ffa940',
];

/**
 * 统计图表组件
 *
 * 封装 ECharts，提供统一的图表接口，自动适配亮/暗主题。
 */
const StatsChart: React.FC<StatsChartProps> = memo(({
  data,
  type = 'bar',
  title,
  loading = false,
  height = 300,
  colors,
}) => {
  const { isDark } = useTheme();
  const chartRef = useRef<ReactECharts>(null);

  // 根据主题选择颜色
  const themeColors = useMemo(() => {
    if (colors) return colors;
    return isDark ? DARK_CHART_COLORS : DEFAULT_COLORS;
  }, [colors, isDark]);

  // 主色（确保非空，用于渐变等需要字符串拼接的场景）
  const primaryColor = themeColors[0] ?? '#00b26a';

  // 判断是否有有效数据
  const hasData = useMemo(() => {
    if (!data || (!data.values && !data.items)) return false;
    if (data.values && data.values.length === 0) return false;
    if (data.items && data.items.length === 0) return false;
    return true;
  }, [data]);

  // 构建 ECharts 配置
  const option: EChartsOption = useMemo(() => {
    if (!hasData) return {};

    const baseTextColor = isDark ? '#a6a6a6' : '#595959';
    const baseLineColor = isDark ? '#434343' : '#f0f0f0';

    switch (type) {
      case 'pie':
        return {
          title: title
            ? {
                text: title,
                left: 'center',
                top: 0,
                textStyle: { fontSize: 14, color: baseTextColor },
              }
            : undefined,
          tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
          },
          legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: { color: baseTextColor, fontSize: 12 },
          },
          series: [
            {
              type: 'pie',
              radius: ['40%', '65%'],
              center: ['40%', '55%'],
              avoidLabelOverlap: true,
              itemStyle: {
                borderRadius: 6,
                borderColor: isDark ? '#1f1f1f' : '#fff',
                borderWidth: 2,
              },
              label: {
                show: false,
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 14,
                  fontWeight: 'bold',
                },
              },
              labelLine: { show: false },
              data: data.items?.map((item) => ({
                name: item.name,
                value: item.value,
              })) ||
                data.categories.map((name, index) => ({
                  name,
                  value: data.values[index] ?? 0,
                })),
              color: themeColors,
            },
          ],
        };

      case 'line':
        return {
          title: title
            ? {
                text: title,
                left: 'center',
                top: 0,
                textStyle: { fontSize: 14, color: baseTextColor },
              }
            : undefined,
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.categories,
            axisLine: { lineStyle: { color: baseLineColor } },
            axisLabel: { color: baseTextColor, fontSize: 11 },
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: baseLineColor, type: 'dashed' } },
            axisLabel: { color: baseTextColor, fontSize: 11 },
          },
          series: [
            {
              type: 'line',
              data: data.values,
              smooth: true,
              symbol: 'circle',
              symbolSize: 6,
              lineStyle: { width: 2.5, color: primaryColor },
              itemStyle: { color: primaryColor },
              areaStyle: {
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: `${primaryColor}30` },
                    { offset: 1, color: `${primaryColor}05` },
                  ],
                },
              },
            },
          ],
        };

      case 'bar':
      default:
        return {
          title: title
            ? {
                text: title,
                left: 'center',
                top: 0,
                textStyle: { fontSize: 14, color: baseTextColor },
              }
            : undefined,
          tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' },
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true,
          },
          xAxis: {
            type: 'category',
            data: data.categories,
            axisLine: { lineStyle: { color: baseLineColor } },
            axisLabel: {
              color: baseTextColor,
              fontSize: 11,
              rotate: data.categories.length > 6 ? 30 : 0,
            },
          },
          yAxis: {
            type: 'value',
            axisLine: { show: false },
            splitLine: { lineStyle: { color: baseLineColor, type: 'dashed' } },
            axisLabel: { color: baseTextColor, fontSize: 11 },
          },
          series: [
            {
              type: 'bar',
              data: data.values,
              barWidth: data.categories.length > 10 ? '50%' : '60%',
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: {
                  type: 'linear',
                  x: 0, y: 0, x2: 0, y2: 1,
                  colorStops: [
                    { offset: 0, color: primaryColor },
                    { offset: 1, color: `${primaryColor}80` },
                  ],
                },
              },
              emphasis: {
                itemStyle: {
                  color: primaryColor,
                },
              },
            },
          ],
        };
    }
  }, [type, data, hasData, title, isDark, themeColors]);

  // Loading 状态
  if (loading) {
    return (
      <div className={styles.loadingWrapper} style={{ height }}>
        <Spin>
          <span>加载中...</span>
        </Spin>
      </div>
    );
  }

  // 空数据状态
  if (!hasData) {
    return (
      <div className={styles.emptyWrapper} style={{ height }}>
        <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </div>
    );
  }

  return (
    <div className={styles.chartContainer} style={{ height }}>
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas', locale: 'ZH' }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
});

StatsChart.displayName = 'StatsChart';

export default StatsChart;
