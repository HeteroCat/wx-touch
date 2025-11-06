# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个微信公众号爬虫服务的前端项目，基于React + TypeScript开发，提供四个核心功能：
1. 搜索微信公众号
2. 获取最新文章列表
3. 提取文章Markdown内容
4. 关键词搜索文章

## 技术栈

- **前端框架**: React 18 + TypeScript
- **UI库**: ReactBits
- **构建工具**: Vite
- **样式**: CSS Modules + CSS Variables
- **状态管理**: React Hooks + Context API

## 常用开发命令

### 依赖管理
```bash
npm install          # 安装依赖
npm run dev         # 启动开发服务器
npm run build       # 构建生产版本
npm run preview     # 预览构建结果
```

### 代码质量
```bash
npm run lint        # 运行ESLint检查
npm run type-check  # TypeScript类型检查
```

## 项目结构

```
wx-touch/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── common/         # 通用组件
│   │   └── ui/             # UI组件
│   ├── pages/              # 页面组件
│   │   ├── Home/           # 首页
│   │   ├── SearchAccount/  # 搜索公众号页
│   │   ├── LatestArticles/ # 最新文章列表页
│   │   ├── ExtractMarkdown/ # Markdown提取页
│   │   └── KeywordSearch/  # 关键词搜索页
│   ├── services/           # API服务
│   │   └── api.ts          # API调用封装
│   ├── types/              # TypeScript类型定义
│   │   └── index.ts        # 类型导出
│   ├── hooks/              # 自定义Hooks
│   ├── utils/              # 工具函数
│   └── styles/             # 全局样式
├── public/                 # 静态资源
└── tests/                  # 测试文件
```

## API接口信息

### 基础配置
- **Base URL**: https://wxcrawl.touchturing.com
- **认证方式**: MD5签名认证
- **环境变量**: 从.env文件读取API密钥

### 四个核心接口

1. **搜索公众号** `/api/search`
   - 参数: `search` (搜索关键词)
   - 响应: 公众号列表，包含name, alias, head_image_url等字段

2. **获取文章列表** `/api/latest_articles`
   - 参数: `nickname` (公众号昵称), `count` (数量)
   - 响应: 文章列表，包含title, link, cover, digest等字段

3. **提取Markdown内容** `/api/extract`
   - 参数: `url` (文章链接)
   - 响应: Markdown格式文本

4. **关键词搜索文章** `/api/keyword_search`
   - 参数: `keyword`, `nickname`, `search_type`, `count`, `offset`
   - 响应: 包含关键词的文章列表

### 真实测试数据

- **测试公众号**: "图触触控技术TuringTouch"
- **测试文章**: "来了，图灵 | AI科技前沿"
- **文章链接**: "https://mp.weixin.qq.com/s/nNIOGhmkLWD5KfDW22WoRg"

## 设计规范

### 色彩方案
- **主色调**: 纯黑背景 + 红色荧光渐变
- **功能页**: 左侧白色 + 右侧浅橙色
- **卡片风格**: 现代化设计，圆角，阴影

### 页面布局
- **首页**: 手掌+正方体艺术设计，居中布局
- **功能页**: 左侧输入区域，右侧结果展示区域
- **响应式**: 支持移动端和桌面端

### 交互设计
- **加载状态**: 骨架屏和加载动画
- **错误处理**: 友好的错误提示
- **反馈机制**: 成功/失败状态的视觉反馈

## 开发注意事项

### API调用
- 使用环境变量中的API密钥
- 处理MD5签名认证
- 处理字符编码问题
- 实现错误重试机制

### 性能优化
- 图片懒加载
- 虚拟滚动(长列表)
- 请求缓存
- 代码分割

### 用户体验
- 防抖搜索
- 加载状态指示
- 空状态处理
- 移动端适配

## 测试策略

### API测试
- 使用真实的API密钥测试所有接口
- 验证响应数据结构
- 测试错误处理机制

### 组件测试
- 单元测试覆盖核心逻辑
- 集成测试验证用户流程
- E2E测试确保关键功能

## 部署信息

### 环境变量
```env
VITE_API_KEY=your_api_key
VITE_API_SECRET=your_api_secret
VITE_API_BASE_URL=https://wxcrawl.touchturing.com
```

### 构建配置
- 目标浏览器: modern browsers
- 输出目录: dist/
- 静态资源: CDN优化