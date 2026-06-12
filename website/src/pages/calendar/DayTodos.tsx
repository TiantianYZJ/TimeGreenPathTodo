import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Space, Button, Empty, Checkbox } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, ClockCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { useTodoStore, useTagStore } from '../../stores';
import { useEffect } from 'react';
import dayjs from 'dayjs';

const { Text } = Typography;

export default function DayTodos() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { todos, fetchTodos, toggleComplete } = useTodoStore();
  const { fetchAllTags, getAllTags } = useTagStore();

  useEffect(() => {
    if (todos.length === 0) fetchTodos();
    fetchAllTags();
  }, [fetchTodos, fetchAllTags, todos.length]);

  const allTags = getAllTags();
  const dayTodos = todos
    .filter((t) => !t.isDeleted && t.setDate === date)
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed > b.completed ? 1 : -1;
      if (a.setTime && b.setTime) return a.setTime.localeCompare(b.setTime);
      if (a.setTime) return -1;
      if (b.setTime) return 1;
      return 0;
    });

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/calendar')}>返回日历</Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(`/todo/new?date=${date}`)}
          style={{ borderRadius: 10, boxShadow: '0 2px 8px rgba(0,178,106,0.35)' }}
        >
          新建待办
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 20, fontWeight: 600 }}>
          {dayjs(date).format('YYYY年M月D日 dddd')}
        </Text>
        <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
          {dayTodos.length} 个待办 · {dayTodos.filter((t) => t.completed > 0).length} 已完成
        </Text>
      </div>

      {dayTodos.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {dayTodos.map((todo) => {
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
                    onChange={(e) => { e.stopPropagation(); toggleComplete(todo.id); }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 15,
                      fontWeight: isCompleted ? 400 : 500,
                      textDecoration: isCompleted ? 'line-through' : 'none',
                      color: isCompleted ? '#999' : '#1a1a1a',
                    }}>
                      {todo.text}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                      {todo.setTime && (
                        <span style={{ fontSize: 12, color: '#999', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <ClockCircleOutlined style={{ fontSize: 11 }} />
                          {todo.setTime}
                        </span>
                      )}
                      {todo.location && (
                        <span style={{ fontSize: 12, color: '#999', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                          <EnvironmentOutlined style={{ fontSize: 11 }} />
                          {todo.location.name}
                        </span>
                      )}
                      {todo.tags.map((tagId) => {
                        const tag = allTags.find((t) => t.id === tagId);
                        return tag ? (
                          <span key={tagId} style={{ fontSize: 11, color: tag.color, background: tag.color + '15', padding: '1px 8px', borderRadius: 6, fontWeight: 500 }}>
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card style={{ borderRadius: 12 }}>
          <Empty description="这一天没有待办事项">
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(`/todo/new?date=${date}`)}>
              新建待办
            </Button>
          </Empty>
        </Card>
      )}
    </div>
  );
}
