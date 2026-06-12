import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Typography, Space, Button, Spin, Tag, List, Empty, Modal, Form, Input,
  Select, DatePicker, message, Popconfirm, Avatar, Tabs, Badge, Tooltip, Upload, Image,
} from 'antd';
import {
  ArrowLeftOutlined, EditOutlined, DeleteOutlined,
  PlusOutlined, CheckOutlined, CopyOutlined, UserOutlined, CrownOutlined,
  LogoutOutlined, MessageOutlined, EnvironmentOutlined, AimOutlined,
} from '@ant-design/icons';
import type { UploadFile, RcFile } from 'antd/es/upload';
import { useComboStore, useAuthStore } from '../../stores';
import { commentApi } from '../../services';
import TIcon from '../../components/ui/TIcon';
import { Skeleton, SkeletonCard } from '../../components/ui/Skeleton';
import type { SharedTodo, ComboMember, Comment, LocationInfo } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const IMAGE_UPLOAD_URL = 'https://img.scdn.io/api/v1.php';
const MAX_IMAGES = 9;
const MAX_FILE_SIZE = 2 * 1024 * 1024;

export default function ComboDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    currentCombo, setCurrentComboById, deleteCombo,
    members, fetchMembers, setMemberRole, removeMember, leaveCombo,
    joinRequests, fetchJoinRequests, approveRequest, rejectRequest,
    createSharedTodo, updateSharedTodo, completeSharedTodo, deleteSharedTodo,
  } = useComboStore();
  const { user } = useAuthStore();

  const [todoFormOpen, setTodoFormOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<SharedTodo | null>(null);
  const [todoForm] = Form.useForm();
  const [creatingTodo, setCreatingTodo] = useState(false);
  const [assignType, setAssignType] = useState<string>('all');

  // Comment state
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentTodoId, setCommentTodoId] = useState<number | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: number; nickname: string } | null>(null);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Image upload state
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Location state
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      setCurrentComboById(Number(id));
    }
  }, [id, setCurrentComboById]);

  useEffect(() => {
    if (currentCombo?.isShared) {
      fetchMembers(currentCombo.id);
      if (currentCombo.userRole === 'owner' || currentCombo.userRole === 'admin') {
        fetchJoinRequests(currentCombo.id);
      }
    }
  }, [currentCombo?.id, currentCombo?.isShared, currentCombo?.userRole, fetchMembers, fetchJoinRequests]);

  if (!currentCombo) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
        <Skeleton width={80} height={32} style={{ marginBottom: 16 }} />
        <SkeletonCard lines={2} style={{ marginBottom: 16 }} />
        <SkeletonCard lines={4} />
      </div>
    );
  }

  const combo = currentCombo;
  const isOwnerOrAdmin = combo.userRole === 'owner' || combo.userRole === 'admin';
  const isOwner = combo.userRole === 'owner';

  const handleDelete = async () => {
    await deleteCombo(combo.id);
    navigate('/combos');
  };

  const handleLeave = async () => {
    await leaveCombo(combo.id);
    message.success('已退出组合');
    navigate('/combos');
  };

  const handleCopyCode = () => {
    if (combo.shareCode) {
      navigator.clipboard.writeText(combo.shareCode);
      message.success('邀请码已复制');
    }
  };

  // Image upload helpers
  const compressImage = (file: RcFile): Promise<File | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 1920;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width > height) { height = (height / width) * maxSize; width = maxSize; }
            else { width = (width / height) * maxSize; height = maxSize; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
              resolve(blob ? new File([blob], file.name, { type: 'image/jpeg' }) : null);
            }, 'image/jpeg', 0.8);
          } else { resolve(null); }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const doUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch(IMAGE_UPLOAD_URL, { method: 'POST', body: formData });
      const data = await res.json();
      const url = data.url || data.data?.url;
      if (url) {
        setUploadedUrls((prev) => [...prev, url]);
        setFileList((prev) => [...prev, { uid: String(Date.now()), name: file.name, status: 'done', url }]);
        message.success('图片上传成功');
      } else {
        message.error('图片上传失败');
      }
    } catch {
      message.error('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = async (file: RcFile) => {
    if (file.size > MAX_FILE_SIZE) {
      const compressed = await compressImage(file);
      if (compressed) await doUpload(compressed);
    } else {
      await doUpload(file);
    }
    return false;
  };

  const handleRemoveImage = (file: UploadFile) => {
    setUploadedUrls((prev) => prev.filter((u) => u !== file.url));
    setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  // Location helpers
  const handleLocationFromBrowser = () => {
    if (!navigator.geolocation) { message.error('浏览器不支持定位'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ name: '当前位置', address: '', latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        message.success('已获取当前位置');
      },
      () => { message.error('获取位置失败'); },
    );
  };

  const handleLocationManual = (values: LocationInfo) => {
    setLocation(values);
    setLocationModalOpen(false);
    locationForm.resetFields();
  };

  const handleOpenCreateTodo = () => {
    setEditingTodo(null);
    setAssignType('all');
    todoForm.resetFields();
    todoForm.setFieldsValue({ assignType: 'all' });
    setFileList([]);
    setUploadedUrls([]);
    setLocation(null);
    setTodoFormOpen(true);
  };

  const handleOpenEditTodo = (todo: SharedTodo) => {
    setEditingTodo(todo);
    setAssignType(todo.assignType);
    todoForm.setFieldsValue({
      text: todo.text,
      assignType: todo.assignType,
      setDate: todo.setDate ? dayjs(todo.setDate) : null,
      setTime: todo.setTime,
      remarks: todo.remarks,
    });
    if (todo.images && todo.images.length > 0) {
      setUploadedUrls(todo.images);
      setFileList(todo.images.map((url, i) => ({ uid: String(i), name: `image-${i}`, status: 'done', url })));
    } else {
      setFileList([]);
      setUploadedUrls([]);
    }
    setLocation(todo.location || null);
    setTodoFormOpen(true);
  };

  const handleTodoFormSubmit = async (values: { text: string; setDate?: dayjs.Dayjs; setTime?: string; remarks?: string; assignType?: string; assignUserIds?: number[] }) => {
    setCreatingTodo(true);
    try {
      const data: Record<string, unknown> = {
        text: values.text,
        setDate: values.setDate?.format('YYYY-MM-DD'),
        setTime: values.setTime,
        remarks: values.remarks,
        assignType: values.assignType || 'all',
        assignUserIds: values.assignType === 'specific' ? values.assignUserIds : undefined,
        images: uploadedUrls.length > 0 ? uploadedUrls : undefined,
        location: location || undefined,
      };

      if (editingTodo) {
        await updateSharedTodo(combo.id, editingTodo.id, data);
        message.success('共享待办已更新');
      } else {
        await createSharedTodo(combo.id, data);
        message.success('共享待办已创建');
      }
      setTodoFormOpen(false);
      todoForm.resetFields();
      setEditingTodo(null);
    } catch {
      // handled
    } finally {
      setCreatingTodo(false);
    }
  };

  const handleCompleteTodo = async (todoId: number) => {
    await completeSharedTodo(combo.id, todoId);
  };

  const handleDeleteTodo = async (todoId: number) => {
    await deleteSharedTodo(combo.id, todoId);
    message.success('已删除');
  };

  const handleRemoveMember = async (userId: number) => {
    await removeMember(combo.id, userId);
    message.success('已移除');
  };

  const handleChangeRole = async (userId: number, role: string) => {
    await setMemberRole(combo.id, userId, role);
    message.success('角色已更新');
  };

  // Comment functions
  const handleOpenComments = async (todoId: number) => {
    setCommentTodoId(todoId);
    setCommentModalOpen(true);
    setReplyTo(null);
    setCommentText('');
    await loadComments(todoId);
  };

  const loadComments = async (todoId: number) => {
    setCommentLoading(true);
    try {
      const res = await commentApi.getList(todoId);
      if (res.success) {
        setComments(res.comments || []);
      }
    } catch {
      // handled
    } finally {
      setCommentLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !commentTodoId) return;
    setSubmittingComment(true);
    try {
      const data: { content: string; parentId?: number; replyToUserId?: number } = {
        content: commentText.trim(),
      };
      if (replyTo) {
        data.parentId = replyTo.id;
        data.replyToUserId = replyTo.id;
      }
      const res = await commentApi.create(commentTodoId, data);
      if (res.success) {
        setCommentText('');
        setReplyTo(null);
        await loadComments(commentTodoId);
      }
    } catch {
      // handled
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await commentApi.delete(commentId);
      if (commentTodoId) await loadComments(commentTodoId);
      message.success('已删除');
    } catch {
      // handled
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} style={{ marginLeft: isReply ? 32 : 0, marginBottom: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <Avatar src={comment.avatarUrl} icon={<UserOutlined />} size={isReply ? 24 : 32} style={{ backgroundColor: '#00b26a', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div>
            <Text strong style={{ fontSize: 13 }}>{comment.nickname || '用户'}</Text>
            {comment.replyToNickname && (
              <Text type="secondary" style={{ fontSize: 12 }}> 回复 {comment.replyToNickname}</Text>
            )}
            <Text type="secondary" style={{ fontSize: 11, marginLeft: 8 }}>{comment.createdAt?.slice(0, 16)}</Text>
          </div>
          <Text style={{ fontSize: 14, lineHeight: 1.6 }}>{comment.content}</Text>
          <div style={{ marginTop: 4 }}>
            <Button type="link" size="small" style={{ padding: 0, fontSize: 12 }}
              onClick={() => setReplyTo({ id: comment.userId, nickname: comment.nickname })}
            >
              回复
            </Button>
            {comment.canDelete && (
              <Popconfirm title="确定删除？" onConfirm={() => handleDeleteComment(comment.id)}>
                <Button type="link" danger size="small" style={{ padding: 0, fontSize: 12 }}>删除</Button>
              </Popconfirm>
            )}
          </div>
          {comment.replies?.map((reply) => renderComment(reply, true))}
        </div>
      </div>
    </div>
  );

  const renderSharedTodo = (todo: SharedTodo) => {
    const isCompleted = todo.myCompletedAt !== null && todo.myCompletedAt > 0;
    return (
      <List.Item
        key={todo.id}
        style={{ opacity: isCompleted ? 0.6 : 1 }}
        actions={[
          <Tooltip key="comment" title="评论">
            <Button type="text" size="small" icon={<MessageOutlined />} onClick={() => handleOpenComments(todo.id)} />
          </Tooltip>,
          !isCompleted && (
            <Tooltip key="complete" title="标记完成">
              <Button type="text" size="small" icon={<CheckOutlined />} onClick={() => handleCompleteTodo(todo.id)} />
            </Tooltip>
          ),
          isOwnerOrAdmin && (
            <Tooltip key="edit" title="编辑">
              <Button type="text" size="small" icon={<EditOutlined />} onClick={() => handleOpenEditTodo(todo)} />
            </Tooltip>
          ),
          isOwnerOrAdmin && (
            <Popconfirm key="delete" title="确定删除此待办？" onConfirm={() => handleDeleteTodo(todo.id)}>
              <Button type="text" danger size="small" icon={<DeleteOutlined />} />
            </Popconfirm>
          ),
        ].filter(Boolean)}
      >
        <List.Item.Meta
          title={
            <Space>
              <Text delete={isCompleted} style={{ cursor: 'pointer' }} onClick={() => handleOpenEditTodo(todo)}>{todo.text}</Text>
              <Tag color={todo.assignType === 'all' ? 'blue' : todo.assignType === 'any' ? 'green' : 'orange'} style={{ fontSize: 11 }}>
                {todo.assignType === 'all' ? '全员' : todo.assignType === 'any' ? '任一' : '指定'}
              </Tag>
            </Space>
          }
          description={
            <Space size={4} wrap>
              {todo.setDate && <Text type="secondary" style={{ fontSize: 12 }}>{todo.setDate}{todo.setTime ? ` ${todo.setTime}` : ''}</Text>}
              {todo.location && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  <EnvironmentOutlined style={{ marginRight: 2 }} />{todo.location.name}
                </Text>
              )}
              {todo.images && todo.images.length > 0 && (
                <Text type="secondary" style={{ fontSize: 12 }}>📷 {todo.images.length}</Text>
              )}
              {todo.assignCount > 0 && <Text type="secondary" style={{ fontSize: 12 }}>{todo.completedCount}/{todo.assignCount} 完成</Text>}
              {todo.creator && <Text type="secondary" style={{ fontSize: 12 }}>by {todo.creator.nickname}</Text>}
            </Space>
          }
        />
      </List.Item>
    );
  };

  const renderMember = (member: ComboMember) => (
    <List.Item
      key={member.id}
      actions={isOwner && member.id !== user?.id ? [
        <Select
          key="role"
          value={member.role}
          size="small"
          style={{ width: 80 }}
          onChange={(v) => handleChangeRole(member.id, v)}
          options={[
            { label: '管理', value: 'admin' },
            { label: '成员', value: 'member' },
          ]}
        />,
        <Popconfirm key="remove" title="确定移除此成员？" onConfirm={() => handleRemoveMember(member.id)}>
          <Button type="link" danger size="small">移除</Button>
        </Popconfirm>,
      ] : undefined}
    >
      <List.Item.Meta
        avatar={<Avatar src={member.avatarUrl} icon={<UserOutlined />} size={36} style={{ backgroundColor: '#00b26a' }} />}
        title={
          <Space>
            <Text>{member.nickname || '未设置'}</Text>
            {member.role === 'owner' && <Tag color="gold" icon={<CrownOutlined />} style={{ fontSize: 11 }}>超管</Tag>}
            {member.role === 'admin' && <Tag color="blue" style={{ fontSize: 11 }}>管理</Tag>}
          </Space>
        }
        description={<Text type="secondary" style={{ fontSize: 12 }}>加入于 {member.joinedAt?.slice(0, 10)}</Text>}
      />
    </List.Item>
  );

  const getTabItems = () => {
    const items = [
      {
        key: 'todos',
        label: `共享待办 (${combo.sharedTodos?.length || 0})`,
        children: (
          <>
            <div style={{ marginBottom: 12, textAlign: 'right' }}>
              <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleOpenCreateTodo}>
                新建共享待办
              </Button>
            </div>
            {combo.sharedTodos && combo.sharedTodos.length > 0 ? (
              <List
                dataSource={combo.sharedTodos}
                renderItem={renderSharedTodo}
                size="small"
              />
            ) : (
              <Empty description="暂无共享待办" />
            )}
          </>
        ),
      },
      {
        key: 'members',
        label: `成员 (${members.length})`,
        children: (
          <List
            dataSource={members}
            renderItem={renderMember}
            size="small"
          />
        ),
      },
    ];
    if (isOwnerOrAdmin && joinRequests.length > 0) {
      items.push({
        key: 'requests',
        label: <Badge count={joinRequests.length} size="small">加入申请</Badge>,
        children: (
          <List
            dataSource={joinRequests}
            renderItem={(req) => (
              <List.Item
                key={req.id}
                actions={[
                  <Button key="approve" type="primary" size="small" onClick={() => { approveRequest(req.id); message.success('已通过'); }}>通过</Button>,
                  <Button key="reject" size="small" danger onClick={() => { rejectRequest(req.id); message.info('已拒绝'); }}>拒绝</Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={req.avatarUrl} icon={<UserOutlined />} size={36} />}
                  title={req.nickname}
                  description={req.message || '请求加入组合'}
                />
              </List.Item>
            )}
            size="small"
          />
        ),
      });
    }
    return items;
  };

  return (
    <div className="animate-fade-in">
      <Space style={{ marginBottom: 16 }} wrap>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/combos')}>返回</Button>
        {isOwnerOrAdmin && (
          <Button icon={<EditOutlined />} onClick={() => navigate(`/combos/${id}/edit`)}>编辑</Button>
        )}
        {isOwner && (
          <Popconfirm title="确定删除此组合？" description="共享待办将一并删除" onConfirm={handleDelete}>
            <Button icon={<DeleteOutlined />} danger>删除</Button>
          </Popconfirm>
        )}
        {!isOwner && combo.isShared && (
          <Popconfirm title="确定退出此组合？" onConfirm={handleLeave}>
            <Button icon={<LogoutOutlined />} danger>退出</Button>
          </Popconfirm>
        )}
      </Space>

      {/* Combo info card */}
      <Card style={{ borderRadius: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: combo.color + '15',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <TIcon name={combo.icon || 'folder'} size={28} style={{ color: combo.color }} />
          </div>
          <div>
            <Title level={4} style={{ marginBottom: 0 }}>{combo.name}</Title>
            {combo.description && <Text type="secondary">{combo.description}</Text>}
          </div>
        </div>

        <Space wrap>
          <Tag color={combo.isShared ? 'blue' : 'green'}>{combo.isShared ? '共享' : '私有'}</Tag>
          <Text type="secondary">{combo.todoCount} 个待办</Text>
          {combo.isShared && combo.memberCount !== undefined && (
            <Text type="secondary">· {combo.memberCount} 位成员</Text>
          )}
          {combo.isShared && combo.userRole && (
            <Tag color={isOwner ? 'gold' : combo.userRole === 'admin' ? 'blue' : 'default'}>
              {isOwner ? '超管' : combo.userRole === 'admin' ? '管理' : '成员'}
            </Tag>
          )}
        </Space>

        {/* Invite code */}
        {combo.isShared && combo.shareCode && (
          <div style={{ marginTop: 16, padding: '12px 16px', background: '#f6ffed', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Space>
              <Text strong>邀请码：</Text>
              <Text copyable style={{ fontSize: 18, letterSpacing: 4, fontFamily: 'monospace' }}>{combo.shareCode}</Text>
            </Space>
            <Button size="small" icon={<CopyOutlined />} onClick={handleCopyCode}>复制</Button>
          </div>
        )}
      </Card>

      {/* Tabs for shared content */}
      {combo.isShared ? (
        <Card style={{ borderRadius: 12 }}>
          <Tabs items={getTabItems()} />
        </Card>
      ) : (
        <Card style={{ borderRadius: 12 }}>
          <Empty description="私有组合暂无共享内容" />
        </Card>
      )}

      {/* Create/Edit shared todo modal */}
      <Modal
        title={editingTodo ? '编辑共享待办' : '新建共享待办'}
        open={todoFormOpen}
        onCancel={() => { setTodoFormOpen(false); setEditingTodo(null); }}
        footer={null}
        width={500}
      >
        <Form form={todoForm} layout="vertical" onFinish={handleTodoFormSubmit} initialValues={{ assignType: 'all' }}>
          <Form.Item name="text" label="待办内容" rules={[{ required: true, message: '请输入待办内容' }]}>
            <Input placeholder="输入待办内容" />
          </Form.Item>
          <Form.Item name="assignType" label="完成方式">
            <Select
              onChange={(v) => setAssignType(v)}
              options={[
                { label: '全员完成', value: 'all' },
                { label: '任一完成', value: 'any' },
                { label: '指定成员', value: 'specific' },
              ]}
            />
          </Form.Item>
          {assignType === 'specific' && (
            <Form.Item name="assignUserIds" label="指定成员">
              <Select
                mode="multiple"
                placeholder="选择成员"
                options={members.filter((m) => m.role !== 'owner').map((m) => ({
                  label: m.nickname || `用户${m.id}`,
                  value: m.id,
                }))}
              />
            </Form.Item>
          )}
          <Form.Item name="setDate" label="日期">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="setTime" label="时间">
            <Input placeholder="HH:mm" />
          </Form.Item>
          <Form.Item name="remarks" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
          {/* Location */}
          <Form.Item label="位置">
            {location ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
                <Space>
                  <EnvironmentOutlined style={{ color: '#00b26a' }} />
                  <span>{location.name}{location.address ? ` - ${location.address}` : ''}</span>
                </Space>
                <Button type="text" size="small" icon={<DeleteOutlined />} onClick={() => setLocation(null)} />
              </div>
            ) : (
              <Space>
                <Button icon={<AimOutlined />} onClick={handleLocationFromBrowser}>获取当前位置</Button>
                <Button icon={<EnvironmentOutlined />} onClick={() => setLocationModalOpen(true)}>手动输入</Button>
              </Space>
            )}
          </Form.Item>
          {/* Images */}
          <Form.Item label={`图片 (${uploadedUrls.length}/${MAX_IMAGES})`}>
            <Upload listType="picture-card" fileList={fileList} beforeUpload={handleUpload} onRemove={handleRemoveImage} multiple accept="image/*">
              {fileList.length >= MAX_IMAGES ? null : (
                <div><PlusOutlined /><div style={{ marginTop: 8, fontSize: 12 }}>上传</div></div>
              )}
            </Upload>
            {uploading && <Spin size="small" style={{ marginLeft: 8 }} />}
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={creatingTodo}>
                {editingTodo ? '保存' : '创建'}
              </Button>
              <Button onClick={() => { setTodoFormOpen(false); setEditingTodo(null); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Comment modal */}
      <Modal
        title="评论"
        open={commentModalOpen}
        onCancel={() => { setCommentModalOpen(false); setReplyTo(null); }}
        footer={null}
        width={500}
      >
        <Spin spinning={commentLoading}>
          {comments.length > 0 ? (
            <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 16 }}>
              {comments.map((c) => renderComment(c))}
            </div>
          ) : (
            <Empty description="暂无评论" style={{ marginBottom: 16 }} />
          )}
        </Spin>
        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
          {replyTo && (
            <div style={{ marginBottom: 8 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>回复 {replyTo.nickname}</Text>
              <Button type="link" size="small" onClick={() => setReplyTo(null)} style={{ padding: 0, marginLeft: 8 }}>取消</Button>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Input.TextArea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyTo ? `回复 ${replyTo.nickname}...` : '写评论...'}
              rows={2}
              maxLength={500}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              loading={submittingComment}
              onClick={handleSubmitComment}
              disabled={!commentText.trim()}
            >
              发送
            </Button>
          </div>
        </div>
      </Modal>

      {/* Location Manual Input Modal */}
      <Modal title="手动输入位置" open={locationModalOpen} onCancel={() => setLocationModalOpen(false)} footer={null}>
        <Form form={locationForm} layout="vertical" onFinish={handleLocationManual}>
          <Form.Item name="name" label="地点名称" rules={[{ required: true }]}>
            <Input placeholder="例如：星巴克" />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input placeholder="例如：北京市朝阳区xxx" />
          </Form.Item>
          <div style={{ display: 'flex', gap: 16 }}>
            <Form.Item name="latitude" label="纬度" style={{ flex: 1 }}>
              <Input type="number" placeholder="39.9" />
            </Form.Item>
            <Form.Item name="longitude" label="经度" style={{ flex: 1 }}>
              <Input type="number" placeholder="116.4" />
            </Form.Item>
          </div>
          <Form.Item>
            <Button type="primary" htmlType="submit">确定</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
