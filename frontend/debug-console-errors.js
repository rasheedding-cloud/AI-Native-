import { chromium } from 'playwright';

(async () => {
  console.log('🔍 调试控制台错误和模块加载...');

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
      } else if (text.includes('加载') || text.includes('API') || text.includes('Failed')) {
        console.log(`📝 ${type}: ${text}`);
      }
    });

    // 监听网络错误
    page.on('requestfailed', request => {
      console.log(`🌐 网络请求失败: ${request.url()} - ${request.failure().errorText}`);
    });

    // 监听页面错误
    page.on('pageerror', error => {
      console.log(`🚨 页面错误: ${error.message}`);
      console.log(`   堆栈: ${error.stack}`);
    });

    // 导航到仪表盘
    await page.goto('http://localhost:5184');

    try {
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      console.log('✅ 页面加载成功');
    } catch (e) {
      console.log('⚠️ 页面可能未完全加载');
    }

    // 等待一段时间以捕获所有错误
    await page.waitForTimeout(3000);

    // 尝试在页面上下文中检查模块
    const moduleCheck = await page.evaluate(() => {
      const results = {};

      // 检查React
      results.react = typeof React !== 'undefined';

      // 检查各种全局变量和模块
      results.useStore = typeof window.useStore !== 'undefined';
      results.store = typeof window.store !== 'undefined';

      // 检查常见的store访问方式
      try {
        results.storeImport = typeof useStore !== 'undefined';
      } catch (e) {
        results.storeImportError = e.message;
      }

      // 检查模块系统
      results.modules = typeof require !== 'undefined' ? 'CommonJS' :
                      typeof import.meta !== 'undefined' ? 'ESM' : 'Unknown';

      // 尝试访问App组件或全局状态
      results.globalVars = Object.keys(window).filter(key =>
        key.includes('store') || key.includes('Store') || key.includes('app') || key.includes('App')
      );

      return results;
    });

    console.log('📦 模块检查结果:', moduleCheck);

    // 检查具体的JavaScript错误
    const jsErrors = consoleMessages.filter(msg => msg.type === 'error');
    console.log(`🔍 发现 ${jsErrors.length} 个JavaScript错误:`);
    jsErrors.slice(0, 5).forEach(err => {
      console.log(`   - ${err.text}`);
    });

    // 尝试直接访问store
    const storeAccess = await page.evaluate(async () => {
      try {
        // 尝试动态导入store
        const storeModule = await import('/src/store/index.ts');
        return {
          success: true,
          storeAvailable: true,
          useStoreAvailable: typeof storeModule.useStore !== 'undefined'
        };
      } catch (e) {
        return {
          success: false,
          error: e.message,
          stack: e.stack
        };
      }
    });

    console.log('🏪 Store访问测试:', storeAccess);

    // 截图保存当前状态
    await page.screenshot({
      path: 'debug-console-errors.png',
      fullPage: true
    });
    console.log('📸 调试截图已保存');

  } catch (error) {
    console.error('❌ 调试过程中出现错误:', error);
  } finally {
    await browser.close();
  }

  console.log('🎉 控制台错误调试完成！');
})();