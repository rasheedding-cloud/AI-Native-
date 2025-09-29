import { chromium } from "playwright";

async function testPlaywright() {
  // 启动浏览器
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // 导航到项目前端
    console.log("正在导航到项目前端...");
    await page.goto("http://localhost:5173");

    // 等待页面加载
    await page.waitForTimeout(2000);

    // 获取页面标题
    const title = await page.title();
    console.log("页面标题:", title);

    // 截图
    await page.screenshot({ path: "screenshot.png" });
    console.log("截图已保存到: screenshot.png");

    // 获取页面内容
    const bodyText = await page.textContent("body");
    console.log("页面内容预览:", bodyText?.substring(0, 200) + "...");

  } catch (error) {
    console.error("测试失败:", error);
  } finally {
    // 关闭浏览器
    await browser.close();
  }
}

// 运行测试
testPlaywright().catch(console.error);