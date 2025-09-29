import { test, expect } from '@playwright/test';

test.describe('战略管理功能测试', () => {
  test('战略创建功能', async ({ page }) => {
    // 导航到战略页面
    await page.goto('/strategies');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 点击创建战略按钮
    await page.click('button:has-text("创建战略")');

    // 等待模态框出现
    await page.waitForSelector('.ant-modal', { state: 'visible' });

    // 填写表单
    await page.fill('input[placeholder="请输入战略名称"]', '测试战略创建');
    await page.fill('textarea[placeholder="请输入战略描述"]', '这是一个通过自动化测试创建的战略');

    // 提交表单
    await page.click('button:has-text("创建")');

    // 等待模态框关闭
    await page.waitForSelector('.ant-modal', { state: 'hidden', timeout: 10000 });

    // 验证成功消息
    await expect(page.locator('.ant-message-success')).toBeVisible({ timeout: 5000 });

    // 等待数据重新加载
    await page.waitForTimeout(1000);

    // 验证新创建的战略是否在列表中
    const strategyText = await page.locator('text=测试战略创建').isVisible();
    expect(strategyText).toBe(true);

    console.log('战略创建测试通过');
  });
});