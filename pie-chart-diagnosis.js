const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 开始饼图诊断...\n');

  // 监听控制台消息
  const consoleLogs = [];
  page.on('console', msg => {
    consoleLogs.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // 监听网络请求
  const networkRequests = [];
  page.on('request', request => {
    if (request.url().includes('recharts') || request.url().includes('chart')) {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    }
  });

  try {
    // 导航到Dashboard
    console.log('📍 导航到Dashboard...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    // 检查页面基本信息
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        documentReady: document.readyState,
        hasReact: !!window.React,
        hasReactDOM: !!window.ReactDOM
      };
    });

    console.log('📄 页面信息:', pageInfo);

    // 检查饼图元素
    console.log('\n🔍 检查饼图元素...');

    const pieChartChecks = await page.evaluate(() => {
      const checks = {
        // 检查各种可能的饼图选择器
        selectors: {
          '.recharts-pie': document.querySelectorAll('.recharts-pie').length,
          '.recharts-surface': document.querySelectorAll('.recharts-surface').length,
          'svg': document.querySelectorAll('svg').length,
          '[class*="pie"]': document.querySelectorAll('[class*="pie"]').length,
          '[class*="chart"]': document.querySelectorAll('[class*="chart"]').length,
          '.chart-card': document.querySelectorAll('.chart-card').length
        },

        // 检查图表容器
        containers: Array.from(document.querySelectorAll('.chart-card, .chart-container, .responsive-chart')).map(container => ({
          className: container.className,
          width: container.offsetWidth,
          height: container.offsetHeight,
          display: window.getComputedStyle(container).display,
          visibility: window.getComputedStyle(container).visibility,
          position: window.getComputedStyle(container).position,
          overflow: window.getComputedStyle(container).overflow,
          hasChildren: container.children.length > 0
        })),

        // 检查SVG元素
        svgElements: Array.from(document.querySelectorAll('svg')).map(svg => ({
          className: svg.className,
          width: svg.offsetWidth,
          height: svg.offsetHeight,
          viewBox: svg.getAttribute('viewBox'),
          hasChildren: svg.children.length > 0,
          parentElement: svg.parentElement ? svg.parentElement.className : 'null'
        })),

        // 检查Recharts相关
        rechartsElements: {
          pie: document.querySelectorAll('.recharts-pie').length,
          cell: document.querySelectorAll('.recharts-pie-sector').length,
          tooltip: document.querySelectorAll('.recharts-tooltip').length,
          legend: document.querySelectorAll('.recharts-legend').length
        }
      };

      return checks;
    });

    console.log('📊 饼图检查结果:');
    console.log('选择器检查:', pieChartChecks.selectors);
    console.log('容器信息:', pieChartChecks.containers);
    console.log('SVG元素:', pieChartChecks.svgElements);
    console.log('Recharts元素:', pieChartChecks.rechartsElements);

    // 检查数据状态
    console.log('\n📈 检查数据状态...');
    const dataState = await page.evaluate(() => {
      // 检查全局状态
      const hasWindowStore = typeof window.useStore !== 'undefined';
      const hasRedux = typeof window.__REDUX_DEVTOOLS_EXTENSION_HOOK__ !== 'undefined';

      // 检查任务数据
      const taskStatusData = [];
      try {
        // 尝试从React组件中获取数据
        const reactElements = document.querySelectorAll('[data-reactroot]');
        if (reactElements.length > 0) {
          // 这里可以添加更复杂的数据提取逻辑
        }
      } catch (error) {
        console.error('数据提取错误:', error);
      }

      return {
        hasWindowStore,
        hasRedux,
        taskStatusData: taskStatusData,
        documentElements: {
          totalElements: document.querySelectorAll('*').length,
          scriptElements: document.querySelectorAll('script').length,
          styleElements: document.querySelectorAll('style').length
        }
      };
    });

    console.log('🔧 数据状态:', dataState);

    // 检查CSS样式
    console.log('\n🎨 检查CSS样式...');
    const styleChecks = await page.evaluate(() => {
      const checks = {
        // 检查CSS变量
        cssVars: {
          primaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
          spacing: getComputedStyle(document.documentElement).getPropertyValue('--spacing-md')
        },

        // 检查图表相关样式
        chartStyles: Array.from(document.querySelectorAll('.chart-card, .chart-container')).map(el => ({
          display: window.getComputedStyle(el).display,
          visibility: window.getComputedStyle(el).visibility,
          opacity: window.getComputedStyle(el).opacity,
          transform: window.getComputedStyle(el).transform,
          zIndex: window.getComputedStyle(el).zIndex
        }))
      };

      return checks;
    });

    console.log('🎨 样式检查:', styleChecks);

    // 尝试找到任务状态数据
    console.log('\n📋 检查任务状态数据...');
    const taskDataCheck = await page.evaluate(() => {
      // 查找任务状态数据
      const taskData = [];
      const possibleDataElements = document.querySelectorAll('[class*="task"], [data-task], [id*="task"]');

      possibleDataElements.forEach(el => {
        try {
          const text = el.textContent || '';
          if (text.includes('任务') || text.includes('Task')) {
            taskData.push({
              element: el.tagName,
              className: el.className,
              text: text.substring(0, 100)
            });
          }
        } catch (error) {
          // 忽略错误
        }
      });

      return taskData;
    });

    console.log('📋 任务数据元素:', taskDataCheck);

    // 截图保存
    console.log('\n📸 保存截图...');
    await page.screenshot({
      path: 'pie-chart-diagnosis.png',
      fullPage: true
    });

    // 生成诊断报告
    console.log('\n📋 诊断报告');
    console.log('='.repeat(50));

    const hasPieCharts = pieChartChecks.selectors['.recharts-pie'] > 0;
    const hasSvgElements = pieChartChecks.selectors['svg'] > 0;
    const hasChartContainers = pieChartChecks.containers.length > 0;

    console.log(`🔍 饼图存在: ${hasPieCharts ? '✅' : '❌'}`);
    console.log(`🔍 SVG元素: ${hasSvgElements ? '✅' : '❌'} (${pieChartChecks.selectors['svg']} 个)`);
    console.log(`🔍 图表容器: ${hasChartContainers ? '✅' : '❌'} (${pieChartChecks.containers.length} 个)`);

    if (!hasPieCharts && hasSvgElements) {
      console.log('⚠️  发现SVG元素但没有饼图 - 可能是渲染问题');
    }

    if (!hasPieCharts && !hasSvgElements) {
      console.log('❌ 没有找到任何图表元素 - 可能是依赖问题');
    }

    if (hasChartContainers) {
      const visibleContainers = pieChartChecks.containers.filter(c => c.display !== 'none');
      console.log(`🔍 可见图表容器: ${visibleContainers.length} / ${pieChartChecks.containers.length}`);
    }

    console.log('\n💡 建议:');
    if (!hasPieCharts) {
      console.log('1. 检查Recharts库是否正确加载');
      console.log('2. 检查任务数据是否正确传入饼图组件');
      console.log('3. 检查饼图组件的渲染条件');
    }

    if (consoleLogs.filter(log => log.type === 'error').length > 0) {
      console.log('4. 修复控制台中的JavaScript错误');
    }

    console.log('\n🔧 下一步行动:');
    console.log('1. 检查浏览器开发者工具的Console标签');
    console.log('2. 检查Network标签中的资源加载');
    console.log('3. 检查Elements标签中的DOM结构');
    console.log('4. 运行React DevTools检查组件状态');

    console.log('\n📁 文件已保存:');
    console.log('- pie-chart-diagnosis.png (页面截图)');

  } catch (error) {
    console.error('❌ 诊断过程中出错:', error);
  } finally {
    await browser.close();
  }
})();