const { chromium } = require('playwright');

async function quickTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 快速测试组件渲染...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 测试看板视图
    await page.click('text=看板');
    await page.waitForTimeout(2000);

    // 检查DOM元素
    const kanbanContent = await page.$('.kanban-tab-content');
    const kanbanBoard = await page.$('.kanban-board-simple');

    console.log('📊 看板Tab内容区域:', kanbanContent ? '✅ 存在' : '❌ 不存在');
    console.log('📊 看板组件:', kanbanBoard ? '✅ 存在' : '❌ 不存在');

    // 测试日历视图
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    const calendarContent = await page.$('.calendar-tab-content');
    console.log('📅 日历Tab内容区域:', calendarContent ? '✅ 存在' : '❌ 不存在');

    // 检查页面源码
    const pageContent = await page.content();
    const hasKanbanContent = pageContent.includes('kanban-tab-content');
    const hasCalendarContent = pageContent.includes('calendar-tab-content');

    console.log('📄 页面源码包含看板内容:', hasKanbanContent ? '✅ 是' : '❌ 否');
    console.log('📄 页面源码包含日历内容:', hasCalendarContent ? '✅ 是' : '❌ 否');

    // 截图
    await page.screenshot({ path: 'test-results/quick-test.png' });

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

quickTest();