const { chromium } = require('playwright');

async function debugWeekScroll() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 调试周视图滚动问题...\n');

    // 启用控制台日志
    page.on('console', msg => {
      if (msg.text().includes('WeekViewSimple') || msg.text().includes('Rendering week view')) {
        console.log(`控制台: ${msg.text()}`);
      }
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    await page.click('label:has-text("周")');
    await page.waitForTimeout(3000);

    // 获取周视图DOM结构
    const weekView = await page.$('.week-view');
    if (weekView) {
      console.log('\n📅 周视图滚动容器分析:');

      // 获取所有div元素及其样式
      const allDivs = await weekView.$$eval('div', divs =>
        divs.map(div => ({
          text: div.textContent?.substring(0, 30),
          style: div.getAttribute('style')?.substring(0, 80),
          class: div.getAttribute('class')
        }))
      );

      // 查找包含display: flex的div（时间轴网格容器）
      const flexDivs = allDivs.filter(div =>
        div.style && div.style.includes('display: flex') && div.style.includes('overflow-y')
      );
      console.log('📅 包含flex和overflow的div:', flexDivs.length);
      flexDivs.forEach((div, index) => {
        console.log(`${index + 1}. 样式: ${div.style}`);
        console.log(`   文本: ${div.text}`);
      });

      // 查找高度相关的样式
      const heightDivs = allDivs.filter(div =>
        div.style && (div.style.includes('max-height') || div.style.includes('height'))
      );
      console.log('\n📅 包含高度设置的div:', heightDivs.length);
      heightDivs.forEach((div, index) => {
        console.log(`${index + 1}. 样式: ${div.style}`);
      });

      // 检查周视图的整体样式
      const weekViewStyle = await weekView.getAttribute('style') || '';
      console.log('\n📅 周视图容器样式:', weekViewStyle);

      // 截图
      await page.screenshot({ path: 'debug-results/week-scroll-debug.png' });
    }

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugWeekScroll();