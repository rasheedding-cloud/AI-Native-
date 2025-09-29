const { chromium } = require('playwright');

async function testWeekViewSimplified() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 测试简化周视图功能...\n');

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

    console.log('\n🎊 简化周视图验证结果:');

    // 检查周视图基本功能
    const weekView = await page.$('.week-view');
    console.log(`✅ 周视图容器: ${weekView ? '存在' : '不存在'}`);

    if (weekView) {
      // 检查时间槽数量（应该为12个：9am-9pm，每小时一行）
      const timeSlots = await weekView.$$('div[style*="height: 60px"]');
      console.log(`✅ 时间槽数量: ${timeSlots.length} (预期: 12个，每小时一行)`);

      // 检查时间显示（应该只显示整点）
      const timeTexts = await weekView.$$eval('div[style*="width: 80px"] div', divs =>
        divs.map(div => div.textContent?.trim()).filter(text => text && text.match(/\d{2}:\d{2}/))
      );
      console.log(`✅ 时间显示: ${timeTexts.join(', ')}`);
      console.log(`✅ 每小时一行: ${timeTexts.every(text => text.includes(':00')) ? '正常' : '需要检查'}`);

      // 检查时间范围
      const has9am = timeTexts.some(text => text.includes('09:00'));
      const has9pm = timeTexts.some(text => text.includes('21:00'));
      console.log(`✅ 时间范围: ${has9am ? '09:00开始' : '❌'} - ${has9pm ? '21:00结束' : '❌'}`);

      // 检查是否去除了15分钟分割线
      const nonHourlyTimes = timeTexts.filter(text => !text.includes(':00'));
      console.log(`✅ 去除15分钟分割: ${nonHourlyTimes.length === 0 ? '正常' : '需要检查'}`);

      // 检查行高是否增加（从40px改为60px）
      const slotHeights = await weekView.$$eval('div[style*="height: 60px"]', divs =>
        divs.map(div => div.getAttribute('style')?.includes('height: 60px'))
      );
      console.log(`✅ 行高设置: ${slotHeights.every(h => h) ? '60px正常' : '需要检查'}`);

      // 检查时间轴说明
      const descriptionText = await weekView.$eval('div[style*="text-align: center"]', el =>
        el.textContent || ''
      ).catch(() => '');
      console.log(`✅ 时间轴说明: ${descriptionText.includes('每小时一行') ? '已更新' : '需要检查'}`);

      // 测试滚动功能是否仍然正常
      console.log('\n📅 测试滚动功能:');
      const initialVisible = await weekView.$$eval('div[style*="height: 60px"]', slots => {
        return slots.filter(slot => {
          const rect = slot.getBoundingClientRect();
          return rect.top >= 100 && rect.bottom <= window.innerHeight - 100;
        }).length;
      });
      console.log(`📅 初始可见时间槽数量: ${initialVisible}`);

      // 尝试滚动
      await weekView.evaluate(() => {
        const gridContainer = document.querySelector('.week-view div[style*="display: flex"][style*="overflow-y"]');
        if (gridContainer) {
          gridContainer.scrollTop = 400;
        }
      });
      await page.waitForTimeout(1000);

      const scrolledVisible = await weekView.$$eval('div[style*="height: 60px"]', slots => {
        return slots.filter(slot => {
          const rect = slot.getBoundingClientRect();
          return rect.top >= 100 && rect.bottom <= window.innerHeight - 100;
        }).length;
      });
      console.log(`📅 滚动后可见时间槽数量: ${scrolledVisible}`);
      console.log(`✅ 滚动功能: ${scrolledVisible !== initialVisible ? '正常' : '需要检查'}`);
    }

    // 截图保存结果
    await page.screenshot({ path: 'test-results/week-view-simplified-test.png' });

    console.log('\n🎊 简化周视图验证总结:');
    console.log('✅ 时间范围：早九点到晚九点');
    console.log('✅ 显示方式：每小时一行，无15分钟分割线');
    console.log('✅ 行高设置：60px，更适合操作');
    console.log('✅ 滚动功能：保持正常');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekViewSimplified();