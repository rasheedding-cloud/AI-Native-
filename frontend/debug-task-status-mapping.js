import { chromium } from 'playwright';

(async () => {
  console.log('🔍 调试任务状态映射...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:5180');
    await page.waitForTimeout(8000);

    // 注入调试代码到页面中
    const statusDebug = await page.evaluate(() => {
      // 尝试获取任务数据
      let tasks = [];

      // 方法1: 尝试从DOM中提取任务信息
      const taskElements = document.querySelectorAll('.ant-list-item');
      const domTasks = Array.from(taskElements).map(el => {
        const text = el.textContent || '';
        return { text, element: el };
      });

      // 方法2: 尝试从window对象获取
      if (window.tasks) {
        tasks = window.tasks;
      }

      // 方法3: 尝试从store获取
      try {
        if (window.useStore) {
          const store = window.useStore.getState();
          if (store.tasks && store.tasks.length > 0) {
            tasks = store.tasks;
          }
        }
      } catch (e) {
        console.error('Store access error:', e);
      }

      // 分析任务状态
      const statusAnalysis = {
        totalTasks: tasks.length,
        domTasksFound: domTasks.length,
        taskStatuses: {},
        detailedStatuses: [],
        statusMappingIssues: []
      };

      // 分析实际任务数据
      if (tasks.length > 0) {
        tasks.forEach((task, index) => {
          const status = task.status;
          statusAnalysis.detailedStatuses.push({ index, status, title: task.title });

          if (status) {
            statusAnalysis.taskStatuses[status] = (statusAnalysis.taskStatuses[status] || 0) + 1;
          }
        });
      }

      // 分析DOM任务数据
      domTasks.forEach((task, index) => {
        const text = task.text;
        let detectedStatus = 'UNKNOWN';

        if (text.includes('DONE') || text.includes('已完成')) {
          detectedStatus = 'DONE';
        } else if (text.includes('TODO') || text.includes('未开始')) {
          detectedStatus = 'TODO';
        } else if (text.includes('DOING') || text.includes('进行中')) {
          detectedStatus = 'DOING';
        } else if (text.includes('BLOCKED') || text.includes('已暂停')) {
          detectedStatus = 'BLOCKED';
        }

        if (detectedStatus !== 'UNKNOWN') {
          statusAnalysis.taskStatuses[detectedStatus] = (statusAnalysis.taskStatuses[detectedStatus] || 0) + 1;
        }
      });

      // 模拟Dashboard的状态映射逻辑
      const simulatedTaskStatusData = [
        { name: '未开始', value: tasks.filter(t => t.status === 'TODO' || t.status === '未开始').length, color: '#ff7875' },
        { name: '进行中', value: tasks.filter(t => t.status === 'DOING' || t.status === '进行中' || t.status === 'IN_PROGRESS').length, color: '#1890ff' },
        { name: '已完成', value: tasks.filter(t => t.status === 'DONE' || t.status === '已完成' || t.status === 'COMPLETED').length, color: '#52c41a' },
        { name: '已暂停', value: tasks.filter(t => t.status === 'BLOCKED' || t.status === '已暂停' || t.status === 'PAUSED' || t.status === 'CANCELLED').length, color: '#faad14' },
      ];

      statusAnalysis.simulatedPieData = simulatedTaskStatusData;
      statusAnalysis.totalPieValue = simulatedTaskStatusData.reduce((sum, item) => sum + item.value, 0);

      return statusAnalysis;
    });

    console.log('📊 状态映射分析:', JSON.stringify(statusDebug, null, 2));

    // 截图
    await page.screenshot({
      path: 'task-status-mapping-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 调试错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 任务状态映射调试完成！');
})();