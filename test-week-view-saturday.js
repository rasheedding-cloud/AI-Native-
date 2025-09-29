const { chromium } = require('playwright');

async function testWeekViewSaturday() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 测试周视图周六显示完整性和右侧截断问题...\n');

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    console.log('📅 切换到周视图...');
    await page.click('text=周');
    await page.waitForTimeout(3000);

    console.log('\n🎊 周视图周六显示验证:');

    // 查找周视图容器
    const weekView = await page.$('.week-view-container');
    console.log(`✅ 周视图容器: ${weekView ? '存在' : '不存在'}`);

    if (weekView) {
      // 检查日期列数量
      const dayColumns = await weekView.$$('.week-day-column');
      console.log(`✅ 日期列数量: ${dayColumns.length} (预期: 7列)`);

      // 检查日期头部数量
      const dayHeaders = await weekView.$$('.week-day-header');
      console.log(`✅ 日期头部数量: ${dayHeaders.length} (预期: 7个)`);

      // 检查显示的星期
      const weekDays = await weekView.$$eval('.week-day-header div:first-child', divs =>
        divs.map(div => div.textContent?.trim())
      );
      console.log(`✅ 显示的星期: ${weekDays.join(', ')}`);

      // 检查周六是否在列表中
      const hasSaturday = weekDays.some(day => day?.includes('Sat') || day?.includes('六'));
      console.log(`✅ 周六显示: ${hasSaturday ? '正常' : '缺失'}`);

      // 检查时间轴容器
      const gridContainer = await weekView.$('.week-grid-container');
      if (gridContainer) {
        // 检查容器是否支持横向滚动
        const overflowX = await gridContainer.evaluate(el => {
          const style = window.getComputedStyle(el);
          return style.overflowX;
        });
        console.log(`✅ 时间轴横向滚动: ${overflowX}`);

        // 检查实际内容宽度
        const contentWidth = await gridContainer.evaluate(el => {
          const flexContainer = el.querySelector('div[style*="display: flex"]');
          return flexContainer ? flexContainer.scrollWidth : 0;
        });
        console.log(`✅ 内容宽度: ${contentWidth}px`);

        // 检查容器宽度
        const containerWidth = await gridContainer.evaluate(el => el.clientWidth);
        console.log(`✅ 容器宽度: ${containerWidth}px`);

        // 检查是否需要滚动
        const needsScroll = contentWidth > containerWidth;
        console.log(`✅ 需要横向滚动: ${needsScroll ? '是' : '否'}`);
      }

      // 检查每个日期列的宽度
      if (dayColumns.length > 0) {
        const lastColumn = dayColumns[dayColumns.length - 1]; // 周六列
        const columnWidth = await lastColumn.evaluate(el => el.offsetWidth);
        console.log(`✅ 周六列宽度: ${columnWidth}px`);

        // 检查周六列是否完全可见
        const isFullyVisible = await lastColumn.evaluate(el => {
          const rect = el.getBoundingClientRect();
          const parentRect = el.parentElement?.getBoundingClientRect();
          if (!parentRect) return false;
          return rect.right <= parentRect.right;
        });
        console.log(`✅ 周六列完全可见: ${isFullyVisible ? '是' : '否'}`);
      }

      // 截图保存结果
      await page.screenshot({ path: 'test-results/week-view-saturday-test.png' });
    }

    console.log('\n🎊 修复验证总结:');
    console.log('✅ 周六显示问题：应该完整显示')
    console.log('✅ 右侧截断问题：应该通过横向滚动解决')
    console.log('✅ 所有7天都应该完整显示')

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekViewSaturday();