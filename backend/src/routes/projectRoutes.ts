import express from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有项目
router.get('/', asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    include: {
      initiative: {
        include: {
          strategy: true
        }
      },
      tasks: {
        include: {
          subtasks: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: projects
  });
}));

// 创建项目
router.post('/', asyncHandler(async (req, res) => {
  const { name, description, initiativeId } = req.body;

  if (!name || !initiativeId) {
    throw createError('项目名称和战役ID不能为空', 400);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description,
      initiativeId
    },
    include: {
      initiative: {
        include: {
          strategy: true
        }
      },
      tasks: true
    }
  });

  res.status(201).json({
    success: true,
    data: project
  });
}));

export default router;