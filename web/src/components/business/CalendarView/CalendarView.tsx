/**
 * CalendarView - 日历视图组件
 *
 * 功能：
 * - 使用 antd Calendar 组件
 * - 自定义 dateFullCellRender：显示当天待办数量（小圆点或数字）
 * - 有待办的日期用品牌色标记
 * - 选中日期高亮
 * - 头部显示月份导航
 * - 点击日期触发 onDateClick
 * - 响应式：移动端简化头部
 */

import React, { memo, useMemo, useCallback } from 'react';
import { Calendar as AntdCalendar, Badge } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { Todo } from '@/types/todo';
import styles from './CalendarView.module.css';

export interface CalendarViewProps {
  /** 待办列表数据 */
  todos: Todo[];
  /** 日期选择回调（用于面板选择） */
  onDateSelect?: (date: Dayjs) => void;
  /** 日期点击回调 */
  onDateClick?: (date: string) => void;
  /** 当前选中日期（YYYY-MM-DD 格式） */
  selectedDate?: string;
}

/** 按日期聚合待办数量的映射类型 */
type DateTodoMap = Record<string, number>;

/**
 * 日历视图组件
 *
 * 基于 Ant Design Calendar 组件封装，支持待办事项的日历展示。
 * 自定义单元格渲染，标记有待办事项的日期。
 */
const CalendarView: React.FC<CalendarViewProps> = memo(({
  todos,
  onDateSelect,
  onDateClick,
  selectedDate,
}) => {
  // 将待办按日期聚合为 Map：date -> count
  const dateTodoMap: DateTodoMap = useMemo(() => {
    const map: DateTodoMap = {};
    for (const todo of todos) {
      if (todo.setDate && !todo.isDeleted) {
        map[todo.setDate] = (map[todo.setDate] || 0) + 1;
      }
    }
    return map;
  }, [todos]);

  // 判断某日期是否有待办
  const hasTodosOnDate = useCallback(
    (date: Dayjs): boolean => {
      const dateStr = date.format('YYYY-MM-DD');
      return (dateTodoMap[dateStr] ?? 0) > 0;
    },
    [dateTodoMap]
  );

  // 获取某日期的待办数量
  const getTodoCountForDate = useCallback(
    (date: Dayjs): number => {
      const dateStr = date.format('YYYY-MM-DD');
      return dateTodoMap[dateStr] ?? 0;
    },
    [dateTodoMap]
  );

  // 判断是否为选中日期
  const isSelected = useCallback(
    (date: Dayjs): boolean => {
      if (!selectedDate) return false;
      return date.format('YYYY-MM-DD') === selectedDate;
    },
    [selectedDate]
  );

  // 自定义日期单元格渲染
  const dateCellRender = useCallback(
    (date: Dayjs): React.ReactNode => {
      const count = getTodoCountForDate(date);
      if (count <= 0) return null;

      return (
        <div className={styles.cellContent}>
          <ul className={styles.todoList}>
            {[...Array(Math.min(count, 3))].map((_, i) => (
              <li key={i} className={styles.todoDot} />
            ))}
          </ul>
          {count > 3 && (
            <span className={styles.todoMore}>{count}</span>
          )}
        </div>
      );
    },
    [getTodoCountForDate]
  );

  // 完整日期单元格渲染（包含日期数字 + 待办标记）
  const fullCellRender = useCallback(
    (date: Dayjs): React.ReactNode => {
      const count = getTodoCountForDate(date);
      const isToday = date.isSame(dayjs(), 'day');
      const selected = isSelected(date);

      return (
        <div
          className={`${styles.fullCell} ${isToday ? styles.today : ''} ${selected ? styles.selected : ''}`}
          onClick={() => onDateClick?.(date.format('YYYY-MM-DD'))}
        >
          <span className={styles.dateNumber}>
            {date.date()}
          </span>
          {count > 0 && (
            <div className={styles.cellIndicator}>
              {count <= 3 ? (
                <ul className={styles.todoList}>
                  {[...Array(count)].map((_, i) => (
                    <li key={i} className={styles.todoDot} />
                  ))}
                </ul>
              ) : (
                <Badge count={count} size="small" className={styles.countBadge} />
              )}
            </div>
          )}
        </div>
      );
    },
    [getTodoCountForDate, isSelected, onDateClick]
  );

  // 自定义头部渲染（响应式）
  const headerRender = useCallback(
    ({ value, onChange, type }: { value: Dayjs; onChange: (date: Dayjs) => void; type: string }) => {
      const currentMonth = value.format('YYYY年MM月');

      return (
        <div className={styles.header}>
          <button
            className={styles.navButton}
            onClick={() => onChange(value.subtract(1, 'month'))}
            aria-label="上个月"
          >
            &lt;
          </button>
          <span className={styles.currentMonth}>{currentMonth}</span>
          <button
            className={styles.navButton}
            onClick={() => onChange(value.add(1, 'month'))}
            aria-label="下个月"
          >
            &gt;
          </button>
        </div>
      );
    },
    []
  );

  return (
    <div className={styles.calendarWrapper}>
      <AntdCalendar
        fullscreen={false}
        fullCellRender={(current) => fullCellRender(current)}
        headerRender={({ value, onChange }) =>
          headerRender({ value, onChange, type: 'month' })
        }
        onSelect={onDateSelect}
        className={styles.calendar}
      />
    </div>
  );
});

CalendarView.displayName = 'CalendarView';

export default CalendarView;
