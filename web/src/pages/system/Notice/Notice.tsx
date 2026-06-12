/**
 * Notice - 公告页
 *
 * 功能：
 * - 公告列表（Card形式，时间倒序）
 * - 每条公告：标题、内容摘要、发布时间、阅读状态
 * - 点击展开查看全文
 */

import React, { useState, useCallback } from 'react';
import {
  Card,
  List,
  Tag,
  Empty,
  Button,
} from 'antd';
import {
  NotificationOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { formatRelativeTime } from '@/utils/format';
import styles from './Notice.module.css';

/** 公告数据结构 */
interface NoticeItem {
  /** 公告ID */
  id: number;
  /** 标题 */
  title: string;
  /** 内容（支持长文本） */
  content: string;
  /** 摘要（可选，用于列表展示） */
  summary?: string;
  /** 发布时间戳 */
  publishTime: string;
  /** 是否已读 */
  isRead: boolean;
  /** 类型标签 */
  type: 'important' | 'update' | 'activity' | 'normal';
}

/** 类型配置 */
const TYPE_CONFIG = {
  important: { label: '重要', color: '#ff4d4f' },
  update: { label: '更新', color: '#1890ff' },
  activity: { label: '活动', color: '#00b26a' },
  normal: { label: '通知', color: '#999' },
};

/** 模拟公告数据 */
const MOCK_NOTICES: NoticeItem[] = [
  {
    id: 1,
    title: '时光绿径待办 v2.0 正式发布',
    summary: '全新 UI 设计、性能优化、多项新功能上线...',
    content:
      '亲爱的用户们，我们很高兴地宣布时光绿径待办 v2.0 正式版本已发布！\n\n本次更新包含以下重大改进：\n\n1. 全新设计的界面，更加清爽美观\n2. 性能大幅提升，操作更流畅\n3. 新增协作功能，支持团队共享\n4. 新增数据分析模块\n5. 优化移动端体验\n6. 修复已知问题\n\n感谢大家一直以来的支持和反馈！',
    publishTime: new Date(Date.now() - 86400000).toISOString(),
    isRead: false,
    type: 'important',
  },
  {
    id: 2,
    title: '系统维护通知',
    summary: '计划于本周六凌晨进行系统升级维护...',
    content:
      '为提供更好的服务体验，我们计划于本周六（2025年1月18日）凌晨 02:00-06:00 进行系统升级维护。\n\n维护期间以下功能可能暂时不可用：\n- 数据同步功能\n- 协作相关功能\n- 用户注册/登录\n\n请提前做好安排，给您带来的不便敬请谅解。',
    publishTime: new Date(Date.now() - 172800000).toISOString(),
    isRead: false,
    type: 'important',
  },
  {
    id: 3,
    title: '新功能：AI 智能助手上线',
    summary: '集成 AI 助手，帮你智能规划待办事项...',
    content:
      '我们很高兴地宣布 AI 智能助手功能正式上线！\n\nAI 助手可以帮您：\n- 智能分析待办优先级\n- 提供完成建议和时间预估\n- 自动生成周报和月报\n- 回答关于待办管理的各种问题\n\n快来试试吧！点击工具栏中的 AI 图标即可使用。',
    publishTime: new Date(Date.now() - 604800000).toISOString(),
    isRead: true,
    type: 'update',
  },
  {
    id: 4,
    title: '春节活动预告',
    summary: '参与活动赢取高级会员...',
    content:
      '新春佳节即将到来，我们准备了丰富的活动等你来参与！\n\n活动时间：1月20日 - 2月10日\n活动内容：\n1. 完成每日签到领取积分\n2. 邀请好友双方获得奖励\n3. 分享使用心得有机会获得高级会员\n\n具体规则请关注后续公告。',
    publishTime: new Date(Date.now() - 1296000000).toISOString(),
    isRead: true,
    type: 'activity',
  },
  {
    id: 5,
    title: '隐私政策更新说明',
    summary: '我们对隐私政策进行了部分调整...',
    content:
      '为了更好地保护您的个人信息安全，我们对隐私政策进行了如下更新：\n\n1. 明确了数据收集范围和使用目的\n2. 增加了用户数据导出功能说明\n3. 完善了数据删除机制\n4. 更新了第三方服务共享政策\n\n您可以随时在设置中查看完整的隐私政策。如有任何疑问，欢迎联系客服。',
    publishTime: new Date(Date.now() - 2592000000).toISOString(),
    isRead: true,
    type: 'normal',
  },
];

/**
 * 公告页面组件
 *
 * 展示系统公告和通知：
 * - 支持展开查看详情
 * - 显示阅读状态
 * - 按时间倒序排列
 */
const Notice: React.FC = () => {
  // 本地状态
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [readSet, setReadSet] = useState<Set<number>>(
    () => new Set(MOCK_NOTICES.filter((n) => n.isRead).map((n) => n.id))
  );

  // ========== 事件处理 ==========

  /**
   * 切换展开/收起
   */
  const handleToggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));

    // 标记为已读
    if (!readSet.has(id)) {
      setReadSet((prev) => new Set([...prev, id]));
    }
  }, [readSet]);

  /**
   * 渲染公告卡片内容
   */
  const renderNoticeItem = useCallback(
    (notice: NoticeItem) => {
      const isExpanded = expandedId === notice.id;
      const isRead = readSet.has(notice.id);
      const config = TYPE_CONFIG[notice.type];

      return (
        <Card
          key={notice.id}
          className={`${styles.noticeCard} ${!isRead ? styles.unread : ''} ${isExpanded ? styles.expanded : ''}`}
          onClick={() => handleToggleExpand(notice.id)}
        >
          {/* 头部 */}
          <div className={styles.noticeHeader}>
            <div className={styles.headerLeft}>
              {!isRead && <span className={styles.unreadDot} />}
              <h3 className={styles.noticeTitle}>{notice.title}</h3>
            </div>
            <Tag color={config.color} className={styles.typeTag}>
              {config.label}
            </Tag>
          </div>

          {/* 时间和阅读状态 */}
          <div className={styles.noticeMeta}>
            <span className={styles.metaItem}>
              <ClockCircleOutlined /> {formatRelativeTime(notice.publishTime)}
            </span>
            <span className={`${styles.metaItem} ${isRead ? styles.readStatus : ''}`}>
              <EyeOutlined /> {isRead ? '已读' : '未读'}
            </span>
          </div>

          {/* 内容区域 */}
          <div className={`${styles.noticeContent} ${isExpanded ? styles.contentExpanded : ''}`}>
            {isExpanded ? (
              /* 展开时显示完整内容 */
              <p className={styles.fullContent}>
                {notice.content.split('\n').map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    {index < notice.content.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </p>
            ) : (
              /* 收起时显示摘要 */
              <p className={styles.summaryText}>
                {notice.summary ?? notice.content.slice(0, 120) + '...'}
              </p>
            )}
          </div>

          {/* 展开/收起提示 */}
          <div className={styles.toggleHint}>
            {isExpanded ? '收起' : '点击查看全文'}
          </div>
        </Card>
      );
    },
    [expandedId, readSet, handleToggleExpand]
  );

  // ========== 渲染 ==========

  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <NotificationOutlined /> 公告中心
        </h1>
        <span className={styles.unreadCount}>
          {MOCK_NOTICES.length - readSet.size} 条未读
        </span>
      </div>

      {/* 公告列表 */}
      {MOCK_NOTICES.length === 0 ? (
        <Empty
          image={<FileTextOutlined style={{ fontSize: 64, color: '#ddd' }} />}
          description="暂无公告"
          className={styles.emptyState}
        />
      ) : (
        <div className={styles.noticeList}>
          {MOCK_NOTICES.map(renderNoticeItem)}
        </div>
      )}
    </div>
  );
};

export default Notice;
