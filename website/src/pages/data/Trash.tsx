import { useEffect } from 'react';
import { Card, Typography, List, Button, Space, Empty, Popconfirm, message } from 'antd';
import { UndoOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTodoStore } from '../../stores';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function Trash() {
  const { deletedTodos, fetchDeleted, restoreTodo, permanentDelete } = useTodoStore();

  useEffect(() => {
    fetchDeleted();
  }, [fetchDeleted]);

  const handleRestore = async (id: string) => {
    await restoreTodo(id);
    message.success('已恢复');
  };

  const handlePermanentDelete = async (id: string) => {
    await permanentDelete(id);
    message.success('已永久删除');
  };

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>回收站</Title>
      <Card style={{ borderRadius: 12 }}>
        {deletedTodos.length > 0 ? (
          <List
            dataSource={deletedTodos}
            renderItem={(todo) => (
              <List.Item
                actions={[
                  <Button type="text" icon={<UndoOutlined />} onClick={() => handleRestore(todo.id)}>恢复</Button>,
                  <Popconfirm title="永久删除不可恢复，确定？" onConfirm={() => handlePermanentDelete(todo.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />}>永久删除</Button>
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={todo.text}
                  description={`删除于 ${dayjs(todo.deletedAt).format('YYYY-MM-DD HH:mm')}`}
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="回收站为空" />
        )}
      </Card>
    </div>
  );
}
