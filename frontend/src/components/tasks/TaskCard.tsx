import React from 'react';
import { Card, Tag, Typography, Space, Button, Popconfirm, message, Tooltip, Badge } from 'antd';
import { EditOutlined, DeleteOutlined, UserOutlined, CalendarOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useDrag } from 'react-dnd';
import dayjs from 'dayjs';

const { Text, Paragraph } = Typography;

interface TaskCardProps {
  task: any;
  onEdit: (task: any) => void;
  onDelete: (id: string) => void;
  onDrop?: (taskId: string, newStatus: string) => void;
  isDraggable?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onEdit,
  onDelete,
  onDrop,
  isDraggable = true
}) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'task',
    item: { type: 'task', task },
    canDrag: isDraggable,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const getPriorityColor = (priority: number) => {
    if (priority >= 90) return 'red';
    if (priority >= 80) return 'volcano';
    if (priority >= 70) return 'orange';
    if (priority >= 50) return 'gold';
    if (priority >= 30) return 'lime';
    return 'green';
  };

  const getPriorityText = (priority: number) => {
    if (priority >= 90) return '紧急';
    if (priority >= 80) return '高';
    if (priority >= 70) return '中高';
    if (priority >= 50) return '中';
    if (priority >= 30) return '中低';
    return '低';
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

  const getDueDateStatus = (due: string) => {
    if (!due) return null;

    const dueDate = dayjs(due);
    const today = dayjs();
    const daysDiff = dueDate.diff(today, 'day');

    if (daysDiff < 0) {
      return { status: 'error', text: `逾期${Math.abs(daysDiff)}天` };
    } else if (daysDiff === 0) {
      return { status: 'warning', text: '今天到期' };
    } else if (daysDiff <= 3) {
      return { status: 'warning', text: `${daysDiff}天后到期` };
    } else {
      return { status: 'default', text: dueDate.format('MM/DD') };
    }
  };

  const dueDateStatus = getDueDateStatus(task.due);
  const isOverdue = dueDateStatus?.status === 'error';

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        cursor: isDraggable ? 'move' : 'default',
        marginBottom: '12px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: isOverdue ? '2px solid #ff4d4f' : '1px solid #f0f0f0',
        backgroundColor: '#fff',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        ':hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
          transform: 'translateY(-1px)'
        }
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        onEdit(task);
      }}
    >
      <Card
        size="small"
        bodyStyle={{ padding: '12px' }}
        style={{
          border: 'none',
          boxShadow: 'none',
          backgroundColor: 'transparent'
        }}
      >
        {/* 标题和优先级 */}
        <div style={{ marginBottom: '8px' }}>
          <Text
            strong
            style={{
              fontSize: '14px',
              color: isOverdue ? '#ff4d4f' : '#262626',
              display: 'block',
              marginBottom: '4px'
            }}
          >
            {task.title}
          </Text>
          <Space size={4}>
            <Tag color={getPriorityColor(task.priority)} style={{ fontSize: '10px' }}>
              {getPriorityText(task.priority)} ({task.priority})
            </Tag>
            <Tag color={getStatusColor(task.status)} style={{ fontSize: '10px' }}>
              {task.status}
            </Tag>
          </Space>
        </div>

        {/* 描述 */}
        {task.description && (
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '8px',
              lineHeight: '1.4'
            }}
          >
            {task.description}
          </Paragraph>
        )}

        {/* 项目信息 */}
        {task.project && (
          <div style={{ marginBottom: '8px' }}>
            <Badge
              color="blue"
              text={<Text style={{ fontSize: '11px', color: '#666' }}>
                {task.project.name}
              </Text>}
            />
          </div>
        )}

        {/* 底部信息栏 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px'
        }}>
          {/* 左侧信息 */}
          <Space size={8}>
            {task.assignee && (
              <Tooltip title={task.assignee}>
                <UserOutlined style={{ fontSize: '12px', color: '#666' }} />
              </Tooltip>
            )}

            {task.estimate && (
              <Tooltip title={`预估工时: ${task.estimate}小时`}>
                <ClockCircleOutlined style={{ fontSize: '12px', color: '#666' }} />
              </Tooltip>
            )}

            {dueDateStatus && (
              <Tooltip title={`截止日期: ${dayjs(task.due).format('YYYY-MM-DD')}`}>
                <CalendarOutlined
                  style={{
                    fontSize: '12px',
                    color: dueDateStatus.status === 'error' ? '#ff4d4f' : '#666'
                  }}
                />
              </Tooltip>
            )}
          </Space>

          {/* 右侧操作按钮 */}
          <Space size={2}>
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              style={{ padding: '2px 4px' }}
            />
            <Popconfirm
              title="确定删除这个任务吗？"
              onConfirm={(e) => {
                e?.stopPropagation();
                onDelete(task.id);
              }}
              onClick={(e) => e?.stopPropagation()}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                style={{ padding: '2px 4px' }}
                onClick={(e) => e.stopPropagation()}
              />
            </Popconfirm>
          </Space>
        </div>

        {/* 逾期警告 */}
        {isOverdue && (
          <div style={{
            marginTop: '8px',
            padding: '4px 8px',
            backgroundColor: '#fff2f0',
            border: '1px solid #ffccc7',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ExclamationCircleOutlined style={{ color: '#ff4d4f', fontSize: '12px' }} />
            <Text style={{ fontSize: '11px', color: '#ff4d4f' }}>
              {dueDateStatus.text}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TaskCard;