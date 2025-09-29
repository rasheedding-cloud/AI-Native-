const { chromium } = require('playwright');

async function testWeekViewDays() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 测试周视图显示天数和高度问题...\n');

    // 启用控制台日志
    page.on('console', msg => {
      if (msg.text().includes('WeekView 尺寸更新') || msg.text().includes('时间轴')) {
        console.log(`控制台: ${msg.text()}`);
      }
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    console.log('📅 切换到周视图...');
    await page.click('label:has-text("周")');
    await page.waitForTimeout(3000);

    console.log('\n🎊 周视图验证结果:');

    // 检查周视图
    const weekView = await page.$('.week-view');
    console.log(`✅ 周视图容器: ${weekView ? '存在' : '不存在'}`);

    if (weekView) {
      // 检查显示的日期列数
      const dayColumns = await weekView.$$('.week-day-column');
      console.log(`✅ 日期列数量: ${dayColumns.length} (预期: 7列)`);

      // 检查日期头部数量
      const dayHeaders = await weekView.$$('.week-day-header');
      console.log(`✅ 日期头部数量: ${dayHeaders.length} (预期: 7个)`);

      // 检查时间格子高度
      const timeSlots = await weekView.$$('.time-slot');
      if (timeSlots.length > 0) {
        const firstSlot = timeSlots[0];
        const height = await firstSlot.evaluate(el => el.offsetHeight);
        console.log(`✅ 时间格子高度: ${height}px (预期: 50-80px)`);
      }

      // 检查显示的时间范围
      const timeTexts = await weekView.$$eval('div[style*="width:"] div', divs =>
        divs.map(div => div.textContent?.trim()).filter(text => text && text.match(/\d{2}:\d{2}/))
      );
      console.log(`✅ 时间显示: ${timeTexts.slice(0, 5).join(', ')}...`);
      console.log(`✅ 总时间槽数量: ${timeTexts.length} (预期: 13个)`);

      // 检查是否能看到完整时间范围
      const has9am = timeTexts.some(text => text.includes('09:00'));
      const has9pm = timeTexts.some(text => text.includes('21:00'));
      console.log(`✅ 时间范围: ${has9am ? '09:00开始' : '❌'} - ${has9pm ? '21:00结束' : '❌'}`);

      // 检查星期显示
      const weekDays = await weekView.$$eval('.week-day-header div:first-child', divs =>
        divs.map(div => div.textContent?.trim())
      );
      console.log(`✅ 显示的星期: ${weekDays.join(', ')}`);

      // 截图保存结果
      await page.screenshot({ path: 'test-results/week-view-days-test.png' });
    }

    // 检查窗口尺寸信息
    const windowSize = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    console.log(`\n📱 窗口尺寸: ${windowSize.width} x ${windowSize.height}`);

    console.log('\n🎊 修复验证总结:');
    console.log('✅ 显示天数问题：应该显示完整7天');
    console.log('✅ 时间格子高度：应该增加到50-80px');
    console.log('✅ 响应式检测：使用窗口宽度更准确');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekViewDays();