import { chromium } from 'playwright';

(async () => {
  console.log('🔍 开始检查仪表盘数据状态...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 导航到仪表盘
    await page.goto('http://localhost:5177');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });

    console.log('✅ 页面加载成功');

    // 检查各个数据区域
    const checks = [
      { selector: '.stat-card', name: '统计卡片' },
      { selector: '.ant-card', name: '所有卡片' },
      { selector: '.ant-statistic', name: '统计数据' },
      { selector: '.kpi-card', name: 'KPI卡片' },
      { selector: '.recharts-wrapper', name: '图表区域' },
      { selector: '.ant-list-item', name: '列表项' },
      { selector: '.ant-progress', name: '进度条' },
      { selector: '.ant-tag', name: '标签' }
    ];

    for (const check of checks) {
      const elements = await page.$$(check.selector);
      console.log(`📊 ${check.name}: ${elements.length} 个元素`);

      if (elements.length > 0) {
        // 检查第一个元素是否可见
        const isVisible = await elements[0].isVisible();
        console.log(`   ${isVisible ? '✅ 可见' : '❌ 不可见'}`);

        // 获取位置信息
        const box = await elements[0].boundingBox();
        if (box) {
          console.log(`   位置: (${box.x}, ${box.y}), 尺寸: ${box.width}x${box.height}`);
        }
      }
    }

    // 检查是否有空白卡片
    const cards = await page.$$('.ant-card');
    console.log(`\n🔍 详细检查 ${cards.length} 个卡片:`);

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const box = await card.boundingBox();

      if (box) {
        // 获取卡片内容
        const content = await card.textContent();
        const hasContent = content && content.trim().length > 0;

        console.log(`卡片${i+1}: ${box.width}x${box.height} - ${hasContent ? '有内容' : '空白'}`);

        if (!hasContent) {
          console.log(`  空白卡片位置: (${box.x}, ${box.y})`);
          // 截图空白卡片
          await page.screenshot({
            path: `empty-card-${i+1}.png`,
            fullPage: false,
            clip: box
          });
        }
      }
    }

    // 检查控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 控制台错误: ${msg.text()}`);
      }
    });

    // 等待一下，看看是否有异步加载的内容
    await page.waitForTimeout(3000);

    // 最终截图
    await page.screenshot({
      path: 'dashboard-final.png',
      fullPage: true
    });

    console.log('📸 完整仪表盘截图已保存: dashboard-final.png');

    // 尝试获取store数据状态（通过执行JavaScript）
    const storeData = await page.evaluate(() => {
      // 尝试访问React组件的状态
      const reactRoot = document.querySelector('#root');
      if (reactRoot) {
        return {
          hasReactRoot: true,
          rootInnerHTML: reactRoot.innerHTML.substring(0, 200)
        };
      }
      return { hasReactRoot: false };
    });

    console.log('📋 React根元素信息:', storeData);

  } catch (error) {
    console.error('❌ 检查过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 仪表盘数据状态检查完成！');
})();