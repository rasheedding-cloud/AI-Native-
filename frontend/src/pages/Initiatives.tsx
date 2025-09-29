import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Select, Space, Popconfirm, message, Tag, Tabs } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, AimOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { initiativeApi } from '../services/api';

const { TextArea } = Input;
const { Option } = Select;

const Initiatives: React.FC = () => {
  const { initiatives, strategies, setInitiatives, addInitiative, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingInitiative, setEditingInitiative] = useState<any>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('1');

  useEffect(() => {
    loadInitiatives();
  }, []);

  const loadInitiatives = async () => {
    try {
      setLoading(true);
      const response = await initiativeApi.getAll();
      setInitiatives(response.data?.data || response.data || []);
    } catch (error) {
      setError('加载战役失败');
      message.error('加载战役失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingInitiative(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (initiative: any) => {
    setEditingInitiative(initiative);
    setIsModalVisible(true);
    form.setFieldsValue(initiative);
  };

  const handleDelete = async () => {
    try {
      // 注意：这里需要后端实现删除战役的API
      message.warning('删除战役功能开发中');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingInitiative) {
        // 注意：这里需要后端实现更新战役的API
        message.warning('更新战役功能开发中');
      } else {
        const response = await initiativeApi.create(values);
        addInitiative(response.data || response);
        message.success('创建成功');
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns = [
    {
      title: '战役名称',
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
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: '项目数量',
      dataIndex: 'projects',
      key: 'projectCount',
      render: (projects: any[]) => <Tag color="blue">{projects?.length || 0}</Tag>,
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
            icon={<EyeOutlined />}
            onClick={() => console.log('查看详情', record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个战役吗？"
            onConfirm={handleDelete}
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
  const initiativesByStrategy = initiatives.reduce((acc, initiative) => {
    const strategyName = initiative.strategy?.name || '未分类';
    if (!acc[strategyName]) {
      acc[strategyName] = [];
    }
    acc[strategyName].push(initiative);
    return acc;
  }, {} as Record<string, any[]>);

  const tabItems = [
    {
      key: '1',
      label: '列表视图',
      children: (
        <Table
          dataSource={Array.isArray(initiatives) ? initiatives : []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            total: Array.isArray(initiatives) ? initiatives.length : 0,
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
          {Object.entries(initiativesByStrategy).map(([strategyName, strategyInitiatives]) => (
            <Card
              key={strategyName}
              title={<span><AimOutlined /> {strategyName}</span>}
              style={{ marginBottom: '16px' }}
              extra={<Tag color="purple">{strategyInitiatives.length} 个战役</Tag>}
            >
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {strategyInitiatives.map((initiative) => (
                  <Card
                    key={initiative.id}
                    size="small"
                    style={{ width: '300px', marginBottom: '0' }}
                    actions={[
                      <Button type="link" size="small" icon={<EyeOutlined />}>
                        查看
                      </Button>,
                      <Button type="link" size="small" icon={<EditOutlined />}>
                        编辑
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={initiative.name}
                      description={
                        <div>
                          <p style={{ marginBottom: '8px' }}>
                            {initiative.description || '暂无描述'}
                          </p>
                          <div>
                            <Tag color="blue">
                              {initiative.projects?.length || 0} 个项目
                            </Tag>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚔️</span>
            <span>战役管理</span>
            <Tag color="blue" style={{ fontSize: '12px' }}>
              {initiatives.length} 个战役
            </Tag>
          </div>
        )}
        extra={
          <Space wrap>
            <Input.Search
              placeholder="搜索战役..."
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
              创建战役
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

      <Modal
        title={editingInitiative ? '编辑战役' : '创建战役'}
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
            label="战役名称"
            name="name"
            rules={[{ required: true, message: '请输入战役名称' }]}
          >
            <Input
              placeholder="请输入战役名称"
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
            label="战役描述"
            name="description"
            rules={[{ required: false }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入战役描述（可选）"
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
                {editingInitiative ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
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

export default Initiatives;