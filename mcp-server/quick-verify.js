const { chromium } = require('playwright');

async function quickVerify() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 开始快速验证 UI 修复效果...');

    // 1. 导航到项目首页
    console.log('📍 导航到项目首页...');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');

    // 2. 检查页面标题
    console.log('\n📄 检查页面标题...');

    const pages = [
      { name: '战略管理', selector: 'text=战略管理', expectedTitle: '🎯 战略管理' },
      { name: '战役管理', selector: 'text=战役管理', expectedTitle: '⚔️ 战役管理' },
      { name: '项目管理', selector: 'text=项目管理', expectedTitle: '📊 项目管理' },
      { name: '任务管理', selector: 'text=任务管理', expectedTitle: '✅ 任务管理' },
      { name: 'KPI管理', selector: 'text=KPI管理', expectedTitle: '🎯 KPI管理' },
      { name: 'AI功能', selector: 'text=AI功能', expectedTitle: '🤖 AI功能' }
    ];

    let passedTitles = 0;

    for (const pageInfo of pages) {
      try {
        await page.click(pageInfo.selector);
        await page.waitForLoadState('networkidle');

        const title = await page.locator('.ant-card-title').first().textContent();
        const hasCorrectTitle = title === pageInfo.expectedTitle;

        if (hasCorrectTitle) passedTitles++;

        console.log(`${hasCorrectTitle ? '✅' : '❌'} ${pageInfo.name}: ${title}`);

        // 返回首页
        await page.goto('http://localhost:5173');
        await page.waitForLoadState('networkidle');

      } catch (error) {
        console.log(`❌ ${pageInfo.name}: 访问失败`);
      }
    }

    // 3. 检查搜索框和按钮
    console.log('\n🔧 检查搜索框和按钮...');

    await page.click('text=战略管理');
    await page.waitForLoadState('networkidle');

    const searchInput = await page.locator('input[placeholder*="搜索"]').count();
    const createButton = await page.locator('button:has-text("创建战略")').count();

    console.log(`✅ 搜索框: ${searchInput > 0 ? '存在' : '不存在'}`);
    console.log(`✅ 创建按钮: ${createButton > 0 ? '存在' : '不存在'}`);

    // 4. 检查AI功能页面
    console.log('\n🤖 检查AI功能页面...');

    await page.click('text=AI功能');
    await page.waitForLoadState('networkidle');

    const aiTitle = await page.locator('.ant-card-title').first().textContent();
    const tabs = await page.locator('.ant-tabs-tab').count();

    console.log(`✅ AI页面标题: ${aiTitle}`);
    console.log(`✅ 功能标签数: ${tabs}`);

    // 5. 计算完成度
    const totalChecks = pages.length + 2 + 2;
    const passedChecks = passedTitles +
                          (searchInput > 0 ? 1 : 0) +
                          (createButton > 0 ? 1 : 0) +
                          (tabs > 0 ? 1 : 0) +
                          (aiTitle === '🤖 AI功能' ? 1 : 0);

    const completionRate = Math.round((passedChecks / totalChecks) * 100);

    console.log('\n🎯 修复完成度:');
    console.log(`✅ 通过检查: ${passedChecks}/${totalChecks}`);
    console.log(`✅ 完成率: ${completionRate}%`);

    // 6. 最终评价
    console.log('\n🎉 UI 修复验证完成！');
    if (completionRate >= 90) {
      console.log('🏆 优秀！几乎所有问题都已修复');
    } else if (completionRate >= 80) {
      console.log('👍 良好！大部分问题已修复');
    } else if (completionRate >= 70) {
      console.log('👌 合格！主要问题已修复');
    } else {
      console.log('⚠️ 需要进一步修复');
    }

    return { completionRate, passedChecks, totalChecks };

  } catch (error) {
    console.error('❌ 验证失败:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// 运行快速验证
quickVerify().then((results) => {
  if (results.error) {
    console.log('❌ 验证过程中出现错误:', results.error);
  } else {
    console.log(`\n📊 总体评分: ${results.completionRate}/100`);
  }
}).catch(console.error);