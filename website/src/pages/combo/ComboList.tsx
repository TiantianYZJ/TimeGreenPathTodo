import { useEffect } from 'react';
import { Card, Typography, Row, Col, Empty, Button, Space, Tabs } from 'antd';
import { PlusOutlined, TeamOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useComboStore } from '../../stores';
import TIcon from '../../components/ui/TIcon';
import { Skeleton } from '../../components/ui/Skeleton';

const { Title, Text } = Typography;

function ComboCardSkeleton() {
  return (
    <Col xs={24} sm={12} md={8}>
      <Card style={{ borderRadius: 12 }}>
        <Space>
          <Skeleton width={40} height={40} borderRadius={8} />
          <div>
            <Skeleton width={100} height={14} style={{ marginBottom: 8 }} />
            <Skeleton width={60} height={12} />
          </div>
        </Space>
      </Card>
    </Col>
  );
}

export default function ComboList() {
  const navigate = useNavigate();
  const { combos, sharedCombos, isLoading, fetchCombos, fetchSharedCombos } = useComboStore();

  useEffect(() => {
    fetchCombos();
    fetchSharedCombos();
  }, [fetchCombos, fetchSharedCombos]);

  const privateCombos = combos.filter((c) => !c.isShared);
  const mySharedCombos = combos.filter((c) => c.isShared);

  const renderComboCard = (combo: { id: number; name: string; icon: string; color: string; todoCount: number; isShared: boolean; memberCount?: number }) => (
    <Col xs={24} sm={12} md={8} key={combo.id}>
      <Card
        hoverable
        style={{ borderRadius: 12, borderLeft: `4px solid ${combo.color}` }}
        onClick={() => navigate(`/combos/${combo.id}`)}
      >
        <Space>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: combo.color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            {combo.isShared ? <TeamOutlined style={{ color: combo.color }} /> : <TIcon name={combo.icon} size={20} style={{ color: combo.color }} />}
          </div>
          <div>
            <Text strong>{combo.name}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>{combo.todoCount} 个待办{combo.isShared && combo.memberCount ? ` · ${combo.memberCount} 人` : ''}</Text>
            </div>
          </div>
        </Space>
      </Card>
    </Col>
  );

  const renderSkeletonGrid = () => (
    <Row gutter={[12, 12]}>
      {Array.from({ length: 6 }).map((_, i) => <ComboCardSkeleton key={i} />)}
    </Row>
  );

  return (
    <div className="animate-fade-in">
      <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
        <Title level={4} style={{ marginBottom: 0 }}>我的组合</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/combos/new')}>
          新建组合
        </Button>
      </Space>

      {isLoading ? renderSkeletonGrid() : (
        <Tabs
          items={[
            {
              key: 'private',
              label: `私有组合 (${privateCombos.length})`,
              children: privateCombos.length > 0 ? (
                <Row gutter={[12, 12]} className="animate-stagger">{privateCombos.map(renderComboCard)}</Row>
              ) : (
                <Card style={{ borderRadius: 12 }}><Empty description="暂无私有组合" /></Card>
              ),
            },
            {
              key: 'shared',
              label: `共享组合 (${mySharedCombos.length})`,
              children: mySharedCombos.length > 0 ? (
                <Row gutter={[12, 12]} className="animate-stagger">{mySharedCombos.map(renderComboCard)}</Row>
              ) : (
                <Card style={{ borderRadius: 12 }}><Empty description="暂无共享组合" /></Card>
              ),
            },
            {
              key: 'joined',
              label: `加入的 (${sharedCombos.length})`,
              children: sharedCombos.length > 0 ? (
                <Row gutter={[12, 12]} className="animate-stagger">{sharedCombos.map(renderComboCard)}</Row>
              ) : (
                <Card style={{ borderRadius: 12 }}><Empty description="暂未加入共享组合" /></Card>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
