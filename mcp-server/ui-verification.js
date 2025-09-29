const { chromium } = require('playwright');

async function verifyUIFixes() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 开始验证 UI 修复效果...');

    // 1. 导航到项目首页
    console.log('📍 导航到项目首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 2. 检查页面标题
    const checkPageTitles = async () => {
      console.log('\n📄 检查页面标题...');

      const pages = [
        { name: '战略管理', selector: 'text=战略管理', expectedTitle: '🎯 战略管理' },
        { name: '战役管理', selector: 'text=战役管理', expectedTitle: '⚔️ 战役管理' },
        { name: '项目管理', selector: 'text=项目管理', expectedTitle: '📊 项目管理' },
        { name: '任务管理', selector: 'text=任务管理', expectedTitle: '✅ 任务管理' },
        { name: 'KPI管理', selector: 'text=KPI管理', expectedTitle: '🎯 KPI管理' },
        { name: 'AI功能', selector: 'text=AI功能', expectedTitle: '🤖 AI功能' }
      ];

      const results = [];

      for (const pageInfo of pages) {
        try {
          await page.click(pageInfo.selector);
          await page.waitForLoadState('networkidle');

          const title = await page.locator('.ant-card-title').first().textContent();
          const hasCorrectTitle = title === pageInfo.expectedTitle;

          results.push({
            page: pageInfo.name,
            expected: pageInfo.expectedTitle,
            actual: title,
            passed: hasCorrectTitle
          });

          console.log(`${hasCorrectTitle ? '✅' : '❌'} ${pageInfo.name}: ${title}`);
        } catch (error) {
          results.push({
            page: pageInfo.name,
            expected: pageInfo.expectedTitle,
            actual: '访问失败',
            passed: false
          });
          console.log(`❌ ${pageInfo.name}: 访问失败`);
        }
      }

      return results;
    };

    // 3. 检查功能按钮
    const checkFunctionButtons = async () => {
      console.log('\n🔧 检查功能按钮...');

      await page.click('text=战略管理');
      await page.waitForLoadState('networkidle');

      const buttons = await page.locator('button').count();
      const createButton = await page.locator('button:has-text("创建战略")').count();
      const searchInput = await page.locator('input[placeholder*="搜索"]').count();

      console.log(`✅ 按钮总数: ${buttons}`);
      console.log(`✅ 创建按钮: ${createButton > 0 ? '存在' : '不存在'}`);
      console.log(`✅ 搜索框: ${searchInput > 0 ? '存在' : '不存在'}`);

      return {
        buttons,
        hasCreateButton: createButton > 0,
        hasSearchInput: searchInput > 0
      };
    };

    // 4. 检查数据展示
    const checkDataDisplay = async () => {
      console.log('\n📊 检查数据展示...');

      await page.click('text=战略管理');
      await page.waitForLoadState('networkidle');

      const tableRows = await page.locator('.ant-table-tbody tr').count();
      const cards = await page.locator('.ant-card').count();

      console.log(`✅ 表格行数: ${tableRows}`);
      console.log(`✅ 卡片数量: ${cards}`);

      return {
        tableRows,
        cards,
        hasData: tableRows > 0 || cards > 0
      };
    };

    // 5. 检查AI功能页面
    const checkAIFeatures = async () => {
      console.log('\n🤖 检查AI功能页面...');

      await page.click('text=AI功能');
      await page.waitForLoadState('networkidle');

      const aiTitle = await page.locator('.ant-card-title').first().textContent();
      const tabs = await page.locator('.ant-tabs-tab').count();

      console.log(`✅ AI页面标题: ${aiTitle}`);
      console.log(`✅ AI功能标签数: ${tabs}`);

      return {
        title: aiTitle,
        tabs,
        hasAIFeatures: tabs > 0
      };
    };

    // 6. 执行所有检查
    const titleResults = await checkPageTitles();
    const buttonResults = await checkFunctionButtons();
    const dataResults = await checkDataDisplay();
    const aiResults = await checkAIFeatures();

    // 7. 生成修复报告
    console.log('\n📋 UI 修复验证报告:');
    console.log('='.repeat(50));

    console.log('\n📄 页面标题修复:');
    titleResults.forEach(result => {
      console.log(`${result.passed ? '✅' : '❌'} ${result.page}: ${result.expected}`);
    });

    console.log('\n🔧 功能按钮修复:');
    console.log(`✅ 创建按钮: ${buttonResults.hasCreateButton ? '已添加' : '缺失'}`);
    console.log(`✅ 搜索框: ${buttonResults.hasSearchInput ? '已添加' : '缺失'}`);

    console.log('\n📊 数据展示:');
    console.log(`✅ 数据加载: ${dataResults.hasData ? '正常' : '无数据'}`);
    console.log(`✅ 表格行数: ${dataResults.tableRows}`);
    console.log(`✅ 卡片数量: ${dataResults.cards}`);

    console.log('\n🤖 AI功能页面:');
    console.log(`✅ 页面标题: ${aiResults.title}`);
    console.log(`✅ 功能标签: ${aiResults.tabs} 个`);

    // 8. 计算修复完成度
    const totalChecks = titleResults.length + 3 + 2 + 2;
    const passedChecks = titleResults.filter(r => r.passed).length +
                          (buttonResults.hasCreateButton ? 1 : 0) +
                          (buttonResults.hasSearchInput ? 1 : 0) +
                          (dataResults.hasData ? 1 : 0) +
                          (aiResults.hasAIFeatures ? 1 : 0) +
                          (aiResults.title === '🤖 AI功能' ? 1 : 0);

    const completionRate = Math.round((passedChecks / totalChecks) * 100);

    console.log('\n🎯 修复完成度:');
    console.log(`✅ 通过检查: ${passedChecks}/${totalChecks}`);
    console.log(`✅ 完成率: ${completionRate}%`);

    // 9. 截图保存
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'ui-verification-final.png' });

    console.log('\n📸 最终验证截图已保存: ui-verification-final.png');

    return {
      titleResults,
      buttonResults,
      dataResults,
      aiResults,
      completionRate,
      totalChecks,
      passedChecks
    };

  } catch (error) {
    console.error('❌ UI 验证失败:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// 运行验证
verifyUIFixes().then((results) => {
  if (results.error) {
    console.log('❌ 验证过程中出现错误:', results.error);
  } else {
    console.log('\n🎉 UI 修复验证完成！');
    console.log(`📊 总体评分: ${results.completionRate}/100`);

    if (results.completionRate >= 90) {
      console.log('🏆 优秀！几乎所有问题都已修复');
    } else if (results.completionRate >= 80) {
      console.log('👍 良好！大部分问题已修复');
    } else if (results.completionRate >= 70) {
      console.log('👌 合格！主要问题已修复');
    } else {
      console.log('⚠️ 需要进一步修复');
    }
  }
}).catch(console.error);