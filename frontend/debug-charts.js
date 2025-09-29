import { chromium } from 'playwright';

(async () => {
  console.log('🔍 开始检查仪表盘图表问题...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5177');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 等待一下，确保所有内容都加载完成
    await page.waitForTimeout(3000);

    // 检查图表相关的各种可能选择器
    const chartSelectors = [
      '.recharts-wrapper',
      '.recharts-surface',
      '.recharts-responsive-container',
      '.line-chart',
      '.pie-chart',
      '.bar-chart',
      '[data-testid="chart"]',
      '.chart-container',
      '.ant-card-body svg',
      'svg.recharts-svg'
    ];

    for (const selector of chartSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`📊 找到 ${elements.length} 个图表元素 (${selector})`);

        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const box = await element.boundingBox();

          console.log(`   图表${i+1}: ${isVisible ? '可见' : '不可见'}`);
          if (box) {
            console.log(`   位置: (${box.x}, ${box.y}), 尺寸: ${box.width}x${box.height}`);
          }
        }
      }
    }

    // 检查是否有错误信息
    const errors = await page.$$eval('.ant-alert-error, .error-message, .ant-typography-danger', elements => {
      return elements.map(el => el.textContent?.trim()).filter(Boolean);
    });

    if (errors.length > 0) {
      console.log('❌ 发现错误信息:', errors);
    }

    // 检查仪表盘的数据状态
    const dashboardData = await page.evaluate(() => {
      // 尝试获取React组件的状态或数据
      const cards = Array.from(document.querySelectorAll('.ant-card'));
      return cards.map((card, index) => {
        const title = card.querySelector('.ant-card-head-title');
        const body = card.querySelector('.ant-card-body');
        return {
          index: index + 1,
          title: title?.textContent?.trim() || '无标题',
          bodyContent: body?.textContent?.trim().substring(0, 100) || '无内容',
          hasChildren: body?.children.length > 0
        };
      });
    });

    console.log('📋 仪表盘卡片信息:');
    dashboardData.forEach(card => {
      console.log(`卡片${card.index}: "${card.title}" - ${card.hasChildren ? '有子元素' : '无子元素'}`);
      if (!card.hasChildren) {
        console.log(`  内容预览: ${card.bodyContent}`);
      }
    });

    // 特别检查应该有图表的卡片
    const chartCards = await page.$$eval('.ant-card', cards => {
      return cards.map((card, index) => {
        const title = card.querySelector('.ant-card-head-title')?.textContent?.trim() || '';
        const body = card.querySelector('.ant-card-body');
        const hasSVG = body?.querySelector('svg') !== null;
        const hasCanvas = body?.querySelector('canvas') !== null;
        return {
          index: index + 1,
          title,
          hasSVG,
          hasCanvas,
          bodyHTML: body?.innerHTML.substring(0, 200)
        };
      }).filter(card =>
        card.title.includes('趋势') ||
        card.title.includes('分布') ||
        card.title.includes('图表') ||
        card.title.includes('Chart')
      );
    });

    console.log('📈 应该包含图表的卡片:');
    chartCards.forEach(card => {
      console.log(`卡片${card.index}: "${card.title}"`);
      console.log(`  有SVG: ${card.hasSVG}, 有Canvas: ${card.hasCanvas}`);
      console.log(`  HTML预览: ${card.bodyHTML.substring(0, 100)}...`);
    });

    // 检查控制台是否有图表相关的错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && (
        msg.text().includes('recharts') ||
        msg.text().includes('chart') ||
        msg.text().includes('svg') ||
        msg.text().includes('d3')
      )) {
        consoleErrors.push(msg.text());
        console.log(`❌ 图表相关错误: ${msg.text()}`);
      }
    });

    // 等待一下收集错误
    await page.waitForTimeout(2000);

    // 最终截图
    await page.screenshot({
      path: 'dashboard-charts-debug.png',
      fullPage: true
    });

    console.log('📸 图表调试截图已保存: dashboard-charts-debug.png');

    // 检查recharts是否正确加载
    const rechartsLoaded = await page.evaluate(() => {
      return typeof window !== 'undefined' &&
             window.Recharts !== undefined;
    });

    console.log(`📦 Recharts库加载状态: ${rechartsLoaded ? '✅ 已加载' : '❌ 未加载'}`);

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 仪表盘图表问题检查完成！');
})();