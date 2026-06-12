import { Card, Typography, Space, Avatar, Descriptions, Button, Progress, message } from 'antd';
import { UserOutlined, EditOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore, useTodoStore } from '../../stores';
import { useState } from 'react';
import { authApi } from '../../services';

const { Title, Text } = Typography;

export default function UserCenter() {
  const { user, logout, updateUserInfo } = useAuthStore();
  const { todos } = useTodoStore();
  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');

  const completedCount = todos.filter((t) => t.completed > 0).length;
  const totalCount = todos.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleSave = async () => {
    if (!nickname.trim()) {
      message.warning('昵称不能为空');
      return;
    }
    await updateUserInfo({ nickname: nickname.trim() });
    message.success('更新成功');
    setEditing(false);
  };

  const handleIncreaseLimit = async () => {
    try {
      const res = await authApi.increaseTodoLimit(10);
      if (res.success) {
        message.success(`待办上限增加至 ${res.todoLimit}`);
        const userInfo = await authApi.getUserInfo();
        if (userInfo.success) {
          useAuthStore.getState().setUser(userInfo.user);
        }
      }
    } catch {
      // handled
    }
  };

  if (!user) return null;

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>个人中心</Title>

      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space size={24} align="start">
          <Avatar src={user.avatarUrl} icon={<UserOutlined />} size={80} style={{ backgroundColor: '#00b26a' }} />
          <div>
            {editing ? (
              <Space>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  style={{ fontSize: 20, fontWeight: 600, border: '1px solid #d9d9d9', borderRadius: 6, padding: '4px 8px' }}
                />
                <Button type="primary" size="small" onClick={handleSave}>保存</Button>
                <Button size="small" onClick={() => setEditing(false)}>取消</Button>
              </Space>
            ) : (
              <Space>
                <Title level={4} style={{ marginBottom: 0 }}>{user.nickname}</Title>
                <Button type="text" icon={<EditOutlined />} onClick={() => setEditing(true)} />
              </Space>
            )}
            <div>
              <Text type="secondary">ID: {user.id}</Text>
            </div>
            {user.isAdmin && (
              <div style={{ marginTop: 4 }}>
                <span style={{ background: '#faad14', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>管理员</span>
              </div>
            )}
          </div>
        </Space>
      </Card>

      <Card title="使用额度" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>待办上限</Text>
              <Text>{totalCount} / {user.todoLimit}</Text>
            </div>
            <Progress percent={Math.round((totalCount / user.todoLimit) * 100)} strokeColor="#00b26a" />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>组合上限</Text>
              <Text>{user.comboLimit}</Text>
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text>共享组合上限</Text>
              <Text>{user.collabLimit}</Text>
            </div>
          </div>
          <Button type="dashed" block onClick={handleIncreaseLimit}>
            观看广告增加待办上限 (+10)
          </Button>
        </Space>
      </Card>

      <Card title="数据概览" style={{ borderRadius: 12, marginBottom: 16 }}>
        <Descriptions column={1} size="small">
          <Descriptions.Item label="总待办数">{totalCount}</Descriptions.Item>
          <Descriptions.Item label="已完成">{completedCount}</Descriptions.Item>
          <Descriptions.Item label="完成率">{completionRate}%</Descriptions.Item>
        </Descriptions>
      </Card>

      <Button danger icon={<LogoutOutlined />} block onClick={logout}>
        退出登录
      </Button>
    </div>
  );
}
