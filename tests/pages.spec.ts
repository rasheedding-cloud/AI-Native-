import { test, expect } from '@playwright/test';

// 定义要测试的所有页面路由
const pages = [
  { path: '/', name: 'Dashboard', expectedTitle: '仪表盘' },
  { path: '/strategies', name: 'Strategies', expectedTitle: '战略管理' },
  { path: '/initiatives', name: 'Initiatives', expectedTitle: '举措管理' },
  { path: '/projects', name: 'Projects', expectedTitle: '项目管理' },
  { path: '/tasks', name: 'Tasks', expectedTitle: '任务管理' },
  { path: '/kpis', name: 'KPIs', expectedTitle: 'KPI管理' },
  { path: '/risks', name: 'Risk Management', expectedTitle: '风险管理' },
  { path: '/ai', name: 'AI Features', expectedTitle: 'AI功能' },
  { path: '/settings', name: 'Settings', expectedTitle: '设置' },
];

pages.forEach(pageConfig => {
  test.describe(`页面测试: ${pageConfig.name}`, () => {
    test.beforeEach(async ({ page }) => {
      // 监听控制台错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.error(`控制台错误 [${pageConfig.path}]:`, msg.text());
        }
      });

      // 监听页面错误
      page.on('pageerror', error => {
        console.error(`页面错误 [${pageConfig.path}]:`, error.message);
      });
    });

    test(`页面加载测试 - ${pageConfig.name}`, async ({ page }) => {
      const startTime = Date.now();

      // 导航到页面
      await page.goto(pageConfig.path);

      // 等待页面加载完成
      await page.waitForLoadState('networkidle');
      await page.waitForLoadState('domcontentloaded');

      const loadTime = Date.now() - startTime;
      console.log(`页面 ${pageConfig.name} 加载时间: ${loadTime}ms`);

      // 检查页面标题
      const title = await page.title();
      expect(title).toBeTruthy();
      console.log(`页面 ${pageConfig.name} 标题: "${title}"`);

      // 检查页面是否是白页
      const body = await page.locator('body');
      const bodyText = await body.textContent();
      expect(bodyText).toBeTruthy();
      expect(bodyText?.trim()).not.toBe('');
      console.log(`页面 ${pageConfig.name} 内容长度: ${bodyText?.length || 0}`);

      // 检查是否有主要内容元素
      const mainContent = await page.locator('main, .app, #root, [data-testid]').first();
      const mainContentExists = await mainContent.count();
      expect(mainContentExists).toBeGreaterThan(0);
      console.log(`页面 ${pageConfig.name} 主要内容元素: ${mainContentExists}`);

      // 检查布局结构
      const layout = await page.locator('.layout, .container, .app-container').first();
      const layoutExists = await layout.count();
      if (layoutExists > 0) {
        console.log(`页面 ${pageConfig.name} 布局结构正常`);
      }

      // 检查导航菜单
      const nav = await page.locator('nav, .navigation, .sidebar, .menu').first();
      const navExists = await nav.count();
      if (navExists > 0) {
        console.log(`页面 ${pageConfig.name} 导航菜单存在`);
      }

      // 检查是否有错误信息
      const errorElements = await page.locator('.error, .alert-error, [role="alert"]').count();
      if (errorElements > 0) {
        const errorText = await page.locator('.error, .alert-error, [role="alert"]').first().textContent();
        console.warn(`页面 ${pageConfig.name} 发现错误信息: "${errorText}"`);
      }

      // 截屏保存
      await page.screenshot({
        path: `test-results/${pageConfig.name.toLowerCase().replace(/\s+/g, '-')}-screenshot.png`,
        fullPage: true
      });

      // 记录页面性能信息
      const performanceMetrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: navigation.responseEnd - navigation.fetchStart,
        };
      });

      console.log(`页面 ${pageConfig.name} 性能指标:`, performanceMetrics);

      // 验证页面加载时间合理（不超过10秒）
      expect(loadTime).toBeLessThan(10000);
    });

    test(`响应式布局测试 - ${pageConfig.name}`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // 测试桌面视图
      await page.setViewportSize({ width: 1920, height: 1080 });
      const desktopLayout = await page.locator('body').boundingBox();
      expect(desktopLayout).toBeTruthy();
      expect(desktopLayout?.width).toBeGreaterThan(0);

      // 测试平板视图
      await page.setViewportSize({ width: 768, height: 1024 });
      const tabletLayout = await page.locator('body').boundingBox();
      expect(tabletLayout).toBeTruthy();
      expect(tabletLayout?.width).toBeGreaterThan(0);

      // 测试手机视图
      await page.setViewportSize({ width: 375, height: 667 });
      const mobileLayout = await page.locator('body').boundingBox();
      expect(mobileLayout).toBeTruthy();
      expect(mobileLayout?.width).toBeGreaterThan(0);

      console.log(`页面 ${pageConfig.name} 响应式布局测试通过`);
    });

    test(`链接和按钮测试 - ${pageConfig.name}`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // 检查页面内的链接是否可点击
      const links = await page.locator('a').all();
      for (let i = 0; i < Math.min(links.length, 10); i++) {
        const link = links[i];
        const isVisible = await link.isVisible();
        if (isVisible) {
          const href = await link.getAttribute('href');
          if (href && !href.startsWith('http') && !href.startsWith('#')) {
            console.log(`发现内部链接: ${href}`);
          }
        }
      }

      // 检查按钮是否可点击
      const buttons = await page.locator('button').all();
      const visibleButtons = buttons.filter(async btn => await btn.isVisible());
      console.log(`页面 ${pageConfig.name} 发现 ${visibleButtons.length} 个可见按钮`);

      // 至少应该有一些交互元素
      const interactiveElements = await page.locator('button, a, input, select, textarea').count();
      expect(interactiveElements).toBeGreaterThan(0);
      console.log(`页面 ${pageConfig.name} 交互元素数量: ${interactiveElements}`);
    });

    test(`无障碍性测试 - ${pageConfig.name}`, async ({ page }) => {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      // 检查是否有适当的标题层级
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      console.log(`页面 ${pageConfig.name} 标题数量: ${headings.length}`);

      // 检查图片alt属性
      const images = await page.locator('img').all();
      const imagesWithoutAlt = images.filter(async img => {
        const alt = await img.getAttribute('alt');
        return alt === null || alt === '';
      });

      if (imagesWithoutAlt.length > 0) {
        console.warn(`页面 ${pageConfig.name} 有 ${imagesWithoutAlt.length} 个图片缺少alt属性`);
      }

      // 检查表单标签
      const formInputs = await page.locator('input, textarea, select').all();
      const inputsWithoutLabels = formInputs.filter(async input => {
        const id = await input.getAttribute('id');
        if (id) {
          const label = await page.locator(`label[for="${id}"]`).count();
          return label === 0;
        }
        return true;
      });

      if (inputsWithoutLabels.length > 0) {
        console.warn(`页面 ${pageConfig.name} 有 ${inputsWithoutLabels.length} 个表单元素缺少标签`);
      }
    });
  });
});

// 全局测试：页面间导航
test.describe('页面间导航测试', () => {
  test('所有页面间的导航链接', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 测试从首页导航到其他页面
    const navigationLinks = await page.locator('nav a, .sidebar a, .menu a').all();
    
    for (const link of navigationLinks) {
      const isVisible = await link.isVisible();
      if (isVisible) {
        const href = await link.getAttribute('href');
        if (href && href.startsWith('/')) {
          console.log(`测试导航链接: ${href}`);
          
          // 点击链接
          await link.click();
          await page.waitForLoadState('networkidle');
          
          // 验证页面正常加载
          const bodyText = await page.locator('body').textContent();
          expect(bodyText).toBeTruthy();
          expect(bodyText?.trim()).not.toBe('');
          
          // 返回首页
          await page.goto('/');
          await page.waitForLoadState('networkidle');
        }
      }
    }
  });
});

// 性能测试
test.describe('性能测试', () => {
  test('所有页面加载性能', async ({ page }) => {
    const performanceResults = [];

    for (const pageConfig of pages) {
      await page.goto(pageConfig.path);
      await page.waitForLoadState('networkidle');

      const metrics = await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          firstPaint: navigation.responseEnd - navigation.fetchStart,
          totalTime: navigation.loadEventEnd - navigation.fetchStart,
        };
      });

      performanceResults.push({
        page: pageConfig.name,
        ...metrics,
      });

      console.log(`页面 ${pageConfig.name} 性能:`, metrics);
    }

    // 验证所有页面加载时间合理
    performanceResults.forEach(result => {
      expect(result.totalTime).toBeLessThan(10000, `页面 ${result.page} 加载时间过长`);
    });

    // 输出性能报告
    console.log('=== 性能测试报告 ===');
    performanceResults.forEach(result => {
      console.log(`${result.page}: ${result.totalTime}ms (DOM: ${result.domContentLoaded}ms, Load: ${result.loadComplete}ms)`);
    });
  });
});