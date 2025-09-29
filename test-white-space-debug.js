const { chromium } = require('playwright');

async function testWhiteSpaceDebug() {
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 诊断周六被白边压住的问题...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    // 详细检查各个容器的边距和填充
    const containerAnalysis = await page.evaluate(() => {
      const results = {};

      // 1. 主日历容器
      const mainContainer = document.querySelector('.calendar-tab-content');
      if (mainContainer) {
        const style = window.getComputedStyle(mainContainer);
        const rect = mainContainer.getBoundingClientRect();
        results.mainContainer = {
          tagName: mainContainer.tagName,
          className: mainContainer.className,
          rect: {
            left: rect.left,
            right: rect.right,
            top: rect.top,
            bottom: rect.bottom,
            width: rect.width,
            height: rect.height
          },
          style: {
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
            marginTop: style.marginTop,
            marginBottom: style.marginBottom,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            paddingTop: style.paddingTop,
            paddingBottom: style.paddingBottom,
            borderLeft: style.borderLeftWidth,
            borderRight: style.borderRightWidth,
            borderTop: style.borderTopWidth,
            borderBottom: style.borderBottomWidth,
            overflow: style.overflow,
            overflowX: style.overflowX,
            overflowY: style.overflowY
          }
        };
      }

      // 2. 周视图容器
      const weekViewContainer = Array.from(document.querySelectorAll('*'))
        .find(el => el.textContent && el.textContent.includes('📅 周视图'));
      if (weekViewContainer) {
        const style = window.getComputedStyle(weekViewContainer);
        const rect = weekViewContainer.getBoundingClientRect();
        results.weekViewContainer = {
          tagName: weekViewContainer.tagName,
          rect: {
            left: rect.left,
            right: rect.right,
            width: rect.width
          },
          style: {
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight
          }
        };
      }

      // 3. 时间轴网格容器
      const gridContainers = Array.from(document.querySelectorAll('[style*="overflow: auto"]'))
        .filter(el => el.style.height && el.style.height.includes('px'));
      if (gridContainers.length > 0) {
        const gridContainer = gridContainers[0];
        const style = window.getComputedStyle(gridContainer);
        const rect = gridContainer.getBoundingClientRect();
        results.gridContainer = {
          rect: {
            left: rect.left,
            right: rect.right,
            width: rect.width
          },
          style: {
            marginLeft: style.marginLeft,
            marginRight: style.marginRight,
            paddingLeft: style.paddingLeft,
            paddingRight: style.paddingRight,
            borderLeft: style.borderLeftWidth,
            borderRight: style.borderRightWidth
          }
        };
      }

      // 4. 检查周六元素的具体位置
      const saturdayElements = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && (el.textContent.includes('Sat') || el.textContent.includes('周六')));
      results.saturdayElements = saturdayElements.map(el => {
        const rect = el.getBoundingClientRect();
        return {
          text: el.textContent?.substring(0, 30),
          rect: {
            left: rect.left,
            right: rect.right,
            width: rect.width
          }
        };
      });

      // 5. 检查内容容器的实际宽度
      const contentContainers = Array.from(document.querySelectorAll('*'))
        .filter(el => el.style && el.style.minWidth && el.style.minWidth.includes('px'));
      results.contentContainers = contentContainers.map(el => {
        const style = window.getComputedStyle(el);
        const rect = el.getBoundingClientRect();
        return {
          minWidth: el.style.minWidth,
          actualWidth: rect.width,
          scrollWidth: el.scrollWidth
        };
      });

      return results;
    });

    console.log('📦 容器分析结果:');
    console.log(JSON.stringify(containerAnalysis, null, 2));

    // 检查视窗边界
    const viewportInfo = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollX: window.scrollX
    }));

    console.log(`\n📱 视窗信息: 宽度=${viewportInfo.width}px, 滚动位置=${viewportInfo.scrollX}px`);

    // 特别关注周六的右侧边界
    const saturdayInfo = containerAnalysis.saturdayElements;
    if (saturdayInfo && saturdayInfo.length > 0) {
      const lastSaturday = saturdayInfo[saturdayInfo.length - 1];
      console.log(`\n🎯 周六右侧边界分析:`);
      console.log(`  周六右边界: ${lastSaturday.rect.right}px`);
      console.log(`  视窗右边界: ${viewportInfo.width}px`);
      console.log(`  距离视窗右边: ${viewportInfo.width - lastSaturday.rect.right}px`);

      if (lastSaturday.rect.right > viewportInfo.width) {
        console.log(`  ❌ 周六超出视窗右侧: ${lastSaturday.rect.right - viewportInfo.width}px`);
      } else {
        console.log(`  ✅ 周六在视窗内`);
      }
    }

    // 截图
    await page.screenshot({ path: 'test-results/white-space-debug.png' });

  } catch (error) {
    console.error('❌ 诊断失败:', error);
  } finally {
    await browser.close();
  }
}

testWhiteSpaceDebug();