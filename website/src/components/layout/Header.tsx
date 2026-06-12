import { Layout, Input, Avatar, Dropdown, Space, Button, theme } from 'antd';
import {
  MenuOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useUIStore } from '../../stores';
import { APP_CONFIG } from '../../config/app.config';

const { Header: AntHeader } = Layout;

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { isMobile, toggleThemeMode, themeMode, toggleSidebar } = useUIStore();
  const { token: themeToken } = theme.useToken();

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
    }
  };

  const dropdownItems = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
        onClick: () => navigate('/user'),
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '设置',
        onClick: () => navigate('/user'),
      },
      { type: 'divider' as const },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        danger: true,
        onClick: logout,
      },
    ],
  };

  return (
    <AntHeader
      style={{
        background: themeMode === 'dark' ? themeToken.colorBgContainer : '#ffffff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: isMobile ? 56 : 64,
        borderBottom: `1px solid ${themeToken.colorBorder}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Left: logo + name */}
      <Space size={16}>
        {isMobile && (
          <Button type="text" icon={<MenuOutlined />} onClick={toggleSidebar} />
        )}
        <div
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}
          onClick={() => navigate('/')}
        >
          <img
            src={APP_CONFIG.LOGO_URL}
            alt="Logo"
            style={{ height: 32, width: 32, borderRadius: 8 }}
          />
          <span style={{ fontSize: 18, fontWeight: 600, color: '#00b26a' }}>
            {APP_CONFIG.APP_NAME}
          </span>
        </div>
      </Space>

      {/* Right controls */}
      <Space size={12}>
        {!isMobile && (
          <Input
            placeholder="搜索待办..."
            prefix={<SearchOutlined />}
            style={{ width: 240, borderRadius: 8 }}
            onPressEnter={(e) => handleSearch((e.target as HTMLInputElement).value)}
            allowClear
          />
        )}
        <Button
          type="text"
          icon={themeMode === 'light' ? <MoonOutlined /> : <SunOutlined />}
          onClick={toggleThemeMode}
        />
        <Dropdown menu={dropdownItems} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              src={user?.avatarUrl}
              icon={<UserOutlined />}
              size={32}
              style={{ backgroundColor: '#00b26a' }}
            />
            {!isMobile && (
              <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.nickname || '用户'}
              </span>
            )}
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
