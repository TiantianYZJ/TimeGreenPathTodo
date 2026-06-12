/**
 * Acknowledge - 致谢名单页
 *
 * 功能：
 * - 项目介绍
 * - 致谢名单（Timeline组件或Card列表）：角色、昵称、贡献描述、头像、链接
 * - 项目信息（版本号、开源协议等）
 */

import React from 'react';
import {
  Card,
  Timeline,
  Avatar,
  Tag,
  Divider,
} from 'antd';
import {
  HeartOutlined,
  TeamOutlined,
  GithubOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import styles from './Acknowledge.module.css';

/** 贡献者数据 */
interface Contributor {
  /** 角色 */
  role: string;
  /** 昵称/名称 */
  name: string;
  /** 贡献描述 */
  contribution: string;
  /** 头像（可选） */
  avatar?: string;
  /** 链接（可选） */
  link?: string;
  /** 颜色标识 */
  color: string;
}

/** 贡献者列表 */
const CONTRIBUTORS: Contributor[] = [
  {
    role: '创始人 & 核心开发',
    name: '时光绿径团队',
    contribution: '项目架构设计、核心功能开发、产品规划与持续迭代',
    color: '#00b26a',
  },
  {
    role: 'UI/UX 设计师',
    name: '设计团队',
    contribution: '界面设计、交互体验优化、品牌视觉体系构建',
    color: '#1890ff',
  },
  {
    role: '后端工程师',
    name: '后端团队',
    contribution: 'API 设计与实现、数据库架构、服务器部署与运维',
    color: '#722ed1',
  },
  {
    role: '测试工程师',
    name: 'QA 团队',
    contribution: '功能测试、性能测试、用户体验反馈收集与分析',
    color: '#faad14',
  },
  {
    role: '文档撰写者',
    name: '文档团队',
    contribution: '用户文档编写、API 文档维护、使用指南制作',
    color: '#13c2c2',
  },
  {
    role: '社区贡献者',
    name: '开源社区',
    contribution: 'Bug 反馈、功能建议、代码贡献、国际化支持',
    color: '#eb2f96',
  },
];

/**
 * 致谢名单页面组件
 *
 * 展示项目贡献者和致谢信息：
 * - 项目介绍
 * - 贡献者列表
 * - 开源协议和项目信息
 */
const Acknowledge: React.FC = () => {
  return (
    <div className={styles.pageContainer}>
      {/* ========== 项目介绍 ========== */}
      <Card className={styles.introCard}>
        <div className={styles.introContent}>
          <div className={styles.logo}>
            <HeartOutlined className={styles.logoIcon} />
          </div>
          <h1 className={styles.projectName}>时光绿径待办</h1>
          <p className={styles.projectDesc}>
            一款简洁高效的待办事项管理工具，致力于帮助用户更好地规划和完成每日任务。
            采用清爽的绿意设计风格，缓解事务焦虑，让生活更有序。
          </p>
          <div className={styles.tags}>
            <Tag color="#00b26a">React</Tag>
            <Tag color="#1890ff">TypeScript</Tag>
            <Tag color="#722ed1">Ant Design</Tag>
            <Tag color="#faad14">Zustand</Tag>
            <Tag color="#13c2c2">ECharts</Tag>
          </div>
        </div>
      </Card>

      {/* ========== 致谢名单 ========== */}
      <Card
        title={
          <span>
            <TeamOutlined style={{ marginRight: 8 }} />
            致谢名单
          </span>
        }
        className={styles.ackCard}
      >
        <Timeline
          mode="left"
          items={CONTRIBUTORS.map((contributor, index) => ({
            key: index,
            dot: (
              <Avatar
                size="small"
                src={contributor.avatar}
                style={{
                  backgroundColor: contributor.color,
                  fontSize: 12,
                }}
              >
                {contributor.name.slice(0, 1)}
              </Avatar>
            ),
            children: (
              <div className={styles.timelineItem}>
                <div className={styles.itemHeader}>
                  <span
                    className={styles.itemRole}
                    style={{ color: contributor.color }}
                  >
                    {contributor.role}
                  </span>
                </div>
                <h3 className={styles.itemName}>{contributor.name}</h3>
                <p className={styles.itemContribution}>{contributor.contribution}</p>
              </div>
            ),
          }))}
        />
      </Card>

      {/* ========== 项目信息 ========== */}
      <Card title="项目信息" className={styles.infoCard}>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <CodeOutlined className={styles.infoIcon} />
            <span className={styles.infoLabel}>版本号</span>
            <span className={styles.infoValue}>v2.0.0</span>
          </div>
          <div className={styles.infoItem}>
            <GithubOutlined className={styles.infoIcon} />
            <span className={styles.infoLabel}>开源协议</span>
            <span className={styles.infoValue}>MIT License</span>
          </div>
          <div className={styles.infoItem}>
            <TeamOutlined className={styles.infoIcon} />
            <span className={styles.infoLabel}>开发团队</span>
            <span className={styles.infoValue}>时光绿径工作室</span>
          </div>
          <div className={styles.infoItem}>
            <HeartOutlined className={styles.infoIcon} />
            <span className={styles.infoLabel}>特别感谢</span>
            <span className={styles.infoValue}>所有用户的支持与反馈</span>
          </div>
        </div>
      </Card>

      {/* 页脚 */}
      <Divider />
      <p className={styles.footerText}>
        Made with <HeartOutlined style={{ color: '#ff4d4f' }} /> by 时光绿径团队
      </p>
    </div>
  );
};

export default Acknowledge;
