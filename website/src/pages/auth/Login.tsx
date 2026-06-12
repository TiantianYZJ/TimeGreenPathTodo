import { Card, Typography, Space } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';
import QrCodeLogin from '../../components/auth/QrCodeLogin';
import { useAuthStore } from '../../stores';
import { APP_CONFIG } from '../../config/app.config';

const { Title, Text } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (token && user) {
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect, { replace: true });
    }
  }, [token, user, navigate, searchParams]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f5eb 0%, #f0faf5 50%, #ffffff 100%)',
        padding: 24,
      }}
    >
      <Card
        style={{
          width: 420,
          maxWidth: '100%',
          borderRadius: 16,
          boxShadow: '0 8px 32px rgba(0,178,106,0.12)',
          border: 'none',
        }}
        styles={{ body: { padding: '40px 32px' } }}
      >
        <Space direction="vertical" size={32} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{ textAlign: 'center' }}>
            <img
              src={APP_CONFIG.LOGO_URL}
              alt="Logo"
              style={{ width: 64, height: 64, borderRadius: 16, marginBottom: 16 }}
            />
            <Title level={3} style={{ marginBottom: 4 }}>
              {APP_CONFIG.APP_NAME}
            </Title>
            <Text type="secondary">微信扫一扫，登录网页端</Text>
          </div>

          {/* QR Code */}
          <QrCodeLogin />

          {/* Footer */}
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              打开微信 → 扫一扫 → 扫描二维码登录
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  );
}
