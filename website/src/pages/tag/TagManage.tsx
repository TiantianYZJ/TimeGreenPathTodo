import { useEffect, useState } from 'react';
import { Card, Typography, Space, Button, List, Tag, Modal, Form, Input, ColorPicker, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTagStore } from '../../stores';

const { Title, Text } = Typography;

export default function TagManage() {
  const { systemTags, userTags, fetchAllTags, createTag, updateTag, deleteTag } = useTagStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: number; name: string; color: string } | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllTags();
  }, [fetchAllTags]);

  const handleAdd = () => {
    setEditingTag(null);
    form.resetFields();
    form.setFieldsValue({ color: '#00b26a' });
    setModalOpen(true);
  };

  const handleEdit = (tag: { id: number; name: string; color: string }) => {
    setEditingTag(tag);
    form.setFieldsValue({ name: tag.name, color: tag.color });
    setModalOpen(true);
  };

  const handleSubmit = async (values: { name: string; color?: string }) => {
    setLoading(true);
    try {
      const color = typeof values.color === 'string' ? values.color : values.color?.toHexString?.() || '#00b26a';
      if (editingTag) {
        await updateTag(editingTag.id, { name: values.name, color });
        message.success('标签更新成功');
      } else {
        await createTag({ name: values.name, color });
        message.success('标签创建成功');
      }
      setModalOpen(false);
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteTag(id);
    message.success('标签删除成功');
  };

  return (
    <div className="animate-fade-in">
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ marginBottom: 0 }}>标签管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>新建标签</Button>
      </Space>

      <Card title="系统标签" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space wrap>
          {systemTags.map((tag) => (
            <Tag key={tag.id} color={tag.color}>{tag.name}</Tag>
          ))}
        </Space>
      </Card>

      <Card title="自定义标签" style={{ borderRadius: 12 }}>
        {userTags.length > 0 ? (
          <List
            dataSource={userTags}
            renderItem={(tag) => (
              <List.Item
                actions={[
                  <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(tag)} />,
                  <Popconfirm title="确定删除该标签？" onConfirm={() => handleDelete(tag.id)}>
                    <Button type="text" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <Tag color={tag.color}>{tag.name}</Tag>
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">暂无自定义标签</Text>
        )}
      </Card>

      <Modal
        title={editingTag ? '编辑标签' : '新建标签'}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="name" label="标签名称" rules={[{ required: true, message: '请输入标签名称' }]}>
            <Input placeholder="输入标签名称" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <ColorPicker />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingTag ? '保存' : '创建'}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
