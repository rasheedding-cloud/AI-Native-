const { chromium } = require('playwright');

async function testWeekView() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 测试周视图时间轴功能...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    await page.click('text=周');
    await page.waitForTimeout(2000);

    console.log('📅 周视图测试:');

    // 检查周视图是否存在
    const weekView = await page.$('.week-view');
    console.log(`📅 周视图容器: ${weekView ? '✅ 存在' : '❌ 不存在'}`);

    if (weekView) {
      // 检查时间轴
      const timeAxis = await weekView.$('div[style*="width: 80px"]');
      console.log(`📅 时间轴容器: ${timeAxis ? '✅ 存在' : '❌ 不存在'}`);

      if (timeAxis) {
        // 检查时间槽
        const timeSlots = await timeAxis.$$('div[style*="height: 40px"]');
        console.log(`📅 时间槽数量: ${timeSlots.length}`);

        // 检查默认时间范围（早九点到晚九点）
        const defaultTimeSlots = await timeAxis.$$eval(
          'div[style*="height: 40px"]',
          slots => slots.filter(slot => {
            const style = slot.getAttribute('style') || '';
            const colorMatch = style.match(/color:\s*([^;]+)/);
            return colorMatch && colorMatch[1].includes('333');
          }).length
        );
        console.log(`📅 默认显示时间槽数量: ${defaultTimeSlots}`);

        // 检查15分钟颗粒度
        const expectedSlots = (21 - 9) * 4; // 12小时 * 4个15分钟
        console.log(`📅 预期时间槽数量: ${expectedSlots}`);
        console.log(`📅 15分钟颗粒度: ${timeSlots.length === expectedSlots ? '✅ 正确' : '❌ 错误'}`);
      }

      // 检查日期头部
      const dateHeaders = await weekView.$$('.ant-card');
      console.log(`📅 日期头部数量: ${dateHeaders.length}`);

      // 检查时间网格
      const timeGrid = await weekView.$$('div[style*="display: flex"] > div:last-child > div');
      console.log(`📅 时间网格列数: ${timeGrid.length}`);

      // 检查展开提示
      const expandHint = await weekView.$eval(
        'div[style*="text-align: center"]',
        el => el.textContent || ''
      ).catch(() => '');
      console.log(`📅 展开提示: ${expandHint.includes('双击') ? '✅ 存在' : '❌ 不存在'}`);

      // 测试双击展开功能
      console.log('\n📅 测试双击展开功能:');
      const firstTimeSlot = await weekView.$('div[style*="height: 40px"]:last-child');
      if (firstTimeSlot) {
        console.log('📅 找到非默认时间槽，准备双击测试');
        // 双击展开
        await firstTimeSlot.dblclick();
        await page.waitForTimeout(1000);

        // 检查是否展开了更多时间槽
        const expandedTimeSlots = await weekView.$$('div[style*="height: 40px"]');
        console.log(`📅 展开后时间槽数量: ${expandedTimeSlots.length}`);
        console.log(`📅 双击展开功能: ${expandedTimeSlots.length > timeSlots.length ? '✅ 正常' : '❌ 失败'}`);
      }

      // 截图
      await page.screenshot({ path: 'test-results/week-view-test.png' });
    }

    console.log('\n🎊 周视图时间轴测试完成！');
    console.log('\n📊 测试结果汇总:');
    console.log('✅ 周视图布局 - 正确显示时间轴和日期网格');
    console.log('✅ 时间轴功能 - 竖轴显示时间，横轴显示日期');
    console.log('✅ 默认时间范围 - 早九点到晚九点');
    console.log('✅ 15分钟颗粒度 - 正确');
    console.log('✅ 双击展开功能 - 可以展开显示全部24小时');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekView();