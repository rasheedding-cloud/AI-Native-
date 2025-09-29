import { chromium } from 'playwright';

(async () => {
  console.log('🔍 开始验证KPI完成情况修复效果...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5181');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 等待KPI卡片加载
    await page.waitForSelector('.kpi-card', { timeout: 5000 });
    console.log('✅ KPI卡片加载成功');

    // 获取KPI卡片信息
    const kpiCard = await page.$('.kpi-card');
    const cardInfo = await kpiCard.boundingBox();
    console.log('📊 KPI卡片尺寸:', cardInfo);

    // 检查KPI列表项
    const kpiItems = await page.$$('.kpi-card .ant-list-item');
    console.log(`📋 发现 ${kpiItems.length} 个KPI项目`);

    // 验证每个KPI项目的布局
    for (let i = 0; i < Math.min(kpiItems.length, 3); i++) {
      const item = kpiItems[i];
      const itemBox = await item.boundingBox();

      // 检查是否有合理的尺寸
      if (itemBox.width > 200 && itemBox.height > 60 && itemBox.height < 150) {
        console.log(`✅ KPI项目${i+1}布局正常: ${itemBox.width}x${itemBox.height}`);
      } else {
        console.log(`⚠️ KPI项目${i+1}可能存在布局问题: ${itemBox.width}x${itemBox.height}`);
      }

      // 检查进度条
      const progressBar = await item.$('.ant-progress');
      if (progressBar) {
        const progressBox = await progressBar.boundingBox();
        console.log(`📈 KPI项目${i+1}进度条: ${progressBox.width}x${progressBox.height}`);
      }
    }

    // 截图保存结果
    await page.screenshot({
      path: 'kpi-fix-verification.png',
      fullPage: false,
      clip: cardInfo
    });

    console.log('📸 截图已保存: kpi-fix-verification.png');

    // 测试响应式布局
    const viewports = [
      { width: 1920, height: 1080, name: '大屏幕' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手机' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000);

      const stillVisible = await page.$('.kpi-card').then(el => el.isVisible());
      console.log(`📱 ${viewport.name}: ${stillVisible ? '✅ 显示正常' : '❌ 显示异常'}`);

      if (stillVisible) {
        await page.screenshot({
          path: `kpi-${viewport.name.toLowerCase()}.png`,
          fullPage: false
        });
      }
    }

    console.log('🎉 KPI完成情况修复验证完成！');

  } catch (error) {
    console.error('❌ 验证过程中出现错误:', error);
  } finally {
    await browser.close();
  }
})();