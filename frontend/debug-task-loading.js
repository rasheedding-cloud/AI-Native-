import { chromium } from 'playwright';

(async () => {
  console.log('🔍 调试任务数据加载...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听所有控制台消息
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔄') || text.includes('📊') || text.includes('策略数据') || text.includes('任务数据') || text.includes('加载')) {
        console.log(`📝 ${text}`);
      }
    });

    // 监听网络请求
    page.on('request', request => {
      if (request.url().includes('/api/tasks')) {
        console.log(`🌐 请求任务数据: ${request.url()}`);
      }
    });

    page.on('response', async response => {
      if (response.url().includes('/api/tasks')) {
        try {
          const data = await response.json();
          console.log(`📡 任务API响应: ${JSON.stringify(data, null, 2)}`);
        } catch (e) {
          console.log(`📡 任务API响应解析错误: ${e.message}`);
        }
      }
    });

    console.log('🌐 导航到页面...');
    await page.goto('http://localhost:5180');

    // 等待更长时间确保数据加载完成
    console.log('⏳ 等待数据加载...');
    await page.waitForTimeout(10000);

    // 多次检查任务数据
    for (let i = 1; i <= 5; i++) {
      console.log(`\n📊 第${i}次检查任务数据:`);

      const taskData = await page.evaluate(() => {
        // 尝试多种方式获取任务数据
        const results = {};

        // 检查window对象
        results.windowTasks = window.tasks || [];

        // 尝试从store获取
        try {
          if (window.useStore) {
            const store = window.useStore.getState();
            results.storeTasks = store.tasks || [];
          }
        } catch (e) {
          results.storeError = e.message;
        }

        // 检查DOM中的任务相关元素
        const taskElements = document.querySelectorAll('[data-task], .task, .ant-list-item');
        results.domElements = taskElements.length;

        return results;
      });

      console.log('  任务数据:', taskData);

      // 如果有数据，检查状态分布
      if (taskData.storeTasks && taskData.storeTasks.length > 0) {
        const statusCounts = taskData.storeTasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});
        console.log('  状态分布:', statusCounts);
      }

      // 等待2秒再检查下一次
      if (i < 5) {
        await page.waitForTimeout(2000);
      }
    }

    // 最终截图
    await page.screenshot({
      path: 'task-loading-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 调试错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 任务数据加载调试完成！');
})();