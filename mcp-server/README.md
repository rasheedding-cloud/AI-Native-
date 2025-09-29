# Playwright MCP 服务器

这是一个为 51Talk AI Native 项目管理工具定制的 Playwright MCP 服务器，提供了通过 MCP (Model Context Protocol) 控制 Playwright 的能力。

## 功能特性

### 提供的工具

1. **playwright_navigate** - 导航到指定URL
2. **playwright_click** - 点击指定元素
3. **playwright_fill** - 在输入框中填写文本
4. **playwright_screenshot** - 截图或截取指定元素
5. **playwright_get_text** - 获取元素文本内容
6. **playwright_wait** - 等待元素出现或等待指定时间
7. **playwright_get_title** - 获取页面标题
8. **playwright_get_url** - 获取当前页面URL

## 安装和配置

### 1. 安装依赖

```bash
# 安装 Playwright 和 MCP SDK
npm install @playwright/test playwright @modelcontextprotocol/sdk

# 安装浏览器
npx playwright install
```

### 2. 构建服务器

```bash
cd mcp-server
npm install
npm run build
```

### 3. 配置 Claude Code

配置文件已创建在 `.claude/config.json`，包含了 Playwright MCP 服务器的配置。

## 使用示例

### 基本使用

```bash
# 启动 MCP 服务器
node mcp-server/dist/index.js
```

### 测试脚本

运行测试示例：

```bash
cd mcp-server
npx ts-node example.ts
```

## 工具使用说明

### playwright_navigate
导航到指定URL
- **参数**: url (必需) - 要导航到的URL

### playwright_click
点击指定元素
- **参数**: selector (必需) - CSS选择器

### playwright_fill
在输入框中填写文本
- **参数**:
  - selector (必需) - CSS选择器
  - value (必需) - 要填写的文本

### playwright_screenshot
截图或截取指定元素
- **参数**:
  - selector (可选) - CSS选择器，不提供则截取整页
  - path (可选) - 保存路径

### playwright_get_text
获取指定元素的文本内容
- **参数**: selector (必需) - CSS选择器

### playwright_wait
等待元素出现或等待指定时间
- **参数**:
  - selector (可选) - CSS选择器，不提供则等待指定时间
  - timeout (可选) - 超时时间（毫秒）

### playwright_get_title
获取页面标题
- **参数**: 无

### playwright_get_url
获取当前页面URL
- **参数**: 无

## 项目结构

```
mcp-server/
├── src/
│   └── index.ts          # MCP 服务器主文件
├── dist/                 # 编译后的文件
├── package.json          # 项目配置
├── tsconfig.json         # TypeScript 配置
├── example.ts            # 测试示例
└── README.md            # 使用说明
```

## 技术栈

- **Playwright**: 浏览器自动化
- **TypeScript**: 类型安全
- **MCP SDK**: Model Context Protocol 支持
- **Zod**: 数据验证

## 注意事项

1. 服务器默认使用无头模式 (headless: true)
2. 支持优雅关闭，会自动清理浏览器资源
3. 所有工具调用都有错误处理机制
4. 支持多种浏览器 (Chromium, Firefox, WebKit)

## 开发

```bash
# 开发模式
npm run dev

# 构建
npm run build

# 启动服务器
npm start
```

## 许可证

MIT