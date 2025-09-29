import { chromium } from 'playwright';

(async () => {
  console.log('🔍 快速测试数据加载...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 错误: ${msg.text()}`);
      } else if (msg.text().includes('🔄') || msg.text().includes('📊')) {
        console.log(`📝 ${msg.text()}`);
      }
    });

    // 监听API响应
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        try {
          const data = await response.json();
          console.log(`📡 API: ${response.url().split('/api/')[1]} - ${data.data?.length || 0}项`);
        } catch (e) {
          console.log(`📡 API: ${response.url().split('/api/')[1]} - 错误`);
        }
      }
    });

    console.log('🌐 导航到页面...');
    await page.goto('http://localhost:5180');

    // 等待页面加载
    await page.waitForTimeout(5000);

    // 检查页面标题
    const title = await page.title();
    console.log(`📄 页面标题: ${title}`);

    // 检查是否有React应用
    const hasReact = await page.evaluate(() => {
      return typeof React !== 'undefined';
    });
    console.log(`⚛️ React可用: ${hasReact}`);

    // 检查任务数据
    const taskCheck = await page.evaluate(() => {
      // 尝试多种方式访问数据
      try {
        // 检查window上的任务数据
        if (window.tasks) {
          return { source: 'window.tasks', count: window.tasks.length };
        }

        // 尝试访问store
        if (window.useStore) {
          const store = window.useStore.getState();
          return { source: 'store', count: store.tasks?.length || 0 };
        }

        // 检查DOM中的统计信息
        const taskElements = document.querySelectorAll('[data-task], .task, .ant-list-item');
        return { source: 'DOM', count: taskElements.length };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log('📊 任务检查结果:', taskCheck);

    // 截图
    await page.screenshot({
      path: 'quick-test-result.png',
      fullPage: true
    });
    console.log('📸 截图已保存');

  } catch (error) {
    console.error('❌ 测试错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 快速测试完成！');
})();