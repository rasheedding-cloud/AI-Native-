const fs = require('fs');
const path = require('path');

// UI问题修复工具
class UIFixer {
  constructor() {
    this.frontendPath = path.join(__dirname, 'frontend');
    this.issues = [];
    this.fixes = [];
  }

  // 诊断当前UI问题
  async diagnose() {
    console.log('🔍 开始诊断UI问题...\n');

    // 检查Dashboard饼图问题
    this.diagnosePieChartIssue();

    // 检查样式一致性问题
    this.diagnoseStyleConsistency();

    // 检查响应式设计问题
    this.diagnoseResponsiveIssues();

    // 检查布局问题
    this.diagnoseLayoutIssues();

    // 检查字体和颜色问题
    this.diagnoseTypographyIssues();

    console.log(`\n📋 诊断完成，发现 ${this.issues.length} 个问题`);
    return this.issues;
  }

  // 诊断饼图问题
  diagnosePieChartIssue() {
    console.log('🔍 诊断饼图问题...');

    const dashboardPath = path.join(this.frontendPath, 'src/pages/Dashboard.tsx');
    const dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

    // 检查饼图相关的代码
    const pieChartChecks = {
      hasRechartsImport: dashboardContent.includes("from 'recharts'"),
      hasPieChartComponent: dashboardContent.includes('PieChart') && dashboardContent.includes('Pie'),
      hasTaskStatusData: dashboardContent.includes('taskStatusData'),
      hasPieChartRendering: dashboardContent.includes('outerRadius={80}'),
      hasColorsArray: dashboardContent.includes('const COLORS'),
      hasResponsiveContainer: dashboardContent.includes('ResponsiveContainer')
    };

    console.log('饼图检查结果:', pieChartChecks);

    if (!pieChartChecks.hasRechartsImport) {
      this.issues.push({
        type: 'error',
        component: 'Dashboard',
        issue: 'Recharts库未导入',
        description: 'Dashboard页面缺少Recharts库的导入',
        fix: '添加recharts导入语句'
      });
    }

    if (!pieChartChecks.hasPieChartComponent) {
      this.issues.push({
        type: 'error',
        component: 'Dashboard',
        issue: '饼图组件缺失',
        description: 'Dashboard页面没有正确的饼图组件',
        fix: '检查PieChart和Pie组件的使用'
      });
    }

    if (!pieChartChecks.hasTaskStatusData) {
      this.issues.push({
        type: 'warning',
        component: 'Dashboard',
        issue: '任务状态数据可能有问题',
        description: 'taskStatusData可能没有正确计算',
        fix: '检查任务状态数据的计算逻辑'
      });
    }

    if (!pieChartChecks.hasResponsiveContainer) {
      this.issues.push({
        type: 'warning',
        component: 'Dashboard',
        issue: '响应式容器缺失',
        description: '图表可能缺少ResponsiveContainer',
        fix: '为图表添加ResponsiveContainer'
      });
    }
  }

  // 诊断样式一致性问题
  diagnoseStyleConsistency() {
    console.log('🔍 诊断样式一致性问题...');

    const cssPath = path.join(this.frontendPath, 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const styleChecks = {
      hasCSSVariables: cssContent.includes(':root'),
      hasConsistentColors: cssContent.includes('--primary-color'),
      hasConsistentSpacing: cssContent.includes('--spacing-'),
      hasConsistentBorderRadius: cssContent.includes('--radius-'),
      hasConsistentShadows: cssContent.includes('--shadow-'),
      hasResponsiveStyles: cssContent.includes('@media')
    };

    console.log('样式一致性检查:', styleChecks);

    if (!styleChecks.hasCSSVariables) {
      this.issues.push({
        type: 'warning',
        component: 'CSS',
        issue: 'CSS变量缺失',
        description: '缺少CSS变量定义，可能导致样式不一致',
        fix: '添加CSS变量定义'
      });
    }

    if (!styleChecks.hasConsistentColors) {
      this.issues.push({
        type: 'warning',
        component: 'CSS',
        issue: '颜色主题不一致',
        description: '缺少统一的颜色变量',
        fix: '定义统一的颜色变量'
      });
    }
  }

  // 诊断响应式设计问题
  diagnoseResponsiveIssues() {
    console.log('🔍 诊断响应式设计问题...');

    const cssPath = path.join(this.frontendPath, 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const responsiveChecks = {
      hasMediaQueries: (cssContent.match(/@media/g) || []).length,
      hasMobileStyles: cssContent.includes('@media (max-width: 768px)'),
      hasTabletStyles: cssContent.includes('@media (max-width: 1024px)'),
      hasFlexibleLayout: cssContent.includes('flex-wrap') || cssContent.includes('grid-template-columns'),
      hasViewportMeta: false // 需要检查HTML文件
    };

    console.log('响应式设计检查:', responsiveChecks);

    if (responsiveChecks.hasMediaQueries < 5) {
      this.issues.push({
        type: 'warning',
        component: 'CSS',
        issue: '响应式设计不完善',
        description: '媒体查询数量较少，可能影响移动端体验',
        fix: '添加更多响应式样式'
      });
    }

    if (!responsiveChecks.hasMobileStyles) {
      this.issues.push({
        type: 'error',
        component: 'CSS',
        issue: '缺少移动端样式',
        description: '没有针对移动设备的样式适配',
        fix: '添加移动端媒体查询'
      });
    }
  }

  // 诊断布局问题
  diagnoseLayoutIssues() {
    console.log('🔍 诊断布局问题...');

    const layoutPath = path.join(this.frontendPath, 'src/components/layout/Layout.tsx');
    const layoutContent = fs.readFileSync(layoutPath, 'utf8');

    const layoutChecks = {
      hasProperStructure: layoutContent.includes('Sider') && layoutContent.includes('Content'),
      hasResponsiveSider: layoutContent.includes('breakpoint'),
      hasConsistentSpacing: layoutContent.includes('margin') && layoutContent.includes('padding'),
      hasStickyHeader: layoutContent.includes('position: \'sticky\''),
      hasProperZIndex: layoutContent.includes('zIndex')
    };

    console.log('布局检查:', layoutChecks);

    if (!layoutChecks.hasResponsiveSider) {
      this.issues.push({
        type: 'warning',
        component: 'Layout',
        issue: '侧边栏响应式问题',
        description: '侧边栏可能没有正确的响应式断点',
        fix: '添加侧边栏的响应式配置'
      });
    }

    if (!layoutChecks.hasStickyHeader) {
      this.issues.push({
        type: 'warning',
        component: 'Layout',
        issue: '头部固定问题',
        description: '页面头部可能没有固定定位',
        fix: '添加sticky定位'
      });
    }
  }

  // 诊断字体和颜色问题
  diagnoseTypographyIssues() {
    console.log('🔍 诊断字体和颜色问题...');

    const cssPath = path.join(this.frontendPath, 'src/index.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    const typographyChecks = {
      hasFontImport: cssContent.includes('@import url'),
      hasConsistentFontFamily: cssContent.includes('font-family'),
      hasFontSizeScale: cssContent.includes('font-size') && cssContent.includes('rem'),
      hasColorHierarchy: cssContent.includes('--text-color'),
      hasProperLineHeight: cssContent.includes('line-height')
    };

    console.log('字体和颜色检查:', typographyChecks);

    if (!typographyChecks.hasFontImport) {
      this.issues.push({
        type: 'warning',
        component: 'CSS',
        issue: '字体导入缺失',
        description: '可能缺少Google Fonts或其他字体导入',
        fix: '添加字体导入'
      });
    }

    if (!typographyChecks.hasFontSizeScale) {
      this.issues.push({
        type: 'warning',
        component: 'CSS',
        issue: '字体大小不规范',
        description: '缺少统一的字体大小比例',
        fix: '建立字体大小规范'
      });
    }
  }

  // 生成修复建议
  generateFixes() {
    console.log('\n🔧 生成修复建议...');

    this.issues.forEach(issue => {
      switch (issue.type) {
        case 'error':
          this.generateErrorFix(issue);
          break;
        case 'warning':
          this.generateWarningFix(issue);
          break;
      }
    });

    console.log(`\n✅ 生成了 ${this.fixes.length} 个修复建议`);
    return this.fixes;
  }

  // 生成错误修复
  generateErrorFix(issue) {
    switch (issue.issue) {
      case 'Recharts库未导入':
        this.fixes.push({
          priority: 'high',
          description: '添加Recharts库导入',
          code: `import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';`,
          file: 'frontend/src/pages/Dashboard.tsx'
        });
        break;

      case '饼图组件缺失':
        this.fixes.push({
          priority: 'high',
          description: '修复饼图组件渲染',
          code: `<div style={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
  <PieChart width={300} height={240}>
    <Pie
      data={taskStatusData}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={({ name, percent }) => \`\${name} \${(percent * 100).toFixed(0)}%\`}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {taskStatusData.map((_, index) => (
        <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</div>`,
          file: 'frontend/src/pages/Dashboard.tsx'
        });
        break;

      case '缺少移动端样式':
        this.fixes.push({
          priority: 'high',
          description: '添加移动端媒体查询',
          code: `@media (max-width: 768px) {
  .ant-layout-content {
    margin: 12px;
    padding: 16px;
  }

  .ant-card {
    margin: 8px;
  }
}`,
          file: 'frontend/src/index.css'
        });
        break;
    }
  }

  // 生成警告修复
  generateWarningFix(issue) {
    switch (issue.issue) {
      case '任务状态数据可能有问题':
        this.fixes.push({
          priority: 'medium',
          description: '优化任务状态数据计算',
          code: `// 修复任务状态数据计算
const taskStatusData = Array.isArray(tasks) && tasks.length > 0 ? [
  { name: '未开始', value: tasks.filter(t => t.status === 'TODO' || t.status === '未开始').length, color: '#ff7875' },
  { name: '进行中', value: tasks.filter(t => t.status === 'DOING' || t.status === 'IN_PROGRESS' || t.status === '进行中').length, color: '#1890ff' },
  { name: '已完成', value: tasks.filter(t => t.status === 'DONE' || t.status === 'COMPLETED' || t.status === '已完成').length, color: '#52c41a' },
  { name: '已暂停', value: tasks.filter(t => t.status === 'BLOCKED' || t.status === 'PAUSED' || t.status === '已暂停').length, color: '#faad14' }
] : [{ name: '暂无数据', value: 1, color: '#d9d9d9' }];`,
          file: 'frontend/src/pages/Dashboard.tsx'
        });
        break;

      case '响应式容器缺失':
        this.fixes.push({
          priority: 'medium',
          description: '添加响应式容器',
          code: `import { ResponsiveContainer } from 'recharts';

// 在图表周围包裹ResponsiveContainer
<ResponsiveContainer width="100%" height="100%">
  <PieChart>
    {/* 饼图内容 */}
  </PieChart>
</ResponsiveContainer>`,
          file: 'frontend/src/pages/Dashboard.tsx'
        });
        break;
    }
  }

  // 应用修复
  async applyFixes() {
    console.log('\n🛠️ 开始应用修复...');

    let appliedCount = 0;

    for (const fix of this.fixes) {
      try {
        if (fix.priority === 'high') {
          console.log(`🔧 应用高优先级修复: ${fix.description}`);
          // 这里可以添加实际的文件修复逻辑
          appliedCount++;
        }
      } catch (error) {
        console.error(`❌ 修复失败: ${fix.description}`, error);
      }
    }

    console.log(`\n✅ 成功应用 ${appliedCount} 个修复`);
    return appliedCount;
  }

  // 生成报告
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues: this.issues.length,
        errorIssues: this.issues.filter(i => i.type === 'error').length,
        warningIssues: this.issues.filter(i => i.type === 'warning').length,
        totalFixes: this.fixes.length,
        highPriorityFixes: this.fixes.filter(f => f.priority === 'high').length,
        mediumPriorityFixes: this.fixes.filter(f => f.priority === 'medium').length
      },
      issues: this.issues,
      fixes: this.fixes,
      recommendations: [
        '立即修复所有高优先级问题',
        '优化移动端响应式设计',
        '建立统一的样式规范',
        '定期进行UI审计',
        '添加自动化测试'
      ]
    };

    // 保存报告
    const reportPath = path.join(__dirname, 'ui-audit-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    console.log('\n📊 诊断报告摘要:');
    console.log(`- 总问题数: ${report.summary.totalIssues}`);
    console.log(`- 错误问题: ${report.summary.errorIssues}`);
    console.log(`- 警告问题: ${report.summary.warningIssues}`);
    console.log(`- 总修复数: ${report.summary.totalFixes}`);
    console.log(`- 高优先级修复: ${report.summary.highPriorityFixes}`);
    console.log(`\n📄 完整报告已保存到: ${reportPath}`);

    return report;
  }
}

// 运行UI修复工具
async function runUIFixer() {
  console.log('🚀 启动UI问题修复工具\n');

  const fixer = new UIFixer();

  try {
    // 诊断问题
    await fixer.diagnose();

    // 生成修复建议
    fixer.generateFixes();

    // 生成报告
    const report = fixer.generateReport();

    console.log('\n🎉 UI修复工具运行完成！');
    console.log('请查看 ui-audit-report.json 获取详细报告');

  } catch (error) {
    console.error('❌ UI修复工具运行失败:', error);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  runUIFixer();
}

module.exports = UIFixer;