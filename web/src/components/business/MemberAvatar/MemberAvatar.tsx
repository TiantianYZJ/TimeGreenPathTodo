/**
 * MemberAvatar - 成员头像组件
 *
 * 功能：
 * - 显示用户头像(avatar URL)或首字 fallback(nickname第一个字)
 * - 头像尺寸可配置（默认40px）
 * - 可选显示角色标识(owner/admin/member)的小图标
 * - Tooltip 显示完整昵称
 * - 在线/离线状态指示点
 */

import React, { memo, useMemo } from 'react';
import { Avatar, Badge, Tooltip } from 'antd';
import {
  CrownOutlined,
  ToolOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './MemberAvatar.module.css';

export interface MemberAvatarProps {
  /** 用户信息 */
  user: {
    nickname: string;
    avatar?: string;
  };
  /** 头像尺寸（px），默认 40 */
  size?: number;
  /** 角色标识 */
  role?: 'owner' | 'admin' | 'member';
  /** 是否在线 */
  isOnline?: boolean;
  /** 是否显示状态指示点 */
  showStatus?: boolean;
}

/** 角色到图标的映射 */
const ROLE_ICON_MAP: Record<string, React.ReactNode> = {
  owner: <CrownOutlined />,
  admin: <ToolOutlined />,
  member: <UserOutlined />,
};

/** 角色到颜色/提示的映射 */
const ROLE_CONFIG: Record<string, { color: string; label: string }> = {
  owner: { color: '#faad14', label: '超管' },
  admin: { color: '#1890ff', label: '管理' },
  member: { color: '#8c8c8c', label: '成员' },
};

/**
 * 成员头像组件
 *
 * 展示用户头像，支持首字 fallback、角色标识、在线状态等功能。
 * 使用 React.memo 进行性能优化。
 */
const MemberAvatar: React.FC<MemberAvatarProps> = memo(({
  user,
  size = 40,
  role,
  isOnline = false,
  showStatus = false,
}) => {
  // 获取昵称首字作为 fallback
  const fallbackChar = useMemo(() => {
    if (!user.nickname) return '?';
    // 尝试取第一个可见字符（支持中文）
    const firstChar = user.nickname.trim().charAt(0);
    return firstChar || '?';
  }, [user.nickname]);

  // 角色图标与配置
  const roleConfig = useMemo(() => {
    if (!role) return null;
    return ROLE_CONFIG[role] || ROLE_CONFIG.member;
  }, [role]);

  const roleIcon = useMemo(() => {
    if (!role) return null;
    return ROLE_ICON_MAP[role];
  }, [role]);

  // 头像内容
  const avatarContent = (
    <div className={styles.avatarWrapper} style={{ width: size, height: size }}>
      <Avatar
        size={size}
        src={user.avatar}
        className={styles.avatar}
      >
        {!user.avatar ? fallbackChar : undefined}
      </Avatar>

      {/* 角角标识 */}
      {role && roleIcon && (
        <span
          className={styles.roleBadge}
          style={{ backgroundColor: roleConfig?.color }}
          title={roleConfig?.label}
        >
          {roleIcon}
        </span>
      )}

      {/* 在线状态指示点 */}
      {showStatus && (
        <span
          className={`${styles.statusDot} ${isOnline ? styles.online : styles.offline}`}
        />
      )}
    </div>
  );

  // 外层包裹 Tooltip 显示完整昵称
  return (
    <Tooltip title={user.nickname} placement="top">
      {avatarContent}
    </Tooltip>
  );
});

MemberAvatar.displayName = 'MemberAvatar';

export default MemberAvatar;
