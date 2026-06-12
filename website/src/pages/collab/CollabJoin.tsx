import { useState } from 'react';
import { Card, Typography, Input, Button, Space, message, Result } from 'antd';
import { SearchOutlined, TeamOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { collabApi } from '../../services';

const { Title, Text } = Typography;

export default function CollabJoin() {
  const navigate = useNavigate();
  const [shareCode, setShareCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<'joined' | 'pending' | 'requested' | null>(null);
  const [comboId, setComboId] = useState<number | null>(null);

  const handleJoin = async () => {
    if (!shareCode.trim()) {
      message.warning('请输入邀请码');
      return;
    }
    setLoading(true);
    try {
      const res = await collabApi.join(shareCode.trim().toUpperCase());
      if (res.success) {
        if (res.isMember) {
          message.success('你已是该组合成员');
          setComboId(res.combo.id);
          setResult('joined');
        } else if (res.hasPendingRequest) {
          setResult('pending');
        } else {
          // Successfully joined
          message.success('加入成功');
          setComboId(res.combo.id);
          setResult('joined');
        }
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async () => {
    if (!shareCode.trim()) return;
    setLoading(true);
    try {
      const res = await collabApi.sendRequest(shareCode.trim().toUpperCase());
      if (res.success) {
        message.success('申请已发送，等待管理员审批');
        setResult('requested');
      }
    } catch {
      // handled
    } finally {
      setLoading(false);
    }
  };

  if (result === 'joined' && comboId) {
    return (
      <div className="animate-fade-in">
        <Card style={{ borderRadius: 12, maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#00b26a' }} />}
            title="加入成功"
            subTitle="你现在可以查看和参与共享待办了"
            extra={
              <Button type="primary" onClick={() => navigate(`/combos/${comboId}`)}>
                查看组合
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  if (result === 'pending' || result === 'requested') {
    return (
      <div className="animate-fade-in">
        <Card style={{ borderRadius: 12, maxWidth: 500, margin: '0 auto', textAlign: 'center', padding: 40 }}>
          <Result
            icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            title={result === 'pending' ? '已提交申请' : '申请已发送'}
            subTitle="等待管理员审批通过后即可加入"
            extra={
              <Space>
                <Button onClick={() => { setResult(null); setShareCode(''); }}>重新输入</Button>
                <Button type="primary" onClick={() => navigate('/combos')}>返回组合列表</Button>
              </Space>
            }
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>加入协作</Title>
      <Card style={{ borderRadius: 12, maxWidth: 500, margin: '0 auto' }}>
        <Space direction="vertical" size={24} style={{ width: '100%', textAlign: 'center' }}>
          <TeamOutlined style={{ fontSize: 48, color: 'var(--color-primary)' }} />
          <div>
            <Title level={5}>输入邀请码加入共享组合</Title>
            <Text type="secondary">请输入6位邀请码</Text>
          </div>
          <Input
            size="large"
            placeholder="输入邀请码"
            value={shareCode}
            onChange={(e) => setShareCode(e.target.value.toUpperCase())}
            maxLength={6}
            style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
            onPressEnter={handleJoin}
          />
          <Space direction="vertical" size={12} style={{ width: '100%' }}>
            <Button
              type="primary"
              size="large"
              block
              icon={<SearchOutlined />}
              loading={loading}
              onClick={handleJoin}
            >
              加入
            </Button>
            <Button
              size="large"
              block
              icon={<ClockCircleOutlined />}
              loading={loading}
              onClick={handleSendRequest}
            >
              申请加入
            </Button>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            如果组合需要审批，请点击「申请加入」等待管理员通过
          </Text>
        </Space>
      </Card>
    </div>
  );
}
