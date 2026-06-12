import { useEffect } from 'react';
import { Card, Typography, Row, Col, Statistic, Spin } from 'antd';
import { UserOutlined, CheckCircleOutlined, TeamOutlined, RiseOutlined } from '@ant-design/icons';
import { useAdminStore } from '../../stores';
import ReactECharts from 'echarts-for-react';

const { Title } = Typography;

export default function AdminDashboard() {
  const {
    stats, isLoading, fetchStats,
    retentionStats, fetchRetentionStats,
    tagUsageStats, fetchTagUsageStats,
    userTodoDistribution, fetchUserTodoDistribution,
  } = useAdminStore();

  useEffect(() => {
    fetchStats();
    fetchRetentionStats();
    fetchTagUsageStats();
    fetchUserTodoDistribution();
  }, [fetchStats, fetchRetentionStats, fetchTagUsageStats, fetchUserTodoDistribution]);

  const tagChartOption = tagUsageStats.length > 0 ? {
    tooltip: { trigger: 'axis' },
    xAxis: { type: 'category', data: tagUsageStats.map((t) => t.tagName) },
    yAxis: { type: 'value' },
    series: [{
      type: 'bar',
      data: tagUsageStats.map((t) => t.usageCount),
      itemStyle: { color: '#00b26a', borderRadius: [4, 4, 0, 0] },
    }],
  } : null;

  const userDistChartOption = userTodoDistribution.length > 0 ? {
    tooltip: { trigger: 'axis' },
    legend: { data: ['总待办', '已完成'] },
    xAxis: { type: 'category', data: userTodoDistribution.slice(0, 20).map((u) => u.nickname) },
    yAxis: { type: 'value' },
    series: [
      { name: '总待办', type: 'bar', data: userTodoDistribution.slice(0, 20).map((u) => u.todoCount), itemStyle: { color: '#00b26a', borderRadius: [4, 4, 0, 0] } },
      { name: '已完成', type: 'bar', data: userTodoDistribution.slice(0, 20).map((u) => u.completedCount), itemStyle: { color: '#4dd69a', borderRadius: [4, 4, 0, 0] } },
    ],
  } : null;

  return (
    <div className="animate-fade-in">
      <Title level={4} style={{ marginBottom: 16 }}>管理仪表盘</Title>
      <Spin spinning={isLoading}>
        {stats && (
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="总用户" value={stats.userCount} prefix={<UserOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="总待办" value={stats.todoCount} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="完成率" value={stats.completionRate} suffix="%" valueStyle={{ color: '#00b26a' }} prefix={<CheckCircleOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="7日活跃" value={stats.activeUsers7Days} prefix={<RiseOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="今日新增用户" value={stats.todayNewUsers} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="今日新增待办" value={stats.todayNewTodos} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="共享组合" value={stats.sharedComboCount} prefix={<TeamOutlined />} />
              </Card>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <Card size="small" style={{ borderRadius: 12 }}>
                <Statistic title="最新版本" value={stats.latestVersion} />
              </Card>
            </Col>
          </Row>
        )}

        <Row gutter={[16, 16]}>
          {tagChartOption && (
            <Col xs={24} lg={12}>
              <Card title="标签使用统计" style={{ borderRadius: 12 }}>
                <ReactECharts option={tagChartOption} style={{ height: 280 }} />
              </Card>
            </Col>
          )}
          {userDistChartOption && (
            <Col xs={24} lg={12}>
              <Card title="用户待办分布 (Top 20)" style={{ borderRadius: 12 }}>
                <ReactECharts option={userDistChartOption} style={{ height: 280 }} />
              </Card>
            </Col>
          )}
        </Row>
      </Spin>
    </div>
  );
}
