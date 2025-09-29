const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始数据库种子数据创建...');

  try {
    // 创建或更新战略
    const strategy = await prisma.strategy.upsert({
      where: { id: 'strategy-1' },
      update: {},
      create: {
        id: 'strategy-1',
        name: '提升教学质量战略',
        description: '通过系统化的方法提升整体教学质量'
      }
    });
    console.log('✅ 创建战略:', strategy.name);

    // 创建或更新战役
    const initiative = await prisma.initiative.upsert({
      where: { id: 'initiative-1' },
      update: {},
      create: {
        id: 'initiative-1',
        name: '教师培训战役',
        description: '提升教师教学能力和专业素养',
        strategyId: strategy.id
      }
    });
    console.log('✅ 创建战役:', initiative.name);

    // 创建或更新项目
    const project = await prisma.project.upsert({
      where: { id: 'project-1' },
      update: {},
      create: {
        id: 'project-1',
        name: '新教师培训项目',
        description: '为新入职教师提供系统化培训',
        initiativeId: initiative.id,
        status: 'IN_PROGRESS'
      }
    });
    console.log('✅ 创建项目:', project.name);

    // 创建或更新KPI
    const kpis = await Promise.all([
      prisma.kpi.upsert({
        where: { id: 'kpi-1' },
        update: {},
        create: {
          id: 'kpi-1',
          name: '体验课转化率',
          target: 25.0,
          current: 18.5,
          strategyId: strategy.id
        }
      }),
      prisma.kpi.upsert({
        where: { id: 'kpi-2' },
        update: {},
        create: {
          id: 'kpi-2',
          name: '教材/套餐完成度',
          target: 80.0,
          current: 72.3,
          strategyId: strategy.id
        }
      }),
      prisma.kpi.upsert({
        where: { id: 'kpi-3' },
        update: {},
        create: {
          id: 'kpi-3',
          name: 'ROI',
          target: 150.0,
          current: 125.0,
          strategyId: strategy.id
        }
      }),
      prisma.kpi.upsert({
        where: { id: 'kpi-4' },
        update: {},
        create: {
          id: 'kpi-4',
          name: '续费率',
          target: 70.0,
          current: 65.2,
          strategyId: strategy.id
        }
      }),
      prisma.kpi.upsert({
        where: { id: 'kpi-5' },
        update: {},
        create: {
          id: 'kpi-5',
          name: '转介绍率',
          target: 30.0,
          current: 22.8,
          strategyId: strategy.id
        }
      })
    ]);
    console.log('✅ 创建KPI:', kpis.length, '个');

    // 创建或更新任务
    const tasks = await Promise.all([
      prisma.task.upsert({
        where: { id: 'task-1' },
        update: {},
        create: {
          id: 'task-1',
          title: '制定培训计划',
          description: '制定详细的教师培训计划和时间安排',
          assignee: '张三',
          priority: 'HIGH',
          estimate: 8,
          due: new Date('2025-09-30'),
          status: 'COMPLETED',
          projectId: project.id,
          kpiLinks: ['体验课转化率'],
          riskFlags: []
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-2',
          title: '准备培训材料',
          description: '准备培训所需的教材和资料',
          assignee: '李四',
          priority: 'MEDIUM',
          estimate: 16,
          due: new Date('2025-10-05'),
          status: 'IN_PROGRESS',
          projectId: project.id,
          kpiLinks: ['教材/套餐完成度'],
          riskFlags: [],
          dependencies: ['task-1']
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-3',
          title: '安排培训场地',
          description: '预订和布置培训场地',
          assignee: '王五',
          priority: 'HIGH',
          estimate: 4,
          due: new Date('2025-10-08'),
          status: 'TODO',
          projectId: project.id,
          kpiLinks: ['ROI'],
          riskFlags: [],
          dependencies: ['task-1']
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-4',
          title: '邀请培训讲师',
          description: '邀请资深教师作为培训讲师',
          assignee: '赵六',
          priority: 'MEDIUM',
          estimate: 6,
          due: new Date('2025-10-10'),
          status: 'TODO',
          projectId: project.id,
          kpiLinks: ['续费率'],
          riskFlags: [],
          dependencies: ['task-1']
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-5',
          title: '培训效果评估',
          description: '设计培训效果评估方案',
          assignee: '钱七',
          priority: 'LOW',
          estimate: 8,
          due: new Date('2025-10-15'),
          status: 'PAUSED',
          projectId: project.id,
          kpiLinks: ['转介绍率'],
          riskFlags: [],
          dependencies: ['task-2', 'task-3', 'task-4']
        }
      })
    ]);
    console.log('✅ 创建任务:', tasks.length, '个');

    // 显示任务状态分布
    const statusCount = {
      COMPLETED: tasks.filter(t => t.status === 'COMPLETED').length,
      IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      TODO: tasks.filter(t => t.status === 'TODO').length,
      PAUSED: tasks.filter(t => t.status === 'PAUSED').length
    };

    console.log('📊 任务状态分布:', statusCount);

    console.log('🎉 数据库种子数据创建完成！');
    console.log('📝 现在可以刷新仪表盘查看饼图了！');

  } catch (error) {
    console.error('❌ 创建种子数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();