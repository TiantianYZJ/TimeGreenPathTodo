import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Result, Button, Typography, Space, Card, Input, message } from 'antd';
import { QrcodeOutlined, TeamOutlined, LinkOutlined } from '@ant-design/icons';
import { FolderIcon } from 'tdesign-icons-react';
import { useComboStore } from '@/stores/comboStore';
import { collabApi } from '@/services';

const { Title, Text, Paragraph } = Typography;

const CollabJoin: React.FC = () => {
  const navigate = useNavigate();
  const sharedCombos = useComboStore((state) => state.sharedCombos);
  const fetchSharedCombos = useComboStore((state) => state.fetchSharedCombos);
  const [inviteCode, setInviteCode] = React.useState('');

  useEffect(() => {
    fetchSharedCombos().catch(console.error);
  }, [fetchSharedCombos]);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      message.warning('请输入邀请码');
      return;
    }
    try {
      await collabApi.autoJoin(inviteCode.trim());
      message.success('成功加入共享组合！');
      fetchSharedCombos().catch(console.error);
      setInviteCode('');
    } catch (error: any) {
      message.error(error?.response?.data?.message || '加入失败，请检查邀请码');
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
      <Title level={3} style={{ marginBottom: 24 }}>
        <TeamOutlined style={{ marginRight: 8, color: '#1677ff' }} />
        协作中心
      </Title>

      <Card
        title="加入共享组合"
        style={{ marginBottom: 24 }}
        extra={<LinkOutlined />}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Paragraph type="secondary">
            输入邀请码即可加入他人的共享组合，共同管理待办事项。
          </Paragraph>
          <Space.Compact style={{ width: '100%' }}>
            <Input
              placeholder="请输入8位邀请码"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              onPressEnter={handleJoin}
              maxLength={8}
              style={{ flex: 1 }}
            />
            <Button type="primary" onClick={handleJoin}>
              加入
            </Button>
          </Space.Compact>
        </Space>
      </Card>

      <Card title={`已加入的共享组合 (${sharedCombos.length})`}>
        {sharedCombos.length === 0 ? (
          <Result
            icon={<TeamOutlined style={{ color: '#ccc' }} />}
            title="暂未加入任何共享组合"
            subTitle="通过上方邀请码加入，或让他人分享组合给你"
            extra={
              <Button type="link" onClick={() => navigate('/combos')}>
                前往我的组合查看 →
              </Button>
            }
          />
        ) : (
          sharedCombos.map((combo) => (
            <Card
              key={combo.id}
              size="small"
              style={{ marginBottom: 12 }}
              hoverable
              onClick={() => navigate(`/combos/${combo.id}`)}
            >
              <Space>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: `${combo.color}18`,
                  color: combo.color,
                }}>
                  <FolderIcon size="1em" />
                </span>
                <div>
                  <Text strong>{combo.name}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    邀请码：{combo.share_code || '-'}
                  </Text>
                </div>
              </Space>
            </Card>
          ))
        )}
      </Card>
    </div>
  );
};

export default CollabJoin;
