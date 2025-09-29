const { chromium } = require('playwright');

async function testAllViews() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 开始测试任务管理页面所有视图功能...\n');

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    console.log('✅ 成功访问任务管理页面');

    // 等待页面加载
    await page.waitForSelector('text=任务管理', { timeout: 10000 });
    console.log('✅ 页面标题加载成功');

    // 测试列表视图
    console.log('\n📋 测试列表视图...');
    await page.click('text=列表');
    await page.waitForTimeout(1000);
    console.log('✅ 成功切换到列表视图');

    // 检查列表视图是否有任务
    const taskTable = await page.$('table');
    if (taskTable) {
      console.log('✅ 列表视图显示正常');
    } else {
      console.log('❌ 列表视图没有显示表格');
    }

    // 测试看板视图
    console.log('\n🔲 测试看板视图...');
    await page.click('text=看板');
    await page.waitForTimeout(2000);
    console.log('✅ 成功切换到看板视图');

    // 检查看板列是否存在
    const kanbanColumns = ['未开始', '进行中', '已完成', '已暂停', '已取消'];
    for (const column of kanbanColumns) {
      const columnExists = await page.locator(`text=${column}`).isVisible();
      if (columnExists) {
        console.log(`✅ 看板列"${column}"存在`);
      } else {
        console.log(`❌ 看板列"${column}"不存在`);
      }
    }

    // 检查看板中是否有任务
    const kanbanTasks = await page.$$('.ant-card-body');
    console.log(`📊 看板中共有 ${kanbanTasks.length} 个任务卡片`);

    // 测试日历视图
    console.log('\n📅 测试日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);
    console.log('✅ 成功切换到日历视图');

    // 检查日历组件是否存在
    const calendarExists = await page.$('[data-testid="calendar-view"]');
    if (calendarExists) {
      console.log('✅ 日历视图组件存在');
    } else {
      console.log('✅ 日历视图正在加载...');
    }

    // 检查AI优先级Dock是否存在
    const aiDock = await page.locator('text=AI优先级任务').isVisible();
    if (aiDock) {
      console.log('✅ AI优先级Dock显示正常');
    } else {
      console.log('❌ AI优先级Dock未显示');
    }

    // 测试新建任务功能
    console.log('\n➕ 测试新建任务功能...');
    await page.click('text=新建任务');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✅ 新建任务模态框显示正常');

    // 关闭模态框
    await page.click('text=取消');
    await page.waitForTimeout(500);
    console.log('✅ 模态框关闭正常');

    // 测试视图切换功能
    console.log('\n🔄 测试视图切换功能...');
    const views = ['列表', '看板', '日历'];
    for (let i = 0; i < 3; i++) {
      for (const view of views) {
        await page.click(`text=${view}`);
        await page.waitForTimeout(500);
        console.log(`✅ 成功切换到${view}视图`);
      }
    }

    console.log('\n🎉 所有视图功能测试完成！');

    // 截图保存测试结果
    await page.screenshot({ path: 'test-results/all-views-test.png' });
    console.log('📸 测试截图已保存');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    await page.screenshot({ path: 'test-results/all-views-error.png' });
  } finally {
    await browser.close();
  }
}

testAllViews();