#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const playwright_1 = require("playwright");
const zod_1 = require("zod");
// 定义工具参数的 schema
const NavigateSchema = zod_1.z.object({
    url: zod_1.z.string().url(),
});
const ClickSchema = zod_1.z.object({
    selector: zod_1.z.string(),
});
const FillSchema = zod_1.z.object({
    selector: zod_1.z.string(),
    value: zod_1.z.string(),
});
const ScreenshotSchema = zod_1.z.object({
    selector: zod_1.z.string().optional(),
    path: zod_1.z.string().optional(),
});
const GetTextSchema = zod_1.z.object({
    selector: zod_1.z.string(),
});
const WaitSchema = zod_1.z.object({
    selector: zod_1.z.string().optional(),
    timeout: zod_1.z.number().optional(),
});
// 创建 MCP 服务器
const server = new index_js_1.Server({
    name: "playwright-mcp-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// 浏览器实例
let browser = null;
let page = null;
// 初始化浏览器
async function initializeBrowser() {
    if (!browser) {
        browser = await playwright_1.chromium.launch({ headless: true });
        const context = await browser.newContext();
        page = await context.newPage();
    }
    return page;
}
// 清理资源
async function cleanup() {
    if (browser) {
        await browser.close();
        browser = null;
        page = null;
    }
}
// 列出可用工具
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "playwright_navigate",
                description: "导航到指定URL",
                inputSchema: {
                    type: "object",
                    properties: {
                        url: {
                            type: "string",
                            description: "要导航到的URL",
                        },
                    },
                    required: ["url"],
                },
            },
            {
                name: "playwright_click",
                description: "点击指定元素",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: {
                            type: "string",
                            description: "CSS选择器",
                        },
                    },
                    required: ["selector"],
                },
            },
            {
                name: "playwright_fill",
                description: "在指定输入框中填写文本",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: {
                            type: "string",
                            description: "CSS选择器",
                        },
                        value: {
                            type: "string",
                            description: "要填写的文本",
                        },
                    },
                    required: ["selector", "value"],
                },
            },
            {
                name: "playwright_screenshot",
                description: "截图或截取指定元素",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: {
                            type: "string",
                            description: "CSS选择器（可选，不提供则截取整页）",
                        },
                        path: {
                            type: "string",
                            description: "保存路径（可选）",
                        },
                    },
                },
            },
            {
                name: "playwright_get_text",
                description: "获取指定元素的文本内容",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: {
                            type: "string",
                            description: "CSS选择器",
                        },
                    },
                    required: ["selector"],
                },
            },
            {
                name: "playwright_wait",
                description: "等待元素出现或等待指定时间",
                inputSchema: {
                    type: "object",
                    properties: {
                        selector: {
                            type: "string",
                            description: "CSS选择器（可选，不提供则等待指定时间）",
                        },
                        timeout: {
                            type: "number",
                            description: "超时时间（毫秒）",
                        },
                    },
                },
            },
            {
                name: "playwright_get_title",
                description: "获取页面标题",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
            {
                name: "playwright_get_url",
                description: "获取当前页面URL",
                inputSchema: {
                    type: "object",
                    properties: {},
                },
            },
        ],
    };
});
// 处理工具调用
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const currentPage = await initializeBrowser();
        switch (name) {
            case "playwright_navigate": {
                const { url } = NavigateSchema.parse(args);
                await currentPage.goto(url);
                return {
                    content: [
                        {
                            type: "text",
                            text: `成功导航到: ${url}`,
                        },
                    ],
                };
            }
            case "playwright_click": {
                const { selector } = ClickSchema.parse(args);
                await currentPage.click(selector);
                return {
                    content: [
                        {
                            type: "text",
                            text: `成功点击元素: ${selector}`,
                        },
                    ],
                };
            }
            case "playwright_fill": {
                const { selector, value } = FillSchema.parse(args);
                await currentPage.fill(selector, value);
                return {
                    content: [
                        {
                            type: "text",
                            text: `成功在 ${selector} 中填写文本: ${value}`,
                        },
                    ],
                };
            }
            case "playwright_screenshot": {
                const { selector, path } = ScreenshotSchema.parse(args);
                let screenshotPath = path;
                if (selector) {
                    const element = currentPage.locator(selector);
                    screenshotPath = await element.screenshot({ path });
                }
                else {
                    screenshotPath = await currentPage.screenshot({ path });
                }
                return {
                    content: [
                        {
                            type: "text",
                            text: `截图已保存到: ${screenshotPath || '默认路径'}`,
                        },
                    ],
                };
            }
            case "playwright_get_text": {
                const { selector } = GetTextSchema.parse(args);
                const text = await currentPage.textContent(selector);
                return {
                    content: [
                        {
                            type: "text",
                            text: `元素内容: ${text}`,
                        },
                    ],
                };
            }
            case "playwright_wait": {
                const { selector, timeout } = WaitSchema.parse(args);
                if (selector) {
                    await currentPage.waitForSelector(selector, { timeout });
                    return {
                        content: [
                            {
                                type: "text",
                                text: `元素 ${selector} 已出现`,
                            },
                        ],
                    };
                }
                else {
                    await currentPage.waitForTimeout(timeout || 1000);
                    return {
                        content: [
                            {
                                type: "text",
                                text: `等待了 ${timeout || 1000} 毫秒`,
                            },
                        ],
                    };
                }
            }
            case "playwright_get_title": {
                const title = await currentPage.title();
                return {
                    content: [
                        {
                            type: "text",
                            text: `页面标题: ${title}`,
                        },
                    ],
                };
            }
            case "playwright_get_url": {
                const url = currentPage.url();
                return {
                    content: [
                        {
                            type: "text",
                            text: `当前URL: ${url}`,
                        },
                    ],
                };
            }
            default:
                throw new Error(`未知工具: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `错误: ${error instanceof Error ? error.message : String(error)}`,
                },
            ],
            isError: true,
        };
    }
});
// 启动服务器
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error("Playwright MCP 服务器已启动");
}
// 优雅关闭
process.on("SIGINT", async () => {
    await cleanup();
    process.exit(0);
});
process.on("SIGTERM", async () => {
    await cleanup();
    process.exit(0);
});
main().catch((error) => {
    console.error("启动服务器失败:", error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map