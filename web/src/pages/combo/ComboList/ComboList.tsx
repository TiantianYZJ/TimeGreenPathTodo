/**
 * ComboList - 组合列表页面
 *
 * 路由：/combos
 *
 * 功能：
 * - 顶部标题"我的组合" + 新建组合按钮
 * - 分区展示：私有组合 / 共享组合
 * - 组合卡片网格列表（使用 ComboCard 组件）
 * - 空状态提示
 * - 点击组合卡片进入详情 /combos/:id
 */

import React, { useEffect, useCallback } from 'react';
import { Card, Button, Typography, Space, Spin, message, Divider, Empty } from 'antd';
import { PlusOutlined, FolderAddOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useComboStore } from '@/stores/comboStore';
import ComboCard from '@/components/business/ComboCard/ComboCard';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import styles from './ComboList.module.css';

const { Title, Text } = Typography;

/**
 * 组合列表页面组件
 *
 * 展示用户的私有组合和共享组合，分区展示，
 * 支持新建、编辑、删除操作，点击卡片进入组合详情页。
 */
const ComboList: React.FC = () => {
  const navigate = useNavigate();

  // 从 store 获取数据和方法
  const combos = useComboStore((state) => state.combos);
  const sharedCombos = useComboStore((state) => state.sharedCombos);
  const isLoading = useComboStore((state) => state.isLoading);
  const fetchCombos = useComboStore((state) => state.fetchCombos);
  const fetchSharedCombos = useComboStore((state) => state.fetchSharedCombos);
  const deleteCombo = useComboStore((state) => state.deleteCombo);

  /**
   * 页面加载时获取所有组合数据（私有 + 共享）
   */
  useEffect(() => {
    Promise.all([
      fetchCombos().catch(console.error),
      fetchSharedCombos().catch(console.error),
    ]);
  }, [fetchCombos, fetchSharedCombos]);

  /**
   * 点击组合卡片进入详情
   */
  const handleComboClick = (comboId: number) => {
    navigate(`/combos/${comboId}`);
  };

  /**
   * 编辑组合（跳转到编辑页）
   */
  const handleEditCombo = (combo: { id: number }) => {
    navigate(`/combos/${combo.id}/edit`);
  };

  /**
   * 删除组合确认处理
   */
  const handleDeleteCombo = async (comboId: number) => {
    try {
      await deleteCombo(comboId);
      message.success('组合已删除');
    } catch (error) {
      console.error('删除组合失败:', error);
      message.error('删除组合失败，请重试');
    }
  };

  /**
   * 新建组合（跳转到新建页）
   */
  const handleCreateCombo = () => {
    navigate('/combos/new');
  };

  // 加载状态渲染
  if (isLoading && combos.length === 0 && sharedCombos.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <LoadingSkeleton type="combo" count={6} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          我的组合
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateCombo}
          style={{ backgroundColor: '#00b26a' }}
        >
          新建组合
        </Button>
      </div>

      {/* ========== 私有组合区域 ========== */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Space size={8}>
            <span className={styles.sectionIcon}>📁</span>
            <Text strong style={{ fontSize: 15 }}>
              私有组合
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              ({combos.length})
            </Text>
          </Space>
        </div>

        {combos.length === 0 ? (
          <Card size="small" className={styles.emptySection}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#999', fontSize: 13 }}>
                  暂无私有组合，点击右上角创建
                </span>
              }
            />
          </Card>
        ) : (
          <div className={styles.comboGrid}>
            {combos.map((combo) => (
              <ComboCard
                key={`private-${combo.id}`}
                combo={combo}
                onClick={() => handleComboClick(combo.id)}
                onEdit={() => handleEditCombo(combo)}
                onDelete={() => handleDeleteCombo(combo.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========== 共享组合区域 ========== */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <Space size={8}>
            <TeamOutlined style={{ color: '#1677ff', fontSize: 16 }} />
            <Text strong style={{ fontSize: 15 }}>
              共享组合
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              ({sharedCombos.length})
            </Text>
          </Space>
        </div>

        {sharedCombos.length === 0 ? (
          <Card size="small" className={styles.emptySection}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ color: '#999', fontSize: 13 }}>
                  暂未加入任何共享组合
                </span>
              }
            />
          </Card>
        ) : (
          <div className={styles.comboGrid}>
            {sharedCombos.map((combo) => (
              <ComboCard
                key={`shared-${combo.id}`}
                combo={combo}
                onClick={() => handleComboClick(combo.id)}
                onEdit={() => handleEditCombo(combo)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 加载更多指示器 */}
      {isLoading && (combos.length > 0 || sharedCombos.length > 0) && (
        <div className={styles.loadingMore}>
          <Spin size="small" />
          <span>加载中...</span>
        </div>
      )}
    </div>
  );
};

export default ComboList;
