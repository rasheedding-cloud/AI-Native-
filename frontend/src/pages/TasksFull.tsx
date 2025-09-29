import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Tabs, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, CalendarOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { taskApi, calendarApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const TasksFull: React.FC = () => {
  const { tasks, projects, calendarBlocks, setTasks, setCalendarBlocks, addTask, updateTask, deleteTask, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    if (tasks.length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await taskApi.getAll();
      const taskData = response.data?.data || response.data || [];

      // 确保所有任务都有正确的数据结构
      const normalizedTasks = taskData.map((task: any) => ({
        ...task,
        priority: typeof task.priority === 'number' ? task.priority : parseInt(task.priority) || 50,
        status: task.status || '未开始'
      }));

      setTasks(normalizedTasks);
    } catch (error) {
      console.error('加载任务失败:', error);
      setError('加载任务失败');
      message.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingTask(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({ priority: 50 });
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...task,
      priority: typeof task.priority === 'number' ? task.priority : parseInt(task.priority) || 50
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await taskApi.delete(id);
      deleteTask(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        priority: typeof values.priority === 'number' ? values.priority : parseInt(values.priority) || 50
      };

      if (editingTask) {
        const response = await taskApi.update(editingTask.id, submitData);
        updateTask(editingTask.id, response.data?.data || response.data || response);
        message.success('更新成功');
      } else {
        const response = await taskApi.create(submitData);
        addTask(response.data?.data || response.data || response);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('操作失败:', error);
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

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '所属项目',
      dataIndex: 'project',
      key: 'project',
      render: (project: any) => project?.name || '未分类',
    },
    {
      title: '负责人',
      dataIndex: 'assignee',
      key: 'assignee',
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => {
        const getPriorityInfo = (p: number) => {
          if (p >= 90) return { text: '紧急', color: 'purple' };
          if (p >= 80) return { text: '高', color: 'red' };
          if (p >= 70) return { text: '中高', color: 'orange' };
          if (p >= 50) return { text: '中', color: 'gold' };
          if (p >= 30) return { text: '中低', color: 'lime' };
          return { text: '低', color: 'green' };
        };
        const { text, color } = getPriorityInfo(priority);
        return <Tag color={color}>{text} ({priority})</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{status}</Tag>
      ),
    },
    {
      title: '截止日期',
      dataIndex: 'due',
      key: 'due',
      render: (due: string) => due ? new Date(due).toLocaleDateString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (text: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除这个任务吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 简化的日历视图组件
  const SimpleCalendarView = () => {
    const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
    const [eventsLoading, setEventsLoading] = useState(false);

    useEffect(() => {
      loadCalendarEvents();
    }, []);

    const loadCalendarEvents = async () => {
      try {
        setEventsLoading(true);
        const response = await calendarApi.getAll({});
        const events = response.data?.data || response.data || [];
        setCalendarEvents(events);
      } catch (error) {
        console.error('加载日历事件失败:', error);
      } finally {
        setEventsLoading(false);
      }
    };

    return (
      <div style={{ padding: '16px', height: '100%' }}>
        <Card
          title="日历视图"
          extra={
            <Button
              type="primary"
              onClick={() => {
                // 添加任务到日历的逻辑
                const unscheduledTasks = tasks.filter(task => task.status !== '已完成');
                if (unscheduledTasks.length > 0) {
                  message.info(`找到 ${unscheduledTasks.length} 个未安排的任务`);
                } else {
                  message.info('所有任务已完成');
                }
              }}
            >
              同步任务到日历
            </Button>
          }
        >
          {eventsLoading ? (
            <div style={{ textAlign: 'center', padding: '50px' }}>
              加载中...
            </div>
          ) : (
            <div>
              <Alert
                message="日历视图"
                description={`当前有 ${calendarEvents.length} 个日历事件，${tasks.filter(t => t.status !== '已完成').length} 个未完成任务`}
                type="info"
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <div style={{
                border: '1px solid #d9d9d9',
                borderRadius: '8px',
                padding: '16px',
                minHeight: '400px',
                backgroundColor: '#fafafa'
              }}>
                <div style={{ textAlign: 'center', color: '#666', marginTop: '150px' }}>
                  <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }} />
                  <h3>日历功能开发中</h3>
                  <p>完整日历视图正在开发中，敬请期待...</p>
                  <p>当前显示：{calendarEvents.length} 个日历事件</p>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // 简化的看板视图
  const KanbanView = () => {
    const todoTasks = tasks.filter(task => task.status === '未开始');
    const inProgressTasks = tasks.filter(task => task.status === '进行中');
    const completedTasks = tasks.filter(task => task.status === '已完成');

    const renderTaskColumn = (title: string, taskList: any[], color: string) => (
      <div style={{
        flex: 1,
        margin: '0 8px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h3 style={{
          color,
          marginBottom: '16px',
          borderBottom: `2px solid ${color}`,
          paddingBottom: '8px'
        }}>
          {title} ({taskList.length})
        </h3>
        {taskList.map(task => (
          <div
            key={task.id}
            style={{
              backgroundColor: 'white',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}
            onClick={() => handleEdit(task)}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              {task.title}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {task.assignee && `负责人: ${task.assignee}`}
            </div>
            <div style={{ marginTop: '4px' }}>
              <Tag size="small" color={
                task.priority >= 80 ? 'red' :
                task.priority >= 60 ? 'orange' : 'green'
              }>
                优先级: {task.priority}
              </Tag>
            </div>
          </div>
        ))}
      </div>
    );

    return (
      <div style={{ padding: '16px', height: '100%' }}>
        <Card title="看板视图">
          <div style={{ display: 'flex', height: '500px', overflow: 'auto' }}>
            {renderTaskColumn('待办', todoTasks, '#1890ff')}
            {renderTaskColumn('进行中', inProgressTasks, '#52c41a')}
            {renderTaskColumn('已完成', completedTasks, '#faad14')}
          </div>
        </Card>
      </div>
    );
  };

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 80px)' }}>
      <Card
        title="任务管理"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            新建任务
          </Button>
        }
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        bodyStyle={{ flex: 1, padding: 0, display: 'flex', flexDirection: 'column' }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          items={[
            {
              key: 'list',
              label: (
                <span>
                  <UnorderedListOutlined />
                  列表
                </span>
              ),
              children: (
                <div style={{ padding: '16px', height: '100%' }}>
                  <Table
                    dataSource={Array.isArray(tasks) ? tasks : []}
                    columns={columns}
                    rowKey="id"
                    loading={loading}
                    scroll={{ y: 'calc(100vh - 300px)' }}
                    pagination={{
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                    }}
                  />
                </div>
              )
            },
            {
              key: 'board',
              label: (
                <span>
                  <AppstoreOutlined />
                  看板
                </span>
              ),
              children: <KanbanView />
            },
            {
              key: 'calendar',
              label: (
                <span>
                  <CalendarOutlined />
                  日历
                </span>
              ),
              children: <SimpleCalendarView />
            }
          ]}
        />
      </Card>

      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="title"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="description"
            label="任务描述"
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item
            name="projectId"
            label="所属项目"
            rules={[{ required: true, message: '请选择所属项目' }]}
          >
            <Select placeholder="请选择所属项目">
              {Array.isArray(projects) ? projects.map((project: any) => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              )) : []}
            </Select>
          </Form.Item>

          <Form.Item
            name="assignee"
            label="负责人"
            rules={[{ required: true, message: '请输入负责人' }]}
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>

          <Form.Item
            name="priority"
            label="优先级"
            rules={[{ required: true, message: '请选择优先级' }]}
            initialValue={50}
          >
            <Select placeholder="请选择优先级">
              <Option value={10}>低 (10)</Option>
              <Option value={30}>中低 (30)</Option>
              <Option value={50}>中 (50)</Option>
              <Option value={70}>中高 (70)</Option>
              <Option value={80}>高 (80)</Option>
              <Option value={90}>紧急 (90)</Option>
              <Option value={100}>紧急 (100)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="状态"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="未开始"
          >
            <Select placeholder="请选择状态">
              <Option value="未开始">未开始</Option>
              <Option value="进行中">进行中</Option>
              <Option value="已完成">已完成</Option>
              <Option value="已暂停">已暂停</Option>
              <Option value="已取消">已取消</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="estimate"
            label="预估工时"
          >
            <Input placeholder="请输入预估工时" type="number" />
          </Form.Item>

          <Form.Item
            name="due"
            label="截止日期"
          >
            <Input type="date" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingTask ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TasksFull;