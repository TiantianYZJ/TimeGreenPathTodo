import { useEffect, useState } from 'react';
import {
  Typography, Button, Card, Progress, Input, Select,
  Empty, Checkbox, Dropdown, message, Space, Tooltip,
} from 'antd';
import {
  PlusOutlined, SearchOutlined, StarOutlined, StarFilled,
  DeleteOutlined, CheckCircleOutlined, ClockCircleOutlined,
  MoreOutlined, EditOutlined, FilterOutlined, EnvironmentOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTodoStore, useTagStore, useComboStore, useUIStore } from '../../stores';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonList } from '../../components/ui/Skeleton';
import dayjs from 'dayjs';

const { Text } = Typography;

function highlightText(text: string, keyword: string): React.ReactNode {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? <mark key={i} style={{ background: '#ffd666', padding: 0, borderRadius: 2 }}>{part}</mark> : part,
  );
}

export default function TodoList() {
  const navigate = useNavigate();
  const { todos, isLoading, fetchTodos, toggleComplete, toggleStar, deleteTodo, setFilter, filter, selectedIds, toggleSelect, selectAll, clearSelection, batchDelete, getFilteredTodos } = useTodoStore();
  const { fetchAllTags, getAllTags } = useTagStore();
  const { combos, sharedCombos, fetchCombos, fetchSharedCombos } = useComboStore();
  const { isMobile } = useUIStore();
  const [keyword, setKeyword] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const debouncedKeyword = useDebounce(keyword, 300);

  useEffect(() => {
    fetchTodos();
    fetchAllTags();
    fetchCombos();
    fetchSharedCombos();
  }, [fetchTodos, fetchAllTags, fetchCombos, fetchSharedCombos]);

  useEffect(() => {
    setFilter({ keyword: debouncedKeyword || undefined });
  }, [debouncedKeyword, setFilter]);

  const filteredTodos = getFilteredTodos();
  const allTags = getAllTags();

  const totalCount = todos.length;
  const completedCount = todos.filter((t) => t.completed > 0).length;
  const uncompletedCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const greeting = (() => {
    const h = dayjs().hour();
    if (h < 6) return '夜深了';
    if (h < 12) return '早上好';
    if (h < 14) return '中午好';
    if (h < 18) return '下午好';
    return '晚上好';
  })();

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;
    await batchDelete(Array.from(selectedIds));
    message.success(`已删除 ${selectedIds.size} 个待办`);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960, margin: '0 auto' }}>
      {/* Hero section: greeting + stats */}
      <div
        style={{
          background: 'linear-gradient(135deg, #00b26a 0%, #00c97a 100%)',
          borderRadius: 16,
          padding: isMobile ? '20px 20px' : '28px 32px',
          marginBottom: 24,
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -40,
            right: -30,
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -50,
            right: 80,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, marginBottom: 4 }}>
            {greeting}
          </div>
          <div style={{ opacity: 0.85, fontSize: 14, marginBottom: 20 }}>
            {dayjs().format('YYYY年M月D日 dddd')}
          </div>

          {/* Stats row inside hero */}
          <div
            style={{
              display: 'flex',
              gap: isMobile ? 12 : 24,
              flexWrap: 'wrap',
            }}
          >
            <div style={{ flex: 1, minWidth: isMobile ? '45%' : 120 }}>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{totalCount}</div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>全部待办</div>
            </div>
            <div style={{ flex: 1, minWidth: isMobile ? '45%' : 120 }}>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ClockCircleOutlined style={{ fontSize: 18 }} />
                {uncompletedCount}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>待完成</div>
            </div>
            <div style={{ flex: 1, minWidth: isMobile ? '45%' : 120 }}>
              <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircleOutlined style={{ fontSize: 18 }} />
                {completedCount}
              </div>
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>已完成</div>
            </div>
            <div style={{ flex: 1, minWidth: isMobile ? '45%' : 120 }}>
              <Progress
                type="circle"
                percent={completionRate}
                size={isMobile ? 48 : 52}
                strokeColor="#fff"
                trailColor="rgba(255,255,255,0.2)"
                format={(p) => <span style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{p}%</span>}
              />
              <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>完成率</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        {/* Search */}
        <Input
          placeholder="搜索待办..."
          prefix={<SearchOutlined style={{ color: '#999' }} />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          allowClear
          style={{
            flex: 1,
            minWidth: isMobile ? '100%' : 200,
            borderRadius: 10,
            height: 40,
          }}
        />

        {/* Filter toggle */}
        <Tooltip title="筛选">
          <Button
            icon={<FilterOutlined />}
            onClick={() => setShowFilters(!showFilters)}
            style={{
              borderRadius: 10,
              height: 40,
              width: 40,
              ...(showFilters && { color: '#00b26a', borderColor: '#00b26a' }),
            }}
          />
        </Tooltip>

        {/* New todo - primary CTA */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/todo/new')}
          style={{
            borderRadius: 10,
            height: 40,
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(0,178,106,0.35)',
          }}
        >
          {isMobile ? '新建' : '新建待办'}
        </Button>
      </div>

      {/* Filter row (collapsible) */}
      {showFilters && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <Select
            value={filter.status}
            onChange={(v) => setFilter({ status: v })}
            style={{ width: 120 }}
            options={[
              { value: 'all', label: '全部状态' },
              { value: 'uncompleted', label: '待完成' },
              { value: 'completed', label: '已完成' },
            ]}
          />
          <Select
            value={filter.tagIds?.length ? filter.tagIds : undefined}
            onChange={(v) => setFilter({ tagIds: v ? [v] : undefined })}
            placeholder="按标签筛选"
            allowClear
            style={{ width: 150 }}
            options={allTags.map((t) => ({
              value: t.id,
              label: (
                <Space size={4}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, display: 'inline-block' }} />
                  {t.name}
                </Space>
              ),
            }))}
          />
          <Select
            value={filter.comboId || undefined}
            onChange={(v) => setFilter({ comboId: v || null })}
            placeholder="按组合筛选"
            allowClear
            style={{ width: 150 }}
            options={[
              ...combos.map((c) => ({ value: c.id, label: c.name })),
              ...sharedCombos.map((c) => ({ value: c.id, label: `[共享] ${c.name}` })),
            ]}
          />
          {selectedIds.size > 0 && (
            <Space>
              <Text type="secondary" style={{ fontSize: 13 }}>{selectedIds.size} 项已选</Text>
              <Button size="small" onClick={handleBatchDelete} danger icon={<DeleteOutlined />}>
                批量删除
              </Button>
              <Button size="small" onClick={clearSelection}>取消</Button>
            </Space>
          )}
        </div>
      )}

      {/* Todo list */}
      {isLoading ? (
        <SkeletonList count={5} />
      ) : filteredTodos.length === 0 ? (
          <Card
            style={{
              borderRadius: 16,
              border: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <Empty
              description={keyword ? '没有找到匹配的待办' : '暂无待办事项，开始创建第一个吧'}
            >
              {!keyword && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/todo/new')}
                  style={{ borderRadius: 10 }}
                >
                  新建待办
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <div className="animate-stagger"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {filteredTodos.map((todo, index) => {
              const isCompleted = todo.completed > 0;
              return (
                <Card
                  key={todo.id}
                  size="small"
                  hoverable
                  style={{
                    borderRadius: 12,
                    border: 'none',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    opacity: isCompleted ? 0.65 : 1,
                    animationDelay: `${index * 30}ms`,
                    transition: 'all 0.2s ease',
                  }}
                  styles={{ body: { padding: '12px 16px' } }}
                  className="animate-fade-in-up"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {/* Checkbox */}
                    <Checkbox
                      checked={isCompleted}
                      onChange={() => toggleComplete(todo.id)}
                    />

                    {/* Content */}
                    <div
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/todo/${todo.id}`)}
                    >
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: isCompleted ? 400 : 500,
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          color: isCompleted ? '#999' : '#1a1a1a',
                          lineHeight: 1.5,
                        }}
                      >
                        {highlightText(todo.text, keyword)}
                      </div>

                      {/* Meta: date + tags + location + images */}
                      {(todo.setDate || todo.tags.length > 0 || todo.location || (todo.images && todo.images.length > 0)) && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                          {todo.setDate && (
                            <span
                              style={{
                                fontSize: 12,
                                color: dayjs(todo.setDate).isBefore(dayjs(), 'day') && !isCompleted
                                  ? '#ff4d4f'
                                  : '#999',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              <ClockCircleOutlined style={{ fontSize: 11 }} />
                              {dayjs(todo.setDate).format('M月D日')}
                            </span>
                          )}
                          {todo.location && (
                            <span style={{ fontSize: 12, color: '#999', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <EnvironmentOutlined style={{ fontSize: 11 }} />
                              {todo.location.name}
                            </span>
                          )}
                          {todo.images && todo.images.length > 0 && (
                            <span style={{ fontSize: 12, color: '#999', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                              <PictureOutlined style={{ fontSize: 11 }} />
                              {todo.images.length}
                            </span>
                          )}
                          {todo.tags.map((tagId) => {
                            const tag = allTags.find((t) => t.id === tagId);
                            return tag ? (
                              <span
                                key={tagId}
                                style={{
                                  fontSize: 11,
                                  color: tag.color,
                                  background: tag.color + '15',
                                  padding: '1px 8px',
                                  borderRadius: 6,
                                  fontWeight: 500,
                                }}
                              >
                                {tag.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Button
                        type="text"
                        size="small"
                        aria-label={todo.isStar ? '取消星标' : '星标'}
                        icon={todo.isStar ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined style={{ color: '#bbb' }} />}
                        onClick={() => toggleStar(todo.id)}
                        style={{ width: 40, height: 40 }}
                      />
                      <Dropdown
                        menu={{
                          items: [
                            { key: 'edit', icon: <EditOutlined />, label: '编辑', onClick: () => navigate(`/todo/${todo.id}/edit`) },
                            { type: 'divider' as const },
                            { key: 'delete', icon: <DeleteOutlined />, label: '删除', danger: true, onClick: () => deleteTodo(todo.id) },
                          ],
                        }}
                        trigger={['click']}
                      >
                        <Button
                          type="text"
                          size="small"
                          aria-label="更多操作"
                          icon={<MoreOutlined style={{ color: '#bbb' }} />}
                          style={{ width: 40, height: 40 }}
                        />
                      </Dropdown>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
    </div>
  );
}
