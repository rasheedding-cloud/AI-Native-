#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 深度诊断页面白页问题...\n');

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

      if (content.includes('import') && content.includes('from') && content.includes('\'./')) {
        // 检查相对路径导入
        const relativeImports = content.match(/import.*from\s+['"]\.\//g);
        if (relativeImports) {
          relativeImports.forEach(imp => {
            const match = imp.match(/from\s+['"]\.\.\/(.*)['"]/);
            if (match) {
              const importPath = match[1];
              const fullPath = path.join(pagesDir, '..', importPath);
              if (!fs.existsSync(fullPath)) {
                issues.push(`导入路径不存在: ${importPath}`);
              }
            }
          });
        }
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

// 模拟浏览器请求检查具体错误
function testPageWithDetails() {
  console.log('\n🧪 详细页面测试...');

  const pages = [
    { path: '/initiatives', name: '战役管理' },
    { path: '/projects', name: '项目管理' },
    { path: '/tasks', name: '任务管理' },
    { path: '/kpis', name: 'KPI管理' },
    { path: '/risks', name: '风险管理' },
    { path: '/ai', name: 'AI功能' },
    { path: '/settings', name: '设置' }
  ];

  pages.forEach((page, index) => {
    setTimeout(() => {
      const options = {
        hostname: 'localhost',
        port: 5178,
        path: page.path,
        method: 'GET',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      };

      const req = http.request(options, (res) => {
        console.log(`\n📄 ${page.name} (${page.path}):`);
        console.log(`  状态码: ${res.statusCode} ${res.statusMessage}`);
        console.log(`  Content-Type: ${res.headers['content-type']}`);
        console.log(`  Content-Length: ${res.headers['content-length'] || '未知'}`);

        if (res.statusCode === 200) {
          console.log(`  ✅ 页面可访问`);
        } else {
          console.log(`  ❌ 页面访问失败`);
        }
      });

      req.on('error', (err) => {
        console.log(`\n📄 ${page.name} (${page.path}):`);
        console.log(`  ❌ 连接失败: ${err.message}`);
      });

      req.on('timeout', () => {
        console.log(`\n📄 ${page.name} (${page.path}):`);
        console.log(`  ⏰ 请求超时`);
        req.destroy();
      });

      req.end();
    }, index * 1000);
  });
}

// 主诊断流程
function main() {
  console.log('='.repeat(60));
  console.log('🔍 AI Native项目管理工具 - 深度白页问题诊断');
  console.log('='.repeat(60));

  checkComponentImports();
  checkStoreImports();
  checkApiImports();
  checkAppImports();
  testPageWithDetails();

  console.log('\n✅ 深度诊断完成');
  console.log('📍 如果问题仍然存在，请检查浏览器控制台的JavaScript错误信息');
  console.log('='.repeat(60));
}

main();