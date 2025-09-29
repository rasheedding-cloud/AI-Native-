const { chromium } = require('playwright');

async function testWeekViewColumns() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 检查周视图列数问题...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    // 检查是否有重复的周视图渲染
    const weekViewTitles = await page.evaluate(() => {
      const titles = Array.from(document.querySelectorAll('*'))
        .filter(el => el.textContent && el.textContent.includes('📅 周视图'))
        .map(el => el.textContent);
      return titles;
    });

    console.log('📅 周视图标题数量:', weekViewTitles.length);
    weekViewTitles.forEach((title, index) => {
      console.log(`  标题${index + 1}: ${title}`);
    });

    // 检查周视图组件数量
    const weekViewContainers = await page.evaluate(() => {
      const containers = Array.from(document.querySelectorAll('[style*="background-color: rgb(250, 250, 250)"]'))
        .filter(el => el.textContent && el.textContent.includes('📅 周视图'));
      return containers.length;
    });

    console.log(`📅 周视图容器数量: ${weekViewContainers}`);

    // 检查是否存在嵌套渲染
    const nestedContainers = await page.evaluate(() => {
      let nested = 0;
      document.querySelectorAll('*').forEach(el => {
        if (el.querySelectorAll('[style*="background-color: rgb(250, 250, 250)"]').length > 1) {
          nested++;
        }
      });
      return nested;
    });

    console.log(`📅 嵌套容器数量: ${nestedContainers}`);

    // 截图
    await page.screenshot({ path: 'test-results/week-view-columns-debug.png' });

    console.log('\n🎊 诊断结果:');
    if (weekViewTitles.length > 1) {
      console.log('❌ 发现重复的周视图标题');
    } else if (weekViewContainers > 1) {
      console.log('❌ 发现重复的周视图容器');
    } else if (nestedContainers > 0) {
      console.log('❌ 发现嵌套的容器结构');
    } else {
      console.log('✅ 没有发现重复渲染问题');
    }

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekViewColumns();