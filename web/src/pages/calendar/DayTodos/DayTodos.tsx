/**
 * DayTodos - 单日待办列表页面
 *
 * 路由：/calendar/:date (YYYY-MM-DD格式)
 *
 * 功能：
 * - 显示日期标题（格式化为"2026年4月5日 星期X"）
 * - 当天所有待办列表
 * - 添加待办按钮（日期预填为当前日期）
 * - 返回日历视图按钮
 * - 空状态提示
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Card,
  Button,
  Typography,
  Tag,
  Space,
  Empty,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import { useTodoStore } from '@/stores/todoStore';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import type { Todo } from '@/types/todo';
import styles from './DayTodos.module.css';

// 扩展 dayjs 插件
dayjs.extend(weekday);
dayjs.extend(localeData);

const { Title, Text } = Typography;

/** 星期名称映射 */
const WEEKDAY_NAMES = [
  '星期日',
  '星期一',
  '星期二',
  '星期三',
  '星期四',
  '星期五',
  '星期六',
];

/**
 * 单日待办列表页面组件
 *
 * 展示指定日期的所有待办事项，支持添加新待办和返回日历视图。
 */
const DayTodos: React.FC = () => {
  const navigate = useNavigate();
  const { date: dateParam } = useParams<{ date: string }>();

  // 从 Store 获取所有待办数据
  const allTodos = useTodoStore((state) => state.todos);
  const isLoading = useTodoStore((state) => state.isLoading);

  // 解析日期参数
  const targetDate = useMemo(() => {
    if (!dateParam || !dayjs(dateParam).isValid()) {
      return dayjs();
    }
    return dayjs(dateParam);
  }, [dateParam]);

  // 格式化日期字符串
  const dateStr = targetDate.format('YYYY-MM-DD');
  const isToday = targetDate.isSame(dayjs(), 'day');

  /**
   * 过滤出当天的待办列表
   */
  const dayTodos: Todo[] = useMemo(() => {
    return allTodos.filter(
      (todo) => todo.setDate === dateStr && !todo.isDeleted
    );
  }, [allTodos, dateStr]);

  /**
   * 统计信息
   */
  const statistics = useMemo(() => {
    const total = dayTodos.length;
    const completed = dayTodos.filter(
      (t) => t.completed !== false && t.completed !== 0
    ).length;
    return { total, completed, uncompleted: total - completed };
  }, [dayTodos]);

  /**
   * 返回日历视图
   */
  const handleBackToCalendar = () => {
    navigate('/calendar');
  };

  /**
   * 添加待办（预填当前日期）
   */
  const handleAddTodo = () => {
    navigate(`/todo/add?date=${dateStr}`);
  };

  /**
   * 待办完成状态切换
   */
  const handleToggleComplete = async (todoId: string) => {
    try {
      const toggleComplete = useTodoStore.getState().toggleComplete;
      await toggleComplete(todoId);
    } catch (error) {
      console.error('切换状态失败:', error);
      message.error('操作失败');
    }
  };

  /**
   * 删除待办
   */
  const handleDeleteTodo = async (todoId: string) => {
    try {
      const deleteTodo = useTodoStore.getState().deleteTodo;
      await deleteTodo(todoId);
      message.success('待办已删除');
    } catch (error) {
      console.error('删除待办失败:', error);
      message.error('删除失败');
    }
  };

  /**
   * 编辑待办
   */
  const handleEditTodo = (todoId: string) => {
    navigate(`/todo/${todoId}/edit`);
  };

  return (
    <div className={styles.pageContainer}>
      {/* ========== 页面头部 ========== */}
      <Card className={styles.headerCard} variant="borderless">
        <div className={styles.headerContent}>
          {/* 返回按钮 */}
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToCalendar}
            className={styles.backBtn}
          >
            日历视图
          </Button>

          {/* 日期标题 */}
          <div className={styles.dateTitle}>
            <CalendarOutlined className={styles.dateIcon} />
            <Title level={3} className={styles.dateText}>
              {targetDate.format('YYYY年M月D日')}
              <span className={styles.weekday}>{WEEKDAY_NAMES[targetDate.day()]}</span>
              {isToday && (
                <Tag color="#00b26a" className={styles.todayTag}>
                  今天
                </Tag>
              )}
            </Title>
          </div>

          {/* 操作按钮 */}
          <Space>
            {/* 统计信息 */}
            <Space size="small" className={styles.statsBadge}>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              <Text>{statistics.completed}</Text>
              <span className={styles.statsDivider}>/</span>
              <ClockCircleOutlined style={{ color: '#faad14' }} />
              <Text>{statistics.uncompleted}</Text>
            </Space>

            {/* 添加按钮 */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddTodo}
              style={{ backgroundColor: '#00b26a' }}
            >
              添加待办
            </Button>
          </Space>
        </div>
      </Card>

      {/* ========== 当天待办列表 ========== */}
      <Card className={styles.listCard} variant="borderless">
        {isLoading ? (
          /* 加载状态 */
          <div className={styles.loadingWrapper}>
            <Spin>
              <span>加载中...</span>
            </Spin>
          </div>
        ) : dayTodos.length === 0 ? (
          /* 空状态 */
          <EmptyState
            description={`${targetDate.format('M月D日')} 暂无待办事项，点击上方按钮添加待办`}
            action={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTodo}
                size="large"
                style={{ backgroundColor: '#00b26a' }}
              >
                添加待办
              </Button>
            }
          />
        ) : (
          /* 待办列表 */
          <>
            <div className={styles.listHeader}>
              <Text type="secondary">
                共{' '}
                <Text strong>{statistics.total}</Text> 个待办，
                已完成 <Text strong style={{ color: '#52c41a' }}>{statistics.completed}</Text> 个
              </Text>
            </div>

            <div className={styles.todoList}>
              {dayTodos.map((todo) => (
                <TodoListItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => handleToggleComplete(todo.id)}
                  onDelete={() => handleDeleteTodo(todo.id)}
                  onEdit={() => handleEditTodo(todo.id)}
                />
              ))}
            </div>

            {/* 底部统计栏 */}
            {statistics.total > 0 && (
              <div className={styles.listFooter}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${
                        statistics.total > 0
                          ? (statistics.completed / statistics.total) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  完成率:{' '}
                  <Text strong>
                    {statistics.total > 0
                      ? Math.round(
                          (statistics.completed / statistics.total) * 100
                        )
                      : 0}
                    %
                  </Text>
                </Text>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

export default DayTodos;
