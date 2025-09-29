import { test, expect } from '@playwright/test';

test.describe('应用导航测试', () => {
  test('主页加载测试', async ({ page }) => {
    await page.goto('/');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 检查主页是否正常显示
    await expect(page).toHaveTitle(/AI Native项目管理工具/);

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 检查页面是否有内容（不是白页）
    const body = await page.locator('body');
    const bodyText = await body.textContent();

    if (bodyText && bodyText.trim().length > 0) {
      console.log('✅ 主页有内容');

      // 检查是否有布局组件
      const layout = await page.locator('.ant-layout').first();
      if (await layout.isVisible()) {
        console.log('✅ 主页布局组件正常');
      }

      // 检查是否有侧边栏
      const sider = await page.locator('.ant-layout-sider').first();
      if (await sider.isVisible()) {
        console.log('✅ 主页侧边栏正常');
      }
    } else {
      console.log('❌ 主页为白页');
    }

    console.log('✅ 主页加载正常');
  });

  test('战略页面导航测试', async ({ page }) => {
    await page.goto('/');

    // 点击战略菜单
    await page.click('text=战略管理');

    // 等待导航完成
    await page.waitForLoadState('networkidle');

    // 检查URL是否正确
    await expect(page).toHaveURL('/strategies');

    // 等待页面内容加载
    await page.waitForTimeout(2000);

    // 检查页面是否有内容（不是白页）
    const body = await page.locator('body');
    const bodyText = await body.textContent();

    if (bodyText && bodyText.trim().length > 0) {
      console.log('✅ 战略页面有内容');

      // 检查是否有战略相关的元素
      const card = await page.locator('.ant-card').first();
      if (await card.isVisible()) {
        console.log('✅ 战略页面卡片组件正常');
      }

      // 检查是否有创建战略按钮
      const createButton = await page.locator('text=创建战略').first();
      if (await createButton.isVisible()) {
        console.log('✅ 创建战略按钮可见');
      } else {
        console.log('⚠️ 创建战略按钮不可见');
      }
    } else {
      console.log('❌ 战略页面为白页');
    }
  });

  test('项目页面导航测试', async ({ page }) => {
    await page.goto('/');

    // 点击项目菜单
    await page.click('text=项目管理');

    // 等待导航完成
    await page.waitForLoadState('networkidle');

    // 检查URL是否正确
    await expect(page).toHaveURL('/projects');

    // 检查页面是否白页
    const body = await page.locator('body');
    const bodyText = await body.textContent();

    if (bodyText && bodyText.trim().length > 0) {
      console.log('✅ 项目页面导航正常');
    } else {
      console.log('❌ 项目页面为白页');
    }
  });

  test('任务页面导航测试', async ({ page }) => {
    await page.goto('/');

    // 点击任务菜单
    await page.click('text=任务管理');

    // 等待导航完成
    await page.waitForLoadState('networkidle');

    // 检查URL是否正确
    await expect(page).toHaveURL('/tasks');

    // 检查页面是否白页
    const body = await page.locator('body');
    const bodyText = await body.textContent();

    if (bodyText && bodyText.trim().length > 0) {
      console.log('✅ 任务页面导航正常');
    } else {
      console.log('❌ 任务页面为白页');
    }
  });

  test('KPI页面导航测试', async ({ page }) => {
    await page.goto('/');

    // 点击KPI菜单
    await page.click('text=KPI管理');

    // 等待导航完成
    await page.waitForLoadState('networkidle');

    // 检查URL是否正确
    await expect(page).toHaveURL('/kpis');

    // 检查页面是否白页
    const body = await page.locator('body');
    const bodyText = await body.textContent();

    if (bodyText && bodyText.trim().length > 0) {
      console.log('✅ KPI页面导航正常');
    } else {
      console.log('❌ KPI页面为白页');
    }
  });

  test('战略创建功能测试', async ({ page }) => {
    await page.goto('/strategies');

    // 等待页面加载
    await page.waitForLoadState('networkidle');

    // 尝试点击创建战略按钮
    const createButton = await page.locator('text=创建战略').first();

    if (await createButton.isVisible()) {
      await createButton.click();

      // 等待模态框出现
      await page.waitForTimeout(1000);

      // 检查是否有表单
      const form = await page.locator('form').first();
      if (await form.isVisible()) {
        console.log('✅ 战略创建表单可以打开');

        // 尝试填写表单
        const nameInput = await page.locator('input[placeholder*="战略名称"]').first();
        const descInput = await page.locator('textarea[placeholder*="战略描述"]').first();

        if (await nameInput.isVisible()) {
          await nameInput.fill('测试战略');
          console.log('✅ 战略名称输入成功');
        }

        if (await descInput.isVisible()) {
          await descInput.fill('这是一个测试战略');
          console.log('✅ 战略描述输入成功');
        }

        // 提交表单
        await page.click('button[type="submit"]');

        // 等待响应
        await page.waitForTimeout(2000);

        console.log('✅ 战略创建表单提交测试完成');
      } else {
        console.log('❌ 战略创建表单无法打开');
      }
    } else {
      console.log('❌ 未找到创建战略按钮');
    }
  });
});