import { chromium } from 'playwright';

(async () => {
  console.log('🔍 测试Store数据更新...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听网络请求
    const apiResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/api/')) {
        const url = response.url();
        const status = response.status();

        try {
          const data = await response.json();
          apiResponses.push({
            url,
            status,
            data
          });
          console.log(`📡 API响应: ${url.split('/api/')[1]} - 状态: ${status}, 数据: ${data.data?.length || 0}项`);
        } catch (e) {
          console.log(`📡 API响应: ${url.split('/api/')[1]} - 状态: ${status}, 错误: ${e.message}`);
        }
      }
    });

    // 导航到仪表盘
    await page.goto('http://localhost:5184');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 监听控制台日志
    const consoleLogs = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(text);
      if (text.includes('🔄') || text.includes('📊')) {
        console.log(`📝 ${text}`);
      }
    });

    // 等待足够时间让数据加载
    await page.waitForTimeout(5000);

    // 检查store状态
    const storeState = await page.evaluate(() => {
      try {
        // 尝试多种方式访问store
        if (window.useStore) {
          const store = window.useStore.getState();
          return {
            strategies: store.strategies || [],
            initiatives: store.initiatives || [],
            projects: store.projects || [],
            tasks: store.tasks || [],
            kpis: store.kpis || [],
            loading: store.loading || false,
            error: store.error || null,
            strategiesCount: store.strategies?.length || 0,
            tasksCount: store.tasks?.length || 0
          };
        }
        return { error: 'useStore not found' };
      } catch (e) {
        return { error: e.message };
      }
    });

    console.log('📊 Store状态:', storeState);

    // 检查DOM中的统计信息
    const domStats = await page.evaluate(() => {
      const statistics = document.querySelectorAll('.ant-statistic-title, .ant-statistic-content-value');
      const statData = {};
      statistics.forEach(stat => {
        const title = stat.querySelector('.ant-statistic-title')?.textContent || 'Unknown';
        const value = stat.querySelector('.ant-statistic-content-value')?.textContent || '0';
        statData[title] = value;
      });
      return statData;
    });

    console.log('📈 DOM统计数据:', domStats);

    // 检查饼图数据
    const pieData = await page.evaluate(() => {
      const pieSlices = document.querySelectorAll('.recharts-slice');
      return {
        sliceCount: pieSlices.length,
        visibleSlices: Array.from(pieSlices).filter(slice => {
          const rect = slice.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }).length
      };
    });

    console.log('🥧 饼图数据:', pieData);

    // 如果有数据，截图
    if (storeState.tasksCount > 0 || pieData.sliceCount > 0) {
      await page.screenshot({
        path: 'dashboard-store-data-test.png',
        fullPage: true
      });
      console.log('📸 Store数据测试截图已保存');
    }

    console.log('📝 控制台日志摘要:');
    consoleLogs.slice(0, 10).forEach(log => {
      if (log.includes('🔄') || log.includes('📊') || log.includes('API') || log.includes('Error')) {
        console.log(`  ${log}`);
      }
    });

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 Store数据测试完成！');
})();