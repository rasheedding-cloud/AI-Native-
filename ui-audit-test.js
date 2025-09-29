const { test, expect } = require('@playwright/test');

// 基础配置
const BASE_URL = 'http://localhost:3000';
const PAGES = [
  { name: 'Dashboard', path: '/', expectedElements: ['.dashboard-container', '.stat-card', '.chart-card'] },
  { name: 'Strategies', path: '/strategies', expectedElements: ['.ant-table', '.ant-card'] },
  { name: 'Initiatives', path: '/initiatives', expectedElements: ['.ant-table', '.ant-card'] },
  { name: 'Projects', path: '/projects', expectedElements: ['.ant-table', '.ant-card'] },
  { name: 'Tasks', path: '/tasks', expectedElements: ['.ant-tabs', '.ant-card'] },
  { name: 'KPIs', path: '/kpis', expectedElements: ['.ant-table', '.ant-card'] },
];

// 测试超时设置
test.setTimeout(60000);

// 测试所有主要页面
test.describe('UI状态检查', () => {
  PAGES.forEach(({ name, path, expectedElements }) => {
    test(`${name}页面UI检查`, async ({ page }) => {
      console.log(`\n=== 开始检查 ${name} 页面 ===`);

      // 导航到页面
      await page.goto(BASE_URL + path);
      await page.waitForLoadState('networkidle');

      // 等待页面加载
      await page.waitForTimeout(2000);

      // 检查页面标题
      const title = await page.title();
      console.log(`页面标题: ${title}`);

      // 检查是否有JavaScript错误
      page.on('console', msg => {
        if (msg.type() === 'error') {
          console.log(`控制台错误: ${msg.text()}`);
        }
      });

      // 检查主要元素是否存在
      for (const selector of expectedElements) {
        try {
          const element = await page.waitForSelector(selector, { timeout: 5000 });
          if (element) {
            console.log(`✓ 找到元素: ${selector}`);
          }
        } catch (error) {
          console.log(`✗ 未找到元素: ${selector}`);
        }
      }

      // 检查页面布局
      const layoutCheck = await page.evaluate(() => {
        const results = {
          hasLayout: true,
          hasSider: !!document.querySelector('.ant-layout-sider'),
          hasHeader: !!document.querySelector('.ant-layout-header'),
          hasContent: !!document.querySelector('.ant-layout-content'),
          bodyOverflow: document.body.style.overflow,
          contentOverflow: document.querySelector('.ant-layout-content')?.style.overflow,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight
        };
        return results;
      });

      console.log('布局检查结果:', layoutCheck);

      // 检查特定页面的问题
      if (name === 'Dashboard') {
        // 检查饼图
        const pieChartCheck = await page.evaluate(() => {
          const pieCharts = document.querySelectorAll('svg.recharts-pie');
          const hasPieChart = pieCharts.length > 0;
          const pieData = [];

          if (hasPieChart) {
            pieCharts.forEach(chart => {
              const paths = chart.querySelectorAll('path');
              pieData.push({
                hasPaths: paths.length > 0,
                pathCount: paths.length,
                visible: chart.offsetParent !== null
              });
            });
          }

          return { hasPieChart, pieData };
        });

        console.log('饼图检查结果:', pieChartCheck);

        if (!pieChartCheck.hasPieChart) {
          console.log('⚠️  Dashboard页面饼图未显示');
        }

        // 检查图表容器
        const chartContainers = await page.evaluate(() => {
          const containers = document.querySelectorAll('.chart-container, .responsive-chart, .chart-wrapper');
          return Array.from(containers).map(container => ({
            width: container.offsetWidth,
            height: container.offsetHeight,
            display: window.getComputedStyle(container).display,
            visibility: window.getComputedStyle(container).visibility,
            overflow: window.getComputedStyle(container).overflow
          }));
        });

        console.log('图表容器信息:', chartContainers);
      }

      // 检查响应式设计
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForTimeout(1000);

      const mobileLayoutCheck = await page.evaluate(() => {
        const results = {
          siderCollapsed: !!document.querySelector('.ant-layout-sider-collapsed'),
          contentPadding: window.getComputedStyle(document.querySelector('.ant-layout-content')).padding,
          cardResponsive: Array.from(document.querySelectorAll('.ant-card')).every(card => {
            const style = window.getComputedStyle(card);
            return style.margin === '8px' || style.margin === '12px';
          })
        };
        return results;
      });

      console.log('移动端布局检查:', mobileLayoutCheck);

      // 恢复桌面视图
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.waitForTimeout(1000);

      // 检查样式一致性
      const styleCheck = await page.evaluate(() => {
        const cards = document.querySelectorAll('.ant-card');
        const buttons = document.querySelectorAll('.ant-btn');

        return {
          cardsConsistent: Array.from(cards).every(card => {
            const style = window.getComputedStyle(card);
            return style.borderRadius === '12px' || style.borderRadius === '8px';
          }),
          buttonsConsistent: Array.from(buttons).every(button => {
            const style = window.getComputedStyle(button);
            return style.borderRadius !== '0px';
          }),
          colorScheme: {
            primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
            secondaryColor: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color')
          }
        };
      });

      console.log('样式一致性检查:', styleCheck);

      // 截图保存
      await page.screenshot({
        path: `test-results/${name.toLowerCase()}-ui-check.png`,
        fullPage: true
      });

      console.log(`✓ ${name}页面检查完成，截图已保存`);
    });
  });

  // 特殊测试：饼图显示问题
  test('Dashboard饼图专项检查', async ({ page }) => {
    console.log('\n=== 开始饼图专项检查 ===');

    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);

    // 检查饼图相关的多个选择器
    const pieChartSelectors = [
      'svg.recharts-pie',
      '.recharts-pie',
      '.pie-chart-container svg',
      '.chart-card svg',
      '[data-testid="pie-chart"]',
      '.ant-card svg'
    ];

    for (const selector of pieChartSelectors) {
      try {
        const elements = await page.$$(selector);
        console.log(`选择器 "${selector}": 找到 ${elements.length} 个元素`);

        if (elements.length > 0) {
          for (let i = 0; i < elements.length; i++) {
            const isVisible = await elements[i].isVisible();
            const boundingBox = await elements[i].boundingBox();
            console.log(`  元素 ${i + 1}: 可见=${isVisible}, 位置=${JSON.stringify(boundingBox)}`);
          }
        }
      } catch (error) {
        console.log(`选择器 "${selector}" 检查失败:`, error.message);
      }
    }

    // 检查是否有recharts相关的脚本
    const rechartsCheck = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasRecharts = scripts.some(script =>
        script.src && script.src.includes('recharts')
      );

      const pieElements = document.querySelectorAll('[class*="pie"], [class*="chart"]');
      const svgElements = document.querySelectorAll('svg');

      return {
        hasRecharts,
        pieElementCount: pieElements.length,
        svgElementCount: svgElements.length,
        pieClasses: Array.from(pieElements).map(el => el.className),
        svgClasses: Array.from(svgElements).map(el => el.className)
      };
    });

    console.log('Recharts检查:', rechartsCheck);

    // 检查控制台错误
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.waitForTimeout(2000);

    if (consoleErrors.length > 0) {
      console.log('控制台错误汇总:');
      consoleErrors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }

    // 详细截图
    await page.screenshot({
      path: 'test-results/dashboard-pie-chart-detail.png',
      fullPage: true
    });
  });

  // 整体美观度检查
  test('整体美观度检查', async ({ page }) => {
    console.log('\n=== 开始整体美观度检查 ===');

    await page.goto(BASE_URL + '/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const aestheticCheck = await page.evaluate(() => {
      const results = {
        // 颜色一致性
        colorConsistency: {
          primaryButtons: Array.from(document.querySelectorAll('.ant-btn-primary')).every(btn => {
            const style = window.getComputedStyle(btn);
            return style.backgroundColor.includes('102') || style.backgroundColor.includes('rgb(102, 126, 234)');
          }),
          cards: Array.from(document.querySelectorAll('.ant-card')).every(card => {
            const style = window.getComputedStyle(card);
            return style.backgroundColor === 'rgb(255, 255, 255)' || style.backgroundColor === 'rgba(255, 255, 255, 0.8)';
          })
        },

        // 间距一致性
        spacingConsistency: {
          cardsHaveMargin: Array.from(document.querySelectorAll('.ant-card')).every(card => {
            const style = window.getComputedStyle(card);
            return style.margin !== '0px';
          }),
          consistentPadding: Array.from(document.querySelectorAll('.ant-card-body')).every(body => {
            const style = window.getComputedStyle(body);
            const padding = style.padding;
            return padding.includes('16px') || padding.includes('24px') || padding.includes('12px');
          })
        },

        // 字体一致性
        fontConsistency: {
          consistentFontFamily: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).every(heading => {
            const style = window.getComputedStyle(heading);
            return style.fontFamily.includes('Inter') || style.fontFamily.includes('system-ui');
          })
        },

        // 布局问题
        layoutIssues: {
          overlappingElements: false,
          hiddenElements: Array.from(document.querySelectorAll('.ant-card')).filter(card =>
            card.offsetParent === null
          ).length,
          brokenLayout: document.body.scrollWidth > window.innerWidth + 50
        }
      };

      return results;
    });

    console.log('美观度检查结果:', aestheticCheck);

    // 检查具体的不一致问题
    if (aestheticCheck.layoutIssues.brokenLayout) {
      console.log('⚠️  检测到布局问题：页面宽度超出视口');
    }

    if (aestheticCheck.layoutIssues.hiddenElements > 0) {
      console.log(`⚠️  发现 ${aestheticCheck.layoutIssues.hiddenElements} 个隐藏的卡片元素`);
    }

    // 截图
    await page.screenshot({
      path: 'test-results/aesthetic-check.png',
      fullPage: true
    });
  });
});