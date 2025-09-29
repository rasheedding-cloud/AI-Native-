import { chromium } from 'playwright';

(async () => {
  console.log('🔍 检查饼图数据显示...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5180');

    // 等待足够时间确保所有数据加载完成
    console.log('⏳ 等待数据加载...');
    await page.waitForTimeout(8000);

    // 检查饼图的实际数据
    const pieInfo = await page.evaluate(() => {
      // 检查饼图的数据点
      const pieSlices = document.querySelectorAll('.recharts-pie-slice');
      const sliceData = Array.from(pieSlices).map(slice => {
        const name = slice.getAttribute('name') || slice.getAttribute('data-name') || 'unknown';
        const value = slice.getAttribute('value') || slice.getAttribute('data-value') || '0';
        const fill = slice.getAttribute('fill') || '#000000';
        return { name, value, fill };
      });

      // 检查饼图的tooltip信息
      const tooltips = document.querySelectorAll('.recharts-tooltip-wrapper');
      const tooltipTexts = Array.from(tooltips).map(t => t.textContent || '');

      // 检查是否有数据显示在饼图上
      const pieLabels = document.querySelectorAll('.recharts-pie-label');
      const labelTexts = Array.from(pieLabels).map(l => l.textContent || '');

      // 检查统计卡片中的数据
      const statCards = document.querySelectorAll('.ant-statistic-content');
      const statValues = Array.from(statCards).map(s => s.textContent || '');

      return {
        sliceCount: pieSlices.length,
        slices: sliceData,
        tooltips: tooltipTexts,
        labels: labelTexts,
        statistics: statValues,
        hasData: pieSlices.length > 0
      };
    });

    console.log('🥧 饼图信息:', pieInfo);

    // 检查任务列表中的任务状态
    const taskListInfo = await page.evaluate(() => {
      const taskItems = document.querySelectorAll('.ant-list-item');
      const taskStatuses = Array.from(taskItems).map(item => {
        const text = item.textContent || '';
        // 尝试从文本中提取状态信息
        if (text.includes('DONE') || text.includes('已完成')) return 'DONE';
        if (text.includes('TODO') || text.includes('未开始')) return 'TODO';
        if (text.includes('DOING') || text.includes('进行中')) return 'DOING';
        if (text.includes('BLOCKED') || text.includes('已暂停')) return 'BLOCKED';
        return 'UNKNOWN';
      });

      const statusCounts = taskStatuses.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      return {
        taskCount: taskItems.length,
        statuses: taskStatuses,
        statusCounts: statusCounts
      };
    });

    console.log('📋 任务列表信息:', taskListInfo);

    // 截图
    await page.screenshot({
      path: 'pie-chart-data-debug.png',
      fullPage: true
    });

    // 分析结果
    console.log('\n🎯 数据分析:');
    console.log(`饼图切片数量: ${pieInfo.sliceCount}`);
    console.log(`任务列表数量: ${taskListInfo.taskCount}`);

    if (pieInfo.hasData) {
      console.log('✅ 饼图有数据显示');
      console.log('饼图数据:', pieInfo.slices);
    } else {
      console.log('❌ 饼图没有数据显示');
    }

    if (taskListInfo.taskCount > 0) {
      console.log('✅ 任务列表有数据');
      console.log('状态分布:', taskListInfo.statusCounts);
    } else {
      console.log('❌ 任务列表没有数据');
    }

  } catch (error) {
    console.error('❌ 检查错误:', error);
  } finally {
    await browser.close();
  }

  console.log('\n🎉 饼图数据检查完成！');
})();