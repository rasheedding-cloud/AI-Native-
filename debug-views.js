const { chromium } = require('playwright');

async function debugViews() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 开始调试看板和日历视图...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`浏览器控制台: ${msg.type()}: ${msg.text()}`);
    });

    page.on('pageerror', error => {
      console.log(`页面错误: ${error.message}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    console.log('✅ 成功访问任务管理页面');

    // 等待页面加载
    await page.waitForSelector('text=任务管理', { timeout: 10000 });
    console.log('✅ 页面标题加载成功');

    // 检查tasks数据
    const tasksData = await page.evaluate(() => {
      return window.__STORE__?.tasks || [];
    });
    console.log('📋 Store中的任务数据:', tasksData);

    // 测试看板视图
    console.log('\n🔲 检查看板视图...');
    await page.click('text=看板');
    await page.waitForTimeout(2000);

    // 检查看板组件是否渲染
    const kanbanBoard = await page.$('.kanban-board');
    if (kanbanBoard) {
      console.log('✅ 看板组件已渲染');
    } else {
      console.log('❌ 看板组件未渲染');
    }

    // 检查看板列
    const columns = await page.$$eval('.kanban-column', columns => {
      return columns.map(col => col.textContent?.trim() || '');
    });
    console.log('📊 看板列:', columns);

    // 检查任务卡片
    const taskCards = await page.$$('.task-card');
    console.log('📋 任务卡片数量:', taskCards.length);

    // 测试日历视图
    console.log('\n📅 检查日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 检查日历组件是否渲染
    const calendarView = await page.$('.calendar-view');
    if (calendarView) {
      console.log('✅ 日历组件已渲染');
    } else {
      console.log('❌ 日历组件未渲染');
    }

    // 检查是否有"功能开发中"的提示
    const developingAlert = await page.$('text=功能开发中');
    if (developingAlert) {
      console.log('❌ 发现"功能开发中"提示');
    } else {
      console.log('✅ 没有"功能开发中"提示');
    }

    // 检查AI优先级Dock
    const aiDock = await page.$('text=AI优先级任务');
    if (aiDock) {
      console.log('✅ AI优先级Dock已显示');
    } else {
      console.log('❌ AI优先级Dock未显示');
    }

    // 截图
    await page.screenshot({ path: 'debug-results/views-debug.png' });
    console.log('📸 调试截图已保存');

  } catch (error) {
    console.error('❌ 调试失败:', error);
    await page.screenshot({ path: 'debug-results/views-debug-error.png' });
  } finally {
    await browser.close();
  }
}

debugViews();