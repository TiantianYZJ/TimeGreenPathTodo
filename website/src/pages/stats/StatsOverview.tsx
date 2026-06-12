import { Card, Typography, Row, Col, Statistic, Tabs, Tag } from 'antd';
import { useEffect, useState, useMemo } from 'react';
import { useTodoStore } from '../../stores';
import { configApi } from '../../services';
import type { PublicStats, HourlyStats } from '../../services/modules/configApi';
import { SkeletonStatsGrid, SkeletonCard } from '../../components/ui/Skeleton';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function StatsOverview() {
  const { todos, fetchTodos } = useTodoStore();
  const [publicStats, setPublicStats] = useState<PublicStats | null>(null);
  const [hourlyStats, setHourlyStats] = useState<HourlyStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (todos.length === 0) fetchTodos();
    const fetchData = async () => {
      try {
        const [pubRes, hourlyRes] = await Promise.all([
          configApi.getPublicStats(),
          configApi.getHourlyStats(),
        ]);
        if (pubRes.success) setPublicStats(pubRes.stats);
        if (hourlyRes.success) setHourlyStats(hourlyRes.data);
      } catch {
        // handled
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [fetchTodos, todos.length]);

  const personalStats = useMemo(() => {
    const active = todos.filter((t) => !t.isDeleted);
    const completed = active.filter((t) => t.completed > 0);
    const starred = active.filter((t) => t.isStar);
    const withDate = active.filter((t) => t.setDate);
    const overdue = withDate.filter((t) => dayjs(t.setDate).isBefore(dayjs(), 'day') && t.completed === 0);
    const today = active.filter((t) => t.setDate === dayjs().format('YYYY-MM-DD'));
    const todayCompleted = today.filter((t) => t.completed > 0);
    const thisWeek = active.filter((t) => {
      if (!t.setDate) return false;
      return dayjs(t.setDate).isAfter(dayjs().startOf('week')) && dayjs(t.setDate).isBefore(dayjs().endOf('week'));
    });
    const thisWeekCompleted = thisWeek.filter((t) => t.completed > 0);
    const withImages = active.filter((t) => t.images && t.images.length > 0);
    const withLocation = active.filter((t) => t.location);

    return {
      total: active.length,
      completed: completed.length,
      uncompleted: active.length - completed.length,
      completionRate: active.length > 0 ? Math.round((completed.length / active.length) * 100) : 0,
      starred: starred.length,
      overdue: overdue.length,
      todayTotal: today.length,
      todayCompleted: todayCompleted.length,
      weekTotal: thisWeek.length,
      weekCompleted: thisWeekCompleted.length,
      withImages: withImages.length,
      withLocation: withLocation.length,
    };
  }, [todos]);

  const personalPieOption = personalStats.total > 0 ? {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      name: '我的待办',
      type: 'pie',
      radius: ['40%', '65%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: personalStats.completed, name: '已完成', itemStyle: { color: '#00b26a' } },
        { value: personalStats.uncompleted, name: '待完成', itemStyle: { color: '#faad14' } },
        { value: personalStats.overdue, name: '已逾期', itemStyle: { color: '#ff4d4f' } },
      ].filter((d) => d.value > 0),
    }],
  } : null;

  const hourlyChartOption = hourlyStats && hourlyStats.hourlyDistribution.length > 0 ? {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    xAxis: {
      type: 'category',
      data: hourlyStats.hourlyDistribution.map((h) => h.hourLabel),
      axisLabel: { fontSize: 11 },
    },
    yAxis: { type: 'value', name: '待办数' },
    series: [{
      type: 'bar',
      data: hourlyStats.hourlyDistribution.map((h) => h.count),
      itemStyle: {
        color: (params: { dataIndex: number }) => {
          const hour = hourlyStats.hourlyDistribution[params.dataIndex]?.hour;
          if (hour !== undefined && hourlyStats.peakHours.some((p) => p.hour === hour)) return '#00b26a';
          return '#95de64';
        },
        borderRadius: [4, 4, 0, 0],
      },
    }],
  } : null;

  const publicPieOption = publicStats ? {
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
      name: '平台待办',
      type: 'pie',
      radius: ['40%', '65%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: [
        { value: publicStats.completedTodoCount, name: '已完成', itemStyle: { color: '#00b26a' } },
        { value: publicStats.todoCount - publicStats.completedTodoCount, name: '未完成', itemStyle: { color: '#faad14' } },
      ],
    }],
  } : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: 960, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 16 }}>数据统计</Title>
      {loading ? (
        <>
          <SkeletonStatsGrid />
          <SkeletonCard lines={3} />
        </>
      ) : (
        <Tabs
          defaultActiveKey="personal"
          items={[
            {
              key: 'personal',
              label: '我的统计',
              children: (
                <>
                  {/* Hero stats */}
                  <div style={{
                    background: 'linear-gradient(135deg, #00b26a 0%, #00c97a 100%)',
                    borderRadius: 16, padding: '24px 28px', marginBottom: 20, color: '#fff',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    <div style={{ position: 'absolute', top: -30, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                    <Row gutter={[16, 16]}>
                      <Col span={8}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{personalStats.total}</div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>全部待办</div>
                      </Col>
                      <Col span={8}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{personalStats.completed}</div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>已完成</div>
                      </Col>
                      <Col span={8}>
                        <div style={{ fontSize: 32, fontWeight: 700 }}>{personalStats.completionRate}%</div>
                        <div style={{ fontSize: 13, opacity: 0.8 }}>完成率</div>
                      </Col>
                    </Row>
                  </div>

                  <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="今日待办" value={personalStats.todayTotal} suffix={`/ ${personalStats.todayCompleted} 完成`} valueStyle={{ color: '#00b26a' }} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="本周待办" value={personalStats.weekTotal} suffix={`/ ${personalStats.weekCompleted} 完成`} valueStyle={{ color: '#1890ff' }} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="已逾期" value={personalStats.overdue} valueStyle={{ color: personalStats.overdue > 0 ? '#ff4d4f' : undefined }} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="星标待办" value={personalStats.starred} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="含图片" value={personalStats.withImages} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="含位置" value={personalStats.withLocation} />
                      </Card>
                    </Col>
                  </Row>

                  {personalPieOption && (
                    <Card style={{ borderRadius: 12, marginBottom: 16 }}>
                      <Title level={5}>待办完成分布</Title>
                      <div aria-label={`待办完成分布：已完成 ${personalStats.completed} 个，待完成 ${personalStats.uncompleted} 个，已逾期 ${personalStats.overdue} 个`} role="img">
                        <ReactECharts option={personalPieOption} style={{ height: 280 }} />
                      </div>
                    </Card>
                  )}
                </>
              ),
            },
            {
              key: 'hourly',
              label: '时段分布',
              children: hourlyStats ? (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col span={12}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="总待办数" value={hourlyStats.totalTodos} />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="每小时平均" value={hourlyStats.avgPerHour} precision={1} />
                      </Card>
                    </Col>
                  </Row>
                  {hourlyChartOption && (
                    <Card style={{ borderRadius: 12, marginBottom: 16 }}>
                      <Title level={5}>每小时待办分布</Title>
                      <div aria-label={`每小时待办分布图，总计 ${hourlyStats?.totalTodos} 个待办，高峰时段：${hourlyStats?.peakHours.map((h) => h.hourLabel).join('、')}`} role="img">
                        <ReactECharts option={hourlyChartOption} style={{ height: 300 }} />
                      </div>
                    </Card>
                  )}
                  {hourlyStats.peakHours.length > 0 && (
                    <Card style={{ borderRadius: 12 }}>
                      <Title level={5}>高峰时段</Title>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {hourlyStats.peakHours.map((h) => (
                          <Tag key={h.hour} color="green" style={{ fontSize: 14, padding: '4px 12px' }}>
                            {h.hourLabel} ({h.count}个)
                          </Tag>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card style={{ borderRadius: 12 }}><Text type="secondary">暂无时段数据</Text></Card>
              ),
            },
            {
              key: 'platform',
              label: '平台统计',
              children: publicStats ? (
                <>
                  <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="总用户" value={publicStats.userCount} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="总待办" value={publicStats.todoCount} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="平台完成率" value={publicStats.completionRate} suffix="%" valueStyle={{ color: '#00b26a' }} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="今日新增用户" value={publicStats.todayNewUsers} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="今日新增待办" value={publicStats.todayNewTodos} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="7日活跃用户" value={publicStats.activeUsers7Days} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="共享组合" value={publicStats.sharedComboCount} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="共享待办" value={publicStats.sharedTodoCount} />
                      </Card>
                    </Col>
                    <Col xs={12} sm={8}>
                      <Card size="small" style={{ borderRadius: 12 }}>
                        <Statistic title="评论数" value={publicStats.commentCount} />
                      </Card>
                    </Col>
                  </Row>
                  {publicPieOption && (
                    <Card style={{ borderRadius: 12 }}>
                      <Title level={5}>平台待办完成分布</Title>
                      <div aria-label={`平台待办分布：已完成 ${publicStats?.completedTodoCount} 个，未完成 ${(publicStats?.todoCount ?? 0) - (publicStats?.completedTodoCount ?? 0)} 个`} role="img">
                        <ReactECharts option={publicPieOption} style={{ height: 280 }} />
                      </div>
                    </Card>
                  )}
                </>
              ) : null,
            },
          ]}
        />
      )}
    </div>
  );
}
