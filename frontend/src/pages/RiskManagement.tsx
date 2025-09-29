import React, { useEffect, useState } from 'react';
import { Card, Table, Tag, Button, Modal, Form, Select, Input, Space, Progress, Statistic, Row, Col, Typography, Divider, message } from 'antd';
import { WarningOutlined, ExclamationCircleOutlined, CheckCircleOutlined, ClockCircleOutlined, FireOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useStore } from '../store';

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface RiskItem {
  id: string;
  taskId: string;
  taskTitle: string;
  type: string;
  level: '低' | '中' | '高' | '紧急';
  description: string;
  impact: string;
  probability: number;
  status: '未处理' | '处理中' | '已解决' | '已关闭';
  createdAt: string;
  updatedAt: string;
}

const RiskManagement: React.FC = () => {
  const { tasks, loading } = useStore();
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);
  const [viewingRisk, setViewingRisk] = useState<RiskItem | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [form] = Form.useForm();

  const riskTypes = [
    '技术风险',
    '时间风险',
    '资源风险',
    '合规风险',
    '质量风险',
    '人员风险',
    '预算风险',
    '需求风险'
  ];

  const riskLevels = [
    { value: '低', color: 'green', icon: <CheckCircleOutlined /> },
    { value: '中', color: 'orange', icon: <ClockCircleOutlined /> },
    { value: '高', color: 'red', icon: <ExclamationCircleOutlined /> },
    { value: '紧急', color: 'volcano', icon: <FireOutlined /> }
  ];

  const riskStatuses = [
    { value: '未处理', color: 'red' },
    { value: '处理中', color: 'orange' },
    { value: '已解决', color: 'green' },
    { value: '已关闭', color: 'blue' }
  ];

  useEffect(() => {
    loadRisks();
  }, [tasks]);

  const loadRisks = () => {
    // 如果已有风险数据，避免重复处理
    if (risks.length > 0 && tasks.length > 0) {
      return;
    }

    const riskItems: RiskItem[] = [];

    tasks.forEach(task => {
      if (task.riskFlags) {
        try {
          const riskFlags = JSON.parse(task.riskFlags);
          if (Array.isArray(riskFlags)) {
            riskFlags.forEach((riskType, index) => {
              // 根据风险类型和任务优先级智能评估风险等级
              let level: '低' | '中' | '高' | '紧急' = '中';
              if (task.priority > 0.8) level = '高';
              if (task.priority > 0.9) level = '紧急';
              if (riskType.includes('技术')) level = '中';
              if (riskType.includes('合规')) level = '高';
              if (riskType.includes('时间') && task.due) {
                const dueDate = new Date(task.due);
                const now = new Date();
                const daysDiff = (dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
                if (daysDiff < 7) level = '紧急';
                else if (daysDiff < 14) level = '高';
              }

              riskItems.push({
                id: `${task.id}-${index}`,
                taskId: task.id,
                taskTitle: task.title,
                type: riskType,
                level,
                description: `任务 "${task.title}" 存在${riskType}`,
                impact: getRiskImpact(riskType, level),
                probability: getRiskProbability(level),
                status: task.status === 'COMPLETED' ? '已解决' : '未处理',
                createdAt: task.createdAt,
                updatedAt: task.updatedAt
              });
            });
          }
        } catch (error) {
          console.error('解析风险标记失败:', error);
        }
      }
    });

    setRisks(riskItems);
  };

  const getRiskImpact = (type: string, level: string): string => {
    const impacts: Record<string, Record<string, string>> = {
      '技术风险': { '低': '轻微影响开发进度', '中': '可能导致延期', '高': '严重影响功能实现', '紧急': '可能威胁项目成功' },
      '时间风险': { '低': '轻微延期', '中': '可能影响里程碑', '高': '严重影响交付时间', '紧急': '立即处理避免延期' },
      '资源风险': { '低': '资源稍紧张', '中': '资源不足', '高': '严重缺乏资源', '紧急': '立即补充资源' },
      '合规风险': { '低': '轻微合规问题', '中': '需要整改', '高': '严重违规', '紧急': '立即处理避免处罚' },
      '质量风险': { '低': '轻微质量问题', '中': '影响用户体验', '高': '严重影响质量', '紧急': '立即修复' }
    };
    return impacts[type]?.[level] || '一般影响';
  };

  const getRiskProbability = (level: string): number => {
    switch (level) {
      case '低': return 25;
      case '中': return 50;
      case '高': return 75;
      case '紧急': return 95;
      default: return 50;
    }
  };

  const getStatusColor = (status: string) => {
    const statusObj = riskStatuses.find(s => s.value === status);
    return statusObj?.color || 'default';
  };

  const getLevelColor = (level: string) => {
    const levelObj = riskLevels.find(l => l.value === level);
    return levelObj?.color || 'default';
  };

  const handleCreate = () => {
    setEditingRisk(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (risk: RiskItem) => {
    setEditingRisk(risk);
    setIsModalVisible(true);
    form.setFieldsValue(risk);
  };

  const handleView = (risk: RiskItem) => {
    setViewingRisk(risk);
    setViewModalVisible(true);
  };

  const handleSubmit = (values: any) => {
    // 这里应该调用API保存风险
    console.log('保存风险:', values);
    setIsModalVisible(false);
    form.resetFields();
    message.success('风险保存成功');

    // 重新加载风险数据
    setTimeout(() => {
      loadRisks();
    }, 500);
  };

  const getRiskStats = () => {
    const total = risks.length;
    const urgent = risks.filter(r => r.level === '紧急').length;
    const high = risks.filter(r => r.level === '高').length;
    const medium = risks.filter(r => r.level === '中').length;
    const low = risks.filter(r => r.level === '低').length;
    const resolved = risks.filter(r => r.status === '已解决').length;

    return { total, urgent, high, medium, low, resolved };
  };

  const stats = getRiskStats();

  const columns = [
    {
      title: '风险类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color="blue" style={{ fontSize: '12px' }}>
          {type}
        </Tag>
      ),
    },
    {
      title: '风险等级',
      dataIndex: 'level',
      key: 'level',
      render: (level: string) => {
        const levelObj = riskLevels.find(l => l.value === level);
        return (
          <Tag color={getLevelColor(level)} style={{ fontSize: '12px' }}>
            {levelObj?.icon} {level}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)} style={{ fontSize: '12px' }}>
          {status}
        </Tag>
      ),
    },
    {
      title: '影响程度',
      dataIndex: 'probability',
      key: 'probability',
      render: (probability: number) => (
        <Progress
          percent={probability}
          size="small"
          showInfo
          format={() => `${probability}%`}
          strokeColor={probability > 75 ? '#ff4d4f' : probability > 50 ? '#faad14' : '#52c41a'}
        />
      ),
    },
    {
      title: '相关任务',
      dataIndex: 'taskTitle',
      key: 'taskTitle',
      render: (title: string) => (
        <Text style={{ fontSize: '12px', color: '#666' }}>
          {title.length > 20 ? title.substring(0, 20) + '...' : title}
        </Text>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleDateString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: RiskItem) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
            size="small"
          >
            查看
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>⚠️</span>
            <span>风险管理</span>
            <Tag color="red" style={{ fontSize: '12px' }}>
              {stats.total} 个风险
            </Tag>
          </div>
        }
        extra={
          <Button
            type="primary"
            icon={<WarningOutlined />}
            onClick={handleCreate}
            style={{
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
              border: 'none',
              boxShadow: '0 4px 12px rgba(255, 77, 79, 0.3)'
            }}
          >
            添加风险
          </Button>
        }
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          borderRadius: 12,
          border: 'none',
          overflow: 'hidden'
        }}
      >
        {/* 风险统计概览 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
              <Statistic
                title="总风险数"
                value={stats.total}
                valueStyle={{ color: '#666', fontSize: '24px' }}
                prefix={<WarningOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
              <Statistic
                title="紧急风险"
                value={stats.urgent}
                valueStyle={{ color: '#ff4d4f', fontSize: '24px' }}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
              <Statistic
                title="高风险"
                value={stats.high}
                valueStyle={{ color: '#ff7a45', fontSize: '24px' }}
                prefix={<ExclamationCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card size="small" style={{ textAlign: 'center', borderRadius: 8 }}>
              <Statistic
                title="已解决"
                value={stats.resolved}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* 风险分布图 */}
        <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
          <Col xs={24} lg={12}>
            <Card size="small" title="风险等级分布">
              <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                {riskLevels.map(level => {
                  const count = risks.filter(r => r.level === level.value).length;
                  const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                  return (
                    <div key={level.value} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: level.color }}>
                        {count}
                      </div>
                      <Tag color={level.color} style={{ marginTop: '8px' }}>
                        {level.value}
                      </Tag>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card size="small" title="风险类型分布">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {riskTypes.map(type => {
                  const count = risks.filter(r => r.type === type).length;
                  return (
                    <Tag key={type} color="blue" style={{ fontSize: '12px' }}>
                      {type} ({count})
                    </Tag>
                  );
                })}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 风险列表 */}
        <Table
          dataSource={risks}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            total: risks.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条风险记录`,
          }}
          size="middle"
        />
      </Card>

      {/* 查看风险模态框 */}
      <Modal
        title="风险详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={600}
        styles={{
          body: {
            padding: '24px',
            background: '#fafafa'
          }
        }}
      >
        {viewingRisk && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <strong>风险类型:</strong> {viewingRisk.type}
              </Col>
              <Col span={12}>
                <strong>风险等级:</strong> <Tag color={getLevelColor(viewingRisk.level)}>{viewingRisk.level}</Tag>
              </Col>
              <Col span={12}>
                <strong>当前状态:</strong> <Tag color={getStatusColor(viewingRisk.status)}>{viewingRisk.status}</Tag>
              </Col>
              <Col span={12}>
                <strong>发生概率:</strong> {viewingRisk.probability}%
              </Col>
            </Row>
            <Divider />
            <div>
              <strong>风险描述:</strong>
              <p style={{ marginTop: 8, color: '#666' }}>{viewingRisk.description}</p>
            </div>
            <div>
              <strong>潜在影响:</strong>
              <p style={{ marginTop: 8, color: '#666' }}>{viewingRisk.impact}</p>
            </div>
            <Divider />
            <div>
              <strong>相关任务:</strong>
              <p style={{ marginTop: 8, color: '#666' }}>{viewingRisk.taskTitle}</p>
            </div>
            <div>
              <strong>创建时间:</strong>
              <p style={{ marginTop: 8, color: '#666' }}>{new Date(viewingRisk.createdAt).toLocaleString()}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* 创建/编辑风险模态框 */}
      <Modal
        title={editingRisk ? '编辑风险' : '添加风险'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
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
        >
          <Form.Item
            label="风险类型"
            name="type"
            rules={[{ required: true, message: '请选择风险类型' }]}
          >
            <Select placeholder="请选择风险类型">
              {riskTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="风险等级"
            name="level"
            rules={[{ required: true, message: '请选择风险等级' }]}
          >
            <Select placeholder="请选择风险等级">
              {riskLevels.map(level => (
                <Option key={level.value} value={level.value}>{level.value}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="风险描述"
            name="description"
            rules={[{ required: true, message: '请输入风险描述' }]}
          >
            <TextArea rows={3} placeholder="请详细描述风险情况" />
          </Form.Item>

          <Form.Item
            label="潜在影响"
            name="impact"
            rules={[{ required: true, message: '请描述潜在影响' }]}
          >
            <TextArea rows={3} placeholder="请描述风险的潜在影响" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setIsModalVisible(false)}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRisk ? '更新' : '创建'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RiskManagement;