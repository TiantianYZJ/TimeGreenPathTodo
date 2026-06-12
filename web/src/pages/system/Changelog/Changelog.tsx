/**
 * Changelog - 版本更新日志页
 *
 * 功能：
 * - Timeline组件展示版本历史
 * - 每个版本：版本号、日期、更新内容列表（feat/fix/docs分类标记不同Tag颜色）
 * - 当前版本高亮
 */

import React from 'react';
import {
  Card,
  Timeline,
  Tag,
  Divider,
} from 'antd';
import {
  HistoryOutlined,
  RocketOutlined,
  BugOutlined,
  FileTextOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import styles from './Changelog.module.css';

/** 更新类型 */
type ChangeType = 'feat' | 'fix' | 'docs' | 'refactor' | 'perf';

/** 单条变更记录 */
interface ChangeItem {
  type: ChangeType;
  description: string;
}

/** 版本信息 */
interface VersionInfo {
  /** 版本号 */
  version: string;
  /** 发布日期 */
  date: string;
  /** 是否为当前版本 */
  isCurrent?: boolean;
  /** 变更列表 */
  changes: ChangeItem[];
}

/** 类型配置 */
const TYPE_CONFIG: Record<ChangeType, { label: string; color: string; icon: React.ReactNode }> = {
  feat: { label: '新功能', color: '#00b26a', icon: <RocketOutlined /> },
  fix: { label: '修复', color: '#ff4d4f', icon: <BugOutlined /> },
  docs: { label: '文档', color: '#1890ff', icon: <FileTextOutlined /> },
  refactor: { label: '重构', color: '#722ed1', icon: <ToolOutlined /> },
  perf: { label: '优化', color: '#faad14', icon: <RocketOutlined /> },
};

/** 版本历史数据 */
const VERSION_HISTORY: VersionInfo[] = [
  {
    version: 'v2.0.0',
    date: '2025-01-15',
    isCurrent: true,
    changes: [
      { type: 'feat', description: '全新 UI 设计，采用清爽绿意风格' },
      { type: 'feat', description: '新增协作功能，支持团队共享待办' },
      { type: 'feat', description: '新增数据分析模块和统计图表' },
      { type: 'feat', description: '新增 AI 智能助手功能' },
      { type: 'feat', description: '新增密码生成器小工具' },
      { type: 'feat', description: '新增"今天吃什么"随机选择器' },
      { type: 'feat', description: '新增每日激励语录功能' },
      { type: 'perf', description: '整体性能提升 40%' },
      { type: 'fix', description: '修复移动端布局适配问题' },
      { type: 'docs', description: '完善用户使用文档' },
    ],
  },
  {
    version: 'v1.8.0',
    date: '2024-12-20',
    changes: [
      { type: 'feat', description: '新增标签分类管理功能' },
      { type: 'feat', description: '支持组合归档待办事项' },
      { type: 'feat', description: '新增日历视图模式' },
      { type: 'fix', description: '修复数据同步冲突问题' },
      { type: 'perf', description: '优化列表渲染性能' },
    ],
  },
  {
    version: 'v1.6.0',
    date: '2024-11-10',
    changes: [
      { type: 'feat', description: '支持语音识别快速创建待办' },
      { type: 'feat', description: '新增位置信息和导航功能' },
      { type: 'feat', description: '集成天气显示组件' },
      { type: 'fix', description: '修复时区转换问题' },
      { type: 'docs', description: '更新 API 文档' },
    ],
  },
  {
    version: 'v1.5.0',
    date: '2024-09-28',
    changes: [
      { type: 'feat', description: '新增数据导入导出功能' },
      { type: 'feat', description: '支持自定义标签颜色' },
      { type: 'refactor', description: '重构状态管理架构' },
      { type: 'fix', description: '修复批量操作偶发失败问题' },
    ],
  },
  {
    version: 'v1.4.0',
    date: '2024-08-15',
    changes: [
      { type: 'feat', description: '新增回收站功能（30天保留）' },
      { type: 'feat', description: '支持待办收藏功能' },
      { type: 'feat', description: '新增搜索功能' },
      { type: 'perf', description: '首屏加载速度提升 30%' },
    ],
  },
  {
    version: 'v1.3.0',
    date: '2024-07-01',
    changes: [
      { type: 'feat', description: '新增组合管理功能' },
      { type: 'feat', description: '支持多端数据云同步' },
      { type: 'fix', description: '修复离线缓存问题' },
    ],
  },
  {
    version: 'v1.2.0',
    date: '2024-05-20',
    changes: [
      { type: 'feat', description: '新增通知提醒功能' },
      { type: 'feat', description: '支持暗色主题切换' },
      { type: 'docs', description: '添加使用指南' },
    ],
  },
  {
    version: 'v1.0.0',
    date: '2024-03-15',
    changes: [
      { type: 'feat', description: '初始版本发布' },
      { type: 'feat', description: '基础待办 CRUD 功能' },
      { type: 'feat', description: '系统预设标签' },
      { type: 'feat', description: '响应式布局适配' },
    ],
  },
];

/**
 * 版本更新日志页面组件
 *
 * 展示完整的产品迭代历史：
 * - Timeline 时间线形式
 * - 分类标记不同颜色
 * - 当前版本高亮显示
 */
const Changelog: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      {/* 页面标题 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          <HistoryOutlined /> 更新日志
        </h1>
        <p className={styles.subtitle}>时光绿径待办的发展历程</p>
      </div>

      {/* Timeline 组件 */}
      <Card className={styles.timelineCard}>
        <Timeline
          mode="left"
          items={VERSION_HISTORY.map((version) => ({
            key: version.version,
            // 当前版本使用绿色圆点
            dot: version.isCurrent ? (
              <span className={styles.currentDot} />
            ) : undefined,
            // 当前版本高亮
            color: version.isCurrent ? '#00b26a' : undefined,
            children: (
              <div className={`${styles.versionBlock} ${version.isCurrent ? styles.currentVersion : ''}`}>
                {/* 版本头部 */}
                <div className={styles.versionHeader}>
                  <h3 className={styles.versionNumber}>{version.version}</h3>
                  {version.isCurrent && (
                    <Tag color="#00b26a" className={styles.currentTag}>
                      当前版本
                    </Tag>
                  )}
                  <span className={styles.versionDate}>{version.date}</span>
                </div>

                {/* 变更列表 */}
                <div className={styles.changesList}>
                  {version.changes.map((change, index) => {
                    const config = TYPE_CONFIG[change.type];
                    return (
                      <div key={index} className={styles.changeItem}>
                        <Tag
                          color={config.color}
                          className={styles.changeType}
                          icon={config.icon}
                        >
                          {config.label}
                        </Tag>
                        <span className={styles.changeDesc}>{change.description}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ),
          }))}
        />
      </Card>

      {/* 页脚说明 */}
      <Divider />
      <p className={styles.footerNote}>
        感谢每一位用户的支持与反馈，我们持续改进中。
      </p>
    </div>
  );
};

export default Changelog;
