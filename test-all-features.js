const { chromium } = require('playwright');

async function testAllFeatures() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 开始全面测试任务管理功能...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📋 === 测试列表视图 ===');
    // 检查列表视图
    const listTable = await page.$('.ant-table');
    console.log('📋 列表表格:', listTable ? '✅ 存在' : '❌ 不存在');

    if (listTable) {
      const rows = await page.$$('.ant-table-tbody tr');
      console.log(`📋 任务行数: ${rows.length}`);

      // 检查任务数据
      const firstRow = await page.$('.ant-table-tbody tr:first-child');
      if (firstRow) {
        const rowText = await firstRow.textContent();
        console.log(`📋 首行内容: ${rowText?.substring(0, 50)}...`);
      }
    }

    console.log('\n🎯 === 测试看板视图 ===');
    // 测试看板视图
    await page.click('text=看板');
    await page.waitForTimeout(2000);

    const kanbanBoard = await page.$('.kanban-board-simple');
    console.log('🎯 看板容器:', kanbanBoard ? '✅ 存在' : '❌ 不存在');

    if (kanbanBoard) {
      // 检查看板列
      const columns = await page.$$('.ant-card-body > .ant-row > .ant-col');
      console.log(`🎯 看板列数: ${columns.length}`);

      // 检查每列的任务
      for (let i = 0; i < columns.length; i++) {
        const column = columns[i];
        const columnTitle = await column.$eval('.ant-card-head-title', el => el.textContent()).catch(() => '未知');
        const taskCards = await column.$$('.ant-card:last-child .ant-card');
        console.log(`🎯 ${columnTitle}: ${taskCards.length} 个任务`);
      }

      // 测试新建任务按钮
      const newTaskBtn = await page.$('button:has-text("新建任务")');
      if (newTaskBtn) {
        console.log('🎯 新建任务按钮: ✅ 存在');
        await newTaskBtn.click();
        await page.waitForTimeout(1000);

        // 检查模态框
        const modal = await page.$('.ant-modal');
        console.log('🎯 新建任务模态框:', modal ? '✅ 存在' : '❌ 不存在');

        if (modal) {
          await page.click('.ant-modal-close');
          await page.waitForTimeout(500);
        }
      }
    }

    console.log('\n📅 === 测试日历视图 ===');
    // 测试日历视图
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    const calendarContent = await page.$('.calendar-tab-content');
    console.log('📅 日历容器:', calendarContent ? '✅ 存在' : '❌ 不存在');

    if (calendarContent) {
      // 检查日历组件
      const calendarView = await page.$('calendar');
      console.log('📅 日历组件:', calendarView ? '✅ 存在' : '❌ 不存在');

      // 检查AI优先级停靠栏
      const aiDock = await page.$('.ai-priority-dock');
      console.log('📅 AI优先级停靠栏:', aiDock ? '✅ 存在' : '❌ 不存在');

      // 检查视图切换按钮
      const viewButtons = await page.$$('.ant-radio-button-wrapper');
      console.log(`📅 视图切换按钮: ${viewButtons.length} 个`);

      // 测试日期选择
      const datePickers = await page.$$('.ant-picker');
      console.log(`📅 日期选择器: ${datePickers.length} 个`);
    }

    console.log('\n✅ === 测试任务操作 ===');
    // 回到列表视图测试任务操作
    await page.click('text=列表');
    await page.waitForTimeout(1000);

    // 测试查看任务
    const viewButtons = await page.$$('button:has-text("查看")');
    if (viewButtons.length > 0) {
      console.log('✅ 查看按钮: ✅ 存在');
      await viewButtons[0].click();
      await page.waitForTimeout(1000);

      const modal = await page.$('.ant-modal');
      console.log('✅ 任务详情模态框:', modal ? '✅ 存在' : '❌ 不存在');

      if (modal) {
        await page.click('.ant-modal-close');
        await page.waitForTimeout(500);
      }
    }

    // 截图
    await page.screenshot({ path: 'test-results/all-features-test.png' });
    console.log('\n🎊 所有功能测试完成！截图已保存');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testAllFeatures();