import express from 'express';
import { asyncHandler } from '../middleware/errorHandler';

const router = express.Router();

// AI优先级计算
router.post('/priority', asyncHandler(async (req, res) => {
  const { kpiWeights, urgency, effort, risk, dependencyCriticality } = req.body;

  // 这里应该调用AI服务进行优先级计算
  // 目前使用模拟数据
  const priority = (
    kpiWeights.experience * 0.3 +
    urgency * 0.25 +
    (1 - effort) * 0.2 +
    (1 - risk) * 0.15 +
    dependencyCriticality * 0.1
  );

  const response = {
    priority: Math.max(0, Math.min(1, priority)),
    reasoning: '基于KPI权重、紧急度、工作量、风险和依赖关键性综合计算得出',
    confidence: 0.85
  };

  res.json({
    success: true,
    data: response
  });
}));

// AI排期建议
router.post('/scheduling', asyncHandler(async (req, res) => {
  const { taskId, estimate, dependencies, hardDeadline, teamCalendar, prayerWeekendRules } = req.body;

  // 这里应该调用AI服务进行排期计算
  // 目前使用模拟数据
  const now = new Date();
  const recommendedStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 明天开始
  const recommendedEnd = new Date(recommendedStart.getTime() + estimate * 24 * 60 * 60 * 1000);

  const response = {
    recommendedStart,
    recommendedEnd,
    conflicts: [],
    suggestions: [
      '建议在工作日上午9-11点进行重要任务',
      '避免在祷告时间安排重要会议',
      '预留缓冲时间应对突发情况'
    ]
  };

  res.json({
    success: true,
    data: response
  });
}));

// 合规检查
router.post('/compliance', asyncHandler(async (req, res) => {
  const { text, entityType } = req.body;

  // 敏感词列表
  const sensitiveWords = ['猪', '酒', '十字架', '圣诞节', '男女同框', '以色列'];
  const foundWords = sensitiveWords.filter(word => text.includes(word));

  const riskLevel = foundWords.length === 0 ? 'LOW' :
                   foundWords.length <= 2 ? 'MEDIUM' : 'HIGH';

  const suggestions = foundWords.map(word => {
    switch(word) {
      case '猪': return '建议使用"猪肉"或其他替代词汇';
      case '酒': return '建议使用"酒精饮料"或避免提及';
      case '十字架': return '建议避免宗教符号';
      case '圣诞节': return '建议使用"节日"替代';
      case '男女同框': return '建议注意性别隔离要求';
      case '以色列': return '建议使用"中东地区"替代';
      default: return '建议重新考虑此词汇';
    }
  });

  const response = {
    sensitiveWords: foundWords,
    riskLevel,
    suggestions,
    isCompliant: foundWords.length === 0
  };

  res.json({
    success: true,
    data: response
  });
}));

// 报告生成
router.post('/report', asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.body;

  // 这里应该调用AI服务生成报告
  // 目前使用模拟数据
  const report = {
    type,
    period: `${startDate} - ${endDate}`,
    generatedAt: new Date().toISOString(),
    content: {
      status: '所有项目按计划进行',
      issues: ['任务A进度延迟2天', '资源分配需要优化'],
      suggestions: ['增加人力资源', '调整优先级'],
      risks: ['技术风险: 新框架学习曲线', '时间风险: 截止日期紧张']
    }
  };

  res.json({
    success: true,
    data: report
  });
}));

export default router;