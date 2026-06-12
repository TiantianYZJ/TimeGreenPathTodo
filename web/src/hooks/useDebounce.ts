/**
 * 防抖和节流 Hook
 *
 * 提供值级别的防抖（debounce）和节流（throttle）功能
 * 用于优化频繁变化的值（如搜索输入、窗口大小等）
 */

import { useState, useEffect } from 'react';

/**
 * 防抖 Hook
 *
 * 延迟更新值，直到指定时间间隔内没有新的变化
 * 适用于搜索框输入、窗口 resize 等场景
 *
 * @param value - 需要防抖的值
 * @param delay - 防抖延迟时间（毫秒），默认 300ms
 * @returns 防抖后的值
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchText, setSearchText] = useState('');
 *   const debouncedSearch = useDebounce(searchText, 500);
 *
 *   useEffect(() => {
 *     // 只会在用户停止输入 500ms 后执行
 *     if (debouncedSearch) {
 *       searchAPI(debouncedSearch);
 *     }
 *   }, [debouncedSearch]);
 *
 *   return (
 *     <input
 *       value={searchText}
 *       onChange={(e) => setSearchText(e.target.value)}
 *       placeholder="搜索..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  // 防抖后的值状态
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // 设置定时器，在延迟后更新值
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // 如果在延迟期间 value 发生变化，清除上一次的定时器
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]); // 当 value 或 delay 变化时重新设置定时器

  return debouncedValue;
}

/**
 * 节流 Hook
 *
 * 在指定时间间隔内只更新一次值
 * 适用于滚动事件、鼠标移动等高频触发场景
 *
 * @param value - 需要节流的值
 * @param delay - 节流间隔时间（毫秒），默认 300ms
 * @returns 节流后的值
 *
 * @example
 * ```tsx
 * function ScrollPosition() {
 *   const [scrollY, setScrollY] = useState(0);
 *   const throttledScroll = useThrottle(scrollY, 100);
 *
 *   useEffect(() => {
 *     const handleScroll = () => setScrollY(window.scrollY);
 *     window.addEventListener('scroll', handleScroll);
 *     return () => window.removeEventListener('scroll', handleScroll);
 *   }, []);
 *
 *   return <div>当前滚动位置: {throttledScroll}</div>;
 * }
 * ```
 */
export function useThrottle<T>(value: T, delay: number = 300): T {
  // 节流后的值状态
  const [throttledValue, setThrottledValue] = useState<T>(value);
  // 上次更新的时间戳
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated;

    // 如果距离上次更新已经超过节流间隔，立即更新
    if (timeSinceLastUpdate >= delay) {
      setThrottledValue(value);
      setLastUpdated(now);
    } else {
      // 否则设置一个定时器，在剩余时间后更新
      const timer = setTimeout(() => {
        setThrottledValue(value);
        setLastUpdated(Date.now());
      }, delay - timeSinceLastUpdate);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [value, delay, lastUpdated]);

  return throttledValue;
}
