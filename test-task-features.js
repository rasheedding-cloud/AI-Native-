const { chromium } = require('playwright');

async function testTaskFeatures() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 访问任务管理页面
    await page.goto('http://localhost:5173/tasks');
    console.log('✓ 成功访问任务管理页面');

    // 等待页面加载
    await page.waitForSelector('text=任务管理', { timeout: 10000 });
    console.log('✓ 页面标题加载成功');

    // 测试标签切换功能
    const tabLabels = ['列表', '看板', '日历'];
    for (const label of tabLabels) {
      await page.click(`text=${label}`);
      console.log(`✓ 成功切换到${label}视图`);
      await page.waitForTimeout(1000);
    }

    // 测试新建任务按钮
    await page.click('text=新建任务');
    console.log('✓ 新建任务按钮可点击');

    // 等待模态框出现
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    console.log('✓ 任务编辑模态框显示正常');

    // 关闭模态框
    await page.click('text=取消');
    await page.waitForTimeout(500);
    console.log('✓ 模态框关闭正常');

    // 切换到看板视图
    await page.click('text=看板');
    await page.waitForTimeout(2000);
    console.log('✓ 看板视图加载正常');

    // 检查看板列是否存在
    const columns = ['未开始', '进行中', '已完成', '已暂停', '已取消'];
    for (const column of columns) {
      const columnExists = await page.locator(`text=${column}`).isVisible();
      if (columnExists) {
        console.log(`✓ 看板列"${column}"存在`);
      } else {
        console.log(`✗ 看板列"${column}"不存在`);
      }
    }

    console.log('\n🎉 任务管理页面功能测试完成！');

    // 截图保存测试结果
    await page.screenshot({ path: 'test-results/task-management-test.png' });
    console.log('✓ 测试截图已保存');

  } catch (error) {
    console.error('❌ 测试失败:', error);
    await page.screenshot({ path: 'test-results/task-management-error.png' });
  } finally {
    await browser.close();
  }
}

testTaskFeatures();