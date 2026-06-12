/**
 * TodoList - 待办列表页（首页）
 *
 * 功能：
 * - 顶部统计概览：总待办数、已完成、未完成、完成率
 * - 筛选栏：Tab切换(全部/未完成/已完成)、搜索框、组合筛选、标签筛选、日期范围
 * - 操作栏：添加待办按钮、批量操作（多选模式）
 * - 桌面端使用 TodoCard 组件网格布局，移动端使用 TodoListItem 单列列表
 * - 进入页面自动调用 fetchTodos()
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Card,
  Button,
  Input,
  Select,
  DatePicker,
  Tabs,
  Statistic,
  Progress,
  Row,
  Col,
  Space,
  Popconfirm,
  message,
  Badge,
  Empty,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useTodo } from '@/hooks/useTodo';
import { useComboStore } from '@/stores/comboStore';
import { useTagStore } from '@/stores/tagStore';
import { useTodoStore } from '@/stores/todoStore';
import { useDeviceType } from '@/hooks/useMediaQuery';
import { useDebounce } from '@/hooks/useDebounce';
import TodoCard from '@/components/business/TodoCard/TodoCard';
import TodoListItem from '@/components/business/TodoListItem/TodoListItem';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton/LoadingSkeleton';
import EmptyState from '@/components/ui/EmptyState/EmptyState';
import type { Todo, TodoFilter } from '@/types/todo';
import styles from './TodoList.module.css';

const { RangePicker } = DatePicker;

/** Tab 键值 */
const STATUS_TABS = [
  { key: 'all', label: '全部' },
  { key: 'uncompleted', label: '未完成' },
  { key: 'completed', label: '已完成' },
] as const;

/**
 * 待办列表页面组件
 *
 * 首页核心组件，展示待办事项的完整管理界面，
 * 支持多维筛选、批量操作和响应式布局。
 */
const TodoList: React.FC = () => {
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();

  // 使用 useTodo hook 获取待办数据和方法
  const {
    todos,
    isLoading,
    statistics,
    selectedIds,
    handleToggle,
    handleDelete,
    setFilter,
    toggleSelect,
    selectAll,
    clearSelection,
    refresh,
  } = useTodo({ autoFetch: true });

  // 收藏切换
  const toggleStar = useTodoStore((state) => state.toggleStar);
  const handleStarToggle = useCallback(
    (id: string) => { toggleStar(id).catch(console.error); },
    [toggleStar]
  );

  // 从 Store 获取组合和标签数据
  const combos = useComboStore((state) => state.combos);
  const allTags = useTagStore((state) => [...state.systemTags, ...state.userTags]);
  const fetchCombos = useComboStore((state) => state.fetchCombos);
  const fetchAllTags = useTagStore((state) => state.fetchAllTags);

  // 初始化获取组合和标签数据
  useEffect(() => {
    fetchCombos().catch(console.error);
    fetchAllTags().catch(console.error);
  }, [fetchCombos, fetchAllTags]);

  // 本地状态
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedComboId, setSelectedComboId] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [batchMode, setBatchMode] = useState(false);

  // 防抖搜索关键词
  const debouncedKeyword = useDebounce(searchKeyword, 300);

  /**
   * 应用所有筛选条件
   */
  const applyFilters = useCallback(() => {
    const filter: Partial<TodoFilter> = {
      status: activeTab as TodoFilter['status'],
      keyword: debouncedKeyword,
      comboId: selectedComboId,
      tagIds: selectedTagIds,
      dateRange: dateRange
        ? [
            dateRange[0]?.format('YYYY-MM-DD') ?? '',
            dateRange[1]?.format('YYYY-MM-DD') ?? '',
          ]
        : null,
    };
    setFilter(filter);
  }, [activeTab, debouncedKeyword, selectedComboId, selectedTagIds, dateRange, setFilter]);

  // 当筛选条件变化时重新应用
  React.useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  /**
   * Tab 切换处理
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  /**
   * 搜索关键词变更
   */
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  /**
   * 组合筛选变更
   */
  const handleComboChange = (value: string | null) => {
    setSelectedComboId(value);
  };

  /**
   * 标签筛选变更
   */
  const handleTagChange = (values: number[]) => {
    setSelectedTagIds(values);
  };

  /**
   * 日期范围变更
   */
  const handleDateRangeChange = (dates: [dayjs.Dayjs | null, dayjs.Dayjs | null] | null) => {
    setDateRange(dates);
  };

  /**
   * 清空所有筛选条件
   */
  const handleClearFilters = () => {
    setActiveTab('all');
    setSearchKeyword('');
    setSelectedComboId(null);
    setSelectedTagIds([]);
    setDateRange(null);
  };

  /**
   * 批量删除确认
   */
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      // 逐个删除
      for (const id of selectedIds) {
        await handleDelete(id);
      }
      message.success(`成功删除 ${selectedIds.length} 个待办`);
      clearSelection();
      setBatchMode(false);
    } catch (error) {
      console.error('批量删除失败:', error);
      message.error('批量删除失败，请重试');
    }
  };

  /**
   * 编辑单个待办
   */
  const handleEdit = (todo: Todo) => {
    navigate(`/todo/${todo.id}/edit`);
  };

  /**
   * 点击待办卡片进入详情
   */
  const handleClickTodo = (todo: Todo) => {
    if (!batchMode) {
      navigate(`/todo/${todo.id}`);
    }
  };

  // 组合选择器选项
  const comboOptions = useMemo(
    () =>
      combos.map((combo) => ({
        value: combo.id.toString(),
        label: combo.name,
      })),
    [combos]
  );

  // 标签选择器选项
  const tagOptions = useMemo(
    () =>
      allTags.map((tag) => ({
        value: tag.id,
        label: tag.name,
      })),
    [allTags]
  );

  // 是否有激活的筛选条件
  const hasActiveFilters =
    activeTab !== 'all' ||
    searchKeyword.trim() !== '' ||
    selectedComboId !== null ||
    selectedTagIds.length > 0 ||
    dateRange !== null;

  // 加载状态渲染
  if (isLoading && todos.length === 0) {
    return (
      <div className={styles.pageContainer}>
        <LoadingSkeleton type="todo" count={6} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* ========== 顶部统计概览 ========== */}
      <Row gutter={[16, 16]} className={styles.statsSection}>
        <Col xs={12} sm={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="总待办"
              value={statistics.all}
              prefix={<UnorderedListOutlined />}
              valueStyle={{ color: '#00b26a', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="已完成"
              value={statistics.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small" className={styles.statCard}>
            <Statistic
              title="未完成"
              value={statistics.uncompleted}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card size="small" className={styles.statCard}>
            <div className={styles.progressWrapper}>
              <span className={styles.progressLabel}>完成率</span>
              <Progress
                percent={statistics.completionRate}
                strokeColor="#00b26a"
                size={isMobile ? 'default' : 'small'}
                format={(percent) => `${percent}%`}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* ========== 筛选栏 ========== */}
      <Card className={styles.filterCard} size="small">
        {/* Tab 切换 */}
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={STATUS_TABS.map((tab) => ({
            key: tab.key,
            label: tab.label,
          }))}
          className={styles.statusTabs}
          size="small"
        />

        {/* 筛选项行 */}
        <div className={styles.filterRow}>
          {/* 搜索框 */}
          <Input
            placeholder="搜索待办..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={handleSearchChange}
            allowClear
            className={styles.searchInput}
          />

          {/* 组合筛选 */}
          <Select
            placeholder="选择组合"
            allowClear
            value={selectedComboId}
            onChange={handleComboChange}
            options={comboOptions}
            className={styles.comboSelect}
          />

          {/* 标签筛选 */}
          <Select
            mode="multiple"
            placeholder="标签筛选"
            allowClear
            value={selectedTagIds}
            onChange={handleTagChange}
            options={tagOptions}
            className={styles.tagSelect}
            maxTagCount="responsive"
          />

          {/* 日期范围 */}
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange as unknown as (dates: any) => void}
            placeholder={['开始日期', '结束日期']}
            className={styles.dateRangePicker}
          />
        </div>

        {/* 操作行 */}
        <div className={styles.actionRow}>
          <Space>
            {/* 批量操作模式切换 */}
            <Button
              icon={batchMode ? <AppstoreOutlined /> : <UnorderedListOutlined />}
              onClick={() => {
                if (batchMode) {
                  clearSelection();
                }
                setBatchMode(!batchMode);
              }}
              size="small"
              type={batchMode ? 'primary' : 'default'}
            >
              {batchMode ? `取消 (${selectedIds.length})` : '批量操作'}
            </Button>

            {/* 批量操作按钮 */}
            {batchMode && selectedIds.length > 0 && (
              <>
                <Popconfirm
                  title={`确定删除选中的 ${selectedIds.length} 个待办吗？`}
                  onConfirm={handleBatchDelete}
                  okText="确定"
                  cancelText="取消"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger size="small" icon={<DeleteOutlined />}>
                    批量删除 ({selectedIds.length})
                  </Button>
                </Popconfirm>

                <Button
                  size="small"
                  icon={<FolderOpenOutlined />}
                  onClick={() => message.info('请选择目标组合')}
                >
                  移动到组合
                </Button>
              </>
            )}

            {/* 清空筛选 */}
            {hasActiveFilters && (
              <Button
                size="small"
                icon={<ClearOutlined />}
                onClick={handleClearFilters}
              >
                清空筛选
              </Button>
            )}
          </Space>

          <Space>
            {/* 刷新按钮 */}
            <Button
              size="small"
              onClick={() => refresh()}
              loading={isLoading}
            >
              刷新
            </Button>

            {/* 添加待办按钮 */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/todo/add')}
              style={{ backgroundColor: '#00b26a' }}
            >
              添加待办
            </Button>
          </Space>
        </div>
      </Card>

      {/* ========== 待办列表区域 ========== */}
      <div className={styles.listSection}>
        {todos.length === 0 ? (
          <EmptyState
            description={
              hasActiveFilters ? '没有符合条件的待办事项' : '暂无待办事项'
            }
            action={
              !hasActiveFilters ? (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => navigate('/todo/add')}
                  style={{ backgroundColor: '#00b26a' }}
                >
                  创建第一个待办
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            {/* 桌面端网格布局 */}
            {!isMobile ? (
              <div className={styles.todoGrid}>
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    onClick={() => handleClickTodo(todo)}
                    className={styles.gridItem}
                  >
                    {batchMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(todo.id)}
                        onChange={() => toggleSelect(todo.id)}
                        className={styles.batchCheckbox}
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                    <TodoCard
                      todo={todo}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                      onStarToggle={handleStarToggle}
                    />
                  </div>
                ))}
              </div>
            ) : (
              /* 移动端列表布局 */
              <div className={styles.mobileList}>
                {todos.map((todo) => (
                  <div key={todo.id} className={styles.mobileItem}>
                    {batchMode && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(todo.id)}
                        onChange={() => toggleSelect(todo.id)}
                        className={styles.batchCheckbox}
                      />
                    )}
                    <TodoListItem
                      todo={todo}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onToggle={handleToggle}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 加载更多指示器 */}
            {isLoading && todos.length > 0 && (
              <div className={styles.loadingMore}>
                <Spin size="small" />
                <span>加载中...</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TodoList;
