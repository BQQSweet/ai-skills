# ChefMate

语言版本：

- English: `README.md`
- 简体中文: `README.zh-CN.md`

ChefMate 是一个智能家庭烹饪助手项目，由三个相互配合的应用组成：

- `server`：后端 API、AI 编排与数据库访问
- `chef-mate`：面向终端用户的客户端，负责烹饪、冰箱、购物和家庭协作场景
- `admin`：后台管理面板，主要用于食谱与管理流程

如果你是新协作者或需要快速建立项目认知，建议先读 `LLM_HANDOFF.zh-CN.md`，再读 `PROJECT_CONTEXT.zh-CN.md`。
如果你更习惯英文，也可以直接查看 `README.md`、`LLM_HANDOFF.md`、`PROJECT_CONTEXT.md`。

## 快速开始

这个仓库不是单一的根工作区。三个子项目都需要分别安装依赖、分别启动。

### 后端

```bash
cd server
pnpm install
pnpm run start:dev
```

后端默认地址：

- `http://localhost:3000`

Swagger 文档地址：

- `http://localhost:3000/api/docs`

### 管理端

```bash
cd admin
pnpm install
pnpm run dev
```

### 用户端 `chef-mate`

```bash
cd chef-mate
pnpm install
pnpm run dev:h5
```

如果需要在真机或局域网环境调试，可以使用 `chef-mate/scripts/update-ip.sh` 自动更新 `chef-mate/.env.development` 里的局域网 IP。

## 仓库结构

```text
.
├── admin/        # Vue 3 + Vite 管理后台
├── chef-mate/    # uni-app + Vue 3 用户端
├── server/       # NestJS + Prisma 后端
├── docs/         # 需求与设计文档
└── PROJECT_CONTEXT.md
```

## 文档说明

- `PROJECT_CONTEXT.zh-CN.md`：最完整的仓库上下文地图，适合人和模型做深入理解
- `PROJECT_CONTEXT.zh-CN.md` 也记录了新增前端页面时的 Stitch 原型协作流程
- `docs/frontend-page-standards.zh-CN.md`：`chef-mate` 与 `admin` 共用的前端页面结构与组件化规范
- `LLM_HANDOFF.zh-CN.md`：最短可用的速读版
- `THREAD_START_PROMPT.md`：给新线程或新模型直接复用的标准启动提示词
- `docs/ChefMate-需求设计文档.md`：产品目标、用户故事、功能范围
- `docs/ChefMate-前端开发设计文档.md`：前端页面流与页面设计
- `docs/ChefMate-后端开发设计文档.md`：后端模块、接口约定与 AI 设计

## 架构概览

两个前端都通过 `/api/*` 调用同一个后端服务。

- `chef-mate` 通过 `src/services` 下的请求封装访问后端
- `admin` 通过 `src/api` 下的 Axios 封装访问后端
- `server` 按业务模块组织逻辑，主要位于 `src/modules`
- `server/prisma/schema.prisma` 是领域模型和数据结构的核心来源

主要业务方向包括：

- 认证与用户管理
- 家庭组与邀请机制
- 冰箱库存与食材识别
- 食谱 CRUD、推荐与 AI 生成
- 烹饪指引与语音相关辅助
- 协同购物、任务、通知和家庭动态

## 常用入口文件

- 后端启动入口：`server/src/main.ts`
- 后端模块装配：`server/src/app.module.ts`
- 用户端入口：`chef-mate/src/main.ts`
- 用户端页面路由：`chef-mate/src/pages.json`
- 管理端入口：`admin/src/main.ts`
- 管理端路由：`admin/src/router`

## 说明

- `server/README.md` 仍然是 Nest 默认模板，不应作为项目主文档
- 后端成功响应约定为 `code === 0`
- 本地开发常依赖 PostgreSQL、Redis、AI 提供方凭证，以及可选的对象存储配置
