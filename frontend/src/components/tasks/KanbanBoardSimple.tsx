import React from 'react';
import { Card, Row, Col, Typography, Button, Space } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useStore } from '../../store';

const { Title, Text } = Typography;

const KanbanBoardSimple: React.FC<{
  onCreateTask: () => void;
  onEditTask: (task: any) => void;
}> = ({ onCreateTask, onEditTask }) => {
  const { tasks } = useStore();

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
    return tasks.filter(task => task.status === status);
  };

  return (
    <div style={{ padding: '16px', height: '100%' }} className="kanban-board-simple">
      <Card size="small" style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <Title level={4} style={{ margin: 0 }}>
              任务看板 (简化版)
            </Title>
            <Text type="secondary">
              显示任务状态分布
            </Text>
          </div>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onCreateTask}
            >
              新建任务
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 0]} style={{ height: 'calc(100vh - 200px)' }}>
        {columns.map(column => (
          <Col
            key={column.key}
            span={24 / columns.length}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <Card
              size="small"
              style={{
                backgroundColor: column.color,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
              title={
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>{column.title}</span>
                  <span style={{ fontSize: '12px', color: '#666' }}>
                    ({getTasksByStatus(column.key).length})
                  </span>
                </div>
              }
            >
              <div style={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 300px)',
                paddingRight: '4px'
              }}>
                {getTasksByStatus(column.key).map(task => (
                  <Card
                    key={task.id}
                    size="small"
                    style={{
                      marginBottom: '8px',
                      cursor: 'pointer',
                      wordBreak: 'break-word'
                    }}
                    onClick={() => onEditTask(task)}
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
                    {task.due && (
                      <div style={{ fontSize: '10px', color: '#999' }}>
                        截止: {new Date(task.due).toLocaleDateString()}
                      </div>
                    )}
                  </Card>
                ))}
                {getTasksByStatus(column.key).length === 0 && (
                  <div style={{
                    textAlign: 'center',
                    color: '#999',
                    padding: '20px',
                    fontSize: '12px'
                  }}>
                    暂无任务
                  </div>
                )}
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default KanbanBoardSimple;