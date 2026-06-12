/**
 * ComboCard - 组合卡片组件
 *
 * 功能：
 * - 显示组合图标、名称（使用 TDesign Icon）
 * - 组合颜色条作为左侧装饰边框
 * - 显示待办数量 badge
 * - 右侧操作：编辑、删除
 * - hover 效果
 */

import React, { memo, useMemo } from 'react';
import { Badge, Dropdown, Tooltip, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  FolderIcon,
  FolderOpenIcon,
  UsergroupIcon,
  StarIcon,
  BugIcon,
  BookIcon,
  ThunderIcon,
  HeartIcon,
} from 'tdesign-icons-react';
import type { Combo } from '@/types/combo';
import styles from './ComboCard.module.css';

export interface ComboCardProps {
  /** 组合数据 */
  combo: Combo;
  /** 点击卡片回调 */
  onClick?: () => void;
  /** 编辑回调 */
  onEdit?: () => void;
  /** 删除回调 */
  onDelete?: () => void;
}

/** 图标名称到 TDesign Icon 组件的映射 */
const ICON_MAP: Record<string, React.ReactNode> = {
  folder: <FolderIcon size="1em" />,
  'folder-open': <FolderOpenIcon size="1em" />,
  team: <UsergroupIcon size="1em" />,
  star: <StarIcon size="1em" />,
  bulb: <BugIcon size="1em" />,
  book: <BookIcon size="1em" />,
  lightning: <ThunderIcon size="1em" />,
  heart: <HeartIcon size="1em" />,
};

/**
 * 获取图标组件（fallback 到默认文件夹图标）
 */
function getComboIcon(iconName: string): React.ReactNode {
  return ICON_MAP[iconName] || <FolderIcon size="1em" />;
}

/**
 * 组合卡片组件
 *
 * 展示组合信息，支持点击进入详情和右侧操作菜单。
 * 使用 React.memo 进行性能优化。
 */
const ComboCard: React.FC<ComboCardProps> = memo(({ combo, onClick, onEdit, onDelete }) => {
  // 是否为共享组合
  const isShared = combo.is_shared === 1;

  // 获取 TDesign 图标组件
  const iconNode = useMemo(() => getComboIcon(combo.icon), [combo.icon]);

  // 操作菜单项
  const actionItems: MenuProps['items'] = useMemo(
    () => [
      ...(onEdit
        ? [
            {
              key: 'edit',
              icon: <EditOutlined />,
              label: '编辑',
              onClick: onEdit,
            },
          ]
        : []),
      ...(onDelete
        ? [
            {
              key: 'delete',
              icon: <DeleteOutlined />,
              label: '删除',
              danger: true,
              onClick: onDelete,
            },
          ]
        : []),
    ],
    [onEdit, onDelete]
  );

  return (
    <div
      className={styles.card}
      onClick={onClick}
      style={{
        '--combo-color': combo.color || '#00b26a',
      } as React.CSSProperties}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {/* 左侧颜色装饰条 */}
      <div className={styles.colorBar} style={{ backgroundColor: combo.color }} />

      {/* 主内容区 */}
      <div className={styles.mainContent}>
        {/* 图标 + 名称 + 共享标识 */}
        <div className={styles.header}>
          <Avatar
            size={36}
            icon={iconNode}
            style={{
              backgroundColor: `${combo.color}18`,
              color: combo.color,
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            className={styles.comboIcon}
          />
          <div className={styles.nameSection}>
            <span className={styles.comboName}>{combo.name}</span>
            {isShared && (
              <Tooltip title="共享组合">
                <TeamOutlined className={styles.sharedBadge} />
              </Tooltip>
            )}
          </div>
        </div>

        {/* 底部：待办数量 + 操作按钮 */}
        <div className={styles.footer}>
          <Badge
            count={combo.todo_count ?? 0}
            showZero
            size="small"
            style={{
              backgroundColor: combo.color || '#00b26a',
            }}
          />
          <span className={styles.todoCountLabel}>个待办</span>

          {(onEdit || onDelete) && actionItems.length > 0 && (
            <Dropdown
              menu={{ items: actionItems }}
              trigger={['click']}
              placement="bottomRight"
            >
              <span
                className={styles.actionsTrigger}
                onClick={(e) => e.stopPropagation()}
              >
                ...
              </span>
            </Dropdown>
          )}
        </div>
      </div>
    </div>
  );
});

ComboCard.displayName = 'ComboCard';

export default ComboCard;
