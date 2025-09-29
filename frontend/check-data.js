import { chromium } from 'playwright';

(async () => {
  console.log('🔍 检查饼图数据...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5177');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    // 获取任务数据
    const tasksData = await page.evaluate(() => {
      // 从全局变量获取任务数据
      const tasks = window.tasks || [];
      return {
        tasks,
        count: tasks.length,
        statuses: [...new Set(tasks.map(t => t.status))]
      };
    });

    console.log('任务数据:', tasksData);

    // 计算状态分布
    const statusCount = {
      TODO: 0,
      DOING: 0,
      DONE: 0,
      BLOCKED: 0
    };

    tasksData.tasks.forEach(task => {
      if (statusCount.hasOwnProperty(task.status)) {
        statusCount[task.status]++;
      }
    });

    console.log('状态分布:', statusCount);

    // 检查任务状态分布数据
    const pieData = await page.evaluate(() => {
      const taskStatusData = window.taskStatusData || [];
      return taskStatusData;
    });

    console.log('饼图数据:', pieData);

    // 检查饼图是否有有效数据
    const hasValidData = pieData.some(item => item.value > 0);
    console.log('饼图是否有有效数据:', hasValidData);

    if (!hasValidData) {
      console.log('⚠️ 饼图没有有效数据，这就是为什么饼图不显示的原因');
    }

  } catch (error) {
    console.error('检查过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 数据检查完成！');
})();