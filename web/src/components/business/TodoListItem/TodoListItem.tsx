/**
 * TodoListItem - 待办列表项组件（移动端使用）
 *
 * 功能：
 * - 单行紧凑布局，适配移动端
 * - 复选框切换完成状态
 * - 待办文字（已完成时删除线+灰色）
 * - 显示日期/时间/标签/星标
 * - 右侧操作按钮（编辑/删除）
 * - 触摸友好的点击区域 (min-height 44px)
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Checkbox } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import type { Todo } from '@/types/todo';
import { useTagStore } from '@/stores/tagStore';
import { getTagColorById } from '@/styles/themes/tagColors';
import styles from './TodoListItem.module.css';

export interface TodoListItemProps {
  /** 待办数据 */
  todo: Todo;
  /** 编辑回调 */
  onEdit?: (todo: Todo) => void;
  /** 删除回调 */
  onDelete?: (id: string) => void;
  /** 切换完成状态回调 */
  onToggle?: (id: string) => void;
}

/**
 * 待办列表项组件 - 移动端专用
 *
 * 使用 React.memo 进行性能优化。
 * 右侧显示编辑/删除操作按钮，触摸友好。
 */
const TodoListItem: React.FC<TodoListItemProps> = memo(({ todo, onEdit, onDelete, onToggle }) => {
  const getTagNameById = useTagStore((state) => state.getTagNameById);

  // 是否已完成
  const isCompleted = useMemo(
    () => todo.completed !== false && todo.completed !== 0,
    [todo.completed]
  );

  // 复选框变更处理
  const handleCheckChange = useCallback(() => {
    onToggle?.(todo.id);
  }, [onToggle, todo.id]);

  // 渲染标签列表（移动端最多显示2个 + 省略号）
  const renderTags = useMemo(() => {
    if (!todo.tags || todo.tags.length === 0) return null;

    const displayTags = todo.tags.slice(0, 2);
    const remaining = todo.tags.length - 2;

    return (
      <div className={styles.tagsRow}>
        {displayTags.map((tagId) => {
          const tagColor = getTagColorById(tagId);
          const tagName = getTagNameById(tagId);
          return (
            <span
              key={tagId}
              className={styles.tagPill}
              style={{
                color: tagColor.color,
                backgroundColor: tagColor.bgColor,
                borderColor: tagColor.borderColor,
              }}
            >
              {tagName || `T${tagId}`}
            </span>
          );
        })}
        {remaining > 0 && <span className={styles.tagMore}>+{remaining}</span>}
      </div>
    );
  }, [todo.tags, getTagNameById]);

  return (
    <div
      className={`${styles.listItem} ${isCompleted ? styles.completed : ''}`}
      data-todo-id={todo.id}
    >
      {/* 左侧复选框 */}
      <Checkbox
        checked={isCompleted}
        onChange={handleCheckChange}
        className={styles.checkbox}
      />

      {/* 中间内容区 */}
      <div className={styles.contentArea}>
        {/* 第一行：待办文字 + 星标 */}
        <div className={styles.titleRow}>
          <span className={`${styles.todoText} ${isCompleted ? styles.textCompleted : ''}`}>
            {todo.text || '(空待办)'}
          </span>

          {/* 收藏星标 */}
          {todo.isStar && (
            <StarFilled className={styles.starIcon} style={{ color: '#faad14' }} />
          )}
          {!todo.isStar && (
            <StarOutlined className={styles.starIcon} />
          )}
        </div>

        {/* 第二行：元信息 */}
        <div className={styles.metaRow}>
          {todo.setDate && (
            <span className={styles.metaItem}>
              <CalendarOutlined />
              {todo.setDate}
            </span>
          )}
          {todo.setTime && (
            <span className={styles.metaItem}>
              <ClockCircleOutlined />
              {todo.setTime}
            </span>
          )}
        </div>

        {/* 第三行：标签 */}
        {renderTags}
      </div>

      {/* 右侧操作按钮区 */}
      {(onEdit || onDelete) && (
        <div className={styles.actionsArea}>
          {onEdit && (
            <button
              className={`${styles.actionBtn} ${styles.editBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(todo);
              }}
              aria-label="编辑"
              type="button"
            >
              <EditOutlined />
            </button>
          )}
          {onDelete && (
            <button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(todo.id);
              }}
              aria-label="删除"
              type="button"
            >
              <DeleteOutlined />
            </button>
          )}
        </div>
      )}
    </div>
  );
});

TodoListItem.displayName = 'TodoListItem';

export default TodoListItem;
