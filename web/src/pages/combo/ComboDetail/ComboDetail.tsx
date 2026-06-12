/**
 * ComboDetail - 组合详情页面
 *
 * 路由：/combos/:id
 *
 * 功能：
 * - 显示组合基本信息（名称、图标、颜色、创建时间、待办数量）
 * - 该组合下的待办列表（过滤 comboId === 当前id）
 * - 添加待办到该组合的快捷按钮
 * - 编辑组合按钮
 * - 删除组合按钮
 * - 共享组合时显示成员列表和邀请功能
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Descriptions,
  Popconfirm,
  message,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Avatar,
  List,
  Empty,
  Badge,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  TeamOutlined,
  FolderOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useCombo } from '@/hooks/useCombo';
import { useTodoStore } from '@/stores/todoStore';
import TodoCard from '@/components/business/TodoCard/TodoCard';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import MemberAvatar from '@/components/business/MemberAvatar/MemberAvatar';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import { formatDate } from '@/utils/format';
import type { Combo } from '@/types/combo';
import type { Todo } from '@/types/todo';
import styles from './ComboDetail.module.css';

const { Title, Text, Paragraph } = Typography;

/**
 * 组合详情页面组件
 *
 * 展示组合的完整信息和该组合下的所有待办事项，
 * 支持编辑、删除组合以及快速添加待办。
 */
const ComboDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 使用 hooks
  const {
    currentCombo,
    isLoading: comboLoading,
    setCurrentComboById,
    deleteCombo,
  } = useCombo();

  // 从 todoStore 获取所有待办并过滤当前组合的
  const allTodos = useTodoStore((state) => state.todos);
  const fetchTodos = useTodoStore((state) => state.fetchTodos);
  const todoLoading = useTodoStore((state) => state.isLoading);

  // 状态管理
  const [deleting, setDeleting] = useState(false);

  /**
   * 页面加载时获取组合详情 + 待办列表
   */
  useEffect(() => {
    if (id) {
      setCurrentComboById(Number(id)).catch((error) => {
        console.error('获取组合详情失败:', error);
        message.error('获取组合详情失败');
      });
    }
    // 同时确保已加载待办数据
     fetchTodos().catch(console.error);
  }, [id, setCurrentComboById, fetchTodos]);

  /**
   * 过滤出属于当前组合的待办
   */
  const comboTodos: Todo[] = useMemo(() => {
    if (!currentCombo) return [];
    return allTodos.filter(
      (todo) => {
        if (!todo.comboId) return false;
        // 兼容数字和字符串类型的 comboId
        return Number(todo.comboId) === Number(currentCombo.id);
      }
    ).filter((todo) => !todo.isDeleted);
  }, [allTodos, currentCombo]);

  // 是否为共享组合
  const isShared = currentCombo?.is_shared === 1;

  /**
   * 编辑组合
   */
  const handleEdit = () => {
    navigate(`/combos/${id}/edit`);
  };

  /**
   * 删除组合确认处理
   */
  const handleDeleteConfirm = async () => {
    if (!currentCombo) return;
    setDeleting(true);
    try {
      await deleteCombo(currentCombo.id);
      message.success('组合已删除');
      navigate('/combos', { replace: true });
    } catch (error) {
      console.error('删除组合失败:', error);
      message.error('删除组合失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * 快速添加待办到当前组合
   */
  const handleAddTodo = () => {
    navigate(`/todo/add?comboId=${id}`);
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

  // 加载状态
  if (comboLoading || !currentCombo) {
    return (
      <div className={styles.pageContainer}>
        <LoadingSkeleton type="todo" count={4} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/combos')}
          className={styles.backBtn}
        />
        <Title level={3} className={styles.pageTitle}>
          {currentCombo.name}
        </Title>

        {/* 操作按钮 */}
        <Space>
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个组合吗？"
            description="组合内的待办不会被删除，将变为未分组状态"
            onConfirm={handleDeleteConfirm}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} loading={deleting}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      </div>

      {/* ========== 组合信息卡片 ========== */}
      <Card className={styles.infoCard} variant="borderless">
        <Row gutter={[32, 24]} align="top">
          {/* 左侧：基本信息 */}
          <Col xs={24} lg={14}>
            <div className={styles.comboHeader}>
              <Avatar
                size={56}
                icon={<FolderOutlined />}
                style={{
                  backgroundColor: `${currentCombo.color}18`,
                  color: currentCombo.color,
                  fontSize: 26,
                }}
                className={styles.comboAvatar}
              />

              <div className={styles.comboInfo}>
                <div className={styles.titleRow}>
                  <span className={styles.comboName}>{currentCombo.name}</span>
                  {isShared && (
                    <Tag icon={<TeamOutlined />} color="processing">
                      共享组合
                    </Tag>
                  )}
                </div>
                <Text type="secondary" className={styles.createTime}>
                  创建于 {formatDate(currentCombo.created_at, 'YYYY年MM月DD日')}
                </Text>
              </div>
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
              <Descriptions.Item label="待办数量">
                <Badge
                  count={comboTodos.length}
                  showZero
                  style={{
                    backgroundColor: currentCombo.color || '#00b26a',
                  }}
                />
                <span style={{ marginLeft: 8 }}>个</span>
              </Descriptions.Item>

              {isShared && currentCombo.share_code && (
                <Descriptions.Item label="邀请码">
                  <Tag color="blue">{currentCombo.share_code}</Tag>
                </Descriptions.Item>
              )}

              {isShared && currentCombo.member_limit && (
                <Descriptions.Item label="成员上限">
                  <Text>{currentCombo.member_limit} 人</Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Col>

          {/* 右侧：快捷操作 */}
          <Col xs={24} lg={10}>
            <div className={styles.quickActions}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTodo}
                block
                size="large"
                style={{
                  backgroundColor: currentCombo.color || '#00b26a',
                  height: 48,
                  fontSize: 15,
                  borderRadius: 10,
                  marginBottom: 12,
                }}
              >
                添加待办到此组合
              </Button>

              {isShared && (
                <Button
                  icon={<QrcodeOutlined />}
                  block
                  onClick={() => message.info('二维码邀请功能开发中')}
                >
                  分享邀请码 / 二维码
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {/* ========== 组合内待办列表 ========== */}
      <Card
        className={styles.todosCard}
        title={
          <Space>
            <span>组合内的待办</span>
            <Tag>{comboTodos.length}</Tag>
          </Space>
        }
        variant="borderless"
      >
        {comboTodos.length === 0 ? (
          <EmptyState
            description="此组合暂无待办，点击上方按钮添加第一个待办"
            action={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleAddTodo}
                style={{ backgroundColor: '#00b26a' }}
              >
                添加待办
              </Button>
            }
          />
        ) : (
          <div className={styles.todoList}>
            {comboTodos.map((todo) => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                onToggle={() => handleToggleComplete(todo.id)}
                onDelete={() => handleDeleteTodo(todo.id)}
                onEdit={() => navigate(`/todo/${todo.id}/edit`)}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ComboDetail;
