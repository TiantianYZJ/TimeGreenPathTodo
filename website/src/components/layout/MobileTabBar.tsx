import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeOutlined,
  CalendarOutlined,
  BarChartOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Space } from 'antd';

const tabs = [
  { key: '/', icon: <HomeOutlined />, label: '待办' },
  { key: '/calendar', icon: <CalendarOutlined />, label: '日历' },
  { key: '/stats', icon: <BarChartOutlined />, label: '统计' },
  { key: '/user', icon: <UserOutlined />, label: '我的' },
];

export default function MobileTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (key: string) => {
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        background: 'var(--color-bg-card)',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 100,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {tabs.map((tab) => {
        const active = isActive(tab.key);
        return (
          <div
            key={tab.key}
            onClick={() => navigate(tab.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              height: '100%',
              cursor: 'pointer',
              color: active ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 11, marginTop: 2 }}>{tab.label}</span>
          </div>
        );
      })}
    </div>
  );
}
