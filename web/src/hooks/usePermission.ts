/**
 * 权限检查 Hook
 *
 * 提供基于用户角色和权限的条件渲染能力
 * 用于实现页面级、组件级的访问控制
 */

import { ReactNode, useCallback, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';

/**
 * UsePermission Hook 返回值接口
 */
interface UsePermissionReturn {
  /**
   * 检查当前用户是否拥有指定权限
   * @param permission 权限标识符
   * @returns 是否拥有该权限
   */
  hasPermission: (permission: string) => boolean;
  /**
   * 条件渲染：拥有权限时显示内容，否则显示 fallback
   * @param permission 权限标识符
   * @param children 有权限时显示的内容
   * @param fallback 无权限时显示的内容（默认 null）
   * @returns React 节点或 fallback
   */
  requirePermission: (
    permission: string,
    children: ReactNode,
    fallback?: ReactNode
  ) => ReactNode;
  /**
   * 条件渲染：拥有指定任一角色时显示内容，否则显示 fallback
   * @param roles 允许的角色列表（满足其一即可）
   * @param children 有权限时显示的内容
   * @param fallback 无权限时显示的内容（默认 null）
   * @returns React 节点或 fallback
   */
  requireRole: (
    roles: string | string[],
    children: ReactNode,
    fallback?: ReactNode
  ) => ReactNode;
}

/**
 * 权限检查 Hook
 *
 * 基于当前用户的角色和权限信息提供条件渲染能力：
 * - 检查单个权限
 * - 根据权限条件渲染组件
 * - 根据角色条件渲染组件
 *
 * 此 Hook 主要用于 UI 层面的权限控制，
 * 配合后端的 API 权限验证实现完整的安全体系。
 *
 * @returns 权限控制对象
 *
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { hasPermission, requirePermission, requireRole } = usePermission();
 *
 *   return (
 *     <div>
 *       {/* 根据权限显示/隐藏按钮 * /}
 *       {hasPermission('user:delete') && <DeleteUserButton />}
 *
 *       {/* 条件渲染整个区域 * /}
 *       {requirePermission(
 *         'system:settings',
 *         <SettingsPanel />,
 *         <NoPermissionMessage />
 *       )}
 *
 *       {/* 角色检查（支持多角色）* /}
 *       {requireRole(
 *         ['admin', 'super_admin'],
 *         <AdvancedFeatures />
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermission(): UsePermissionReturn {
  // 从 authStore 获取用户信息和权限检查方法
  const user = useAuthStore((state) => state.user);
  const storeHasRole = useAuthStore((state) => state.hasRole);

  /**
   * 检查是否拥有指定权限
   *
   * 支持两种权限模式：
   * 1. 基于 permissions 数组：检查 user.permissions 是否包含指定权限
   * 2. 基于角色推断：如果用户没有 permissions 字段，则回退到角色检查
   *
   * @param permission 权限标识符
   * @returns 是否拥有该权限
   */
  const hasPermission = useCallback(
    (permission: string): boolean => {
      // 未登录用户没有任何权限
      if (!user) return false;

      // 如果用户有 permissions 字段，直接检查
      if (user.permissions && Array.isArray(user.permissions)) {
        return user.permissions.includes(permission);
      }

      // 否则回退到基于角色的简单权限推断
      // 这里可以根据业务需求扩展更复杂的角色-权限映射逻辑
      const role = user.role;

      // 超管拥有所有权限
      if (role === 'owner' || role === 'super_admin') {
        return true;
      }

      // 管理员拥有部分管理权限
      if (role === 'admin') {
        // 管理员不能执行超管专属操作
        const superAdminPermissions = [
          'system:delete',
          'user:delete',
          'role:manage',
        ];
        return !superAdminPermissions.includes(permission);
      }

      // 普通成员只能查看和编辑自己的数据
      if (role === 'member') {
        const memberPermissions = [
          'todo:create',
          'todo:read',
          'todo:update',
          'todo:complete',
        ];
        return memberPermissions.includes(permission);
      }

      // 默认无权限
      return false;
    },
    [user]
  );

  /**
   * 权限条件渲染
   *
   * 拥有权限时返回 children，否则返回 fallback
   *
   * @param permission 权限标识符
   * @param children 有权限时显示的 React 节点
   * @param fallback 无权限时的备选内容（默认不渲染任何内容）
   * @returns React 节点
   */
  const requirePermission = useCallback(
    (permission: string, children: ReactNode, fallback: ReactNode = null): ReactNode => {
      return hasPermission(permission) ? children : fallback;
    },
    [hasPermission]
  );

  /**
   * 角色条件渲染
   *
   * 用户拥有指定任一角色时返回 children，否则返回 fallback
   *
   * @param roles 允许的角色（字符串或数组，数组表示满足其一即可）
   * @param children 有权限时显示的 React 节点
   * @param fallback 无权限时的备选内容（默认不渲染任何内容）
   * @returns React 节点
   */
  const requireRole = useCallback(
    (roles: string | string[], children: ReactNode, fallback: ReactNode = null): ReactNode => {
      // 统一为数组格式
      const roleArray = Array.isArray(roles) ? roles : [roles];

      // 检查用户是否拥有其中任一角色
      const hasRequiredRole = roleArray.some((role) => storeHasRole(role));

      return hasRequiredRole ? children : fallback;
    },
    [storeHasRole]
  );

  // 使用 useMemo 缓存返回值，避免不必要的重新渲染
  return useMemo<UsePermissionReturn>(
    () => ({
      hasPermission,
      requirePermission,
      requireRole,
    }),
    [hasPermission, requirePermission, requireRole]
  );
}
