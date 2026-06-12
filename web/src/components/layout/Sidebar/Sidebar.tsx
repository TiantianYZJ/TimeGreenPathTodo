/**
 * 侧边栏菜单组件
 *
 * 桌面端左侧导航菜单，使用 antd Menu 组件：
 * - 支持多级子菜单展开/收起
 * - 当前选中项高亮（品牌绿色背景）
 * - 折叠时只显示图标
 * - 菜单项配置包含：首页、日历、统计、组合、协作、工具集、数据管理、标签管理
 */

import React, { memo, useMemo } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FolderOutlined,
  TeamOutlined,
  AppstoreOutlined,
  CloudServerOutlined,
  TagsOutlined,
  KeyOutlined,
  CoffeeOutlined,
  BulbOutlined,
  StarOutlined,
  ImportOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Sidebar.module.css';

/** 菜单项类型定义 */
interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

/**
 * 菜单配置
 *
 * 定义应用的所有导航菜单项及其层级结构
 */
const menuItems: MenuItem[] = [
  {
    key: 'home',
    icon: <HomeOutlined />,
    label: '首页',
    path: '/',
  },
  {
    key: 'calendar',
    icon: <CalendarOutlined />,
    label: '日历',
    path: '/calendar',
  },
  {
    key: 'stats',
    icon: <BarChartOutlined />,
    label: '统计',
    path: '/stats',
  },
  {
    key: 'combos',
    icon: <FolderOutlined />,
    label: '组合',
    path: '/combos',
  },
  {
    key: 'collab',
    icon: <TeamOutlined />,
    label: '协作',
    path: '/collab/join',
  },
  {
    key: 'tools',
    icon: <AppstoreOutlined />,
    label: '工具集',
    children: [
      {
        key: 'password-generator',
        icon: <KeyOutlined />,
        label: '密码生成器',
        path: '/tools/password-generator',
      },
      {
        key: 'eating',
        icon: <CoffeeOutlined />,
        label: '今天吃什么',
        path: '/tools/eating',
      },
      {
        key: 'motivation',
        icon: <BulbOutlined />,
        label: '每日激励',
        path: '/tools/motivation',
      },
      {
        key: 'star',
        icon: <StarOutlined />,
        label: '收藏夹',
        path: '/tools/star',
      },
    ],
  },
  {
    key: 'data',
    icon: <CloudServerOutlined />,
    label: '数据管理',
    children: [
      {
        key: 'data-manage',
        icon: <ImportOutlined />,
        label: '导入导出',
        path: '/data/manage',
      },
      {
        key: 'trash',
        icon: <DeleteOutlined />,
        label: '回收站',
        path: '/data/trash',
      },
    ],
  },
  {
    key: 'tags',
    icon: <TagsOutlined />,
    label: '标签管理',
    path: '/tags',
  },
];

interface SidebarProps {
  /** 侧边栏是否折叠 */
  collapsed: boolean;
}

/**
 * 将自定义菜单配置转换为 antd Menu 所需的格式
 */
function convertToAntdMenuItems(items: MenuItem[]): MenuProps['items'] {
  return items.map((item) => {
    if (item.children && item.children.length > 0) {
      return {
        key: item.key,
        icon: item.icon,
        label: item.label,
        children: convertToAntdMenuItems(item.children),
      };
    }
    return {
      key: item.key,
      icon: item.icon,
      label: item.label,
    };
  });
}

/**
 * 根据路径查找对应的菜单 key
 *
 * @param pathname 当前路由路径
 * @param items 菜单项配置数组
 * @returns 匹配的菜单 key，未匹配返回 undefined
 */
function findMenuKeyByPath(pathname: string, items: MenuItem[]): string | undefined {
  for (const item of items) {
    if (item.path === pathname) {
      return item.key;
    }
    if (item.children) {
      const childKey = findMenuKeyByPath(pathname, item.children);
      if (childKey) {
        return childKey;
      }
    }
  }
  return undefined;
}

/**
 * 获取所有菜单项的路径映射（用于精确匹配）
 */
function getPathKeyMap(items: MenuItem[]): Record<string, string> {
  const map: Record<string, string> = {};

  function traverse(itemsList: MenuItem[]) {
    for (const item of itemsList) {
      if (item.path) {
        map[item.path] = item.key;
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  }

  traverse(items);
  return map;
}

/**
 * 侧边栏菜单组件
 *
 * 渲染桌面端左侧导航菜单，支持折叠/展开模式切换。
 * 使用 React.memo 优化性能。
 */
const Sidebar: React.FC<SidebarProps> = memo(({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 缓存转换后的菜单项
  const antdMenuItems = useMemo(() => convertToAntdMenuItems(menuItems), []);

  // 缓存路径-key 映射
  const pathKeyMap = useMemo(() => getPathKeyMap(menuItems), []);

  // 根据当前路径确定选中的菜单项
  const selectedKeys = useMemo(() => {
    const pathname = location.pathname;
    // 精确匹配
    if (pathKeyMap[pathname]) {
      return [pathKeyMap[pathname]];
    }
    // 前缀匹配（用于子页面）
    const matchedKey = findMenuKeyByPath(pathname, menuItems);
    return matchedKey ? [matchedKey] : ['home'];
  }, [location.pathname, pathKeyMap]);

  // 根据 selectedKeys 确定默认展开的子菜单
  const defaultOpenKeys = useMemo(() => {
    const openKeys: string[] = [];
    for (const item of menuItems) {
      if (item.children) {
        const hasSelectedChild = item.children.some(
          (child) => selectedKeys.includes(child.key)
        );
        if (hasSelectedChild) {
          openKeys.push(item.key);
        }
      }
    }
    return openKeys;
  }, [selectedKeys]);

  /**
   * 处理菜单点击事件
   */
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    function findPathByKey(k: string, items: MenuItem[]): string | undefined {
      for (const item of items) {
        if (item.key === k && item.path) {
          return item.path;
        }
        if (item.children) {
          const childPath = findPathByKey(k, item.children);
          if (childPath) return childPath;
        }
      }
      return undefined;
    }

    const path = findPathByKey(key, menuItems);
    if (path) {
      navigate(path);
    }
  };

  return (
    <div className={styles.sidebarContainer}>
      <Menu
        mode="inline"
        theme="light"
        inlineCollapsed={collapsed}
        selectedKeys={selectedKeys}
        defaultOpenKeys={defaultOpenKeys}
        items={antdMenuItems}
        onClick={handleMenuClick}
        className={styles.menu}
      />
    </div>
  );
});

Sidebar.displayName = 'Sidebar';

export default Sidebar;
export type { MenuItem };
export { menuItems };
