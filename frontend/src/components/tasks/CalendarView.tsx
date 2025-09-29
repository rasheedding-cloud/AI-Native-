import React, { useState, useEffect, useCallback } from 'react';
import { Card, Button, Modal, Form, Input, Select, DatePicker, Space, Alert, Tag, Tooltip, message, Row, Col } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  InfoCircleOutlined,
  LeftOutlined,
  RightOutlined,
  CalendarFilled,
  ThunderboltOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useStore } from '../../store';
import { calendarApi, taskApi } from '../../services/api';
import dayjs from 'dayjs';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';

// 扩展dayjs插件
dayjs.extend(weekday);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

const { TextArea } = Input;
const { Option } = Select;

interface CalendarBlock {
  id: string;
  taskId: string;
  userId?: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: number;
  progress: number;
  aiReasoning?: string;
  conflictLevel: string;
  conflictInfo?: string;
  task?: {
    title: string;
    assignee?: string;
    project?: {
      name: string;
    };
  };
}

interface CalendarViewProps {
  onDateChange?: (date: dayjs.Dayjs) => void;
}

// 时间轴组件
const TimeAxis: React.FC<{ timeSlot: number }> = ({ timeSlot }) => {
  const times = [];
  for (let i = 0; i < 24; i += timeSlot) {
    const time = `${i.toString().padStart(2, '0')}:00`;
    times.push(
      <div key={i} style={{
        height: `${timeSlot * 2}px`,
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        color: '#666',
        backgroundColor: '#fafafa'
      }}>
        {time}
      </div>
    );
  }
  return <div>{times}</div>;
};

// 时间块组件
const TimeBlock: React.FC<{
  block: CalendarBlock;
  onEdit: (block: CalendarBlock) => void;
  onDelete: (id: string) => void;
  onResize: (id: string, newEnd: dayjs.Dayjs) => void;
}> = ({ block, onEdit, onDelete, onResize }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'block',
    item: { type: 'block', block },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getConflictColor = (level: string) => {
    switch (level) {
      case 'HIGH': return '#ff4d4f';
      case 'MEDIUM': return '#faad14';
      case 'LOW': return '#fa8c16';
      default: return '#52c41a';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'processing';
      case 'PLANNED': return 'default';
      case 'CANCELLED': return 'error';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'red';
    if (priority >= 80) return 'volcano';
    if (priority >= 70) return 'orange';
    return 'gold';
  };

  const startTime = dayjs(block.startTime);
  const endTime = dayjs(block.endTime);
  const duration = endTime.diff(startTime, 'hour', true);
  const top = startTime.hour() * 2 + startTime.minute() / 30;
  const height = duration * 2;

  return (
    <div
      ref={drag}
      style={{
        position: 'absolute',
        top: `${top}px`,
        left: '4px',
        right: '4px',
        height: `${height}px`,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        borderLeft: `4px solid ${getConflictColor(block.conflictLevel)}`,
        backgroundColor: '#fff',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        zIndex: 10
      }}
      onClick={() => onEdit(block)}
    >
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <div style={{ fontWeight: 'bold', fontSize: '12px', marginBottom: '2px' }}>
            {block.title}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            <ClockCircleOutlined style={{ marginRight: '4px' }} />
            {startTime.format('HH:mm')} - {endTime.format('HH:mm')} ({duration.toFixed(1)}h)
          </div>
          {block.task?.assignee && (
            <div style={{ fontSize: '11px', color: '#666' }}>
              <UserOutlined style={{ marginRight: '4px' }} />
              {block.task.assignee}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginTop: '2px' }}>
          <Tag color={getStatusColor(block.status)} style={{ fontSize: '10px' }}>
            {block.status}
          </Tag>
          <Tag color={getPriorityColor(block.priority)} style={{ fontSize: '10px' }}>
            {block.priority}
          </Tag>
          {block.aiReasoning && (
            <Tooltip title={`AI建议: ${block.aiReasoning}`}>
              <InfoCircleOutlined style={{ fontSize: '12px', color: '#1890ff' }} />
            </Tooltip>
          )}
        </div>

        {block.conflictLevel !== 'NONE' && (
          <Alert
            message={`冲突检测: ${block.conflictLevel}`}
            type="warning"
            style={{ marginTop: '2px', padding: '1px 4px', fontSize: '9px' }}
          />
        )}

        {/* 调整大小手柄 */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '8px',
            cursor: 'ns-resize',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            borderRadius: '0 0 4px 4px'
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            const startY = e.clientY;
            const startHeight = height;

            const handleMouseMove = (moveEvent: MouseEvent) => {
              const deltaY = moveEvent.clientY - startY;
              const newHeight = Math.max(1, startHeight + deltaY / 2);
              const newEnd = startTime.add(newHeight / 2, 'hour');
              onResize(block.id, newEnd);
            };

            const handleMouseUp = () => {
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </div>
    </div>
  );
};

// 日历格子组件
const CalendarCell: React.FC<{
  date: dayjs.Dayjs;
  blocks: CalendarBlock[];
  onBlockDrop: (date: dayjs.Dayjs, item: any) => void;
  onEditBlock: (block: CalendarBlock) => void;
  onDeleteBlock: (id: string) => void;
  onAddBlock: (date: dayjs.Dayjs) => void;
  onResizeBlock: (id: string, newEnd: dayjs.Dayjs) => void;
  timeSlot: number;
}> = ({ date, blocks, onBlockDrop, onEditBlock, onDeleteBlock, onAddBlock, onResizeBlock, timeSlot }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['task', 'block'],
    drop: (item: any) => onBlockDrop(date, item),
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const isToday = date.isSame(dayjs(), 'day');
  const isWeekend = date.day() === 0 || date.day() === 6;

  return (
    <div
      ref={drop}
      style={{
        border: '1px solid #f0f0f0',
        borderRadius: '4px',
        backgroundColor: isToday ? '#f0f8ff' : (isWeekend ? '#fafafa' : '#fff'),
        minHeight: '600px',
        position: 'relative',
        transition: 'all 0.2s ease'
      }}
    >
      {/* 日期标题 */}
      <div style={{
        padding: '8px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: isToday ? '#e6f7ff' : '#fafafa',
        borderTopLeftRadius: '4px',
        borderTopRightRadius: '4px',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: isToday ? 'bold' : 'normal',
          color: isToday ? '#1890ff' : '#666'
        }}>
          {date.date()}
        </div>
        <div style={{ fontSize: '10px', color: '#999' }}>
          {date.format('ddd')}
        </div>
      </div>

      {/* 时间网格 */}
      <div style={{
        position: 'relative',
        height: `${48 * timeSlot}px`,
        overflow: 'hidden'
      }}>
        {/* 时间线 */}
        {Array.from({ length: 24 * (60 / timeSlot) }).map((_, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top: `${index * timeSlot * 2}px`,
              left: 0,
              right: 0,
              height: '1px',
              backgroundColor: '#f0f0f0',
              zIndex: 1
            }}
          />
        ))}

        {/* 当前时刻线 */}
        {isToday && (
          <div
            style={{
              position: 'absolute',
              top: `${(dayjs().hour() + dayjs().minute() / 60) * 2}px`,
              left: 0,
              right: 0,
              height: '2px',
              backgroundColor: '#ff4d4f',
              zIndex: 5,
              boxShadow: '0 0 4px rgba(255, 77, 79, 0.5)'
            }}
          />
        )}

        {/* 时间块 */}
        {blocks.map(block => (
          <TimeBlock
            key={block.id}
            block={block}
            onEdit={onEditBlock}
            onDelete={onDeleteBlock}
            onResize={onResizeBlock}
          />
        ))}

        {isOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            border: '2px dashed #1890ff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <PlusOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
          </div>
        )}
      </div>

      {/* 添加按钮 */}
      <Button
        type="dashed"
        size="small"
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          zIndex: 20
        }}
        icon={<PlusOutlined />}
        onClick={() => onAddBlock(date)}
      />
    </div>
  );
};

// 主日历视图组件
const CalendarView: React.FC<CalendarViewProps> = ({ onDateChange }) => {
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [timeSlot, setTimeSlot] = useState<number>(30); // 30分钟步长
  const [calendarBlocks, setCalendarBlocks] = useState<CalendarBlock[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBlock, setEditingBlock] = useState<CalendarBlock | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { tasks, setLoading: setGlobalLoading, setError } = useStore();

  // 获取日历数据
  const loadCalendarData = useCallback(async () => {
    try {
      setLoading(true);
      const startDate = currentDate.startOf(viewMode === 'week' ? 'week' : 'day').format('YYYY-MM-DD');
      const endDate = currentDate.endOf(viewMode === 'week' ? 'week' : 'day').format('YYYY-MM-DD');

      const response = await calendarApi.getAll({ startDate, endDate });
      setCalendarBlocks(response.data?.data || []);
    } catch (error) {
      setError('加载日历数据失败');
      console.error('加载日历数据失败:', error);
    } finally {
      setLoading(false);
    }
  }, [currentDate, viewMode, setError]);

  useEffect(() => {
    loadCalendarData();
  }, [loadCalendarData]);

  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate);
    }
  }, [currentDate, onDateChange]);

  // 获取日期范围
  const getDateRange = () => {
    if (viewMode === 'week') {
      const startOfWeek = currentDate.startOf('week');
      return Array.from({ length: 7 }, (_, i) => startOfWeek.add(i, 'day'));
    } else {
      return [currentDate];
    }
  };

  // 获取指定日期的时间块
  const getBlocksForDate = (date: dayjs.Dayjs) => {
    const dateStr = date.format('YYYY-MM-DD');
    return calendarBlocks
      .filter(block => dayjs(block.startTime).format('YYYY-MM-DD') === dateStr)
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
  };

  // 处理拖拽放置
  const handleBlockDrop = async (date: dayjs.Dayjs, item: any) => {
    try {
      setGlobalLoading(true);

      if (item.type === 'task') {
        // 从任务创建时间块
        const task = item.task;
        const defaultStartTime = date.hour(9).minute(0);
        const defaultEndTime = date.hour(11).minute(0);

        const newBlock = {
          taskId: task.id,
          title: task.title,
          description: task.description,
          startTime: defaultStartTime.toISOString(),
          endTime: defaultEndTime.toISOString(),
          priority: task.priority,
          status: 'PLANNED'
        };

        const response = await calendarApi.create(newBlock);
        setCalendarBlocks(prev => [...prev, response.data?.data || response.data]);
        message.success('任务已添加到日历');
      } else if (item.type === 'block' && item.block) {
        // 移动现有时间块
        const block = item.block;
        const startTime = dayjs(block.startTime);
        const endTime = dayjs(block.endTime);
        const duration = endTime.diff(startTime, 'hour');

        const newStartTime = date.hour(startTime.hour()).minute(startTime.minute());
        const newEndTime = newStartTime.add(duration, 'hour');

        const response = await calendarApi.update(block.id, {
          startTime: newStartTime.toISOString(),
          endTime: newEndTime.toISOString()
        });

        setCalendarBlocks(prev =>
          prev.map(b => b.id === block.id ? (response.data?.data || response.data) : b)
        );
        message.success('时间块已移动');
      }
    } catch (error) {
      setError('操作失败');
      console.error('拖拽操作失败:', error);
    } finally {
      setGlobalLoading(false);
    }
  };

  // 处理时间块编辑
  const handleEditBlock = (block: CalendarBlock) => {
    setEditingBlock(block);
    form.setFieldsValue({
      ...block,
      startTime: dayjs(block.startTime),
      endTime: dayjs(block.endTime)
    });
    setIsModalVisible(true);
  };

  // 处理时间块删除
  const handleDeleteBlock = async (id: string) => {
    try {
      await calendarApi.delete(id);
      setCalendarBlocks(prev => prev.filter(block => block.id !== id));
      message.success('时间块已删除');
    } catch (error) {
      setError('删除失败');
      console.error('删除时间块失败:', error);
    }
  };

  // 处理时间块调整大小
  const handleResizeBlock = async (id: string, newEnd: dayjs.Dayjs) => {
    try {
      const response = await calendarApi.update(id, {
        endTime: newEnd.toISOString()
      });

      setCalendarBlocks(prev =>
        prev.map(block => block.id === id ? (response.data?.data || response.data) : block)
      );
    } catch (error) {
      setError('调整时间失败');
      console.error('调整时间失败:', error);
    }
  };

  // 处理添加时间块
  const handleAddBlock = (date: dayjs.Dayjs) => {
    setSelectedDate(date);
    setEditingBlock(null);
    form.resetFields();
    form.setFieldsValue({
      startTime: date.hour(9).minute(0),
      endTime: date.hour(11).minute(0)
    });
    setIsModalVisible(true);
  };

  // 处理表单提交
  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString()
      };

      if (editingBlock) {
        const response = await calendarApi.update(editingBlock.id, submitData);
        setCalendarBlocks(prev =>
          prev.map(block => block.id === editingBlock.id ? (response.data?.data || response.data) : block)
        );
        message.success('时间块已更新');
      } else {
        const response = await calendarApi.create(submitData);
        setCalendarBlocks(prev => [...prev, response.data?.data || response.data]);
        message.success('时间块已创建');
      }

      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      setError('操作失败');
      console.error('保存时间块失败:', error);
    }
  };

  // 处理AI规划
  const handleAIPlan = async () => {
    try {
      setLoading(true);
      const planData = {
        from: currentDate.startOf('week').format('YYYY-MM-DD'),
        to: currentDate.endOf('week').format('YYYY-MM-DD'),
        working_hours: { start: '09:00', end: '18:00', tz: 'Asia/Shanghai' },
        break_rules: { avoid_prayer: false, avoid_weekend: false }
      };

      const response = await calendarApi.aiPlanWeek(planData);
      const suggestion = response.data?.data;

      Modal.confirm({
        title: 'AI规划建议',
        content: `AI已为您生成本周的规划建议，共包含${suggestion.items?.length || 0}个时间块。是否应用这些建议？`,
        onOk: async () => {
          try {
            const applyResponse = await calendarApi.applySuggestion({
              suggestion_id: suggestion.suggestion_id,
              item_ids: suggestion.items?.map((item: any) => item.task_id) || []
            });
            message.success(`已成功应用${applyResponse.data?.applied_block_ids?.length || 0}个时间块`);
            loadCalendarData();
          } catch (error) {
            setError('应用AI规划失败');
          }
        }
      });
    } catch (error) {
      setError('AI规划失败');
      console.error('AI规划失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 导航控制
  const navigateDate = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'prev'
        ? prev.subtract(1, viewMode === 'week' ? 'week' : 'day')
        : prev.add(1, viewMode === 'week' ? 'week' : 'day')
    );
  };

  const goToToday = () => {
    setCurrentDate(dayjs());
  };

  const dateRange = getDateRange();

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ padding: '16px', height: '100%', display: 'flex', gap: '16px' }}>
        {/* 左侧AI优先级Dock */}
        <div style={{ width: '300px', flexShrink: 0 }}>
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
              {tasks
                .filter(task => task.priority > 70 && task.status !== 'DONE')
                .sort((a, b) => b.priority - a.priority)
                .slice(0, 10)
                .map(task => (
                  <Card
                    key={task.id}
                    size="small"
                    style={{ marginBottom: '8px', cursor: 'move' }}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('task', JSON.stringify(task));
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {task.title}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <Tag color="red">优先级: {task.priority}</Tag>
                      {task.due && (
                        <span style={{ fontSize: '10px', color: '#666' }}>
                          {dayjs(task.due).format('MM/DD')}
                        </span>
                      )}
                    </div>
                  </Card>
                ))}
            </Space>
          </Card>
        </div>

        {/* 主日历区域 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* 控制栏 */}
          <Card style={{ marginBottom: '16px' }}>
            <Space wrap>
              <Button
                icon={<LeftOutlined />}
                onClick={() => navigateDate('prev')}
                size="small"
              >
                上一{viewMode === 'week' ? '周' : '天'}
              </Button>

              <Button
                type="primary"
                icon={<CalendarFilled />}
                onClick={goToToday}
                size="small"
              >
                今天
              </Button>

              <Button
                icon={<RightOutlined />}
                onClick={() => navigateDate('next')}
                size="small"
              >
                下一{viewMode === 'week' ? '周' : '天'}
              </Button>

              <Select
                value={viewMode}
                onChange={setViewMode}
                style={{ width: 80 }}
                size="small"
              >
                <Option value="week">周</Option>
                <Option value="day">日</Option>
              </Select>

              <Select
                value={timeSlot}
                onChange={setTimeSlot}
                style={{ width: 100 }}
                size="small"
              >
                <Option value={30}>30分钟</Option>
                <Option value={60}>60分钟</Option>
              </Select>

              <div style={{ fontSize: '16px', fontWeight: 'bold', marginLeft: '16px' }}>
                {viewMode === 'week'
                  ? `${currentDate.startOf('week').format('MM/DD')} - ${currentDate.endOf('week').format('MM/DD')}`
                  : currentDate.format('YYYY年MM月DD日')
                }
              </div>
            </Space>
          </Card>

          {/* 日历网格 */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <Row gutter={[16, 0]}>
              <Col span={3}>
                <Card size="small" style={{ height: '100%' }}>
                  <TimeAxis timeSlot={timeSlot} />
                </Card>
              </Col>
              <Col span={21}>
                <div style={{
                  display: 'flex',
                  gap: '16px',
                  height: '100%',
                  overflowX: 'auto'
                }}>
                  {dateRange.map((date, index) => (
                    <div key={index} style={{ minWidth: viewMode === 'week' ? '200px' : '100%', flex: 1 }}>
                      <CalendarCell
                        date={date}
                        blocks={getBlocksForDate(date)}
                        onBlockDrop={handleBlockDrop}
                        onEditBlock={handleEditBlock}
                        onDeleteBlock={handleDeleteBlock}
                        onAddBlock={handleAddBlock}
                        onResizeBlock={handleResizeBlock}
                        timeSlot={timeSlot}
                      />
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </div>
        </div>

        {/* 编辑模态框 */}
        <Modal
          title={editingBlock ? '编辑时间块' : '创建时间块'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
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
              name="userId"
              label="负责人"
            >
              <Input placeholder="请输入负责人" />
            </Form.Item>

            <Form.Item
              label="时间范围"
              required
            >
              <Space>
                <Form.Item
                  name="startTime"
                  rules={[{ required: true, message: '请选择开始时间' }]}
                  noStyle
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="开始时间"
                  />
                </Form.Item>
                <Form.Item
                  name="endTime"
                  rules={[{ required: true, message: '请选择结束时间' }]}
                  noStyle
                >
                  <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm"
                    placeholder="结束时间"
                  />
                </Form.Item>
              </Space>
            </Form.Item>

            <Form.Item
              name="priority"
              label="优先级"
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
              name="status"
              label="状态"
              initialValue="PLANNED"
            >
              <Select>
                <Option value="PLANNED">已规划</Option>
                <Option value="IN_PROGRESS">进行中</Option>
                <Option value="COMPLETED">已完成</Option>
                <Option value="CANCELLED">已取消</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setIsModalVisible(false)}>
                  取消
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingBlock ? '更新' : '创建'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DndProvider>
  );
};

export default CalendarView;