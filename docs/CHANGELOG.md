# Changelog — AI 导航站设计优化

_Date: 2026-03-27_
_Type: Design System Overhaul_

---

## 概述

本次更新完成了 AI 导航站的前端设计系统全面重构，统一了品牌视觉语言、动效规范和组件设计。

## 设计方向

**Editorial Warm** — 暖色调编辑风，区别于常见的紫蓝 AI 站点。

- 配色温暖克制，不走夸张渐变路线
- 字体组合有文化感（衬线标题 + 无衬线正文）
- 质感丰富但不杂乱（噪声纹理、accent 线、卡片阴影）

---

## 设计系统变更

### 配色

| Token | Light Mode | Dark Mode | 用途 |
|-------|-----------|-----------|------|
| `--brand-orange` | `#d97757` | `#e07a5f` | 主色、CTA、Vote 心形 |
| `--brand-blue` | `#6a9bcc` | `#6a9bcc` | 分类 accent（写作）|
| `--brand-green` | `#788c5d` | `#788c5d` | 分类 accent（编程）/ Free 标签 |
| `--brand-dark` | `#141413` | `#0c0c0b` | 深色文字、深色背景 |
| `--brand-light` | `#faf9f5` | — | 浅色背景 |
| `--brand-mid` | `#b0aea5` | — | 次要文字 |

### 字体

| 用途 | 字体 | 风格 |
|------|------|------|
| 标题（H1-H6）| Instrument Serif | 编辑感、温暖、有文化 |
| 正文（body）| Instrument Sans | 现代、清晰、可读性好 |

**弃用**：Geist Sans（过于科技感、与 AI 站点通用风格雷同）

### 动效

| 动效 | 实现 | 场景 |
|------|------|------|
| Staggered reveal | CSS `@keyframes revealUp` + `animation-delay` | 页面加载时交错出现 |
| Card lift | CSS transform + box-shadow | 工具卡片 hover |
| Tag hover | scale + background-color transition | 标签 pill hover |
| Vote pulse | scale 弹跳 + SVG fill 过渡 | 投票按钮 |
| Header blur | backdrop-blur + shadow on scroll | 滚动吸附导航 |
| Accent bar slide | width 0→55% transition | 卡片 hover 左滑 accent |

---

## 页面变更

### 首页 (`/`)
- Hero 区域：大数字装饰背景、Gradient text 标题、交错 reveal
- 分类导航：彩色圆点 accent pill，hover 有 lift + 阴影
- 工具卡片：顶部 accent 彩条（按分类着色）、投票心形 SVG、hover lift
- Footer：品牌 Logo + 年份

### 工具详情页 (`/tool/[slug]`)
- 分类 accent 色竖线
- 标签支持 hover 缩放
- 描述卡片：简洁白底、宽松行高
- CTA 按钮：品牌橙、hover 阴影加深
- Meta 信息：双栏小字 footer

### 分类页 (`/category/[name]`)
- 统一使用 `ToolCard` 组件
- 搜索框融入品牌风格

### 最新页 (`/new`)
- 绿色 accent（`#788c5d`）
- 收录时间作为卡片 meta

### 优惠页 (`/deals`)
- 金色 accent（`#c4a35a`）
- 优惠标签叠加显示

### 墓碑页 (`/graveyard`)
- 褐色 accent（`#8e6b5a`）
- 警告 banner 使用金色边框
- 卡片 75% 透明度，hover 恢复

### 搜索页 (`/search`)
- 蓝色 accent（`#6a9bcc`）
- 搜索词高亮显示
- 分页器品牌化

### 标签页 (`/tag/[name]`)
- 紫色 accent（`#7c6a9b`）

### 提交页 (`/submit`)
- 绿色 accent（`#788c5d`）
- 表单输入框 focus 边框变为品牌橙

---

## 组件变更

### `Header.tsx`
- Logo 改为：橙色方块（AI）+ 衬线中文字
- 滚动后：背景模糊 + 细阴影
- 导航链接 hover：背景变灰、圆角

### `VoteButton.tsx`
- Emoji ❤ → SVG 心形（支持品牌橙色 fill）
- 激活态：橙色描边 + 淡橙色背景
- 按压：scale(0.94) 弹跳

### `ToolCard.tsx`（新建）
- 通用工具卡片组件
- 支持：`accentColor`、`animationDelay`、`extraBadges`、`meta`
- 统一卡片顶部彩色 accent 线

---

## CSS 变更 (`globals.css`)

- 全部 CSS 变量迁移至 brand 色板
- 新增 `.reveal` / `.reveal-delay-N` 系列动画类
- 新增 `.noise-bg` 噪声纹理叠加层
- 新增 `.hero-gradient` 暖色径向渐变
- 新增 `.card-lift` / `.tag-pill` / `.vote-btn` 交互类
- 新增 `.gradient-text` 多色渐变文字

---

## 技术说明

- Instrument Serif/Sans 通过 `next/font/google` 加载（无需用户安装）
- 所有动效纯 CSS 实现，无需 JS 库
- `ToolCard` 为 client component（处理 link + animation class）
- 页面组件保持 server component（SSR 数据获取）
- 构建验证通过：`next build` ✅

---

## 文件清单

```
src/
├── app/
│   ├── globals.css              ← 重建 CSS 变量 + 动画系统
│   ├── layout.tsx               ← 字体替换 + noise-bg
│   ├── page.tsx                 ← 首页重构
│   ├── tool/[slug]/page.tsx    ← 详情页重构
│   ├── category/[name]/page.tsx ← 分类页重构
│   ├── new/page.tsx             ← 最新页重构
│   ├── deals/page.tsx           ← 优惠页重构
│   ├── graveyard/page.tsx      ← 墓碑页重构
│   ├── search/page.tsx          ← 搜索页重构
│   ├── tag/[name]/page.tsx     ← 标签页重构
│   └── submit/page.tsx          ← 提交页重构
└── components/
    ├── Header.tsx               ← 品牌 Logo + 滚动效果
    ├── VoteButton.tsx           ← SVG 心形 + 按压动效
    └── ToolCard.tsx             ← 新建通用卡片组件
```
