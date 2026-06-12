/**
 * DailyStats - 每日统计详情
 *
 * 功能：
 * - 显示日期标题
 * - 当日统计：新增、完成、删除数量
 * - 当日待办列表（完成/未完成分组）
 * - 返回统计概览按钮
 */

import React, { useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Row,
  Col,
  Statistic,
  Button,
  Empty,
  Tag,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import TodoCard from '@/components/business/TodoCard/TodoCard';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import { useTodoStore } from '@/stores/todoStore';
import { useDeviceType } from '@/hooks/useMediaQuery';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import type { Todo } from '@/types/todo';
import styles from './DailyStats.module.css';

/**
 * 每日统计详情页面组件
 *
 * 展示指定日期的详细统计数据和待办列表，
 * 支持按完成状态分组展示。
 */
const DailyStats: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  // Store 数据
  const todos = useTodoStore((state) => state.todos);
  const isLoading = useTodoStore((state) => state.isLoading);

  // 当前日期
  const targetDate = date ?? dayjs().format('YYYY-MM-DD');
  const targetDayjs = dayjs(targetDate);

  // ========== 计算当日数据 ==========

  /** 当日所有待办（基于 setDate 字段） */
  const dayTodos = useMemo(() => {
    return todos.filter((todo) => todo.setDate === targetDate);
  }, [todos, targetDate]);

  /** 当日统计数据 */
  const dayStatistics = useMemo(() => {
    // 当天新增（time 字段匹配）
    const createdCount = todos.filter((t) =>
      dayjs(t.time).format('YYYY-MM-DD') === targetDate
    ).length;

    // 当天完成（completed 为时间戳且日期匹配）
    const completedCount = todos.filter((t) => {
      if (!t.completed || typeof t.completed === 'boolean' || t.completed === 0) return false;
      return dayjs(t.completed).format('YYYY-MM-DD') === targetDate;
    }).length;

    // 当天删除（isDeleted 且 deletedAt 匹配）
    const deletedCount = todos.filter((t) =>
      t.isDeleted &&
      t.deletedAt &&
      dayjs(t.deletedAt).format('YYYY-MM-DD') === targetDate
    ).length;

    return { createdCount, completedCount, deletedCount };
  }, [todos, targetDate]);

  /** 已完成的待办列表 */
  const completedTodos = useMemo(
    () => dayTodos.filter((t) => t.completed !== false && t.completed !== 0),
    [dayTodos]
  );

  /** 未完成的待办列表 */
  const uncompletedTodos = useMemo(
    () => dayTodos.filter((t) => t.completed === false || t.completed === 0),
    [dayTodos]
  );

  // ========== 事件处理 ==========

  /**
   * 返回统计概览
   */
  const handleGoBack = useCallback(() => {
    navigate('/stats');
  }, [navigate]);

  /**
   * 编辑待办
   */
  const handleEdit = useCallback(
    (todo: Todo) => {
      navigate(`/todo/${todo.id}/edit`);
    },
    [navigate]
  );

  /**
   * 点击进入详情
   */
  const handleClick = useCallback(
    (todo: Todo) => {
      navigate(`/todo/${todo.id}`);
    },
    [navigate]
  );

  // ========== 加载状态 ==========

  if (isLoading && todos.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <LoadingSkeleton type="stats" count={3} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          className={styles.backBtn}
        />
        <div className={styles.dateInfo}>
          <h1 className={styles.title}>{targetDayjs.format('M月D日')}</h1>
          <span className={styles.subtitle}>{targetDate}</span>
          <Tag color="#00b26a" className={styles.weekdayTag}>
            {targetDayjs.format('dddd')}
          </Tag>
        </div>
      </div>

      {/* 当日统计卡片 */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        <Col xs={8}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="新增"
              value={dayStatistics.createdCount}
              prefix={<PlusCircleOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="完成"
              value={dayStatistics.completedCount}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={8}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="删除"
              value={dayStatistics.deletedCount}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: '#ff4d4f', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 待办列表区域 */}
      <div className={styles.listSection}>
        {dayTodos.length === 0 ? (
          <EmptyState
            description={`${targetDate} 暂无待办事项`}
            action={
              <Button
                type="primary"
                onClick={() => navigate('/todo/add')}
                style={{ backgroundColor: '#00b26a' }}
              >
                创建待办
              </Button>
            }
          />
        ) : (
          <>
            {/* 未完成列表 */}
            {uncompletedTodos.length > 0 && (
              <Card
                title={
                  <span>
                    <BarChartOutlined /> 未完成 ({uncompletedTodos.length})
                  </span>
                }
                size="small"
                className={styles.listCard}
              >
                {!isMobile ? (
                  <div className={styles.todoGrid}>
                    {uncompletedTodos.map((todo) => (
                      <div key={todo.id} onClick={() => handleClick(todo)}>
                        <TodoCard todo={todo} onEdit={handleEdit} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.mobileList}>
                    {uncompletedTodos.map((todo) => (
                      <TodoListItem
                        key={todo.id}
                        todo={todo}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}

            {/* 已完成列表 */}
            {completedTodos.length > 0 && (
              <Card
                title={
                  <span>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> 已完成 ({completedTodos.length})
                  </span>
                }
                size="small"
                className={styles.listCard}
              >
                {!isMobile ? (
                  <div className={styles.todoGrid}>
                    {completedTodos.map((todo) => (
                      <div key={todo.id} onClick={() => handleClick(todo)}>
                        <TodoCard todo={todo} onEdit={handleEdit} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.mobileList}>
                    {completedTodos.map((todo) => (
                      <TodoListItem
                        key={todo.id}
                        todo={todo}
                        onEdit={handleEdit}
                      />
                    ))}
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailyStats;
