import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取所有任务
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
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
router.post('/', asyncHandler(async (req: Request, res: Response) => {
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
      priority: typeof priority === 'string' ? parseFloat(priority) || 0.0 : (priority || 0.0),
      estimate: typeof estimate === 'string' ? parseInt(estimate) || null : estimate,
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

// 获取单个任务
router.get('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const task = await prisma.task.findUnique({
    where: { id },
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

  if (!task) {
    throw createError('任务不存在', 404);
  }

  res.json({
    success: true,
    data: task
  });
}));

// 更新任务
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    title,
    description,
    projectId,
    assignee,
    priority,
    estimate,
    due,
    status,
    dependencies,
    kpiLinks,
    riskFlags,
    aiReasoning
  } = req.body;

  const existingTask = await prisma.task.findUnique({
    where: { id }
  });

  if (!existingTask) {
    throw createError('任务不存在', 404);
  }

  const task = await prisma.task.update({
    where: { id },
    data: {
      title: title || existingTask.title,
      description: description !== undefined ? description : existingTask.description,
      projectId: projectId || existingTask.projectId,
      assignee: assignee !== undefined ? assignee : existingTask.assignee,
      priority: priority !== undefined ? priority : existingTask.priority,
      estimate: estimate !== undefined ? (typeof estimate === 'string' ? parseInt(estimate) || null : estimate) : existingTask.estimate,
      due: due ? new Date(due) : existingTask.due,
      status: status !== undefined ? status : existingTask.status,
      dependencies: dependencies !== undefined ? JSON.stringify(dependencies) : existingTask.dependencies,
      kpiLinks: kpiLinks !== undefined ? JSON.stringify(kpiLinks) : existingTask.kpiLinks,
      riskFlags: riskFlags !== undefined ? JSON.stringify(riskFlags) : existingTask.riskFlags,
      aiReasoning: aiReasoning !== undefined ? aiReasoning : existingTask.aiReasoning
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

  res.json({
    success: true,
    data: task
  });
}));

// 删除任务
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingTask = await prisma.task.findUnique({
    where: { id }
  });

  if (!existingTask) {
    throw createError('任务不存在', 404);
  }

  await prisma.task.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: '任务已删除'
  });
}));

// 创建子任务
router.post('/:taskId/subtasks', asyncHandler(async (req: Request, res: Response) => {
  const { taskId } = req.params;
  const { title, description } = req.body;

  if (!title) {
    throw createError('子任务标题不能为空', 400);
  }

  const subtask = await prisma.subtask.create({
    data: {
      title,
      description,
      taskId,
      completed: false
    },
    include: {
      task: true
    }
  });

  res.status(201).json({
    success: true,
    data: subtask
  });
}));

// 更新子任务状态
router.put('/subtasks/:subtaskId', asyncHandler(async (req: Request, res: Response) => {
  const { subtaskId } = req.params;
  const { completed } = req.body;

  const subtask = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      completed: completed !== undefined ? completed : false
    },
    include: {
      task: true
    }
  });

  res.json({
    success: true,
    data: subtask
  });
}));

// 删除子任务
router.delete('/subtasks/:subtaskId', asyncHandler(async (req: Request, res: Response) => {
  const { subtaskId } = req.params;

  await prisma.subtask.delete({
    where: { id: subtaskId }
  });

  res.json({
    success: true,
    message: '子任务已删除'
  });
}));

export default router;