const { chromium } = require('playwright');

async function debugKanban() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 调试看板组件...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到看板视图
    await page.click('text=看板');
    await page.waitForTimeout(3000);

    // 检查看板容器
    const kanbanContainer = await page.$('.kanban-board-simple');
    console.log('🎯 看板容器:', kanbanContainer ? '✅ 存在' : '❌ 不存在');

    if (kanbanContainer) {
      // 获取看板容器的HTML内容
      const containerHTML = await kanbanContainer.innerHTML();
      console.log('🎯 容器HTML长度:', containerHTML.length);

      // 检查Row组件
      const row = await page.$('.kanban-board-simple .ant-row');
      console.log('🎯 Ant Row:', row ? '✅ 存在' : '❌ 不存在');

      if (row) {
        // 检查Col组件
        const cols = await page.$$('.kanban-board-simple .ant-col');
        console.log(`🎯 Ant Cols: ${cols.length} 个`);

        // 检查是否有内容
        for (let i = 0; i < cols.length; i++) {
          const col = cols[i];
          const colHTML = await col.innerHTML();
          console.log(`🎯 Col ${i} HTML长度: ${colHTML.length}`);
          console.log(`🎯 Col ${i} 内容预览: ${colHTML.substring(0, 100)}...`);
        }
      }

      // 直接检查是否有列卡片
      const cards = await page.$$('.kanban-board-simple .ant-card');
      console.log(`🎯 卡片数量: ${cards.length}`);

      // 检查看板列
      const kanbanCols = await page.$$('.kanban-board-simple .ant-col');
      console.log(`🎯 看板列数: ${kanbanCols.length}`);

      if (kanbanCols.length === 0) {
        // 可能是渲染延迟，再等一下
        await page.waitForTimeout(5000);
        console.log('🎯 等待5秒后重新检查...');

        const kanbanColsAfter = await page.$$('.kanban-board-simple .ant-col');
        console.log(`🎯 重新检查看板列数: ${kanbanColsAfter.length}`);
      }
    }

    // 检查页面中的所有元素
    const allElements = await page.$$('*');
    console.log(`🎯 页面总元素数: ${allElements.length}`);

    // 查看任务数据
    const taskData = await page.evaluate(() => {
      const tasks = window.__STORE__?.tasks || [];
      return {
        count: tasks.length,
        statuses: [...new Set(tasks.map(t => t.status))],
        firstTask: tasks[0]
      };
    });

    console.log('🎯 任务数据:', taskData);

    // 截图
    await page.screenshot({ path: 'debug-results/kanban-debug.png' });

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugKanban();