/**
 * TodoDetail - 待办详情页面
 *
 * 路由：/todo/:id
 *
 * 功能：
 * - 显示完整待办信息（内容、日期时间、备注、位置等）
 * - 标签展示（TagBadge组件）
 * - 优先级徽标（P1-P4）
 * - 收藏按钮（可交互）
 * - 子任务列表（Checkbox + 添加按钮）
 * - 图片画廊（Image.PreviewGroup）
 * - 通知列表（查看与撤销）
 * - 位置信息与地图链接
 * - 所属组合名称
 * - 完成状态切换
 * - 创建时间和更新时间
 * - 操作按钮：编辑、删除
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Descriptions,
  Checkbox,
  Popconfirm,
  message,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
  Image,
  List,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  StarFilled,
  StarOutlined,
  TagOutlined,
  BellOutlined,
  PlusOutlined,
  PictureOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import { FolderIcon } from 'tdesign-icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTodo } from '@/hooks/useTodo';
import { useComboStore } from '@/stores/comboStore';
import { useTodoStore } from '@/stores/todoStore';
import { todoApi } from '@/services/modules/todoApi';
import { notifyApi } from '@/services/modules/notifyApi';
import TagBadge from '@/components/business/TagBadge/TagBadge';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { formatDate, formatRelativeTime } from '@/utils/format';
import type { Todo } from '@/types/todo';
import type { NotifyItem } from '@/services/api/types';
import styles from './TodoDetail.module.css';

const { Title, Text, Paragraph } = Typography;

/** 优先级颜色映射 */
const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  p1: { color: '#f5222d', label: 'P1 紧急' },
  p2: { color: '#1677ff', label: 'P2 重要' },
  p3: { color: '#fa8c16', label: 'P3 一般' },
  p4: { color: '#8c8c8c', label: 'P4 低' },
};

/**
 * 待办详情页面组件
 *
 * 展示待办事项的完整信息，支持状态切换和编辑删除操作，
 * 以及子任务、图片、通知、位置地图链接等增强功能。
 */
const TodoDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 使用 hooks
  const { handleToggle, handleDelete } = useTodo({ autoFetch: false });
  const getComboById = useComboStore((state) => state.getComboById);
  const toggleStar = useTodoStore((state) => state.toggleStar);
  const todoStoreToggleComplete = useTodoStore((state) => state.toggleComplete);

  // 状态管理
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [subtasks, setSubtasks] = useState<Todo[]>([]);
  const [subtasksLoading, setSubtasksLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotifyItem[]>([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);

  /**
   * 加载待办详情及相关数据
   */
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setSubtasksLoading(true);
    setNotificationsLoading(true);

    Promise.all([
      todoApi.getById(id).catch(() => null),
      (todoApi.getList as (filter?: Record<string, unknown>) => Promise<{ todos: Todo[]; total: number }>)({ parentId: id }).catch(() => ({ todos: [], total: 0 })),
      notifyApi.getList().catch(() => ({ list: [], total: 0 })),
    ])
      .then(([detail, subtaskRes, notifyRes]) => {
        if (detail) {
          setTodo(detail);
        }
        setSubtasks(subtaskRes?.todos || []);
        const filtered = (notifyRes?.list || []).filter(
          (n) => n.todoId === id
        );
        setNotifications(filtered);
      })
      .catch(() => {
        message.error('加载待办详情失败');
      })
      .finally(() => {
        setLoading(false);
        setSubtasksLoading(false);
        setNotificationsLoading(false);
      });
  }, [id]);

  /**
   * 切换完成状态
   */
  const handleToggleComplete = async () => {
    if (!id || !todo) return;
    try {
      await handleToggle(id);
      // 更新本地状态
      setTodo((prev) =>
        prev
          ? {
              ...prev,
              completed:
                prev.completed === false || prev.completed === 0
                  ? Date.now()
                  : false,
            }
          : null
      );
      message.success(
        todo.completed === false || todo.completed === 0
          ? '已标记为完成'
          : '已取消完成'
      );
    } catch (error) {
      console.error('切换状态失败:', error);
      message.error('操作失败');
    }
  };

  /**
   * 切换收藏状态
   */
  const handleToggleStar = async () => {
    if (!id) return;
    try {
      await toggleStar(id);
      // 乐观更新本地状态
      setTodo((prev) =>
        prev ? { ...prev, isStar: !prev.isStar } : null
      );
    } catch (error) {
      console.error('切换收藏失败:', error);
      message.error('操作失败');
    }
  };

  /**
   * 切换子任务完成状态
   */
  const handleSubtaskToggle = async (subtask: Todo) => {
    try {
      await todoStoreToggleComplete(subtask.id);
      // 更新本地子任务列表
      setSubtasks((prev) =>
        prev.map((t) =>
          t.id === subtask.id
            ? {
                ...t,
                completed:
                  t.completed === false || t.completed === 0
                    ? Date.now()
                    : false,
              }
            : t
        )
      );
    } catch (error) {
      console.error('切换子任务状态失败:', error);
      message.error('操作失败');
    }
  };

  /**
   * 删除确认处理
   */
  const handleDeleteConfirm = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await handleDelete(id);
      message.success('待办已删除');
      navigate('/todo', { replace: true });
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * 跳转到编辑页
   */
  const handleEdit = () => {
    navigate(`/todo/${id}/edit`);
  };

  /**
   * 撤销通知
   */
  const handleCancelNotify = async (notifyId: number) => {
    try {
      await notifyApi.cancel(notifyId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifyId));
      message.success('通知已撤销');
    } catch (error) {
      console.error('撤销通知失败:', error);
      message.error('撤销通知失败');
    }
  };

  /**
   * 获取所属组合名称
   */
  const getComboName = (): string | undefined => {
    if (!todo?.comboId) return undefined;
    const combo = getComboById(Number(todo.comboId));
    return combo?.name;
  };

  /**
   * 构建地图链接
   */
  const getMapLink = (): string | undefined => {
    if (!todo?.location) return undefined;
    const { latitude, longitude, name } = todo.location;
    // AMap 高德地图链接格式
    return `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(name)}`;
  };

  // 是否已完成
  const isCompleted =
    todo && (todo.completed !== false && todo.completed !== 0);

  // 优先级配置
  const priorityConfig = todo?.priority
    ? PRIORITY_CONFIG[todo.priority]
    : undefined;

  // 加载状态
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingWrapper}>
          <Spin size="large">
            <span>加载中...</span>
          </Spin>
        </div>
      </div>
    );
  }

  // 未找到数据
  if (!todo) {
    return (
      <div className={styles.pageContainer}>
        <EmptyState description="未找到该待办事项" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className={styles.backBtn}
        />
        <Title level={3} className={styles.pageTitle}>
          待办详情
        </Title>
      </div>

      {/* 主内容卡片 */}
      <Card className={styles.detailCard} variant="borderless">
        {/* ========== Section 1：基本信息和操作 ========== */}
        <Row justify="space-between" align="top">
          <Col flex="1" style={{ marginRight: 16 }}>
            <div className={styles.titleSection}>
              <span
                className={`${styles.todoText} ${isCompleted ? styles.textCompleted : ''}`}
              >
                {todo.text || '(空待办)'}
              </span>

              {/* 优先级徽标 */}
              {priorityConfig && (
                <Tag color={priorityConfig.color} style={{ borderRadius: 4 }}>
                  {priorityConfig.label}
                </Tag>
              )}

              {/* 收藏按钮（可交互） */}
              <Button
                type="text"
                icon={
                  todo.isStar ? (
                    <StarFilled style={{ color: '#faad14', fontSize: 18 }} />
                  ) : (
                    <StarOutlined style={{ fontSize: 18 }} />
                  )
                }
                onClick={handleToggleStar}
                style={{ padding: '0 4px', height: 'auto' }}
              />

              {/* 完成状态标签 */}
              <Tag color={isCompleted ? 'success' : 'warning'} className={styles.statusTag}>
                {isCompleted ? '已完成' : '未完成'}
              </Tag>
            </div>
          </Col>

          <Col>
            <Space>
              <Button
                icon={<EditOutlined />}
                onClick={handleEdit}
              >
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个待办吗？"
                description="删除后可在回收站中恢复"
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
          </Col>
        </Row>

        <Divider />

        {/* 完成状态切换复选框（更紧凑） */}
        <div className={styles.toggleSection}>
          <Checkbox
            checked={isCompleted ?? false}
            onChange={handleToggleComplete}
          >
            {isCompleted ? (
              <>
                <CheckCircleOutlined style={{ color: '#52c41a' }} /> 已完成
              </>
            ) : (
              <>
                <ClockCircleOutlined style={{ color: '#faad14' }} /> 未完成
              </>
            )}
          </Checkbox>
        </div>

        <Divider />

        {/* 详细信息描述列表 */}
        <Descriptions
          column={{ xs: 1, sm: 2, md: 2 }}
          labelStyle={{ fontWeight: 500, minWidth: '80px' }}
          contentStyle={{ color: '#333' }}
          className={styles.descriptions}
        >
          {/* 日期 */}
          <Descriptions.Item label={<><CalendarOutlined /> 日期</>}>
            <Text>{todo.setDate || '-'}</Text>
          </Descriptions.Item>

          {/* 时间 */}
          <Descriptions.Item label={<><ClockCircleOutlined /> 时间</>}>
            <Text>{todo.setTime || '-'}</Text>
          </Descriptions.Item>

          {/* 所属组合 */}
          <Descriptions.Item label={<><FolderIcon size="1em" /> 所属组合</>}>
            <Text>{getComboName() || '未分组'}</Text>
          </Descriptions.Item>

          {/* 创建时间 */}
          <Descriptions.Item label="创建时间">
            <Text>{formatDate(todo.time, 'YYYY-MM-DD HH:mm:ss')}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatRelativeTime(todo.time)}
            </Text>
          </Descriptions.Item>

          {/* 更新时间 */}
          <Descriptions.Item label="更新时间">
            <Text>{formatDate(todo.updatedAt, 'YYYY-MM-DD HH:mm:ss')}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatRelativeTime(todo.updatedAt)}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {/* 标签 */}
        {todo.tags && todo.tags.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <TagOutlined /> 标签
            </Divider>
            <div className={styles.tagsSection}>
              {todo.tags.map((tagId) => (
                <TagBadge key={tagId} tagId={tagId} showName size="large" />
              ))}
            </div>
          </>
        )}

        {/* ========== Section 2：子任务（新增） ========== */}
        {!subtasksLoading && subtasks.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <CheckCircleOutlined /> 子任务 ({subtasks.length})
            </Divider>
            <List
              size="small"
              dataSource={subtasks}
              renderItem={(subtask) => {
                const subCompleted =
                  subtask.completed !== false && subtask.completed !== 0;
                return (
                  <List.Item
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          navigate(`/todo/${subtask.id}`)
                        }
                      >
                        查看
                      </Button>,
                    ]}
                  >
                    <Checkbox
                      checked={subCompleted}
                      onChange={() => handleSubtaskToggle(subtask)}
                    >
                      <Text
                        style={{
                          textDecoration: subCompleted
                            ? 'line-through'
                            : 'none',
                          color: subCompleted ? '#999' : undefined,
                        }}
                      >
                        {subtask.text || '(空)'}
                      </Text>
                    </Checkbox>
                  </List.Item>
                );
              }}
            />
            <div style={{ marginTop: 8 }}>
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                size="small"
                onClick={() => navigate(`/todo/add?parentId=${id}`)}
              >
                添加子任务
              </Button>
            </div>
          </>
        )}

        {/* ========== Section 3：图片画廊（新增） ========== */}
        {todo.images && todo.images.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <PictureOutlined /> 图片
            </Divider>
            <Image.PreviewGroup>
              <Space wrap size={8}>
                {todo.images.map((url, index) => (
                  <Image
                    key={index}
                    width={100}
                    height={100}
                    src={url}
                    style={{
                      borderRadius: 8,
                      objectFit: 'cover',
                      border: '1px solid #f0f0f0',
                    }}
                    preview={{ mask: '预览' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                  />
                ))}
              </Space>
            </Image.PreviewGroup>
          </>
        )}

        {/* ========== Section 4：通知列表（新增） ========== */}
        {!notificationsLoading && notifications.length > 0 && (
          <>
            <Divider orientation="left" plain>
              <BellOutlined /> 通知
            </Divider>
            <List
              size="small"
              dataSource={notifications}
              renderItem={(notify) => (
                <List.Item
                  actions={[
                    <Popconfirm
                      title="确定要撤销此通知吗？"
                      onConfirm={() => handleCancelNotify(notify.id)}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button type="link" size="small" danger>
                        撤销
                      </Button>
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space>
                        <BellOutlined />
                        <Text>
                          {notify.notifyTime}
                          {notify.date ? ` (${notify.date})` : ' (每天)'}
                        </Text>
                      </Space>
                    }
                    description={
                      notify.message || (
                        <Text type="secondary">提醒：{notify.todoText || todo.text}</Text>
                      )
                    }
                  />
                </List.Item>
              )}
            />
          </>
        )}

        {/* 备注 */}
        {todo.remarks && (
          <>
            <Divider orientation="left" plain>
              备注
            </Divider>
            <Paragraph className={styles.remarksContent}>
              {todo.remarks}
            </Paragraph>
          </>
        )}

        {/* ========== Section 5：位置信息（增强） ========== */}
        {todo.location && (
          <>
            <Divider orientation="left" plain>
              <EnvironmentOutlined /> 位置信息
            </Divider>
            <Card size="small" className={styles.locationCard}>
              <div className={styles.locationInfo}>
                <EnvironmentOutlined className={styles.locationIcon} />
                <div>
                  <Text strong>{todo.location.name}</Text>
                  {todo.location.address && (
                    <div>
                      <Text type="secondary">{todo.location.address}</Text>
                    </div>
                  )}
                  {/* 地图链接按钮 */}
                  {getMapLink() && (
                    <div style={{ marginTop: 8 }}>
                      <Button
                        type="link"
                        icon={<LinkOutlined />}
                        href={getMapLink()}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: 0 }}
                      >
                        查看地图
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ========== Section 6：共享待办进度（预留） ========== */}
        {/*
         * TODO: 共享待办的完整展示依赖 shared_todos 端点（需后端配合）。
         * 当 todo.comboId 对应一个共享组合时，应显示：
         * - 各成员的完成进度条
         * - 当前用户的完成状态
         * - 评论列表（需 comments 端点）
         * 待 shared_todos/list?todoId=xxx 和 comments/list?todoId=xxx
         * 后端接口就绪后在此处接入。
         * 可借助 useComboStore 的 getComboById 检查 comboId 是否为共享组合。
         */}
      </Card>
    </div>
  );
};

export default TodoDetail;
