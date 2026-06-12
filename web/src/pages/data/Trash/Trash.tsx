/**
 * Trash - 回收站页
 *
 * 功能：
 * - 已删除待办列表（调用 todoApi.getDeleted）
 * - 每项显示：内容、删除时间、原所属组合
 * - 操作：恢复按钮(调用todoApi.restore)、永久删除按钮(Popconfirm红色确认)
 * - 空状态："回收站是空的"
 * - 清空回收站按钮（二次确认）
 * - 回收站保留天数提示
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  List,
  Popconfirm,
  Empty,
  message,
  Tag,
  Space,
  Alert,
  Modal,
} from 'antd';
import {
  DeleteOutlined,
  UndoOutlined,
  ClearOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { todoApi } from '@/services';
import type { Todo } from '@/types/todo';
import { formatRelativeTime, formatDate } from '@/utils/format';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import styles from './Trash.module.css';

/** 已删除待办项类型 */
interface DeletedTodoItem extends Todo {
  /** 原所属组合名称（可选） */
  comboName?: string;
}

/**
 * 回收站页面组件
 *
 * 管理已删除的待办事项：
 * - 查看所有软删除的待办
 * - 恢复或永久删除
 * - 自动清理过期数据
 */
const Trash: React.FC = () => {
  // 本地状态
  const [deletedTodos, setDeletedTodos] = useState<DeletedTodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // ========== 数据获取 ==========

  /**
   * 获取已删除的待办列表
   */
  const fetchDeletedTodos = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await todoApi.getDeleted();
      // 转换为 DeletedTodoItem 格式
      const items: DeletedTodoItem[] = (response.todos ?? []).map((todo: Todo) => ({
        ...todo,
        comboName: undefined, // 可根据 comboId 获取名称
      }));
      setDeletedTodos(items);
    } catch (error) {
      console.error('获取回收站数据失败:', error);
      message.error('获取回收站数据失败');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeletedTodos();
  }, [fetchDeletedTodos]);

  // ========== 操作方法 ==========

  /**
   * 恢复待办
   */
  const handleRestore = useCallback(
    async (todoId: string) => {
      setIsRestoringId(todoId);
      try {
        await todoApi.restore(todoId);
        message.success('恢复成功');
        // 刷新列表
        await fetchDeletedTodos();
      } catch (error) {
        console.error('恢复失败:', error);
        message.error('恢复失败，请重试');
      } finally {
        setIsRestoringId(null);
      }
    },
    [fetchDeletedTodos]
  );

  /**
   * 永久删除单个待办
   */
  const handlePermanentDelete = useCallback(
    async (todoId: string) => {
      setIsDeletingId(todoId);
      try {
        await todoApi.permanentDelete(todoId);
        message.success('已永久删除');
        // 从列表中移除
        setDeletedTodos((prev) => prev.filter((t) => t.id !== todoId));
      } catch (error) {
        console.error('永久删除失败:', error);
        message.error('删除失败，请重试');
      } finally {
        setIsDeletingId(null);
      }
    },
    []
  );

  /**
   * 清空回收站（二次确认后执行）
   */
  const handleClearAll = useCallback(async () => {
    if (deletedTodos.length === 0) return;

    let successCount = 0;
    let failCount = 0;

    for (const todo of deletedTodos) {
      try {
        await todoApi.permanentDelete(todo.id);
        successCount++;
      } catch {
        failCount++;
      }
    }

    if (failCount === 0) {
      message.success(`成功清空 ${successCount} 条记录`);
      setDeletedTodos([]);
    } else {
      message.warning(
        `完成 ${successCount} 条，失败 ${failCount} 条`
      );
      // 刷新剩余的
      await fetchDeletedTodos();
    }
  }, [deletedTodos, fetchDeletedTodos]);

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <DeleteOutlined /> 回收站
        </h1>
        {deletedTodos.length > 0 && (
          <Popconfirm
            title="确定清空回收站吗？"
            description="此操作将永久删除所有已删除的待办，不可恢复！"
            onConfirm={handleClearAll}
            okText="确定清空"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            icon={<WarningOutlined style={{ color: '#ff4d4f' }} />}
          >
            <Button danger icon={<ClearOutlined />}>
              清空回收站 ({deletedTodos.length})
            </Button>
          </Popconfirm>
        )}
      </div>

      {/* 提示信息 */}
      <Alert
        description="已删除的待办将保留30天，之后会自动永久删除"
        type="warning"
        showIcon
        icon={<WarningOutlined />}
        className={styles.alert}
      />

      {/* 加载状态 */}
      {isLoading ? (
        <LoadingSkeleton type="todo" count={4} />
      ) : deletedTodos.length === 0 ? (
        /* 空状态 */
        <EmptyState />
      ) : (
        /* 已删除列表 */
        <Card size="small" className={styles.listCard}>
          <List
            dataSource={deletedTodos}
            renderItem={(todo) => (
              <List.Item
                key={todo.id}
                className={styles.listItem}
                actions={[
                  <Button
                    key="restore"
                    type="link"
                    size="small"
                    icon={<UndoOutlined />}
                    loading={isRestoringId === todo.id}
                    onClick={() => handleRestore(todo.id)}
                    style={{ color: '#00b26a' }}
                  >
                    恢复
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定永久删除吗？"
                    description="此操作不可恢复！"
                    onConfirm={() => handlePermanentDelete(todo.id)}
                    okText="删除"
                    cancelText="取消"
                    okButtonProps={{ danger: true, loading: isDeletingId === todo.id }}
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      loading={isDeletingId === todo.id}
                    >
                      永久删除
                    </Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={
                    <span className={styles.todoText}>{todo.text}</span>
                  }
                  description={
                    <Space size={12} wrap>
                      <span className={styles.metaText}>
                        删除于：{formatRelativeTime(todo.deletedAt ?? todo.updatedAt)}
                      </span>
                      {todo.comboName && (
                        <Tag>{todo.comboName}</Tag>
                      )}
                      {todo.setDate && (
                        <span className={styles.metaText}>
                          原定日期：{formatDate(todo.setDate)}
                        </span>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )}
            pagination={{
              pageSize: 10,
              size: 'small',
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      )}
    </div>
  );
};

/** 内部空状态组件 */
const EmptyState: React.FC = () => (
  <Card size="small" className={styles.emptyCard}>
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description={
        <span className={styles.emptyText}>回收站是空的</span>
      }
    />
  </Card>
);

export default Trash;
