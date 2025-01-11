# DeepSeek Chat Desktop

一个基于 Electron + Vue 3 + TypeScript 开发的 DeepSeek Chat 桌面客户端。

## 功能特点

- 🖥️ 跨平台桌面应用
- 🔒 安全的 API Key 本地存储
- 💬 流式响应的聊天界面
- 📝 Markdown 实时渲染
- 🎨 代码高亮显示
- 📌 窗口置顶功能
- 🌙 暗色主题
- 🔗 智能链接处理
- 📋 消息快捷复制
- ⌨️ 快捷键支持

## 技术栈

- Electron 33.x
- Vue 3.x
- TypeScript
- Vite
- Element Plus
- Markdown-it
- Highlight.js
- Nodejs > 18.20

## 开发环境设置

1. 克隆仓库

```bash
git clone <repository-url>
cd deepseek-electron
```

2. 安装依赖

```bash
pnpm install
```

3. 创建 API Key 文件

```bash
echo "your-api-key" > electron/APP_KEY
```

4. 启动开发服务器

```bash
# 启动 Vue 开发服务器
pnpm dev

# 新开一个终端，启动 Electron
pnpm start
```

## 构建应用

```bash
# 构建应用 主要需要管理员模式，否则会失败
pnpm electron:build
```

构建后的应用将在 `release` 目录中生成。

## 项目结构

```
├── electron/          # Electron 主进程代码
│   ├── main.js       # 主进程入口
│   └── preload.js    # 预加载脚本
├── src/              # Vue 应用源码
│   ├── views/        # 页面组件
│   ├── components/   # 通用组件
│   └── types/        # TypeScript 类型定义
└── dist/             # 构建输出目录
```

## 配置说明

### API Key 存储

- 开发环境：存储在 `electron/APP_KEY` 文件中
- 生产环境：存储在用户数据目录下的 `APP_KEY` 文件中

### 环境变量

可以在 `.env` 文件中配置以下环境变量：

- `VITE_PORT`：开发服务器端口
- `VITE_APP_TITLE`：应用标题

## 注意事项

1. 首次使用需要设置 DeepSeek API Key

   ### DeepSeek API Key 申请流程

   1. 访问 DeepSeek API 官网 (https://platform.deepseek.com/)

   2. 点击右上角"Sign Up"注册账号

   3. 登录后进入控制台(Console)页面

   4. 在左侧菜单找到"API Keys"选项

   5. 点击"Create API Key"创建新的 API Key

   6. 复制生成的 API Key 并妥善保存

   注意:

   - API Key 仅显示一次,请务必保存
   - 免费账户每月有一定额度限制
   - 请勿泄露或分享你的 API Key

2. 应用使用无边框窗口，可通过顶部栏拖动
3. 窗口置顶功能可通过右上角图标切换

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

[MIT License](LICENSE)
