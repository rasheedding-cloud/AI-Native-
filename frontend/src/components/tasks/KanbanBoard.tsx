import React, { useState } from 'react';
import { Card, Row, Col, Typography, Button, Empty, Spin, Alert, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useDrop } from 'react-dnd';
import { useStore } from '../../store';
import { taskApi } from '../../services/api';
import TaskCard from './TaskCard';
import type { Task } from '../../types';

const { Title, Text } = Typography;

interface KanbanBoardProps {
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  onCreateTask,
  onEditTask
}) => {
  const { tasks, projects, updateTask, deleteTask, loading, setError } = useStore();
  const [localLoading, setLocalLoading] = useState(false);

  // 看板列配置
  const columns = [
    { key: 'TODO', title: '未开始', color: '#f0f0f0' },
    { key: 'DOING', title: '进行中', color: '#e6f7ff' },
    { key: 'DONE', title: '已完成', color: '#f6ffed' },
    { key: 'BLOCKED', title: '已暂停', color: '#fff7e6' },
    { key: 'CANCELLED', title: '已取消', color: '#fff1f0' }
  ];

  // 按状态分组任务
  const getTasksByStatus = (status: string) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => {
        // 按优先级降序排列
        if (a.priority !== b.priority) {
          return (b.priority || 0) - (a.priority || 0);
        }
        // 相同优先级按截止日期升序排列
        if (a.due && b.due) {
          return new Date(a.due).getTime() - new Date(b.due).getTime();
        }
        return 0;
      });
  };

  // 处理任务拖拽
  const handleDrop = async (status: string, item: any) => {
    try {
      setLocalLoading(true);
      const task = item.task;

      if (task.status === status) {
        return; // 状态未改变，无需更新
      }

      const updatedTask = {
        ...task,
        status
      };

      // 更新后端
      const response = await taskApi.update(task.id, updatedTask);
      const finalTask = response.data?.data || response.data;

      // 更新本地状态
      updateTask(task.id, finalTask);
    } catch (error) {
      setError('更新任务状态失败');
      console.error('更新任务状态失败:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  // 看板列组件
  const KanbanColumn: React.FC<{
    column: { key: string; title: string; color: string };
    tasks: Task[];
    onDrop: (status: string, item: any) => void;
  }> = ({ column, tasks, onDrop }) => {
    const [{ isOver }, drop] = useDrop(() => ({
      accept: 'task',
      drop: (item: any) => onDrop(column.key, item),
      collect: (monitor) => ({
        isOver: !!monitor.isOver(),
      }),
    }));

    const overdueTasks = tasks.filter(task => {
      if (!task.due) return false;
      return new Date(task.due) < new Date() && task.status !== '已完成';
    });

    return (
      <div
        ref={drop}
        style={{
          backgroundColor: isOver ? '#f0f8ff' : column.color,
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          minHeight: '400px',
          padding: '8px',
          transition: 'all 0.2s ease'
        }}
      >
        {/* 列标题 */}
        <div style={{
          padding: '8px 12px',
          marginBottom: '12px',
          backgroundColor: column.color,
          borderBottom: '1px solid #d9d9d9',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Text strong style={{ fontSize: '14px' }}>
              {column.title}
            </Text>
            <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
              ({tasks.length})
            </Text>
          </div>
          {overdueTasks.length > 0 && (
            <Alert
              message={`${overdueTasks.length}个逾期`}
              type="error"
              size="small"
              style={{ padding: '2px 6px', fontSize: '10px' }}
            />
          )}
        </div>

        {/* 任务列表 */}
        <div style={{
          minHeight: '300px',
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto'
        }}>
          {tasks.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无任务"
              style={{ padding: '20px 0' }}
            />
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={onEditTask}
                onDelete={async (id) => {
                  try {
                    await taskApi.delete(id);
                    deleteTask(id);
                  } catch (error) {
                    setError('删除任务失败');
                  }
                }}
              />
            ))
          )}
        </div>
      </div>
    );
  };

  // 刷新数据
  const handleRefresh = async () => {
    try {
      setLocalLoading(true);
      const response = await taskApi.getAll();
      // 这里需要在store中实现setTasks方法来更新数据
      console.log('刷新任务数据:', response.data);
    } catch (error) {
      setError('刷新任务失败');
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px', height: '100%' }}>
      {/* 顶部操作栏 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              任务看板
            </Title>
            <Text type="secondary">
              拖拽任务卡片到不同列来更新状态
            </Text>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={localLoading}
              size="small"
            >
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateTask}
              size="small"
            >
              新建任务
            </Button>
          </Space>
        </div>
      </Card>

      {/* 看板主体 */}
      <Spin spinning={loading || localLoading}>
        <Row gutter={[16, 0]} style={{ height: 'calc(100vh - 200px)' }}>
          {columns.map(column => (
            <Col
              key={column.key}
              span={24 / columns.length}
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
            >
              <KanbanColumn
                column={column}
                tasks={getTasksByStatus(column.key)}
                onDrop={handleDrop}
              />
            </Col>
          ))}
        </Row>
      </Spin>

      {/* 统计信息 */}
      <Card size="small" style={{ marginTop: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center'
        }}>
          {columns.map(column => {
            const columnTasks = getTasksByStatus(column.key);
            const overdueCount = columnTasks.filter(task => {
              if (!task.due) return false;
              return new Date(task.due) < new Date() && task.status !== '已完成';
            }).length;

            return (
              <div key={column.key}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {columnTasks.length}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {column.title}
                </div>
                {overdueCount > 0 && (
                  <div style={{ fontSize: '10px', color: '#ff4d4f' }}>
                    {overdueCount}逾期
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default KanbanBoard;