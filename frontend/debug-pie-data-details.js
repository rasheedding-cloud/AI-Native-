import { chromium } from 'playwright';

(async () => {
  console.log('🔍 调试饼图数据详情...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听控制台消息
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('🔍') || text.includes('📊') || text.includes('计算后的饼图数据') || text.includes('总数据值')) {
        console.log(`📝 ${text}`);
      }
    });

    await page.goto('http://localhost:5180');

    // 等待数据加载
    console.log('⏳ 等待数据加载...');
    await page.waitForTimeout(8000);

    // 获取详细的饼图数据
    const pieDataDetails = await page.evaluate(() => {
      // 尝试从window或store获取任务数据
      let tasks = [];

      try {
        if (window.useStore) {
          const store = window.useStore.getState();
          tasks = store.tasks || [];
        }
      } catch (e) {
        console.error('Store access error:', e);
      }

      // 分析每个任务的详细状态
      const taskDetails = tasks.map(task => ({
        id: task.id,
        title: task.title,
        status: task.status,
        statusCategory: (() => {
          const status = task.status;
          if (status === 'TODO' || status === '未开始') return '未开始';
          if (status === 'DOING' || status === '进行中' || status === 'IN_PROGRESS') return '进行中';
          if (status === 'DONE' || status === '已完成' || status === 'COMPLETED') return '已完成';
          if (status === 'BLOCKED' || status === '已暂停' || status === 'PAUSED' || status === 'CANCELLED') return '已暂停';
          return '未知';
        })()
      }));

      // 计算状态分布
      const statusDistribution = taskDetails.reduce((acc, task) => {
        const category = task.statusCategory;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      // 模拟饼图数据计算
      const pieChartData = [
        { name: '未开始', value: tasks.filter(t => t.status === 'TODO' || t.status === '未开始').length },
        { name: '进行中', value: tasks.filter(t => t.status === 'DOING' || t.status === '进行中' || t.status === 'IN_PROGRESS').length },
        { name: '已完成', value: tasks.filter(t => t.status === 'DONE' || t.status === '已完成' || t.status === 'COMPLETED').length },
        { name: '已暂停', value: tasks.filter(t => t.status === 'BLOCKED' || t.status === '已暂停' || t.status === 'PAUSED' || t.status === 'CANCELLED').length },
      ];

      return {
        totalTasks: tasks.length,
        taskDetails,
        statusDistribution,
        pieChartData,
        pieChartTotal: pieChartData.reduce((sum, item) => sum + item.value, 0),
        hasData: pieChartData.some(item => item.value > 0)
      };
    });

    console.log('\n📊 饼图数据详情分析:');
    console.log('总任务数:', pieDataDetails.totalTasks);
    console.log('任务详情:', JSON.stringify(pieDataDetails.taskDetails, null, 2));
    console.log('状态分布:', pieDataDetails.statusDistribution);
    console.log('饼图数据:', pieDataDetails.pieChartData);
    console.log('饼图总值:', pieDataDetails.pieChartTotal);
    console.log('是否有数据:', pieDataDetails.hasData);

    // 检查页面中的饼图渲染情况
    const pieRendering = await page.evaluate(() => {
      const pieSlices = document.querySelectorAll('.recharts-pie-slice');
      const pieLabels = document.querySelectorAll('.recharts-pie-label');
      const pieContainer = document.querySelector('.recharts-pie');

      return {
        sliceCount: pieSlices.length,
        labelCount: pieLabels.length,
        hasPieContainer: !!pieContainer,
        sliceInfo: Array.from(pieSlices).map(slice => ({
          name: slice.getAttribute('name'),
          value: slice.getAttribute('value'),
          fill: slice.getAttribute('fill')
        }))
      };
    });

    console.log('\n🎨 饼图渲染情况:');
    console.log('切片数量:', pieRendering.sliceCount);
    console.log('标签数量:', pieRendering.labelCount);
    console.log('有饼图容器:', pieRendering.hasPieContainer);
    console.log('切片信息:', pieRendering.sliceInfo);

    // 截图
    await page.screenshot({
      path: 'pie-data-details-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 调试错误:', error);
  } finally {
    await browser.close();
  }

  console.log('\n🎉 饼图数据详情调试完成！');
})();