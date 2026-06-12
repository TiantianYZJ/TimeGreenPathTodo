/**
 * Star - 收藏夹页
 *
 * 功能：
 * - 展示所有 isStar=true 的待办（从todoStore过滤）
 * - 使用 TodoCard/TodoListItem 展示
 * - 取消收藏操作
 * - 空状态提示
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  Empty,
  Popconfirm,
  message,
} from 'antd';
import {
  StarFilled,
  ArrowLeftOutlined,
} from '@ant-design/icons';
import { useTodoStore } from '@/stores/todoStore';
import { useDeviceType } from '@/hooks/useMediaQuery';
import TodoCard from '@/components/business/TodoCard/TodoCard';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import type { Todo } from '@/types/todo';
import styles from './Star.module.css';

/**
 * 收藏夹页面组件
 *
 * 展示所有已收藏（isStar=true）的待办事项：
 * - 支持桌面端卡片和移动端列表两种布局
 * - 可取消收藏
 * - 空状态引导
 */
const Star: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  // Store 数据
  const todos = useTodoStore((state) => state.todos);
  const isLoading = useTodoStore((state) => state.isLoading);
  const updateTodo = useTodoStore((state) => state.updateTodo);

  // ========== 计算过滤数据 ==========

  /** 已收藏的待办列表 */
  const starredTodos = useMemo(
    () => todos.filter((t) => t.isStar),
    [todos]
  );

  // ========== 事件处理 ==========

  /**
   * 取消收藏
   */
  const handleUnstar = useCallback(
    async (todo: Todo) => {
      try {
        await updateTodo(todo.id, { isStar: false });
        message.success('已取消收藏');
      } catch (error) {
        console.error('取消收藏失败:', error);
        message.error('操作失败，请重试');
      }
    },
    [updateTodo]
  );

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

  /**
   * 返回首页
   */
  const handleGoBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          className={styles.backBtn}
        />
        <h1 className={styles.title}>
          <StarFilled style={{ color: '#faad14' }} /> 我的收藏
        </h1>
        <span className={styles.count}>{starredTodos.length}</span>
      </div>

      {/* 加载状态 */}
      {isLoading && todos.length === 0 ? (
        <LoadingSkeleton type="todo" count={4} />
      ) : starredTodos.length === 0 ? (
        /* 空状态 */
        <EmptyState
          description="还没有收藏任何待办"
          action={
            <Button
              type="primary"
              icon={<StarFilled />}
              onClick={() => navigate('/')}
              style={{ backgroundColor: '#faad14' }}
            >
              去添加待办
            </Button>
          }
        />
      ) : (
        /* 收藏列表 */
        <div className={styles.listSection}>
          {!isMobile ? (
            /* 桌面端网格布局 */
            <div className={styles.todoGrid}>
              {starredTodos.map((todo) => (
                <div key={todo.id} className={styles.gridItem}>
                  <TodoCard
                    todo={todo}
                    onEdit={handleEdit}
                    onToggle={undefined}
                  />
                  <Popconfirm
                    title="取消收藏？"
                    onConfirm={() => handleUnstar(todo)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<StarFilled />}
                      className={styles.unstarBtn}
                    >
                      取消收藏
                    </Button>
                  </Popconfirm>
                </div>
              ))}
            </div>
          ) : (
            /* 移动端列表布局 */
            <div className={styles.mobileList}>
              {starredTodos.map((todo) => (
                <div key={todo.id} className={styles.mobileItem}>
                  <TodoListItem
                    todo={todo}
                    onEdit={handleEdit}
                    onToggle={undefined}
                  />
                  <Popconfirm
                    title="取消收藏？"
                    onConfirm={() => handleUnstar(todo)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      size="small"
                      icon={<StarFilled style={{ color: '#faad14' }} />}
                      className={styles.unstarBtnMobile}
                    >
                      取消收藏
                    </Button>
                  </Popconfirm>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Star;
