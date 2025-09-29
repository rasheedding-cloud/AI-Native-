#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 开始诊断页面白页问题...\n');

// 检查前端服务状态
function checkFrontendService() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5178,
      path: '/',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ 前端服务状态: ${res.statusCode} ${res.statusMessage}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ 前端服务连接失败: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ 前端服务请求超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 检查后端服务状态
function checkBackendService() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: '/api/strategies',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      console.log(`✅ 后端服务状态: ${res.statusCode} ${res.statusMessage}`);
      resolve(true);
    });

    req.on('error', (err) => {
      console.log(`❌ 后端服务连接失败: ${err.message}`);
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('⏰ 后端服务请求超时');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// 检查页面文件是否存在
function checkPageFiles() {
  console.log('\n📁 检查页面文件...');

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

  const pagesDir = path.join(__dirname, 'frontend/src/pages');

  pages.forEach(page => {
    const filePath = path.join(pagesDir, page);
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      console.log(`✅ ${page} - 存在 (${Math.round(stats.size / 1024)}KB)`);
    } else {
      console.log(`❌ ${page} - 缺失`);
    }
  });
}

// 检查关键依赖
function checkDependencies() {
  console.log('\n📦 检查关键依赖...');

  const packageJsonPath = path.join(__dirname, 'frontend/package.json');
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    const dependencies = packageJson.dependencies || {};

    const criticalDeps = [
      'react',
      'react-dom',
      'antd',
      '@ant-design/icons',
      'react-router-dom',
      'zustand'
    ];

    criticalDeps.forEach(dep => {
      if (dependencies[dep]) {
        console.log(`✅ ${dep}: ${dependencies[dep]}`);
      } else {
        console.log(`❌ ${dep}: 缺失`);
      }
    });
  } else {
    console.log('❌ frontend/package.json 不存在');
  }
}

// 检查路由配置
function checkRouteConfig() {
  console.log('\n🛣️ 检查路由配置...');

  const appTsxPath = path.join(__dirname, 'frontend/src/App.tsx');
  if (fs.existsSync(appTsxPath)) {
    const content = fs.readFileSync(appTsxPath, 'utf8');
    const routes = [
      '/strategies',
      '/initiatives',
      '/projects',
      '/tasks',
      '/kpis',
      '/risks',
      '/ai',
      '/settings'
    ];

    routes.forEach(route => {
      if (content.includes(`path="${route}"`)) {
        console.log(`✅ ${route} 路由已配置`);
      } else {
        console.log(`❌ ${route} 路由未配置`);
      }
    });
  } else {
    console.log('❌ App.tsx 不存在');
  }
}

// 检查可能的语法错误
function checkSyntaxErrors() {
  console.log('\n🔍 检查常见语法错误...');

  const pagesDir = path.join(__dirname, 'frontend/src/pages');
  const pageFiles = fs.readdirSync(pagesDir).filter(file => file.endsWith('.tsx'));

  pageFiles.forEach(file => {
    const filePath = path.join(pagesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // 检查常见的语法问题
    const issues = [];

    if (content.includes('bodyStyle') && content.includes('Modal')) {
      issues.push('使用了已废弃的 bodyStyle 属性');
    }

    if (content.includes('import') && !content.includes('from')) {
      issues.push('import 语句可能有问题');
    }

    if (content.includes('useState') && !content.includes('React')) {
      issues.push('可能缺少 React import');
    }

    if (issues.length > 0) {
      console.log(`⚠️ ${file}: ${issues.join(', ')}`);
    } else {
      console.log(`✅ ${file}: 语法检查通过`);
    }
  });
}

// 主诊断流程
async function main() {
  console.log('='.repeat(60));
  console.log('🔍 AI Native项目管理工具 - 页面白页问题诊断');
  console.log('='.repeat(60));

  const frontendOk = await checkFrontendService();
  const backendOk = await checkBackendService();

  checkPageFiles();
  checkDependencies();
  checkRouteConfig();
  checkSyntaxErrors();

  console.log('\n📊 诊断结果汇总:');
  console.log(`- 前端服务: ${frontendOk ? '✅ 正常' : '❌ 异常'}`);
  console.log(`- 后端服务: ${backendOk ? '✅ 正常' : '❌ 异常'}`);

  if (frontendOk && backendOk) {
    console.log('\n🎯 建议: 如果服务正常但页面仍有白页，请检查浏览器控制台的具体JavaScript错误信息。');
    console.log('📍 前端服务地址: http://localhost:5178');
    console.log('📍 后端服务地址: http://localhost:3001');
  } else {
    console.log('\n🔧 建议: 请先启动异常的服务');
  }

  console.log('\n✅ 诊断完成');
  console.log('='.repeat(60));
}

main();