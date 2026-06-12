/**
 * AddTodo - 添加/编辑待办页面
 *
 * 路由：
 * - /todo/add (新建模式)
 * - /todo/:id/edit (编辑模式)
 *
 * 功能：
 * - 表单字段：待办内容、日期、时间、备注、标签、组合、收藏
 * - 编辑模式从URL获取id，调用API获取数据填充表单
 * - 提交后返回上一页或跳转到待办列表
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Spin,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTodo } from '@/hooks/useTodo';
import { useComboStore } from '@/stores/comboStore';
import { useTagStore } from '@/stores/tagStore';
import { todoApi } from '@/services/modules/todoApi';
import type { Todo, CreateTodoData } from '@/types/todo';
import styles from './AddTodo.module.css';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * 添加/编辑待办页面组件
 *
 * 支持新建和编辑两种模式，通过路由参数区分。
 */
const AddTodo: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 判断是否为编辑模式
  const isEdit = Boolean(id);

  // 使用 hooks
  const { handleCreate, handleUpdate } = useTodo({ autoFetch: false });
  const combos = useComboStore((state) => state.combos);
  const allTags = useTagStore((state) => [...state.systemTags, ...state.userTags]);
  const fetchCombos = useComboStore((state) => state.fetchCombos);
  const fetchAllTags = useTagStore((state) => state.fetchAllTags);

  // 初始化获取组合和标签数据
  useEffect(() => {
    fetchCombos().catch(console.error);
    fetchAllTags().catch(console.error);
  }, [fetchCombos, fetchAllTags]);

  // 表单实例
  const [form] = Form.useForm();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [initialData, setInitialData] = useState<Todo | null>(null);
  const [isStar, setIsStar] = useState(false);

  /**
   * 编辑模式下获取待办详情
   */
  useEffect(() => {
    if (isEdit && id) {
      fetchTodoDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  /**
   * 获取待办详情用于编辑
   */
  const fetchTodoDetail = async (todoId: string) => {
    setLoading(true);
    try {
      const todo = await todoApi.getById(todoId);
      setInitialData(todo);

      // 填充表单
      form.setFieldsValue({
        text: todo.text,
        setDate: todo.setDate ? dayjs(todo.setDate) : dayjs(),
        setTime: todo.setTime ? dayjs(todo.setTime, 'HH:mm') : undefined,
        remarks: todo.remarks || '',
        tags: todo.tags || [],
        comboId: todo.comboId || undefined,
      });

      setIsStar(todo.isStar ?? false);
    } catch (error) {
      console.error('获取待办详情失败:', error);
      message.error('获取待办详情失败');
      navigate('/todo', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 提交表单（新建或更新）
   */
  const handleSubmit = async (values: Record<string, unknown>) => {
    setSubmitting(true);
    try {
      const data: CreateTodoData = {
        text: values.text as string,
        setDate: (values.setDate as dayjs.Dayjs).format('YYYY-MM-DD'),
        setTime: values.time
          ? (values.time as dayjs.Dayjs).format('HH:mm')
          : undefined,
        remarks: (values.remarks as string) || undefined,
        tags: (values.tags as number[]) || [],
        comboId: (values.comboId as string) || undefined,
      };

      if (isEdit && id) {
        // 更新模式
        await handleUpdate(id, { ...data, isStar });
        message.success('待办更新成功');
      } else {
        // 新建模式
        await handleCreate(data);
        message.success('待办创建成功');
      }

      // 返回列表或上一页
      navigate(-1);
    } catch (error) {
      console.error(isEdit ? '更新失败:' : '创建失败:', error);
      message.error(
        isEdit ? '更新待办失败，请重试' : '创建待办失败，请重试'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 取消操作，返回上一页
   */
  const handleCancel = () => {
    navigate(-1);
  };

  // 组合选项（仅非共享组合）
  const comboOptions = combos
    .filter((combo) => combo.is_shared !== 1)
    .map((combo) => ({
      value: combo.id.toString(),
      label: combo.name,
    }));

  // 标签选项
  const tagOptions = allTags.map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  // 加载状态
  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingWrapper}>
          <Spin size="large">
            <span>加载中...</span>
          </Spin>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          className={styles.backBtn}
        />
        <Title level={3} className={styles.pageTitle}>
          {isEdit ? '编辑待办' : '新建待办'}
        </Title>
      </div>

      {/* 表单卡片 */}
      <Card className={styles.formCard} variant="borderless">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            setDate: dayjs(),
            isStar: false,
          }}
          requiredMark="optional"
          size="large"
        >
          <Row gutter={[24, 0]}>
            {/* 左侧主要内容 */}
            <Col xs={24} lg={16}>
              {/* 待办内容 */}
              <Form.Item
                name="text"
                label="待办内容"
                rules={[
                  { required: true, message: '请输入待办内容' },
                  { max: 200, message: '待办内容不能超过200字' },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="输入待办事项的内容..."
                  showCount
                  maxLength={200}
                  className={styles.textInput}
                />
              </Form.Item>

              {/* 备注 */}
              <Form.Item name="remarks" label="备注">
                <TextArea
                  rows={3}
                  placeholder="添加备注信息（可选）..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Col>

            {/* 右侧附加信息 */}
            <Col xs={24} lg={8}>
              {/* 日期 */}
              <Form.Item
                name="setDate"
                label="日期"
                rules={[{ required: true, message: '请选择日期' }]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder="选择日期"
                  format="YYYY-MM-DD"
                />
              </Form.Item>

              {/* 时间 */}
              <Form.Item name="setTime" label="时间">
                <TimePicker
                  style={{ width: '100%' }}
                  placeholder="选择时间"
                  format="HH:mm"
                  minuteStep={5}
                />
              </Form.Item>

              {/* 标签选择 */}
              <Form.Item name="tags" label="标签">
                <Select
                  mode="multiple"
                  placeholder="选择标签"
                  allowClear
                  options={tagOptions}
                  maxTagCount="responsive"
                />
              </Form.Item>

              {/* 组合选择 */}
              <Form.Item name="comboId" label="所属组合">
                <Select
                  placeholder="选择组合（可选）"
                  allowClear
                  options={comboOptions}
                  notFoundContent="暂无可用组合"
                />
              </Form.Item>

              {/* 收藏开关 */}
              <Form.Item label="收藏" className={styles.starItem}>
                <Switch
                  checkedChildren="已收藏"
                  unCheckedChildren="未收藏"
                  checked={isStar}
                  onChange={(checked) => setIsStar(checked)}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* 操作按钮栏 */}
          <Form.Item className={styles.actionBar}>
            <Space size="middle">
              <Button onClick={handleCancel} size="large">
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={submitting}
                size="large"
                style={{ backgroundColor: '#00b26a', minWidth: 120 }}
              >
                {isEdit ? '保存修改' : '创建待办'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AddTodo;
