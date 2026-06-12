/**
 * StatsOverview - 统计概览页
 *
 * 功能：
 * - 总体统计卡片（Row/Col布局）：总待办数、已完成数、未完成数、完成率、收藏数
 * - 本周完成趋势图（StatsChart type='line'）：最近7天每天完成数量
 * - 标签分布图（StatsChart type='pie'）：各标签待办占比
 * - 近7天新增趋势（StatsChart type='bar'）
 * - 时间范围选择（本周/本月/本年）
 * - 数据从 todoStore.todos 计算
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Radio,
  Button,
  Spin,
} from 'antd';
import {
  UnorderedListOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarFilled,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import StatsChart from '@/components/business/StatsChart/StatsChart';
import { useTodoStore } from '@/stores/todoStore';
import { useTagStore } from '@/stores/tagStore';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import styles from './StatsOverview.module.css';

/** 时间范围选项 */
const TIME_RANGES = [
  { key: 'week', label: '本周' },
  { key: 'month', label: '本月' },
  { key: 'year', label: '本年' },
] as const;

type TimeRange = typeof TIME_RANGES[number]['key'];

/**
 * 获取时间范围的起止日期
 */
function getDateRange(range: TimeRange): [dayjs.Dayjs, dayjs.Dayjs] {
  const now = dayjs();
  switch (range) {
    case 'week':
      return [now.startOf('week'), now.endOf('week')];
    case 'month':
      return [now.startOf('month'), now.endOf('month')];
    case 'year':
      return [now.startOf('year'), now.endOf('year')];
    default:
      return [now.startOf('week'), now.endOf('week')];
  }
}

/**
 * 统计概览页面组件
 *
 * 提供待办事项的多维度统计分析：
 * - 总体数据概览
 * - 完成趋势分析
 * - 标签分布可视化
 * - 新增趋势图表
 */
const StatsOverview: React.FC = () => {
  const navigate = useNavigate();

  // Store 数据
  const todos = useTodoStore((state) => state.todos);
  const isLoading = useTodoStore((state) => state.isLoading);
  const systemTags = useTagStore((state) => state.systemTags);
  const userTags = useTagStore((state) => state.userTags);

  // 本地状态
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  // 所有标签
  const allTags = useMemo(
    () => [...systemTags, ...userTags],
    [systemTags, userTags]
  );

  // ========== 计算统计数据 ==========

  /** 总体统计 */
  const overallStats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(
      (t) => t.completed !== false && t.completed !== 0
    ).length;
    const uncompleted = total - completed;
    const starred = todos.filter((t) => t.isStar).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, uncompleted, starred, completionRate };
  }, [todos]);

  /** 获取指定日期范围内的日期列表和对应统计数据 */
  const rangeData = useMemo(() => {
    const [startDate, endDate] = getDateRange(timeRange);
    const dates: string[] = [];
    const completedCounts: number[] = [];
    const createdCounts: number[] = [];

    let current = startDate.clone();
    while (current.isBefore(endDate) || current.isSame(endDate, 'day')) {
      const dateStr = current.format('YYYY-MM-DD');
      dates.push(dateStr);

      // 当天完成的待办数
      const dayCompleted = todos.filter((t) => {
        if (!t.completed || typeof t.completed === 'boolean' || t.completed === 0) return false;
        return dayjs(t.completed).format('YYYY-MM-DD') === dateStr;
      }).length;
      completedCounts.push(dayCompleted);

      // 当天创建的待办数
      const dayCreated = todos.filter((t) =>
        dayjs(t.time).format('YYYY-MM-DD') === dateStr
      ).length;
      createdCounts.push(dayCreated);

      current = current.add(1, 'day');
    }

    return { dates, completedCounts, createdCounts };
  }, [todos, timeRange]);

  /** 标签分布数据 */
  const tagDistribution = useMemo(() => {
    const tagMap: Record<string, number> = {};

    todos.forEach((todo) => {
      todo.tags?.forEach((tagId) => {
        const tag = allTags.find((t) => t.id === tagId);
        const name = tag?.name ?? `标签${tagId}`;
        tagMap[name] = (tagMap[name] || 0) + 1;
      });
    });

    return Object.entries(tagMap).map(([name, value]) => ({ name, value }));
  }, [todos, allTags]);

  // ========== 事件处理 ==========

  /**
   * 切换时间范围
   */
  const handleRangeChange = useCallback((e: any) => {
    setTimeRange(e.target.value);
  }, []);

  /**
   * 返回首页
   */
  const handleGoBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // ========== 加载状态 ==========

  if (isLoading && todos.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <LoadingSkeleton type="stats" count={4} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          className={styles.backBtn}
        />
        <h1 className={styles.title}>数据统计</h1>
      </div>

      {/* 时间范围选择 */}
      <Card size="small" className={styles.rangeCard}>
        <Radio.Group
          value={timeRange}
          onChange={handleRangeChange}
          optionType="button"
          buttonStyle="solid"
        >
          {TIME_RANGES.map((range) => (
            <Radio.Button key={range.key} value={range.key}>
              {range.label}
            </Radio.Button>
          ))}
        </Radio.Group>
      </Card>

      {/* ========== 总体统计卡片 ========== */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="总待办"
              value={overallStats.total}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#00b26a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="已完成"
              value={overallStats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="未完成"
              value={overallStats.uncompleted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card size="small" className={styles.statCard}>
            <div className={styles.progressWrapper}>
              <span className={styles.progressLabel}>完成率</span>
              <Progress
                percent={overallStats.completionRate}
                strokeColor="#00b26a"
                format={(percent) => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="收藏数"
              value={overallStats.starred}
              prefix={<StarFilled style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ========== 图表区域 ========== */}
      <Row gutter={[16, 16]} className={styles.chartsSection}>
        {/* 完成趋势折线图 */}
        <Col xs={24} lg={12}>
          <Card
            title="完成趋势"
            size="small"
            className={styles.chartCard}
            loading={isLoading}
          >
            <StatsChart
              type="line"
              data={{
                categories: rangeData.dates.map((d) => dayjs(d).format('MM/DD')),
                values: rangeData.completedCounts,
              }}
              height={280}
              title={`近${rangeData.dates.length}天完成趋势`}
            />
          </Card>
        </Col>

        {/* 标签分布饼图 */}
        <Col xs={24} lg={12}>
          <Card
            title="标签分布"
            size="small"
            className={styles.chartCard}
            loading={isLoading}
          >
            <StatsChart
              type="pie"
              data={{
                categories: tagDistribution.map((d) => d.name),
                values: tagDistribution.map((d) => d.value),
                items: tagDistribution,
              }}
              height={280}
            />
          </Card>
        </Col>

        {/* 新增趋势柱状图 */}
        <Col span={24}>
          <Card
            title="新增趋势"
            size="small"
            className={styles.chartCard}
            loading={isLoading}
          >
            <StatsChart
              type="bar"
              data={{
                categories: rangeData.dates.map((d) => dayjs(d).format('MM/DD')),
                values: rangeData.createdCounts,
              }}
              height={280}
              title={`近${rangeData.dates.length}天新增趋势`}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default StatsOverview;
