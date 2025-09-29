import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Tabs, Progress } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, ProjectOutlined, CalendarOutlined, UserOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { projectApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

const Projects: React.FC = () => {
  const { projects, initiatives, setProjects, addProject, updateProject, deleteProject, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    // 如果已经有数据，避免重复加载
    if (projects.length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await projectApi.getAll();
      setProjects(response.data || response);
    } catch (error) {
      setError('加载项目失败');
      message.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setIsModalVisible(true);
    form.setFieldsValue(project);
  };

  const handleDelete = async (id: string) => {
    try {
      await projectApi.delete(id);
      deleteProject(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingProject) {
        const response = await projectApi.update(editingProject.id, values);
        updateProject(editingProject.id, response.data || response);
        message.success('更新成功');
      } else {
        const response = await projectApi.create(values);
        addProject(response.data || response);
        message.success('创建成功');

        // 重新加载数据以确保同步
        setTimeout(() => {
          loadProjects();
        }, 500);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
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

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '所属战役',
      dataIndex: 'initiative',
      key: 'initiative',
      render: (initiative: any) => <Tag color="purple">{initiative?.name || '未知'}</Tag>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '进度',
      dataIndex: 'progress',
      key: 'progress',
      render: (_: any, record: any) => (
        <Progress
          percent={getProgressPercentage(record)}
          size="small"
          status={getProgressPercentage(record) === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: '任务数量',
      dataIndex: 'tasks',
      key: 'taskCount',
      render: (tasks: any[]) => <Tag color="blue">{tasks?.length || 0}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个项目吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 按战役分组统计
  const projectsByInitiative = Array.isArray(projects) ? projects.reduce((acc, project) => {
    const initiativeName = project.initiative?.name || '未分类';
    if (!acc[initiativeName]) {
      acc[initiativeName] = [];
    }
    acc[initiativeName].push(project);
    return acc;
  }, {} as Record<string, any[]>) : {};

  const tabItems = [
    {
      key: '1',
      label: '列表视图',
      children: (
        <Table
          dataSource={Array.isArray(projects) ? projects : []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            total: Array.isArray(projects) ? projects.length : 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      ),
    },
    {
      key: '2',
      label: '战役视图',
      children: (
        <div style={{ padding: '20px' }}>
          {Object.entries(projectsByInitiative).map(([initiativeName, initiativeProjects]) => (
            <Card
              key={initiativeName}
              title={<span><ProjectOutlined /> {initiativeName}</span>}
              style={{ marginBottom: '16px' }}
              extra={<Tag color="purple">{initiativeProjects.length} 个项目</Tag>}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                {initiativeProjects.map((project) => (
                  <Card
                    key={project.id}
                    size="small"
                    style={{ width: '320px', marginBottom: '0' }}
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        icon={<EyeOutlined />}
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        查看
                      </Button>,
                      <Button type="link" size="small" icon={<EditOutlined />}>
                        编辑
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div>
                          {project.name}
                          <Tag color={getStatusColor(project.status)} style={{ marginLeft: '8px' }}>
                            {project.status}
                          </Tag>
                        </div>
                      }
                      description={
                        <div>
                          <p style={{ marginBottom: '8px' }}>
                            {project.description || '暂无描述'}
                          </p>
                          <div style={{ marginBottom: '8px' }}>
                            <Progress
                              percent={getProgressPercentage(project)}
                              size="small"
                              status={getProgressPercentage(project) === 100 ? 'success' : 'active'}
                            />
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                            <span><UserOutlined /> {project.tasks?.length || 0} 任务</span>
                            <span><CalendarOutlined /> {new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      key: '3',
      label: '统计视图',
      children: (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {Array.isArray(projects) ? projects.length : 0}
                </div>
                <div style={{ color: '#666' }}>总项目数</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {Array.isArray(projects) ? projects.filter(p => p.status === '已完成').length : 0}
                </div>
                <div style={{ color: '#666' }}>已完成</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {Array.isArray(projects) ? projects.filter(p => p.status === '进行中').length : 0}
                </div>
                <div style={{ color: '#666' }}>进行中</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                  {Array.isArray(projects) ? projects.reduce((sum, p) => sum + (p.tasks?.length || 0), 0) : 0}
                </div>
                <div style={{ color: '#666' }}>总任务数</div>
              </div>
            </Card>
          </div>

          <Card title="项目状态分布">
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              {Object.entries(
                Array.isArray(projects) ? projects.reduce((acc, project) => {
                  acc[project.status] = (acc[project.status] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>) : {}
              ).map(([status, count]) => (
                <div key={status} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{count}</div>
                  <Tag color={getStatusColor(status)}>{status}</Tag>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <span>项目管理</span>
            <Tag color="green" style={{ fontSize: '12px' }}>
              {Array.isArray(projects) ? projects.length : 0} 个项目
            </Tag>
          </div>
        )}
        extra={
          <Space wrap>
            <Input.Search
              placeholder="搜索项目..."
              style={{ width: 200 }}
              onSearch={(value) => console.log('搜索:', value)}
              allowClear
              size="middle"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="middle"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              创建项目
            </Button>
          </Space>
        }
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          borderRadius: 12,
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginTop: 16 }}
          className="custom-tabs"
        />
      </Card>

      <Modal
        title={editingProject ? '编辑项目' : '创建项目'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{ xs: '90%', sm: '80%', md: 600 }}
        style={{
          top: 20,
          borderRadius: 12,
          overflow: 'hidden'
        }}
        styles={{
          body: {
            padding: '24px',
            background: '#fafafa'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '100%' }}
        >
          <Form.Item
            label="项目名称"
            name="name"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input
              placeholder="请输入项目名称"
              size="large"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            />
          </Form.Item>

          <Form.Item
            label="所属战役"
            name="initiativeId"
            rules={[{ required: true, message: '请选择所属战役' }]}
          >
            <Select
              placeholder="请选择所属战役"
              size="large"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {initiatives.map((initiative) => (
                <Option key={initiative.id} value={initiative.id}>
                  {initiative.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="项目描述"
            name="description"
            rules={[{ required: false }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入项目描述（可选）"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            />
          </Form.Item>

          <Form.Item
            label="项目状态"
            name="status"
            rules={[{ required: true, message: '请选择项目状态' }]}
            initialValue="未开始"
          >
            <Select
              placeholder="请选择项目状态"
              size="large"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              <Option value="未开始">未开始</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已暂停">已暂停</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsModalVisible(false)}
                size="large"
                style={{
                  borderRadius: 8,
                  padding: '8px 24px',
                  border: '1px solid #d9d9d9',
                  transition: 'all 0.3s ease'
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: 8,
                  padding: '8px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                {editingProject ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <style>{`
        .custom-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }

        .custom-tabs .ant-tabs-tab {
          border-radius: 8px 8px 0 0;
          transition: all 0.3s ease;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .custom-tabs .ant-tabs-tab-active {
          color: #667eea;
          border-bottom: 2px solid #667eea;
        }

        .ant-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .ant-progress-circle .ant-progress-text {
          font-size: 16px;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .ant-card {
            margin: 8px;
          }

          .ant-modal {
            margin: 16px;
          }

          .ant-card-grid {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Projects;