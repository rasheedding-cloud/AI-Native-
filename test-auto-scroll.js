const { chromium } = require('playwright');

async function testAutoScroll() {
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 测试自动滚动功能...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    // 等待自动滚动生效
    await page.waitForTimeout(3000);

    // 检查滚动位置
    const scrollInfo = await page.evaluate(() => {
      const container = document.querySelector('.calendar-tab-content');
      if (!container) return null;

      return {
        scrollLeft: container.scrollLeft,
        scrollTop: container.scrollTop,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth
      };
    });

    console.log('📜 滚动信息:', JSON.stringify(scrollInfo, null, 2));

    // 检查周六的位置
    const saturdayPosition = await page.evaluate(() => {
      const saturdayElements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && el.textContent.includes('Sat27'));

      if (saturdayElements.length > 0) {
        const saturday = saturdayElements[0];
        const rect = saturday.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width
        };
      }
      return null;
    });

    console.log('📅 周六位置:', JSON.stringify(saturdayPosition, null, 2));

    // 检查是否需要手动触发滚动
    if (scrollInfo && scrollInfo.scrollLeft === 0) {
      console.log('⚠️ 自动滚动未触发，尝试手动触发...');

      // 手动触发滚动
      await page.evaluate(() => {
        const container = document.querySelector('.calendar-tab-content');
        if (container) {
          // 模拟我们计算的滚动位置
          const targetScroll = 300; // 大约的滚动位置
          container.scrollLeft = targetScroll;
        }
      });

      await page.waitForTimeout(1000);

      // 重新检查
      const newScrollInfo = await page.evaluate(() => {
        const container = document.querySelector('.calendar-tab-content');
        if (!container) return null;

        return {
          scrollLeft: container.scrollLeft,
          saturdayVisible: Array.from(document.querySelectorAll('*'))
            .filter(el => el.textContent && el.textContent.includes('Sat27'))
            .some(el => {
              const rect = el.getBoundingClientRect();
              return rect.left >= 0 && rect.right <= window.innerWidth;
            })
        };
      });

      console.log('📜 手动滚动后:', JSON.stringify(newScrollInfo, null, 2));
    }

    // 截图
    await page.screenshot({ path: 'test-results/auto-scroll-test.png' });

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testAutoScroll();