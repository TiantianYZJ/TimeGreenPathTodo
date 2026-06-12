import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Tag, Button, Descriptions, Space, Checkbox, message, Image } from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, StarFilled, StarOutlined,
  DeleteOutlined, ClockCircleOutlined, EnvironmentOutlined,
} from '@ant-design/icons';
import { useTodoStore, useTagStore } from '../../stores';
import { SkeletonCard } from '../../components/ui/Skeleton';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

export default function TodoDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, fetchTodos, toggleComplete, toggleStar, deleteTodo } = useTodoStore();
  const { fetchAllTags, getAllTags } = useTagStore();

  useEffect(() => {
    if (todos.length === 0) fetchTodos();
    fetchAllTags();
  }, [fetchTodos, fetchAllTags, todos.length]);

  const todo = todos.find((t) => t.id === id);
  const allTags = getAllTags();

  if (!todo) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 0' }}>
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const isCompleted = todo.completed > 0;

  const handleDelete = async () => {
    await deleteTodo(todo.id);
    message.success('已删除');
    navigate(-1);
  };

  const handleNavigateToLocation = () => {
    if (todo.location) {
      const { latitude, longitude, name } = todo.location;
      window.open(`https://uri.amap.com/marker?position=${longitude},${latitude}&name=${encodeURIComponent(name)}`, '_blank');
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      {/* Top bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>
          返回
        </Button>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/todo/${id}/edit`)}
          >
            编辑
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={handleDelete}
          >
            删除
          </Button>
        </Space>
      </div>

      {/* Main card */}
      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20 }}>
          <Checkbox
            checked={isCompleted}
            onChange={() => {
              toggleComplete(todo.id);
              message.success(isCompleted ? '已标为未完成' : '已完成');
            }}
            style={{ marginTop: 4 }}
          />
          <div style={{ flex: 1 }}>
            <Title
              level={4}
              style={{
                marginBottom: 0,
                textDecoration: isCompleted ? 'line-through' : 'none',
                color: isCompleted ? '#999' : undefined,
              }}
            >
              {todo.text}
            </Title>
          </div>
          <Button
            type="text"
            aria-label={todo.isStar ? '取消星标' : '星标'}
            icon={todo.isStar ? <StarFilled style={{ color: '#faad14', fontSize: 20 }} /> : <StarOutlined style={{ fontSize: 20 }} />}
            onClick={() => toggleStar(todo.id)}
            style={{ width: 44, height: 44 }}
          />
        </div>

        {/* Status + Date */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          <Tag color={isCompleted ? 'success' : 'warning'}>
            {isCompleted ? '已完成' : '待完成'}
          </Tag>
          {todo.setDate && (
            <Tag icon={<ClockCircleOutlined />} color={dayjs(todo.setDate).isBefore(dayjs(), 'day') && !isCompleted ? 'error' : undefined}>
              {dayjs(todo.setDate).format('YYYY年M月D日')}
              {todo.setTime ? ` ${todo.setTime}` : ''}
            </Tag>
          )}
          {todo.version > 0 && (
            <Tag>v{todo.version}</Tag>
          )}
        </div>

        {/* Tags */}
        {todo.tags.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>标签</Text>
            <Space wrap>
              {todo.tags.map((tagId) => {
                const tag = allTags.find((t) => t.id === tagId);
                return tag ? (
                  <Tag key={tagId} color={tag.color} style={{ borderRadius: 6 }}>{tag.name}</Tag>
                ) : null;
              })}
            </Space>
          </div>
        )}

        {/* Location */}
        {todo.location && (
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>位置</Text>
            <Card
              size="small"
              style={{ background: '#f6ffed', borderRadius: 10, border: '1px solid #b7eb8f' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#00b26a', fontSize: 18 }} />
                  <div>
                    <Text strong>{todo.location.name}</Text>
                    {todo.location.address && (
                      <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>{todo.location.address}</Text>
                    )}
                  </div>
                </Space>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleNavigateToLocation}
                >
                  导航
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Images */}
        {todo.images && todo.images.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>
              图片 ({todo.images.length})
            </Text>
            <Image.PreviewGroup>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 8 }}>
                {todo.images.map((url, i) => (
                  <Image
                    key={i}
                    src={url}
                    style={{ borderRadius: 8, objectFit: 'cover', aspectRatio: '1' }}
                    fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F/PQAJhAN4kGk5RAAAAABJRU5ErkJggg=="
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {/* Remarks */}
        {todo.remarks && (
          <div style={{ marginBottom: 20 }}>
            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>备注</Text>
            <Card
              size="small"
              style={{
                background: 'var(--color-primary-bg-secondary)',
                borderRadius: 10,
                border: 'none',
              }}
            >
              <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                {todo.remarks}
              </Paragraph>
            </Card>
          </div>
        )}

        {/* Meta info */}
        <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 16, marginTop: 8 }}>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="创建时间">
              {dayjs(todo.createdAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {dayjs(todo.updatedAt).format('YYYY-MM-DD HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </Card>
    </div>
  );
}
