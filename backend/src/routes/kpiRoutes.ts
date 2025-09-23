import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有KPI
router.get('/', asyncHandler(async (req, res) => {
  const kpis = await prisma.kpi.findMany({
    include: {
      strategy: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: kpis
  });
}));

// 创建KPI
router.post('/', asyncHandler(async (req, res) => {
  const { name, target, current, strategyId } = req.body;

  if (!name || target === undefined || !strategyId) {
    throw createError('KPI名称、目标值和战略ID不能为空', 400);
  }

  const kpi = await prisma.kpi.create({
    data: {
      name,
      target,
      current: current || 0.0,
      strategyId
    },
    include: {
      strategy: true
    }
  });

  res.status(201).json({
    success: true,
    data: kpi
  });
}));

export default router;