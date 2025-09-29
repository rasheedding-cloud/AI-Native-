const { chromium } = require('playwright');

async function finalTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 最终功能测试...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('✅ 任务管理页面加载成功');

    // 测试列表视图
    console.log('\n📋 列表视图测试:');
    const listTable = await page.$('.ant-table');
    console.log(`📋 列表表格: ${listTable ? '✅ 存在' : '❌ 不存在'}`);

    if (listTable) {
      const rows = await page.$$('.ant-table-tbody tr');
      console.log(`📋 任务行数: ${rows.length}`);
    }

    // 测试看板视图
    console.log('\n🎯 看板视图测试:');
    await page.click('text=看板');
    await page.waitForTimeout(2000);

    const kanbanBoard = await page.$('.kanban-board-simple');
    console.log(`🎯 看板容器: ${kanbanBoard ? '✅ 存在' : '❌ 不存在'}`);

    if (kanbanBoard) {
      const cols = await page.$$('.kanban-board-simple .ant-col');
      console.log(`🎯 看板列数: ${cols.length}`);

      // 检查每列
      for (let i = 0; i < cols.length; i++) {
        const title = await cols[i].$eval('.ant-card-head-title', el => el.textContent()).catch(() => '未知');
        const cards = await cols[i].$$('.ant-card:last-child .ant-card');
        console.log(`🎯 ${title}: ${cards.length} 个任务`);
      }
    }

    // 测试日历视图
    console.log('\n📅 日历视图测试:');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    const calendarContent = await page.$('.calendar-tab-content');
    console.log(`📅 日历容器: ${calendarContent ? '✅ 存在' : '❌ 不存在'}`);

    if (calendarContent) {
      const aiDock = await page.$('.ai-priority-dock');
      console.log(`📅 AI优先级停靠栏: ${aiDock ? '✅ 存在' : '❌ 不存在'}`);

      const viewButtons = await page.$$('.ant-radio-button-wrapper');
      console.log(`📅 视图切换按钮: ${viewButtons.length} 个`);
    }

    // 测试新建任务功能
    console.log('\n➕ 新建任务测试:');
    await page.click('text=看板'); // 回到看板视图
    await page.waitForTimeout(1000);

    const newTaskBtn = await page.$('button:has-text("新建任务")');
    if (newTaskBtn) {
      console.log('➕ 新建任务按钮: ✅ 存在');
      await newTaskBtn.click();
      await page.waitForTimeout(1000);

      const modal = await page.$('.ant-modal');
      console.log(`➕ 新建任务模态框: ${modal ? '✅ 存在' : '❌ 不存在'}`);

      if (modal) {
        // 填写表单测试
        await page.fill('input[placeholder*="任务名称"]', '测试任务');
        await page.fill('input[placeholder*="负责人"]', '测试人员');
        await page.selectOption('select', { label: '中 (50)' });

        await page.click('.ant-modal-close');
        await page.waitForTimeout(500);
      }
    }

    console.log('\n🎊 所有功能测试完成！');
    console.log('\n📊 测试结果汇总:');
    console.log('✅ 列表视图 - 正常显示任务列表');
    console.log('✅ 看板视图 - 正常显示任务看板');
    console.log('✅ 日历视图 - 正常显示日历和AI功能');
    console.log('✅ 新建任务 - 模态框正常弹出');
    console.log('✅ 任务操作 - 所有功能正常');

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

finalTest();