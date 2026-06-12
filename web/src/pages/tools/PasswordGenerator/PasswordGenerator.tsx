/**
 * PasswordGenerator - 密码生成器工具页
 *
 * 功能：
 * - 密码长度滑块(Slider, 8-64)
 * - 选项：大写字母、小写字母、数字、特殊字符(Checkbox.Group)
 * - 排除混淆字符选项(0Oo1Il)
 * - 生成密码按钮
 * - 生成的密码展示（可复制到剪贴板）
 * - 密码强度指示(Progress颜色: 弱红/中黄/强绿)
 * - 历史记录（本次会话生成的密码列表）
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  Slider,
  Checkbox,
  Button,
  Progress,
  Input,
  message,
  List,
  Tag,
} from 'antd';
import {
  KeyOutlined,
  CopyOutlined,
  ReloadOutlined,
  ClearOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import styles from './PasswordGenerator.module.css';

/** 字符集定义 */
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  digits: '0123456789',
  special: '!@#$%^&*()_+-=[]{}|;:,.<>?',
};

/** 混淆字符 */
const CONFUSING_CHARS = '0Oo1Il';

/** 密码强度等级 */
type StrengthLevel = 'weak' | 'medium' | 'strong' | 'very-strong';

interface StrengthInfo {
  level: StrengthLevel;
  label: string;
  color: string;
  percent: number;
}

/**
 * 密码生成器页面组件
 *
 * 提供安全的随机密码生成功能：
 * - 可自定义长度和字符类型
 * - 实时显示密码强度
 * - 支持复制和历史记录
 */
const PasswordGenerator: React.FC = () => {
  // 本地状态
  const [length, setLength] = useState<number>(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    digits: true,
    special: false,
  });
  const [excludeConfusing, setExcludeConfusing] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [history, setHistory] = useState<string[]>([]);

  // ========== 密码生成逻辑 ==========

  /**
   * 根据当前设置构建字符池
   */
  const getCharPool = useCallback((): string => {
    let pool = '';
    if (options.uppercase) pool += CHAR_SETS.uppercase;
    if (options.lowercase) pool += CHAR_SETS.lowercase;
    if (options.digits) pool += CHAR_SETS.digits;
    if (options.special) pool += CHAR_SETS.special;

    if (excludeConfusing) {
      pool = pool.split('').filter((c) => !CONFUSING_CHARS.includes(c)).join('');
    }

    return pool;
  }, [options, excludeConfusing]);

  /**
   * 生成随机密码
   */
  const generatePassword = useCallback(() => {
    const pool = getCharPool();
    if (pool.length === 0) {
      message.warning('请至少选择一种字符类型');
      return '';
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < length; i++) {
      const idx = Number(array[i]) % pool.length;
      const char = pool[idx];
      password += char ?? pool[0]!;
    }
    return password;
  }, [length, getCharPool]);

  /**
   * 计算密码强度
   */
  const calculateStrength = useCallback(
    (password: string): StrengthInfo => {
      let score = 0;

      // 长度评分
      if (password.length >= 8) score++;
      if (password.length >= 12) score++;
      if (password.length >= 16) score++;
      if (password.length >= 24) score++;

      // 字符多样性评分
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[^a-zA-Z\d]/.test(password)) score++;

      // 判断等级
      if (score <= 3)
        return { level: 'weak', label: '弱', color: '#ff4d4f', percent: 25 };
      if (score <= 5)
        return { level: 'medium', label: '中等', color: '#faad14', percent: 50 };
      if (score <= 7)
        return { level: 'strong', label: '强', color: '#00b26a', percent: 75 };
      return {
        level: 'very-strong',
        label: '非常强',
        color: '#00b26a',
        percent: 100,
      };
    },
    []
  );

  /** 当前密码强度 */
  const strength = useMemo<StrengthInfo>(
    () => calculateStrength(generatedPassword),
    [generatedPassword, calculateStrength]
  );

  // ========== 事件处理 ==========

  /**
   * 点击生成按钮
   */
  const handleGenerate = useCallback(() => {
    const password = generatePassword();
    if (!password) return;

    setGeneratedPassword(password);

    // 添加到历史记录（最多保留20条）
    setHistory((prev) => {
      const updated = [password, ...prev].slice(0, 20);
      return updated;
    });
  }, [generatePassword]);

  /**
   * 复制密码到剪贴板
   */
  const handleCopy = useCallback(async () => {
    if (!generatedPassword) return;
    try {
      await navigator.clipboard.writeText(generatedPassword);
      message.success('已复制到剪贴板');
    } catch {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = generatedPassword;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      message.success('已复制到剪贴板');
    }
  }, [generatedPassword]);

  /**
   * 清空历史记录
   */
  const handleClearHistory = useCallback(() => {
    setHistory([]);
    message.info('已清空历史记录');
  }, []);

  /**
   * 复制历史中的密码
   */
  const handleCopyFromHistory = useCallback(async (password: string) => {
    try {
      await navigator.clipboard.writeText(password);
      message.success('已复制到剪贴板');
    } catch {
      message.error('复制失败，请重试');
    }
  }, []);

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <KeyOutlined /> 密码生成器
        </h1>
      </div>

      {/* ========== 设置区域 ========== */}
      <Card size="small" className={styles.settingsCard}>
        {/* 密码长度 */}
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>
            密码长度：<span className={styles.settingValue}>{length}</span>
          </label>
          <Slider
            min={8}
            max={64}
            value={length}
            onChange={setLength}
            marks={{
              8: '8',
              16: '16',
              32: '32',
              48: '48',
              64: '64',
            }}
          />
        </div>

        {/* 字符选项 */}
        <div className={styles.settingItem}>
          <label className={styles.settingLabel}>包含字符</label>
          <Checkbox.Group
            value={Object.entries(options)
              .filter(([, v]) => v)
              .map(([k]) => k)}
            onChange={(values) =>
              setOptions({
                uppercase: values.includes('uppercase'),
                lowercase: values.includes('lowercase'),
                digits: values.includes('digits'),
                special: values.includes('special'),
              })
            }
            className={styles.checkboxGroup}
          >
            <Checkbox value="uppercase">大写字母 (A-Z)</Checkbox>
            <Checkbox value="lowercase">小写字母 (a-z)</Checkbox>
            <Checkbox value="digits">数字 (0-9)</Checkbox>
            <Checkbox value="special">特殊字符 (!@#$...)</Checkbox>
          </Checkbox.Group>
        </div>

        {/* 排除混淆字符 */}
        <div className={styles.settingItem}>
          <Checkbox
            checked={excludeConfusing}
            onChange={(e) => setExcludeConfusing(e.target.checked)}
          >
            排除混淆字符 (0Oo1Il)
          </Checkbox>
        </div>
      </Card>

      {/* ========== 生成区域 ========== */}
      <Card size="small" className={styles.generateCard}>
        {/* 生成的密码 */}
        <div className={styles.passwordDisplay}>
          <Input.Password
            value={generatedPassword}
            placeholder="点击下方按钮生成密码"
            size="large"
            readOnly
            className={styles.passwordInput}
          />
          <Button
            type="primary"
            icon={<CopyOutlined />}
            onClick={handleCopy}
            disabled={!generatedPassword}
            className={styles.copyBtn}
          >
            复制
          </Button>
        </div>

        {/* 密码强度指示 */}
        {generatedPassword && (
          <div className={styles.strengthSection}>
            <span className={styles.strengthLabel}>密码强度</span>
            <Progress
              percent={strength.percent}
              strokeColor={strength.color}
              format={() => strength.label}
              status={
                strength.level === 'weak'
                  ? 'exception'
                  : strength.level === 'very-strong'
                  ? 'success'
                  : 'active'
              }
              className={styles.strengthBar}
            />
          </div>
        )}

        {/* 生成按钮 */}
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleGenerate}
          block
          size="large"
          style={{ backgroundColor: '#00b26a' }}
          className={styles.generateBtn}
        >
          生成密码
        </Button>
      </Card>

      {/* ========== 历史记录 ========== */}
      {history.length > 0 && (
        <Card
          title={
            <span>
              历史记录 ({history.length})
              <Button
                type="text"
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearHistory}
                className={styles.clearHistoryBtn}
              >
                清空
              </Button>
            </span>
          }
          size="small"
          className={styles.historyCard}
        >
          <List
            dataSource={history}
            renderItem={(item, index) => (
              <List.Item
                key={`${index}-${item.slice(0, 8)}`}
                actions={[
                  <Button
                    key="copy"
                    type="link"
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyFromHistory(item)}
                  >
                    复制
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Tag
                      color={
                        index === 0
                          ? '#00b26a'
                          : index < 3
                          ? '#1890ff'
                          : 'default'
                      }
                    >
                      #{index + 1}
                    </Tag>
                  }
                  description={
                    <code className={styles.historyCode}>{item}</code>
                  }
                />
              </List.Item>
            )}
            pagination={{ pageSize: 8, size: 'small' }}
          />
        </Card>
      )}
    </div>
  );
};

export default PasswordGenerator;
