import { chromium } from 'playwright';

(async () => {
  console.log('🔍 检查任务状态值...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5180');
    await page.waitForTimeout(3000);

    // 获取任务数据和状态
    const taskInfo = await page.evaluate(() => {
      const tasks = window.tasks || [];
      return {
        tasks: tasks,
        count: tasks.length,
        allStatuses: [...new Set(tasks.map(t => t.status))],
        statusCounts: tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {})
      };
    });

    console.log('📊 任务信息:', taskInfo);

    // 检查当前taskStatusData
    const currentData = await page.evaluate(() => {
      const tasks = window.tasks || [];
      return [
        { name: '未开始', value: tasks.filter(t => t.status === 'TODO').length, color: '#ff7875' },
        { name: '进行中', value: tasks.filter(t => t.status === 'DOING' || t.status === '进行中' || t.status === 'IN_PROGRESS').length, color: '#1890ff' },
        { name: '已完成', value: tasks.filter(t => t.status === 'DONE' || t.status === '已完成' || t.status === 'COMPLETED').length, color: '#52c41a' },
        { name: '已暂停', value: tasks.filter(t => t.status === 'BLOCKED' || t.status === '已暂停' || t.status === 'PAUSED' || t.status === 'CANCELLED').length, color: '#faad14' },
      ];
    });

    console.log('🥧 当前饼图数据:', currentData);

    // 截图
    await page.screenshot({
      path: 'task-status-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 检查错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 任务状态检查完成！');
})();