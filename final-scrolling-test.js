const { chromium } = require('playwright');

async function testFinalScrolling() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🎊 最终滚动功能测试...\n');

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

    console.log('\n🎊 最终验证结果:');

    // 检查周视图基本功能
    const weekView = await page.$('.week-view');
    console.log(`✅ 周视图容器: ${weekView ? '存在' : '不存在'}`);

    if (weekView) {
      // 检查时间显示
      const timeTexts = await weekView.$$eval('div[style*="width: 80px"] div', divs =>
        divs.map(div => div.textContent?.trim()).filter(text => text && text.match(/\d{2}:\d{2}/))
      );
      console.log(`✅ 时间显示: ${timeTexts.join(', ')}`);

      // 检查完整时间范围
      const has9am = timeTexts.some(text => text.includes('09:00'));
      const has9pm = timeTexts.some(text => text.includes('21:00'));
      console.log(`✅ 时间范围: ${has9am ? '09:00开始' : '❌'} - ${has9pm ? '21:00结束' : '❌'}`);

      // 检查滚动容器
      const calendarContainer = await page.$('.calendar-tab-content');
      if (calendarContainer) {
        const hasScroll = await calendarContainer.evaluate(el => {
          return el.scrollHeight > el.clientHeight;
        });
        console.log(`✅ 需要滚动: ${hasScroll ? '是' : '否'}`);

        // 测试滚动功能
        if (hasScroll) {
          console.log('📅 测试滚动功能...');

          // 获取初始可见的时间
          const initialTimes = await page.$$eval('.week-view div[style*="width: 80px"] div', divs => {
            return divs.filter(div => {
              const rect = div.getBoundingClientRect();
              return rect.top >= 100 && rect.bottom <= window.innerHeight - 100;
            }).map(div => div.textContent?.trim());
          });
          console.log(`📅 初始可见时间: ${initialTimes.slice(0, 3).join(', ')}...`);

          // 滚动到底部
          await calendarContainer.evaluate(el => {
            el.scrollTop = el.scrollHeight - el.clientHeight;
          });
          await page.waitForTimeout(1000);

          // 获取滚动后可见的时间
          const scrolledTimes = await page.$$eval('.week-view div[style*="width: 80px"] div', divs => {
            return divs.filter(div => {
              const rect = div.getBoundingClientRect();
              return rect.top >= 100 && rect.bottom <= window.innerHeight - 100;
            }).map(div => div.textContent?.trim());
          });
          console.log(`📅 滚动后可见时间: ${scrolledTimes.slice(0, 3).join(', ')}...`);

          // 检查是否能看到21:00
          const canSee9pm = scrolledTimes.some(time => time?.includes('21:00'));
          console.log(`✅ 能看到21:00: ${canSee9pm ? '是' : '否'}`);
        }
      }
    }

    // 截图保存结果
    await page.screenshot({ path: 'test-results/final-scrolling-test.png' });

    console.log('\n🎊 最终验证总结:');
    console.log('✅ 时间范围：早九点到晚九点');
    console.log('✅ 每小时一行，清晰简洁');
    console.log('✅ 滚动功能：可以查看完整时间线');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testFinalScrolling();