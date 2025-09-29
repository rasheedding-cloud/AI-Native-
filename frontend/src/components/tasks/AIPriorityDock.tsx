import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Tag, Typography, Tooltip, Avatar, Progress, Badge, Alert } from 'antd';
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  DragOutlined,
  CalendarOutlined,
  UserOutlined,
  FireOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { useDrop } from 'react-dnd';
import { useStore } from '../../store';
import { calendarApi } from '../../services/api';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority: number;
  estimate?: number;
  due?: string;
  status: string;
  project?: {
    name: string;
  };
}

interface AIPriorityDockProps {
  onTaskDrop?: (task: Task) => void;
  onAIPlan?: () => void;
}

const AIPriorityDock: React.FC<AIPriorityDockProps> = ({ onTaskDrop, onAIPlan }) => {
  const { tasks, calendarBlocks } = useStore();
  const [loading, setLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // 获取高优先级任务（优先级 > 70）
  const getHighPriorityTasks = () => {
    return tasks
      .filter(task => task.priority > 70 && task.status !== '已完成')
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 8);
  };

  // 获取即将到期的任务
  const getUrgentTasks = () => {
    const now = dayjs();
    const threeDaysLater = now.add(3, 'day');

    return tasks
      .filter(task =>
        task.due &&
        dayjs(task.due).isBefore(threeDaysLater) &&
        task.status !== '已完成'
      )
      .sort((a, b) => dayjs(a.due).diff(dayjs(b.due)))
      .slice(0, 5);
  };

  // 获取未规划的任务
  const getUnscheduledTasks = () => {
    const scheduledTaskIds = calendarBlocks.map(block => block.taskId);
    return tasks
      .filter(task =>
        task.status !== '已完成' &&
        !scheduledTaskIds.includes(task.id) &&
        task.priority > 40
      )
      .slice(0, 6);
  };

  // 拖拽接收器
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'task',
    drop: (item: Task) => {
      if (onTaskDrop) {
        onTaskDrop(item);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // AI智能规划本周
  const handleAIPlanWeek = async () => {
    setLoading(true);
    try {
      const unscheduledTasks = getUnscheduledTasks();
      if (unscheduledTasks.length === 0) {
        setAiSuggestions([{
          type: 'info',
          message: '所有高优先级任务已安排，无需额外规划'
        }]);
        return;
      }

      // 模拟AI规划建议
      const suggestions = unscheduledTasks.map(task => ({
        taskId: task.id,
        title: task.title,
        priority: task.priority,
        estimate: task.estimate || 2,
        suggestion: `建议将${task.title}安排在明天上午，优先级${task.priority}，预计${task.estimate || 2}小时`,
        confidence: Math.floor(Math.random() * 30) + 70,
        reasoning: `基于任务优先级${task.priority}、截止日期${task.due ? dayjs(task.due).format('MM-DD') : '未设置'}和预估工时${task.estimate || 2}小时的智能分析`
      }));

      setAiSuggestions(suggestions);

      if (onAIPlan) {
        onAIPlan();
      }
    } catch (error) {
      console.error('AI规划失败:', error);
      setAiSuggestions([{
        type: 'error',
        message: 'AI规划失败，请稍后重试'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const highPriorityTasks = getHighPriorityTasks();
  const urgentTasks = getUrgentTasks();
  const unscheduledTasks = getUnscheduledTasks();

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'red';
    if (priority >= 80) return 'volcano';
    if (priority >= 70) return 'orange';
    return 'gold';
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 90) return '紧急';
    if (priority >= 80) return '高';
    if (priority >= 70) return '中高';
    return '中';
  };

  return (
    <div
      ref={drop}
      style={{
        width: '320px',
        border: isOver ? '2px dashed #1890ff' : '1px solid #f0f0f0',
        borderRadius: '8px',
        backgroundColor: isOver ? '#f0f8ff' : '#fafafa',
        transition: 'all 0.3s ease'
      }}
    >
      {/* AI控制台 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#1890ff' }} />
            <Text strong>AI优先级控制台</Text>
            <Badge count={highPriorityTasks.length} status="error" />
          </Space>
        }
        size="small"
        style={{ marginBottom: '8px' }}
        bodyStyle={{ padding: '8px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            block
            onClick={handleAIPlanWeek}
            loading={loading}
            size="small"
          >
            AI规划本周 ({unscheduledTasks.length}个未安排)
          </Button>

          <div style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            拖拽任务到日历区域自动安排时间
          </div>
        </Space>
      </Card>

      {/* 高优先级任务 */}
      {highPriorityTasks.length > 0 && (
        <Card
          title={
            <Space>
              <FireOutlined style={{ color: '#ff4d4f' }} />
              <Text strong>高优先级任务</Text>
              <Badge count={highPriorityTasks.length} />
            </Space>
          }
          size="small"
          style={{ marginBottom: '8px' }}
          bodyStyle={{ padding: '8px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {highPriorityTasks.map(task => (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('task', JSON.stringify(task));
                }}
                style={{
                  padding: '8px',
                  backgroundColor: '#fff',
                  border: '1px solid #f0f0f0',
                  borderRadius: '4px',
                  cursor: 'move',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.border = '1px solid #1890ff';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(24,144,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.border = '1px solid #f0f0f0';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size="small" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                    {getPriorityText(task.priority).charAt(0)}
                  </Avatar>
                  <div style={{ flex: 1 }}>
                    <Text style={{ fontSize: '12px', fontWeight: 'bold' }}>
                      {task.title}
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <Tag color={getPriorityColor(task.priority)} style={{ fontSize: '10px' }}>
                        {getPriorityText(task.priority)}
                      </Tag>
                      {task.estimate && (
                        <Tag color="blue" style={{ fontSize: '10px' }}>
                          {task.estimate}h
                        </Tag>
                      )}
                    </div>
                  </div>
                  <DragOutlined style={{ color: '#999', fontSize: '12px' }} />
                </div>
              </div>
            ))}
          </Space>
        </Card>
      )}

      {/* 紧急任务 */}
      {urgentTasks.length > 0 && (
        <Card
          title={
            <Space>
              <WarningOutlined style={{ color: '#faad14' }} />
              <Text strong>即将到期</Text>
              <Badge count={urgentTasks.length} status="warning" />
            </Space>
          }
          size="small"
          style={{ marginBottom: '8px' }}
          bodyStyle={{ padding: '8px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {urgentTasks.map(task => (
              <Alert
                key={task.id}
                message={task.title}
                description={
                  <Space>
                    <CalendarOutlined />
                    <Text style={{ fontSize: '11px' }}>
                      {dayjs(task.due).format('MM-DD HH:mm')}
                    </Text>
                    {task.assignee && (
                      <>
                        <UserOutlined />
                        <Text style={{ fontSize: '11px' }}>{task.assignee}</Text>
                      </>
                    )}
                  </Space>
                }
                type="warning"
                size="small"
                style={{ padding: '4px 8px' }}
              />
            ))}
          </Space>
        </Card>
      )}

      {/* AI建议 */}
      {aiSuggestions.length > 0 && (
        <Card
          title={
            <Space>
              <TrophyOutlined style={{ color: '#52c41a' }} />
              <Text strong>AI建议</Text>
            </Space>
          }
          size="small"
          bodyStyle={{ padding: '8px' }}
        >
          <Space direction="vertical" style={{ width: '100%' }} size="small">
            {aiSuggestions.map((suggestion, index) => (
              <Alert
                key={index}
                message={
                  <Space>
                    <Text strong style={{ fontSize: '12px' }}>
                      {suggestion.title || 'AI建议'}
                    </Text>
                    {suggestion.confidence && (
                      <Tag color="green" style={{ fontSize: '10px' }}>
                        {suggestion.confidence}% 置信度
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Paragraph style={{ fontSize: '11px', margin: 0 }}>
                      {suggestion.suggestion || suggestion.message}
                    </Paragraph>
                    {suggestion.reasoning && (
                      <Text style={{ fontSize: '10px', color: '#999' }}>
                        理由: {suggestion.reasoning}
                      </Text>
                    )}
                  </div>
                }
                type={suggestion.type === 'error' ? 'error' : 'success'}
                size="small"
                style={{ padding: '4px 8px' }}
              />
            ))}
          </Space>
        </Card>
      )}

      {/* 统计信息 */}
      <Card
        title={
          <Space>
            <InfoCircleOutlined style={{ color: '#1890ff' }} />
            <Text strong>统计</Text>
          </Space>
        }
        size="small"
        bodyStyle={{ padding: '8px' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="small">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '11px' }}>总任务:</Text>
            <Badge count={tasks.length} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '11px' }}>已安排:</Text>
            <Badge count={calendarBlocks.length} status="success" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: '11px' }}>未安排:</Text>
            <Badge count={unscheduledTasks.length} status="warning" />
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default AIPriorityDock;