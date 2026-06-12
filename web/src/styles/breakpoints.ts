/**
 * 时光绿径待办 - 响应式断点
 *
 * 基于 Ant Design 断点体系 + 自定义扩展
 */

export const BREAKPOINTS = {
  xs: '480px' as const,
  sm: '576px' as const,
  md: '768px' as const,
  lg: '992px' as const,
  xl: '1200px' as const,
  xxl: '1600px' as const,
} as const;

/** 设备类型枚举 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'large';

/**
 * 根据视口宽度判断设备类型
 *
 * - mobile:   < 768px  (手机)
 * - tablet:   >= 768px && < 992px  (平板/小平板)
 * - desktop:  >= 992px && < 1200px  (桌面/小屏笔记本)
 * - large:    >= 1200px  (大屏桌面)
 */
export function getDeviceType(width: number): DeviceType {
  if (width < 768) return 'mobile';
  if (width < 992) return 'tablet';
  if (width < 1200) return 'desktop';
  return 'large';
}

/** 判断是否为移动端设备 */
export function isMobile(width: number): boolean {
  return width < 768;
}

/** 判断是否为平板设备 */
export function isTablet(width: number): boolean {
  return width >= 768 && width < 992;
}

/** 判断是否为桌面设备 */
export function isDesktop(width: number): boolean {
  return width >= 992;
}

/** 媒体查询工具函数（用于 JS 中动态判断） */
export const mediaQuery = {
  /** 最小宽度查询 */
  min: (breakpoint: keyof typeof BREAKPOINTS): string =>
    `(min-width: ${BREAKPOINTS[breakpoint]})`,

  /** 最大宽度查询 */
  max: (breakpoint: keyof typeof BREAKPOINTS): string =>
    `(max-width: ${BREAKPOINTS[breakpoint]})`,

  /** 区间范围查询 */
  between: (
    minBreakpoint: keyof typeof BREAKPOINTS,
    maxBreakpoint: keyof typeof BREAKPOINTS
  ): string =>
    `(min-width: ${BREAKPOINTS[minBreakpoint]}) and (max-width: ${BREAKPOINTS[maxBreakpoint]})`,
};
