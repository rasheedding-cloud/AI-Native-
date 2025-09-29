import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有项目
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
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
router.post('/', asyncHandler(async (req: Request, res: Response) => {
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

// 获取单个项目
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const project = await prisma.project.findUnique({
    where: { id },
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
    }
  });

  if (!project) {
    throw createError('项目不存在', 404);
  }

  res.json({
    success: true,
    data: project
  });
}));

// 更新项目
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, initiativeId } = req.body;

  const existingProject = await prisma.project.findUnique({
    where: { id }
  });

  if (!existingProject) {
    throw createError('项目不存在', 404);
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name: name || existingProject.name,
      description: description !== undefined ? description : existingProject.description,
      initiativeId: initiativeId || existingProject.initiativeId
    },
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
    }
  });

  res.json({
    success: true,
    data: project
  });
}));

// 删除项目
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingProject = await prisma.project.findUnique({
    where: { id }
  });

  if (!existingProject) {
    throw createError('项目不存在', 404);
  }

  await prisma.project.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: '项目已删除'
  });
}));

export default router;