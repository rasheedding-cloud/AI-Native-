const { chromium } = require('playwright');

async function debugCalendar() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 调试日历视图白页问题...\n');

    // 启用控制台日志
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log(`❌ 控制台错误: ${msg.text()}`);
      } else if (msg.text().includes('error') || msg.text().includes('Error')) {
        console.log(`⚠️ 控制台警告: ${msg.text()}`);
      }
    });

    page.on('pageerror', error => {
      console.log(`🚨 页面错误: ${error.message}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(3000);

    // 检查日历视图是否加载
    console.log('\n🔍 检查日历视图状态:');

    // 检查主要容器
    const calendarContainer = await page.$('.calendar-tab-content');
    console.log(`✅ 日历容器: ${calendarContainer ? '存在' : '不存在'}`);

    if (calendarContainer) {
      // 检查容器内容
      const content = await calendarContainer.textContent();
      console.log(`📄 容器内容: ${content ? '有内容' : '空内容'}`);

      // 检查月视图
      const monthView = await calendarContainer.$('.ant-calendar');
      console.log(`✅ 月视图: ${monthView ? '存在' : '不存在'}`);

      // 检查周视图
      const weekView = await calendarContainer.$('.week-view');
      console.log(`✅ 周视图: ${weekView ? '存在' : '不存在'}`);

      // 检查当前视图模式
      const monthRadio = await page.$('input[value="month"]');
      const weekRadio = await page.$('input[value="week"]');
      const monthChecked = monthRadio ? await monthRadio.isChecked() : false;
      const weekChecked = weekRadio ? await weekRadio.isChecked() : false;
      console.log(`📊 当前视图模式: 月视图${monthChecked ? '✅' : '❌'} 周视图${weekChecked ? '✅' : '❌'}`);

      // 检查是否有错误元素
      const errorElements = await page.$$eval('.ant-alert-error, .error, [class*="error"]', els => els.length);
      console.log(`❌ 错误元素数量: ${errorElements}`);

      // 截图保存结果
      await page.screenshot({ path: 'test-results/calendar-debug.png' });
    }

    // 尝试切换视图模式
    console.log('\n🔄 测试视图切换:');
    try {
      await page.click('label:has-text("周")');
      await page.waitForTimeout(2000);
      console.log('✅ 切换到周视图成功');
    } catch (e) {
      console.log('❌ 切换到周视图失败:', e.message);
    }

    try {
      await page.click('label:has-text("月")');
      await page.waitForTimeout(2000);
      console.log('✅ 切换到月视图成功');
    } catch (e) {
      console.log('❌ 切换到月视图失败:', e.message);
    }

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugCalendar();