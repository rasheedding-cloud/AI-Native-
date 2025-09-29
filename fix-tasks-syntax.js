#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 修复Tasks.tsx语法错误...\n');

const tasksPath = path.join(__dirname, 'frontend/src/pages/Tasks.tsx');

if (fs.existsSync(tasksPath)) {
  let content = fs.readFileSync(tasksPath, 'utf8');

  // 查找包含语法错误的行
  const lines = content.split('\n');
  let foundError = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检查是否有语法错误模式
    if (line.includes('Array.isArray(tasks) ? tasks.filter') && line.includes(': []}')) {
      console.log(`🔍 发现问题行 ${i + 1}: ${line.trim()}`);

      // 修复语法错误
      const fixedLine = line.replace(/(\.map\(.*?\))\s*:\s*\[\]\}/, '$1)) : []}');
      lines[i] = fixedLine;
      console.log(`✅ 修复后: ${fixedLine.trim()}`);
      foundError = true;
      break;
    }
  }

  if (foundError) {
    // 写回文件
    fs.writeFileSync(tasksPath, lines.join('\n'), 'utf8');
    console.log('\n✅ Tasks.tsx语法错误已修复');
  } else {
    console.log('❌ 未发现语法错误');
  }
} else {
  console.log('❌ Tasks.tsx文件不存在');
}

console.log('\n📍 请刷新浏览器查看修复效果');