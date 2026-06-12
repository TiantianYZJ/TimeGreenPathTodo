/**
 * TagBadge - 标签徽章组件
 *
 * 功能：
 * - 根据 tagId 从 TAG_COLORS 获取颜色
 * - 圆角胶囊样式
 * - 可选显示标签名称
 * - 如果 tagId 不在预设范围内，使用默认颜色
 */

import React, { memo, useMemo } from 'react';
import { Tooltip } from 'antd';
import { getTagColorById } from '@/styles/themes/tagColors';
import { useTagStore } from '@/stores/tagStore';
import styles from './TagBadge.module.css';

export interface TagBadgeProps {
  /** 标签 ID */
  tagId: number;
  /** 是否显示标签名称 */
  showName?: boolean;
  /** 自定义尺寸 */
  size?: 'small' | 'default' | 'large';
}

/**
 * 标签徽章组件
 *
 * 根据 tagId 自动获取预设颜色配置，渲染为圆角胶囊样式的标签徽章。
 * 支持可选的名称展示和多种尺寸。
 */
const TagBadge: React.FC<TagBadgeProps> = memo(({ tagId, showName = true, size = 'default' }) => {
  const getTagNameById = useTagStore((state) => state.getTagNameById);

  // 获取颜色配置
  const tagColor = useMemo(() => getTagColorById(tagId), [tagId]);

  // 获取标签名称
  const tagName = useMemo(() => getTagNameById(tagId), [getTagNameById, tagId]);

  const badgeContent = showName ? (tagName || `标签${tagId}`) : null;

  const badge = (
    <span
      className={`${styles.badge} ${styles[size]}`}
      style={
        {
          '--tag-color': tagColor.color,
          '--tag-bg': tagColor.bgColor,
          '--tag-border': tagColor.borderColor,
          'color': tagColor.color,
        } as React.CSSProperties
      }
      title={!showName ? tagName || undefined : undefined}
    >
      {badgeContent}
    </span>
  );

  // 当不显示名称时，使用 Tooltip 展示完整信息
  if (!showName && tagName) {
    return <Tooltip title={tagName}>{badge}</Tooltip>;
  }

  return badge;
});

TagBadge.displayName = 'TagBadge';

export default TagBadge;
