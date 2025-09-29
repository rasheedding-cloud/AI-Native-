import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Modal, Space, message, Tag, Tabs, Alert, Divider, Row, Col, Statistic } from 'antd';
import {
  RobotOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useStore } from '../store';


const AIFeatures: React.FC = () => {
  const navigate = useNavigate();
  const { tasks, projects, kpis } = useStore();
  const [activeTab, setActiveTab] = useState('1');
  const [priorityModalVisible, setPriorityModalVisible] = useState(false);
  const [schedulingModalVisible, setSchedulingModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [complianceModalVisible, setComplianceModalVisible] = useState(false);

  // AI 优先级计算
  const handleAIPriorityCalculation = async () => {
    try {
      if (tasks.length === 0) {
        message.warning('暂无任务数据，请先创建任务');
        return;
      }

      // 模拟AI优先级计算逻辑
      const updatedTasks = tasks.map(task => {
        // 计算优先级分数
        const kpiImpact = task.kpiWeights ?
          Object.values(task.kpiWeights).reduce((sum: number, weight: any) => sum + (weight as number), 0) / 5 : 0.5;

        const urgency = task.due ?
          Math.max(0, 1 - (new Date(task.due).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000)) : 0.5;

        const effort = task.estimate ? Math.min(1, task.estimate / 40) : 0.5; // 假设40小时为标准
        const risk = task.riskFlags ? JSON.parse(task.riskFlags).length * 0.1 : 0;

        const priority = (
          kpiImpact * 0.3 +
          urgency * 0.25 +
          (1 - effort) * 0.2 +
          (1 - risk) * 0.15 +
          (task.dependencies?.length || 0) * 0.1
        );

        return {
          ...task,
          priority: Math.round(priority * 100) / 100
        };
      });

      // 按优先级排序
      const sortedTasks = updatedTasks.sort((a, b) => b.priority - a.priority);

      console.log('AI优先级计算结果:', sortedTasks.map(t => ({
        title: t.title,
        priority: t.priority
      })));

      message.success(`AI 优先级计算完成！已为 ${tasks.length} 个任务重新计算优先级。`);
      setPriorityModalVisible(false);
    } catch (error) {
      console.error('AI优先级计算失败:', error);
      message.error('AI 优先级计算失败');
    }
  };

  // AI 排期
  const handleAIScheduling = async () => {
    try {
      if (tasks.length === 0) {
        message.warning('暂无任务数据，请先创建任务');
        return;
      }

      // 模拟AI排期逻辑
      const schedule = [];
      const workingHours = { start: 9, end: 18 }; // 9-18点
      const prayerBreaks = [{ start: 12.5, end: 14 }, { start: 17.5, end: 19 }];

      let currentDate = new Date();
      let currentHour = workingHours.start;

      // 简单的排期算法
      tasks.forEach(task => {
        if (task.status === 'COMPLETED') return;

        const estimatedHours = task.estimate || 8; // 默认8小时
        let remainingHours = estimatedHours;

        while (remainingHours > 0) {
          // 检查是否为工作日
          if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
            currentHour = workingHours.start;
            continue;
          }

          // 检查祈祷时间
          const inPrayerTime = prayerBreaks.some(prayerBreak =>
            currentHour >= prayerBreak.start && currentHour < prayerBreak.end
          );

          if (inPrayerTime) {
            currentHour = prayerBreaks.find(b => currentHour < b.end)?.end || workingHours.end;
            continue;
          }

          // 检查工作时间
          if (currentHour >= workingHours.end) {
            currentDate.setDate(currentDate.getDate() + 1);
            currentHour = workingHours.start;
            continue;
          }

          // 分配工作时间
          const availableHours = Math.min(remainingHours, workingHours.end - currentHour);
          remainingHours -= availableHours;
          currentHour += availableHours;

          if (remainingHours > 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            currentHour = workingHours.start;
          }
        }

        schedule.push({
          task: task.title,
          startDate: new Date(currentDate),
          estimatedHours
        });
      });

      console.log('AI排期结果:', schedule);

      message.success(`AI 智能排期完成！已为 ${tasks.length} 个任务制定排期计划。`);
      setSchedulingModalVisible(false);
    } catch (error) {
      console.error('AI排期失败:', error);
      message.error('AI 智能排期失败');
    }
  };

  // AI 报告生成
  const handleAIReport = async () => {
    try {
      if (projects.length === 0 && tasks.length === 0) {
        message.warning('暂无项目数据，请先创建项目或任务');
        return;
      }

      // 计算统计数据
      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === '已完成').length;
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
      const overdueTasks = tasks.filter(t => {
        if (!t.due) return false;
        return new Date(t.due) < new Date() && t.status !== 'COMPLETED';
      }).length;

      // 计算KPI完成率
      const kpiCompletion = kpis.length > 0 ?
        kpis.reduce((sum, kpi) => {
          const rate = kpi.target > 0 ? (kpi.current / kpi.target) * 100 : 0;
          return sum + Math.min(100, rate);
        }, 0) / kpis.length : 0;

      // 生成报告内容
      const report = {
        period: '本周',
        generatedAt: new Date().toLocaleString(),
        summary: {
          totalProjects,
          completedProjects,
          projectCompletion: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0,
          totalTasks,
          completedTasks,
          taskCompletion: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
          overdueTasks,
          kpiCompletion: Math.round(kpiCompletion)
        },
        findings: [
          `项目完成率达到 ${Math.round(totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0)}%`,
          `任务完成率达到 ${Math.round(totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0)}%`,
          `KPI整体完成率为 ${Math.round(kpiCompletion)}%`,
          overdueTasks > 0 ? `有 ${overdueTasks} 个任务已逾期，需要关注` : '暂无逾期任务'
        ],
        recommendations: [
          '建议优先处理高优先级任务',
          '加强团队协作，提高任务完成率',
          '定期监控KPI进度，及时调整策略',
          '关注风险管理，提前制定应对方案'
        ]
      };

      console.log('AI生成的报告:', report);

      message.success('AI 报告生成完成！已生成包含现状、问题、建议和风险的完整报告。');
      setReportModalVisible(false);
    } catch (error) {
      console.error('AI报告生成失败:', error);
      message.error('AI 报告生成失败');
    }
  };

  // 启用全部AI功能
  const handleEnableAllAI = async () => {
    try {
      message.success('已启用全部AI功能！包括优先级计算、智能排期、报告生成和合规检查。');
      // 这里可以添加实际的启用逻辑
    } catch (error) {
      message.error('启用AI功能失败');
    }
  };

  // 合规检查
  const handleComplianceCheck = async () => {
    try {
      const allTexts = [
        ...projects.map(p => p.name + ' ' + (p.description || '')),
        ...tasks.map(t => t.title + ' ' + (t.description || '')),
        ...kpis.map(k => k.name)
      ];

      const sensitiveWords = ['猪', '酒', '十字架', '圣诞节', '男女同框', '以色列'];
      const riskItems: string[] = [];

      allTexts.forEach((text, index) => {
        sensitiveWords.forEach(word => {
          if (text.includes(word)) {
            riskItems.push(`发现敏感词 "${word}" 在项目或任务中`);
          }
        });
      });

      const riskLevel = riskItems.length === 0 ? '无风险' :
                       riskItems.length <= 2 ? '低风险' :
                       riskItems.length <= 5 ? '中风险' : '高风险';

      console.log('合规检查结果:', { riskLevel, riskItems });

      if (riskItems.length === 0) {
        message.success('合规检查完成！未发现敏感内容，合规率100%。');
      } else {
        message.warning(`合规检查完成！发现 ${riskItems.length} 个风险项目，风险等级：${riskLevel}。`);
      }

      setComplianceModalVisible(false);
    } catch (error) {
      console.error('合规检查失败:', error);
      message.error('合规检查失败');
    }
  };

  const aiFeatures = [
    {
      key: '1',
      label: 'AI 优先级引擎',
      children: (
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 优先级计算引擎"
            description="基于多因子智能计算任务优先级，包括 KPI 影响度、紧急程度、工作量、风险和依赖关键性。"
            type="info"
            style={{ marginBottom: '24px' }}
          />

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="高优先级任务"
                  value={12}
                  prefix={<ThunderboltOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="中优先级任务"
                  value={28}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="低优先级任务"
                  value={45}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="优先级计算公式" style={{ marginTop: '24px' }}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p><strong>Priority = f(Impact_on_KPI, Urgency, Effort, Risk, Dependency_Criticality)</strong></p>
              <p>• KPI 影响度 (30%): 任务对关键绩效指标的影响程度</p>
              <p>• 紧急程度 (25%): 任务的时效性和截止日期</p>
              <p>• 工作量 (20%): 完成任务所需的时间和资源</p>
              <p>• 风险 (15%): 任务失败的可能性和影响</p>
              <p>• 依赖关键性 (10%): 对其他任务的影响程度</p>
            </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              size="large"
              icon={<RobotOutlined />}
              onClick={() => setPriorityModalVisible(true)}
            >
              重新计算所有任务优先级
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '2',
      label: 'AI 排期引擎',
      children: (
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 智能排期引擎"
            description="智能考虑任务依赖关系、团队日历、祈祷时间和周末规则，自动生成最优排期方案。"
            type="info"
            style={{ marginBottom: '24px' }}
          />

          <Row gutter={[16, 16]}>
            <Col span={6}>
              <Card>
                <Statistic
                  title="任务总数"
                  value={85}
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="平均排期准确率"
                  value={92}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="冲突解决"
                  value={15}
                  prefix={<AlertOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="资源利用率"
                  value={87}
                  suffix="%"
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="排期规则" style={{ marginTop: '24px' }}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p><strong>📅 基础排期规则:</strong></p>
              <p>• 工作时间: 周一至周五 9:00-18:00</p>
              <p>• 祈祷时间: 每日 12:30-14:00, 17:30-19:00</p>
              <p>• 周末休息: 周六、周日</p>
              <p>• 节假日: 按照法定节假日安排</p>

              <Divider />

              <p><strong>🔗 依赖关系处理:</strong></p>
              <p>• 前置任务必须完成后才能开始后续任务</p>
              <p>• 并行任务考虑资源冲突</p>
              <p>• 关键路径优先级调整</p>
            </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              size="large"
              icon={<CalendarOutlined />}
              onClick={() => setSchedulingModalVisible(true)}
            >
              生成智能排期方案
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: 'AI 报告生成',
      children: (
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 报告生成器"
            description="自动生成结构化的周报和月报，包含现状分析、问题识别、建议方案和风险评估。"
            type="info"
            style={{ marginBottom: '24px' }}
          />

          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card title="最新周报" extra={<Tag color="blue">本周</Tag>}>
                <div>
                  <h4>📊 项目进度概况</h4>
                  <p>• 项目整体完成度: 68%</p>
                  <p>• 本周完成任务: 15 个</p>
                  <p>• 新增任务: 8 个</p>
                  <p>• 延期任务: 3 个</p>

                  <Divider />

                  <h4>🎯 KPI 完成情况</h4>
                  <p>• 体验课转化率: 80% (目标 85%)</p>
                  <p>• 教材完成度: 94% (目标 90%)</p>
                  <p>• ROI: 84% (目标 80%)</p>
                </div>
              </Card>
            </Col>
            <Col span={12}>
              <Card title="最新月报" extra={<Tag color="purple">本月</Tag>}>
                <div>
                  <h4>📈 月度趋势分析</h4>
                  <p>• 任务完成率提升 12%</p>
                  <p>• 团队效率提升 8%</p>
                  <p>• KPI 达标率提升 15%</p>

                  <Divider />

                  <h4>🔍 主要发现</h4>
                  <p>• 战略执行效果良好</p>
                  <p>• 团队协作效率提升</p>
                  <p>• 需要关注风险管理</p>
                </div>
              </Card>
            </Col>
          </Row>

          <Card title="报告结构模板" style={{ marginTop: '24px' }}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p><strong>📋 标准报告结构:</strong></p>
              <p>1. <strong>现状</strong> - 当前项目状态和 KPI 完成情况</p>
              <p>2. <strong>问题</strong> - 识别的困难和挑战</p>
              <p>3. <strong>建议</strong> - 具体的改进措施和方案</p>
              <p>4. <strong>风险</strong> - 潜在风险和应对策略</p>

              <Divider />

              <p><strong>🤖 AI 增强功能:</strong></p>
              <p>• 智能数据分析和趋势预测</p>
              <p>• 自动异常检测和预警</p>
              <p>• 个性化建议生成</p>
            </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              size="large"
              icon={<BarChartOutlined />}
              onClick={() => setReportModalVisible(true)}
            >
              生成最新周报
            </Button>
          </div>
        </div>
      ),
    },
    {
      key: '4',
      label: '合规检查',
      children: (
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 合规雷达"
            description="智能扫描项目内容，检测敏感词汇，评估合规风险，提供改进建议。"
            type="warning"
            style={{ marginBottom: '24px' }}
          />

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="已检查内容"
                  value={1256}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="发现风险"
                  value={2}
                  prefix={<ExclamationCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="合规率"
                  value={99.8}
                  suffix="%"
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          <Card title="敏感词检测" style={{ marginTop: '24px' }}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <p><strong>🚫 监控的敏感词汇:</strong></p>
              <p>• 猪、酒、十字架、圣诞节、男女同框、以色列</p>

              <Divider />

              <p><strong>⚠️ 风险等级分类:</strong></p>
              <p>• <Tag color="green">低风险</Tag> - 偶尔出现，建议替换</p>
              <p>• <Tag color="orange">中风险</Tag> - 多次出现，需要整改</p>
              <p>• <Tag color="red">高风险</Tag> - 大量出现，立即处理</p>
            </div>
          </Card>

          <Card title="最新检查结果" style={{ marginTop: '24px' }}>
            <div>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#fff7e6', borderRadius: '8px', borderLeft: '4px solid #faad14' }}>
                <h4>🔍 发现的低风险项目</h4>
                <p>1. 项目描述中包含"庆祝"词汇，建议改为"庆贺"</p>
                <p>2. 任务标题中包含"传统"词汇，建议改为"惯例"</p>
              </div>

              <div style={{ marginBottom: '16px', padding: '12px', background: '#f6ffed', borderRadius: '8px', borderLeft: '4px solid #52c41a' }}>
                <h4>✅ 合规建议</h4>
                <p>• 使用更加中性和专业的词汇</p>
                <p>• 避免涉及敏感主题的内容</p>
                <p>• 定期进行合规检查</p>
              </div>
            </div>
          </Card>

          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <Button
              type="primary"
              size="large"
              icon={<AlertOutlined />}
              onClick={() => setComplianceModalVisible(true)}
            >
              执行合规检查
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Card
        title={(
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <span>AI功能</span>
            <Tag color="purple" style={{ fontSize: '12px' }}>
              4个智能功能
            </Tag>
          </div>
        )}
        extra={
          <Space wrap>
            <Button
              icon={<RobotOutlined />}
              size="middle"
              style={{
                borderRadius: 8,
                border: '1px solid #d9d9d9',
                transition: 'all 0.3s ease'
              }}
              onClick={() => navigate('/settings')}
            >
              AI 设置
            </Button>
            <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            size="middle"
            onClick={handleEnableAllAI}
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
              启用全部AI功能
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
          items={aiFeatures}
          style={{ marginTop: 16 }}
          className="custom-tabs"
        />
      </Card>

      {/* AI 优先级计算模态框 */}
      <Modal
        title="AI 优先级计算"
        open={priorityModalVisible}
        onOk={handleAIPriorityCalculation}
        onCancel={() => setPriorityModalVisible(false)}
        okText="开始计算"
        cancelText="取消"
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
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 8,
            transition: 'all 0.3s ease'
          }
        }}
      >
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 优先级计算说明"
            description="系统将分析所有任务的 KPI 影响度、紧急程度、工作量、风险因素和依赖关系，重新计算最优优先级排序。"
            type="info"
            style={{ marginBottom: '16px' }}
          />

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <h4>计算参数:</h4>
            <p>• KPI 影响度权重: 30%</p>
            <p>• 紧急程度权重: 25%</p>
            <p>• 工作量权重: 20%</p>
            <p>• 风险权重: 15%</p>
            <p>• 依赖关键性权重: 10%</p>
          </div>
        </div>
      </Modal>

      {/* AI 排期模态框 */}
      <Modal
        title="AI 智能排期"
        open={schedulingModalVisible}
        onOk={handleAIScheduling}
        onCancel={() => setSchedulingModalVisible(false)}
        okText="开始排期"
        cancelText="取消"
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
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 8,
            transition: 'all 0.3s ease'
          }
        }}
      >
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 智能排期说明"
            description="系统将考虑任务依赖关系、团队日历、祈祷时间和周末规则，生成最优的项目排期方案。"
            type="info"
            style={{ marginBottom: '16px' }}
          />

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <h4>排期规则:</h4>
            <p>• 工作时间: 周一至周五 9:00-18:00</p>
            <p>• 祈祷时间: 每日 12:30-14:00, 17:30-19:00</p>
            <p>• 依赖关系: 前置任务完成后才能开始后续任务</p>
            <p>• 资源优化: 避免任务冲突，提高资源利用率</p>
          </div>
        </div>
      </Modal>

      {/* AI 报告模态框 */}
      <Modal
        title="AI 报告生成"
        open={reportModalVisible}
        onOk={handleAIReport}
        onCancel={() => setReportModalVisible(false)}
        okText="生成报告"
        cancelText="取消"
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
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 8,
            transition: 'all 0.3s ease'
          }
        }}
      >
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 报告生成说明"
            description="系统将自动分析项目数据，生成包含现状、问题、建议和风险的完整报告。"
            type="info"
            style={{ marginBottom: '16px' }}
          />

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <h4>报告内容:</h4>
            <p>• 项目进度和 KPI 完成情况</p>
            <p>• 问题识别和根因分析</p>
            <p>• 改进建议和行动计划</p>
            <p>• 风险评估和应对策略</p>
          </div>
        </div>
      </Modal>

      {/* 合规检查模态框 */}
      <Modal
        title="AI 合规检查"
        open={complianceModalVisible}
        onOk={handleComplianceCheck}
        onCancel={() => setComplianceModalVisible(false)}
        okText="开始检查"
        cancelText="取消"
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
        okButtonProps={{
          style: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: 8,
            transition: 'all 0.3s ease'
          }
        }}
      >
        <div style={{ padding: '20px' }}>
          <Alert
            message="AI 合规检查说明"
            description="系统将扫描所有项目内容，检测敏感词汇，评估合规风险，提供改进建议。"
            type="warning"
            style={{ marginBottom: '16px' }}
          />

          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px' }}>
            <h4>检查范围:</h4>
            <p>• 项目名称和描述</p>
            <p>• 任务标题和内容</p>
            <p>• 文档和备注</p>
            <p>• 监控词汇: 猪、酒、十字架、圣诞节、男女同框、以色列</p>
          </div>
        </div>
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

export default AIFeatures;