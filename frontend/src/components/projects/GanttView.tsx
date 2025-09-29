import React, { useState, useEffect } from 'react';
import { Card, Button, Select, DatePicker, Space, Tag, Tooltip } from 'antd';
import { PlusOutlined, CalendarOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

interface GanttViewProps {
  project: any;
}

const GanttView: React.FC<GanttViewProps> = ({ project }) => {
  const [timeScale, setTimeScale] = useState<'week' | 'day'>('week');
  const [groupBy, setGroupBy] = useState<'list' | 'assignee'>('list');
  const [selectedDateRange, setSelectedDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'),
    dayjs().endOf('month').add(1, 'month')
  ]);

  // 获取项目中的任务
  const getTasks = () => {
    if (!project.tasks) return [];

    return project.tasks.map((task: any) => ({
      ...task,
      start: task.startDate ? dayjs(task.startDate) : null,
      end: task.endDate ? dayjs(task.endDate) : null,
      duration: task.startDate && task.endDate ?
        dayjs(task.endDate).diff(dayjs(task.startDate), 'day') + 1 : 0
    })).filter((task: any) => task.start && task.end);
  };

  const tasks = getTasks();

  // 生成时间刻度
  const generateTimeScale = () => {
    const [start, end] = selectedDateRange;
    const days = end.diff(start, 'day');

    if (timeScale === 'week') {
      const weeks = Math.ceil(days / 7);
      return Array.from({ length: weeks }, (_, i) => {
        const weekStart = start.add(i * 7, 'day');
        const weekEnd = weekStart.add(6, 'day');
        return {
          label: `第${i + 1}周`,
          start: weekStart,
          end: weekEnd,
          days: 7
        };
      });
    } else {
      return Array.from({ length: days + 1 }, (_, i) => ({
        label: start.add(i, 'day').format('MM/DD'),
        date: start.add(i, 'day'),
        isWeekend: start.add(i, 'day').day() === 0 || start.add(i, 'day').day() === 6
      }));
    }
  };

  const timeScaleData = generateTimeScale();

  // 按组分类任务
  const groupTasks = () => {
    const groups = new Map();

    if (groupBy === 'list') {
      // 按任务列表分组
      const listGroups = [
        { id: 'list1', name: '待规划', color: '#ff7875' },
        { id: 'list2', name: '本周任务', color: '#1890ff' },
        { id: 'list3', name: '已完成', color: '#52c41a' },
        { id: 'ungrouped', name: '未分组', color: '#8c8c8c' }
      ];

      listGroups.forEach(group => {
        groups.set(group.id, {
          ...group,
          tasks: tasks.filter(task => {
            // 这里根据任务状态模拟分组
            if (group.id === 'list1') return task.status === 'TODO';
            if (group.id === 'list2') return task.status === 'DOING';
            if (group.id === 'list3') return task.status === 'DONE';
            return true;
          })
        });
      });
    } else {
      // 按负责人分组
      const assignees = [...new Set(tasks.map(task => task.assignee).filter(Boolean))];
      const colors = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

      assignees.forEach((assignee, index) => {
        groups.set(assignee, {
          id: assignee,
          name: assignee,
          color: colors[index % colors.length],
          tasks: tasks.filter(task => task.assignee === assignee)
        });
      });

      // 未分组任务
      const ungroupedTasks = tasks.filter(task => !task.assignee);
      if (ungroupedTasks.length > 0) {
        groups.set('unassigned', {
          id: 'unassigned',
          name: '未分配',
          color: '#8c8c8c',
          tasks: ungroupedTasks
        });
      }
    }

    return Array.from(groups.values()).filter(group => group.tasks.length > 0);
  };

  const groupedTasks = groupTasks();

  // 检查任务是否超期
  const isTaskOverdue = (task: any) => {
    return task.due && dayjs().isAfter(dayjs(task.due)) && task.status !== 'DONE';
  };

  // 检查任务是否有依赖冲突
  const hasDependencyConflict = (task: any) => {
    // 简化的依赖冲突检查
    return false;
  };

  // 计算任务条的位置和宽度
  const calculateTaskBarStyle = (task: any) => {
    const [start, end] = selectedDateRange;
    const totalDays = end.diff(start, 'day');

    if (!task.start || !task.end) {
      return {
        left: '0%',
        width: '0%',
        display: 'none'
      };
    }

    const taskStart = task.start.isBefore(start) ? start : task.start;
    const taskEnd = task.end.isAfter(end) ? end : task.end;

    const left = ((taskStart.diff(start, 'day')) / totalDays) * 100;
    const width = ((taskEnd.diff(taskStart, 'day') + 1) / totalDays) * 100;

    return {
      left: `${Math.max(0, left)}%`,
      width: `${Math.min(100, width)}%`
    };
  };

  return (
    <div>
      {/* 控制栏 */}
      <Card style={{ marginBottom: '16px' }}>
        <Space wrap>
          <Select
            value={timeScale}
            onChange={setTimeScale}
            style={{ width: 120 }}
          >
            <Option value="week">周视图</Option>
            <Option value="day">日视图</Option>
          </Select>

          <Select
            value={groupBy}
            onChange={setGroupBy}
            style={{ width: 120 }}
          >
            <Option value="list">按列表</Option>
            <Option value="assignee">按负责人</Option>
          </Select>

          <RangePicker
            value={selectedDateRange}
            onChange={setSelectedDateRange}
            style={{ width: 240 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            新建任务
          </Button>
        </Space>
      </Card>

      {/* 甘特图容器 */}
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <div style={{ minWidth: '800px' }}>
            {/* 时间刻度表头 */}
            <div style={{
              display: 'flex',
              borderBottom: '2px solid #f0f0f0',
              marginBottom: '8px',
              position: 'sticky',
              top: 0,
              background: 'white',
              zIndex: 10
            }}>
              <div style={{
                width: '200px',
                padding: '8px',
                fontWeight: 'bold',
                borderRight: '1px solid #f0f0f0',
                background: '#fafafa'
              }}>
                任务信息
              </div>
              <div style={{ flex: 1, display: 'flex' }}>
                {timeScaleData.map((timeUnit, index) => (
                  <div
                    key={index}
                    style={{
                      flex: 1,
                      minWidth: timeScale === 'week' ? '100px' : '60px',
                      padding: '8px 4px',
                      textAlign: 'center',
                      borderRight: '1px solid #f0f0f0',
                      fontSize: '12px',
                      background: timeUnit.isWeekend ? '#f5f5f5' : 'white'
                    }}
                  >
                    {timeUnit.label}
                  </div>
                ))}
              </div>
            </div>

            {/* 任务行 */}
            <div>
              {groupedTasks.map((group) => (
                <div key={group.id}>
                  {/* 分组标题 */}
                  <div style={{
                    display: 'flex',
                    background: group.color,
                    color: 'white',
                    padding: '8px',
                    fontWeight: 'bold',
                    marginTop: '8px',
                    borderRadius: '4px'
                  }}>
                    <div style={{ width: '200px' }}>
                      {group.name} ({group.tasks.length})
                    </div>
                    <div style={{ flex: 1 }} />
                  </div>

                  {/* 分组内的任务 */}
                  {group.tasks.map((task: any) => {
                    const taskBarStyle = calculateTaskBarStyle(task);
                    const isOverdue = isTaskOverdue(task);
                    const hasConflict = hasDependencyConflict(task);

                    return (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          borderBottom: '1px solid #f0f0f0',
                          minHeight: '40px',
                          alignItems: 'center'
                        }}
                      >
                        {/* 任务信息 */}
                        <div style={{
                          width: '200px',
                          padding: '8px',
                          borderRight: '1px solid #f0f0f0',
                          fontSize: '12px'
                        }}>
                          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            {task.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Tag color={task.status === 'DONE' ? 'success' : 'default'} style={{ fontSize: '10px' }}>
                              {task.status}
                            </Tag>
                            {isOverdue && (
                              <Tooltip title="任务已超期">
                                <WarningOutlined style={{ color: '#f5222d' }} />
                              </Tooltip>
                            )}
                          </div>
                          {task.assignee && (
                            <div style={{ color: '#666', fontSize: '11px' }}>
                              {task.assignee}
                            </div>
                          )}
                        </div>

                        {/* 时间轴 */}
                        <div style={{
                          flex: 1,
                          position: 'relative',
                          height: '40px',
                          background: '#fafafa'
                        }}>
                          {/* 今日线 */}
                          <div
                            style={{
                              position: 'absolute',
                              left: `${((dayjs().diff(selectedDateRange[0], 'day')) / selectedDateRange[1].diff(selectedDateRange[0], 'day')) * 100}%`,
                              top: 0,
                              bottom: 0,
                              width: '2px',
                              background: '#f5222d',
                              zIndex: 5
                            }}
                          />

                          {/* 任务条 */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '8px',
                              height: '24px',
                              borderRadius: '4px',
                              ...taskBarStyle,
                              background: isOverdue ? '#fff2f0' :
                                       hasConflict ? '#fff7e6' :
                                       group.color,
                              border: `2px solid ${isOverdue ? '#f5222d' :
                                           hasConflict ? '#fa8c16' :
                                           group.color}`,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              color: isOverdue || hasConflict ? '#333' : 'white',
                              fontWeight: 'bold'
                            }}
                            title={`${task.title} (${task.duration}天)`}
                          >
                            {task.duration > 0 && `${task.duration}天`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* 空状态 */}
            {tasks.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '60px 20px',
                color: '#999'
              }}>
                <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                <div style={{ fontSize: '16px', marginBottom: '8px' }}>
                  暂无排期任务
                </div>
                <div style={{ fontSize: '14px' }}>
                  请为任务设置开始和结束时间以显示甘特图
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GanttView;