import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// 获取日历时间块
router.get('/', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate, taskId, userId } = req.query;

  const where: any = {};

  if (startDate && endDate) {
    where.startTime = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  if (taskId) {
    where.taskId = taskId as string;
  }

  if (userId) {
    where.userId = userId as string;
  }

  const calendarBlocks = await prisma.calendarBlock.findMany({
    where,
    include: {
      task: {
        include: {
          project: {
            include: {
              initiative: {
                include: {
                  strategy: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: { startTime: 'asc' }
  });

  res.json({
    success: true,
    data: calendarBlocks
  });
}));

// 创建日历时间块
router.post('/', asyncHandler(async (req: Request, res: Response) => {
  const {
    taskId,
    userId,
    title,
    description,
    startTime,
    endTime,
    priority,
    isRecurring,
    recurringRule,
    aiReasoning
  } = req.body;

  if (!taskId || !title || !startTime || !endTime) {
    throw createError('任务ID、标题、开始时间和结束时间不能为空', 400);
  }

  // 验证任务是否存在
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    throw createError('任务不存在', 404);
  }

  // 检测时间冲突
  const conflicts = await detectTimeConflicts(taskId, startTime, endTime);

  const calendarBlock = await prisma.calendarBlock.create({
    data: {
      taskId,
      userId,
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      priority: priority || 50,
      isRecurring: isRecurring || false,
      recurringRule: recurringRule ? JSON.stringify(recurringRule) : null,
      aiReasoning,
      conflictLevel: conflicts.length > 0 ? 'HIGH' : 'NONE',
      conflictInfo: conflicts.length > 0 ? JSON.stringify(conflicts) : null
    },
    include: {
      task: {
        include: {
          project: {
            include: {
              initiative: {
                include: {
                  strategy: true
                }
              }
            }
          }
        }
      }
    }
  });

  res.status(201).json({
    success: true,
    data: calendarBlock
  });
}));

// 更新日历时间块
router.put('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    taskId,
    userId,
    title,
    description,
    startTime,
    endTime,
    status,
    priority,
    progress,
    isRecurring,
    recurringRule,
    aiReasoning
  } = req.body;

  const existingBlock = await prisma.calendarBlock.findUnique({
    where: { id }
  });

  if (!existingBlock) {
    throw createError('日历时间块不存在', 404);
  }

  // 如果更改了时间，检测冲突
  let conflicts: any[] = [];
  let conflictLevel = existingBlock.conflictLevel;
  let conflictInfo = existingBlock.conflictInfo;

  if (startTime && endTime &&
      (new Date(startTime).getTime() !== new Date(existingBlock.startTime).getTime() ||
       new Date(endTime).getTime() !== new Date(existingBlock.endTime).getTime())) {
    conflicts = await detectTimeConflicts(taskId || existingBlock.taskId, startTime, endTime, id);
    conflictLevel = conflicts.length > 0 ? 'HIGH' : 'NONE';
    conflictInfo = conflicts.length > 0 ? JSON.stringify(conflicts) : null;
  }

  const calendarBlock = await prisma.calendarBlock.update({
    where: { id },
    data: {
      taskId: taskId || existingBlock.taskId,
      userId: userId !== undefined ? userId : existingBlock.userId,
      title: title || existingBlock.title,
      description: description !== undefined ? description : existingBlock.description,
      startTime: startTime ? new Date(startTime) : existingBlock.startTime,
      endTime: endTime ? new Date(endTime) : existingBlock.endTime,
      status: status !== undefined ? status : existingBlock.status,
      priority: priority !== undefined ? priority : existingBlock.priority,
      progress: progress !== undefined ? progress : existingBlock.progress,
      isRecurring: isRecurring !== undefined ? isRecurring : existingBlock.isRecurring,
      recurringRule: recurringRule !== undefined ? (recurringRule ? JSON.stringify(recurringRule) : null) : existingBlock.recurringRule,
      aiReasoning: aiReasoning !== undefined ? aiReasoning : existingBlock.aiReasoning,
      conflictLevel,
      conflictInfo
    },
    include: {
      task: {
        include: {
          project: {
            include: {
              initiative: {
                include: {
                  strategy: true
                }
              }
            }
          }
        }
      }
    }
  });

  res.json({
    success: true,
    data: calendarBlock
  });
}));

// 删除日历时间块
router.delete('/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const existingBlock = await prisma.calendarBlock.findUnique({
    where: { id }
  });

  if (!existingBlock) {
    throw createError('日历时间块不存在', 404);
  }

  await prisma.calendarBlock.delete({
    where: { id }
  });

  res.json({
    success: true,
    message: '日历时间块已删除'
  });
}));

// 获取日历统计信息
router.get('/stats/overview', asyncHandler(async (req: Request, res: Response) => {
  const { startDate, endDate } = req.query;

  const where: any = {};

  if (startDate && endDate) {
    where.startTime = {
      gte: new Date(startDate as string),
      lte: new Date(endDate as string)
    };
  }

  const [totalBlocks, completedBlocks, inProgressBlocks, plannedBlocks] = await Promise.all([
    prisma.calendarBlock.count({ where }),
    prisma.calendarBlock.count({
      where: { ...where, status: 'COMPLETED' }
    }),
    prisma.calendarBlock.count({
      where: { ...where, status: 'IN_PROGRESS' }
    }),
    prisma.calendarBlock.count({
      where: { ...where, status: 'PLANNED' }
    })
  ]);

  const stats = {
    totalBlocks,
    completedBlocks,
    inProgressBlocks,
    plannedBlocks,
    completionRate: totalBlocks > 0 ? Math.round((completedBlocks / totalBlocks) * 100) : 0,
    totalHours: totalBlocks // 简化计算，每个块默认2小时
  };

  res.json({
    success: true,
    data: stats
  });
}));

// AI智能规划本周任务
router.post('/ai-plan-week', asyncHandler(async (req: Request, res: Response) => {
  const { userId, tasks, workingHours, preferences } = req.body;

  if (!userId || !tasks || !Array.isArray(tasks)) {
    throw createError('用户ID和任务列表不能为空', 400);
  }

  // 模拟AI规划逻辑
  const plannedBlocks = await aiPlanWeekTasks(userId, tasks, workingHours, preferences);

  // 批量创建日历块
  const createdBlocks = await Promise.all(
    plannedBlocks.map(block =>
      prisma.calendarBlock.create({
        data: {
          taskId: block.taskId,
          userId,
          title: block.title,
          description: block.description,
          startTime: block.startTime,
          endTime: block.endTime,
          priority: block.priority,
          aiReasoning: block.aiReasoning,
          conflictLevel: 'NONE'
        },
        include: {
          task: {
            include: {
              project: {
                include: {
                  initiative: {
                    include: {
                      strategy: true
                    }
                  }
                }
              }
            }
          }
        }
      })
    )
  );

  res.status(201).json({
    success: true,
    data: createdBlocks,
    message: 'AI智能规划完成'
  });
}));

// 检测时间冲突的辅助函数
async function detectTimeConflicts(taskId: string, startTime: string, endTime: string, excludeId?: string) {
  const conflicts = await prisma.calendarBlock.findMany({
    where: {
      AND: [
        {
          OR: [
            { taskId: taskId },
            {
              task: {
                assignee: {
                  equals: (
                    await prisma.task.findUnique({
                      where: { id: taskId },
                      select: { assignee: true }
                    })
                  )?.assignee
                }
              }
            }
          ]
        },
        {
          NOT: excludeId ? { id: excludeId } : undefined
        },
        {
          OR: [
            {
              AND: [
                { startTime: { lte: new Date(startTime) } },
                { endTime: { gte: new Date(startTime) } }
              ]
            },
            {
              AND: [
                { startTime: { lte: new Date(endTime) } },
                { endTime: { gte: new Date(endTime) } }
              ]
            },
            {
              AND: [
                { startTime: { gte: new Date(startTime) } },
                { endTime: { lte: new Date(endTime) } }
              ]
            }
          ]
        }
      ]
    }
  });

  return conflicts;
}

// AI智能规划任务的辅助函数
async function aiPlanWeekTasks(userId: string, tasks: any[], workingHours: any = {}, preferences: any = {}) {
  // 这里实现AI规划逻辑
  // 考虑优先级、截止日期、预估时间、工作习惯等因素
  const plannedBlocks: any[] = [];

  // 模拟规划逻辑
  for (const task of tasks) {
    if (task.estimate && task.priority > 50) {
      const block = {
        taskId: task.id,
        title: task.title,
        description: task.description,
        startTime: new Date(), // 这里应该根据AI算法计算
        endTime: new Date(),   // 这里应该根据AI算法计算
        priority: task.priority,
        aiReasoning: `基于优先级${task.priority}和预估时间${task.estimate}小时智能调度`
      };
      plannedBlocks.push(block);
    }
  }

  return plannedBlocks;
}

export default router;