/**
 * TagManage - 标签管理页
 *
 * 功能：
 * - 系统预设标签展示（只读，灰色标识）
 * - 用户自定义标签列表：名称、颜色圆点、操作（编辑/删除）
 * - 新建标签按钮 -> Modal表单（名称Input + 颜色ColorPicker）
 * - 编辑标签 Modal
 * - 删除确认 Popconfirm
 * - 使用 tagStore 的方法
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  Modal,
  Popconfirm,
  Tag,
  Empty,
  message,
  Space,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TagsOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { useTagStore } from '@/stores/tagStore';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import type { Tag as TagType } from '@/types/tag';
import styles from './TagManage.module.css';

/** 预设颜色选项 */
const PRESET_COLORS = [
  '#00b26a', '#1890ff', '#722ed1', '#eb2f96',
  '#fa8c16', '#faad14', '#13c2c2', '#ff4d4f',
  '#2d5a3d', '#1a3a6b', '#531dab', '#a8071a',
];

/**
 * 标签管理页面组件
 *
 * 提供标签的完整管理功能：
 * - 查看系统预设标签和用户自定义标签
 * - 创建、编辑、删除自定义标签
 */
const TagManage: React.FC = () => {
  // Store 数据和方法
  const systemTags = useTagStore((state) => state.systemTags);
  const userTags = useTagStore((state) => state.userTags);
  const isLoading = useTagStore((state) => state.isLoading);
  const createTag = useTagStore((state) => state.createTag);
  const updateTag = useTagStore((state) => state.updateTag);
  const deleteTag = useTagStore((state) => state.deleteTag);

  // 本地状态
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagType | null>(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState(PRESET_COLORS[0]);

  // ========== 事件处理 ==========

  /**
   * 打开新建标签弹窗
   */
  const handleOpenCreate = useCallback(() => {
    setTagName('');
    setTagColor(PRESET_COLORS[0]);
    setCreateModalOpen(true);
  }, []);

  /**
   * 打开编辑标签弹窗
   */
  const handleOpenEdit = useCallback((tag: TagType) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color);
    setEditModalOpen(true);
  }, []);

  /**
   * 关闭新建弹窗
   */
  const handleCloseCreate = useCallback(() => {
    setCreateModalOpen(false);
    setTagName('');
  }, []);

  /**
   * 关闭编辑弹窗
   */
  const handleCloseEdit = useCallback(() => {
    setEditModalOpen(false);
    setEditingTag(null);
    setTagName('');
  }, []);

  /**
   * 创建标签提交
   */
  const handleCreateSubmit = useCallback(async () => {
    if (!tagName.trim()) {
      message.warning('请输入标签名称');
      return;
    }
    try {
      await createTag({
        name: tagName.trim(),
        color: tagColor!,
        icon: 'tag',
      });
      message.success('标签创建成功');
      handleCloseCreate();
    } catch (error) {
      console.error('创建标签失败:', error);
      message.error('创建失败，请重试');
    }
  }, [tagName, tagColor, createTag, handleCloseCreate]);

  /**
   * 编辑标签提交
   */
  const handleEditSubmit = useCallback(async () => {
    if (!editingTag || !tagName.trim()) {
      message.warning('请输入标签名称');
      return;
    }
    try {
      await updateTag(editingTag.id, {
        name: tagName.trim(),
        color: tagColor,
      });
      message.success('标签更新成功');
      handleCloseEdit();
    } catch (error) {
      console.error('更新标签失败:', error);
      message.error('更新失败，请重试');
    }
  }, [editingTag, tagName, tagColor, updateTag, handleCloseEdit]);

  /**
   * 删除标签确认
   */
  const handleDelete = useCallback(
    async (tagId: number) => {
      try {
        await deleteTag(tagId);
        message.success('标签已删除');
      } catch (error) {
        console.error('删除标签失败:', error);
        message.error('删除失败，请重试');
      }
    },
    [deleteTag]
  );

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <TagsOutlined /> 标签管理
        </h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenCreate}
          style={{ backgroundColor: '#00b26a' }}
        >
          新建标签
        </Button>
      </div>

      {isLoading && systemTags.length === 0 && userTags.length === 0 ? (
        <LoadingSkeleton type="todo" count={6} />
      ) : (
        <>
          {/* 系统预设标签 */}
          {systemTags.length > 0 && (
            <Card
              title={
                <span>
                  <LockOutlined style={{ marginRight: 8 }} />
                  系统预设标签 ({systemTags.length})
                </span>
              }
              size="small"
              className={styles.sectionCard}
            >
              <div className={styles.tagList}>
                {systemTags.map((tag) => (
                  <div key={tag.id} className={styles.tagItem}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className={styles.tagName}>{tag.name}</span>
                    <Tag color="default" className={styles.systemBadge}>
                      系统
                    </Tag>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* 用户自定义标签 */}
          <Card
            title={`我的标签 (${userTags.length})`}
            size="small"
            className={styles.sectionCard}
          >
            {userTags.length === 0 ? (
              <Empty description="暂无自定义标签" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className={styles.tagList}>
                {userTags.map((tag) => (
                  <div key={tag.id} className={styles.tagItem}>
                    <span
                      className={styles.colorDot}
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className={styles.tagName}>{tag.name}</span>
                    <Space size="small">
                      <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={() => handleOpenEdit(tag)}
                        className={styles.actionBtn}
                      />
                      <Popconfirm
                        title="确定删除此标签吗？"
                        description="删除后不可恢复"
                        onConfirm={() => handleDelete(tag.id)}
                        okText="确定"
                        cancelText="取消"
                        okButtonProps={{ danger: true }}
                      >
                        <Button
                          type="text"
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          className={styles.actionBtn}
                        />
                      </Popconfirm>
                    </Space>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {/* 新建标签弹窗 */}
      <Modal
        title="新建标签"
        open={createModalOpen}
        onOk={handleCreateSubmit}
        onCancel={handleCloseCreate}
        okText="创建"
        cancelText="取消"
        destroyOnClose
      >
        <div className={styles.formContent}>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>标签名称</label>
            <Input
              placeholder="请输入标签名称"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              maxLength={20}
              showCount
            />
          </div>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>选择颜色</label>
            <div className={styles.colorPicker}>
              {PRESET_COLORS.map((color) => (
                <span
                  key={color}
                  className={`${styles.colorOption} ${tagColor === color ? styles.colorActive : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTagColor(color)}
                />
              ))}
            </div>
          </div>
          <div className={styles.preview}>
            <label className={styles.formLabel}>预览</label>
            <Tag
              style={{
                backgroundColor: `${tagColor}18`,
                borderColor: tagColor,
                color: tagColor,
              }}
            >
              {tagName || '标签名称'}
            </Tag>
          </div>
        </div>
      </Modal>

      {/* 编辑标签弹窗 */}
      <Modal
        title="编辑标签"
        open={editModalOpen}
        onOk={handleEditSubmit}
        onCancel={handleCloseEdit}
        okText="保存"
        cancelText="取消"
        destroyOnClose
      >
        <div className={styles.formContent}>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>标签名称</label>
            <Input
              placeholder="请输入标签名称"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              maxLength={20}
              showCount
            />
          </div>
          <div className={styles.formItem}>
            <label className={styles.formLabel}>选择颜色</label>
            <div className={styles.colorPicker}>
              {PRESET_COLORS.map((color) => (
                <span
                  key={color}
                  className={`${styles.colorOption} ${tagColor === color ? styles.colorActive : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setTagColor(color)}
                />
              ))}
            </div>
          </div>
          <div className={styles.preview}>
            <label className={styles.formLabel}>预览</label>
            <Tag
              style={{
                backgroundColor: `${tagColor}18`,
                borderColor: tagColor,
                color: tagColor,
              }}
            >
              {tagName || '标签名称'}
            </Tag>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TagManage;
