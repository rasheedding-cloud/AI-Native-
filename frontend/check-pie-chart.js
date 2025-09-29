import { chromium } from 'playwright';

(async () => {
  console.log('🔍 开始检查饼图显示情况...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5177');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 等待一下，确保所有内容都加载完成
    await page.waitForTimeout(3000);

    // 检查饼图相关的元素
    const pieChartSelectors = [
      '.recharts-pie',
      '.recharts-slice',
      '.pie-chart',
      '.task-status-chart',
      '[data-name="任务状态分布"]',
      '.recharts-tooltip-wrapper'
    ];

    console.log('🔍 检查饼图元素...');
    for (const selector of pieChartSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`📊 找到 ${elements.length} 个饼图元素 (${selector})`);

        for (let i = 0; i < Math.min(elements.length, 3); i++) {
          const element = elements[i];
          const isVisible = await element.isVisible();
          const box = await element.boundingBox();

          console.log(`   饼图元素${i+1}: ${isVisible ? '可见' : '不可见'}`);
          if (box) {
            console.log(`   位置: (${box.x}, ${box.y}), 尺寸: ${box.width}x${box.height}`);
          }
        }
      }
    }

    // 检查任务状态分布卡片
    const statusCard = await page.$$eval('.ant-card', cards => {
      return cards.map((card, index) => {
        const title = card.querySelector('.ant-card-head-title')?.textContent?.trim() || '';
        const body = card.querySelector('.ant-card-body');
        const hasSVG = body?.querySelector('svg') !== null;
        const hasPie = body?.querySelector('.recharts-pie') !== null;

        return {
          index: index + 1,
          title,
          hasSVG,
          hasPie,
          bodyHTML: body?.innerHTML.substring(0, 300)
        };
      }).find(card => card.title.includes('任务状态分布'));
    });

    console.log('📋 任务状态分布卡片信息:');
    if (statusCard) {
      console.log(`卡片${statusCard.index}: "${statusCard.title}"`);
      console.log(`  有SVG: ${statusCard.hasSVG}, 有饼图: ${statusCard.hasPie}`);
      console.log(`  HTML预览: ${statusCard.bodyHTML.substring(0, 200)}...`);
    } else {
      console.log('❌ 未找到任务状态分布卡片');
    }

    // 检查所有的SVG元素
    const svgElements = await page.$$eval('svg', svgs => {
      return svgs.map((svg, index) => {
        const rect = svg.getBoundingClientRect();
        return {
          index: index + 1,
          width: rect.width,
          height: rect.height,
          hasPie: svg.querySelector('.recharts-pie, .recharts-slice') !== null,
          className: svg.className || 'no-class'
        };
      });
    });

    console.log('📈 SVG元素信息:');
    const pieSVGs = svgElements.filter(svg => svg.hasPie);
    if (pieSVGs.length > 0) {
      pieSVGs.forEach(svg => {
        console.log(`SVG${svg.index}: ${svg.width}x${svg.height} - 包含饼图`);
      });
    } else {
      console.log('❌ 未发现包含饼图的SVG元素');
    }

    // 截图保存当前状态
    await page.screenshot({
      path: 'pie-chart-check.png',
      fullPage: true
    });

    console.log('📸 饼图检查截图已保存: pie-chart-check.png');

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 饼图显示检查完成！');
})();