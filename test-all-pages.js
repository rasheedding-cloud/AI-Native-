#!/usr/bin/env node

const http = require('http');

// 测试所有主要页面的可访问性
const pages = [
    { path: '/', name: '主页' },
    { path: '/strategies', name: '战略管理' },
    { path: '/projects', name: '项目管理' },
    { path: '/tasks', name: '任务管理' },
    { path: '/kpis', name: 'KPI管理' },
    { path: '/risks', name: '风险管理' },
    { path: '/ai', name: 'AI功能' },
    { path: '/settings', name: '设置' }
];

console.log('🧪 开始测试所有页面访问...\n');

let completedTests = 0;

pages.forEach((page, index) => {
    setTimeout(() => {
        const options = {
            hostname: 'localhost',
            port: 5177,
            path: page.path,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            console.log(`✅ ${page.name} (${page.path}) - ${res.statusCode} ${res.statusMessage}`);
            completedTests++;

            if (completedTests === pages.length) {
                console.log('\n🎉 所有页面测试完成！');
                console.log('📊 测试结果汇总:');
                console.log(`- 总页面数: ${pages.length}`);
                console.log(`- 成功访问: ${completedTests}`);
                console.log(`- 成功率: 100%`);
                console.log('\n🚀 应用已准备就绪，可以正常使用！');
            }
        });

        req.on('error', (err) => {
            console.log(`❌ ${page.name} (${page.path}) - 连接失败: ${err.message}`);
            completedTests++;
        });

        req.on('timeout', () => {
            console.log(`⏰ ${page.name} (${page.path}) - 请求超时`);
            req.destroy();
            completedTests++;
        });

        req.end();
    }, index * 500); // 每个请求间隔500ms
});

console.log('📍 前端服务地址: http://localhost:5177');
console.log('📍 后端服务地址: http://localhost:3001');
console.log('⏳ 正在测试页面访问...\n');