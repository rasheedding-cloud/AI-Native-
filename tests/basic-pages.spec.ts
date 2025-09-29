import { test, expect } from '@playwright/test';

// 定义要测试的所有页面路由
const pages = [
  { path: '/', name: 'Dashboard' },
  { path: '/strategies', name: 'Strategies' },
  { path: '/initiatives', name: 'Initiatives' },
  { path: '/projects', name: 'Projects' },
  { path: '/tasks', name: 'Tasks' },
  { path: '/kpis', name: 'KPIs' },
  { path: '/risks', name: 'Risk Management' },
  { path: '/ai', name: 'AI Features' },
  { path: '/settings', name: 'Settings' },
];

test.describe('基本页面加载测试', () => {
  pages.forEach(pageConfig => {
    test(`页面加载测试 - ${pageConfig.name}`, async ({ page }) => {
      console.log(`开始测试页面: ${pageConfig.name} (${pageConfig.path})`);
      
      // 监听控制台错误
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const errorMsg = `控制台错误: ${msg.text()}`;
          consoleErrors.push(errorMsg);
          console.error(errorMsg);
        }
      });

      // 监听页面错误
      const pageErrors: string[] = [];
      page.on('pageerror', error => {
        const errorMsg = `页面错误: ${error.message}`;
        pageErrors.push(errorMsg);
        console.error(errorMsg);
      });

      // 导航到页面
      await page.goto(pageConfig.path);
      
      // 等待页面加载完成
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // 检查页面标题
      const title = await page.title();
      console.log(`页面 ${pageConfig.name} 标题: "${title}"`);

      // 检查页面是否是白页
      const body = await page.locator('body');
      const bodyText = await body.textContent();
      const bodyHasContent = bodyText && bodyText.trim().length > 0;
      
      console.log(`页面 ${pageConfig.name} 内容长度: ${bodyText?.length || 0}`);
      console.log(`页面 ${pageConfig.name} 有内容: ${bodyHasContent}`);

      // 检查是否有主要内容元素
      const mainContent = await page.locator('#root').count();
      console.log(`页面 ${pageConfig.name} #root 元素存在: ${mainContent > 0}`);

      // 检查是否有React应用
      const reactApp = await page.locator('[data-reactroot], .app, .ant-app').count();
      console.log(`页面 ${pageConfig.name} React应用元素: ${reactApp > 0}`);

      // 截屏保存
      await page.screenshot({ 
        path: `test-results/${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}-basic-screenshot.png`,
        fullPage: true 
      });

      // 基本断言
      expect(bodyHasContent, `页面 ${pageConfig.name} 是白页`).toBe(true);
      expect(mainContent, `页面 ${pageConfig.name} 缺少 #root 元素`).toBeGreaterThan(0);
      expect(pageErrors.length, `页面 ${pageConfig.name} 有 ${pageErrors.length} 个页面错误`).toBe(0);
      
      // 如果有控制台错误，记录但不失败测试
      if (consoleErrors.length > 0) {
        console.warn(`页面 ${pageConfig.name} 有 ${consoleErrors.length} 个控制台错误`);
      }

      console.log(`页面 ${pageConfig.name} 测试完成`);
    });
  });
});

test.describe('应用健康检查', () => {
  test('首页基本功能检查', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 检查页面基本结构
    const body = await page.locator('body');
    const bodyText = await body.textContent();
    
    expect(bodyText?.trim().length).toBeGreaterThan(0, '首页是白页');
    
    // 检查是否有JavaScript错误
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // 等待一段时间收集错误
    await page.waitForTimeout(2000);
    
    console.log(`首页控制台错误数量: ${consoleErrors.length}`);
    if (consoleErrors.length > 0) {
      console.warn('控制台错误:', consoleErrors);
    }
  });

  test('页面导航测试', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 尝试点击一些链接来测试导航
    const links = await page.locator('a').all();
    console.log(`发现 ${links.length} 个链接`);

    // 测试前5个链接
    for (let i = 0; i < Math.min(links.length, 5); i++) {
      const link = links[i];
      const isVisible = await link.isVisible();
      const href = await link.getAttribute('href');
      
      if (isVisible && href && href.startsWith('/')) {
        console.log(`测试链接: ${href}`);
        
        // 点击链接
        await link.click();
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        // 检查新页面是否正常加载
        const bodyText = await page.locator('body').textContent();
        expect(bodyText?.trim().length).toBeGreaterThan(0, `导航到 ${href} 后页面是白页`);
        
        // 返回首页
        await page.goto('/');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
      }
    }
  });
});