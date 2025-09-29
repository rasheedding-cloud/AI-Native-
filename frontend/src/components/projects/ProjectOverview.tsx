import React from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Divider, Timeline } from 'antd';
import { ProjectOutlined, TeamOutlined, CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface ProjectOverviewProps {
  project: any;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      '未开始': 'default',
      '进行中': 'processing',
      '已完成': 'success',
      '已暂停': 'warning',
      '已取消': 'error'
    };
    return colors[status] || 'default';
  };

  const getProgressPercentage = () => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((task: any) => task.status === '已完成').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  const getTaskStats = () => {
    if (!project.tasks) return { total: 0, completed: 0, inProgress: 0, todo: 0 };

    return {
      total: project.tasks.length,
      completed: project.tasks.filter((task: any) => task.status === '已完成').length,
      inProgress: project.tasks.filter((task: any) => task.status === '进行中').length,
      todo: project.tasks.filter((task: any) => task.status === '未开始').length,
    };
  };

  const getPriorityTasks = () => {
    if (!project.tasks) return [];

    return project.tasks
      .filter((task: any) => task.priority > 70)
      .sort((a: any, b: any) => b.priority - a.priority)
      .slice(0, 5);
  };

  const taskStats = getTaskStats();
  const progress = getProgressPercentage();
  const priorityTasks = getPriorityTasks();

  return (
    <div>
      {/* 项目基本信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="项目状态"
              value={project.status}
              valueStyle={{ color: getStatusColor(project.status) === 'success' ? '#52c41a' : '#1890ff' }}
              prefix={<ProjectOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="总任务数"
              value={taskStats.total}
              valueStyle={{ color: '#722ed1' }}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已完成"
              value={taskStats.completed}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="进行中"
              value={taskStats.inProgress}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 项目进度 */}
      <Card title="项目进度" style={{ marginBottom: '24px' }}>
        <Progress
          percent={progress}
          status={progress === 100 ? 'success' : 'active'}
          strokeColor={{
            '0%': '#108ee9',
            '100%': '#87d068',
          }}
          strokeWidth={16}
        />
        <div style={{ marginTop: '8px', color: '#666', fontSize: '14px' }}>
          总任务: {taskStats.total} | 已完成: {taskStats.completed} | 进行中: {taskStats.inProgress} | 待开始: {taskStats.todo}
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 任务状态分布 */}
        <Col xs={24} lg={12}>
          <Card title="任务状态分布">
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '16px 0' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {taskStats.completed}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>已完成</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {taskStats.inProgress}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>进行中</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {taskStats.todo}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>待开始</div>
              </div>
            </div>
          </Card>
        </Col>

        {/* 项目信息 */}
        <Col xs={24} lg={12}>
          <Card title="项目信息">
            <div style={{ color: '#666' }}>
              <p><strong>项目名称:</strong> {project.name}</p>
              <p><strong>所属战役:</strong> {project.initiative?.name || '未分类'}</p>
              <p><strong>创建时间:</strong> {new Date(project.createdAt).toLocaleDateString()}</p>
              <p><strong>最后更新:</strong> {new Date(project.updatedAt).toLocaleDateString()}</p>
              {project.description && (
                <p><strong>项目描述:</strong> {project.description}</p>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* 高优先级任务 */}
      {priorityTasks.length > 0 && (
        <Card title="高优先级任务" style={{ marginTop: '24px' }}>
          <Timeline>
            {priorityTasks.map((task: any, index: number) => (
              <Timeline.Item
                key={task.id}
                color={task.priority > 90 ? 'red' : task.priority > 80 ? 'orange' : 'blue'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <strong>{task.title}</strong>
                    <div style={{ color: '#666', fontSize: '12px', marginTop: '4px' }}>
                      负责人: {task.assignee || '未分配'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Tag color={task.priority > 90 ? 'red' : task.priority > 80 ? 'orange' : 'blue'}>
                      优先级: {task.priority}
                    </Tag>
                    <Tag color={getStatusColor(task.status)}>
                      {task.status}
                    </Tag>
                  </div>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}
    </div>
  );
};

export default ProjectOverview;