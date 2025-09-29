import { test, expect } from '@playwright/test';

test.describe('战略页面调试测试', () => {
  test('检查页面结构', async ({ page }) => {
    // 导航到战略页面
    await page.goto('/strategies');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 获取页面HTML结构
    const pageContent = await page.content();
    console.log('页面标题:', await page.title());

    // 检查是否有任何包含"战略"的文本
    const strategyElements = page.locator('text=/战略/');
    const count = await strategyElements.count();
    console.log('包含"战略"的元素数量:', count);

    // 输出所有包含"战略"的元素的文本
    for (let i = 0; i < count; i++) {
      const text = await strategyElements.nth(i).textContent();
      console.log(`元素 ${i + 1}:`, text);
    }

    // 检查页面的基本结构
    const body = await page.locator('body').textContent();
    console.log('页面body内容长度:', body?.length || 0);

    // 简单检查页面是否加载成功
    await expect(page).toHaveURL(/strategies/);
  });

  test('检查按钮元素', async ({ page }) => {
    await page.goto('/strategies');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 查找所有按钮
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    console.log('按钮数量:', buttonCount);

    // 查找包含"创建"的按钮
    const createButtons = page.locator('button:has-text("创建")');
    const createButtonCount = await createButtons.count();
    console.log('包含"创建"的按钮数量:', createButtonCount);

    for (let i = 0; i < createButtonCount; i++) {
      const buttonText = await createButtons.nth(i).textContent();
      console.log(`创建按钮 ${i + 1}:`, buttonText);
    }
  });
});