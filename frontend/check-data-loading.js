import { chromium } from 'playwright';

(async () => {
  console.log('🔍 检查数据加载情况...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听控制台消息
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔄') || text.includes('📊') || text.includes('策略数据') || text.includes('任务数据')) {
        console.log(`📝 ${text}`);
      }
    });

    await page.goto('http://localhost:5180');
    await page.waitForTimeout(5000);

    // 检查多种数据来源
    const dataCheck = await page.evaluate(() => {
      // 检查window上的数据
      const windowData = {
        tasks: window.tasks || [],
        strategies: window.strategies || [],
        projects: window.projects || [],
        initiatives: window.initiatives || [],
        kpis: window.kpis || []
      };

      // 检查store数据
      let storeData = {};
      try {
        if (window.useStore) {
          const store = window.useStore.getState();
          storeData = {
            tasks: store.tasks || [],
            strategies: store.strategies || [],
            projects: store.projects || [],
            initiatives: store.initiatives || [],
            kpis: store.kpis || []
          };
        }
      } catch (e) {
        storeData = { error: e.message };
      }

      // 检查API响应数据
      let apiData = {};
      try {
        const apiResponses = window.apiResponses || {};
        apiData = apiResponses;
      } catch (e) {
        apiData = { error: e.message };
      }

      return { windowData, storeData, apiData };
    });

    console.log('📊 数据检查结果:', JSON.stringify(dataCheck, null, 2));

    // 截图
    await page.screenshot({
      path: 'data-loading-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 检查错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 数据加载检查完成！');
})();