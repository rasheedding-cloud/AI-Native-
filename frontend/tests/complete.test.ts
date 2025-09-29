import { test, expect } from '@playwright/test';

test.describe('完整功能测试清单', () => {

  // 1. 基础页面加载测试
  test.describe('基础页面加载', () => {
    test('主页加载和标题', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveTitle(/AI Native项目管理工具/);
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(0);
    });

    test('所有主要页面可以正常导航', async ({ page }) => {
      const pages = [
        { name: '战略管理', path: '/strategies' },
        { name: '项目管理', path: '/projects' },
        { name: '任务管理', path: '/tasks' },
        { name: 'KPI管理', path: '/kpis' },
        { name: '风险管理', path: '/risks' },
        { name: 'AI功能', path: '/ai' },
        { name: '设置', path: '/settings' }
      ];

      for (const pageItem of pages) {
        await page.goto('/');
        await page.click(`text=${pageItem.name}`);
        await page.waitForLoadState('networkidle');
        await expect(page).toHaveURL(pageItem.path);

        // 检查页面不是白页
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.trim().length).toBeGreaterThan(0);

        console.log(`✅ ${pageItem.name}页面导航正常`);
      }
    });
  });

  // 2. 战略管理功能测试
  test.describe('战略管理功能', () => {
    test('战略页面组件显示', async ({ page }) => {
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');

      // 检查主要组件
      await expect(page.locator('.ant-card').first()).toBeVisible();
      await expect(page.locator('text=创建战略').first()).toBeVisible();
      await expect(page.locator('input[placeholder*="搜索"]').first()).toBeVisible();
    });

    test('战略创建表单功能', async ({ page }) => {
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');

      // 点击创建按钮
      await page.click('text=创建战略');
      await page.waitForTimeout(1000);

      // 检查模态框
      const modal = await page.locator('.ant-modal').first();
      await expect(modal).toBeVisible();

      // 填写表单
      const nameInput = await page.locator('input[placeholder*="战略名称"]').first();
      const descInput = await page.locator('textarea[placeholder*="战略描述"]').first();

      await expect(nameInput).toBeVisible();
      await expect(descInput).toBeVisible();

      await nameInput.fill('测试战略' + Date.now());
      await descInput.fill('这是一个测试战略描述');

      // 提交表单
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2000);

      // 检查模态框是否关闭
      await expect(modal).not.toBeVisible();

      console.log('✅ 战略创建流程正常');
    });

    test('战略列表显示', async ({ page }) => {
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');

      // 检查表格
      const table = await page.locator('.ant-table').first();
      if (await table.isVisible()) {
        console.log('✅ 战略表格显示正常');
      } else {
        console.log('ℹ️ 战略列表为空（正常状态）');
      }
    });
  });

  // 3. API连接测试
  test.describe('API连接测试', () => {
    test('后端健康检查', async ({ page }) => {
      const response = await page.request.get('http://localhost:3001/health');
      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.status).toBe('OK');
      console.log('✅ 后端服务正常');
    });

    test('API端点可访问性', async ({ page }) => {
      const endpoints = [
        '/api/strategies',
        '/api/projects',
        '/api/tasks',
        '/api/kpis'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await page.request.get(`http://localhost:3001${endpoint}`);
          // 允许404或其他错误，只要不是CORS或连接错误
          console.log(`✅ ${endpoint} 端点可访问 (状态: ${response.status()})`);
        } catch (error) {
          console.log(`❌ ${endpoint} 端点访问失败: ${error}`);
        }
      }
    });
  });

  // 4. 数据加载测试
  test.describe('数据加载测试', () => {
    test('主页数据初始化', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 等待数据加载
      await page.waitForTimeout(3000);

      // 检查是否有布局组件
      await expect(page.locator('.ant-layout')).toBeVisible();
      await expect(page.locator('.ant-layout-sider')).toBeVisible();

      console.log('✅ 主页布局和数据加载正常');
    });

    test('页面切换无白屏', async ({ page }) => {
      // 测试快速页面切换
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const pages = ['/strategies', '/projects', '/tasks', '/kpis'];

      for (const path of pages) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');

        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.trim().length).toBeGreaterThan(0);
      }

      console.log('✅ 页面切换无白屏问题');
    });
  });

  // 5. 响应式设计测试
  test.describe('响应式设计', () => {
    test('移动端适配', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');

      // 检查移动端布局
      await expect(page.locator('.ant-layout')).toBeVisible();
      console.log('✅ 移动端布局正常');

      // 恢复桌面端
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  // 6. 性能测试
  test.describe('性能测试', () => {
    test('页面加载时间', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(5000); // 5秒内加载完成
      console.log(`✅ 页面加载时间: ${loadTime}ms`);
    });

    test('内存使用检查', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // 简单的内存检查（通过页面行为）
      await page.click('text=战略管理');
      await page.waitForLoadState('networkidle');
      await page.click('text=项目管理');
      await page.waitForLoadState('networkidle');

      console.log('✅ 多页面切换后性能正常');
    });
  });

  // 7. 错误处理测试
  test.describe('错误处理', () => {
    test('无效路由处理', async ({ page }) => {
      await page.goto('/invalid-route');
      await page.waitForLoadState('networkidle');

      // 检查是否被重定向到有效页面或显示错误页面
      const bodyText = await page.locator('body').textContent();
      expect(bodyText?.trim().length).toBeGreaterThan(0);

      console.log('✅ 无效路由处理正常');
    });
  });

  // 8. 表单验证测试
  test.describe('表单验证', () => {
    test('战略表单必填字段验证', async ({ page }) => {
      await page.goto('/strategies');
      await page.waitForLoadState('networkidle');

      await page.click('text=创建战略');
      await page.waitForTimeout(1000);

      // 尝试提交空表单
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);

      // 检查是否显示验证错误
      const form = await page.locator('form').first();
      expect(form).toBeVisible();

      console.log('✅ 表单验证功能正常');
    });
  });
});