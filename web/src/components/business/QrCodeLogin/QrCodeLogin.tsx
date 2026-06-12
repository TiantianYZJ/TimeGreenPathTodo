/**
 * QrCodeLogin - 二维码扫码登录组件
 *
 * 功能：
 * - 居中显示大尺寸二维码（至少200x200px）
 * - 二维码下方显示扫码登录提示文字
 * - 使用 qrcode.react 的 QRCodeSVG 组件生成二维码
 * - 轮询检查扫码状态（每2秒调用 authApi.getQrCodeStatus）
 * - 状态展示：waiting / scanned / confirmed / expired
 * - 二维码过期倒计时显示
 * - 刷新按钮重新生成二维码
 * - Loading 状态处理
 */

import React, { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Button, Spin } from 'antd';
import {
  ReloadOutlined,
  CheckCircleOutlined,
  ScanOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { authApi } from '@/services';
import type { UserInfo } from '@/types/user';
import styles from './QrCodeLogin.module.css';

export interface QrCodeLoginProps {
  /** 登录成功回调 */
  onSuccess?: (user: UserInfo) => void;
}

/** 二维码状态枚举 */
type QrStatus = 'waiting' | 'scanned' | 'confirmed' | 'expired' | 'error';

/** 二维码过期时间（秒） */
const QR_EXPIRE_SECONDS = 180;

/** 轮询间隔（毫秒） */
const POLL_INTERVAL_MS = 2000;

/**
 * 二维码扫码登录组件
 *
 * 展示用于扫码登录的二维码，通过轮询检测扫码状态。
 * 支持过期刷新和多种状态的视觉反馈。
 */
const QrCodeLogin: React.FC<QrCodeLoginProps> = memo(({ onSuccess }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [sceneId, setSceneId] = useState<string>('');
  const [status, setStatus] = useState<QrStatus>('waiting');
  const [loading, setLoading] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(QR_EXPIRE_SECONDS);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 清理定时器
  const clearTimers = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
  }, []);

  // 开始倒计时
  const startCountdown = useCallback(() => {
    setRemainingSeconds(QR_EXPIRE_SECONDS);
    clearTimers();
    countdownTimerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          setStatus('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [clearTimers]);

  const [debugInfo, setDebugInfo] = useState<string>('');
  const hasConfirmedRef = useRef(false);

  // 生成二维码
  const generateQrCode = useCallback(async () => {
    if (hasConfirmedRef.current) {
      console.log('[QrCodeLogin] 已确认过，跳过重复生成');
      return;
    }
    setLoading(true);
    setStatus('waiting');
    setQrUrl('');
    setSceneId('');
    setDebugInfo('');

    try {
      console.log('[QrCodeLogin] 开始请求生成二维码...');
      const result = await authApi.generateQrCode();
      console.log('[QrCodeLogin] API 返回:', JSON.stringify(result).substring(0, 500));

      const qrcodeUrl = (result as any).qrcodeUrl || '';
      const sceneId = (result as any).sceneId || '';

      console.log('[QrCodeLogin] qrcodeUrl:', qrcodeUrl ? '有值' : '空');
      console.log('[QrCodeLogin] sceneId:', sceneId);

      if (!qrcodeUrl) {
        setDebugInfo(`API返回数据异常: ${JSON.stringify(result).substring(0, 200)}`);
        setStatus('error');
        setLoading(false);
        return;
      }

      setQrUrl(qrcodeUrl);
      setSceneId(sceneId);
      startCountdown();

      pollTimerRef.current = setInterval(async () => {
        try {
          const statusRes = await authApi.getQrCodeStatus(sceneId);
          console.log('[QrCodeLogin] 轮询状态:', JSON.stringify(statusRes).substring(0, 300));

          const currentStatus = (statusRes as any).status;
          console.log('[QrCodeLogin] 当前状态:', currentStatus);

          switch (currentStatus) {
            case 'scanned':
              setStatus('scanned');
              break;
            case 'confirmed':
              hasConfirmedRef.current = true;
              clearTimers();
              setStatus('confirmed');
              const userData = (statusRes as any).user;
              const token = (statusRes as any).token;
              console.log('[QrCodeLogin] ✅ 确认成功! user:', userData, 'token:', token ? '有' : '无');
              if (userData && onSuccess) {
                onSuccess({ ...userData, token });
              }
              break;
            case 'expired':
              clearTimers();
              setStatus('expired');
              break;
            // waiting 保持当前状态
          }
        } catch (pollErr) {
          console.error('[QrCodeLogin] 轮询错误:', pollErr);
        }
      }, POLL_INTERVAL_MS);
    } catch (err) {
      console.error('[QrCodeLogin] 生成二维码失败:', err);
      setDebugInfo(`请求失败: ${(err as Error)?.message || '未知错误'}`);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  }, [clearTimers, startCountdown, onSuccess]);

  // 组件挂载时生成二维码
  useEffect(() => {
    generateQrCode();

    return () => {
      clearTimers();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 格式化剩余时间
  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // 渲染状态图标与文案
  const renderStatusOverlay = () => {
    if (status === 'waiting') return null;

    const statusConfig: Record<
      Exclude<QrStatus, 'waiting'>,
      { icon: React.ReactNode; title: string; subtitle: string; action?: React.ReactNode }
    > = {
      scanned: {
        icon: <ScanOutlined style={{ color: '#1890ff', fontSize: 48 }} />,
        title: '已扫描',
        subtitle: '请在手机上确认登录',
      },
      confirmed: {
        icon: <CheckCircleOutlined style={{ color: '#00b26a', fontSize: 48 }} />,
        title: '登录成功',
        subtitle: '正在跳转...',
      },
      expired: {
        icon: <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 48 }} />,
        title: '二维码已过期',
        subtitle: '请点击刷新按钮重新获取',
        action: (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={generateQrCode}
            style={{ backgroundColor: '#00b26a' }}
          >
            刷新二维码
          </Button>
        ),
      },
      error: {
        icon: <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 48 }} />,
        title: '加载失败',
        subtitle: debugInfo || '请点击重试',
        action: (
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={generateQrCode}
            style={{ backgroundColor: '#00b26a' }}
          >
            重试
          </Button>
        ),
      },
    };

    const config = statusConfig[status];
    if (!config) return null;

    return (
      <div className={styles.statusOverlay}>
        <div className={styles.statusIcon}>{config.icon}</div>
        <div className={styles.statusTitle}>{config.title}</div>
        <div className={styles.statusSubtitle}>{config.subtitle}</div>
        {config.action && <div className={styles.statusAction}>{config.action}</div>}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      {/* 二维码区域 */}
      <div className={styles.qrArea}>
        {loading ? (
          <div className={styles.loadingMask}>
            <Spin size="large">
              <span>生成二维码...</span>
            </Spin>
          </div>
        ) : qrUrl ? (
          <>
            <div className={`${styles.qrWrapper} ${status !== 'waiting' ? styles.dimmed : ''}`}>
              <img
                src={qrUrl}
                alt="扫码登录"
                className={styles.qrImage}
              />

              {/* 过期遮罩 */}
              {(status === 'expired' || status === 'error') && (
                <div className={styles.expiredMask} />
              )}
            </div>

            {/* 状态覆盖层 */}
            {renderStatusOverlay()}
          </>
        ) : null}
      </div>

      {/* 提示文字 */}
      <p className={styles.hintText}>
        请使用微信扫描二维码登录
      </p>

      {/* 过期倒计时 */}
      {status === 'waiting' && remainingSeconds > 0 && (
        <div className={styles.countdownRow}>
          <ClockCircleOutlined className={styles.countdownIcon} />
          <span className={styles.countdownText}>
            有效期剩余 {formatTime(remainingSeconds)}
          </span>
        </div>
      )}

      {/* 手动刷新按钮（非过期状态也可用） */}
      {!loading && qrUrl && (
        <Button
          type="link"
          icon={<ReloadOutlined />}
          onClick={generateQrCode}
          className={styles.refreshBtn}
        >
          刷新二维码
        </Button>
      )}

      {debugInfo && (
        <p className={styles.debugInfo}>{debugInfo}</p>
      )}
    </div>
  );
});

QrCodeLogin.displayName = 'QrCodeLogin';

export default QrCodeLogin;
