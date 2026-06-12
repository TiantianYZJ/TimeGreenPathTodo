import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Modal, Form, Input, DatePicker, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useAdminStore } from '../../stores';
import dayjs from 'dayjs';

const { Title } = Typography;

interface ChangelogEntry {
  version: string;
  date: string;
  content: string[];
}

export default function AdminChangelog() {
  const { changelog, fetchChangelog, createChangelog, updateChangelog, deleteChangelog } = useAdminStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchChangelog();
  }, [fetchChangelog]);

  const handleCreate = () => {
    setEditingIndex(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (entry: ChangelogEntry, index: number) => {
    setEditingIndex(index);
    form.setFieldsValue({
      version: entry.version,
      date: dayjs(entry.date),
      content: entry.content.join('\n'),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (values: { version: string; date: dayjs.Dayjs; content: string }) => {
    setSubmitting(true);
    try {
      const contentLines = values.content.split('\n').filter((l) => l.trim());
      const data = {
        version: values.version,
        date: values.date.format('YYYY-MM-DD'),
        content: contentLines,
      };

      if (editingIndex !== null) {
        await updateChangelog(editingIndex, data);
        message.success('更新日志修改成功');
      } else {
        await createChangelog(data);
        message.success('更新日志创建成功');
      }
      setModalOpen(false);
      form.resetFields();
    } catch {
      // handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (index: number) => {
    await deleteChangelog(index);
    message.success('已删除');
  };

  const columns = [
    { title: '版本', dataIndex: 'version', key: 'version', width: 100, render: (v: string) => <Tag color="blue">V{v}</Tag> },
    { title: '日期', dataIndex: 'date', key: 'date', width: 120 },
    {
      title: '更新内容', dataIndex: 'content', key: 'content',
      render: (content: string[]) => (
        <ul style={{ margin: 0, paddingLeft: 16 }}>
          {(content || []).map((line, i) => <li key={i}>{line}</li>)}
        </ul>
      ),
    },
    {
      title: '操作', key: 'action', width: 120,
      render: (_: unknown, record: ChangelogEntry, index: number) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record, index)}>编辑</Button>
          <Popconfirm title="确定删除？" onConfirm={() => handleDelete(index)}>
            <Button type="link" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-in">
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ marginBottom: 0 }}>更新日志管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>新建日志</Button>
      </Space>

      <Card style={{ borderRadius: 12 }}>
        <Table dataSource={changelog} columns={columns} rowKey="version" size="small" pagination={false} />
      </Card>

      <Modal
        title={editingIndex !== null ? '编辑更新日志' : '新建更新日志'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={500}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="version" label="版本号" rules={[{ required: true, message: '请输入版本号' }]}>
            <Input placeholder="例如: 2.0.3" disabled={editingIndex !== null} />
          </Form.Item>
          <Form.Item name="date" label="日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="content" label="更新内容" rules={[{ required: true, message: '请输入更新内容' }]} extra="每行一条更新内容">
            <Input.TextArea rows={6} placeholder={"新增：xxx\n优化：xxx\n修复：xxx"} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
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
