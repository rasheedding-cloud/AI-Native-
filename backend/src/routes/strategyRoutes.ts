import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有战略
router.get('/', asyncHandler(async (req, res) => {
  const strategies = await prisma.strategy.findMany({
    include: {
      kpis: true,
      initiatives: {
        include: {
          projects: {
            include: {
              tasks: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: strategies
  });
}));

// 创建战略
router.post('/', asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    throw createError('战略名称不能为空', 400);
  }

  const strategy = await prisma.strategy.create({
    data: {
      name,
      description
    },
    include: {
      kpis: true,
      initiatives: true
    }
  });

  res.status(201).json({
    success: true,
    data: strategy
  });
}));

// 获取单个战略
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const strategy = await prisma.strategy.findUnique({
    where: { id },
    include: {
      kpis: true,
      initiatives: {
        include: {
          projects: {
            include: {
              tasks: true
            }
          }
        }
      }
    }
  });

  if (!strategy) {
    throw createError('战略不存在', 404);
  }

  res.json({
    success: true,
    data: strategy
  });
}));

// 更新战略
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const strategy = await prisma.strategy.update({
    where: { id },
    data: {
      name,
      description
    },
    include: {
      kpis: true,
      initiatives: true
    }
  });

  res.json({
    success: true,
    data: strategy
  });
}));

// 删除战略
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.strategy.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: '战略删除成功'
  });
}));

export default router;