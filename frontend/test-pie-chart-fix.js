import { chromium } from 'playwright';

(async () => {
  console.log('🔍 测试饼图数据加载修复...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5180');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 等待数据加载
    await page.waitForTimeout(3000);

    // 检查任务数据
    const tasksData = await page.evaluate(() => {
      const tasks = window.tasks || [];
      return {
        tasks,
        count: tasks.length,
        statuses: [...new Set(tasks.map(t => t.status))],
        taskStatusData: window.taskStatusData || []
      };
    });

    console.log('📊 任务数据:', tasksData);

    // 检查饼图元素
    const pieChartInfo = await page.evaluate(() => {
      const pieElements = document.querySelectorAll('.recharts-pie, .recharts-slice');
      const svgElements = document.querySelectorAll('svg');

      return {
        pieElements: pieElements.length,
        svgElements: svgElements.length,
        visiblePieElements: Array.from(pieElements).filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length
      };
    });

    console.log('📈 饼图元素信息:', pieChartInfo);

    // 计算状态分布
    const statusCount = {
      TODO: tasksData.tasks.filter(t => t.status === 'TODO' || t.status === '未开始').length,
      DOING: tasksData.tasks.filter(t => t.status === 'DOING' || t.status === '进行中' || t.status === 'IN_PROGRESS').length,
      DONE: tasksData.tasks.filter(t => t.status === 'DONE' || t.status === '已完成' || t.status === 'COMPLETED').length,
      BLOCKED: tasksData.tasks.filter(t => t.status === 'BLOCKED' || t.status === '已暂停' || t.status === 'PAUSED' || t.status === 'CANCELLED').length
    };

    console.log('📊 任务状态分布:', statusCount);

    // 如果有数据，截图保存
    if (tasksData.count > 0) {
      await page.screenshot({
        path: 'dashboard-pie-chart-fixed.png',
        fullPage: true
      });
      console.log('📸 饼图修复截图已保存');
    }

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 饼图数据加载修复测试完成！');
})();