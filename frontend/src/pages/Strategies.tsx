import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Modal, Form, Input, Space, Popconfirm, message, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useStore } from '../store';
import { strategyApi } from '../services/api';

const { TextArea } = Input;

const Strategies: React.FC = () => {
  const { strategies, setStrategies, addStrategy, updateStrategy, deleteStrategy, loading, setLoading, setError } = useStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<any>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadStrategies();
  }, []);

  const loadStrategies = async () => {
    // 如果已经有数据，避免重复加载
    if (strategies.length > 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await strategyApi.getAll();
      setStrategies(response.data?.data || response.data || []);
    } catch (error) {
      setError('加载战略失败');
      message.error('加载战略失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingStrategy(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (strategy: any) => {
    setEditingStrategy(strategy);
    setIsModalVisible(true);
    form.setFieldsValue(strategy);
  };

  const handleDelete = async (id: string) => {
    try {
      await strategyApi.delete(id);
      deleteStrategy(id);
      message.success('删除成功');
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      console.log('=== 开始提交表单 ===');
      console.log('提交的值:', values);
      console.log('当前编辑状态:', editingStrategy);

      if (editingStrategy) {
        console.log('更新战略:', editingStrategy.id, values);
        const response = await strategyApi.update(editingStrategy.id, values);
        console.log('更新响应:', response);
        const updatedData = response.data?.data || response.data || response;
        updateStrategy(editingStrategy.id, updatedData);
        message.success('更新成功');
      } else {
        console.log('创建战略:', values);
        console.log('准备调用 strategyApi.create...');
        const response = await strategyApi.create(values);
        console.log('创建响应:', response);
        const newData = response.data?.data || response.data || response;
        console.log('准备调用 addStrategy...');
        addStrategy(newData);
        console.log('addStrategy 已调用');
        message.success('创建成功');

        // 重新加载数据以确保同步
        setTimeout(() => {
          loadStrategies();
        }, 500);
      }
      console.log('准备关闭模态框...');
      setIsModalVisible(false);
      console.log('准备重置表单...');
      form.resetFields();
      console.log('=== 表单提交完成 ===');
    } catch (error: any) {
      console.error('=== 战略保存错误 ===');
      console.error('错误对象:', error);
      console.error('错误响应:', error.response?.data);
      console.error('错误消息:', error.message);
      message.error(`操作失败: ${error.response?.data?.message || error.message || '未知错误'}`);
    }
  };

  const columns = [
    {
      title: '战略名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: 'KPI数量',
      dataIndex: 'kpis',
      key: 'kpiCount',
      render: (kpis: any[]) => <Tag color="blue">{kpis?.length || 0}</Tag>,
    },
    {
      title: '战役数量',
      dataIndex: 'initiatives',
      key: 'initiativeCount',
      render: (initiatives: any[]) => <Tag color="green">{initiatives?.length || 0}</Tag>,
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
            title="确定要删除这个战略吗？"
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

  return (
    <div>
      <Card
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <span>战略管理</span>
            <Tag color="purple" style={{ fontSize: '12px' }}>
              {strategies.length} 个战略
            </Tag>
          </div>
        )}
        extra={
          <Space wrap>
            <Input.Search
              placeholder="搜索战略..."
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
              创建战略
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
        <div style={{ overflowX: 'auto' }}>
          <Table
            dataSource={Array.isArray(strategies) ? strategies : []}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              total: strategies.length,
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条记录`,
              style: { marginTop: 16 },
              responsive: true
            }}
            scroll={{ x: 'max-content' }}
            style={{ minWidth: '600px' }}
            rowClassName={(_, index) =>
              index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
            }
          />
        </div>
      </Card>

      <Modal
        title={editingStrategy ? '编辑战略' : '创建战略'}
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
          onFinish={(values) => {
            console.log('Form onFinish 被调用，参数:', values);
            handleSubmit(values);
          }}
          onFinishFailed={(errorInfo) => {
            console.log('表单验证失败:', errorInfo);
            message.error('请检查表单填写是否正确');
          }}
          style={{ maxWidth: '100%' }}
        >
          <Form.Item
            label="战略名称"
            name="name"
            rules={[{ required: true, message: '请输入战略名称' }]}
          >
            <Input
              placeholder="请输入战略名称"
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
            label="战略描述"
            name="description"
            rules={[{ required: false }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入战略描述（可选）"
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
                {editingStrategy ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <style>{`
        .table-row-light {
          background: #fafafa;
        }
        .table-row-dark {
          background: #ffffff;
        }

        .ant-table-thead > tr > th {
          background: #f8f9fa;
          border-bottom: 2px solid #e9ecef;
          font-weight: 600;
          color: #495057;
        }

        .ant-table-tbody > tr:hover {
          background: rgba(102, 126, 234, 0.05) !important;
        }

        @media (max-width: 768px) {
          .ant-card {
            margin: 8px;
          }

          .ant-modal {
            margin: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default Strategies;