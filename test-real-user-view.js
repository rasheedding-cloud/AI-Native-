const { chromium } = require('playwright');

async function testRealUserView() {
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1280, height: 720 } // 标准笔记本尺寸
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 模拟真实用户视角检查周视图...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    // 模拟用户视角 - 不滚动时的可视区域
    const viewportInfo = await page.evaluate(() => {
      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        scrollX: window.scrollX,
        scrollY: window.scrollY
      };
    });

    console.log('📱 用户视角信息:');
    console.log(`  屏幕宽度: ${viewportInfo.viewportWidth}px`);
    console.log(`  屏幕高度: ${viewportInfo.viewportHeight}px`);
    console.log(`  横向滚动位置: ${viewportInfo.scrollX}px`);
    console.log(`  纵向滚动位置: ${viewportInfo.scrollY}px`);

    // 获取周视图容器的实际位置和尺寸
    const weekViewInfo = await page.evaluate(() => {
      const container = document.querySelector('.calendar-tab-content');
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        right: rect.right,
        width: rect.width,
        height: rect.height,
        scrollTop: container.scrollTop,
        scrollLeft: container.scrollLeft,
        scrollWidth: container.scrollWidth,
        clientWidth: container.clientWidth
      };
    });

    console.log('\n📅 周视图容器信息:');
    console.log(JSON.stringify(weekViewInfo, null, 2));

    // 检查周五和周六在用户视角中的可见性
    const dayVisibility = await page.evaluate(() => {
      const dayColumns = document.querySelectorAll('[style*="width: 140px"]');
      const results = [];

      dayColumns.forEach((col, index) => {
        const rect = col.getBoundingClientRect();
        const dayName = col.textContent?.trim() || 'Unknown';

        // 检查是否在可视区域内
        const isInViewport = rect.left >= 0 && rect.right <= window.innerWidth;
        const isPartiallyVisible = rect.right > 0 && rect.left < window.innerWidth;

        results.push({
          index,
          dayName,
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          fullyVisible: isInViewport,
          partiallyVisible: isPartiallyVisible,
          visiblePercentage: Math.round((Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0)) / rect.width * 100)
        });
      });

      return results;
    });

    console.log('\n👁️ 各天可见性分析:');
    dayVisibility.forEach(day => {
      const visibility = day.fullyVisible ? '✅ 完全可见' :
                         day.partiallyVisible ? `⚠️ 部分可见 (${day.visiblePercentage}%)` :
                         '❌ 不可见';
      console.log(`  ${day.dayName}: 位置 ${day.left}-${day.right}px - ${visibility}`);
    });

    // 特别关注周五和周六
    const friday = dayVisibility.find(d => d.dayName.includes('Fri'));
    const saturday = dayVisibility.find(d => d.dayName.includes('Sat'));

    console.log('\n🎯 重点检查周五周六:');
    if (friday) {
      console.log(`  周五: ${friday.fullyVisible ? '✅ 完全可见' :
                  friday.partiallyVisible ? `⚠️ 部分可见 (${friday.visiblePercentage}%)` :
                  '❌ 不可见'}`);
    }
    if (saturday) {
      console.log(`  周六: ${saturday.fullyVisible ? '✅ 完全可见' :
                  saturday.partiallyVisible ? `⚠️ 部分可见 (${saturday.visiblePercentage}%)` :
                  '❌ 不可见'}`);
    }

    // 检查是否需要横向滚动才能看到周五周六
    const scrollNeeded = await page.evaluate(() => {
      const container = document.querySelector('.calendar-tab-content');
      if (!container) return false;

      // 模拟滚动到最右边
      const originalScrollLeft = container.scrollLeft;
      container.scrollLeft = container.scrollWidth - container.clientWidth;
      const maxScrollLeft = container.scrollLeft;

      // 恢复原位置
      container.scrollLeft = originalScrollLeft;

      return maxScrollLeft > 0;
    });

    console.log(`\n📜 需要横向滚动: ${scrollNeeded}`);

    // 截图保存
    await page.screenshot({ path: 'test-results/real-user-view-before-scroll.png' });

    if (scrollNeeded) {
      // 模拟用户滚动到最右边
      await page.evaluate(() => {
        const container = document.querySelector('.calendar-tab-content');
        if (container) {
          container.scrollLeft = container.scrollWidth - container.clientWidth;
        }
      });

      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/real-user-view-after-scroll.png' });
    }

    console.log('\n🎊 诊断总结:');
    if (!friday?.fullyVisible || !saturday?.fullyVisible) {
      console.log('❌ 问题确认：周五和/或周六在初始状态下不可见');
      console.log('📝 建议：需要进一步修复CSS或布局问题');
    } else {
      console.log('✅ 周五和周六都完全可见');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testRealUserView();