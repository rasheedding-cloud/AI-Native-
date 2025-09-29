import React, { useState, useEffect } from 'react';
import { Card, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Avatar } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useStore } from '../../store';

const { TextArea } = Input;
const { Option } = Select;

interface TaskListsProps {
  project: any;
}

const TaskLists: React.FC<TaskListsProps> = ({ project }) => {
  const { loading, setLoading, setError } = useStore();
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [editingList, setEditingList] = useState<any>(null);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [selectedList, setSelectedList] = useState<any>(null);
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [listForm] = Form.useForm();
  const [taskForm] = Form.useForm();

  useEffect(() => {
    // 模拟任务列表数据
    const mockLists = [
      {
        id: 'list1',
        name: '待规划',
        projectId: project.id,
        sortOrder: 1,
        tasks: project.tasks?.filter((task: any) => task.status === '未开始') || []
      },
      {
        id: 'list2',
        name: '本周任务',
        projectId: project.id,
        sortOrder: 2,
        tasks: project.tasks?.filter((task: any) => task.status === '进行中') || []
      },
      {
        id: 'list3',
        name: '已完成',
        projectId: project.id,
        sortOrder: 3,
        tasks: project.tasks?.filter((task: any) => task.status === '已完成') || []
      }
    ];
    setTaskLists(mockLists);
  }, [project]);

  const handleCreateList = () => {
    setEditingList(null);
    setIsListModalVisible(true);
    listForm.resetFields();
  };

  const handleEditList = (list: any) => {
    setEditingList(list);
    setIsListModalVisible(true);
    listForm.setFieldsValue(list);
  };

  const handleDeleteList = async (listId: string) => {
    try {
      // 模拟删除列表
      setTaskLists(prev => prev.filter(list => list.id !== listId));
      message.success('删除列表成功');
    } catch (error) {
      message.error('删除列表失败');
    }
  };

  const handleListSubmit = async (values: any) => {
    try {
      if (editingList) {
        // 更新列表
        setTaskLists(prev => prev.map(list =>
          list.id === editingList.id ? { ...list, ...values } : list
        ));
        message.success('更新列表成功');
      } else {
        // 创建新列表
        const newList = {
          id: `list${Date.now()}`,
          projectId: project.id,
          sortOrder: taskLists.length + 1,
          tasks: [],
          ...values
        };
        setTaskLists(prev => [...prev, newList]);
        message.success('创建列表成功');
      }
      setIsListModalVisible(false);
      listForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleCreateTask = (list: any) => {
    setSelectedList(list);
    setEditingTask(null);
    setIsTaskModalVisible(true);
    taskForm.resetFields();
  };

  const handleEditTask = (task: any) => {
    setEditingTask(task);
    setIsTaskModalVisible(true);
    taskForm.setFieldsValue(task);
  };

  const handleTaskSubmit = async (values: any) => {
    try {
      if (editingTask) {
        // 更新任务
        const updatedTask = { ...editingTask, ...values };
        setTaskLists(prev => prev.map(list => ({
          ...list,
          tasks: list.tasks.map((task: any) =>
            task.id === editingTask.id ? updatedTask : task
          )
        })));
        message.success('更新任务成功');
      } else {
        // 创建新任务
        const newTask = {
          id: `task${Date.now()}`,
          projectId: project.id,
          listId: selectedList.id,
          status: 'TODO',
          priority: 50,
          progress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...values
        };
        setTaskLists(prev => prev.map(list =>
          list.id === selectedList.id
            ? { ...list, tasks: [...list.tasks, newTask] }
            : list
        ));
        message.success('创建任务成功');
      }
      setIsTaskModalVisible(false);
      taskForm.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'TODO': 'default',
      'DOING': 'processing',
      'DONE': 'success',
      'BLOCKED': 'error'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 80) return 'red';
    if (priority >= 60) return 'orange';
    return 'blue';
  };

  return (
    <div>
      {/* 列表操作栏 */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>任务列表</h3>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateList}
        >
          新建列表
        </Button>
      </div>

      {/* 任务列表容器 */}
      <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '8px 0' }}>
        {taskLists.map((list) => (
          <Card
            key={list.id}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{list.name}</span>
                <Space>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEditList(list)}
                  />
                  <Popconfirm
                    title="确定要删除这个列表吗？"
                    onConfirm={() => handleDeleteList(list.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button
                      type="text"
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>
                </Space>
              </div>
            }
            style={{
              minWidth: '300px',
              flex: '0 0 auto',
              maxHeight: '600px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
            bodyStyle={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px'
            }}
          >
            {/* 任务卡片列表 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {list.tasks.map((task: any) => (
                <Card
                  key={task.id}
                  size="small"
                  style={{
                    cursor: 'pointer',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease'
                  }}
                  hoverable
                  onClick={() => handleEditTask(task)}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <strong>{task.title}</strong>
                  </div>
                  {task.description && (
                    <div style={{ color: '#666', fontSize: '12px', marginBottom: '8px' }}>
                      {task.description}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      <Tag color={getStatusColor(task.status)} style={{ fontSize: '10px' }}>
                        {task.status}
                      </Tag>
                      <Tag color={getPriorityColor(task.priority)} style={{ fontSize: '10px' }}>
                        {task.priority}
                      </Tag>
                    </div>
                    {task.assignee && (
                      <Avatar size="small" style={{ backgroundColor: '#87d068' }}>
                        {task.assignee.charAt(0)}
                      </Avatar>
                    )}
                  </div>
                  {task.due && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '11px', color: '#999' }}>
                      <CalendarOutlined />
                      <span>{new Date(task.due).toLocaleDateString()}</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* 添加任务按钮 */}
            <Button
              type="dashed"
              block
              size="small"
              icon={<PlusOutlined />}
              onClick={() => handleCreateTask(list)}
              style={{ marginTop: '8px' }}
            >
              添加任务
            </Button>
          </Card>
        ))}
      </div>

      {/* 列表编辑模态框 */}
      <Modal
        title={editingList ? '编辑列表' : '新建列表'}
        open={isListModalVisible}
        onCancel={() => setIsListModalVisible(false)}
        footer={null}
      >
        <Form
          form={listForm}
          layout="vertical"
          onFinish={handleListSubmit}
        >
          <Form.Item
            label="列表名称"
            name="name"
            rules={[{ required: true, message: '请输入列表名称' }]}
          >
            <Input placeholder="请输入列表名称" />
          </Form.Item>
          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsListModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingList ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 任务编辑模态框 */}
      <Modal
        title={editingTask ? '编辑任务' : '新建任务'}
        open={isTaskModalVisible}
        onCancel={() => setIsTaskModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={taskForm}
          layout="vertical"
          onFinish={handleTaskSubmit}
        >
          <Form.Item
            label="任务名称"
            name="title"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            label="任务描述"
            name="description"
          >
            <TextArea rows={3} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item
            label="负责人"
            name="assignee"
          >
            <Input placeholder="请输入负责人" />
          </Form.Item>

          <Form.Item
            label="优先级"
            name="priority"
            initialValue={50}
          >
            <Select>
              <Option value={10}>低 (10)</Option>
              <Option value={30}>中低 (30)</Option>
              <Option value={50}>中 (50)</Option>
              <Option value={70}>中高 (70)</Option>
              <Option value={90}>高 (90)</Option>
              <Option value={100}>紧急 (100)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            initialValue="TODO"
          >
            <Select>
              <Option value="TODO">待开始</Option>
              <Option value="DOING">进行中</Option>
              <Option value="DONE">已完成</Option>
              <Option value="BLOCKED">已阻塞</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsTaskModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingTask ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TaskLists;