/**
 * UserCenter - 用户中心页
 *
 * 功能：
 * - 用户头像+昵称+角色信息卡片
 * - 数据统计面板：总待办数、总组合数、已完成数、完成率
 * - 上限信息展示（todo_limit, combo_limit, collab_limit）
 * - 功能菜单列表：个人资料编辑、账号安全设置、通知设置、主题切换入口、关于/版本信息
 * - 退出登录按钮
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Avatar,
  Button,
  Row,
  Col,
  Statistic,
  Progress,
  List,
  Tag,
  message,
  Divider,
} from 'antd';
import {
  UserOutlined,
  EditOutlined,
  SafetyOutlined,
  BellOutlined,
  BulbOutlined,
  InfoCircleOutlined,
  LogoutOutlined,
  SettingOutlined,
  UnorderedListOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '@/stores/authStore';
import { useTodoStore } from '@/stores/todoStore';
import { useComboStore } from '@/stores/comboStore';
import { useDeviceType } from '@/hooks/useMediaQuery';
import styles from './UserCenter.module.css';

/** 菜单项配置 */
const MENU_ITEMS = [
  {
    key: 'profile',
    icon: <EditOutlined />,
    title: '个人资料',
    description: '修改头像、昵称等个人信息',
    path: '/user/profile',
  },
  {
    key: 'security',
    icon: <SafetyOutlined />,
    title: '账号安全',
    description: '密码修改、登录设备管理',
    path: '/user/security',
  },
  {
    key: 'notification',
    icon: <BellOutlined />,
    title: '通知设置',
    description: '待办提醒、系统消息偏好',
    path: '/user/notification',
  },
  {
    key: 'theme',
    icon: <BulbOutlined />,
    title: '主题切换',
    description: '亮色/暗色主题',
    action: 'toggle-theme',
  },
  {
    key: 'about',
    icon: <InfoCircleOutlined />,
    title: '关于',
    description: '版本信息与开源协议',
    path: '/about',
  },
] as const;

/**
 * 用户中心页面组件
 *
 * 展示用户信息和相关操作：
 * - 个人资料卡片
 * - 数据统计概览
 * - 使用上限信息
 * - 功能菜单导航
 */
const UserCenter: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  // Store 数据
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const todos = useTodoStore((state) => state.todos);
  const combos = useComboStore((state) => state.combos);

  // ========== 计算统计数据 ==========

  /** 用户数据统计 */
  const userStats = useMemo(() => {
    const totalTodos = todos.length;
    const completedTodos = todos.filter(
      (t) => t.completed !== false && t.completed !== 0
    ).length;
    const completionRate =
      totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

    return {
      totalTodos,
      totalCombos: combos.length,
      completedTodos,
      completionRate,
    };
  }, [todos, combos]);

  // ========== 事件处理 ==========

  /**
   * 菜单项点击
   */
  const handleMenuClick = useCallback(
    (item: typeof MENU_ITEMS[number]) => {
      if ('action' in item && item.action === 'toggle-theme') {
        message.info('请使用右上角的主题切换按钮');
        return;
      }
      if ('path' in item && item.path) {
        // 检查是否为已实现的路由，否则提示开发中
        const implementedPaths = ['/about', '/user-center', '/notice', '/changelog'];
        if (implementedPaths.some((p) => item.path.startsWith(p) || p.startsWith(item.path))) {
          navigate(item.path);
        } else {
          message.info('该功能正在开发中，敬请期待~');
        }
      }
    },
    [navigate]
  );

  /**
   * 退出登录确认
   */
  const handleLogout = useCallback(() => {
    logout();
    message.success('已退出登录');
    navigate('/login');
  }, [logout, navigate]);

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* ========== 用户信息卡片 ========== */}
      <Card className={styles.userCard}>
        <div className={styles.userHeader}>
          <Avatar
            size={isMobile ? 64 : 80}
            src={user?.avatar}
            icon={<UserOutlined />}
            className={styles.avatar}
          />
          <div className={styles.userInfo}>
            <h2 className={styles.nickname}>{user?.nickname ?? '未登录'}</h2>
            <div className={styles.metaRow}>
              {user?.role && (
                <Tag color="#00b26a">{user.role}</Tag>
              )}
              <span className={styles.userId}>ID: {user?.id ?? '-'}</span>
            </div>
          </div>
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => handleMenuClick(MENU_ITEMS[0])}
            className={styles.settingsBtn}
          />
        </div>
      </Card>

      {/* ========== 数据统计面板 ========== */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        <Col xs={12} sm={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="总待办"
              value={userStats.totalTodos}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#00b26a', fontSize: isMobile ? 18 : 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="总组合"
              value={userStats.totalCombos}
              prefix={<FolderOpenOutlined />}
              valueStyle={{ color: '#1890ff', fontSize: isMobile ? 18 : 22 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="已完成"
              value={userStats.completedTodos}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? 18 : 22 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" className={styles.statCard}>
            <div className={styles.progressWrapper}>
              <span className={styles.progressLabel}>完成率</span>
              <Progress
                percent={userStats.completionRate}
                strokeColor="#00b26a"
                size="small"
                format={(percent) => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ========== 上限信息 ========== */}
      <Card title="使用限制" size="small" className={styles.limitCard}>
        <Row gutter={[16, 12]}>
          <Col xs={8}>
            <div className={styles.limitItem}>
              <TeamOutlined className={styles.limitIcon} />
              <span className={styles.limitLabel}>待办上限</span>
              <span className={styles.limitValue}>
                {todos.length}/{user?.todo_limit ?? 100}
              </span>
            </div>
          </Col>
          <Col xs={8}>
            <div className={styles.limitItem}>
              <FolderOpenOutlined className={styles.limitIcon} />
              <span className={styles.limitLabel}>组合上限</span>
              <span className={styles.limitValue}>
                {combos.length}/{user?.combo_limit ?? 10}
              </span>
            </div>
          </Col>
          <Col xs={8}>
            <div className={styles.limitItem}>
              <TeamOutlined className={styles.limitIcon} />
              <span className={styles.limitLabel}>协作上限</span>
              <span className={styles.limitValue}>
                0/{user?.collab_limit ?? 5}
              </span>
            </div>
          </Col>
        </Row>
      </Card>

      {/* ========== 功能菜单 ========== */}
      <Card title="功能菜单" size="small" className={styles.menuCard}>
        <List
          dataSource={[...MENU_ITEMS]}
          renderItem={(item: typeof MENU_ITEMS[number]) => (
            <List.Item
              className={styles.menuItem}
              onClick={() => handleMenuClick(item)}
            >
              <List.Item.Meta
                avatar={<span className={styles.menuIcon}>{item.icon}</span>}
                title={
                  <span className={styles.menuTitle}>{item.title}</span>
                }
                description={
                  <span className={styles.menuDesc}>{item.description}</span>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* ========== 退出登录 ========== */}
      <Divider style={{ margin: '20px 0' }} />
      <Button
        danger
        block
        icon={<LogoutOutlined />}
        onClick={handleLogout}
        size="large"
        className={styles.logoutBtn}
      >
        退出登录
      </Button>
    </div>
  );
};

export default UserCenter;
