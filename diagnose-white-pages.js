#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 诊断白页问题 - 检查所有页面组件...\n');

// 检查页面组件的导入和导出
function checkComponentImports() {
  console.log('📦 检查页面组件导入和导出...');

  const pagesDir = path.join(__dirname, 'frontend/src/pages');
  const pages = [
    'Dashboard.tsx',
    'Strategies.tsx',
    'Initiatives.tsx',
    'Projects.tsx',
    'Tasks.tsx',
    'KPIs.tsx',
    'RiskManagement.tsx',
    'AIFeatures.tsx',
    'Settings.tsx'
  ];

  pages.forEach(page => {
    const filePath = path.join(pagesDir, page);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');

      // 检查是否正确的React组件导出
      const hasReactImport = content.includes('import React');
      const hasDefaultExport = content.includes('export default');
      const hasFunctionComponent = content.includes('React.FC') || content.includes('function') || content.includes('const');

      console.log(`\n📄 ${page}:`);
      console.log(`  ✅ React导入: ${hasReactImport ? '有' : '无'}`);
      console.log(`  ✅ 默认导出: ${hasDefaultExport ? '有' : '无'}`);
      console.log(`  ✅ 组件定义: ${hasFunctionComponent ? '有' : '无'}`);

      // 检查常见的语法问题
      const issues = [];

      if (content.includes('useState') && !content.includes('React')) {
        issues.push('useState但缺少React导入');
      }

      if (content.includes('useEffect') && !content.includes('React')) {
        issues.push('useEffect但缺少React导入');
      }

      if (content.includes('Modal') && content.includes('bodyStyle')) {
        issues.push('Modal使用了废弃的bodyStyle');
      }

      // 检查antdesign v5兼容性
      if (content.includes('message.')) {
        issues.push('可能使用了antdesign v4的message用法');
      }

      if (content.includes('notification.')) {
        issues.push('可能使用了antdesign v4的notification用法');
      }

      if (content.includes('Form.useForm') && content.includes('form.setFieldsValue')) {
        issues.push('可能使用了antdesign v4的form方法');
      }

      if (issues.length > 0) {
        console.log(`  ⚠️ 问题: ${issues.join(', ')}`);
      } else {
        console.log(`  ✅ 语法检查: 通过`);
      }
    } else {
      console.log(`❌ ${page}: 文件不存在`);
    }
  });
}

// 检查store导入
function checkStoreImports() {
  console.log('\n🗃️ 检查状态管理导入...');

  const storePath = path.join(__dirname, 'frontend/src/store/index.ts');
  if (fs.existsSync(storePath)) {
    const storeContent = fs.readFileSync(storePath, 'utf8');

    // 检查store是否正确导出
    const requiredExports = [
      'strategies',
      'initiatives',
      'projects',
      'tasks',
      'kpis',
      'loading',
      'error'
    ];

    console.log('📋 Store导出检查:');
    requiredExports.forEach(exp => {
      if (storeContent.includes(exp)) {
        console.log(`  ✅ ${exp}: 已导出`);
      } else {
        console.log(`  ❌ ${exp}: 未导出`);
      }
    });
  } else {
    console.log('❌ store/index.ts 不存在');
  }
}

// 检查API导入
function checkApiImports() {
  console.log('\n🌐 检查API服务导入...');

  const apiPath = path.join(__dirname, 'frontend/src/services/api.ts');
  if (fs.existsSync(apiPath)) {
    const apiContent = fs.readFileSync(apiPath, 'utf8');

    // 检查API是否正确导出
    const requiredApis = [
      'strategyApi',
      'initiativeApi',
      'projectApi',
      'taskApi',
      'kpiApi'
    ];

    console.log('📋 API导出检查:');
    requiredApis.forEach(api => {
      if (apiContent.includes(api)) {
        console.log(`  ✅ ${api}: 已导出`);
      } else {
        console.log(`  ❌ ${api}: 未导出`);
      }
    });
  } else {
    console.log('❌ services/api.ts 不存在');
  }
}

// 检查App.tsx路由导入
function checkAppImports() {
  console.log('\n🛣️ 检查App.tsx路由导入...');

  const appPath = path.join(__dirname, 'frontend/src/App.tsx');
  if (fs.existsSync(appPath)) {
    const appContent = fs.readFileSync(appPath, 'utf8');

    // 检查页面组件导入
    const requiredImports = [
      'Dashboard',
      'Strategies',
      'Initiatives',
      'Projects',
      'Tasks',
      'Kpis',
      'RiskManagement',
      'AIFeatures',
      'Settings'
    ];

    console.log('📋 页面组件导入检查:');
    requiredImports.forEach(imp => {
      if (appContent.includes(imp)) {
        console.log(`  ✅ ${imp}: 已导入`);
      } else {
        console.log(`  ❌ ${imp}: 未导入`);
      }
    });
  } else {
    console.log('❌ App.tsx 不存在');
  }
}

// 检查package.json依赖版本
function checkDependencies() {
  console.log('\n📦 检查依赖版本...');

  const packagePath = path.join(__dirname, 'frontend/package.json');
  if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    console.log('📋 关键依赖版本:');
    console.log(`  React: ${packageContent.dependencies?.react || '未安装'}`);
    console.log(`  React DOM: ${packageContent.dependencies?.['react-dom'] || '未安装'}`);
    console.log(`  React Router: ${packageContent.dependencies?.['react-router-dom'] || '未安装'}`);
    console.log(`  Antd: ${packageContent.dependencies?.antd || '未安装'}`);
    console.log(`  Zustand: ${packageContent.dependencies?.zustand || '未安装'}`);

    // 检查版本兼容性
    const antdVersion = packageContent.dependencies?.antd;
    if (antdVersion && !antdVersion.startsWith('5')) {
      console.log(`  ⚠️ Antd版本不是v5，可能存在兼容性问题`);
    }
  } else {
    console.log('❌ frontend/package.json 不存在');
  }
}

// 主诊断流程
function main() {
  console.log('='.repeat(60));
  console.log('🔍 AI Native项目管理工具 - 白页问题诊断');
  console.log('='.repeat(60));

  checkComponentImports();
  checkStoreImports();
  checkApiImports();
  checkAppImports();
  checkDependencies();

  console.log('\n✅ 诊断完成');
  console.log('📍 如果问题仍然存在，请检查浏览器控制台的JavaScript错误信息');
  console.log('='.repeat(60));
}

main();