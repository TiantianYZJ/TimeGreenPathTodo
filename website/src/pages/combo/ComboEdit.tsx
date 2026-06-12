import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Form, Input, Button, Space, Switch, InputNumber, message, Modal, Tabs, Segmented } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useComboStore } from '../../stores';
import TIcon from '../../components/ui/TIcon';
import { iconCategories, iconCategoryNames, defaultIcons } from '../../config/iconCategories';

const { Title, Text } = Typography;

const PRESET_COLORS = ['#00B26A', '#1890FF', '#722ED1', '#FA8C16', '#C8CA4F', '#13C2C2', '#EB2F96', '#F5222D'];

export default function ComboEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { combos, fetchCombos, createCombo, updateCombo } = useComboStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#00B26A');
  const [isShared, setIsShared] = useState(false);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('常用');
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit && combos.length === 0) fetchCombos();
  }, [isEdit, fetchCombos, combos.length]);

  useEffect(() => {
    if (isEdit) {
      const combo = combos.find((c) => c.id === Number(id));
      if (combo) {
        form.setFieldsValue({
          name: combo.name,
          description: combo.description,
          memberLimit: combo.memberLimit,
        });
        setSelectedIcon(combo.icon || 'folder');
        setSelectedColor(combo.color || '#00B26A');
        setIsShared(combo.isShared);
      }
    }
  }, [isEdit, id, combos, form]);

  const handleSubmit = async (values: { name: string; description?: string; memberLimit?: number }) => {
    setLoading(true);
    try {
      const data = {
        name: values.name,
        description: values.description,
        icon: selectedIcon,
        color: selectedColor,
        isShared,
        memberLimit: isShared ? (values.memberLimit || 50) : 0,
      };
      if (isEdit) {
        await updateCombo(Number(id), data);
        message.success('组合更新成功');
      } else {
        const combo = await createCombo(data);
        if (combo) message.success('组合创建成功');
      }
      navigate('/combos');
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const currentIcons = iconCategories[currentCategory] || defaultIcons;

  return (
    <div className="animate-fade-in">
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>返回</Button>
      </Space>
      <Title level={4} style={{ marginBottom: 16 }}>{isEdit ? '编辑组合' : '新建组合'}</Title>
      <Card style={{ borderRadius: 12, maxWidth: 600 }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ memberLimit: 50 }}>
          {/* Icon + Color preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div
              onClick={() => setIconPickerOpen(true)}
              style={{
                width: 64, height: 64, borderRadius: 12,
                background: selectedColor + '15',
                border: `2px solid ${selectedColor}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              <TIcon name={selectedIcon} size={32} style={{ color: selectedColor }} />
            </div>
            <div>
              <Text strong style={{ display: 'block' }}>图标</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>点击更换图标</Text>
            </div>
          </div>

          {/* Color selection */}
          <Form.Item label="颜色">
            <Space wrap>
              {PRESET_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => setSelectedColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, background: c,
                    cursor: 'pointer', border: selectedColor === c ? '3px solid #333' : '3px solid transparent',
                    transition: 'border 0.15s',
                  }}
                />
              ))}
            </Space>
          </Form.Item>

          <Form.Item name="name" label="组合名称" rules={[{ required: true, message: '请输入组合名称' }, { max: 30, message: '最多30个字符' }]}>
            <Input placeholder="输入组合名称" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea rows={3} placeholder="输入描述（可选）" />
          </Form.Item>

          {/* Shared toggle */}
          <Form.Item label="共享组合">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Switch checked={isShared} onChange={setIsShared} disabled={isEdit} />
              <Text type="secondary">{isShared ? '可邀请成员协作' : '仅自己可见'}</Text>
            </div>
          </Form.Item>

          {isShared && (
            <Form.Item name="memberLimit" label="成员上限">
              <InputNumber min={2} max={200} style={{ width: '100%' }} />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isEdit ? '保存' : '创建'}
              </Button>
              <Button onClick={() => navigate(-1)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Icon Picker Modal */}
      <Modal
        title="选择图标"
        open={iconPickerOpen}
        onCancel={() => setIconPickerOpen(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 12 }}>
          <Segmented
            options={iconCategoryNames}
            value={currentCategory}
            onChange={(v) => setCurrentCategory(v as string)}
            style={{ flexWrap: 'wrap' }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', gap: 4, maxHeight: 400, overflowY: 'auto' }}>
          {currentIcons.map((icon) => (
            <div
              key={icon}
              onClick={() => { setSelectedIcon(icon); setIconPickerOpen(false); }}
              style={{
                width: 40, height: 40, borderRadius: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                background: selectedIcon === icon ? selectedColor + '20' : 'transparent',
                border: selectedIcon === icon ? `2px solid ${selectedColor}` : '2px solid transparent',
                transition: 'all 0.15s',
              }}
            >
              <TIcon name={icon} size={20} />
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
