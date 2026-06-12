import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, InputNumber, Form, message, Space, Avatar, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAdminStore } from '../../stores';
import type { AdminUser } from '../../types';

const { Title, Text } = Typography;

export default function AdminUsers() {
  const { users, usersTotal, fetchUsers, updateUserLimits } = useAdminStore();
  const [page, setPage] = useState(1);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUsers(page, 20);
  }, [fetchUsers, page]);

  const handleEditLimits = (user: AdminUser) => {
    setEditingUser(user);
    form.setFieldsValue({ todoLimit: user.todoLimit, comboLimit: user.comboLimit, collabLimit: user.collabLimit });
  };

  const handleSaveLimits = async (values: { todoLimit: number; comboLimit: number; collabLimit: number }) => {
    if (!editingUser) return;
    await updateUserLimits(editingUser.id, values);
    message.success('更新成功');
    setEditingUser(null);
    fetchUsers(page, 20);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    {
      title: '用户', key: 'user', width: 180,
      render: (_: unknown, record: AdminUser) => (
        <Space>
          <Avatar src={record.avatarUrl} icon={<UserOutlined />} size={28} style={{ backgroundColor: '#00b26a' }} />
          <Text>{record.nickname || '未设置'}</Text>
          {record.isAdmin && <Tag color="gold" style={{ fontSize: 11 }}>管理员</Tag>}
        </Space>
      ),
    },
    { title: '待办数', dataIndex: 'todoCount', key: 'todoCount', width: 80 },
    { title: '待办上限', dataIndex: 'todoLimit', key: 'todoLimit', width: 80 },
    { title: '组合上限', dataIndex: 'comboLimit', key: 'comboLimit', width: 80 },
    { title: '注册时间', dataIndex: 'createdAt', key: 'createdAt', width: 120 },
    {
      title: '操作', key: 'action', width: 80,
      render: (_: unknown, record: AdminUser) => (
        <Button type="link" size="small" onClick={() => handleEditLimits(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>用户管理</Title>
      <Card style={{ borderRadius: 12 }}>
        <Table
          dataSource={users}
          columns={columns}
          rowKey="id"
          pagination={{ current: page, total: usersTotal, pageSize: 20, onChange: setPage }}
          size="small"
        />
      </Card>

      <Modal
        title={`编辑用户 - ${editingUser?.nickname || ''}`}
        open={!!editingUser}
        onCancel={() => setEditingUser(null)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSaveLimits}>
          <Form.Item name="todoLimit" label="待办上限"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="comboLimit" label="组合上限"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="collabLimit" label="共享组合上限"><InputNumber min={0} style={{ width: '100%' }} /></Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">保存</Button>
              <Button onClick={() => setEditingUser(null)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
