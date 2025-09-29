const { chromium } = require('playwright');

async function testSimpleWeekView() {
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 简化测试周视图修复效果...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    // 等待自动滚动生效
    await page.waitForTimeout(2000);

    // 检查周视图标题是否存在
    const weekViewTitle = await page.locator('text=📅 周视图').first();
    console.log(`✅ 周视图标题存在: ${await weekViewTitle.isVisible()}`);

    // 检查容器尺寸和滚动位置
    const containerInfo = await page.evaluate(() => {
      const container = document.querySelector('.calendar-tab-content');
      if (!container) return null;

      return {
        width: container.clientWidth,
        scrollWidth: container.scrollWidth,
        scrollLeft: container.scrollLeft
      };
    });

    console.log('📦 容器信息:', JSON.stringify(containerInfo, null, 2));

    // 检查是否有滚动发生
    const hasScrolled = containerInfo && containerInfo.scrollLeft > 0;
    console.log(`📜 自动滚动发生: ${hasScrolled}`);

    // 检查总宽度是否适合显示更多内容
    const totalWidth = containerInfo ? containerInfo.scrollWidth : 0;
    const containerWidth = containerInfo ? containerInfo.width : 0;
    const fitsBetter = totalWidth <= 1100; // 新的总宽度应该是 60 + 120*7 = 900px

    console.log(`📏 总宽度改善: ${totalWidth}px (之前约1521px)`);
    console.log(`📏 容器宽度: ${containerWidth}px`);
    console.log(`📏 更适合屏幕: ${fitsBetter}`);

    // 查找所有日期相关的元素
    const dayElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && /Mon|Tue|Wed|Thu|Fri|Sat|Sun/.test(el.textContent))
        .map(el => ({
          text: el.textContent?.substring(0, 20),
          visible: el.checkVisibility(),
          position: el.getBoundingClientRect()
        }));
      return elements;
    });

    console.log(`\n📅 找到日期元素: ${dayElements.length} 个`);
    dayElements.forEach((el, index) => {
      if (el.text && (el.text.includes('Fri') || el.text.includes('Sat'))) {
        console.log(`  ${el.text}: 可见=${el.visible}, 位置=${Math.round(el.position.left)}-${Math.round(el.position.right)}`);
      }
    });

    // 截图
    await page.screenshot({ path: 'test-results/simple-week-view-test.png' });

    console.log('\n🎊 修复效果总结:');
    if (fitsBetter) {
      console.log('✅ 宽度优化成功：总宽度从1521px减少到' + totalWidth + 'px');
    }
    if (hasScrolled) {
      console.log('✅ 自动滚动生效：自动滚动到合适位置');
    }
    if (fitsBetter && hasScrolled) {
      console.log('✅ 周五周六显示问题应该已解决');
    } else {
      console.log('⚠️ 可能需要进一步调整');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testSimpleWeekView();