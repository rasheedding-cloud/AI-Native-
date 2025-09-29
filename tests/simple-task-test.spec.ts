import { test, expect } from '@playwright/test';

test.describe('任务管理功能简单测试', () => {
  test('任务页面加载和按钮测试', async ({ page }) => {
    // 导航到任务页面
    await page.goto('/tasks');
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // 检查页面标题
    await expect(page.getByRole('main').getByText('任务管理')).toBeVisible();

    // 检查新建任务按钮是否存在
    const createButton = page.locator('button:has-text("新建任务")');
    await expect(createButton).toBeVisible();

    // 点击新建任务按钮
    await createButton.click();

    // 等待模态框出现
    await page.waitForSelector('.ant-modal', { state: 'visible' });

    // 检查模态框标题
    await expect(page.locator('.ant-modal-title:has-text("新建任务")')).toBeVisible();

    // 填写任务名称
    await page.fill('input[placeholder="请输入任务名称"]', '简单测试任务');

    // 关闭模态框
    await page.click('.ant-modal-close');

    // 等待模态框关闭
    await page.waitForSelector('.ant-modal', { state: 'hidden' });

    console.log('任务页面基本功能测试通过');
  });

  test('任务API测试', async ({ request }) => {
    // 先创建一个项目
    const projectResponse = await request.post('http://localhost:3001/api/projects', {
      data: {
        name: 'API测试项目',
        description: '通过API测试创建的项目',
        initiativeId: 'cmfxk00ty0004p9fe8sedpqyf'
      }
    });

    expect(projectResponse.ok()).toBeTruthy();
    const projectData = await projectResponse.json();
    expect(projectData.success).toBe(true);

    // 创建任务
    const taskResponse = await request.post('http://localhost:3001/api/tasks', {
      data: {
        title: 'API测试任务',
        description: '通过API测试创建的任务',
        projectId: projectData.data.id,
        assignee: 'API测试',
        priority: '中',
        status: '未开始'
      }
    });

    expect(taskResponse.ok()).toBeTruthy();
    const taskData = await taskResponse.json();
    expect(taskData.success).toBe(true);
    expect(taskData.data.title).toBe('API测试任务');

    console.log('任务API测试通过');
  });
});