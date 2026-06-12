/**
 * 媒体查询 Hook
 *
 * 监听 CSS 媒体查询变化，返回是否匹配当前查询条件
 * 支持响应式布局中的条件渲染和样式切换
 */

import { useState, useEffect } from 'react';
import { BREAKPOINTS, getDeviceType, DeviceType } from '@/styles/breakpoints';

/**
 * 监听指定的 CSS 媒体查询
 *
 * @param query - CSS 媒体查询字符串，如 '(max-width: 768px)'
 * @returns 是否匹配当前媒体查询
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * if (isMobile) {
 *   return <MobileLayout />;
 * }
 * return <DesktopLayout />;
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    // 初始化时检查是否在浏览器环境
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQueryList = window.matchMedia(query);

    // 设置初始值
    setMatches(mediaQueryList.matches);

    // 定义事件处理器
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // 监听媒体查询变化
    // 使用 addEventListener 以支持现代浏览器
    mediaQueryList.addEventListener('change', handler);

    // 清理函数：移除事件监听
    return () => {
      mediaQueryList.removeEventListener('change', handler);
    };
  }, [query]); // 当 query 变化时重新设置监听

  return matches;
}

/**
 * 设备类型信息接口
 */
interface DeviceTypeInfo {
  /** 是否为移动设备（宽度 < 768px） */
  isMobile: boolean;
  /** 是否为平板设备（768px <= 宽度 < 992px） */
  isTablet: boolean;
  /** 是否为桌面设备（宽度 >= 992px） */
  isDesktop: boolean;
  /** 当前设备类型 */
  deviceType: DeviceType;
}

/**
 * 获取当前设备类型信息
 *
 * 基于视口宽度判断当前设备类型：
 * - mobile:   < 768px  (手机)
 * - tablet:   >= 768px && < 992px  (平板)
 * - desktop:  >= 992px  (桌面)
 *
 * @returns 设备类型信息对象
 *
 * @example
 * ```tsx
 * const { isMobile, isDesktop, deviceType } = useDeviceType();
 *
 * return (
 *   <div className={deviceType}>
 *     {isMobile ? '移动端布局' : '桌面端布局'}
 *   </div>
 * );
 * ```
 */
export function useDeviceType(): DeviceTypeInfo {
  // 使用三个独立的媒体查询来判断设备类型
  const isMobile = useMediaQuery(`(max-width: ${BREAKPOINTS.md})`);
  const isTablet = useMediaQuery(
    `(min-width: ${BREAKPOINTS.md}) and (max-width: ${BREAKPOINTS.lg})`
  );
  const isDesktop = useMediaQuery(`(min-width: ${BREAKPOINTS.lg})`);

  // 根据匹配结果确定设备类型
  const deviceType: DeviceType = isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop';

  return {
    isMobile,
    isTablet,
    isDesktop,
    deviceType,
  };
}
