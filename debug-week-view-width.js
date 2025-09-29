const { chromium } = require('playwright');

async function debugWeekViewWidth() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 调试周视图宽度问题...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    console.log('\n🔍 容器和宽度分析:');

    // 检查主容器
    const mainContainer = await page.evaluate(() => {
      const container = document.querySelector('.calendar-tab-content');
      if (container) {
        const rect = container.getBoundingClientRect();
        const style = window.getComputedStyle(container);
        return {
          width: rect.width,
          height: rect.height,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          scrollWidth: container.scrollWidth,
          scrollHeight: container.scrollHeight,
          clientWidth: container.clientWidth,
          clientHeight: container.clientHeight
        };
      }
      return null;
    });

    console.log('📦 主日历容器:', JSON.stringify(mainContainer, null, 2));

    // 检查周视图容器
    const weekViewContainer = await page.evaluate(() => {
      const container = document.querySelector('[style*="background-color: rgb(250, 250, 250)"][style*="padding: 16px"]');
      if (container) {
        const rect = container.getBoundingClientRect();
        return {
          width: rect.width,
          height: rect.height,
          left: rect.left,
          right: rect.right
        };
      }
      return null;
    });

    console.log('📅 周视图容器:', JSON.stringify(weekViewContainer, null, 2));

    // 检查时间轴网格容器
    const gridContainer = await page.evaluate(() => {
      const container = document.querySelector('[style*="height: 780px"][style*="overflow: auto"]');
      if (container) {
        const rect = container.getBoundingClientRect();
        const style = window.getComputedStyle(container);
        return {
          width: rect.width,
          height: rect.height,
          overflowX: style.overflowX,
          overflowY: style.overflowY,
          scrollWidth: container.scrollWidth,
          clientWidth: container.clientWidth
        };
      }
      return null;
    });

    console.log('🗂️ 时间轴网格容器:', JSON.stringify(gridContainer, null, 2));

    // 检查内容容器
    const contentContainer = await page.evaluate(() => {
      const container = document.querySelector('[style*="display: flex"][style*="min-width"]');
      if (container) {
        const rect = container.getBoundingClientRect();
        return {
          width: rect.width,
          scrollWidth: container.scrollWidth,
          min_width: container.style.minWidth
        };
      }
      return null;
    });

    console.log('📄 内容容器:', JSON.stringify(contentContainer, null, 2));

    // 检查所有日期列
    const dayColumns = await page.evaluate(() => {
      const columns = document.querySelectorAll('[style*="width: 140px"]');
      return Array.from(columns).map((col, index) => {
        const rect = col.getBoundingClientRect();
        return {
          index: index,
          width: rect.width,
          left: rect.left,
          right: rect.right,
          day_name: col.textContent?.trim() || 'Unknown'
        };
      });
    });

    console.log('\n📅 日期列分析:');
    dayColumns.forEach(col => {
      console.log(`  列${col.index}: ${col.day_name}, 位置: ${col.left.toFixed(0)}-${col.right.toFixed(0)}, 宽度: ${col.width}px`);
    });

    // 检查窗口尺寸
    const windowSize = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    }));

    console.log('\n🪟 窗口尺寸:', JSON.stringify(windowSize, null, 2));

    // 检查周五和周六是否在可视区域内
    const fridayColumn = dayColumns.find(col => col.day_name.includes('Fri'));
    const saturdayColumn = dayColumns.find(col => col.day_name.includes('Sat'));

    if (fridayColumn && saturdayColumn && gridContainer) {
      const gridRect = await page.evaluate(() => {
        const container = document.querySelector('[style*="height: 780px"][style*="overflow: auto"]');
        return container.getBoundingClientRect();
      });

      const fridayVisible = fridayColumn.left >= gridRect.left && fridayColumn.right <= gridRect.right;
      const saturdayVisible = saturdayColumn.left >= gridRect.left && saturdayColumn.right <= gridRect.right;

      console.log('\n👁️ 可视性检查:');
      console.log(`  周五完全可见: ${fridayVisible}`);
      console.log(`  周六完全可见: ${saturdayVisible}`);
      console.log(`  网格容器宽度: ${gridRect.width}px`);
      console.log(`  周五位置: ${fridayColumn.left.toFixed(0)}-${fridayColumn.right.toFixed(0)}`);
      console.log(`  周六位置: ${saturdayColumn.left.toFixed(0)}-${saturdayColumn.right.toFixed(0)}`);
    }

    // 截图保存结果
    await page.screenshot({ path: 'test-results/week-view-width-debug.png' });

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugWeekViewWidth();