import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, Switch, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useAdminStore } from '../../stores';
import type { AdminNotice } from '../../types';

const { Title } = Typography;

export default function AdminNotices() {
  const { notices, fetchNotices, createNotice, updateNotice, deleteNotice } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const handleCreate = () => {
    setEditingIndex(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
    setModalOpen(true);
  };

  const handleEdit = (notice: AdminNotice, index: number) => {
    setEditingIndex(index);
    form.setFieldsValue({ title: notice.title, content: notice.content, isActive: notice.isActive });
    setModalOpen(true);
  };

  const handleSubmit = async (values: { title: string; content: string; isActive: boolean }) => {
    setLoading(true);
    try {
      if (editingIndex !== null) {
        await updateNotice(editingIndex, values);
        message.success('公告更新成功');
      } else {
        await createNotice(values);
        message.success('公告创建成功');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (notice: AdminNotice, index: number) => {
    await updateNotice(index, { isActive: !notice.isActive });
    message.success(notice.isActive ? '已禁用' : '已启用');
  };

  const handleDelete = async (index: number) => {
    await deleteNotice(index);
    message.success('公告已删除');
  };

  const columns = [
    { title: '序号', key: 'index', width: 60, render: (_: unknown, __: unknown, index: number) => index + 1 },
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, render: (v: string) => v || '(版本公告)' },
    {
      title: '版本', dataIndex: 'version', key: 'version', width: 80,
      render: (v: string) => v ? <Tag color="blue">V{v}</Tag> : '-',
    },
    {
      title: '状态', dataIndex: 'isActive', key: 'isActive', width: 80,
      render: (v: boolean) => <Tag color={v !== false ? 'success' : 'default'}>{v !== false ? '启用' : '禁用'}</Tag>,
    },
    {
      title: '操作', key: 'action', width: 200,
      render: (_: unknown, record: AdminNotice, index: number) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, index)}>编辑</Button>
          <Button type="link" size="small" onClick={() => handleToggleActive(record, index)}>
            {record.isActive !== false ? '禁用' : '启用'}
          </Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(index)}>
            <Button type="link" danger size="small">删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ marginBottom: 0 }}>公告管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建公告</Button>
      </Space>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={notices} columns={columns} rowKey={(_, index) => String(index)} size="small" pagination={false} />
      </Card>

      <Modal
        title={editingIndex !== null ? '编辑公告' : '新建公告'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label="内容" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
          <Form.Item name="isActive" label="启用" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingIndex !== null ? '保存' : '发布'}
              </Button>
              <Button onClick={() => setModalOpen(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
