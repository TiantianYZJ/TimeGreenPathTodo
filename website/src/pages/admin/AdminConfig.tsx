import { useEffect, useState } from 'react';
import { Card, Typography, Form, Input, Button, message, Spin, Space, Descriptions } from 'antd';
import { useAdminStore } from '../../stores';

const { Title, Text } = Typography;

export default function AdminConfig() {
  const { config, fetchConfig, updateConfig } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const load = async () => {
      await fetchConfig();
      setLoading(false);
    };
    load();
  }, [fetchConfig]);

  useEffect(() => {
    if (config) {
      form.setFieldsValue({ adminIds: config.adminIds?.join(', ') || '' });
    }
  }, [config, form]);

  const handleSave = async (values: { adminIds: string }) => {
    setSaving(true);
    try {
      const ids = values.adminIds
        .split(',')
        .map((s) => parseInt(s.trim()))
        .filter((n) => !isNaN(n));
      await updateConfig({ adminIds: ids });
      message.success('配置已更新');
    } catch {
      // handled
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>Admin 配置</Title>
      <Spin spinning={loading}>
        <Card style={{ borderRadius: 12, maxWidth: 600 }}>
          <Descriptions column={1} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="当前管理员数量">
              {config?.adminIds?.length || 0}
            </Descriptions.Item>
          </Descriptions>

          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              name="adminIds"
              label="管理员用户 ID"
              extra="多个 ID 用逗号分隔。修改后对应用户将获得/失去管理员权限。"
            >
              <Input.TextArea rows={3} placeholder="例如: 1, 2, 5" />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>保存配置</Button>
                <Text type="secondary" style={{ fontSize: 12 }}>修改后立即生效</Text>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}
