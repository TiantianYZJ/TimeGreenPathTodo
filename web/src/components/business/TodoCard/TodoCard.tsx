/**
 * TodoCard - 待办卡片组件（桌面端使用）
 *
 * 功能：
 * - 显示复选框切换完成状态
 * - 待办文字（已完成时删除线+灰色）
 * - 日期/时间标签
 * - 备注预览（截断显示）
 * - 所属组合名称
 * - 底部标签展示
 * - 收藏星标
 * - 右侧操作按钮（编辑/删除下拉菜单）
 * - hover 效果与完成状态样式
 */

import React, { memo, useCallback, useMemo } from 'react';
import { Checkbox, Tag, Space, Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  StarOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { FolderIcon } from 'tdesign-icons-react';
import type { Todo } from '@/types/todo';
import { useTagStore } from '@/stores/tagStore';
import { useComboStore } from '@/stores/comboStore';
import { getTagColorById } from '@/styles/themes/tagColors';
import styles from './TodoCard.module.css';

export interface TodoCardProps {
  /** 待办数据 */
  todo: Todo;
  /** 编辑回调 */
  onEdit?: (todo: Todo) => void;
  /** 删除回调 */
  onDelete?: (id: string) => void;
  /** 切换完成状态回调 */
  onToggle?: (id: string) => void;
  /** 切换收藏状态回调 */
  onStarToggle?: (id: string) => void;
}

/**
 * 待办卡片组件 - 桌面端专用
 *
 * 使用 React.memo 进行性能优化，仅在 todo 引用变化时重新渲染。
 */
const TodoCard: React.FC<TodoCardProps> = memo(({ todo, onEdit, onDelete, onToggle, onStarToggle }) => {
  const getTagNameById = useTagStore((state) => state.getTagNameById);
  const getComboById = useComboStore((state) => state.getComboById);

  // 是否已完成
  const isCompleted = useMemo(
    () => todo.completed !== false && todo.completed !== 0,
    [todo.completed]
  );

  // 获取所属组合信息
  const comboInfo = useMemo(() => {
    if (!todo.comboId) return null;
    return getComboById(Number(todo.comboId));
  }, [todo.comboId, getComboById]);

  // 备注预览（最多显示2行，超出省略号）
  const remarksPreview = useMemo(() => {
    if (!todo.remarks) return null;
    const text = todo.remarks.trim();
    if (!text) return null;
    return text.length > 80 ? text.substring(0, 80) + '...' : text;
  }, [todo.remarks]);

  // 操作菜单项
  const actionItems: MenuProps['items'] = useMemo(
    () => [
      {
        key: 'edit',
        icon: <EditOutlined />,
        label: '编辑',
        onClick: () => onEdit?.(todo),
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: '删除',
        danger: true,
        onClick: () => onDelete?.(todo.id),
      },
    ],
    [todo, onEdit, onDelete]
  );

  // 复选框变更处理
  const handleCheckChange = useCallback(() => {
    onToggle?.(todo.id);
  }, [onToggle, todo.id]);

  // 复选框点击阻止冒泡（避免触发卡片点击跳转详情）
  const handleCheckClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
    },
    []
  );

  // 收藏切换处理（阻止冒泡，避免触发卡片点击）
  const handleStarClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onStarToggle?.(todo.id);
    },
    [onStarToggle, todo.id]
  );

  // 渲染标签列表
  const renderTags = useMemo(() => {
    if (!todo.tags || todo.tags.length === 0) return null;

    // 获取所有已加载的标签用于判断是否已加载
    const allTags = useTagStore.getState().systemTags.concat(useTagStore.getState().userTags);
    const tagsLoaded = allTags.length > 0;

    return (
      <div className={styles.tagsContainer}>
        {todo.tags.map((tagId) => {
          const tagColor = getTagColorById(tagId);
          const tagName = getTagNameById(tagId);
          // 如果标签数据未加载，显示 #ID；如果已加载但找不到，也显示 #ID
          const displayLabel = tagName || (!tagsLoaded ? '' : `#${tagId}`);
          return (
            <Tag
              key={tagId}
              color={tagColor.color}
              style={{
                borderColor: tagColor.borderColor,
                background: tagColor.bgColor,
                color: tagColor.color,
                fontSize: 12,
                margin: '2px 4px 2px 0',
              }}
            >
              {displayLabel}
            </Tag>
          );
        })}
      </div>
    );
  }, [todo.tags, getTagNameById]);

  return (
    <div
      className={`${styles.card} ${isCompleted ? styles.completed : ''}`}
      data-todo-id={todo.id}
    >
      {/* 主内容区 */}
      <div className={styles.mainContent}>
        {/* 左侧复选框 */}
        <Checkbox
          checked={isCompleted}
          onChange={handleCheckChange}
          onClick={handleCheckClick}
          className={styles.checkbox}
        />

        {/* 中间内容区 */}
        <div className={styles.contentArea}>
          {/* 标题行：待办文字 + 星标 + 操作按钮 */}
          <div className={styles.titleRow}>
            <span className={`${styles.todoText} ${isCompleted ? styles.textCompleted : ''}`}>
              {todo.text || '(空待办)'}
            </span>

            {/* 收藏星标 */}
            <Tooltip title={todo.isStar ? '取消收藏' : '收藏'}>
              <span className={styles.starIcon} onClick={handleStarClick}>
                {todo.isStar ? (
                  <StarFilled style={{ color: '#faad14' }} />
                ) : (
                  <StarOutlined />
                )}
              </span>
            </Tooltip>

            {/* 右侧操作下拉菜单 */}
            {(onEdit || onDelete) && (
              <Dropdown menu={{ items: actionItems }} trigger={['click']} placement="bottomRight">
                <span className={styles.actionsTrigger}>...</span>
              </Dropdown>
            )}
          </div>

          {/* 元信息行：日期 + 时间 + 组合 */}
          <div className={styles.metaRow}>
            {todo.setDate && (
              <Space size={4}>
                <CalendarOutlined className={styles.metaIcon} />
                <span className={styles.metaText}>{todo.setDate}</span>
              </Space>
            )}
            {todo.setTime && (
              <Space size={4}>
                <ClockCircleOutlined className={styles.metaIcon} />
                <span className={styles.metaText}>{todo.setTime}</span>
              </Space>
            )}
            {comboInfo && (
              <Tooltip title={`组合：${comboInfo.name}`}>
                <Space size={4} className={styles.comboBadge}>
                  <FolderIcon size="1em" className={styles.metaIcon} />
                  <span className={styles.metaText}>{comboInfo.name}</span>
                </Space>
              </Tooltip>
            )}
          </div>

          {/* 备注预览行 */}
          {remarksPreview && (
            <div className={styles.remarksRow}>
              <span className={styles.remarksText}>{remarksPreview}</span>
            </div>
          )}

          {/* 底部标签区域 */}
          {renderTags}
        </div>
      </div>
    </div>
  );
});

TodoCard.displayName = 'TodoCard';

export default TodoCard;
