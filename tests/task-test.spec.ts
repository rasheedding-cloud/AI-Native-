import { test, expect } from '@playwright/test';

test.describe('任务管理功能测试', () => {
  test('任务创建功能', async ({ page }) => {
    // 导航到任务页面
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 检查页面标题
    await expect(page.getByRole('main').getByText('任务管理')).toBeVisible();

    // 点击新建任务按钮
    await page.click('button:has-text("新建任务")');

    // 等待模态框出现
    await page.waitForSelector('.ant-modal', { state: 'visible' });

    // 填写表单
    await page.fill('input[placeholder="请输入任务名称"]', '测试任务创建');
    await page.fill('textarea[placeholder="请输入任务描述"]', '这是一个通过自动化测试创建的任务');

    // 选择项目（如果有项目的话）
    const projectSelect = page.locator('.ant-select-selector').first();
    if (await projectSelect.isVisible()) {
      await projectSelect.click();
      await page.waitForTimeout(500);
      const firstOption = page.locator('.ant-select-item-option').first();
      if (await firstOption.isVisible()) {
        await firstOption.click();
      }
    }

    // 填写负责人
    await page.fill('input[placeholder="请输入负责人"]', '自动化测试');

    // 选择优先级
    await page.click('input[placeholder="请选择优先级"]');
    await page.waitForTimeout(500);
    await page.click('text=中');

    // 选择状态
    await page.click('input[placeholder="请选择状态"]');
    await page.waitForTimeout(500);
    await page.click('text=未开始');

    // 提交表单
    await page.click('button:has-text("创建")');

    // 等待模态框关闭
    await page.waitForSelector('.ant-modal', { state: 'hidden', timeout: 10000 });

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 等待数据重新加载
    await page.waitForTimeout(1000);

    // 验证新创建的任务是否在列表中
    const taskText = await page.locator('text=测试任务创建').isVisible();
    expect(taskText).toBe(true);

    console.log('任务创建测试通过');
  });

  test('任务页面加载测试', async ({ page }) => {
    // 导航到任务页面
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 检查页面标题
    await expect(page.getByRole('main').getByText('任务管理')).toBeVisible();

    // 检查新建任务按钮是否存在
    const createButton = page.locator('button:has-text("新建任务")');
    await expect(createButton).toBeVisible();

    // 检查表格是否加载
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 5000 });

    console.log('任务页面加载测试通过');
  });
});