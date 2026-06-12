/**
 * CalendarViewPage - 日历视图主页
 *
 * 路由：/calendar
 *
 * 功能：
 * - 使用 CalendarView 业务组件渲染日历
 * - 侧边或下方面板显示选中日期的待办列表
 * - 点击日期导航到 /calendar/:date (DayTodos页面)
 * - 月份切换
 * - 今天按钮快速回到本月
 * - 待办数据从 todoStore 获取
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Card, Button, Typography, Space, Empty, Spin, Tag } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import { useTodoStore } from '@/stores/todoStore';
import CalendarView from '@/components/business/CalendarView/CalendarView';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { formatDate } from '@/utils/format';
import type { Todo } from '@/types/todo';
import styles from './CalendarView.module.css';

const { Title, Text } = Typography;

/**
 * 日历视图主页组件
 *
 * 展示日历和选中日期的待办事项，支持月份导航和快速跳转。
 */
const CalendarViewPage: React.FC = () => {
  const navigate = useNavigate();

  // 从 Store 获取待办数据（未删除的）
  const todos = useTodoStore((state) =>
    state.todos.filter((todo) => !todo.isDeleted)
  );
  const isLoading = useTodoStore((state) => state.isLoading);

  // 状态管理
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [currentMonth, setCurrentMonth] = useState<Dayjs>(dayjs());

  /**
   * 获取选中日期的待办列表
   */
  const selectedDateTodos: Todo[] = useMemo(() => {
    return todos.filter(
      (todo) => todo.setDate === selectedDate && !todo.isDeleted
    );
  }, [todos, selectedDate]);

  /**
   * 日期选择回调（面板选择，不跳转）
   */
  const handleDateSelect = useCallback((date: Dayjs) => {
    setSelectedDate(date.format('YYYY-MM-DD'));
  }, []);

  /**
   * 日期点击回调（跳转到单日详情页）
   */
  const handleDateClick = useCallback(
    (dateStr: string) => {
      navigate(`/calendar/${dateStr}`);
    },
    [navigate]
  );

  /**
   * 上一个月
   */
  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, 'month'));
  };

  /**
   * 下一个月
   */
  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, 'month'));
  };

  /**
   * 回到今天
   */
  const handleToday = () => {
    const today = dayjs();
    setCurrentMonth(today);
    setSelectedDate(today.format('YYYY-MM-DD'));
  };

  /**
   * 快速添加待办（预填日期）
   */
  const handleAddTodo = () => {
    navigate(`/todo/add?date=${selectedDate}`);
  };

  /**
   * 格式化选中的日期显示
   */
  const formattedSelectedDate = useMemo(() => {
    const date = dayjs(selectedDate);
    return {
      date: date.format('YYYY年MM月DD日'),
      weekday: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][
        date.day()
      ],
      isToday: date.isSame(dayjs(), 'day'),
    };
  }, [selectedDate]);

  return (
    <div className={styles.pageContainer}>
      {/* ========== 页面头部 ========== */}
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          <CalendarOutlined className={styles.headerIcon} />
          日历视图
        </Title>

        {/* 月份导航 */}
        <Space>
          <Button icon={<LeftOutlined />} onClick={handlePrevMonth} size="small" />
          <Text strong style={{ minWidth: 120, textAlign: 'center' }}>
            {currentMonth.format('YYYY年MM月')}
          </Text>
          <Button icon={<RightOutlined />} onClick={handleNextMonth} size="small" />
          <Button
            type="primary"
            icon={<CalendarOutlined />}
            onClick={handleToday}
            size="small"
            style={{ backgroundColor: '#00b26a' }}
          >
            今天
          </Button>
        </Space>
      </div>

      {/* ========== 主内容区域：日历 + 待办面板 ========== */}
      <div className={styles.mainContent}>
        {/* 左侧：日历组件 */}
        <Card className={styles.calendarCard} variant="borderless">
          <CalendarView
            todos={todos}
            onDateSelect={handleDateSelect}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />

          {/* 提示文字 */}
          <div className={styles.hint}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              点击日期查看当日待办详情
            </Text>
          </div>
        </Card>

        {/* 右侧：选中日期的待办面板 */}
        <Card
          className={styles.panelCard}
          variant="borderless"
          title={
            <div className={styles.panelTitle}>
              <Space direction="vertical" size={0}>
                <span className={styles.dateDisplay}>
                  {formattedSelectedDate.date}
                  {formattedSelectedDate.isToday && (
                    <Tag color="#00b26a" className={styles.todayTag}>
                      今天
                    </Tag>
                  )}
                </span>
                <span className={styles.weekdayDisplay}>
                  {formattedSelectedDate.weekday}
                </span>
              </Space>
            </div>
          }
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              size="small"
              onClick={handleAddTodo}
              style={{ backgroundColor: '#00b26a' }}
            >
              添加
            </Button>
          }
        >
          {/* 当日待办列表 */}
          {selectedDateTodos.length === 0 ? (
            <EmptyState
              description="当天暂无待办"
              action={
                <Button
                  type="link"
                  icon={<PlusOutlined />}
                  onClick={handleAddTodo}
                  style={{ color: '#00b26a' }}
                >
                  添加待办
                </Button>
              }
            />
            ) : (
              <div className={styles.todoPanelList}>
              {selectedDateTodos.map((todo) => (
                <TodoListItem
                  key={todo.id}
                  todo={todo}
                  onToggle={() => {
                    /* 简化处理 */
                  }}
                  onDelete={() => {
                    /* 简化处理 */
                  }}
                  onEdit={() => navigate(`/todo/${todo.id}/edit`)}
                />
              ))}
            </div>
          )}

          {/* 统计信息 */}
          {selectedDateTodos.length > 0 && (
            <div className={styles.panelStats}>
              <Space split={<span className={styles.statsDivider}>|</span>}>
                <Text type="secondary">
                  共{' '}
                  <Text strong>{selectedDateTodos.length}</Text> 个待办
                </Text>
                <Text type="secondary">
                  已完成{' '}
                  <Text strong style={{ color: '#52c41a' }}>
                    {
                      selectedDateTodos.filter(
                        (t) => t.completed !== false && t.completed !== 0
                      ).length
                    }
                  </Text>
                </Text>
              </Space>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CalendarViewPage;
