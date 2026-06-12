import { Card, Typography, Calendar, Badge } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTodoStore } from '../../stores';
import { useEffect } from 'react';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Title } = Typography;

export default function CalendarView() {
  const navigate = useNavigate();
  const { todos, fetchTodos } = useTodoStore();

  useEffect(() => {
    if (todos.length === 0) fetchTodos();
  }, [fetchTodos, todos.length]);

  const getTodoCountForDate = (date: Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return todos.filter((t) => !t.isDeleted && t.setDate === dateStr).length;
  };

  const dateCellRender = (value: Dayjs) => {
    const count = getTodoCountForDate(value);
    if (count === 0) return null;
    return (
      <Badge
        count={count}
        size="small"
        style={{ backgroundColor: '#00b26a' }}
      />
    );
  };

  const handleSelect = (date: Dayjs) => {
    navigate(`/calendar/${date.format('YYYY-MM-DD')}`);
  };

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>日历视图</Title>
      <Card style={{ borderRadius: 12 }}>
        <Calendar cellRender={(info) => info.type === 'date' ? dateCellRender(info.date) : null} onSelect={handleSelect} />
      </Card>
    </div>
  );
}
