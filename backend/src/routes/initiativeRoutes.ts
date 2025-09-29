import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有战役
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  const initiatives = await prisma.initiative.findMany({
    include: {
      strategy: true,
      projects: {
        include: {
          tasks: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: initiatives
  });
}));

// 创建战役
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const { name, description, strategyId } = req.body;

  if (!name || !strategyId) {
    throw createError('战役名称和战略ID不能为空', 400);
  }

  const initiative = await prisma.initiative.create({
    data: {
      name,
      description,
      strategyId
    },
    include: {
      strategy: true,
      projects: true
    }
  });

  res.status(201).json({
    success: true,
    data: initiative
  });
}));

export default router;