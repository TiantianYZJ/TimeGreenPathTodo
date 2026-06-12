/**
 * EmptyState - 空状态占位组件
 *
 * 功能：
 * - 品牌风格的空状态展示
 * - 默认品牌相关图标
 * - 描述文字
 * - 可选的操作按钮
 * - 淡入动画
 */

import React, { memo } from 'react';
import { FileTextOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  /** 描述文字 */
  description?: string;
  /** 自定义图标 */
  icon?: ReactNode;
  /** 操作按钮区域 */
  action?: ReactNode;
  /** 最小高度 */
  minHeight?: number | string;
}

/** 品牌默认空状态图标 */
const DefaultIcon = () => (
  <div className={styles.defaultIconWrapper}>
    <FileTextOutlined className={styles.defaultIcon} />
    <div className={styles.iconDecor}>
      <span className={`${styles.decorCircle} ${styles.decorCircle1}`} />
      <span className={`${styles.decorCircle} ${styles.decorCircle2}`} />
      <span className={`${styles.decorCircle} ${styles.decorCircle3}`} />
    </div>
  </div>
);

/**
 * 空状态占位组件
 *
 * 用于列表、卡片等区域的空数据占位展示。
 * 支持自定义图标、描述文字和操作按钮。
 */
const EmptyState: React.FC<EmptyStateProps> = memo(({
  description = '暂无数据',
  icon,
  action,
  minHeight = 200,
}) => {
  return (
    <div
      className={styles.container}
      style={{ minHeight }}
    >
      <div className={styles.content}>
        {/* 图标区域 */}
        <div className={styles.iconArea}>
          {icon || <DefaultIcon />}
        </div>

        {/* 描述文字 */}
        <p className={styles.description}>{description}</p>

        {/* 操作按钮 */}
        {action && <div className={styles.actionArea}>{action}</div>}
      </div>
    </div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState;
