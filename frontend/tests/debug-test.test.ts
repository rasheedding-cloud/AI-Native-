import { test, expect } from '@playwright/test';

test.describe('战略管理功能测试', () => {
  test.beforeEach(async ({ page }) => {
    // 访问应用首页
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('创建新战略', async ({ page }) => {
    console.log('开始测试创建战略功能...');

    // 点击战略菜单
    await page.click('text=战略管理');
    await page.waitForTimeout(1000);

    // 点击新建战略按钮
    await page.click('button:has-text("新建战略")');
    await page.waitForTimeout(500);

    // 填写战略信息
    await page.fill('input[placeholder*="战略名称"]', '测试战略');
    await page.fill('textarea[placeholder*="战略描述"]', '这是一个测试战略的描述');

    // 点击保存按钮
    await page.click('button:has-text("保存")');
    await page.waitForTimeout(1000);

    // 验证是否创建成功
    await expect(page.locator('text=测试战略')).toBeVisible();
    console.log('战略创建测试完成');
  });

  test('任务页面加载测试', async ({ page }) => {
    console.log('开始测试任务页面加载...');

    // 点击任务管理菜单
    await page.click('text=任务管理');
    await page.waitForTimeout(2000);

    // 检查页面是否正常加载
    await expect(page.locator('h1, h2, h3').first()).toBeVisible();
    console.log('任务页面加载测试完成');
  });
});

test.describe('错误排查测试', () => {
  test('检查控制台错误', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      console.error('页面错误:', error);
    });

    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 测试各个页面
    await page.click('text=任务管理');
    await page.waitForTimeout(2000);

    await page.click('text=战略管理');
    await page.waitForTimeout(2000);

    // 检查是否有错误
    if (consoleErrors.length > 0) {
      console.error('发现控制台错误:', consoleErrors);
    }

    expect(consoleErrors.length).toBe(0);
  });
});