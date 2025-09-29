const { chromium } = require('playwright');

async function testWeekViewRendering() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 测试周视图渲染...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    console.log('切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    console.log('切换到周视图...');
    await page.click('text=周');
    await page.waitForTimeout(3000);

    // 尝试更精确的选择器
    console.log('尝试点击周按钮...');
    const weekButtons = await page.$$eval('button', buttons =>
      buttons.filter(btn => btn.textContent?.includes('周')).length
    );
    console.log('找到的周按钮数量:', weekButtons);

    if (weekButtons > 0) {
      // 尝试多种方式点击周按钮
      console.log('尝试点击周按钮...');
      try {
        await page.click('text=周');
        await page.waitForTimeout(1000);

        // 检查是否已经有Radio.Button被选中
        const selectedWeek = await page.$eval('input[value="week"]', input => input.checked).catch(() => false);
        console.log('周选项是否被选中:', selectedWeek);

        // 如果没有被选中，尝试点击label
        if (!selectedWeek) {
          console.log('尝试点击周按钮的label...');
          await page.click('label:has-text("周")');
          await page.waitForTimeout(2000);
        }
      } catch (error) {
        console.log('点击周按钮失败:', error);
      }
    }

    // 检查周视图是否渲染
    const weekViewExists = await page.$('.week-view');
    console.log(`📅 周视图容器: ${weekViewExists ? '✅ 存在' : '❌ 不存在'}`);

    // 检查页面内容
    const pageContent = await page.content();
    console.log('📅 页面包含周视图测试文本:', pageContent.includes('周视图测试') ? '✅ 是' : '❌ 否');
    console.log('📅 页面包含时间轴:', pageContent.includes('09:00') ? '✅ 是' : '❌ 否');

    // 查找所有时间相关的元素
    const timeElements = await page.$$eval(
      'div',
      divs => divs.filter(div => {
        const text = div.textContent || '';
        return text.includes(':') && text.match(/\d{2}:\d{2}/);
      }).map(div => div.textContent?.substring(0, 10))
    );
    console.log('📅 发现的时间格式元素:', timeElements.slice(0, 15));

    // 截图
    await page.screenshot({ path: 'test-results/week-view-rendering-test.png' });

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testWeekViewRendering();