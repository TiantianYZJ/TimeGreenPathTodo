/**
 * 应用主布局组件
 *
 * 根据设备类型自动切换布局模式：
 * - 移动端（< 992px）：渲染 MobileLayout（顶部 Header + 内容区 + 底部 TabBar）
 * - 桌面端（>= 992px）：渲染 DesktopLayout（Header + 侧边栏 + 内容区 + Footer）
 *
 * 此组件是应用路由层面的根布局包装器，应在 Router 内部使用。
 *
 * @example
 * ```tsx
 * <BrowserRouter>
 *   <AppLayout>
 *     <Routes>
 *       <Route path="/" element={<HomePage />} />
 *       ...
 *     </Routes>
 *   </AppLayout>
 * </BrowserRouter>
 * ```
 */

import React, { memo, type ReactNode, useEffect } from 'react';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { useUIStore } from '@/stores/uiStore';
import DesktopLayout from './DesktopLayout';
import MobileLayout from './MobileLayout';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  /** 子组件/页面内容 */
  children: ReactNode;
}

/**
 * 应用主布局组件
 *
 * 核心职责：
 * 1. 监听设备类型变化，同步到 uiStore
 * 2. 根据设备类型渲染对应的布局组件
 * 3. 使用 React.memo 避免不必要的重渲染
 */
const AppLayout: React.FC<AppLayoutProps> = memo(({ children }) => {
  const { isMobile, isDesktop } = useDeviceType();
  const setIsMobile = useUIStore((state) => state.setIsMobile);

  // 同步设备类型到全局状态
  useEffect(() => {
    setIsMobile(isMobile);
  }, [isMobile, setIsMobile]);

  return (
    <div className={styles.appLayout}>
      {isDesktop ? (
        <DesktopLayout>{children}</DesktopLayout>
      ) : (
        <MobileLayout>{children}</MobileLayout>
      )}
    </div>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;
