/**
 * Login - 登录页面
 *
 * 功能：
 * - 默认显示二维码扫码登录（使用 QrCodeLogin 组件）
 * - 支持切换到账号密码登录模式
 * - 扫码/密码登录成功后跳转到首页或 redirect 参数指定的路径
 * - 居中布局，展示品牌 Logo 和名称"时光绿径待办"
 * - 响应式适配，支持暗色主题
 */

import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import type { UserInfo } from '@/types/user';
import QrCodeLogin from '@/components/business/QrCodeLogin/QrCodeLogin';
import { message } from 'antd';
import styles from './Login.module.css';

const { Title, Text } = Typography;

/** 登录模式类型 */
type LoginMode = 'qrcode' | 'password';

/**
 * 登录页面组件
 *
 * 提供二维码扫码和账号密码两种登录方式，
 * 登录成功后根据 redirect 参数或默认路径进行跳转。
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, loginByQrcode } = useAuth();

  // 获取重定向地址，默认首页
  const redirectUrl = searchParams.get('redirect') || '/';

  // 当前登录模式（默认二维码）
  const [loginMode, setLoginMode] = useState<LoginMode>('qrcode');
  // 表单加载状态
  const [loading, setLoading] = useState(false);

  /**
   * 二维码登录成功回调
   * 处理扫码确认后的登录逻辑
   */
  const handleQrCodeSuccess = useCallback(
    (result: UserInfo & { token?: string }) => {
      const { token, ...userInfo } = result;

      if (!token) {
        message.error('登录失败：未获取到有效凭证');
        return;
      }

      loginByQrcode({
        status: 'confirmed',
        token,
        user: userInfo,
      });

      message.success('登录成功，正在跳转...');

      setTimeout(() => {
        navigate(redirectUrl, { replace: true });
      }, 300);
    },
    [loginByQrcode, navigate, redirectUrl]
  );

  /**
   * 账号密码登录提交
   */
  const handlePasswordLogin = async (values: { account: string; password: string }) => {
    setLoading(true);
    try {
      await login({ account: values.account, password: values.password });
      message.success('登录成功');
      navigate(redirectUrl, { replace: true });
    } catch (error) {
      console.error('登录失败:', error);
      message.error(error instanceof Error ? error.message : '登录失败，请检查账号密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* 背景装饰 */}
      <div className={styles.bgDecoration} />

      {/* 主内容区 */}
      <div className={styles.contentWrapper}>
        {/* 品牌区域 */}
        <div className={styles.brandSection}>
          <div className={styles.logoWrapper}>
            <SafetyCertificateOutlined className={styles.logoIcon} />
          </div>
          <Title level={2} className={styles.brandTitle}>
            时光绿径待办
          </Title>
          <Text type="secondary" className={styles.brandSubtitle}>
            高效管理每一天
          </Text>
        </div>

        {/* 登录卡片 */}
        <Card className={styles.loginCard} variant="borderless">
          {/* 二维码登录 */}
          {loginMode === 'qrcode' && (
            <div className={styles.qrcodeSection}>
              <QrCodeLogin onSuccess={handleQrCodeSuccess} />

              <Divider plain className={styles.modeDivider}>
                或
              </Divider>

              <Button
                type="link"
                onClick={() => setLoginMode('password')}
                className={styles.switchBtn}
              >
                使用账号密码登录
              </Button>
            </div>
          )}

          {/* 密码登录 */}
          {loginMode === 'password' && (
            <div className={styles.passwordSection}>
              <Form
                name="password_login"
                onFinish={handlePasswordLogin}
                autoComplete="off"
                size="large"
                layout="vertical"
              >
                <Form.Item
                  name="account"
                  rules={[
                    { required: true, message: '请输入账号' },
                    { min: 3, message: '账号至少3个字符' },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined />}
                    placeholder="请输入账号"
                    allowClear
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[
                    { required: true, message: '请输入密码' },
                    { min: 6, message: '密码至少6个字符' },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="请输入密码"
                    allowClear
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    loading={loading}
                    className={styles.submitBtn}
                  >
                    登 录
                  </Button>
                </Form.Item>
              </Form>

              <Divider plain className={styles.modeDivider}>
                或
              </Divider>

              <Space direction="vertical" align="center" className={styles.switchArea}>
                <Button
                  type="link"
                  onClick={() => setLoginMode('qrcode')}
                  className={styles.switchBtn}
                >
                  使用二维码扫码登录
                </Button>
              </Space>
            </div>
          )}
        </Card>

        {/* 底部信息 */}
        <Text type="secondary" className={styles.footerText}>
          &copy; 2024-2026 时光绿径待办 &middot; 让时间更有价值
        </Text>
      </div>
    </div>
  );
};

export default Login;
