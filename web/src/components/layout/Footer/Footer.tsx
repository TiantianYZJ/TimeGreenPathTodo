/**
 * 页脚组件
 *
 * 简洁的应用页脚，显示版权信息和品牌标语
 * - 桌面端：完整显示
 * - 移动端：可隐藏或精简显示
 */

import React, { memo } from 'react';
import { useDeviceType } from '@/hooks/useMediaQuery';
import styles from './Footer.module.css';

/**
 * 页脚组件
 *
 * 显示应用版权信息和品牌标语，使用 React.memo 优化性能。
 */
const Footer: React.FC = memo(() => {
  const { isMobile } = useDeviceType();

  // 移动端不渲染 Footer（由 TabBar 占据底部空间）
  if (isMobile) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span className={styles.copyright}>&copy; {currentYear} 时光绿径待办</span>
        <span className={styles.divider}> &middot; </span>
        <span className={styles.slogan}>绿色生活从规划开始</span>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

export default Footer;
