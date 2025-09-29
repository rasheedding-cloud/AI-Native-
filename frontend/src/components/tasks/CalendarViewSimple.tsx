import React, { useState, useEffect } from 'react';
import WeekViewSimple from './WeekViewSimple';
import { Card, Button, Modal, Form, Input, Select, Space, Alert, Tag, message, Calendar as AntCalendar, Badge, Radio } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  ThunderboltOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useStore } from '../../store';
import { calendarApi, taskApi } from '../../services/api';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface CalendarBlock {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: number;
}

const CalendarViewSimple: React.FC<{
  onDateChange?: (date: dayjs.Dayjs) => void;
}> = ({ onDateChange }) => {
  const { tasks, calendarBlocks, setCalendarBlocks, loading, setLoading, setError } = useStore();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [form] = Form.useForm();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    loadCalendarBlocks();
  }, []);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(selectedDate);
    }
  }, [selectedDate, onDateChange]);

  // 响应式检测
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

  const loadCalendarBlocks = async () => {
    try {
      setLoading(true);
      const response = await calendarApi.getAll();
      const blocksData = response.data?.data || response.data || [];
      setCalendarBlocks(blocksData);
    } catch (error) {
      console.error('Load calendar blocks error:', error);
      setError('加载日历数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = () => {
    setEditingBlock(null);
    setIsModalVisible(true);
    form.resetFields();
    form.setFieldsValue({
      startTime: selectedDate.format('YYYY-MM-DD HH:mm'),
      endTime: selectedDate.add(1, 'hour').format('YYYY-MM-DD HH:mm')
    });
  };

  const handleEditBlock = (block: any) => {
    setEditingBlock(block);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...block,
      startTime: dayjs(block.startTime).format('YYYY-MM-DD HH:mm'),
      endTime: dayjs(block.endTime).format('YYYY-MM-DD HH:mm')
    });
  };

  const handleDeleteBlock = async (id: string) => {
    try {
      await calendarApi.delete(id);
      setCalendarBlocks(prev => prev.filter(block => block.id !== id));
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const blockData = {
        ...values,
        startTime: dayjs(values.startTime).toISOString(),
        endTime: dayjs(values.endTime).toISOString(),
        priority: values.priority || 50,
        status: values.status || 'PLANNED'
      };

      if (editingBlock) {
        const response = await calendarApi.update(editingBlock.id, blockData);
        setCalendarBlocks(prev => prev.map(block =>
          block.id === editingBlock.id ? response.data?.data || response.data : block
        ));
        message.success('更新成功');
      } else {
        const response = await calendarApi.create(blockData);
        setCalendarBlocks(prev => [...prev, response.data?.data || response.data]);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleAIPlan = async () => {
    try {
      setLoading(true);
      const unscheduledTasks = tasks.filter(task =>
        task.status !== '已完成' &&
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

  // 获取指定日期的时间块
  const getBlocksForDate = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return calendarBlocks.filter(block =>
      dayjs(block.startTime).format('YYYY-MM-DD') === dateStr
    );
  };

  // 自定义日期单元格渲染
  const dateCellRender = (date: any) => {
    const blocks = getBlocksForDate(date);
    return (
      <div style={{ height: '100%', overflow: 'hidden' }}>
        {blocks.slice(0, 3).map(block => (
          <div key={block.id} style={{ marginBottom: '2px' }}>
            <Badge
              status={block.priority > 70 ? 'error' : block.priority > 50 ? 'warning' : 'default'}
              text={<span style={{ fontSize: '10px' }}>{block.title}</span>}
            />
          </div>
        ))}
        {blocks.length > 3 && (
          <div style={{ fontSize: '10px', color: '#666' }}>
            +{blocks.length - 3} 更多
          </div>
        )}
      </div>
    );
  };

  const monthCellRender = (date: any) => {
    const blocks = getBlocksForDate(date);
    return blocks.length > 0 ? (
      <div style={{ fontSize: '12px' }}>
        <Badge count={blocks.length} offset={[10, 0]} />
      </div>
    ) : null;
  };

  return (
    <div style={{ padding: '16px', height: '100%', display: 'flex', gap: '16px' }}>
      {/* 左侧AI优先级Dock */}
      <div style={{ width: '300px', flexShrink: 0 }} className="ai-priority-dock">
        <Card
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ThunderboltOutlined />
              <span>AI优先级任务</span>
            </div>
          }
          size="small"
          style={{ height: '100%' }}
          bodyStyle={{ height: 'calc(100% - 57px)', overflowY: 'auto' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              onClick={handleAIPlan}
              loading={loading}
              block
            >
              AI规划本周
            </Button>

            {/* 高优先级任务列表 */}
            <div style={{ maxHeight: 'calc(100vh - 300px)', overflowY: 'auto' }}>
              {tasks
                .filter(task => task.status !== 'DONE' && task.status !== '已完成')
                .sort((a, b) => (b.priority || 0) - (a.priority || 0))
                .map(task => (
                <Card
                  key={task.id}
                  size="small"
                  style={{ marginBottom: '8px', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedDate(dayjs());
                    handleAddBlock();
                  }}
                >
                  <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                    {task.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#666' }}>
                    优先级: {task.priority}
                  </div>
                  {task.assignee && (
                    <div style={{ fontSize: '10px', color: '#666' }}>
                      负责人: {task.assignee}
                    </div>
                  )}
                  <Tag color={(task.priority || 0) > 80 ? 'red' : (task.priority || 0) > 60 ? 'orange' : 'blue'} size="small">
                    {(task.priority || 0) > 80 ? '紧急' : (task.priority || 0) > 60 ? '高' : '中'}
                  </Tag>
                </Card>
              ))}
            </div>
          </Space>
        </Card>
      </div>

      {/* 右侧日历区域 */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card
          title="日历视图"
          extra={
            <Space>
              <Button
                icon={<PlusOutlined />}
                onClick={handleAddBlock}
                size="small"
              >
                新建
              </Button>
            </Space>
          }
          style={{ flex: 1 }}
          bodyStyle={{ height: 'calc(100% - 57px)', overflow: 'visible' }}
        >
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }} className="calendar-view-wrapper">
            <div style={{
              padding: '16px',
              borderBottom: '1px solid #f0f0f0',
              backgroundColor: '#fafafa'
            }}>
              <Space>
                <Button
                  size="small"
                  onClick={() => setSelectedDate(dayjs())}
                >
                  今天
                </Button>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginLeft: '16px'
                }}>
                  {selectedDate.format('YYYY年MM月DD日')}
                </span>
                <div style={{ marginLeft: 'auto' }}>
                  <Radio.Group
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    size="small"
                  >
                    <Radio.Button value="month">月</Radio.Button>
                    <Radio.Button value="week">周</Radio.Button>
                  </Radio.Group>
                </div>
              </Space>
            </div>

            <div style={{ flex: 1, overflow: 'visible', padding: '16px', minHeight: '400px' }}>
              {viewMode === 'month' ? (
                <AntCalendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  cellRender={(date, info) => {
                    if (info.type === 'date') {
                      return dateCellRender(date);
                    }
                    return null;
                  }}
                  fullscreen={false}
                />
              ) : (
                <WeekViewSimple
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  calendarBlocks={calendarBlocks}
                />
              )}
            </div>
          </div>
        </Card>

        {/* 选中日期的时间块列表 */}
        <Card
          title={`${selectedDate.format('YYYY年MM月DD日')} 的时间安排`}
          size="small"
          style={{ marginTop: '16px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {getBlocksForDate(selectedDate).map(block => (
              <Card key={block.id} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{block.title}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {dayjs(block.startTime).format('HH:mm')} - {dayjs(block.endTime).format('HH:mm')}
                    </div>
                    <Tag color={block.priority > 70 ? 'red' : block.priority > 50 ? 'orange' : 'blue'}>
                      优先级: {block.priority}
                    </Tag>
                  </div>
                  <Space>
                    <Button size="small" onClick={() => handleEditBlock(block)}>
                      编辑
                    </Button>
                    <Button size="small" danger onClick={() => handleDeleteBlock(block.id)}>
                      删除
                    </Button>
                  </Space>
                </div>
              </Card>
            ))}
            {getBlocksForDate(selectedDate).length === 0 && (
              <div style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                当日无安排
              </div>
            )}
          </Space>
        </Card>
      </div>

      {/* 编辑模态框 - 响应式宽度 */}
      <Modal
        title={editingBlock ? '编辑时间块' : '创建时间块'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={isMobile ? '95%' : isTablet ? '80%' : 600}
        style={{ top: isMobile ? 20 : 100 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="taskId"
            label="关联任务"
            rules={[{ required: true, message: '请选择关联任务' }]}
          >
            <Select placeholder="请选择关联任务">
              {tasks.map(task => (
                <Option key={task.id} value={task.id}>
                  {task.title}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input placeholder="请输入标题" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
          >
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <Input type="datetime-local" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <Input type="datetime-local" />
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

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingBlock ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CalendarViewSimple;