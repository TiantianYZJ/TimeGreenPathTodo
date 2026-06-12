import { Layout, Drawer } from 'antd';
import Header from './Header';
import MobileTabBar from './MobileTabBar';
import Sidebar from './Sidebar';
import { useUIStore } from '../../stores';

const { Content } = Layout;

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Content
        style={{
          padding: 16,
          paddingBottom: 72,
        }}
      >
        {children}
      </Content>
      <MobileTabBar />
      <Drawer
        placement="left"
        open={!sidebarCollapsed}
        onClose={() => setSidebarCollapsed(true)}
        width={280}
        styles={{ body: { padding: 0 } }}
      >
        <Sidebar />
      </Drawer>
    </Layout>
  );
}
