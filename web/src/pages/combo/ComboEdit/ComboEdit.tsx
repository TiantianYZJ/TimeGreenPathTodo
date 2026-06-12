/**
 * ComboEdit - 创建/编辑组合页面
 *
 * 路由：
 * - /combos/new (新建模式)
 * - /combos/:id/edit (编辑模式)
 *
 * 功能：
 * - 表单字段：名称、图标、颜色、是否共享、成员上限
 * - 提交后跳转到组合列表或详情
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  Switch,
  Button,
  Space,
  Row,
  Col,
  Spin,
  Typography,
  message,
  ColorPicker,
  InputNumber,
} from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import {
  FolderIcon,
  FolderOpenIcon,
  UsergroupIcon,
  StarIcon,
  HeartIcon,
  BugIcon,
  BookIcon,
  ThunderIcon,
} from 'tdesign-icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCombo } from '@/hooks/useCombo';
import { comboApi } from '@/services/modules/comboApi';
import type { Combo } from '@/types/combo';
import styles from './ComboEdit.module.css';

const { Title, Text } = Typography;

/** 预设图标列表 */
const ICON_OPTIONS = [
  { value: 'folder', label: '文件夹', icon: 'folder' },
  { value: 'folder-open', label: '打开的文件夹', icon: 'folder-open' },
  { value: 'team', label: '团队', icon: 'team' },
  { value: 'star', label: '星星', icon: 'star' },
  { value: 'heart', label: '爱心', icon: 'heart' },
  { value: 'bulb', label: '灯泡', icon: 'bulb' },
  { value: 'book', label: '书籍', icon: 'book' },
  { value: 'thunderbolt', label: '闪电', icon: 'thunderbolt' },
];

/** 预设颜色列表 */
const PRESET_COLORS = [
  '#00b26a',
  '#1677ff',
  '#722ed1',
  '#eb2f96',
  '#fa8c16',
  '#faad14',
  '#13c2c2',
  '#52c41a',
  '#f5222d',
  '#2f54eb',
];

/**
 * 创建/编辑组合页面组件
 *
 * 支持新建和编辑两种模式，通过路由参数区分。
 */
const ComboEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 判断是否为编辑模式
  const isEdit = Boolean(id);

  // 使用 hooks
  const { createCombo, updateCombo } = useCombo();

  // 表单实例
  const [form] = Form.useForm();

  // 状态管理
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState('folder');
  const [selectedColor, setSelectedColor] = useState('#00b26a');
  const [isShared, setIsShared] = useState(false);

  /**
   * 编辑模式下获取组合详情
   */
  useEffect(() => {
    if (isEdit && id) {
      fetchComboDetail(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]);

  /**
   * 获取组合详情用于编辑
   */
  const fetchComboDetail = async (comboId: string) => {
    setLoading(true);
    try {
      const combo = await comboApi.getById(Number(comboId));

      // 填充表单
      form.setFieldsValue({
        name: combo.name,
        is_shared: combo.is_shared === 1,
        member_limit: combo.member_limit ?? 50,
      });

      setSelectedIcon(combo.icon || 'folder');
      setSelectedColor(combo.color || '#00b26a');
      setIsShared(combo.is_shared === 1);
    } catch (error) {
      console.error('获取组合详情失败:', error);
      message.error('获取组合详情失败');
      navigate('/combos', { replace: true });
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
      const data = {
        name: values.name as string,
        icon: selectedIcon,
        color: selectedColor,
        is_shared: isShared,
        member_limit: values.member_limit as number | undefined,
      };

      if (isEdit && id) {
        await updateCombo(Number(id), data);
        message.success('组合更新成功');
      } else {
        await createCombo(data);
        message.success('组合创建成功');
      }

      // 跳转到组合列表
      navigate('/combos', { replace: true });
    } catch (error) {
      console.error(isEdit ? '更新失败:' : '创建失败:', error);
      message.error(
        isEdit ? '更新组合失败，请重试' : '创建组合失败，请重试'
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
          {isEdit ? '编辑组合' : '新建组合'}
        </Title>
      </div>

      {/* 表单卡片 */}
      <Card className={styles.formCard} variant="borderless">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: '',
            is_shared: false,
            member_limit: 50,
          }}
          requiredMark="optional"
          size="large"
        >
          <Row gutter={[32, 0]}>
            {/* 左侧主要内容 */}
            <Col xs={24} lg={14}>
              {/* 组合名称 */}
              <Form.Item
                name="name"
                label="组合名称"
                rules={[
                  { required: true, message: '请输入组合名称' },
                  { max: 30, message: '组合名称不能超过30个字符' },
                ]}
              >
                <Input
                  placeholder="输入组合名称..."
                  maxLength={30}
                  showCount
                  className={styles.nameInput}
                />
              </Form.Item>

              {/* 是否共享 */}
              <Form.Item label="共享组合" className={styles.sharedItem}>
                <div className={styles.sharedSwitch}>
                  <Switch
                    checkedChildren="是"
                    unCheckedChildren="否"
                    checked={isShared}
                    onChange={(checked) => setIsShared(checked)}
                  />
                  <Text type="secondary" className={styles.sharedHint}>
                    开启后可邀请他人协作管理此组合中的待办
                  </Text>
                </div>
              </Form.Item>

              {/* 成员上限（仅共享时显示） */}
              {isShared && (
                <Form.Item
                  name="member_limit"
                  label="成员上限"
                  rules={[
                    { required: true, message: '请设置成员上限' },
                    {
                      type: 'number',
                      min: 2,
                      max: 200,
                      message: '成员上限在 2-200 人之间',
                    },
                  ]}
                  tooltip="共享组合允许的最大成员数量"
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    placeholder="设置成员上限"
                    min={2}
                    max={200}
                  />
                </Form.Item>
              )}
            </Col>

            {/* 右侧：图标和颜色选择 */}
            <Col xs={24} lg={10}>
              {/* 图标选择 */}
              <Form.Item label="选择图标">
                <div className={styles.iconGrid}>
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.iconOption} ${selectedIcon === opt.value ? styles.iconSelected : ''}`}
                      onClick={() => setSelectedIcon(opt.value)}
                      title={opt.label}
                    >
                      <span className={styles.iconEmoji}>{getTDesignIcon(opt.icon, '1.2em')}</span>
                      <span className={styles.iconLabel}>{opt.label}</span>
                    </button>
                  ))}
                </div>
              </Form.Item>

              {/* 颜色选择 */}
              <Form.Item label="选择颜色">
                <div className={styles.colorSection}>
                  {/* 预设颜色 */}
                  <div className={styles.presetColors}>
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`${styles.colorSwatch} ${selectedColor === color ? styles.colorSelected : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        title={color}
                        aria-label={`选择颜色 ${color}`}
                      />
                    ))}
                  </div>

                  {/* 自定义颜色选择器 */}
                  <div className={styles.customColorPicker}>
                    <ColorPicker
                      value={selectedColor}
                      onChange={(color) => setSelectedColor(color.toHexString())}
                      presets={[
                        {
                          label: '推荐颜色',
                          colors: PRESET_COLORS,
                        },
                      ]}
                      size="large"
                    />
                    <Text type="secondary" className={styles.colorValue}>
                      {selectedColor}
                    </Text>
                  </div>
                </div>
              </Form.Item>

              {/* 预览区域 */}
              <div className={styles.previewSection}>
                <Text type="secondary">预览效果</Text>
                <div
                  className={styles.previewCard}
                  style={{
                    borderLeftColor: selectedColor,
                    backgroundColor: `${selectedColor}08`,
                  }}
                >
                  <div
                    className={styles.previewIcon}
                    style={{
                      backgroundColor: `${selectedColor}20`,
                      color: selectedColor,
                    }}
                  >
                    {getTDesignIcon(selectedIcon, '2em')}
                  </div>
                  <span
                    className={styles.previewName}
                    style={{ color: selectedColor }}
                  >
                    {form.getFieldValue('name') || '组合名称'}
                  </span>
                </div>
              </div>
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
                {isEdit ? '保存修改' : '创建组合'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

/**
 * 获取图标的 emoji 表示（简化版）
 */
function getTDesignIcon(iconName: string, size = '1.5em'): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    folder: <FolderIcon size={size} />,
    'folder-open': <FolderOpenIcon size={size} />,
    team: <UsergroupIcon size={size} />,
    star: <StarIcon size={size} />,
    heart: <HeartIcon size={size} />,
    bulb: <BugIcon size={size} />,
    book: <BookIcon size={size} />,
    thunderbolt: <ThunderIcon size={size} />,
  };
  return iconMap[iconName] || <FolderIcon size={size} />;
}

export default ComboEdit;
