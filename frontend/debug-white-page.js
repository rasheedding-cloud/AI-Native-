import { chromium } from 'playwright';

(async () => {
  console.log('🔍 诊断白页问题...');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  try {
    // 监听所有控制台消息
    const consoleMessages = [];
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      consoleMessages.push({ type, text });

      if (type === 'error') {
        console.log(`❌ 错误: ${text}`);
      } else if (type === 'warn') {
        console.log(`⚠️ 警告: ${text}`);
      } else if (text.includes('加载') || text.includes('API') || text.includes('Failed')) {
        console.log(`📝 ${type}: ${text}`);
      }
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.log(`🚨 页面错误: ${error.message}`);
      console.log(`   堆栈: ${error.stack}`);
    });

    // 监听网络请求失败
    page.on('requestfailed', request => {
      console.log(`🌐 网络请求失败: ${request.url()} - ${request.failure().errorText}`);
    });

    console.log('🌐 导航到页面...');
    await page.goto('http://localhost:5180');

    // 等待页面加载
    await page.waitForTimeout(3000);

    // 检查页面内容
    const pageContent = await page.content();
    const hasRoot = pageContent.includes('id="root"');
    const hasReactRoot = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root && root.innerHTML.length > 0;
    });

    console.log(`📄 有root元素: ${hasRoot}`);
    console.log(`📄 root有内容: ${hasReactRoot}`);

    // 检查React是否加载
    const reactLoaded = await page.evaluate(() => {
      return typeof React !== 'undefined';
    });
    console.log(`⚛️ React已加载: ${reactLoaded}`);

    // 检查ReactDOM
    const reactDOMLoaded = await page.evaluate(() => {
      return typeof ReactDOM !== 'undefined';
    });
    console.log(`⚛️ ReactDOM已加载: ${reactDOMLoaded}`);

    // 检查main.tsx是否加载
    const mainLoaded = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.some(script =>
        script.src && script.src.includes('/src/main.tsx')
      );
    });
    console.log(`📄 main.tsx已加载: ${mainLoaded}`);

    // 检查是否有内容渲染
    const renderedContent = await page.evaluate(() => {
      const root = document.getElementById('root');
      return root ? root.innerHTML : 'no root';
    });
    console.log(`📄 Root内容: ${renderedContent.substring(0, 200)}...`);

    // 统计错误
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warn');

    console.log(`📊 错误统计: ${errors.length}个错误, ${warnings.length}个警告`);

    if (errors.length > 0) {
      console.log('🔍 主要错误:');
      errors.slice(0, 5).forEach(err => {
        console.log(`   - ${err.text}`);
      });
    }

    // 截图
    await page.screenshot({
      path: 'white-page-debug.png',
      fullPage: true
    });
    console.log('📸 白页调试截图已保存');

  } catch (error) {
    console.error('❌ 诊断过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 白页诊断完成！');
})();