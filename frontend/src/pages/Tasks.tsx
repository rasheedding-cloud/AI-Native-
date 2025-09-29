import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Progress, Tabs, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, UserOutlined, CalendarOutlined, UnorderedListOutlined, AppstoreOutlined } from '@ant-design/icons';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useStore } from '../store';
import { taskApi, calendarApi } from '../services/api';
import AIPriorityDock from '../components/tasks/AIPriorityDock';
import CalendarView from '../components/tasks/CalendarViewSimple';
import KanbanBoard from '../components/tasks/KanbanBoardSimple';

const { TextArea } = Input;
const { Option } = Select;

const Tasks: React.FC = () => {
  const { tasks, projects, calendarBlocks, setTasks, setCalendarBlocks, addTask, updateTask, deleteTask, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('list');
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    // 强制重新加载任务数据，确保数据新鲜
    try {
      setLoading(true);
      console.log('Loading tasks...');
      const response = await taskApi.getAll();
      const tasksData = response.data?.data || response.data || [];
      console.log('Loaded tasks:', tasksData);
      setTasks(tasksData);
    } catch (error) {
      console.error('Load tasks error:', error);
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
  };

  const handleEdit = (task: any) => {
    setEditingTask(task);
    setIsModalVisible(true);
    form.setFieldsValue(task);
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
      if (editingTask) {
        const response = await taskApi.update(editingTask.id, values);
        updateTask(editingTask.id, response.data?.data || response.data || response);
        message.success('更新成功');
      } else {
        const response = await taskApi.create(values);
        addTask(response.data?.data || response.data || response);
        message.success('创建成功');
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

  // 处理任务拖拽到日历
  const handleTaskDrop = async (task: any) => {
    try {
      const defaultStartTime = new Date();
      defaultStartTime.setHours(9, 0, 0, 0);
      const defaultEndTime = new Date(defaultStartTime);
      defaultEndTime.setHours(defaultStartTime.getHours() + 2);

      const newBlock = {
        taskId: task.id,
        title: task.title,
        description: task.description,
        startTime: defaultStartTime.toISOString(),
        endTime: defaultEndTime.toISOString(),
        priority: typeof task.priority === 'string' ?
          (task.priority === '紧急' ? 100 : task.priority === '高' ? 80 : task.priority === '中' ? 50 : 20) :
          task.priority || 50,
        status: 'PLANNED',
        userId: task.assignee
      };

      const response = await calendarApi.create(newBlock);
      setCalendarBlocks(prev => [...prev, response.data?.data || response.data]);
      message.success('任务已添加到日历');
    } catch (error) {
      setError('添加到日历失败');
      console.error('添加到日历失败:', error);
    }
  };

  // 处理AI规划
  const handleAIPlan = async () => {
    try {
      setLoading(true);
      const unscheduledTasks = tasks.filter(task =>
        task.status !== '已完成' &&
        !calendarBlocks.some(block => block.taskId === task.id) &&
        task.priority > 40
      );

      if (unscheduledTasks.length === 0) {
        message.info('所有高优先级任务已安排');
        return;
      }

      const planData = {
        userId: 'current-user',
        tasks: unscheduledTasks,
        workingHours: { start: 9, end: 18 },
        preferences: { preferMorning: true }
      };

      const response = await calendarApi.aiPlanWeek(planData);
      const newBlocks = response.data?.data || [];
      setCalendarBlocks(prev => [...prev, ...newBlocks]);
      message.success('AI智能规划完成');
    } catch (error) {
      setError('AI规划失败');
      console.error('AI规划失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 响应式状态管理
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 监听屏幕尺寸变化
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1200);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return (
    <div style={{
      padding: isMobile ? '8px' : '24px',
      display: 'flex',
      gap: isMobile ? '8px' : '16px',
      minHeight: 'calc(100vh - 80px)',
      height: '100%',
      flexDirection: isMobile ? 'column' : 'row',
      minWidth: '320px',
      overflow: 'hidden'
    }}>
      {/* 左侧任务管理区域 */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: isMobile ? '280px' : '400px',
        overflow: 'hidden'
      }}>
        <Card
          title={isMobile ? '任务' : '任务管理'}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size={isMobile ? 'small' : 'middle'}
            >
              {isMobile ? '+' : '新建任务'}
            </Button>
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
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
                  <div style={{ padding: isMobile ? '8px' : '16px', height: '100%', overflow: 'hidden' }}>
                    <Table
                      dataSource={Array.isArray(tasks) ? tasks : []}
                      columns={columns}
                      rowKey="id"
                      loading={loading}
                      scroll={{
                        y: isMobile ? 'calc(100vh - 250px)' : 'calc(100vh - 300px)',
                        x: isMobile ? 'max-content' : undefined
                      }}
                      pagination={isMobile ? {
                        simple: true,
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                      } : {
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                      }}
                      size={isMobile ? 'small' : 'middle'}
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
                children: (
                  <div className="kanban-tab-content">
                    <DndProvider backend={HTML5Backend}>
                      <KanbanBoard
                        onCreateTask={handleCreate}
                        onEditTask={handleEdit}
                      />
                    </DndProvider>
                  </div>
                )
              },
              {
                key: 'calendar',
                label: (
                  <span>
                    <CalendarOutlined />
                    日历
                  </span>
                ),
                children: (
                  <div className="calendar-tab-content" style={{ overflow: 'auto hidden' }}>
                    <CalendarView
                      onDateChange={(date) => {
                        console.log('日期变更:', date.format('YYYY-MM-DD'));
                      }}
                    />
                  </div>
                )
              }
            ]}
          />
        </Card>
      </div>

      {/* 任务编辑模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={isMobile ? '95%' : isTablet ? '90%' : 800}
        style={{ top: isMobile ? 20 : 100 }}
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

export default Tasks;