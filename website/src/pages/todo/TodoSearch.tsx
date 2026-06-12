import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Input, Empty, Space, Tag, Checkbox, Button } from 'antd';
import { ArrowLeftOutlined, SearchOutlined, StarFilled, ClockCircleOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useTodoStore, useTagStore } from '../../stores';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function TodoSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { todos, fetchTodos, toggleComplete } = useTodoStore();
  const { fetchAllTags, getAllTags } = useTagStore();
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');

  useEffect(() => {
    if (todos.length === 0) fetchTodos();
    fetchAllTags();
  }, [fetchTodos, fetchAllTags, todos.length]);

  const allTags = getAllTags();

  const results = keyword.trim()
    ? todos.filter(
        (t) =>
          !t.isDeleted &&
          (t.text.toLowerCase().includes(keyword.toLowerCase()) ||
            (t.remarks && t.remarks.toLowerCase().includes(keyword.toLowerCase())))
      )
    : [];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        type="text"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          marginBottom: 16,
        }}
      >
        <Input
          size="large"
          placeholder="搜索待办内容或备注..."
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setSearchParams(e.target.value ? { q: e.target.value } : {});
          }}
          allowClear
          autoFocus
          style={{ borderRadius: 10 }}
        />
      </Card>

      {keyword.trim() ? (
        results.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Text type="secondary" style={{ fontSize: 13, padding: '0 4px' }}>
              找到 {results.length} 个结果
            </Text>
            {results.map((todo) => {
              const isCompleted = todo.completed > 0;
              return (
                <Card
                  key={todo.id}
                  size="small"
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    opacity: isCompleted ? 0.65 : 1,
                    cursor: 'pointer',
                  }}
                  styles={{ body: { padding: '12px 16px' } }}
                  onClick={() => navigate(`/todo/${todo.id}`)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Checkbox
                      checked={isCompleted}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => toggleComplete(todo.id)}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: isCompleted ? 400 : 500,
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? '#999' : '#1a1a1a',
                        }}
                      >
                        {todo.text}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        {todo.setDate && (
                          <span style={{ fontSize: 12, color: '#999', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                            <ClockCircleOutlined style={{ fontSize: 11 }} />
                            {dayjs(todo.setDate).format('M月D日')}
                          </span>
                        )}
                        {todo.tags.slice(0, 3).map((tagId) => {
                          const tag = allTags.find((t) => t.id === tagId);
                          return tag ? (
                            <Tag key={tagId} color={tag.color} style={{ fontSize: 11, borderRadius: 4, padding: '0 4px', lineHeight: '18px' }}>
                              {tag.name}
                            </Tag>
                          ) : null;
                        })}
                        {todo.isStar && <StarFilled style={{ color: '#faad14', fontSize: 12 }} />}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card style={{ borderRadius: 16, border: 'none' }}>
            <Empty description="没有找到匹配的待办" />
          </Card>
        )
      ) : (
        <Card style={{ borderRadius: 16, border: 'none' }}>
          <Empty description="输入关键词开始搜索" />
        </Card>
      )}
    </div>
  );
}
