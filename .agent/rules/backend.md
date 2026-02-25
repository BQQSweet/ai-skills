---
trigger: always_on
glob: src/backend/**/*
description: ChefMate 后端开发规范，适用于 NestJS + PostgreSQL 环境。
---

# ChefMate 后端开发规范

## 🛠 技术栈

- **包管理器**：pnpm
- **框架**：NestJS (Node.js)
- **数据库**：PostgreSQL
- **持久层**：TypeORM / Prisma (根据实际选型)
- **缓存/实时**：Redis
- **大模型集成**：OpenAI / DeepSeek SDK

## 📂 目录结构规范

- `src/modules/`：业务模块，包含 `controller`, `service`, `entity`, `dto`。
- `src/common/`：全局公用组件（拦截器、过滤器、装饰器、中间件）。
- `src/config/`：配置文件管理。
- `src/guards/`：权限守卫（JWT 校验）。

## 命名约定

- **代码层**：
  - 类名：`PascalCase` (如 `RecipesController`)。
  - 变量/函数：`camelCase` (如 `getFridgeItems`)。
  - 接口/DTO：`PascalCase` (如 `CreateRecipeDto`)。
- **数据库层**：
  - 表名/字段名：`snake_case` (如 `fridge_items`, `user_id`)。

## 📝 API 设计规范

- **风格**：遵循 RESTful API 设计原则。
- **响应格式**：统一返回 `{ code: number, data: any, msg: string }`。
- **分页参数**：统一使用 `page` (从1开始) 和 `pageSize`。
- **错误处理**：使用 NestJS 内置 `HttpException` 或自定义异常过滤器，禁止返回 500 原始堆栈。

## 🔐 安全与权限

- **鉴权**：统一使用 JWT。
- **隔离**：所有业务操作（冰箱、食谱、清单）必须强制校验 `group_id`，确保家庭组数据隔离。
- **校验**：使用 `class-validator` 对进入系统的 DTO 进行严格校验。

## 🤖 AI 与业务逻辑

1. **LLM 集成**：AI 相关服务需支持 SSE (Server-Sent Events) 流式输出响应。
2. **锁机制**：多人协作场景（如买菜清点）使用 Redis 分布式锁或原子操作，防止数据冲突。
3. **定时任务**：食材过期预警逻辑应封装在 `CronService` 中，每日凌晨定时扫描。
