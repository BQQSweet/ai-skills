---
trigger: always_on
glob: src/frontend/**/*
description: ChefMate 前端开发规范，适用于 Uni-app (Vue 3) 环境。
---

# ChefMate 前端开发规范

## 🛠 技术栈

- **包管理器**：pnpm
- **框架**：Uni-app (Vue 3 + Composition API)
- **脚本**：TypeScript (严格模式)
- **状态管理**：Pinia
- **UI 组件库**：uni-ui / uView Plus
- **样式**：Sass / SCSS

## 📂 目录结构规范

- `src/pages/`：页面组件，按功能模块划分子目录。
- `src/components/`：业务公共组件，遵循 `PascalCase` 命名。
- `src/stores/`：Pinia store 定义，文件名小写，如 `user.ts`。
- `src/services/`：API 请求封装，按模块划分，如 `recipe.ts`。
- `src/static/`：静态资源（图片、图标）。

## 命名约定

- **文件命名**：
  - 页面/组件：`PascalCase.vue` (如 `RecipeDetail.vue`)。
  - 普通 TS/JS 文件：`kebab-case.ts` (如 `request-interceptor.ts`)。
- **变量/函数**：`camelCase` (如 `isLoggedIn`, `fetchIngredients`)。
- **样式类名**：`kebab-case` (如 `fridge-item-card`)。

## 💡 开发习惯

1. **类型安全**：所有接口响应必须定义对应的 `interface`。
2. **多端兼容**：尽量使用 Uni-app 提供的跨端 API，涉及平台差异时使用条件编译 `/* #ifdef ... #endif */`。
3. **性能建议**：
   - 避免在 `getApp().globalData` 中存放大量响应式数据，优先使用 Pinia。
   - 图片资源注意压缩，且尽量使用 WebP 格式。
4. **AI/LLM 交互**：
   - 处理食谱推荐时，必须支持处理流式数据（SSE）的展示逻辑。
   - 语音指引功能需封装统一的 TTS 工具类。
