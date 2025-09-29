import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有KPI
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
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
router.post('/', asyncHandler(async (req: Request, res: Response) => {
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

// 获取单个KPI
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const kpi = await prisma.kpi.findUnique({
    where: { id },
    include: {
      strategy: true
    }
  });

  if (!kpi) {
    throw createError('KPI不存在', 404);
  }

  res.json({
    success: true,
    data: kpi
  });
}));

// 更新KPI
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, target, current, strategyId } = req.body;

  const existingKpi = await prisma.kpi.findUnique({
    where: { id }
  });

  if (!existingKpi) {
    throw createError('KPI不存在', 404);
  }

  const kpi = await prisma.kpi.update({
    where: { id },
    data: {
      name: name || existingKpi.name,
      target: target !== undefined ? target : existingKpi.target,
      current: current !== undefined ? current : existingKpi.current,
      strategyId: strategyId || existingKpi.strategyId
    },
    include: {
      strategy: true
    }
  });

  res.json({
    success: true,
    data: kpi
  });
}));

// 删除KPI
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingKpi = await prisma.kpi.findUnique({
    where: { id }
  });

  if (!existingKpi) {
    throw createError('KPI不存在', 404);
  }

  await prisma.kpi.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: 'KPI已删除'
  });
}));

// 更新KPI当前值
router.patch('/:id/current', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { current } = req.body;

  if (current === undefined) {
    throw createError('当前值不能为空', 400);
  }

  const kpi = await prisma.kpi.update({
    where: { id },
    data: { current },
    include: {
      strategy: true
    }
  });

  res.json({
    success: true,
    data: kpi
  });
}));

export default router;