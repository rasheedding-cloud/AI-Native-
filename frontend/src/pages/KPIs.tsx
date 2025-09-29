import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Progress, InputNumber, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, LineChartOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { kpiApi } from '../services/api';

const { Option } = Select;

const Kpis: React.FC = () => {
  const { kpis, strategies, setKpis, addKpi, updateKpi, deleteKpi, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingKpi, setEditingKpi] = useState<any>(null);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [currentKpi, setCurrentKpi] = useState<any>(null);
  const [newCurrentValue, setNewCurrentValue] = useState(0);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    loadKpis();
  }, []);

  const loadKpis = async () => {
    // 如果已经有数据，避免重复加载
    if (kpis.length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await kpiApi.getAll();
      setKpis(response.data?.data || response.data || []);
    } catch (error) {
      setError('加载KPI失败');
      message.error('加载KPI失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingKpi(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (kpi: any) => {
    setEditingKpi(kpi);
    setIsModalVisible(true);
    form.setFieldsValue(kpi);
  };

  const handleDelete = async (id: string) => {
    try {
      await kpiApi.delete(id);
      deleteKpi(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingKpi) {
        const response = await kpiApi.update(editingKpi.id, values);
        updateKpi(editingKpi.id, response.data || response);
        message.success('更新成功');
      } else {
        const response = await kpiApi.create(values);
        addKpi(response.data || response);
        message.success('创建成功');

        // 重新加载数据以确保同步
        setTimeout(() => {
          loadKpis();
        }, 500);
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const openUpdateModal = (kpi: any) => {
    setCurrentKpi(kpi);
    setNewCurrentValue(kpi.current);
    setUpdateModalVisible(true);
  };

  const handleUpdateCurrent = async () => {
    if (!currentKpi) return;

    try {
      await kpiApi.updateCurrent(currentKpi.id, newCurrentValue);
      updateKpi(currentKpi.id, { current: newCurrentValue });
      message.success('当前值更新成功');
      setUpdateModalVisible(false);
    } catch (error) {
      message.error('当前值更新失败');
    }
  };

  const getCompletionRate = (kpi: any) => {
    if (kpi.target === 0) return 0;
    return Math.min(100, (kpi.current / kpi.target) * 100);
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 100) return 'success';
    if (rate >= 80) return 'active';
    if (rate >= 60) return 'normal';
    return 'exception';
  };

  const getTagColor = (rate: number) => {
    if (rate >= 100) return 'green';
    if (rate >= 80) return 'blue';
    if (rate >= 60) return 'orange';
    return 'red';
  };

  const getTrendIcon = (kpi: any) => {
    // 简单的趋势计算，实际应用中可能需要历史数据
    const rate = getCompletionRate(kpi);
    if (rate >= 80) return <ArrowUpOutlined style={{ color: '#52c41a' }} />;
    if (rate >= 60) return <ArrowUpOutlined style={{ color: '#faad14' }} />;
    return <ArrowDownOutlined style={{ color: '#ff4d4f' }} />;
  };

  const columns = [
    {
      title: 'KPI名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '所属战略',
      dataIndex: 'strategy',
      key: 'strategy',
      render: (strategy: any) => <Tag color="purple">{strategy?.name || '未知'}</Tag>,
    },
    {
      title: '当前值',
      dataIndex: 'current',
      key: 'current',
      render: (current: number, record: any) => (
        <div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
            {current.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            目标: {record.target.toLocaleString()}
          </div>
        </div>
      ),
    },
    {
      title: '完成率',
      dataIndex: 'completion',
      key: 'completion',
      render: (_: any, record: any) => {
        const rate = getCompletionRate(record);
        return (
          <div>
            <Progress
              percent={rate}
              size="small"
              status={getStatusColor(rate)}
              format={() => `${rate.toFixed(1)}%`}
            />
          </div>
        );
      },
    },
    {
      title: '趋势',
      dataIndex: 'trend',
      key: 'trend',
      render: (_: any, record: any) => (
        <div style={{ textAlign: 'center' }}>
          {getTrendIcon(record)}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (_: any, record: any) => {
        const rate = getCompletionRate(record);
        let status = '未开始';
        if (rate >= 100) status = '已完成';
        else if (rate >= 80) status = '优秀';
        else if (rate >= 60) status = '良好';
        else if (rate > 0) status = '进行中';

        return <Tag color={getTagColor(rate)}>{status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            icon={<LineChartOutlined />}
            onClick={() => openUpdateModal(record)}
          >
            更新数值
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个KPI吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 按战略分组统计
  const kpisByStrategy = kpis.reduce((acc, kpi) => {
    const strategyName = kpi.strategy?.name || '未分类';
    if (!acc[strategyName]) {
      acc[strategyName] = [];
    }
    acc[strategyName].push(kpi);
    return acc;
  }, {} as Record<string, any[]>);

  const tabItems = [
    {
      key: '1',
      label: '列表视图',
      children: (
        <Table
          dataSource={Array.isArray(kpis) ? kpis : []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            total: Array.isArray(kpis) ? kpis.length : 0,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      ),
    },
    {
      key: '2',
      label: '战略视图',
      children: (
        <div style={{ padding: '20px' }}>
          {Object.entries(kpisByStrategy).map(([strategyName, strategyKpis]) => (
            <Card
              key={strategyName}
              title={<span><TrophyOutlined /> {strategyName}</span>}
              style={{ marginBottom: '16px' }}
              extra={<Tag color="purple">{strategyKpis.length} 个KPI</Tag>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                {strategyKpis.map((kpi) => {
                  const rate = getCompletionRate(kpi);
                  return (
                    <Card key={kpi.id} size="small" style={{ marginBottom: '0' }}>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <strong>{kpi.name}</strong>
                          {getTrendIcon(kpi)}
                        </div>
                        <Progress
                          percent={rate}
                          status={getStatusColor(rate)}
                          format={() => `${rate.toFixed(1)}%`}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                        <span>当前: {kpi.current.toLocaleString()}</span>
                        <span>目标: {kpi.target.toLocaleString()}</span>
                      </div>
                      <div style={{ marginTop: '8px', textAlign: 'right' }}>
                        <Tag color={getTagColor(rate)}>
                          {rate >= 100 ? '已完成' : rate >= 80 ? '优秀' : rate >= 60 ? '良好' : rate > 0 ? '进行中' : '未开始'}
                        </Tag>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      ),
    },
    {
      key: '3',
      label: '统计视图',
      children: (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                  {kpis.length}
                </div>
                <div style={{ color: '#666' }}>总KPI数</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                  {kpis.filter(k => getCompletionRate(k) >= 100).length}
                </div>
                <div style={{ color: '#666' }}>已完成</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#faad14' }}>
                  {kpis.filter(k => getCompletionRate(k) >= 80 && getCompletionRate(k) < 100).length}
                </div>
                <div style={{ color: '#666' }}>优秀</div>
              </div>
            </Card>
            <Card>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#722ed1' }}>
                  {Math.round(kpis.reduce((sum, k) => sum + getCompletionRate(k), 0) / kpis.length)}%
                </div>
                <div style={{ color: '#666' }}>平均完成率</div>
              </div>
            </Card>
          </div>

          <Card title="KPI完成率分布" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              {[
                { label: '已完成', min: 100, color: 'success' },
                { label: '优秀', min: 80, max: 99.9, color: 'processing' },
                { label: '良好', min: 60, max: 79.9, color: 'warning' },
                { label: '进行中', min: 0.1, max: 59.9, color: 'exception' },
                { label: '未开始', min: 0, max: 0, color: 'default' }
              ].map(({ label, min, max, color }) => {
                const count = kpis.filter(k => {
                  const rate = getCompletionRate(k);
                  if (max !== undefined) {
                    return rate >= min && rate <= max;
                  }
                  return rate >= min;
                }).length;
                return (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{count}</div>
                    <Tag color={color}>{label}</Tag>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="战略KPI完成情况">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {Object.entries(kpisByStrategy).map(([strategyName, strategyKpis]) => {
                const avgRate = strategyKpis.reduce((sum, k) => sum + getCompletionRate(k), 0) / strategyKpis.length;
                return (
                  <div key={strategyName} style={{ textAlign: 'center', padding: '16px', border: '1px solid #d9d9d9', borderRadius: '8px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>{strategyName}</div>
                    <Progress
                      type="circle"
                      percent={Math.round(avgRate)}
                      size={80}
                      format={() => `${Math.round(avgRate)}%`}
                    />
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                      {strategyKpis.length} 个KPI
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <span>KPI管理</span>
            <Tag color="blue" style={{ fontSize: '12px' }}>
              {kpis.length} 个KPI
            </Tag>
          </div>
        )}
        extra={
          <Space wrap>
            <Input.Search
              placeholder="搜索KPI..."
              style={{ width: 200 }}
              onSearch={(value) => console.log('搜索:', value)}
              allowClear
              size="middle"
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
              size="middle"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              创建KPI
            </Button>
          </Space>
        }
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          borderRadius: 12,
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          style={{ marginTop: 16 }}
          className="custom-tabs"
        />
      </Card>

      {/* 创建/编辑KPI模态框 */}
      <Modal
        title={editingKpi ? '编辑KPI' : '创建KPI'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={{ xs: '90%', sm: '80%', md: 600 }}
        style={{
          top: 20,
          borderRadius: 12,
          overflow: 'hidden'
        }}
        styles={{
          body: {
            padding: '24px',
            background: '#fafafa'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: '100%' }}
        >
          <Form.Item
            label="KPI名称"
            name="name"
            rules={[{ required: true, message: '请输入KPI名称' }]}
          >
            <Input
              placeholder="请输入KPI名称"
              size="large"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            />
          </Form.Item>

          <Form.Item
            label="所属战略"
            name="strategyId"
            rules={[{ required: true, message: '请选择所属战略' }]}
          >
            <Select
              placeholder="请选择所属战略"
              size="large"
              style={{
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.2)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#d9d9d9';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
              }}
            >
              {strategies.map((strategy) => (
                <Option key={strategy.id} value={strategy.id}>
                  {strategy.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="目标值"
            name="target"
            rules={[{ required: true, message: '请输入目标值' }]}
          >
            <InputNumber
              style={{
                width: '100%',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              placeholder="请输入目标值"
              min={0}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="当前值"
            name="current"
            rules={[{ required: false }]}
            initialValue={0}
          >
            <InputNumber
              style={{
                width: '100%',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              placeholder="请输入当前值"
              min={0}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setIsModalVisible(false)}
                size="large"
                style={{
                  borderRadius: 8,
                  padding: '8px 24px',
                  border: '1px solid #d9d9d9',
                  transition: 'all 0.3s ease'
                }}
              >
                取消
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                style={{
                  borderRadius: 8,
                  padding: '8px 24px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                }}
              >
                {editingKpi ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 更新当前值模态框 */}
      <Modal
        title={`更新KPI当前值 - ${currentKpi?.name || ''}`}
        open={updateModalVisible}
        onOk={handleUpdateCurrent}
        onCancel={() => setUpdateModalVisible(false)}
        okText="更新"
        cancelText="取消"
        width={{ xs: '90%', sm: '80%', md: 500 }}
        style={{
          top: 20,
          borderRadius: 12,
          overflow: 'hidden'
        }}
        styles={{
          body: {
            padding: '24px',
            background: '#fafafa'
          }
        }}
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 8,
            transition: 'all 0.3s ease'
          }
        }}
      >
        {currentKpi && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <p><strong>目标值:</strong> {currentKpi.target.toLocaleString()}</p>
              <p><strong>当前值:</strong> {currentKpi.current.toLocaleString()}</p>
              <p><strong>完成率:</strong> {getCompletionRate(currentKpi).toFixed(1)}%</p>
            </div>

            <Form layout="vertical">
              <Form.Item label="新的当前值">
                <InputNumber
                  style={{
                    width: '100%',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '1px solid #d9d9d9',
                    transition: 'all 0.3s ease'
                  }}
                  value={newCurrentValue}
                  onChange={(value) => setNewCurrentValue(value || 0)}
                  min={0}
                  max={currentKpi.target}
                  size="large"
                />
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
      <style>{`
        .custom-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }

        .custom-tabs .ant-tabs-tab {
          border-radius: 8px 8px 0 0;
          transition: all 0.3s ease;
        }

        .custom-tabs .ant-tabs-tab:hover {
          color: #667eea;
          background: rgba(102, 126, 234, 0.1);
        }

        .custom-tabs .ant-tabs-tab-active {
          color: #667eea;
          border-bottom: 2px solid #667eea;
        }

        .ant-card {
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .ant-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        }

        .ant-progress-circle .ant-progress-text {
          font-size: 16px;
          font-weight: bold;
        }

        .ant-statistic-content {
          font-size: 24px;
          font-weight: bold;
        }

        @media (max-width: 768px) {
          .ant-card {
            margin: 8px;
          }

          .ant-modal {
            margin: 16px;
          }

          .ant-card-grid {
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Kpis;