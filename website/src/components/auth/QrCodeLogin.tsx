import { useState, useEffect, useCallback } from 'react';
import { Spin, Typography, Button, Space } from 'antd';
import { ReloadOutlined, ScanOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authApi } from '../../services';
import { useAuthStore } from '../../stores';

const { Text, Title } = Typography;

const POLL_INTERVAL = 2000;
const EXPIRE_SECONDS = 180;

type QrStatus = 'loading' | 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error';

export default function QrCodeLogin() {
  const [qrcodeUrl, setQrcodeUrl] = useState<string>('');
  const [sceneId, setSceneId] = useState<string>('');
  const [status, setStatus] = useState<QrStatus>('loading');
  const [countdown, setCountdown] = useState(EXPIRE_SECONDS);
  const login = useAuthStore((s) => s.login);

  const generateQrCode = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await authApi.generateQrCode();
      if (res.success) {
        setQrcodeUrl(res.data.qrcodeUrl);
        setSceneId(res.data.sceneId);
        setStatus('waiting');
        setCountdown(EXPIRE_SECONDS);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    generateQrCode();
  }, [generateQrCode]);

  // Poll status
  useEffect(() => {
    if (status !== 'waiting' && status !== 'scanned') return;

    const timer = setInterval(async () => {
      try {
        const res = await authApi.getQrCodeStatus(sceneId);
        if (res.success) {
          switch (res.status) {
            case 'scanned':
              setStatus('scanned');
              break;
            case 'confirmed':
              setStatus('confirmed');
              if (res.token && res.user) {
                login(res.token, res.user);
              }
              break;
            case 'expired':
              setStatus('expired');
              break;
          }
        }
      } catch {
        // ignore polling errors
      }
    }, POLL_INTERVAL);

    return () => clearInterval(timer);
  }, [sceneId, status, login]);

  // Countdown
  useEffect(() => {
    if (status !== 'waiting' && status !== 'scanned') return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>
          <Text type="secondary">正在生成二维码...</Text>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <Text type="danger">生成二维码失败</Text>
        <div style={{ marginTop: 16 }}>
          <Button icon={<ReloadOutlined />} onClick={generateQrCode}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          padding: 16,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        }}
      >
        {qrcodeUrl && (
          <img
            src={qrcodeUrl}
            alt="登录二维码"
            style={{ width: 200, height: 200, display: 'block' }}
          />
        )}

        {/* Status overlay */}
        {status === 'scanned' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,178,106,0.9)',
              borderRadius: 12,
              color: '#fff',
            }}
          >
            <ScanOutlined style={{ fontSize: 40 }} />
            <Text style={{ color: '#fff', marginTop: 8 }}>已扫描，请在小程序中确认</Text>
          </div>
        )}

        {status === 'confirmed' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,178,106,0.9)',
              borderRadius: 12,
              color: '#fff',
            }}
          >
            <CheckCircleOutlined style={{ fontSize: 40 }} />
            <Text style={{ color: '#fff', marginTop: 8 }}>登录成功</Text>
          </div>
        )}

        {status === 'expired' && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0,0,0,0.7)',
              borderRadius: 12,
              color: '#fff',
            }}
          >
            <Text style={{ color: '#fff' }}>二维码已过期</Text>
            <Button
              type="primary"
              size="small"
              icon={<ReloadOutlined />}
              onClick={generateQrCode}
              style={{ marginTop: 12 }}
            >
              刷新
            </Button>
          </div>
        )}
      </div>

      <div style={{ marginTop: 20 }}>
        {(status === 'waiting' || status === 'scanned') && (
          <Space direction="vertical" size={4}>
            <Text type="secondary">
              {status === 'waiting'
                ? '请使用微信扫一扫扫描二维码'
                : '已扫描，请在手机上确认'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {formatTime(countdown)} 后过期
            </Text>
          </Space>
        )}
      </div>
    </div>
  );
}
