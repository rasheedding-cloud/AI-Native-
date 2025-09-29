const { chromium } = require('playwright');

async function simpleWeekTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 简单周视图测试...\n');

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

    // 检查初始状态
    const calendarContent = await page.$('.calendar-tab-content');
    console.log('日历容器:', calendarContent ? '✅ 存在' : '❌ 不存在');

    // 切换到周视图
    console.log('切换到周视图...');
    await page.click('text=周');
    await page.waitForTimeout(3000);

    // 检查页面内容变化
    const pageContentAfter = await page.content();
    console.log('页面包含月日历:', pageContentAfter.includes('ant-calendar') ? '✅ 是' : '❌ 否');
    console.log('页面包含周视图:', pageContentAfter.includes('week-view') ? '✅ 是' : '❌ 否');

    // 查找所有时间相关的元素
    const timeElements = await page.$$eval(
      'div',
      divs => divs.filter(div => {
        const text = div.textContent || '';
        return text.includes(':') && !text.includes('优先级');
      }).map(div => div.textContent?.substring(0, 20))
    );
    console.log('发现的时间元素:', timeElements.slice(0, 10));

    // 查找包含09:00等时间格式的元素
    const timeFormatElements = await page.$$eval(
      'div',
      divs => divs.filter(div => {
        const text = div.textContent || '';
        return text.match(/\d{2}:\d{2}/);
      }).map(div => div.textContent?.substring(0, 10))
    );
    console.log('发现的时间格式元素:', timeFormatElements.slice(0, 10));

    // 截图
    await page.screenshot({ path: 'simple-test-results/week-view-simple.png' });

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

simpleWeekTest();