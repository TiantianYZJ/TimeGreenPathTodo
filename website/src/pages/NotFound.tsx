import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <Title style={{ fontSize: 72, color: 'var(--color-primary)', marginBottom: 0 }}>404</Title>
      <Text type="secondary" style={{ fontSize: 16 }}>
        页面不存在
      </Text>
      <div style={{ marginTop: 24 }}>
        <Button type="primary" icon={<HomeOutlined />} onClick={() => navigate('/')}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
