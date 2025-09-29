import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { taskApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const TasksSimple: React.FC = () => {
  const { tasks, projects, setTasks, addTask, updateTask, deleteTask, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
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

  return (
    <div style={{ padding: '24px' }}>
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
      >
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

export default TasksSimple;