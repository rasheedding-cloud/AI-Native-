const { chromium } = require('playwright');

async function testDetailedLayout() {
  const browser = await chromium.launch({
    headless: false,
    viewport: { width: 1280, height: 720 }
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🔍 详细布局分析 - 周六白边问题...\n');

    await page.goto('http://localhost:5178/tasks');
    await page.waitForSelector('text=任务管理', { timeout: 10000 });

    console.log('📅 切换到日历视图...');
    await page.click('text=日历');
    await page.waitForTimeout(2000);

    console.log('📅 切换到周视图...');
    await page.locator('label', { hasText: '周' }).first().click();
    await page.waitForTimeout(3000);

    // 详细布局分析
    const layoutAnalysis = await page.evaluate(() => {
      const results = {};

      // 1. 从视窗角度分析
      results.viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      // 2. 找到所有相关的容器
      const allContainers = [];
      const findContainers = (element, depth = 0) => {
        if (depth > 10) return;

        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);

        if (rect.width > 100 && element.children.length > 0) {
          allContainers.push({
            tagName: element.tagName,
            className: element.className,
            id: element.id,
            rect: {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              top: Math.round(rect.top),
              bottom: Math.round(rect.bottom),
              width: Math.round(rect.width),
              height: Math.round(rect.height)
            },
            style: {
              overflow: style.overflow,
              overflowX: style.overflowX,
              overflowY: style.overflowY,
              marginLeft: style.marginLeft,
              marginRight: style.marginRight,
              paddingLeft: style.paddingLeft,
              paddingRight: style.paddingRight,
              borderLeft: style.borderLeftWidth,
              borderRight: style.borderRightWidth
            },
            childrenCount: element.children.length,
            depth: depth
          });
        }

        Array.from(element.children).forEach(child => findContainers(child, depth + 1));
      };

      findContainers(document.body);

      // 按宽度和深度排序，找到最相关的容器
      results.containers = allContainers
        .filter(c => c.rect.width > 500 && c.depth < 8)
        .sort((a, b) => b.rect.width - a.rect.width)
        .slice(0, 15);

      // 3. 特别检查周六元素的精确位置
      const saturdayElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const text = el.textContent || '';
          return text.includes('Sat27') || text.includes('Sat');
        })
        .map(el => {
          const rect = el.getBoundingClientRect();
          const parent = el.parentElement;
          const parentRect = parent?.getBoundingClientRect();

          return {
            text: el.textContent?.substring(0, 20),
            rect: {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            },
            parentInfo: parent ? {
              width: Math.round(parentRect?.width || 0),
              overflow: window.getComputedStyle(parent).overflow,
              overflowX: window.getComputedStyle(parent).overflowX
            } : null
          };
        });

      results.saturdayElements = saturdayElements;

      // 4. 检查所有可能造成约束的元素
      const constrainingElements = Array.from(document.querySelectorAll('*'))
        .filter(el => {
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          return (
            (style.overflow === 'hidden' || style.overflowX === 'hidden') &&
            rect.width > 300 &&
            rect.left < 1280 // 在视窗内的元素
          );
        })
        .map(el => {
          const rect = el.getBoundingClientRect();
          return {
            tagName: el.tagName,
            className: el.className,
            rect: {
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width)
            },
            style: {
              overflow: window.getComputedStyle(el).overflow,
              overflowX: window.getComputedStyle(el).overflowX
            }
          };
        });

      results.constrainingElements = constrainingElements;

      // 5. 计算周六距离视窗右边界的距离
      if (saturdayElements.length > 0) {
        const lastSaturday = saturdayElements[saturdayElements.length - 1];
        results.distanceToRightEdge = window.innerWidth - lastSaturday.rect.right;
        results.isSaturdayFullyVisible = lastSaturday.rect.right <= window.innerWidth;
      }

      return results;
    });

    console.log('📊 详细布局分析结果:');
    console.log(JSON.stringify(layoutAnalysis, null, 2));

    // 特别关注约束元素
    if (layoutAnalysis.constrainingElements && layoutAnalysis.constrainingElements.length > 0) {
      console.log('\n🚫 发现可能的约束元素:');
      layoutAnalysis.constrainingElements.forEach((el, index) => {
        console.log(`  ${index + 1}. ${el.tagName} (${el.className?.substring(0, 50)}...)`);
        console.log(`     位置: ${el.rect.left}-${el.rect.right}px, 宽度: ${el.rect.width}px`);
        console.log(`     溢出设置: ${el.style.overflow}, ${el.style.overflowX}`);
      });
    }

    // 周六可见性分析
    if (layoutAnalysis.saturdayElements && layoutAnalysis.saturdayElements.length > 0) {
      console.log('\n📅 周六可见性分析:');
      layoutAnalysis.saturdayElements.forEach((el, index) => {
        console.log(`  ${index + 1}. "${el.text}" - 位置: ${el.rect.left}-${el.rect.right}px`);
        if (el.parentInfo) {
          console.log(`     父容器宽度: ${el.parentInfo.width}px, 溢出: ${el.parentInfo.overflowX}`);
        }
      });
    }

    console.log(`\n📏 关键指标:`);
    console.log(`  视窗宽度: ${layoutAnalysis.viewport.width}px`);
    console.log(`  周六距右边界: ${layoutAnalysis.distanceToRightEdge}px`);
    console.log(`  周六完全可见: ${layoutAnalysis.isSaturdayFullyVisible}`);

    // 截图
    await page.screenshot({ path: 'test-results/detailed-layout-analysis.png' });

  } catch (error) {
    console.error('❌ 分析失败:', error);
  } finally {
    await browser.close();
  }
}

testDetailedLayout();