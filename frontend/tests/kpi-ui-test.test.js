import { test, expect } from '@playwright/test';

test.describe('KPI完成情况UI测试', () => {
  test.beforeEach(async ({ page }) => {
    // 导航到仪表盘
    await page.goto('http://localhost:5181');
    await page.waitForSelector('.dashboard-container', { timeout: 10000 });
  });

  test('KPI完成情况卡片布局测试', async ({ page }) => {
    // 等待KPI卡片加载完成
    const kpiCard = await page.waitForSelector('.kpi-card');

    // 获取KPI卡片的位置和尺寸
    const kpiBoundingBox = await kpiCard.boundingBox();
    console.log('KPI卡片位置和尺寸:', kpiBoundingBox);

    // 检查KPI卡片是否在可视区域内
    expect(kpiBoundingBox.x).toBeGreaterThanOrEqual(0);
    expect(kpiBoundingBox.y).toBeGreaterThanOrEqual(0);
    expect(kpiBoundingBox.width).toBeGreaterThan(300);
    expect(kpiBoundingBox.height).toBeGreaterThan(200);

    // 截图保存当前状态
    await page.screenshot({ path: 'kpi-card-current.png', fullPage: false });
  });

  test('KPI列表项布局测试', async ({ page }) => {
    // 等待KPI列表加载
    await page.waitForSelector('.kpi-card .ant-list-item');

    // 获取所有KPI列表项
    const kpiItems = await page.$$('.kpi-card .ant-list-item');
    console.log('KPI列表项数量:', kpiItems.length);

    // 检查每个KPI项的布局
    for (let i = 0; i < Math.min(kpiItems.length, 3); i++) {
      const item = kpiItems[i];
      const boundingBox = await item.boundingBox();
      console.log(`KPI项${i+1}位置和尺寸:`, boundingBox);

      // 检查是否有重叠或超出容器的情况
      expect(boundingBox.width).toBeLessThan(600);
      expect(boundingBox.height).toBeGreaterThan(40);
      expect(boundingBox.height).toBeLessThan(200);
    }

    // 截图KPI列表区域
    const kpiCard = await page.$('.kpi-card');
    await kpiCard.screenshot({ path: 'kpi-list-items.png' });
  });

  test('KPI内容溢出测试', async ({ page }) => {
    // 检查KPI卡片是否有溢出
    const kpiCard = await page.$('.kpi-card');
    const scrollWidth = await kpiCard.evaluate(el => el.scrollWidth);
    const clientWidth = await kpiCard.evaluate(el => el.clientWidth);
    const scrollHeight = await kpiCard.evaluate(el => el.scrollHeight);
    const clientHeight = await kpiCard.evaluate(el => el.clientHeight);

    console.log('KPI卡片滚动信息:', {
      scrollWidth,
      clientWidth,
      scrollHeight,
      clientHeight,
      horizontalOverflow: scrollWidth > clientWidth,
      verticalOverflow: scrollHeight > clientHeight
    });

    // 如果有垂直溢出，这是正常的（因为内容较多）
    // 但水平溢出可能表示布局问题
    if (scrollWidth > clientWidth) {
      console.warn('检测到水平溢出，可能存在布局问题');
      await page.screenshot({ path: 'kpi-horizontal-overflow.png' });
    }
  });

  test('KPI进度条显示测试', async ({ page }) => {
    // 检查进度条是否正确显示
    const progressBars = await page.$$('.kpi-card .ant-progress');
    console.log('进度条数量:', progressBars.length);

    for (let i = 0; i < progressBars.length; i++) {
      const progressBar = progressBars[i];
      const isVisible = await progressBar.isVisible();
      console.log(`进度条${i+1}可见性:`, isVisible);

      // 获取进度条的宽度
      const boundingBox = await progressBar.boundingBox();
      console.log(`进度条${i+1}尺寸:`, boundingBox);

      expect(isVisible).toBe(true);
      expect(boundingBox.width).toBeGreaterThan(50);
    }
  });

  test('响应式布局测试', async ({ page }) => {
    // 测试不同屏幕尺寸下的KPI显示
    const viewports = [
      { width: 1920, height: 1080, name: '大屏幕' },
      { width: 1366, height: 768, name: '中等屏幕' },
      { width: 768, height: 1024, name: '平板' },
      { width: 375, height: 667, name: '手机' }
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(1000); // 等待重新布局

      console.log(`测试${viewport.name} (${viewport.width}x${viewport.height})`);

      // 检查KPI卡片是否仍然可见
      const kpiCard = await page.$('.kpi-card');
      const isVisible = await kpiCard.isVisible();
      console.log(`${viewport.name} KPI卡片可见性:`, isVisible);

      // 截图
      await page.screenshot({
        path: `kpi-${viewport.name.toLowerCase().replace(/\s+/g, '-')}.png`,
        fullPage: false
      });

      expect(isVisible).toBe(true);
    }
  });

  test('KPI文本内容可读性测试', async ({ page }) => {
    // 检查文本是否被截断或重叠
    const kpiTexts = await page.$$eval('.kpi-card .ant-list-item', items => {
      return items.map(item => {
        const textElement = item.querySelector('.ant-list-item-meta-title');
        if (textElement) {
          const rect = textElement.getBoundingClientRect();
          const computedStyle = window.getComputedStyle(textElement);
          return {
            text: textElement.textContent,
            width: rect.width,
            height: rect.height,
            fontSize: computedStyle.fontSize,
            lineHeight: computedStyle.lineHeight,
            overflow: computedStyle.overflow,
            textOverflow: computedStyle.textOverflow,
            whiteSpace: computedStyle.whiteSpace
          };
        }
        return null;
      }).filter(Boolean);
    });

    console.log('KPI文本样式信息:', kpiTexts);

    // 检查是否有文本溢出问题
    const overflowIssues = kpiTexts.filter(text =>
      text.overflow === 'hidden' || text.textOverflow === 'ellipsis'
    );

    if (overflowIssues.length > 0) {
      console.warn('发现文本溢出问题:', overflowIssues);
    }
  });
});