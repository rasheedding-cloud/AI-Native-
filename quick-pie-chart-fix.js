// 快速饼图修复工具
console.log('🔧 开始饼图问题快速修复...\n');

// 检查Dashboard文件
const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'frontend/src/pages/Dashboard.tsx');

try {
  const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

  console.log('📋 Dashboard文件检查结果:');

  // 检查关键元素
  const checks = {
    hasRechartsImport: dashboardContent.includes("from 'recharts'"),
    hasPieChart: dashboardContent.includes('PieChart'),
    hasPie: dashboardContent.includes('<Pie'),
    hasTaskStatusData: dashboardContent.includes('taskStatusData'),
    hasColorsArray: dashboardContent.includes('const COLORS'),
    hasResponsiveContainer: dashboardContent.includes('ResponsiveContainer'),
    hasPieChartContainer: dashboardContent.includes('任务状态分布')
  };

  Object.entries(checks).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? '✅' : '❌'}`);
  });

  console.log('\n🔍 问题分析:');

  if (!checks.hasRechartsImport) {
    console.log('❌ 缺少Recharts导入 - 这是饼图不显示的主要原因');
  }

  if (!checks.hasPieChart || !checks.hasPie) {
    console.log('❌ 饼图组件可能有问题');
  }

  if (!checks.hasTaskStatusData) {
    console.log('❌ 任务状态数据计算可能有问题');
  }

  console.log('\n💡 快速修复建议:');

  // 生成修复后的饼图代码
  const fixedPieChartCode = `// 饼图容器 - 确保有正确的尺寸和布局
<div style={{ width: '100%', height: 240, minWidth: '300px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <PieChart width={300} height={240}>
    <Pie
      data={taskStatusData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }: any) => \`\${name} \${((percent as number) * 100).toFixed(0)}%\`}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
      animationBegin={0}
      animationDuration={1000}
    >
      {taskStatusData.map((_, index) => (
        <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip
      formatter={(value: number) => [value, '任务数量']}
      labelFormatter={(label) => \`状态: \${label}\`}
    />
  </PieChart>
</div>`;

  console.log('📝 修复后的饼图代码:');
  console.log(fixedPieChartCode);

  // 检查任务状态数据计算
  console.log('\n📊 检查任务状态数据计算:');

  const currentTaskStatusData = dashboardContent.match(/const taskStatusData = [\s\S]*?\[\];/);
  if (currentTaskStatusData) {
    console.log('当前任务状态数据代码:');
    console.log(currentTaskStatusData[0]);
  }

  const fixedTaskStatusData = `const taskStatusData = Array.isArray(tasks) && tasks.length > 0 ? [
  { name: '未开始', value: tasks.filter(t => t.status === 'TODO' || t.status === '未开始').length, color: '#ff7875' },
  { name: '进行中', value: tasks.filter(t => t.status === 'DOING' || t.status === 'IN_PROGRESS' || t.status === '进行中').length, color: '#1890ff' },
  { name: '已完成', value: tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED' || t.status === '已完成').length, color: '#52c41a' },
  { name: '已暂停', value: tasks.filter(t => t.status === 'BLOCKED' || t.status === 'PAUSED' || t.status === '已暂停' || t.status === 'CANCELLED').length, color: '#faad14' }
] : [{ name: '暂无数据', value: 1, color: '#d9d9d9' }];`;

  console.log('\n📝 修复后的任务状态数据代码:');
  console.log(fixedTaskStatusData);

  console.log('\n🔧 完整修复步骤:');
  console.log('1. 确保安装了recharts: npm install recharts');
  console.log('2. 检查Dashboard.tsx中的recharts导入');
  console.log('3. 修复任务状态数据计算逻辑');
  console.log('4. 确保饼图容器有正确的尺寸');
  console.log('5. 检查是否有CSS样式冲突');

  console.log('\n🧪 测试方法:');
  console.log('1. 启动应用: npm start');
  console.log('2. 访问Dashboard页面');
  console.log('3. 打开浏览器开发者工具');
  console.log('4. 检查Console是否有错误');
  console.log('5. 检查Network标签页加载情况');
  console.log('6. 检查Elements标签页DOM结构');

  console.log('\n⚡ 快速诊断命令:');
  console.log('- 检查recharts是否安装: npm list recharts');
  console.log('- 启动开发服务器: npm run dev');
  console.log('- 打开调试工具: F12');

} catch (error) {
  console.error('❌ 读取Dashboard文件失败:', error.message);
  console.log('请确保frontend/src/pages/Dashboard.tsx文件存在');
}

console.log('\n✅ 饼图修复分析完成！');