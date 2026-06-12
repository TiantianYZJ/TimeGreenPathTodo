/**
 * TodoSearch - 搜索结果页
 *
 * 功能：
 * - 从URL query参数获取搜索关键词
 * - 搜索框（关键词可编辑）
 * - 搜索结果列表（使用TodoCard/TodoListItem）
 * - 无结果提示
 * - 高亮匹配关键词
 * - 搜索范围筛选（全部/待办内容/备注）
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Input,
  Radio,
  Card,
  Button,
  Empty,
} from 'antd';
import {
  SearchOutlined,
  ArrowLeftOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useTodoStore } from '@/stores/todoStore';
import { useDeviceType } from '@/hooks/useMediaQuery';
import TodoCard from '@/components/business/TodoCard/TodoCard';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import type { Todo } from '@/types/todo';
import styles from './TodoSearch.module.css';

/** 搜索范围类型 */
type SearchScope = 'all' | 'text' | 'remarks';

/**
 * 高亮文本中的关键词
 */
function highlightText(
  text: string,
  keyword: string
): React.ReactNode {
  if (!keyword || !text) return text;

  const lowerText = text.toLowerCase();
  const lowerKeyword = keyword.toLowerCase();
  const index = lowerText.indexOf(lowerKeyword);

  if (index === -1) return text;

  const before = text.slice(0, index);
  const match = text.slice(index, index + keyword.length);
  const after = text.slice(index + keyword.length);

  return (
    <span>
      {before}
      <mark className={styles.highlight}>{match}</mark>
      {after}
    </span>
  );
}

/**
 * 搜索结果页面组件
 *
 * 提供全局搜索功能：
 * - 支持多维度搜索（内容/备注）
 * - 关键词高亮显示
 * - 响应式布局适配
 */
const TodoSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  // Store 数据
  const todos = useTodoStore((state) => state.todos);
  const isLoading = useTodoStore((state) => state.isLoading);

  // 本地状态
  const [keyword, setKeyword] = useState(() => searchParams.get('q') ?? '');
  const [scope, setScope] = useState<SearchScope>('all');

  // ========== 搜索逻辑 ==========

  /** 过滤后的搜索结果 */
  const searchResults = useMemo(() => {
    if (!keyword.trim()) return [];

    const kw = keyword.trim().toLowerCase();

    return todos.filter((todo) => {
      switch (scope) {
        case 'text':
          return todo.text.toLowerCase().includes(kw);
        case 'remarks':
          return todo.remarks?.toLowerCase().includes(kw) ?? false;
        case 'all':
        default:
          return (
            todo.text.toLowerCase().includes(kw) ||
            (todo.remarks?.toLowerCase().includes(kw) ?? false)
          );
      }
    });
  }, [todos, keyword, scope]);

  // ========== 事件处理 ==========

  /**
   * 搜索框变更
   */
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setKeyword(e.target.value);
    },
    []
  );

  /**
   * 范围切换
   */
  const handleScopeChange = useCallback((e: any) => {
    setScope(e.target.value);
  }, []);

  /**
   * 返回首页
   */
  const handleGoBack = useCallback(() => {
    navigate('/');
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

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 搜索头部 */}
      <div className={styles.searchHeader}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleGoBack}
          className={styles.backBtn}
        />
        <Input
          placeholder="搜索待办事项..."
          prefix={<SearchOutlined />}
          value={keyword}
          onChange={handleSearchChange}
          allowClear
          size="large"
          className={styles.searchInput}
          autoFocus
        />
      </div>

      {/* 筛选条件 */}
      {keyword.trim() && (
        <Card size="small" className={styles.filterCard}>
          <div className={styles.filterRow}>
            <FilterOutlined className={styles.filterIcon} />
            <span className={styles.filterLabel}>搜索范围：</span>
            <Radio.Group
              value={scope}
              onChange={handleScopeChange}
              optionType="button"
              buttonStyle="solid"
              size="small"
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="text">待办内容</Radio.Button>
              <Radio.Button value="remarks">备注</Radio.Button>
            </Radio.Group>
          </div>

          {/* 结果统计 */}
          <div className={styles.resultCount}>
            找到 <strong>{searchResults.length}</strong> 条相关结果
          </div>
        </Card>
      )}

      {/* 加载状态 */}
      {isLoading && todos.length === 0 ? (
        <LoadingSkeleton type="todo" count={4} />
      ) : !keyword.trim() ? (
        /* 未输入关键词 */
        <EmptyState description="请输入关键词进行搜索" />
      ) : searchResults.length === 0 ? (
        /* 无结果 */
        <EmptyState
          description={`未找到与 "${keyword}" 相关的待办`}
          action={
            <Button onClick={() => setKeyword('')}>清除搜索</Button>
          }
        />
      ) : (
        /* 搜索结果列表 */
        <div className={styles.resultsList}>
          {!isMobile ? (
            /* 桌面端网格布局 */
            <div className={styles.todoGrid}>
              {searchResults.map((todo) => (
                <div key={todo.id} onClick={() => handleClick(todo)}>
                  <TodoCard
                    todo={todo}
                    onEdit={handleEdit}
                  />
                </div>
              ))}
            </div>
          ) : (
            /* 移动端列表布局 */
            <div className={styles.mobileList}>
              {searchResults.map((todo) => (
                <TodoListItem
                  key={todo.id}
                  todo={todo}
                  onEdit={handleEdit}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TodoSearch;
