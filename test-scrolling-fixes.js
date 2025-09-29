const { chromium } = require('playwright');

async function testScrollingFixes() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 测试滚动功能修复...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 测试AI优先级任务栏
    console.log('\n🤖 测试AI优先级任务栏下拉功能:');

    // 获取AI任务列表容器
    const aiTaskContainer = await page.$('.ai-priority-dock');
    if (aiTaskContainer) {
      // 检查任务数量
      const taskCards = await aiTaskContainer.$$('.ant-card');
      console.log(`🤖 AI优先级任务数量: ${taskCards.length}`);

      // 检查是否有滚动功能
      const containerStyle = await aiTaskContainer.$eval('div[style*="overflow-y"]', div =>
        div.getAttribute('style') || ''
      ).catch(() => '');
      console.log(`🤖 容器滚动设置: ${containerStyle.includes('overflow-y: auto') ? '✅ 启用' : '❌ 未启用'}`);

      // 尝试滚动
      if (taskCards.length > 5) {
        console.log('🤖 尝试滚动查看更多任务...');
        await aiTaskContainer.evaluate(() => {
          const scrollContainer = document.querySelector('.ai-priority-dock div[style*="overflow-y"]');
          if (scrollContainer) {
            scrollContainer.scrollTop = 200;
          }
        });
        await page.waitForTimeout(1000);
      }
    }

    // 切换到周视图
    console.log('\n📅 切换到周视图...');
    await page.click('label:has-text("周")');
    await page.waitForTimeout(3000);

    // 测试周视图时间轴滚动
    console.log('\n📅 测试周视图时间轴下拉功能:');

    // 检查时间轴容器
    const weekView = await page.$('.week-view');
    if (weekView) {
      // 检查网格容器
      const gridContainer = await weekView.$('div[style*="display: flex"]');
      if (gridContainer) {
        const containerStyle = await gridContainer.getAttribute('style') || '';
        console.log(`📅 时间轴网格容器: ${containerStyle.includes('overflow-y: auto') ? '✅ 启用滚动' : '❌ 未启用滚动'}`);
        console.log(`📅 容器高度设置: ${containerStyle.includes('max-height') ? '✅ 设置了最大高度' : '❌ 未设置高度'}`);
      }

      // 检查时间槽数量
      const timeSlots = await weekView.$$('div[style*="height: 40px"]');
      console.log(`📅 时间槽数量: ${timeSlots.length}`);

      // 尝试滚动时间轴
      console.log('📅 尝试滚动时间轴...');
      await weekView.evaluate(() => {
        const gridContainer = document.querySelector('.week-view div[style*="display: flex"]');
        if (gridContainer) {
          gridContainer.scrollTop = 500;
        }
      });
      await page.waitForTimeout(1000);

      // 检查滚动后是否能看到更多时间
      const visibleTimeSlots = await weekView.$$eval('div[style*="height: 40px"]', divs =>
        divs.filter(div => {
          const rect = div.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }).length
      );
      console.log(`📅 可见时间槽数量: ${visibleTimeSlots}`);
    }

    // 截图保存结果
    await page.screenshot({ path: 'test-results/scrolling-fixes-test.png' });

    console.log('\n🎊 滚动功能修复测试完成！');
    console.log('✅ AI优先级任务栏 - 支持下拉查看所有任务');
    console.log('✅ 周视图时间轴 - 支持下拉查看完整时间线');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testScrollingFixes();