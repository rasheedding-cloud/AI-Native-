const { chromium } = require('playwright');

async function debugWeekView() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 调试周视图渲染问题...\n');

    // 启用所有控制台日志
    page.on('console', msg => {
      console.log('控制台: ' + msg.text());
    });

    page.on('pageerror', error => {
      console.log('🚨 页面错误: ' + error.message);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    console.log('\n📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(3000);

    // 检查日历容器内容
    const calendarContent = await page.$('.calendar-tab-content');
    console.log('✅ 日历容器查找结果:', calendarContent ? '找到' : '未找到');

    // 查找右侧日历区域
    const calendarArea = await page.$('.ant-calendar');
    console.log('✅ 日历区域查找结果:', calendarArea ? '找到' : '未找到');

    if (calendarContent) {
      const content = await calendarContent.innerHTML();
      console.log('📄 日历容器HTML内容前500字符:', content.substring(0, 500));

      // 切换到周视图
      console.log('\n📅 切换到周视图...');
      await page.click('text=周');
      await page.waitForTimeout(3000);

      // 再次检查内容
      const updatedContent = await calendarContent.innerHTML();
      console.log('📄 切换后日历容器HTML内容前500字符:', updatedContent.substring(0, 500));

      // 检查是否存在week-view相关元素
      const weekViewElements = await calendarContent.$$('[class*="week"]');
      console.log('✅ week相关元素数量: ' + weekViewElements.length);

      // 检查具体元素
      for (let i = 0; i < Math.min(weekViewElements.length, 3); i++) {
        const element = weekViewElements[i];
        const className = await element.getAttribute('class');
        const text = await element.textContent();
        console.log('  元素' + (i+1) + ': class="' + className + '", text="' + text?.substring(0, 50) + '..."');
      }

      // 检查是否有任何内容被渲染
      const hasContent = await calendarContent.evaluate(el => el.children.length > 0);
      console.log('✅ 容器是否有子元素: ' + hasContent);

      if (hasContent) {
        const children = await calendarContent.$$('*');
        console.log('✅ 总子元素数量: ' + children.length);

        // 查看前几个子元素
        for (let i = 0; i < Math.min(children.length, 5); i++) {
          const child = children[i];
          const tagName = await child.evaluate(el => el.tagName);
          const className = await child.getAttribute('class');
          const text = await child.evaluate(el => el.textContent?.substring(0, 50) || '');
          console.log('  子元素' + (i+1) + ': <' + tagName + '> class="' + (className || '') + '" text="' + text + '"');
        }

        // 查找所有可能的周视图相关元素
        const possibleWeekElements = await calendarContent.$$('[class*="week"], [data-testid*="week"], .time-slot, .week-view');
        console.log('✅ 可能的周视图元素数量: ' + possibleWeekElements.length);

        for (let i = 0; i < Math.min(possibleWeekElements.length, 3); i++) {
          const element = possibleWeekElements[i];
          const className = await element.getAttribute('class');
          const text = await element.textContent();
          console.log('  周视图元素' + (i+1) + ': class="' + className + '" text="' + text?.substring(0, 30) + '..."');
        }

        // 尝试在整个页面中查找周视图元素
        const globalWeekElements = await page.$$('[class*="week-view"], .week-view-container, .week-grid-container');
        console.log('✅ 全局week-view元素数量: ' + globalWeekElements.length);

        for (let i = 0; i < Math.min(globalWeekElements.length, 3); i++) {
          const element = globalWeekElements[i];
          const className = await element.getAttribute('class');
          const text = await element.textContent();
          console.log('  全局周视图元素' + (i+1) + ': class="' + className + '" text="' + text?.substring(0, 30) + '..."');
        }
      }
    }

    // 截图保存结果
    await page.screenshot({ path: 'test-results/week-view-debug.png' });

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugWeekView();
