import { chromium } from 'playwright';

(async () => {
  console.log('🔍 强制刷新数据并检查饼图...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5177');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 监听网络请求
    const apiResponses = [];
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        apiResponses.push({
          url: response.url(),
          status: response.status(),
          ok: response.ok()
        });
      }
    });

    // 强制刷新页面
    await page.reload();
    await page.waitForTimeout(3000);

    console.log('🔄 页面已刷新');

    // 检查API响应
    console.log('📡 API响应统计:');
    const responseCounts = {};
    apiResponses.forEach(resp => {
      const endpoint = resp.url.split('/api/')[1].split('?')[0];
      responseCounts[endpoint] = (responseCounts[endpoint] || 0) + 1;
    });
    console.log(responseCounts);

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

    console.log('📊 刷新后任务数据:', tasksData);

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

    // 如果还是没有数据，尝试直接调用API
    if (tasksData.count === 0) {
      console.log('⚠️ 仍然没有任务数据，尝试直接调用API...');

      try {
        const apiResponse = await page.request.get('http://localhost:3001/api/tasks');
        const apiData = await apiResponse.json();
        console.log('📡 直接API调用结果:', {
          status: apiResponse.status(),
          dataLength: Array.isArray(apiData) ? apiData.length :
                       Array.isArray(apiData.data) ? apiData.data.length : 'not array'
        });
      } catch (error) {
        console.error('❌ API调用失败:', error.message);
      }
    }

    // 最终截图
    await page.screenshot({
      path: 'dashboard-final-check.png',
      fullPage: true
    });

    console.log('📸 最终状态截图已保存');

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 数据刷新检查完成！');
})();