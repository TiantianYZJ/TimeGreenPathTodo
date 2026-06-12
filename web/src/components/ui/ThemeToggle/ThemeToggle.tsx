/**
 * 主题切换按钮组件
 *
 * 提供亮色/暗色主题切换功能：
 * - 亮色模式显示 MoonOutlined 图标（点击切换到暗色）
 * - 暗色模式显示 SunOutlined 图标（点击切换到亮色）
 * - 支持 Tooltip 提示
 * - 图标 hover 时有旋转动画效果
 */

import React, { memo } from 'react';
import { Tooltip } from 'antd';
import { MoonOutlined, SunOutlined } from '@ant-design/icons';
import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeToggle.module.css';

/**
 * 主题切换按钮
 *
 * 根据当前主题显示对应的图标，点击后切换主题模式。
 * 使用 React.memo 优化性能，避免不必要的重渲染。
 */
const ThemeToggle: React.FC = memo(() => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <Tooltip title={isDark ? '切换到亮色模式' : '切换到暗色模式'}>
      <button
        className={styles.toggleButton}
        onClick={toggleTheme}
        aria-label={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        type="button"
      >
        <span className={styles.iconWrapper}>
          {/* 太阳图标 - 暗色模式下显示 */}
          <SunOutlined
            className={`${styles.icon} ${styles.sunIcon} ${!isDark ? styles.iconHidden : ''}`}
          />
          {/* 月亮图标 - 亮色模式下显示 */}
          <MoonOutlined
            className={`${styles.icon} ${styles.moonIcon} ${isDark ? styles.iconHidden : ''}`}
          />
        </span>
      </button>
    </Tooltip>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

export default ThemeToggle;
