const { chromium } = require('playwright');

async function debugWeekDOM() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🚀 调试周视图DOM结构...\n');

    // 启用控制台日志
    page.on('console', msg => {
      console.log(`控制台: ${msg.text()}`);
    });

    // 访问任务管理页面
    await page.goto('http://localhost:5176/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    // 切换到日历视图
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    // 切换到周视图
    await page.click('label:has-text("周")');
    await page.waitForTimeout(3000);

    // 获取周视图的DOM结构
    const weekView = await page.$('.week-view');
    if (weekView) {
      console.log('\n📅 周视图DOM结构分析:');

      // 获取完整的HTML内容
      const weekViewHTML = await weekView.innerHTML();
      console.log('周视图HTML长度:', weekViewHTML.length);
      console.log('周视图HTML预览:', weekViewHTML.substring(0, 500));

      // 查找所有div元素及其样式
      const allDivs = await weekView.$$eval('div', divs =>
        divs.map(div => ({
          text: div.textContent?.substring(0, 20),
          style: div.getAttribute('style')?.substring(0, 50),
          class: div.getAttribute('class')
        }))
      );
      console.log('\n📅 发现的div元素:', allDivs.length);

      // 查找包含时间格式的div
      const timeDivs = allDivs.filter(div =>
        div.text && div.text.includes(':')
      );
      console.log('📅 包含时间的div:', timeDivs);

      // 查找宽度为80px的div（时间轴）
      const width80Divs = allDivs.filter(div =>
        div.style && div.style.includes('80px')
      );
      console.log('📅 宽度80px的div:', width80Divs);

      // 查找高度为40px的div（时间槽）
      const height40Divs = allDivs.filter(div =>
        div.style && div.style.includes('40px')
      );
      console.log('📅 高度40px的div:', height40Divs.length, '个');

      // 检查具体的时间显示
      const timeTexts = await weekView.$$eval('div', divs =>
        divs.map(div => div.textContent?.trim()).filter(text =>
          text && text.match(/\d{2}:\d{2}/)
        )
      );
      console.log('📅 发现的时间格式文本:', timeTexts);

      // 检查周视图标题
      const weekViewTitle = await weekView.$eval('div', div =>
        div.textContent?.includes('周视图测试')
      ).catch(() => false);
      console.log('📅 周视图标题存在:', weekViewTitle);

      // 截图
      await page.screenshot({ path: 'debug-results/week-dom-debug.png' });
    }

  } catch (error) {
    console.error('❌ 调试失败:', error);
  } finally {
    await browser.close();
  }
}

debugWeekDOM();