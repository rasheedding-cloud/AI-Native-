import React, { useState } from 'react';
import { Card, Form, Switch, Input, Slider, Select, Button, Space, message, Divider, Row, Col, Alert } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // AI 功能设置
  const aiFeatures = [
    {
      key: 'priority',
      title: 'AI 优先级计算',
      description: '自动计算任务优先级，考虑KPI影响度、紧急程度等因素'
    },
    {
      key: 'scheduling',
      title: 'AI 智能排期',
      description: '智能任务排期，考虑依赖关系和团队日历'
    },
    {
      key: 'reporting',
      title: 'AI 报告生成',
      description: '自动生成周报和月报，包含现状分析、建议和风险'
    },
    {
      key: 'compliance',
      title: 'AI 合规检查',
      description: '自动检查敏感内容，确保符合合规要求'
    }
  ];

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      // 这里应该调用API保存设置
      console.log('保存设置:', values);
      message.success('设置保存成功！');
    } catch (error) {
      message.error('设置保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('设置已重置为默认值');
  };

  
  return (
    <div>
      <Card
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <SettingOutlined style={{ fontSize: '24px', color: '#667eea' }} />
            <span>系统设置</span>
          </div>
        }
        style={{
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          borderRadius: 12,
          border: 'none',
          overflow: 'hidden'
        }}
      >
        <Alert
          message="AI 功能配置"
          description="在这里您可以启用或禁用各种AI功能，调整AI参数，以及配置自动化任务。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            enablePriority: true,
            enableScheduling: true,
            enableReporting: true,
            enableCompliance: true,
            priorityWeight: 70,
            urgencyWeight: 80,
            effortWeight: 60,
            riskWeight: 90,
            autoPriorityCalculation: false,
            autoScheduling: false,
            autoReporting: false,
            autoCompliance: false,
            reportFrequency: 'weekly',
            complianceLevel: 'medium',
            aiModel: 'default'
          }}
        >
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card
                title="AI 功能开关"
                size="small"
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  {aiFeatures.map((feature) => (
                    <div key={feature.key} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      border: '1px solid #f0f0f0',
                      borderRadius: 8
                    }}>
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{feature.title}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {feature.description}
                        </div>
                      </div>
                      <Form.Item
                        name={`enable${feature.key.charAt(0).toUpperCase() + feature.key.slice(1)}`}
                        valuePropName="checked"
                        noStyle
                      >
                        <Switch />
                      </Form.Item>
                    </div>
                  ))}
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card
                title="自动化设置"
                size="small"
                style={{ height: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>自动优先级计算</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        当任务发生变化时自动重新计算优先级
                      </div>
                    </div>
                    <Form.Item
                      name="autoPriorityCalculation"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>自动智能排期</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        当任务状态变化时自动调整排期
                      </div>
                    </div>
                    <Form.Item
                      name="autoScheduling"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>自动报告生成</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        按设定频率自动生成报告
                      </div>
                    </div>
                    <Form.Item
                      name="autoReporting"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px',
                    border: '1px solid #f0f0f0',
                    borderRadius: 8
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold' }}>自动合规检查</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        新内容创建时自动进行合规检查
                      </div>
                    </div>
                    <Form.Item
                      name="autoCompliance"
                      valuePropName="checked"
                      noStyle
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Row gutter={[24, 24]}>
            <Col xs={24} lg={12}>
              <Card title="AI 参数调整" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Form.Item
                    label="KPI影响度权重"
                    name="priorityWeight"
                    tooltip="影响度在优先级计算中的权重"
                  >
                    <Slider
                      min={0}
                      max={100}
                      marks={{
                        0: '0%',
                        50: '50%',
                        100: '100%'
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="紧急程度权重"
                    name="urgencyWeight"
                    tooltip="紧急程度在优先级计算中的权重"
                  >
                    <Slider
                      min={0}
                      max={100}
                      marks={{
                        0: '0%',
                        50: '50%',
                        100: '100%'
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="工作量权重"
                    name="effortWeight"
                    tooltip="工作量在优先级计算中的权重"
                  >
                    <Slider
                      min={0}
                      max={100}
                      marks={{
                        0: '0%',
                        50: '50%',
                        100: '100%'
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="风险权重"
                    name="riskWeight"
                    tooltip="风险评估在优先级计算中的权重"
                  >
                    <Slider
                      min={0}
                      max={100}
                      marks={{
                        0: '0%',
                        50: '50%',
                        100: '100%'
                      }}
                    />
                  </Form.Item>
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="高级设置" size="small">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Form.Item
                    label="报告生成频率"
                    name="reportFrequency"
                    tooltip="自动生成报告的频率"
                  >
                    <Select>
                      <Option value="daily">每日</Option>
                      <Option value="weekly">每周</Option>
                      <Option value="monthly">每月</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="合规检查级别"
                    name="complianceLevel"
                    tooltip="合规检查的严格程度"
                  >
                    <Select>
                      <Option value="low">低 - 基本检查</Option>
                      <Option value="medium">中 - 标准检查</Option>
                      <Option value="high">高 - 严格检查</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="AI 模型选择"
                    name="aiModel"
                    tooltip="选择使用的AI模型"
                  >
                    <Select>
                      <Option value="default">默认模型</Option>
                      <Option value="advanced">高级模型</Option>
                      <Option value="fast">快速模型</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item
                    label="自定义提示词"
                    name="customPrompt"
                    tooltip="自定义AI处理指令"
                  >
                    <TextArea
                      rows={3}
                      placeholder="请输入自定义的AI处理指令..."
                    />
                  </Form.Item>
                </Space>
              </Card>
            </Col>
          </Row>

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space size="large">
              <Button
                icon={<ReloadOutlined />}
                onClick={handleReset}
                size="large"
              >
                重置设置
              </Button>
              <Button
                icon={<SaveOutlined />}
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                }}
              >
                保存设置
              </Button>
            </Space>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;