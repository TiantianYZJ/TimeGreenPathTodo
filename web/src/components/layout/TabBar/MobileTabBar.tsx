/**
 * 移动端底部标签栏组件
 *
 * 类似微信小程序 tabBar 的底部导航栏：
 * - 固定在底部，高度 56px + safe-area-inset-bottom
 * - 4 个 Tab：首页、日历、统计、我的
 * - 使用 NavLink 实现路由切换和高亮
 * - 高亮 Tab 使用品牌色
 */

import React, { memo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import styles from './MobileTabBar.module.css';

/** Tab 配置项 */
interface TabConfig {
  /** 路由路径 */
  path: string;
  /** 图标组件 */
  icon: React.ReactNode;
  /** 显示文本 */
  label: string;
}

/**
 * 底部标签栏配置
 */
const tabs: TabConfig[] = [
  {
    path: '/',
    icon: <HomeOutlined />,
    label: '首页',
  },
  {
    path: '/calendar',
    icon: <CalendarOutlined />,
    label: '日历',
  },
  {
    path: '/stats',
    icon: <BarChartOutlined />,
    label: '统计',
  },
  {
    path: '/user-center',
    icon: <UserOutlined />,
    label: '我的',
  },
];

/**
 * 移动端底部标签栏组件
 *
 * 渲染固定底部的导航标签栏，支持安全区域适配。
 * 使用 React.memo 优化性能。
 */
const MobileTabBar: React.FC = memo(() => {
  const location = useLocation();

  /**
   * 判断路径是否匹配当前 Tab
   * 支持精确匹配和前缀匹配
   */
  const isActiveTab = (tabPath: string): boolean => {
    if (tabPath === '/') {
      // 首页特殊处理：只在根路径时激活
      return location.pathname === '/';
    }
    // 其他 tab 使用前缀匹配
    return location.pathname.startsWith(tabPath);
  };

  return (
    <nav className={styles.tabBar} role="navigation" aria-label="主导航">
      <div className={styles.tabList}>
        {tabs.map((tab) => {
          const active = isActiveTab(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`${styles.tabItem} ${active ? styles.active : ''}`}
              end={tab.path === '/'}
              aria-current={active ? 'page' : undefined}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
});

MobileTabBar.displayName = 'MobileTabBar';

export default MobileTabBar;
