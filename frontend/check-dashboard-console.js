import { chromium } from 'playwright';

(async () => {
  console.log('🔍 检查Dashboard控制台输出...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听所有控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      const type = msg.type();

      consoleMessages.push({ type, text });

      // 只显示相关的消息
      if (text.includes('📊') || text.includes('Dashboard') || text.includes('任务数据') || text.includes('tasksLength')) {
        console.log(`📝 ${type.toUpperCase()}: ${text}`);
      }
    });

    await page.goto('http://localhost:5180');

    // 等待页面加载和数据渲染
    console.log('⏳ 等待页面加载...');
    await page.waitForTimeout(5000);

    // 分析Dashboard相关的控制台消息
    const dashboardMessages = consoleMessages.filter(msg =>
      msg.text.includes('📊') ||
      msg.text.includes('Dashboard') ||
      msg.text.includes('任务数据') ||
      msg.text.includes('tasksLength')
    );

    console.log('\n📈 Dashboard控制台消息分析:');
    dashboardMessages.forEach((msg, index) => {
      console.log(`${index + 1}. [${msg.type.toUpperCase()}] ${msg.text}`);
    });

    // 检查最终状态
    const finalCheck = await page.evaluate(() => {
      // 检查饼图状态
      const pieSlices = document.querySelectorAll('.recharts-pie-slice');
      const hasPieData = pieSlices.length > 0;

      // 检查统计数字
      const stats = document.querySelectorAll('.ant-statistic-content-value');
      const statValues = Array.from(stats).map(s => s.textContent || '');

      return {
        hasPieData,
        pieSliceCount: pieSlices.length,
        statValues,
        hasTasks: statValues.some(v => v && parseInt(v) > 0)
      };
    });

    console.log('\n🎯 最终状态检查:');
    console.log(`饼图有数据: ${finalCheck.hasPieData}`);
    console.log(`饼图切片数: ${finalCheck.pieSliceCount}`);
    console.log(`统计数值: ${finalCheck.statValues.join(', ')}`);
    console.log(`有任务数据: ${finalCheck.hasTasks}`);

    // 截图
    await page.screenshot({
      path: 'dashboard-console-debug.png',
      fullPage: true
    });

  } catch (error) {
    console.error('❌ 检查错误:', error);
  } finally {
    await browser.close();
  }

  console.log('\n🎉 Dashboard控制台检查完成！');
})();