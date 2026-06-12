/**
 * 桌面端布局组件
 *
 * 桌面端（>= 992px）的经典三段式布局：
 * - 顶部：固定 Header (64px)
 * - 左侧：可折叠 Sidebar (240px / 80px)
 * - 右侧：主内容区域 Content
 * - 底部：Footer
 *
 * 布局结构：
 * ┌──────────────────────────────────────────┐
 * │  Header (固定顶部，高度64px)              │
 * ├──────────┬───────────────────────────────┤
 * │          │                               │
 * │ Sidebar  │     Main Content (children)   │
 * │ (240px)  │                               │
 * │          │                               │
 * ├──────────┴───────────────────────────────┤
 * │  Footer                                │
 * └──────────────────────────────────────────┘
 */

import React, { memo, type ReactNode } from 'react';
import { Layout } from 'antd';
import { useUIStore } from '@/stores/uiStore';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import styles from './DesktopLayout.module.css';

const { Sider, Content } = Layout;

interface DesktopLayoutProps {
  /** 子组件/页面内容 */
  children: ReactNode;
}

/**
 * 桌面端布局组件
 *
 * 使用 antd Layout 组件构建经典的侧边栏+内容区布局，
 * 支持侧边栏折叠/展开切换。
 */
const DesktopLayout: React.FC<DesktopLayoutProps> = memo(({ children }) => {
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed);

  return (
    <Layout className={styles.layout}>
      {/* 固定顶部 Header */}
      <Header />

      <Layout className={styles.body}>
        {/* 可折叠侧边栏 */}
        <Sider
          collapsible
          collapsed={sidebarCollapsed}
          width={240}
          collapsedWidth={72}
          trigger={null}
          className={styles.sider}
          theme="light"
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </Sider>

        {/* 主内容区域 */}
        <Content className={styles.content}>
          <div className={styles.contentInner}>{children}</div>
        </Content>
      </Layout>

      {/* 页脚 */}
      <Footer />
    </Layout>
  );
});

DesktopLayout.displayName = 'DesktopLayout';

export default DesktopLayout;
