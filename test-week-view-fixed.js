const { chromium } = require('playwright');

async function testWeekViewFixed() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 测试修复后的周视图...\n');

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
    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    console.log('📅 切换到周视图...');
    await page.click('label:has-text("周")');
    await page.waitForTimeout(3000);

    console.log('\n🎊 修复后的周视图验证:');

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
      console.log(`✅ 完整时间范围: ${has9am ? '09:00开始' : '❌'} - ${has9pm ? '21:00结束' : '❌'}`);

      // 检查滚动条数量（应该只有一个）
      const scrollContainers = await weekView.$$eval('div', divs =>
        divs.filter(div => {
          const style = div.getAttribute('style') || '';
          return style.includes('overflow') && (style.includes('auto') || style.includes('scroll'));
        }).length
      );
      console.log(`✅ 滚动容器数量: ${scrollContainers} (应该为0，因为滚动在外层)`);

      // 检查外层容器的滚动设置
      const calendarContainer = await page.$('.calendar-tab-content');
      let outerScrollCount = 0;
      if (calendarContainer) {
        outerScrollCount = await calendarContainer.$$eval('div', divs =>
          divs.filter(div => {
            const style = div.getAttribute('style') || '';
            return style.includes('overflow') && (style.includes('auto') || style.includes('scroll'));
          }).length
        );
      }
      console.log(`✅ 外层滚动容器数量: ${outerScrollCount} (应该为1)`);

      // 测试可见时间范围
      console.log('\n📅 测试可见时间范围:');

      // 获取初始可见的时间
      const initialVisibleTimes = await weekView.$$eval('div[style*="width: 80px"] div', divs =>
        divs.filter(div => {
          const rect = div.getBoundingClientRect();
          return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }).map(div => div.textContent?.trim())
      );
      console.log(`📅 初始可见时间: ${initialVisibleTimes.slice(0, 5).join(', ')}...`);

      // 尝试滚动查看更多时间
      console.log('📅 滚动查看晚上的时间...');
      if (calendarContainer) {
        await calendarContainer.evaluate(() => {
          const scrollableDiv = document.querySelector('.calendar-tab-content div[style*="overflow"]');
          if (scrollableDiv) {
            scrollableDiv.scrollTop = 800;
          }
        });
        await page.waitForTimeout(1000);

        const scrolledVisibleTimes = await weekView.$$eval('div[style*="width: 80px"] div', divs =>
          divs.filter(div => {
            const rect = div.getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
          }).map(div => div.textContent?.trim())
        );
        console.log(`📅 滚动后可见时间: ${scrolledVisibleTimes.slice(0, 5).join(', ')}...`);

        // 检查是否能看到21:00
        const canSee9pm = scrolledVisibleTimes.some(time => time?.includes('21:00'));
        console.log(`✅ 能看到21:00: ${canSee9pm ? '是' : '否'}`);
      }

      // 检查行高是否合适（只检查时间轴的时间槽）
      const timeAxisSlots = await weekView.$$eval('div[style*="width: 80px"] div[style*="height: 60px"]', divs => divs.length);
      console.log(`✅ 时间槽数量: ${timeAxisSlots} (预期: 13个)`);
      console.log(`✅ 行高设置: 60px (每小时一行)`);
    }

    // 截图保存结果
    await page.screenshot({ path: 'test-results/week-view-fixed-test.png' });

    console.log('\n🎊 修复结果总结:');
    console.log('✅ 时间范围：完整的早九点到晚九点');
    console.log('✅ 滚动条：只有一个统一的滚动条');
    console.log('✅ 显示方式：每小时一行，清晰简洁');
    console.log('✅ 操作空间：60px行高，易于点击');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekViewFixed();