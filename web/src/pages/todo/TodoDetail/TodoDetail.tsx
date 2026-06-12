/**
 * TodoDetail - 待办详情页面
 *
 * 路由：/todo/:id
 *
 * 功能：
 * - 显示完整待办信息（内容、日期时间、备注、位置等）
 * - 标签展示（TagBadge组件）
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
  Switch,
  Popconfirm,
  message,
  Spin,
  Typography,
  Divider,
  Row,
  Col,
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
} from '@ant-design/icons';
import { FolderIcon } from 'tdesign-icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTodo } from '@/hooks/useTodo';
import { useComboStore } from '@/stores/comboStore';
import { todoApi } from '@/services/modules/todoApi';
import TagBadge from '@/components/business/TagBadge/TagBadge';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import { formatDate, formatRelativeTime } from '@/utils/format';
import type { Todo } from '@/types/todo';
import styles from './TodoDetail.module.css';

const { Title, Text, Paragraph } = Typography;

/**
 * 待办详情页面组件
 *
 * 展示待办事项的完整信息，支持状态切换和编辑删除操作。
 */
const TodoDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 使用 hooks
  const { handleToggle, handleDelete } = useTodo({ autoFetch: false });
  const getComboById = useComboStore((state) => state.getComboById);

  // 状态管理
  const [todo, setTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  /**
   * 获取待办详情
   */
  const fetchTodoDetail = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const data = await todoApi.getById(id);
      setTodo(data);
    } catch (error) {
      console.error('获取待办详情失败:', error);
      message.error('获取待办详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTodoDetail();
  }, [fetchTodoDetail]);

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
   * 获取所属组合名称
   */
  const getComboName = (): string | undefined => {
    if (!todo?.comboId) return undefined;
    const combo = getComboById(Number(todo.comboId));
    return combo?.name;
  };

  // 是否已完成
  const isCompleted =
    todo && (todo.completed !== false && todo.completed !== 0);

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
        {/* 第一行：标题 + 操作按钮 */}
        <Row justify="space-between" align="top">
          <Col flex="1" style={{ marginRight: 16 }}>
            <div className={styles.titleSection}>
              <span
                className={`${styles.todoText} ${isCompleted ? styles.textCompleted : ''}`}
              >
                {todo.text || '(空待办)'}
              </span>

              {/* 收藏标识 */}
              {todo.isStar ? (
                <StarFilled className={styles.starIcon} style={{ color: '#faad14' }} />
              ) : (
                <StarOutlined className={styles.starIcon} />
              )}

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

        {/* 完成状态切换开关 */}
        <div className={styles.toggleSection}>
          <Space align="center" size="large">
            <Switch
              checkedChildren={
                <>
                  <CheckCircleOutlined /> 已完成
                </>
              }
              unCheckedChildren={
                <>
                  <ClockCircleOutlined /> 未完成
                </>
              }
              checked={isCompleted ?? false}
              onChange={handleToggleComplete}
            />
          </Space>
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

        {/* 位置信息 */}
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
                </div>
              </div>
            </Card>
          </>
        )}

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
      </Card>
    </div>
  );
};

export default TodoDetail;
