import { Layout, Menu, Button } from 'antd';
import {
  HomeOutlined,
  CalendarOutlined,
  BarChartOutlined,
  FolderOutlined,
  TeamOutlined,
  TagOutlined,
  DatabaseOutlined,
  ToolOutlined,
  BellOutlined,
  FileTextOutlined,
  SafetyOutlined,
  LeftOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUIStore, useAuthStore } from '../../stores';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, setSidebarCollapsed, isMobile, themeMode } = useUIStore();
  const { user } = useAuthStore();

  const menuItems: MenuProps['items'] = [
    { key: '/', icon: <HomeOutlined />, label: '待办首页' },
    { key: '/calendar', icon: <CalendarOutlined />, label: '日历视图' },
    { key: '/stats', icon: <BarChartOutlined />, label: '数据统计' },
    { key: '/combos', icon: <FolderOutlined />, label: '我的组合' },
    { key: '/collab/join', icon: <TeamOutlined />, label: '加入协作' },
    { key: '/tags', icon: <TagOutlined />, label: '标签管理' },
    { type: 'divider' },
    { key: '/data', icon: <DatabaseOutlined />, label: '数据管理' },
    { key: '/trash', icon: <ToolOutlined />, label: '回收站' },
    { key: '/notice', icon: <BellOutlined />, label: '公告' },
    { key: '/changelog', icon: <FileTextOutlined />, label: '更新日志' },
  ];

  if (user?.isAdmin) {
    menuItems.push(
      { type: 'divider' },
      {
        key: '/admin',
        icon: <SafetyOutlined />,
        label: '管理后台',
        children: [
          { key: '/admin', label: '仪表盘' },
          { key: '/admin/users', label: '用户管理' },
          { key: '/admin/notices', label: '公告管理' },
          { key: '/admin/changelog', label: '更新日志' },
          { key: '/admin/comments', label: '评论管理' },
          { key: '/admin/database', label: '数据库' },
          { key: '/admin/config', label: '配置' },
        ],
      }
    );
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  const selectedKey = location.pathname.startsWith('/admin')
    ? location.pathname
    : '/' + location.pathname.split('/').filter(Boolean).slice(0, 2).join('/');

  return (
    <Sider
      collapsible
      collapsed={sidebarCollapsed}
      onCollapse={setSidebarCollapsed}
      width={240}
      collapsedWidth={isMobile ? 0 : 72}
      trigger={null}
      style={{
        background: themeMode === 'dark' ? undefined : '#ffffff',
        borderRight: '1px solid var(--color-border)',
        height: 'calc(100vh - 64px)',
        position: 'sticky',
        top: 64,
        overflow: 'auto',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ borderRight: 'none', padding: '8px 0' }}
      />
      {!isMobile && (
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            borderTop: '1px solid var(--color-border)',
            background: themeMode === 'dark' ? undefined : '#ffffff',
          }}
        >
          <Button
            type="text"
            block
            icon={sidebarCollapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              color: '#00b26a',
              height: 48,
              borderRadius: 0,
              fontSize: 18,
              fontWeight: 700,
            }}
          />
        </div>
      )}
    </Sider>
  );
}
