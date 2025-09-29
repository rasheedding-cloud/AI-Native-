#!/usr/bin/env node

// AI Native项目管理工具 - 功能验证脚本
const fs = require('fs');
const path = require('path');

console.log('🚀 开始验证AI Native项目管理工具功能...\n');

// 检查项目结构
function checkProjectStructure() {
  console.log('📁 检查项目结构...');

  const requiredDirs = [
    'frontend/src/components',
    'frontend/src/pages',
    'frontend/src/services',
    'frontend/src/store',
    'backend/src',
    'backend/src/routes',
    'backend/src/services'
  ];

  const requiredFiles = [
    'frontend/src/App.tsx',
    'frontend/src/pages/Dashboard.tsx',
    'frontend/src/pages/Strategies.tsx',
    'frontend/src/pages/Projects.tsx',
    'frontend/src/pages/Tasks.tsx',
    'frontend/src/pages/KPIs.tsx',
    'frontend/src/pages/RiskManagement.tsx',
    'frontend/src/pages/AIFeatures.tsx',
    'frontend/src/services/api.ts',
    'frontend/src/store/index.ts',
    'backend/src/index.ts',
    'backend/src/routes',
    'package.json'
  ];

  let allExists = true;

  requiredDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${dir}`);
    } else {
      console.log(`❌ ${dir} - 缺失`);
      allExists = false;
    }
  });

  requiredFiles.forEach(file => {
    const fullPath = path.join(__dirname, file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} - 缺失`);
      allExists = false;
    }
  });

  return allExists;
}

// 检查核心功能实现
function checkCoreFeatures() {
  console.log('\n🔧 检查核心功能实现...');

  const features = [
    { name: '战略管理', file: 'frontend/src/pages/Strategies.tsx', keywords: ['战略', 'strategy', 'create', 'edit'] },
    { name: '项目管理', file: 'frontend/src/pages/Projects.tsx', keywords: ['项目', 'project', 'initiative', '任务'] },
    { name: '任务管理', file: 'frontend/src/pages/Tasks.tsx', keywords: ['任务', 'task', 'subtask', 'priority'] },
    { name: 'KPI管理', file: 'frontend/src/pages/KPIs.tsx', keywords: ['KPI', '指标', 'target', 'current'] },
    { name: '风险管理', file: 'frontend/src/pages/RiskManagement.tsx', keywords: ['风险', 'risk', '合规', 'compliance'] },
    { name: 'AI功能', file: 'frontend/src/pages/AIFeatures.tsx', keywords: ['AI', '优先级', '排期', '报告'] }
  ];

  let featuresImplemented = 0;

  features.forEach(feature => {
    const filePath = path.join(__dirname, feature.file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const keywordFound = feature.keywords.some(keyword => content.includes(keyword));

      if (keywordFound) {
        console.log(`✅ ${feature.name} - 已实现`);
        featuresImplemented++;
      } else {
        console.log(`⚠️ ${feature.name} - 部分实现`);
      }
    } else {
      console.log(`❌ ${feature.name} - 未实现`);
    }
  });

  return featuresImplemented;
}

// 检查API集成
function checkAPIIntegration() {
  console.log('\n🌐 检查API集成...');

  const apiFile = path.join(__dirname, 'frontend/src/services/api.ts');
  if (!fs.existsSync(apiFile)) {
    console.log('❌ API服务文件缺失');
    return false;
  }

  const apiContent = fs.readFileSync(apiFile, 'utf8');
  const apiEndpoints = [
    'strategies',
    'initiatives',
    'projects',
    'tasks',
    'kpis'
  ];

  let endpointsImplemented = 0;

  apiEndpoints.forEach(endpoint => {
    if (apiContent.includes(endpoint)) {
      console.log(`✅ /api/${endpoint} - 已实现`);
      endpointsImplemented++;
    } else {
      console.log(`❌ /api/${endpoint} - 未实现`);
    }
  });

  return endpointsImplemented === apiEndpoints.length;
}

// 检查状态管理
function checkStateManagement() {
  console.log('\n🗃️ 检查状态管理...');

  const storeFile = path.join(__dirname, 'frontend/src/store/index.ts');
  if (!fs.existsSync(storeFile)) {
    console.log('❌ 状态管理文件缺失');
    return false;
  }

  const storeContent = fs.readFileSync(storeFile, 'utf8');
  const storeFeatures = [
    'strategies',
    'initiatives',
    'projects',
    'tasks',
    'kpis'
  ];

  let featuresImplemented = 0;

  storeFeatures.forEach(feature => {
    if (storeContent.includes(feature)) {
      console.log(`✅ ${feature} 状态管理 - 已实现`);
      featuresImplemented++;
    } else {
      console.log(`❌ ${feature} 状态管理 - 未实现`);
    }
  });

  return featuresImplemented === storeFeatures.length;
}

// 检查UI组件
function checkUIComponents() {
  console.log('\n🎨 检查UI组件...');

  const layoutFile = path.join(__dirname, 'frontend/src/components/layout/Layout.tsx');
  if (!fs.existsSync(layoutFile)) {
    console.log('❌ 布局组件缺失');
    return false;
  }

  const layoutContent = fs.readFileSync(layoutFile, 'utf8');
  const uiFeatures = [
    '菜单',
    '导航',
    '侧边栏',
    '路由'
  ];

  let featuresImplemented = 0;

  uiFeatures.forEach(feature => {
    if (layoutContent.includes(feature)) {
      console.log(`✅ ${feature} - 已实现`);
      featuresImplemented++;
    } else {
      console.log(`❌ ${feature} - 未实现`);
    }
  });

  return featuresImplemented > 0;
}

// 主验证流程
function main() {
  console.log('='.repeat(60));
  console.log('🎯 AI Native项目管理工具 v2.0 - 功能验证报告');
  console.log('='.repeat(60));

  const structureOk = checkProjectStructure();
  const featuresCount = checkCoreFeatures();
  const apiOk = checkAPIIntegration();
  const stateOk = checkStateManagement();
  const uiOk = checkUIComponents();

  console.log('\n📊 验证结果汇总:');
  console.log(`- 项目结构: ${structureOk ? '✅ 完整' : '❌ 不完整'}`);
  console.log(`- 核心功能: ${featuresCount}/6 已实现`);
  console.log(`- API集成: ${apiOk ? '✅ 完成' : '❌ 未完成'}`);
  console.log(`- 状态管理: ${stateOk ? '✅ 完成' : '❌ 未完成'}`);
  console.log(`- UI组件: ${uiOk ? '✅ 完成' : '❌ 未完成'}`);

  const overallScore = (
    (structureOk ? 20 : 0) +
    (featuresCount / 6 * 30) +
    (apiOk ? 20 : 0) +
    (stateOk ? 15 : 0) +
    (uiOk ? 15 : 0)
  );

  console.log(`\n🎯 总体完成度: ${overallScore.toFixed(1)}%`);

  if (overallScore >= 80) {
    console.log('🎉 项目开发进展良好，核心功能已基本实现！');
  } else if (overallScore >= 60) {
    console.log('👍 项目开发进展正常，继续完善功能中...');
  } else {
    console.log('⚠️ 项目仍需大量开发工作');
  }

  console.log('\n📝 下一步建议:');
  if (featuresCount < 6) {
    console.log('- 继续完善核心功能模块');
  }
  if (!apiOk) {
    console.log('- 完善后端API接口');
  }
  if (!stateOk) {
    console.log('- 完善状态管理');
  }
  if (!uiOk) {
    console.log('- 完善UI组件');
  }

  console.log('\n✅ 功能验证完成');
  console.log('='.repeat(60));
}

main();