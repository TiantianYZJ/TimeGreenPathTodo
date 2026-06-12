/**
 * 移动端布局组件
 *
 * 移动端（< 992px）的垂直布局：
 * - 顶部：固定 Header (56px)
 * - 中间：主内容区域 Content（可滚动）
 * - 底部：固定 TabBar (56px + safe-area-inset-bottom)
 *
 * 布局结构：
 * ┌─────────────────────┐
 * │  Header (固定顶部)   │
 * ├─────────────────────┤
 * │                     │
 * │  Main Content       │
 * │  (children)         │
 * │                     │
 * ├─────────────────────┤
 * │ TabBar (固定底部)    │
 * │ 首页|日历|统计|我的  │
 * └─────────────────────┘
 */

import React, { memo, type ReactNode } from 'react';
import { Layout } from 'antd';
import Header from '../Header/Header';
import MobileTabBar from '../TabBar/MobileTabBar';
import styles from './MobileLayout.module.css';

const { Content } = Layout;

interface MobileLayoutProps {
  /** 子组件/页面内容 */
  children: ReactNode;
}

/**
 * 移动端布局组件
 *
 * 使用 antd Layout 组件构建移动端垂直布局，
 * 包含顶部导航、可滚动内容区和底部标签栏。
 */
const MobileLayout: React.FC<MobileLayoutProps> = memo(({ children }) => {
  return (
    <Layout className={styles.layout}>
      {/* 固定顶部 Header */}
      <Header />

      {/* 可滚动内容区域 */}
      <Content className={styles.content}>
        <div className={styles.contentInner}>{children}</div>
      </Content>

      {/* 固定底部 TabBar */}
      <MobileTabBar />
    </Layout>
  );
});

MobileLayout.displayName = 'MobileLayout';

export default MobileLayout;
