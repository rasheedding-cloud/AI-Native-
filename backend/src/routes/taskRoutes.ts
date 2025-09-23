import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有任务
router.get('/', asyncHandler(async (req, res) => {
  const tasks = await prisma.task.findMany({
    include: {
      project: {
        include: {
          initiative: {
            include: {
              strategy: true
            }
          }
        }
      },
      subtasks: true
    },
    orderBy: { priority: 'desc' }
  });

  res.json({
    success: true,
    data: tasks
  });
}));

// 创建任务
router.post('/', asyncHandler(async (req, res) => {
  const {
    title,
    description,
    projectId,
    assignee,
    priority,
    estimate,
    due,
    dependencies,
    kpiLinks,
    riskFlags
  } = req.body;

  if (!title || !projectId) {
    throw createError('任务标题和项目ID不能为空', 400);
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      projectId,
      assignee,
      priority: priority || 0.0,
      estimate,
      due: due ? new Date(due) : null,
      dependencies: dependencies ? JSON.stringify(dependencies) : null,
      kpiLinks: kpiLinks ? JSON.stringify(kpiLinks) : null,
      riskFlags: riskFlags ? JSON.stringify(riskFlags) : null
    },
    include: {
      project: {
        include: {
          initiative: {
            include: {
              strategy: true
            }
          }
        }
      },
      subtasks: true
    }
  });

  res.status(201).json({
    success: true,
    data: task
  });
}));

export default router;