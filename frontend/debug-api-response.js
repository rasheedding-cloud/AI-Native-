import { chromium } from 'playwright';

(async () => {
  console.log('🔍 调试API响应和数据流...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听网络请求
    const apiResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const url = response.url();
        const status = response.status();
        const ok = response.ok();

        try {
          const data = await response.json();
          apiResponses.push({
            url,
            status,
            ok,
            data
          });
          console.log(`📡 API响应: ${url.split('/api/')[1]} - 状态: ${status}, 数据长度: ${data.data?.length || 0}`);
        } catch (e) {
          apiResponses.push({
            url,
            status,
            ok,
            error: e.message
          });
        }
      }
    });

    // 导航到仪表盘
    await page.goto('http://localhost:5184');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 等待数据加载完成
    await page.waitForTimeout(5000);

    // 检查全局变量中的数据
    const globalData = await page.evaluate(() => {
      return {
        tasks: window.tasks || [],
        strategies: window.strategies || [],
        initiatives: window.initiatives || [],
        projects: window.projects || [],
        kpis: window.kpis || [],
        taskStatusData: window.taskStatusData || []
      };
    });

    console.log('📊 全局变量数据:');
    console.log('  - 任务:', globalData.tasks.length, '个');
    console.log('  - 策略:', globalData.strategies.length, '个');
    console.log('  - 项目:', globalData.projects.length, '个');
    console.log('  - KPIs:', globalData.kpis.length, '个');

    // 检查store中的数据
    const storeData = await page.evaluate(() => {
      // 尝试访问store
      try {
        const store = window.useStore?.getState?.();
        return {
          tasks: store?.tasks || [],
          strategies: store?.strategies || [],
          initiatives: store?.initiatives || [],
          projects: store?.projects || [],
          kpis: store?.kpis || []
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log('📊 Store数据:');
    console.log('  - 任务:', Array.isArray(storeData.tasks) ? storeData.tasks.length : 'N/A', '个');
    console.log('  - 策略:', Array.isArray(storeData.strategies) ? storeData.strategies.length : 'N/A', '个');

    // 检查API响应
    console.log('📡 API响应汇总:');
    apiResponses.forEach(resp => {
      const endpoint = resp.url.split('/api/')[1].split('?')[0];
      console.log(`  - ${endpoint}: ${resp.status} - 数据: ${resp.data?.data?.length || 0}项`);
    });

    // 如果有任务数据，截图
    if (globalData.tasks.length > 0) {
      await page.screenshot({
        path: 'dashboard-data-debug.png',
        fullPage: true
      });
      console.log('📸 数据调试截图已保存');
    }

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 API响应调试完成！');
})();