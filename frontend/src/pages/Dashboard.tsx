import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Tag, Typography, Alert } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useStore } from '../store';
import { kpiApi } from '../services/api';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const { strategies, initiatives, projects, tasks, kpis, loading, setKpis } = useStore();
  const [stats, setStats] = useState({
    totalStrategies: 0,
    totalInitiatives: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
  });

  useEffect(() => {
    loadKpis();
  }, []);

  useEffect(() => {
    setStats({
      totalStrategies: strategies.length,
      totalInitiatives: initiatives.length,
      totalProjects: projects.length,
      totalTasks: tasks.length,
      completedTasks: Array.isArray(tasks) ? tasks.filter(t => t.status === '已完成' || t.status === 'COMPLETED' || t.status === 'DONE').length : 0,
      inProgressTasks: Array.isArray(tasks) ? tasks.filter(t => t.status === '进行中' || t.status === 'IN_PROGRESS').length : 0,
    });
  }, [strategies, initiatives, projects, tasks]);

  const loadKpis = async () => {
    try {
      const response = await kpiApi.getAll();
      setKpis(response.data.data || response.data || []);
    } catch (error) {
      console.error('加载KPI数据失败:', error);
    }
  };

  // KPI数据 - 从实际数据中获取
  const kpiData = Array.isArray(kpis) && kpis.length > 0 ? kpis.map(k => ({
    id: k.id,
    name: k.name,
    value: k.current,
    target: k.target,
    color: k.name.includes('转化率') ? '#8884d8' :
           k.name.includes('完成度') ? '#82ca9d' :
           k.name.includes('ROI') ? '#ffc658' :
           k.name.includes('续费率') ? '#ff7300' :
           k.name.includes('转介绍率') ? '#0088fe' : '#1890ff',
    completionRate: k.target > 0 ? (k.current / k.target) * 100 : 0,
    strategy: k.strategy?.name || '未分类'
  })) : [
    { name: '体验课转化率', value: 16, target: 20, color: '#8884d8', completionRate: 80, strategy: '模拟战略' },
    { name: '教材完成度', value: 75, target: 80, color: '#82ca9d', completionRate: 93.75, strategy: '模拟战略' },
    { name: 'ROI', value: 2.1, target: 2.5, color: '#ffc658', completionRate: 84, strategy: '模拟战略' },
    { name: '续费率', value: 68, target: 75, color: '#ff7300', completionRate: 90.67, strategy: '模拟战略' },
    { name: '转介绍率', value: 25, target: 30, color: '#0088fe', completionRate: 83.33, strategy: '模拟战略' },
  ];

  // 趋势数据 - 基于实际KPI数据模拟历史趋势
  const trendData = [
    { week: '第1周', 转化率: 14, 完成度: 70, ROI: 1.8, 续费率: 65, 转介绍率: 22 },
    { week: '第2周', 转化率: 15, 完成度: 72, ROI: 1.9, 续费率: 66, 转介绍率: 23 },
    { week: '第3周', 转化率: 15.5, 完成度: 74, ROI: 2.0, 续费率: 67, 转介绍率: 24 },
    { week: '第4周', 转化率: kpiData.find(k => k.name.includes('转化率'))?.value || 16,
            完成度: kpiData.find(k => k.name.includes('完成度'))?.value || 75,
            ROI: kpiData.find(k => k.name.includes('ROI'))?.value || 2.1,
            续费率: kpiData.find(k => k.name.includes('续费率'))?.value || 68,
            转介绍率: kpiData.find(k => k.name.includes('转介绍率'))?.value || 25 },
  ];

  // 任务状态分布 - 修复状态映射
  const taskStatusData = Array.isArray(tasks) ? [
    { name: '未开始', value: tasks.filter(t => t.status === 'TODO' || t.status === '未开始').length, color: '#ff7875' },
    { name: '进行中', value: tasks.filter(t => t.status === 'DOING' || t.status === '进行中' || t.status === 'IN_PROGRESS').length, color: '#1890ff' },
    { name: '已完成', value: tasks.filter(t => t.status === 'DONE' || t.status === '已完成' || t.status === 'COMPLETED').length, color: '#52c41a' },
    { name: '已暂停', value: tasks.filter(t => t.status === 'BLOCKED' || t.status === '已暂停' || t.status === 'PAUSED' || t.status === 'CANCELLED').length, color: '#faad14' },
  ] : [];

  const COLORS = ['#ff7875', '#1890ff', '#52c41a', '#faad14'];

  if (loading) {
    return <div>加载中...</div>;
  }

  return (
    <div className="dashboard-container" style={{
      padding: '24px',
      minWidth: '320px',
      overflow: 'hidden',
      maxWidth: '100vw'
    }}>
      {/* 仪表盘标题 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '32px' }}>📊</span>
          <span>仪表盘</span>
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          AI Native 项目管理系统 - 实时数据概览
        </Text>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              height: '100%',
              minHeight: '140px'
            }}
            hoverable
            styles={{ body: { padding: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                🎯
              </div>
              <Statistic
                title="战略总数"
                value={stats.totalStrategies}
                valueStyle={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#667eea'
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              height: '100%',
              minHeight: '140px'
            }}
            hoverable
            styles={{ body: { padding: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ⚔️
              </div>
              <Statistic
                title="战役总数"
                value={stats.totalInitiatives}
                valueStyle={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#f5576c'
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              height: '100%',
              minHeight: '140px'
            }}
            hoverable
            styles={{ body: { padding: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                📋
              </div>
              <Statistic
                title="项目总数"
                value={stats.totalProjects}
                valueStyle={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#4facfe'
                }}
              />
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Card
            className="stat-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              transition: 'all 0.3s ease',
              overflow: 'hidden',
              height: '100%',
              minHeight: '140px'
            }}
            hoverable
            styles={{ body: { padding: '16px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' } }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '36px',
                marginBottom: '8px',
                background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                ✅
              </div>
              <Statistic
                title="任务总数"
                value={stats.totalTasks}
                valueStyle={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: '#fa709a'
                }}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* KPI 指标 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={12} lg={12} xl={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📈</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>KPI 完成情况</span>
                <Tag color="blue" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  {kpis.length > 0 ? '实时数据' : '模拟数据'}
                </Tag>
              </div>
            }
            className="kpi-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              height: '100%',
              minHeight: '280px',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
            hoverable
            styles={{ body: {
              padding: '12px',
              height: '100%',
              overflowY: 'auto',
              maxHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            } }}
          >
            {kpis.length === 0 && (
              <Alert
                message="暂无KPI数据"
                description="请先在KPI管理页面创建KPI指标，或查看模拟数据"
                type="info"
                style={{ marginBottom: 8, fontSize: '12px' }}
                showIcon
                iconProps={{ style: { fontSize: '14px' } }}
              />
            )}
            <List
              dataSource={kpiData}
              renderItem={(item) => (
                <List.Item style={{
                  borderRadius: 6,
                  padding: '10px 12px',
                  marginBottom: '6px',
                  background: '#fafafa',
                  transition: 'all 0.2s ease',
                  border: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                >
                  {/* 紧凑布局：所有内容在一行 */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    gap: '8px'
                  }}>
                    {/* 左侧：KPI名称 */}
                    <Tag
                      color={item.color}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        border: 'none',
                        fontWeight: '500',
                        flexShrink: 0,
                        minWidth: 'auto'
                      }}
                    >
                      {item.name}
                    </Tag>

                    {/* 中间：数值和进度条 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flex: 1,
                      minWidth: 0
                    }}>
                      <Text strong style={{
                        fontSize: '14px',
                        color: '#262626',
                        margin: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        {item.value}
                      </Text>
                      <Text type="secondary" style={{
                        fontSize: '11px',
                        margin: 0,
                        whiteSpace: 'nowrap'
                      }}>
                        / {item.target}
                      </Text>
                      <Progress
                        percent={item.completionRate}
                        size="small"
                        showInfo={false}
                        strokeColor={item.color}
                        style={{
                          flex: 1,
                          minWidth: '60px',
                          margin: 0,
                          borderRadius: '2px'
                        }}
                        strokeWidth={4}
                      />
                    </div>

                    {/* 右侧：完成率和战略 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0
                    }}>
                      <span style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: item.completionRate >= 100 ? '#52c41a' :
                               item.completionRate >= 80 ? '#faad14' : '#ff4d4f'
                      }}>
                        {item.completionRate.toFixed(1)}%
                      </span>
                      {item.strategy && (
                        <Tag
                          color="purple"
                          style={{
                            fontSize: '9px',
                            padding: '1px 4px',
                            borderRadius: '3px',
                            border: 'none'
                          }}
                        >
                          {item.strategy}
                        </Tag>
                      )}
                    </div>

                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={12} xl={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '18px' }}>📊</span>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>任务状态分布</span>
              </div>
            }
            className="chart-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              height: '100%',
              minHeight: '280px',
              transition: 'all 0.3s ease'
            }}
            hoverable
            styles={{ body: { padding: '12px', height: '100%', minWidth: '300px' } }}
          >
            <div style={{ width: '100%', height: 240, minWidth: '300px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <PieChart width={300} height={240}>
                <Pie
                  data={taskStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1000}
                >
                  {taskStatusData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, '任务数量']}
                  labelFormatter={(label) => `状态: ${label}`}
                />
              </PieChart>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 趋势图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📈</span>
                <span>趋势分析</span>
                <Tag color="blue" style={{ fontSize: '12px' }}>
                  4周数据对比
                </Tag>
              </div>
            }
            className="chart-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            hoverable
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ overflowX: 'auto', overflowY: 'hidden', minWidth: '300px', height: '300px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="week"
                    stroke="#666"
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="转化率"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#8884d8', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="完成度"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={{ fill: '#82ca9d', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#82ca9d', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ROI"
                    stroke="#ffc658"
                    strokeWidth={2}
                    dot={{ fill: '#ffc658', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#ffc658', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="续费率"
                    stroke="#ff7300"
                    strokeWidth={2}
                    dot={{ fill: '#ff7300', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#ff7300', strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="转介绍率"
                    stroke="#0088fe"
                    strokeWidth={2}
                    dot={{ fill: '#0088fe', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#0088fe', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* KPI对比图表 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} xl={24}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📊</span>
                <span>KPI 对比分析</span>
                <Tag color="green" style={{ fontSize: '12px' }}>
                  当前值 vs 目标值
                </Tag>
              </div>
            }
            className="chart-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              transition: 'all 0.3s ease'
            }}
            hoverable
            styles={{ body: { padding: '16px' } }}
          >
            <div style={{ overflowX: 'auto', overflowY: 'hidden', minWidth: '300px', height: '280px', position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="#666"
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: 'none',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                      backgroundColor: '#fff'
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: '11px' }}
                  />
                  <Bar
                    dataKey="value"
                    name="当前值"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="target"
                    name="目标值"
                    fill="#82ca9d"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 最新动态 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={12} xl={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>🎯</span>
                <span>最近创建的战略</span>
              </div>
            }
            className="activity-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              height: '100%',
              minHeight: '300px',
              transition: 'all 0.3s ease'
            }}
            hoverable
            styles={{ body: { padding: '16px', height: '100%', overflowY: 'auto', maxHeight: '400px' } }}
          >
            <List
              dataSource={Array.isArray(strategies) ? strategies.slice(0, 5) : []}
              renderItem={(strategy) => (
                <List.Item style={{
                  borderRadius: 8,
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#fafafa',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{
                        fontWeight: 'bold',
                        color: '#667eea',
                        fontSize: '13px'
                      }}>
                        {strategy.name}
                      </div>
                    }
                    description={
                      <Text type="secondary" style={{ fontSize: '11px' }}>
                        {strategy.description || '暂无描述'}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={12} xl={12}>
          <Card
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>📋</span>
                <span>最新任务</span>
              </div>
            }
            className="activity-card"
            style={{
              borderRadius: 12,
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              border: 'none',
              height: '100%',
              minHeight: '300px',
              transition: 'all 0.3s ease'
            }}
            hoverable
            styles={{ body: { padding: '16px', height: '100%', overflowY: 'auto', maxHeight: '400px' } }}
          >
            <List
              dataSource={Array.isArray(tasks) ? tasks.slice(0, 5) : []}
              renderItem={(task) => (
                <List.Item style={{
                  borderRadius: 8,
                  padding: '8px',
                  marginBottom: '6px',
                  background: '#fafafa',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f0f0';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{
                        fontWeight: 'bold',
                        color: '#4facfe',
                        fontSize: '13px'
                      }}>
                        {task.title}
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        <Tag color="blue" style={{ fontSize: '9px' }}>
                          {task.status}
                        </Tag>
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          优先级: {(task.priority * 100).toFixed(0)}%
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 仪表盘专用CSS */}
      <style jsx>{`
        .dashboard-container {
          max-width: 100vw;
          overflow: hidden;
        }

        .stat-card {
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .kpi-card {
          transition: all 0.3s ease;
        }

        .kpi-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .chart-card {
          transition: all 0.3s ease;
        }

        .chart-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        .activity-card {
          transition: all 0.3s ease;
        }

        .activity-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }

        @media (max-width: 1200px) {
          .dashboard-container {
            padding: 16px;
          }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 12px;
          }

          .stat-card {
            min-height: 120px;
          }

          .kpi-card {
            min-height: 240px;
          }

          .chart-card,
          .activity-card {
            min-height: 240px;
          }
        }

        @media (max-width: 480px) {
          .dashboard-container {
            padding: 8px;
          }

          .stat-card {
            min-height: 100px;
          }

          .kpi-card {
            min-height: 220px;
          }

          .chart-card,
          .activity-card {
            min-height: 200px;
          }

          /* KPI项目移动端优化 */
          .ant-list-item {
            padding: 12px !important;
          }

          .ant-list-item-meta-content {
            width: 100% !important;
          }

          /* 进度条移动端优化 */
          .ant-progress-line {
            margin-bottom: 0 !important;
          }
        }

        /* KPI项目响应式布局 */
        @media (max-width: 768px) {
          .kpi-card .ant-list-item {
            padding: 8px !important;
          }

          .kpi-card .ant-tag {
            font-size: 10px !important;
            padding: 2px 6px !important;
          }

          .kpi-card .ant-typography {
            font-size: 12px !important;
          }

          .kpi-card .ant-progress {
            margin: 2px 0 !important;
          }
        }

        @media (max-width: 480px) {
          .kpi-card .ant-list-item {
            padding: 6px !important;
          }

          .kpi-card .ant-tag {
            font-size: 9px !important;
            padding: 1px 4px !important;
          }

          .kpi-card .ant-typography-strong {
            font-size: 12px !important;
          }

          .kpi-card .ant-typography-secondary {
            font-size: 10px !important;
          }

          .ant-progress-small.ant-progress-line {
            height: 4px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;