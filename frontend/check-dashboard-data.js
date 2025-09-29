import { chromium } from 'playwright';

(async () => {
  console.log('🔍 检查Dashboard数据访问...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5180');
    await page.waitForTimeout(5000);

    // 直接检查Dashboard组件中的数据
    const dashboardData = await page.evaluate(() => {
      // 尝试访问React组件的state
      const root = document.getElementById('root');
      if (!root) return { error: 'No root element' };

      // 检查是否有React开发者工具
      const reactRoot = root._reactRootContainer?._internalRoot?.current;
      if (!reactRoot) return { error: 'No React root found' };

      // 尝试找到Dashboard组件
      const findDashboardComponent = (element) => {
        if (!element) return null;

        // 检查当前元素
        const fiber = element._reactInternalFiber || element;
        if (fiber && fiber.memoizedProps && fiber.memoizedProps.strategies !== undefined) {
          return fiber.memoizedProps;
        }

        // 递归检查子元素
        if (element.children) {
          for (let child of element.children) {
            const result = findDashboardComponent(child);
            if (result) return result;
          }
        }

        return null;
      };

      return findDashboardComponent(reactRoot) || { error: 'Dashboard component not found' };
    });

    console.log('📊 Dashboard数据:', dashboardData);

    // 检查任务状态分布
    const taskStatusCheck = await page.evaluate(() => {
      // 检查DOM中的任务信息
      const taskElements = document.querySelectorAll('[data-task], .task, .ant-list-item');
      const taskTexts = Array.from(taskElements).map(el => el.textContent || '');

      // 检查饼图数据
      const pieElements = document.querySelectorAll('.recharts-pie, .recharts-slice');
      const hasPieData = pieElements.length > 0;

      return {
        taskElementsCount: taskElements.length,
        taskTexts: taskTexts.slice(0, 10),
        hasPieData,
        pieElementsCount: pieElements.length
      };
    });

    console.log('📊 任务状态检查:', taskStatusCheck);

    // 截图
    await page.screenshot({
      path: 'dashboard-data-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 检查错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 Dashboard数据检查完成！');
})();