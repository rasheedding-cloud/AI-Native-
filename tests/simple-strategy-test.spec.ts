import { test, expect } from '@playwright/test';

test.describe('战略页面基本功能测试', () => {
  test('页面加载和按钮测试', async ({ page }) => {
    // 导航到战略页面
    await page.goto('/strategies');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 检查页面是否加载成功（验证URL）
    await expect(page).toHaveURL(/strategies/);

    // 检查页面是否有内容
    const bodyContent = await page.locator('body').textContent();
    await expect(bodyContent?.length || 0).toBeGreaterThan(0);

    // 检查创建战略按钮是否存在
    const createButton = page.locator('button:has-text("创建战略")');
    await expect(createButton).toBeVisible();

    // 点击创建战略按钮
    await createButton.click();

    // 等待模态框出现
    await page.waitForSelector('.ant-modal', { state: 'visible' });

    // 检查模态框标题
    await expect(page.locator('.ant-modal-title:has-text("创建战略")')).toBeVisible();

    // 填写战略名称
    await page.fill('input[placeholder="请输入战略名称"]', '简单测试战略');

    // 关闭模态框
    await page.click('.ant-modal-close');

    // 等待模态框关闭
    await page.waitForSelector('.ant-modal', { state: 'hidden' });

    console.log('战略页面基本功能测试通过');
  });
});