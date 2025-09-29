const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 开始创建测试任务数据...');

  try {
    // 先删除现有任务
    await prisma.task.deleteMany();
    console.log('🗑️  清空现有任务数据');

    // 创建测试任务
    const tasks = await Promise.all([
      prisma.task.create({
        data: {
          id: 'task-1',
          title: '制定培训计划',
          description: '制定详细的教师培训计划和时间安排',
          assignee: '张三',
          priority: 3.0,
          estimate: 8,
          due: new Date('2025-09-30'),
          status: 'DONE',
          projectId: 'project-1',
          kpiLinks: JSON.stringify(['体验课转化率']),
          riskFlags: JSON.stringify([])
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-2',
          title: '准备培训材料',
          description: '准备培训所需的教材和资料',
          assignee: '李四',
          priority: 2.0,
          estimate: 16,
          due: new Date('2025-10-05'),
          status: 'DOING',
          projectId: 'project-1',
          kpiLinks: JSON.stringify(['教材/套餐完成度']),
          riskFlags: JSON.stringify([]),
          dependencies: JSON.stringify(['task-1'])
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-3',
          title: '安排培训场地',
          description: '预订和布置培训场地',
          assignee: '王五',
          priority: 3.0,
          estimate: 4,
          due: new Date('2025-10-08'),
          status: 'TODO',
          projectId: 'project-1',
          kpiLinks: JSON.stringify(['ROI']),
          riskFlags: JSON.stringify([]),
          dependencies: JSON.stringify(['task-1'])
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-4',
          title: '邀请培训讲师',
          description: '邀请资深教师作为培训讲师',
          assignee: '赵六',
          priority: 2.0,
          estimate: 6,
          due: new Date('2025-10-10'),
          status: 'TODO',
          projectId: 'project-1',
          kpiLinks: JSON.stringify(['续费率']),
          riskFlags: JSON.stringify([]),
          dependencies: JSON.stringify(['task-1'])
        }
      }),
      prisma.task.create({
        data: {
          id: 'task-5',
          title: '培训效果评估',
          description: '设计培训效果评估方案',
          assignee: '钱七',
          priority: 1.0,
          estimate: 8,
          due: new Date('2025-10-15'),
          status: 'BLOCKED',
          projectId: 'project-1',
          kpiLinks: JSON.stringify(['转介绍率']),
          riskFlags: JSON.stringify([]),
          dependencies: JSON.stringify(['task-2', 'task-3', 'task-4'])
        }
      })
    ]);

    console.log('✅ 创建任务:', tasks.length, '个');

    // 显示任务状态分布
    const statusCount = {
      DONE: tasks.filter(t => t.status === 'DONE').length,
      DOING: tasks.filter(t => t.status === 'DOING').length,
      TODO: tasks.filter(t => t.status === 'TODO').length,
      BLOCKED: tasks.filter(t => t.status === 'BLOCKED').length
    };

    console.log('📊 任务状态分布:', statusCount);
    console.log('🎉 测试任务数据创建完成！');
    console.log('📝 现在可以刷新仪表盘查看饼图了！');

  } catch (error) {
    console.error('❌ 创建测试数据失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();