import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Popconfirm, message, Tag, Space } from 'antd';
import { useAdminStore } from '../../stores';

const { Title, Text } = Typography;

interface CommentItem {
  id: number;
  content: string;
  user_name: string;
  user_id: number;
  todo_text: string;
  combo_name: string;
  combo_id: number;
  created_at: string;
  is_deleted: number;
}

export default function AdminComments() {
  const { comments, commentsTotal, fetchComments, deleteComment } = useAdminStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchComments(page, 20);
  }, [fetchComments, page]);

  const handleDelete = async (id: number) => {
    await deleteComment(id);
    message.success('评论已删除');
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '用户', key: 'user', width: 100,
      render: (_: unknown, record: CommentItem) => <Text>{record.user_name || '-'}</Text>,
    },
    {
      title: '所属待办', key: 'todo', width: 120, ellipsis: true,
      render: (_: unknown, record: CommentItem) => <Text type="secondary">{record.todo_text || '-'}</Text>,
    },
    {
      title: '所属组合', key: 'combo', width: 100,
      render: (_: unknown, record: CommentItem) => record.combo_name ? <Tag>{record.combo_name}</Tag> : '-',
    },
    { title: '时间', dataIndex: 'created_at', key: 'created_at', width: 160 },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: unknown, record: CommentItem) => (
        <Popconfirm title="确定删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger size="small">删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>评论管理</Title>
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={comments as unknown as CommentItem[]}
          columns={columns}
          rowKey="id"
          pagination={{ current: page, total: commentsTotal, pageSize: 20, onChange: setPage }}
          size="small"
        />
      </Card>
    </div>
  );
}
