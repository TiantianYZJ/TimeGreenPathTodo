import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Card, Form, Input, Button, DatePicker, TimePicker, Select, Switch,
  Space, Typography, message, Tag, Spin, Upload, Image, Modal,
} from 'antd';
import {
  ArrowLeftOutlined, PlusOutlined, EnvironmentOutlined,
  DeleteOutlined, AimOutlined,
} from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload';
import { useTodoStore, useTagStore, useComboStore } from '../../stores';
import type { LocationInfo } from '../../types';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

const IMAGE_UPLOAD_URL = 'https://img.scdn.io/api/v1.php';
const MAX_IMAGES = 9;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export default function TodoForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationForm] = Form.useForm();

  const { todos, fetchTodos, createTodo, updateTodo } = useTodoStore();
  const { systemTags, userTags, fetchAllTags } = useTagStore();
  const { combos, sharedCombos, fetchCombos, fetchSharedCombos } = useComboStore();

  useEffect(() => {
    fetchAllTags();
    fetchCombos();
    fetchSharedCombos();
    if (isEdit && todos.length === 0) {
      fetchTodos();
    }
  }, [fetchAllTags, fetchCombos, fetchSharedCombos, fetchTodos, isEdit, todos.length]);

  useEffect(() => {
    // Pre-fill date from query param (e.g. from DayTodos page)
    if (!isEdit) {
      const dateParam = searchParams.get('date');
      if (dateParam) {
        form.setFieldsValue({ setDate: dayjs(dateParam) });
      }
    }
  }, [searchParams, isEdit, form]);

  useEffect(() => {
    if (isEdit && todos.length > 0) {
      const todo = todos.find((t) => t.id === id);
      if (todo) {
        form.setFieldsValue({
          text: todo.text,
          setDate: todo.setDate ? dayjs(todo.setDate) : null,
          setTime: todo.setTime ? dayjs(todo.setTime, 'HH:mm') : null,
          remarks: todo.remarks || '',
          tags: todo.tags || [],
          isStar: todo.isStar,
          comboId: todo.comboId,
        });
        if (todo.images && todo.images.length > 0) {
          setUploadedUrls(todo.images);
          setFileList(todo.images.map((url, i) => ({
            uid: String(i),
            name: `image-${i}`,
            status: 'done',
            url,
          })));
        }
        if (todo.location) {
          setLocation(todo.location);
        }
      }
    }
  }, [id, isEdit, todos, form]);

  const handleUpload = async (file: RcFile): Promise<boolean> => {
    if (file.size > MAX_FILE_SIZE) {
      // Try to compress via canvas
      const compressed = await compressImage(file);
      if (compressed) {
        await doUpload(compressed);
      }
    } else {
      await doUpload(file);
    }
    return false; // prevent default upload
  };

  const compressImage = (file: RcFile): Promise<File | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1920;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) {
              height = (height / width) * maxSize;
              width = maxSize;
            } else {
              width = (width / height) * maxSize;
              height = maxSize;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                resolve(null);
              }
            }, 'image/jpeg', 0.8);
          } else {
            resolve(null);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const doUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(IMAGE_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.url || data.data?.url) {
        const url = data.url || data.data.url;
        setUploadedUrls((prev) => [...prev, url]);
        setFileList((prev) => [
          ...prev,
          { uid: String(Date.now()), name: file.name, status: 'done', url },
        ]);
        message.success('图片上传成功');
      } else {
        message.error('图片上传失败');
      }
    } catch {
      message.error('图片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (file: UploadFile) => {
    const url = file.url;
    setUploadedUrls((prev) => prev.filter((u) => u !== url));
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleLocationFromBrowser = () => {
    if (!navigator.geolocation) {
      message.error('浏览器不支持定位');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          name: '当前位置',
          address: '',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        message.success('已获取当前位置');
      },
      () => {
        message.error('获取位置失败，请检查定位权限');
      },
    );
  };

  const handleLocationManual = (values: { name: string; address: string; latitude: number; longitude: number }) => {
    setLocation(values);
    setLocationModalOpen(false);
    locationForm.resetFields();
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const data = {
        text: values.text as string,
        setDate: values.setDate ? (values.setDate as dayjs.Dayjs).format('YYYY-MM-DD') : undefined,
        setTime: values.setTime ? (values.setTime as dayjs.Dayjs).format('HH:mm') : undefined,
        remarks: (values.remarks as string) || undefined,
        tags: (values.tags as number[]) || [],
        isStar: values.isStar as boolean,
        comboId: (values.comboId as number) || null,
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        location: location || undefined,
      };

      if (isEdit) {
        await updateTodo(id!, data);
        message.success('待办更新成功');
      } else {
        await createTodo(data);
        message.success('待办创建成功');
      }
      navigate(-1);
    } catch {
      // handled by interceptor
    } finally {
      setSubmitting(false);
    }
  };

  const allTags = [...systemTags, ...userTags];
  const allCombos = [
    ...combos.map((c) => ({ label: c.name, value: c.id })),
    ...sharedCombos.map((c) => ({ label: `[共享] ${c.name}`, value: c.id })),
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 640, margin: '0 auto' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        type="text"
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card
        style={{
          borderRadius: 16,
          border: 'none',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        <Title level={4} style={{ marginBottom: 24 }}>
          {isEdit ? '编辑待办' : '新建待办'}
        </Title>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ isStar: false }}
          size="large"
        >
          <Form.Item
            name="text"
            label="待办内容"
            rules={[{ required: true, message: '请输入待办内容' }]}
          >
            <Input placeholder="输入待办事项..." maxLength={200} showCount />
          </Form.Item>

          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="setDate" label="日期" style={{ flex: 1 }}>
              <DatePicker placeholder="选择日期" style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="setTime" label="时间" style={{ flex: 1 }}>
              <TimePicker placeholder="选择时间" format="HH:mm" style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item name="tags" label="标签">
            <Select
              mode="multiple"
              placeholder="选择标签"
              options={allTags.map((t) => ({
                label: t.name,
                value: t.id,
              }))}
              tagRender={({ label, value, closable, onClose }) => {
                const tag = allTags.find((t) => t.id === value);
                return (
                  <Tag
                    color={tag?.color}
                    closable={closable}
                    onClose={onClose}
                    style={{ marginRight: 3 }}
                  >
                    {label}
                  </Tag>
                );
              }}
            />
          </Form.Item>

          <Form.Item name="comboId" label="所属组合">
            <Select
              placeholder="选择组合（可选）"
              allowClear
              options={allCombos}
            />
          </Form.Item>

          {/* Location */}
          <Form.Item label="位置">
            {location ? (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f',
              }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#00b26a' }} />
                  <span>{location.name}{location.address ? ` - ${location.address}` : ''}</span>
                </Space>
                <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => setLocation(null)} />
              </div>
            ) : (
              <Space>
                <Button icon={<AimOutlined />} onClick={handleLocationFromBrowser}>获取当前位置</Button>
                <Button icon={<EnvironmentOutlined />} onClick={() => setLocationModalOpen(true)}>手动输入</Button>
              </Space>
            )}
          </Form.Item>

          {/* Images */}
          <Form.Item label={`图片 (${uploadedUrls.length}/${MAX_IMAGES})`}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={handleUpload}
              onRemove={handleRemove}
              multiple
              accept="image/*"
            >
              {fileList.length >= MAX_IMAGES ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8, fontSize: 12 }}>上传图片</div>
                </div>
              )}
            </Upload>
            {uploading && <Spin size="small" style={{ marginLeft: 8 }} />}
          </Form.Item>

          <Form.Item name="remarks" label="备注">
            <TextArea placeholder="添加备注..." rows={4} maxLength={1000} showCount />
          </Form.Item>

          <Form.Item name="isStar" label="星标" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => navigate(-1)}>取消</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                style={{ boxShadow: '0 2px 8px rgba(0,178,106,0.35)' }}
              >
                {isEdit ? '保存修改' : '创建待办'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Location Manual Input Modal */}
      <Modal
        title="手动输入位置"
        open={locationModalOpen}
        onCancel={() => setLocationModalOpen(false)}
        footer={null}
      >
        <Form form={locationForm} layout="vertical" onFinish={handleLocationManual}>
          <Form.Item name="name" label="地点名称" rules={[{ required: true }]}>
            <Input placeholder="例如：星巴克" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="例如：北京市朝阳区xxx" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="latitude" label="纬度" style={{ flex: 1 }}>
              <Input type="number" placeholder="39.9" />
            </Form.Item>
            <Form.Item name="longitude" label="经度" style={{ flex: 1 }}>
              <Input type="number" placeholder="116.4" />
            </Form.Item>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit">确定</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
