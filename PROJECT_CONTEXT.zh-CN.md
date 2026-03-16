# ChefMate Project Context

语言版本：

- English: `PROJECT_CONTEXT.md`
- 简体中文: `PROJECT_CONTEXT.zh-CN.md`

这是一份给人类协作者和大模型使用的快速项目上下文文档。
如果你需要在不依赖聊天记录的情况下快速理解仓库，请优先阅读这份文件。

## 1. 项目概述

ChefMate 是一个智能家庭烹饪助手，围绕三类核心能力展开：

- 管理家庭食材和冰箱库存
- 使用 AI 生成或推荐食谱
- 支持家庭组内的协同购物与烹饪

这个仓库由三个相互独立的子项目组成：

- `server`：NestJS 后端 API 与 AI 编排层
- `chef-mate`：基于 uni-app + Vue 3 的用户端应用
- `admin`：基于 Vue 3 + Vite + Arco Design 的管理后台

这不是单一根级工作区。每个子项目都有自己的 `package.json` 和锁文件。

## 2. 仓库结构

```text
.
├── admin/        # Vue 3 管理后台
├── chef-mate/    # uni-app 用户端
├── server/       # NestJS 后端 + Prisma
└── docs/         # 产品、前端、后端设计文档
```

常用文档：

- `docs/ChefMate-需求设计文档.md`：产品目标、用户故事、功能列表
- `docs/ChefMate-前端开发设计文档.md`：前端页面流程与组件思路
- `docs/ChefMate-后端开发设计文档.md`：后端架构、接口约定、AI 模块设计

重要说明：`server/README.md` 目前仍然是 Nest 默认模板，不是这个项目的真实总览。

## 3. 高层架构

```text
chef-mate（用户端） ----\
                        >---- server（REST API + AI + Prisma + PostgreSQL）
admin（管理端） -------/
```

核心数据流：

1. `chef-mate` 和 `admin` 通过 `/api/*` 调用后端 REST API
2. `server` 负责鉴权、校验、业务逻辑和 AI 编排
3. `server` 通过 Prisma 将业务数据持久化到 PostgreSQL
4. 某些功能还依赖 Redis、外部 AI 服务和对象存储

## 4. 子项目说明

### 4.1 `server`

作用：

- 提供认证、家庭组、冰箱、食谱、烹饪、购物、统计、动态、通知等业务 API
- 提供食谱生成、食材识别、语音命令解析、烹饪辅助等 AI 能力

技术栈：

- NestJS 11
- Prisma 7
- PostgreSQL
- Redis
- 兼容 OpenAI 风格的 AI SDK 与 AI 服务端点
- Swagger API 文档

关键入口：

- `server/src/main.ts`：应用启动、全局校验、异常过滤、响应拦截、Swagger、静态资源
- `server/src/app.module.ts`：顶层模块装配
- `server/prisma/schema.prisma`：领域数据模型
- `server/src/config/index.ts`：应用、JWT、Redis、AI、OSS 配置

后端模块分布：

- `auth`：登录、刷新 token、认证流程
- `user`：用户资料与相关接口
- `group`：家庭组与邀请流程
- `fridge`：食材识别与冰箱库存
- `recipe`：食谱 CRUD、推荐、按食材 AI 生成、步骤问答、TTS、语音命令解析
- `cooking`：烹饪过程相关逻辑
- `shopping`：协同购物清单与购买流程
- `task`：家庭任务协作
- `notification`：通知
- `stats`：统计汇总接口
- `feed`：家庭动态流
- `ai`：管理端使用的 AI 食谱生成与通用 AI 服务层

API 约定：

- 路由前缀：`/api/...`
- 成功响应：由全局拦截器统一包装
- 两个前端共同依赖的成功码约定：`code === 0`
- 鉴权：Bearer Token
- Swagger 文档：`/api/docs`

代表性控制器：

- `server/src/modules/recipe/recipe.controller.ts`
- `server/src/modules/fridge/fridge.controller.ts`
- `server/src/ai/ai.controller.ts`

### 4.2 `chef-mate`

作用：

- 面向终端用户，承载日常做饭、冰箱管理、食谱指引、购物、个人中心等流程

技术栈：

- uni-app
- Vue 3
- Pinia
- uview-plus
- Tailwind / UnoCSS 相关工具
- Vite

关键入口：

- `chef-mate/src/main.ts`：应用创建、全局组件注册、Pinia、UI 插件初始化
- `chef-mate/src/pages.json`：页面路由与 tab bar
- `chef-mate/src/services/request.ts`：统一请求封装

主要页面：

- `pages/index/index`：首页，含推荐食谱、临期提醒、家庭动态
- `pages/fridge/index`：冰箱库存与扫描/录入流程
- `pages/fridge/ai-recipe`：基于现有食材的 AI 灵感食谱
- `pages/recipe/cooking-guide`：沉浸式烹饪指引
- `pages/recipe/cooking-steps`：完整步骤页
- `pages/shopping/index`：购物清单
- `pages/profile/index`：个人中心与偏好设置
- `pages/group/invite`：邀请家人

典型服务层：

- `chef-mate/src/services/auth.ts`
- `chef-mate/src/services/fridge.ts`
- `chef-mate/src/services/recipe.ts`
- `chef-mate/src/services/shopping.ts`
- `chef-mate/src/services/group.ts`
- `chef-mate/src/services/feed.ts`

行为约定：

- API 基础地址来自 `VITE_API_BASE_URL`
- token 会在 `src/services/request.ts` 中自动注入
- token 失效后，客户端会清理认证信息并跳转到登录页
- 部分上传流程会直接使用 `uni.uploadFile` 或 `fetch`，不走通用请求封装

前端原型协作流程：

- 新增前端页面时，先提供 Stitch 设计提示词，再进入实现规划
- 在页面规格最终确定前，先向用户确认目标 Stitch 原型或页面 ID
- 如果用户已经提供 Stitch 页面 ID，则以该原型作为主要设计参考
- 如果还没有 Stitch 原型，则先提出创建或选择原型的方案，再开始实现

### 4.3 `admin`

作用：

- 内部或管理侧界面，目前重点覆盖食谱管理流程

技术栈：

- Vue 3
- Vite
- Arco Design Vue
- Vue Router
- Pinia
- Axios

关键入口：

- `admin/src/main.ts`：应用启动
- `admin/src/router`：路由定义与守卫
- `admin/src/api/interceptor.ts`：Axios 基础地址、鉴权头注入、错误处理

当前重要页面：

- 食谱列表：`admin/src/views/recipe/list/index.vue`
- 食谱创建/编辑：`admin/src/views/recipe/form/index.vue`

行为约定：

- 开发模式下会将 `/api` 代理到 `http://localhost:3000`
- 也可通过 `VITE_API_BASE_URL` 显式设置 API 地址
- 前端依赖后端成功格式 `code === 0`

## 5. 领域模型

后端 Prisma schema 的核心实体包括：

- `User`：账号、角色、饮食偏好
- `Group` 与 `GroupMember`：家庭组与成员关系
- `FridgeItem`：按家庭组维护的食材库存和保质期
- `Recipe`：结构化食谱，包含食材、步骤、营养、标签、来源元信息
- `RecipeFavorite` 与 `CookingHistory`：用户与食谱的交互
- `ShoppingList` 与 `ShoppingItem`：协同采购流程
- `Task`：家庭任务管理
- `Notification`：通知
- `Feed`：家庭动态流

这是一个以家庭组为中心的产品。很多功能天然以当前用户所在家庭组为作用域。

## 6. 运行环境与配置

### 后端

`server/.env.example` 中的关键环境变量包括：

- 应用：`PORT`、`NODE_ENV`
- 数据库：`DATABASE_URL`
- Redis：`REDIS_HOST`、`REDIS_PORT`
- 鉴权：`JWT_SECRET`、`JWT_EXPIRES_IN`、`JWT_REFRESH_EXPIRES_IN`
- AI：`AI_API_KEY`、`AI_BASE_URL`、`AI_MODEL`、`AI_VISION_MODEL`
- 对象存储：`OSS_ENDPOINT`、`OSS_BUCKET`、`OSS_ACCESS_KEY`、`OSS_SECRET_KEY`

默认假设：

- 本地后端端口为 `3000`
- Swagger 地址是 `http://localhost:3000/api/docs`
- 上传文件通过 `/uploads/` 暴露

### 前端

管理端：

- 本地开发默认连接 `http://localhost:3000`
- Vite 开发服务器也会把 `/api` 代理到 `http://localhost:3000`

用户端：

- 本地 API 地址存放于 `chef-mate/.env.development`
- `chef-mate/scripts/update-ip.sh` 会将其改写为当前局域网 IP，便于真机调试

## 7. 启动方式

每个应用都独立启动。

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

用户端还支持 `dev:mp-weixin`、`dev:app-plus` 等平台启动命令。

## 8. 修改定位指南

如果你需要改某个功能，通常可以先从下面位置进入：

- 登录认证问题：`server/src/modules/auth` 与 `chef-mate/src/services/auth.ts`
- 冰箱扫描或库存管理：`server/src/modules/fridge` 与 `chef-mate/src/pages/fridge`
- 管理端食谱 CRUD：`admin/src/views/recipe`、`admin/src/api/recipe.ts`、`server/src/modules/recipe`
- AI 食谱生成：
  - 用户端按食材生成：`chef-mate/src/pages/fridge/ai-recipe.vue` 与 `server/src/modules/recipe`
  - 管理端按提示词生成：`admin/src/api/recipe.ts` 与 `server/src/ai`
- 烹饪指引 / 语音控制：`chef-mate/src/pages/recipe`、`chef-mate/src/services/recipe.ts`、`server/src/modules/recipe`
- 协同购物：`chef-mate/src/pages/shopping`、`chef-mate/src/services/shopping.ts`、`server/src/modules/shopping`
- 家庭动态：`chef-mate/src/services/feed.ts` 与 `server/src/modules/feed`

## 9. 代码导航规律

这个仓库的结构相对直接：

- 后端业务逻辑按模块分布在 `server/src/modules/*`
- 需要的 DTO 通常与模块放在一起
- 用户端 API 封装位于 `chef-mate/src/services/*`
- 管理端 API 封装位于 `admin/src/api/*`
- 用户端页面按功能组织在 `chef-mate/src/pages/*`
- 管理端页面按视图和路由组织在 `admin/src/views/*`

如果你是大模型，处理大多数任务时推荐使用这个阅读顺序：

1. 先确定目标子项目：`server`、`chef-mate` 或 `admin`
2. 打开对应的入口层：controller、service、page 或 api 模块
3. 检查前端是否有对应的请求封装
4. 如果数据结构或归属不清楚，再看 Prisma schema
5. 只有业务意图不明确时，再回到 `docs/`

## 10. 当前注意点

- 根目录项目文档是后续补上的，历史上并不存在统一入口
- `server/README.md` 仍是通用 Nest 模板
- 仓库不是根级 `pnpm` workspace
- 用户端真机调试可能依赖局域网 IP 自动改写
- 后端最终响应格式由全局拦截器统一包装，controller 返回值并不是前端实际收到的完整 HTTP 结构

## 11. 最短心智模型

如果你只想记住最短且正确的描述，可以记成：

- ChefMate 是一个“三端系统”：后端 API、用户端 App、管理后台
- 后端是领域逻辑和数据模型的唯一权威来源
- 用户端按页面功能组织，通过 service 层调用 `/api/*`
- 管理端目前重点在食谱管理，同样调用同一个后端
- AI 不是独立部署单元，而是内嵌在后端服务和控制器里
