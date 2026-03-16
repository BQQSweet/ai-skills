# LLM Handoff

语言版本：

- English: `LLM_HANDOFF.md`
- 简体中文: `LLM_HANDOFF.zh-CN.md`

这是仓库的最短可用摘要，适合模型或协作者在极短时间内建立正确的项目认知。

## 这个仓库是什么

ChefMate 是一个三端系统：

- `server`：NestJS 后端，负责 Prisma、PostgreSQL、Redis 和 AI 集成
- `chef-mate`：uni-app 用户端
- `admin`：Vue 3 + Vite 管理后台

两个前端都调用同一个后端 API，统一走 `/api/*`。

## 建议阅读顺序

除非任务已经非常明确，否则建议按下面顺序读取：

1. `README.md` 或 `README.zh-CN.md`
2. `LLM_HANDOFF.md` 或 `LLM_HANDOFF.zh-CN.md`
3. `PROJECT_CONTEXT.md` 或 `PROJECT_CONTEXT.zh-CN.md`
4. 目标子项目入口文件
5. 目标功能对应的模块、页面或服务
6. 只有当业务意图不清楚时，再进入 `docs/`

## 三端核心入口

- 后端启动：`server/src/main.ts`
- 后端模块装配：`server/src/app.module.ts`
- 后端数据模型：`server/prisma/schema.prisma`
- 用户端入口：`chef-mate/src/main.ts`
- 用户端路由：`chef-mate/src/pages.json`
- 管理端入口：`admin/src/main.ts`

## 功能快速定位

如果任务涉及：

- 登录认证：`server/src/modules/auth`，`chef-mate/src/services/auth.ts`
- 食谱 CRUD：`server/src/modules/recipe`，`admin/src/views/recipe`，`admin/src/api/recipe.ts`
- AI 食谱生成：
  - 用户端流程：`chef-mate/src/pages/fridge/ai-recipe.vue`，`chef-mate/src/services/recipe.ts`，`server/src/modules/recipe`
  - 管理端流程：`admin/src/api/recipe.ts`，`server/src/ai`
- 冰箱扫描与食材管理：`server/src/modules/fridge`，`chef-mate/src/pages/fridge`，`chef-mate/src/services/fridge.ts`
- 烹饪指引与语音：`chef-mate/src/pages/recipe`，`chef-mate/src/services/recipe.ts`，`server/src/modules/recipe`
- 购物、家庭组、动态流：优先看 `chef-mate/src/services/*` 与 `server/src/modules/*` 中对应同名模块

## API 约定

- 后端路由统一使用 `/api/...`
- 前端成功判断约定为 `code === 0`
- 鉴权方式是 Bearer Token
- Swagger 地址是 `http://localhost:3000/api/docs`

## 常用启动命令

后端：

```bash
cd server
pnpm install
pnpm run start:dev
```

管理端：

```bash
cd admin
pnpm install
pnpm run dev
```

用户端：

```bash
cd chef-mate
pnpm install
pnpm run dev:h5
```

## 重要注意点

- 这不是根级 `pnpm` workspace
- `server/README.md` 仍然是默认模板文档
- `chef-mate/.env.development` 可能会被脚本改写成局域网 IP，便于真机调试
- 后端响应格式是通过全局拦截器统一包装的，不是每个控制器手写完整响应体
