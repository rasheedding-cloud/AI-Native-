import { chromium } from 'playwright';

(async () => {
  console.log('🔍 直接测试API调用...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5184');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 在控制台中直接测试API调用
    const apiTestResult = await page.evaluate(async () => {
      try {
        // 模拟axios调用
        const response = await fetch('/api/tasks');
        const data = await response.json();
        return {
          success: true,
          status: response.status,
          data: data
        };
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    });

    console.log('📡 直接API调用结果:', apiTestResult);

    // 等待一下再检查数据
    await page.waitForTimeout(2000);

    // 检查控制台错误
    const consoleErrors = await page.evaluate(() => {
      const errors = [];
      const originalError = console.error;
      console.error = (...args) => {
        errors.push(args.join(' '));
        originalError.apply(console, args);
      };
      return errors;
    });

    console.log('📝 控制台错误:', consoleErrors);

    // 检查window对象
    const windowInfo = await page.evaluate(() => {
      return {
        hasTasks: typeof window.tasks !== 'undefined',
        tasksLength: window.tasks ? window.tasks.length : 0,
        hasStore: typeof window.useStore !== 'undefined',
        storeState: window.useStore ? window.useStore.getState() : null
      };
    });

    console.log('🪟 Window对象信息:', windowInfo);

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 直接API调用测试完成！');
})();