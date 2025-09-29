import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Tabs, Spin, Alert, Button, Breadcrumb } from 'antd';
import { HomeOutlined, ProjectOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { projectApi } from '../services/api';
import ProjectOverview from '../components/projects/ProjectOverview';
import TaskLists from '../components/projects/TaskLists';
import GanttView from '../components/projects/GanttView';


interface ProjectDetailParams {
  projectId: string;
}

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<ProjectDetailParams>();
  const navigate = useNavigate();
  const { projects, loading, setLoading, setError } = useStore();
  const [project, setProject] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    if (projectId) {
      loadProjectDetails();
    }
  }, [projectId]);

  const loadProjectDetails = async () => {
    try {
      setLoading(true);

      // 首先从store中查找项目
      const projectFromStore = projects.find(p => p.id === projectId);
      if (projectFromStore) {
        setProject(projectFromStore);
      }

      // 从API获取最新详情
      const response = await projectApi.getById(projectId);
      const projectData = response.data?.data || response.data;
      setProject(projectData);
    } catch (error) {
      setError('加载项目详情失败');
      console.error('加载项目详情失败:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const getProgressPercentage = (project: any) => {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completedTasks = project.tasks.filter((task: any) => task.status === '已完成').length;
    return Math.round((completedTasks / project.tasks.length) * 100);
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="项目不存在"
          description="未找到指定的项目，请检查URL是否正确。"
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => navigate('/projects')}>
              返回项目列表
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Breadcrumb
        items={[
          { href: '/', title: <HomeOutlined /> },
          { href: '/projects', title: <ProjectOutlined />, children: '项目管理' },
          { title: project.name }
        ]}
        style={{ marginBottom: '16px' }}
      />

      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <span>{project.name}</span>
            <span style={{
              padding: '4px 8px',
              borderRadius: '4px',
              background: getStatusColor(project.status) === 'success' ? '#52c41a' :
                          getStatusColor(project.status) === 'processing' ? '#1890ff' :
                          getStatusColor(project.status) === 'warning' ? '#faad14' : '#f5222d',
              color: 'white',
              fontSize: '12px'
            }}>
              {project.status}
            </span>
          </div>
        }
        extra={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px', color: '#666' }}>
              任务数: {project.tasks?.length || 0}
            </span>
            <span style={{ fontSize: '14px', color: '#666' }}>
              进度: {getProgressPercentage(project)}%
            </span>
          </div>
        }
        style={{ marginBottom: '16px' }}
      >
        {project.description && (
          <p style={{ color: '#666', marginBottom: '16px' }}>
            {project.description}
          </p>
        )}
      </Card>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          style={{
            border: 'none',
            background: 'transparent'
          }}
          items={[
            {
              key: '1',
              label: '概览',
              children: <ProjectOverview project={project} />
            },
            {
              key: '2',
              label: '任务列表',
              children: <TaskLists project={project} />
            },
            {
              key: '3',
              label: '甘特图',
              children: <GanttView project={project} />
            }
          ]}
        />
      </Card>
    </div>
  );
};

export default ProjectDetail;