import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建测试任务数据
const testTasks = [
  {
    id: 1,
    title: '完成项目需求分析',
    description: '分析用户需求，制定项目计划',
    assignee: '张三',
    priority: 'high',
    estimate: 8,
    due: '2025-09-30',
    status: 'TODO',
    dependencies: [],
    kpi_links: ['体验课转化率'],
    risk_flags: [],
    created_at: '2025-09-29T01:00:00Z',
    updated_at: '2025-09-29T01:00:00Z'
  },
  {
    id: 2,
    title: '设计用户界面原型',
    description: '使用Figma设计用户界面',
    assignee: '李四',
    priority: 'medium',
    estimate: 16,
    due: '2025-10-05',
    status: 'IN_PROGRESS',
    dependencies: [1],
    kpi_links: ['教材/套餐完成度'],
    risk_flags: [],
    created_at: '2025-09-29T01:00:00Z',
    updated_at: '2025-09-29T01:00:00Z'
  },
  {
    id: 3,
    title: '开发后端API接口',
    description: '开发RESTful API接口',
    assignee: '王五',
    priority: 'high',
    estimate: 24,
    due: '2025-10-10',
    status: 'COMPLETED',
    dependencies: [1],
    kpi_links: ['ROI'],
    risk_flags: [],
    created_at: '2025-09-29T01:00:00Z',
    updated_at: '2025-09-29T01:00:00Z'
  },
  {
    id: 4,
    title: '编写测试用例',
    description: '编写单元测试和集成测试',
    assignee: '赵六',
    priority: 'medium',
    estimate: 12,
    due: '2025-10-15',
    status: 'TODO',
    dependencies: [2],
    kpi_links: ['续费率'],
    risk_flags: [],
    created_at: '2025-09-29T01:00:00Z',
    updated_at: '2025-09-29T01:00:00Z'
  },
  {
    id: 5,
    title: '部署生产环境',
    description: '部署应用到生产服务器',
    assignee: '钱七',
    priority: 'low',
    estimate: 4,
    due: '2025-10-20',
    status: 'PAUSED',
    dependencies: [3, 4],
    kpi_links: ['转介绍率'],
    risk_flags: [],
    created_at: '2025-09-29T01:00:00Z',
    updated_at: '2025-09-29T01:00:00Z'
  }
];

async function createTestTasks() {
  console.log('🔧 开始创建测试任务数据...');

  try {
    // 清空现有数据（如果需要）
    console.log('📋 获取现有任务...');
    const existingTasks = await axios.get(`${API_BASE_URL}/tasks`);
    console.log(`发现 ${existingTasks.data.length} 个现有任务`);

    // 创建新任务
    console.log('📝 创建测试任务...');
    for (const task of testTasks) {
      try {
        const response = await axios.post(`${API_BASE_URL}/tasks`, task);
        console.log(`✅ 创建任务成功: ${task.title}`);
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.log(`⚠️ 任务已存在: ${task.title}`);
        } else {
          console.error(`❌ 创建任务失败: ${task.title}`, error.message);
        }
      }
    }

    // 验证创建结果
    console.log('🔍 验证创建结果...');
    const finalTasks = await axios.get(`${API_BASE_URL}/tasks`);
    console.log(`📊 最终任务总数: ${finalTasks.data.length}`);

    // 显示任务状态分布
    const statusCounts = {
      'TODO': 0,
      'IN_PROGRESS': 0,
      'COMPLETED': 0,
      'PAUSED': 0
    };

    finalTasks.data.forEach(task => {
      if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status]++;
      }
    });

    console.log('📈 任务状态分布:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    console.log('🎉 测试任务数据创建完成！');

  } catch (error) {
    console.error('❌ 创建测试任务失败:', error.message);
  }
}

// 运行创建函数
createTestTasks();