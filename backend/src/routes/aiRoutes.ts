import express, { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import { AIService } from '../services/aiService';

const router = express.Router();

// AI优先级计算
router.post('/priority', asyncHandler(async (req: Request, res: Response) => {
  const { taskId, kpiWeights, urgency, effort, risk, dependencyCriticality, taskDescription, assignee } = req.body;

  const result = AIService.calculatePriority({
    kpiWeights,
    urgency,
    effort,
    risk,
    dependencyCriticality,
    taskDescription,
    assignee
  });

  res.json({
    success: true,
    data: result
  });
}));

// AI排期建议
router.post('/scheduling', asyncHandler(async (req: Request, res: Response) => {
  const { taskId, estimate, dependencies, hardDeadline, teamCalendar, prayerWeekendRules } = req.body;

  const result = AIService.generateSchedule({
    taskId,
    estimate,
    dependencies,
    hardDeadline: hardDeadline ? new Date(hardDeadline) : undefined,
    teamCalendar,
    prayerWeekendRules
  });

  res.json({
    success: true,
    data: result
  });
}));

// 合规检查
router.post('/compliance', asyncHandler(async (req: Request, res: Response) => {
  const { text, entityType } = req.body;

  const result = AIService.checkCompliance(text);

  res.json({
    success: true,
    data: result
  });
}));

// 报告生成
router.post('/report', asyncHandler(async (req: Request, res: Response) => {
  const { type, startDate, endDate, data } = req.body;

  const result = AIService.generateReport({
    type,
    startDate,
    endDate,
    data
  });

  res.json({
    success: true,
    data: result
  });
}));

export default router;