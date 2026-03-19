# ChefMate 后端开发设计方案

> 文档版本：v1.0
> 创建日期：2026-02-25
> 技术栈：NestJS + TypeScript + PostgreSQL + Redis + DeepSeek/OpenAI

---

## 1. 技术栈总览

| 层次     | 技术选型           | 版本   | 用途                                        |
| -------- | ------------------ | ------ | ------------------------------------------- |
| 运行时   | Node.js            | 20 LTS | JavaScript 运行环境                         |
| 框架     | NestJS             | 10.x   | 模块化后端框架                              |
| 语言     | TypeScript         | 5.x    | 严格模式，类型安全                          |
| ORM      | Prisma             | 5.x    | 类型安全的数据库操作和迁移管理              |
| 数据库   | PostgreSQL         | 16     | 主数据库，支持 JSONB                        |
| 缓存     | Redis              | 7.x    | 缓存 + 分布式锁 + 任务队列                  |
| 队列     | BullMQ             | 5.x    | 基于 Redis 的任务队列（视频解析等异步任务） |
| AI SDK   | OpenAI SDK         | 4.x    | 调用 DeepSeek/OpenAI 大模型 API             |
| 校验     | class-validator    | 0.14   | DTO 参数校验                                |
| 认证     | @nestjs/jwt        | 10.x   | JWT Token 认证                              |
| 定时任务 | @nestjs/schedule   | 4.x    | 食材过期扫描等 Cron                         |
| 文件存储 | MinIO / 阿里云 OSS | -      | 食材照片、视频文件存储                      |
| 日志     | winston            | 3.x    | 结构化日志                                  |
| API 文档 | @nestjs/swagger    | 7.x    | 自动生成 API 文档                           |

---

## 2. 项目结构

```
src/
├── main.ts                          # 应用入口
├── app.module.ts                    # 根模块
├── prisma/
│   ├── schema.prisma                # 数据库模型定义
│   └── migrations/                  # 迁移文件
├── common/
│   ├── decorators/                  # 自定义装饰器（@CurrentUser 等）
│   ├── filters/                     # 全局异常过滤器
│   ├── guards/                      # JWT 守卫、角色守卫
│   ├── interceptors/                # 响应拦截器（统一格式）
│   ├── pipes/                       # 校验管道
│   └── dto/                         # 通用 DTO（分页等）
├── config/
│   ├── app.config.ts                # 应用配置
│   ├── database.config.ts           # 数据库配置
│   ├── redis.config.ts              # Redis 配置
│   └── ai.config.ts                 # AI 模型配置
├── modules/
│   ├── auth/                        # 认证模块
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── dto/
│   ├── user/                        # 用户模块
│   ├── group/                       # 家庭组模块
│   ├── fridge/                      # 冰箱/食材模块
│   ├── recipe/                      # 食谱模块
│   ├── cooking/                     # 烹饪指引模块
│   ├── shopping/                    # 购物清单模块
│   ├── task/                        # 协作任务模块
│   ├── notification/                # 通知模块
│   └── stats/                       # 数据统计模块
├── ai/                              # AI 服务层（核心）
│   ├── ai.module.ts
│   ├── ai.service.ts                # AI 统一调用入口
│   ├── prompts/                     # Prompt 模板管理
│   │   ├── recipe-generate.prompt.ts
│   │   ├── recipe-recommend.prompt.ts
│   │   ├── ingredient-recognize.prompt.ts
│   │   └── cooking-chat.prompt.ts
│   ├── vision.service.ts            # 图片/视频识别
│   ├── tts.service.ts               # 文字转语音
│   └── asr.service.ts               # 语音转文字
└── jobs/                            # 异步任务
    ├── video-parse.job.ts           # 视频解析任务
    ├── expiry-check.job.ts          # 过期检测任务
    └── stats-report.job.ts          # 统计报告生成
```

---

## 3. 数据库设计

### 3.1 设计规范

| 规范项   | 选定值                                 | 理由                                        |
| -------- | -------------------------------------- | ------------------------------------------- |
| 数据库   | PostgreSQL 16                          | 支持 JSONB 存储食谱结构、全文搜索、数组类型 |
| 表名前缀 | 无前缀                                 | Prisma schema 已按模块组织，无需前缀        |
| 字段命名 | snake_case                             | 与 PostgreSQL 惯例一致                      |
| 主键策略 | UUID v4                                | 适合分布式场景和移动端离线生成              |
| 通用字段 | id, created_at, updated_at, deleted_at | deleted_at 用 nullable 时间戳实现软删除     |
| 字符集   | UTF-8 (PostgreSQL 默认)                | 支持中文和 emoji                            |

### 3.2 核心表结构（Prisma Schema）

```prisma
// ========== 用户与家庭组 ==========

model User {
  id            String    @id @default(uuid()) @db.Uuid
  phone         String    @unique @db.VarChar(20)
  password_hash String    @db.VarChar(255)
  nickname      String    @db.VarChar(50)
  avatar_url    String?   @db.VarChar(500)
  preferences   Json?     // 饮食偏好：{diet_type, allergies[], taste[], spice_level}
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  deleted_at    DateTime?

  groups        GroupMember[]
  cooking_histories CookingHistory[]
  notifications Notification[]
  recipe_favorites RecipeFavorite[]

  @@map("user")
}

model Group {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @db.VarChar(50)
  invite_code String   @unique @db.VarChar(8)
  owner_id    String   @db.Uuid
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  members     GroupMember[]
  fridge_items FridgeItem[]
  shopping_lists ShoppingList[]
  tasks       Task[]

  @@map("group")
}

model GroupMember {
  id       String @id @default(uuid()) @db.Uuid
  user_id  String @db.Uuid
  group_id String @db.Uuid
  role     String @default("member") @db.VarChar(20) // owner | admin | member

  user  User  @relation(fields: [user_id], references: [id])
  group Group @relation(fields: [group_id], references: [id])

  @@unique([user_id, group_id])
  @@map("group_member")
}

// ========== 食材管理 ==========

model FridgeItem {
  id              String    @id @default(uuid()) @db.Uuid
  group_id        String    @db.Uuid
  name            String    @db.VarChar(100)
  category        String    @db.VarChar(50)  // 蔬菜|水果|肉类|乳制品|调味品|其他
  quantity         Float
  unit            String    @db.VarChar(20)  // 个|斤|克|毫升|包|盒
  photo_url       String?   @db.VarChar(500)
  production_date DateTime? // 生产日期（标签识别）
  expire_date     DateTime  // 过期日期
  source          String    @default("image") @db.VarChar(20) // image | label
  status          String    @default("fresh") @db.VarChar(20) // fresh | expiring | expired | consumed
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt
  deleted_at      DateTime?

  group Group @relation(fields: [group_id], references: [id])

  @@index([group_id, status])
  @@index([expire_date])
  @@map("fridge_item")
}

// ========== 食谱 ==========

model Recipe {
  id          String   @id @default(uuid()) @db.Uuid
  title       String   @db.VarChar(200)
  description String?  @db.Text
  ingredients Json     // [{name, quantity, unit, optional}]
  steps       Json     // [{order, instruction, duration_min, timer_required}]
  nutrition   Json?    // {calories, protein_g, carbs_g, fat_g, fiber_g}
  difficulty  String   @db.VarChar(20) // easy | medium | hard
  cook_time   Int      // 分钟
  servings    Int      @default(2)
  source_type String   @db.VarChar(20) // ai_generated | video_parsed | user_created
  source_url  String?  @db.VarChar(500)
  tags        String[] // PostgreSQL 数组：["家常菜","快手菜","低卡"]
  created_by  String?  @db.Uuid
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  deleted_at  DateTime?

  favorites   RecipeFavorite[]
  cooking_histories CookingHistory[]

  @@index([source_type])
  @@map("recipe")
}

model RecipeFavorite {
  id        String   @id @default(uuid()) @db.Uuid
  user_id   String   @db.Uuid
  recipe_id String   @db.Uuid
  created_at DateTime @default(now())

  user   User   @relation(fields: [user_id], references: [id])
  recipe Recipe @relation(fields: [recipe_id], references: [id])

  @@unique([user_id, recipe_id])
  @@map("recipe_favorite")
}

model CookingHistory {
  id        String   @id @default(uuid()) @db.Uuid
  user_id   String   @db.Uuid
  recipe_id String   @db.Uuid
  rating    Int?     // 1-5 评分
  note      String?  @db.Text
  cooked_at DateTime @default(now())

  user   User   @relation(fields: [user_id], references: [id])
  recipe Recipe @relation(fields: [recipe_id], references: [id])

  @@map("cooking_history")
}

// ========== 购物与协作 ==========

model ShoppingList {
  id        String   @id @default(uuid()) @db.Uuid
  group_id  String   @db.Uuid
  title     String   @db.VarChar(100)
  status    String   @default("active") @db.VarChar(20) // active | completed
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  group Group          @relation(fields: [group_id], references: [id])
  items ShoppingItem[]

  @@map("shopping_list")
}

model ShoppingItem {
  id          String   @id @default(uuid()) @db.Uuid
  list_id     String   @db.Uuid
  name        String   @db.VarChar(100)
  quantity    Float
  unit        String   @db.VarChar(20)
  assigned_to String?  @db.Uuid
  is_bought   Boolean  @default(false)
  bought_at   DateTime?

  list ShoppingList @relation(fields: [list_id], references: [id])

  @@map("shopping_item")
}

model Task {
  id          String    @id @default(uuid()) @db.Uuid
  group_id    String    @db.Uuid
  type        String    @db.VarChar(30) // buy_grocery | prep_ingredient | cook | clean
  title       String    @db.VarChar(200)
  description String?   @db.Text
  assigned_to String?   @db.Uuid
  status      String    @default("pending") @db.VarChar(20) // pending | in_progress | done
  due_date    DateTime?
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  group Group @relation(fields: [group_id], references: [id])

  @@index([group_id, status])
  @@map("task")
}

// ========== 通知 ==========

model Notification {
  id        String   @id @default(uuid()) @db.Uuid
  user_id   String   @db.Uuid
  type      String   @db.VarChar(30) // expiry_warning | task_assigned | task_done | system
  title     String   @db.VarChar(200)
  content   String   @db.Text
  is_read   Boolean  @default(false)
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id])

  @@index([user_id, is_read])
  @@map("notification")
}
```

---

## 4. 统一规范

### 4.1 API 响应格式

```typescript
// 统一响应结构
interface ApiResponse<T> {
  code: number; // 0=成功，非0=错误码
  data: T; // 业务数据
  msg: string; // 提示信息
}

// 分页响应
interface PaginatedResponse<T> {
  code: number;
  data: {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };
  msg: string;
}
```

### 4.2 错误码定义

| 错误码 | 说明              | HTTP 状态码 |
| ------ | ----------------- | ----------- |
| 0      | 成功              | 200         |
| 1001   | 参数校验失败      | 400         |
| 1002   | 未登录            | 401         |
| 1003   | 无权限            | 403         |
| 1004   | 资源不存在        | 404         |
| 2001   | 手机号已注册      | 409         |
| 2002   | 密码错误          | 401         |
| 2003   | 验证码错误/过期   | 400         |
| 3001   | 家庭组不存在      | 404         |
| 3002   | 邀请码无效        | 400         |
| 3003   | 非组内成员        | 403         |
| 4001   | AI 服务暂时不可用 | 503         |
| 4002   | AI 响应超时       | 504         |
| 4003   | 文件格式不支持    | 400         |
| 4004   | 文件过大          | 413         |

### 4.3 家庭组数据隔离守卫

```typescript
// 所有业务操作强制校验 group_id
@Injectable()
export class GroupGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const groupId = request.params.groupId || request.body.groupId;

    // 校验用户是否属于该家庭组
    const member = await this.prisma.groupMember.findUnique({
      where: { user_id_group_id: { user_id: user.id, group_id: groupId } },
    });
    if (!member) throw new ForbiddenException("非组内成员");
    request.groupRole = member.role;
    return true;
  }
}
```

---

## 5. 模块设计——基础业务模块

### 5.1 模块 1：用户认证

#### 接口设计

| 方法 | 路径                 | 描述           | 请求参数                  | 响应                          |
| ---- | -------------------- | -------------- | ------------------------- | ----------------------------- |
| POST | `/api/auth/register` | 手机号注册     | `{phone, code, password, nickname?}` | `{token, refreshToken, user}` |
| POST | `/api/auth/login`    | 登录           | `{type, phone?, code?, account?, password?}` | `{token, refreshToken, user}` |
| POST | `/api/auth/refresh`  | 刷新 Token     | `{refreshToken}`          | `{token, refreshToken}`       |
| POST | `/api/auth/sms-code` | 发送短信验证码 | `{phone, scene}`          | `{expiresIn}`                 |

#### 核心业务逻辑

1. 注册：校验注册短信验证码 → bcrypt 加密密码 → 创建用户 → 签发 JWT
2. 登录：支持密码登录与验证码登录；验证码登录仅允许已注册账号使用
3. Token 刷新：验证 refreshToken → 签发新的 token 对
4. 短信验证码存 Redis，按场景区分 key，TTL=5分钟，限流每分钟 1 次

### 5.2 模块 2：家庭组管理

#### 接口设计

| 方法   | 路径                                   | 描述                            |
| ------ | -------------------------------------- | ------------------------------- |
| POST   | `/api/groups`                          | 创建家庭组，自动生成 8 位邀请码 |
| POST   | `/api/groups/join`                     | 通过邀请码加入家庭组            |
| GET    | `/api/groups/:groupId/members`         | 获取家庭组成员列表              |
| PATCH  | `/api/groups/:groupId`                 | 修改组信息（仅 owner/admin）    |
| DELETE | `/api/groups/:groupId/members/:userId` | 移除成员（仅 owner）            |

#### 核心逻辑

- 邀请码生成：8 位随机字符（去除易混淆字符 0OIl），存入 Redis 并设置 24h 过期
- 创建者自动成为 owner 角色
- 每个用户可加入多个家庭组，通过 `group_member` 中间表关联

### 5.3 模块 9：家庭协作任务

#### 接口设计

| 方法   | 路径                         | 描述                               |
| ------ | ---------------------------- | ---------------------------------- |
| POST   | `/api/groups/:groupId/tasks` | 创建任务并分配                     |
| GET    | `/api/groups/:groupId/tasks` | 获取任务列表（支持按 status 筛选） |
| PATCH  | `/api/tasks/:taskId`         | 更新任务状态                       |
| DELETE | `/api/tasks/:taskId`         | 删除任务                           |

#### 核心逻辑

- 创建任务时通过 Notification 模块推送通知给被分配人
- 状态流转：pending → in_progress → done
- 使用 Redis 分布式锁防止并发状态更新冲突：`LOCK:task:{taskId}`

### 5.4 模块 4：食材过期预警

#### 接口设计

| 方法 | 路径                                   | 描述                      |
| ---- | -------------------------------------- | ------------------------- |
| GET  | `/api/groups/:groupId/fridge/expiring` | 获取即将过期食材（3天内） |

#### 定时任务（CronService）

```typescript
@Cron('0 8 * * *') // 每天早上 8:00
async checkExpiringItems() {
  const threeDaysLater = addDays(new Date(), 3);
  const expiringItems = await this.prisma.fridgeItem.findMany({
    where: {
      status: 'fresh',
      expire_date: { lte: threeDaysLater },
      deleted_at: null,
    },
    include: { group: { include: { members: true } } },
  });

  // 按家庭组分组 → 推送通知给所有成员
  // 同时更新 status 为 'expiring'
  // 已过期的更新为 'expired'
}
```

### 5.5 模块 14：消息通知

#### 接口设计

| 方法  | 路径                              | 描述                 |
| ----- | --------------------------------- | -------------------- |
| GET   | `/api/notifications`              | 获取通知列表（分页） |
| PATCH | `/api/notifications/:id/read`     | 标记已读             |
| PATCH | `/api/notifications/read-all`     | 全部已读             |
| GET   | `/api/notifications/unread-count` | 未读数量             |

#### 推送机制

- 应用内：轮询 `/api/notifications/unread-count`（30s 间隔）
- 离线推送：集成 UniPush（Uni-app 官方推送），通过 `uni-push` 服务下发

### 5.6 模块 11-16：其他 P1 模块（简要设计）

| 模块     | 核心接口                                                              | 要点                                                      |
| -------- | --------------------------------------------------------------------- | --------------------------------------------------------- |
| 食谱收藏 | `POST/DELETE /api/recipes/:id/favorite`, `GET /api/recipes/favorites` | user_id + recipe_id 联合唯一约束                          |
| 营养信息 | 食谱响应中直接包含 `nutrition` JSON 字段                              | AI 生成食谱时同步生成营养数据                             |
| 食谱分享 | `POST /api/recipes/:id/share`                                         | 生成分享链接/海报，包含食谱摘要                           |
| 个人偏好 | `GET/PUT /api/user/preferences`                                       | 存储为 JSON：`{diet_type, allergies, taste, spice_level}` |
| 数据统计 | `GET /api/groups/:groupId/stats/weekly`                               | CronJob 每周一凌晨生成，缓存到 Redis                      |

---

## 6. 模块设计——AI 核心模块（详细设计）

> 🤖 以下模块深度集成大模型能力，每个模块标注了大模型的**调用方式、Prompt 设计、输入输出格式和降级策略**。

### 6.1 AI 服务层统一架构

```typescript
// ai/ai.service.ts —— AI 统一调用入口
@Injectable()
export class AiService {
  private client: OpenAI;

  constructor(private config: ConfigService) {
    this.client = new OpenAI({
      apiKey: config.get("AI_API_KEY"),
      baseURL: config.get("AI_BASE_URL"), // DeepSeek: https://api.deepseek.com/v1
    });
  }

  // 普通调用（等待完整响应）
  async chat(messages: ChatMessage[], options?: ChatOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.config.get("AI_MODEL"), // deepseek-chat / gpt-4o
      messages,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2000,
      response_format: options?.jsonMode ? { type: "json_object" } : undefined,
    });
    return response.choices[0].message.content;
  }

  // 流式调用（SSE）
  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    const stream = await this.client.chat.completions.create({
      model: this.config.get("AI_MODEL"),
      messages,
      stream: true,
    });
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) yield content;
    }
  }

  // 视觉识别（多模态）
  async vision(imageBase64: string, prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.config.get("AI_VISION_MODEL"), // gpt-4o / deepseek-vl
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });
    return response.choices[0].message.content;
  }
}
```

---

### 6.2 模块 3：拍照智能入库 🤖

#### 📌 功能概述

用户拍照上传食材图片 → AI 视觉模型判断是否有标签 → 有标签走 OCR 路径，无标签走图像识别路径 → 返回结构化食材信息 → 用户确认后入库。

#### 接口设计

| 方法   | 路径                                  | 描述                 | Content-Type          |
| ------ | ------------------------------------- | -------------------- | --------------------- |
| POST   | `/api/groups/:groupId/fridge/scan`    | 上传照片 AI 识别     | `multipart/form-data` |
| POST   | `/api/groups/:groupId/fridge/confirm` | 确认识别结果入库     | `application/json`    |
| GET    | `/api/groups/:groupId/fridge/items`   | 获取食材列表         | -                     |
| PATCH  | `/api/fridge/items/:id`               | 修改食材信息         | `application/json`    |
| DELETE | `/api/fridge/items/:id`               | 删除食材（标记消耗） | -                     |

#### 🤖 大模型使用详细步骤

**步骤 1：上传图片到 OSS，获取 URL**

```typescript
const photoUrl = await this.ossService.upload(
  file,
  `fridge/${groupId}/${uuid()}`,
);
const imageBase64 = file.buffer.toString("base64");
```

**步骤 2：调用 AI 视觉模型识别**

```typescript
// 使用多模态模型：gpt-4o 或 deepseek-vl
const result = await this.aiService.vision(
  imageBase64,
  INGREDIENT_RECOGNIZE_PROMPT,
);
const parsed: IngredientRecognizeResult = JSON.parse(result);
```

**步骤 3：Prompt 模板**

```typescript
// ai/prompts/ingredient-recognize.prompt.ts
export const INGREDIENT_RECOGNIZE_PROMPT = `
你是一个专业的食材识别助手。请分析这张图片并返回 JSON 格式的识别结果。

## 识别规则
1. 首先判断图片中是否包含商品标签（包装袋、瓶身标签、价签等）
2. 如果有标签：通过标签文字提取食材名称、生产日期、保质期、规格等信息
3. 如果无标签：直接识别食材种类，估算数量

## 返回格式（严格 JSON）
{
  "has_label": true/false,
  "items": [
    {
      "name": "食材名称",
      "category": "蔬菜|水果|肉类|海鲜|乳制品|调味品|谷物|饮品|其他",
      "quantity": 数量(数字),
      "unit": "个|斤|克|毫升|包|盒|瓶|袋",
      "production_date": "YYYY-MM-DD 或 null",
      "shelf_life_days": 保质期天数(数字),
      "source": "label|image",
      "confidence": 0.0-1.0
    }
  ]
}

## 注意事项
- 如果识别不确定，confidence 设为较低值
- 没有标签时 production_date 返回 null，shelf_life_days 使用常识推断
- 多个食材请全部列出
`;
```

**步骤 4：处理识别结果**

```typescript
async scanIngredients(groupId: string, file: Express.Multer.File) {
  const imageBase64 = file.buffer.toString('base64');
  const photoUrl = await this.ossService.upload(file, `fridge/${groupId}/${uuid()}`);

  try {
    const aiResult = await this.aiService.vision(imageBase64, INGREDIENT_RECOGNIZE_PROMPT);
    const parsed = JSON.parse(aiResult);

    // 计算过期日期
    const items = parsed.items.map(item => ({
      ...item,
      photo_url: photoUrl,
      expire_date: item.production_date
        ? addDays(new Date(item.production_date), item.shelf_life_days)
        : addDays(new Date(), item.shelf_life_days),
    }));

    return { items, has_label: parsed.has_label }; // 返回给前端确认
  } catch (error) {
    // 降级：返回空结果，引导用户手动输入
    return { items: [], has_label: false, fallback: true };
  }
}
```

#### 关键技术点

- **模型选择**：使用多模态视觉模型（gpt-4o 或 deepseek-vl），要求支持图片输入
- **JSON Mode**：使用 `response_format: { type: 'json_object' }` 确保返回合法 JSON
- **降级策略**：AI 识别失败时，返回空结果并在前端展示手动输入表单
- **图片压缩**：上传前在客户端压缩至 1080px 宽度，减少 token 消耗

---

### 6.3 模块 5 & 6：AI 食谱推荐与生成 🤖

#### 📌 功能概述

- **推荐食谱**（模块 5）：根据用户偏好和季节推荐，非流式返回
- **食材生成食谱**（模块 6）：根据选定食材 AI 生成，**SSE 流式输出**

#### 接口设计

| 方法 | 路径                           | 描述             | 响应方式     |
| ---- | ------------------------------ | ---------------- | ------------ |
| GET  | `/api/recipes/recommend`       | AI 推荐每日食谱  | JSON         |
| POST | `/api/recipes/generate`        | 根据食材生成食谱 | **SSE 流式** |
| GET  | `/api/recipes/:id`             | 获取食谱详情     | JSON         |
| GET  | `/api/groups/:groupId/recipes` | 获取组内食谱列表 | JSON 分页    |

#### 🤖 大模型使用详细步骤——流式食谱生成

**步骤 1：构建 Prompt**

```typescript
// ai/prompts/recipe-generate.prompt.ts
export function buildRecipeGeneratePrompt(
  ingredients: string[],
  preferences: UserPreferences,
  memberCount: number,
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `你是一位专业中餐厨师和营养师。请根据用户提供的食材，生成适合家庭烹饪的食谱。

## 输出要求
- 生成 3-5 道菜品推荐
- 每道菜包含: 菜名、简介、难度(easy/medium/hard)、烹饪时间、食材清单、分步骤操作、营养信息
- 优先使用用户提供的食材，可补充少量常见调味料
- 考虑用户的饮食偏好和过敏源
- 每个步骤如需计时，标注 timer_required: true 和 duration_min

## 输出格式（严格 JSON）
{
  "recipes": [
    {
      "title": "菜名",
      "description": "一句话简介",
      "difficulty": "easy|medium|hard",
      "cook_time": 分钟数,
      "servings": ${memberCount},
      "ingredients": [
        {"name": "食材名", "quantity": 数量, "unit": "单位", "optional": false}
      ],
      "steps": [
        {"order": 1, "instruction": "步骤描述", "duration_min": 分钟或null, "timer_required": false}
      ],
      "nutrition": {
        "calories": 千卡, "protein_g": 克, "carbs_g": 克, "fat_g": 克
      },
      "tags": ["家常菜", "快手菜"]
    }
  ]
}`,
    },
    {
      role: "user",
      content: `可用食材：${ingredients.join("、")}
饮食偏好：${preferences.diet_type || "无"}
过敏源：${preferences.allergies?.join("、") || "无"}
口味偏好：${preferences.taste?.join("、") || "不限"}
用餐人数：${memberCount}人`,
    },
  ];
}
```

**步骤 2：SSE 流式输出实现**

```typescript
// recipe/recipe.controller.ts
@Post('generate')
@Sse()
async generateRecipe(@Body() dto: GenerateRecipeDto, @Req() req) {
  return new Observable<MessageEvent>((subscriber) => {
    const run = async () => {
      const user = req.user;
      const preferences = await this.userService.getPreferences(user.id);
      const memberCount = await this.groupService.getMemberCount(dto.groupId);
      const messages = buildRecipeGeneratePrompt(dto.ingredients, preferences, memberCount);

      let fullContent = '';
      try {
        for await (const chunk of this.aiService.chatStream(messages)) {
          fullContent += chunk;
          subscriber.next({ data: JSON.stringify({ type: 'chunk', content: chunk }) });
        }
        // 流结束后保存食谱到数据库
        const recipes = JSON.parse(fullContent).recipes;
        const saved = await this.recipeService.saveRecipes(recipes, user.id, 'ai_generated');
        subscriber.next({ data: JSON.stringify({ type: 'done', recipeIds: saved.map(r => r.id) }) });
      } catch (error) {
        subscriber.next({ data: JSON.stringify({ type: 'error', msg: 'AI 服务暂时不可用' }) });
        // 降级：返回缓存的热门食谱
        const fallback = await this.recipeService.getPopularRecipes(5);
        subscriber.next({ data: JSON.stringify({ type: 'fallback', recipes: fallback }) });
      }
      subscriber.complete();
    };
    run();
  });
}
```

**步骤 3：缓存与限流策略**

```typescript
// 相同食材组合 + 偏好 → 缓存 key，避免重复调用
const cacheKey = `recipe:gen:${md5(ingredients.sort().join(",") + JSON.stringify(preferences))}`;
const cached = await this.redis.get(cacheKey);
if (cached) return JSON.parse(cached); // 命中缓存直接返回

// 限流：每个用户每分钟最多 5 次 AI 生成请求
const rateLimitKey = `rate:recipe:${userId}`;
const count = await this.redis.incr(rateLimitKey);
if (count === 1) await this.redis.expire(rateLimitKey, 60);
if (count > 5) throw new HttpException("操作过于频繁", 429);
```

---

### 6.4 模块 10：智能购物清单 🤖

#### 📌 功能概述

选定一组食谱 → AI 分析食材清单 → 与冰箱库存比对 → 生成缺失食材购物清单 → 支持分配给家庭成员。

#### 接口设计

| 方法  | 路径                                     | 描述                        |
| ----- | ---------------------------------------- | --------------------------- |
| POST  | `/api/groups/:groupId/shopping/generate` | 根据食谱生成购物清单        |
| GET   | `/api/groups/:groupId/shopping/lists`    | 获取购物清单列表            |
| PATCH | `/api/shopping/items/:itemId`            | 更新购物项（标记已买/分配） |

#### 核心业务逻辑

```typescript
async generateShoppingList(groupId: string, recipeIds: string[]) {
  // 1. 获取所有食谱的食材清单
  const recipes = await this.prisma.recipe.findMany({
    where: { id: { in: recipeIds } },
    select: { ingredients: true, title: true },
  });

  // 2. 汇总所有食材并合并同类项
  const allIngredients = this.mergeIngredients(
    recipes.flatMap(r => r.ingredients as Ingredient[])
  );

  // 3. 查询冰箱库存
  const fridgeItems = await this.prisma.fridgeItem.findMany({
    where: { group_id: groupId, status: { in: ['fresh', 'expiring'] }, deleted_at: null },
  });

  // 4. 比对：扣除已有库存，生成缺失清单
  const missingItems = this.calculateMissing(allIngredients, fridgeItems);

  // 5. 创建购物清单
  const list = await this.prisma.shoppingList.create({
    data: {
      group_id: groupId,
      title: `${recipes.map(r => r.title).join('+')} 购物清单`,
      items: { create: missingItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
      })) },
    },
    include: { items: true },
  });

  return list;
}
```

---

### 6.5 模块 7：视频/音频识别生成食谱 🤖

#### 📌 功能概述

用户上传视频/音频文件 → 校验格式和大小 → 提交到 BullMQ 异步任务队列 → 视频提取关键帧+音频 ASR 转文字 → AI 多模态分析 → 生成结构化食谱 → 通知用户完成。

#### 接口设计

| 方法 | 路径                       | 描述              | 说明                 |
| ---- | -------------------------- | ----------------- | -------------------- |
| POST | `/api/recipes/from-video`  | 上传视频/音频解析 | 返回 jobId，异步处理 |
| GET  | `/api/recipes/jobs/:jobId` | 查询解析进度      | 返回状态和结果       |

#### 🤖 大模型使用详细步骤

**步骤 1：文件校验与入队**

```typescript
async submitVideoParse(file: Express.Multer.File, userId: string) {
  // 校验：格式(MP4/MOV/MP3/WAV/M4A)、大小(≤500MB)、时长(≤30min)
  this.validateFile(file);
  const fileUrl = await this.ossService.upload(file, `video/${userId}/${uuid()}`);

  // 提交到 BullMQ 异步队列
  const job = await this.videoQueue.add('parse-video', {
    fileUrl, userId, mimeType: file.mimetype,
  }, { attempts: 2, backoff: { type: 'exponential', delay: 5000 } });

  return { jobId: job.id, status: 'processing' };
}
```

**步骤 2：异步任务处理（Worker）**

```typescript
// jobs/video-parse.job.ts
@Processor("video-parse")
export class VideoParseProcessor {
  @Process("parse-video")
  async handle(job: Job) {
    const { fileUrl, userId, mimeType } = job.data;

    // 2a. 如果是视频 → 提取关键帧 + 音轨分离
    let frames: string[] = []; // base64 关键帧
    let transcript = "";

    if (mimeType.startsWith("video/")) {
      frames = await this.ffmpegService.extractKeyFrames(fileUrl, {
        interval: 30,
      }); // 每30秒一帧
      const audioPath = await this.ffmpegService.extractAudio(fileUrl);
      transcript = await this.asrService.transcribe(audioPath); // ASR 语音转文字
    } else {
      // 2b. 如果是音频 → 直接 ASR 转文字
      transcript = await this.asrService.transcribe(fileUrl);
    }

    // 2c. 调用 AI 多模态分析
    const recipe = await this.aiService.analyzeVideoRecipe(frames, transcript);

    // 2d. 保存食谱并通知用户
    const saved = await this.recipeService.saveRecipe(
      recipe,
      userId,
      "video_parsed",
    );
    await this.notificationService.create(userId, {
      type: "system",
      title: "视频解析完成",
      content: `食谱「${saved.title}」已生成，点击查看`,
    });

    return saved.id;
  }
}
```

**步骤 3：AI 多模态分析 Prompt**

```typescript
async analyzeVideoRecipe(frames: string[], transcript: string): Promise<Recipe> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `你是一个专业的美食视频分析助手。根据视频关键帧画面和语音转录文字，
提取完整的烹饪食谱信息。返回严格 JSON 格式（与食谱生成格式一致）。
注意：
- 从画面中识别使用的食材和烹饪动作
- 从转录文字中提取用量、时间、火候等关键信息
- 合并画面和文字信息，生成完整的分步操作
- 如果信息不完整，基于烹饪常识合理补充`
    },
    {
      role: 'user',
      content: [
        { type: 'text', text: `语音转录内容：\n${transcript}` },
        // 附加关键帧图片（最多10帧，避免 token 过多）
        ...frames.slice(0, 10).map(f => ({
          type: 'image_url' as const,
          image_url: { url: `data:image/jpeg;base64,${f}` },
        })),
      ],
    },
  ];

  const result = await this.aiService.chat(messages, { jsonMode: true, maxTokens: 3000 });
  return JSON.parse(result);
}
```

#### 关键技术点

- **异步处理**：使用 BullMQ 队列，支持重试和进度查询
- **FFmpeg**：通过 `fluent-ffmpeg` 库提取关键帧和音轨
- **ASR 服务**：可选 OpenAI Whisper API 或本地 `whisper.cpp`
- **Token 控制**：关键帧最多取 10 帧，transcript 超过 4000 字时截取关键段落
- **超时降级**：任务超过 60 秒未完成，标记为失败并通知用户手动创建

---

### 6.6 模块 8：沉浸式烹饪指引 🤖

#### 📌 功能概述

用户选择食谱进入烹饪模式 → 后端解析食谱步骤 → 逐步下发烹饪指令 → 接收语音指令（ASR）→ 响应指令/AI 对话（LLM）→ TTS 语音播报 → 智能倒计时管理。

#### 接口设计

| 方法 | 路径                              | 描述         | 说明                    |
| ---- | --------------------------------- | ------------ | ----------------------- |
| POST | `/api/cooking/start`              | 开始烹饪会话 | 返回 sessionId 和第一步 |
| POST | `/api/cooking/:sessionId/command` | 发送语音指令 | 上传音频 → ASR → 执行   |
| POST | `/api/cooking/:sessionId/chat`    | 自由对话提问 | 文字/语音 → AI 回答     |
| GET  | `/api/cooking/:sessionId/step/:n` | 获取指定步骤 | 返回步骤详情+TTS 音频   |
| POST | `/api/cooking/:sessionId/tts`     | 文字转语音   | 返回音频流              |

#### 🤖 大模型使用详细步骤

**步骤 1：创建烹饪会话**

```typescript
async startCooking(recipeId: string, userId: string) {
  const recipe = await this.prisma.recipe.findUnique({ where: { id: recipeId } });
  const steps = recipe.steps as CookingStep[];

  // 在 Redis 中创建会话状态
  const sessionId = uuid();
  await this.redis.hset(`cooking:${sessionId}`, {
    recipeId, userId,
    currentStep: 0,
    totalSteps: steps.length,
    status: 'active',
    startedAt: new Date().toISOString(),
  });
  // 会话 2 小时过期
  await this.redis.expire(`cooking:${sessionId}`, 7200);

  // 生成第一步的 TTS 音频
  const firstStep = steps[0];
  const audioUrl = await this.ttsService.synthesize(firstStep.instruction);

  return { sessionId, step: firstStep, audioUrl, totalSteps: steps.length };
}
```

**步骤 2：语音指令处理（ASR + 指令匹配）**

```typescript
async handleVoiceCommand(sessionId: string, audioBuffer: Buffer) {
  // ASR：语音转文字
  const text = await this.asrService.transcribe(audioBuffer);

  // 指令匹配（关键词映射）
  const COMMAND_MAP: Record<string, string[]> = {
    'next':    ['下一步', '继续', '好了', '完成'],
    'prev':    ['上一步', '返回'],
    'repeat':  ['重复', '再说一遍', '没听清'],
    'pause':   ['暂停'],
    'resume':  ['继续播放', '恢复'],
    'timer':   ['计时', '倒计时', '设置.*分钟'],
    'query_time':  ['多久', '还有多久', '要多长时间'],
    'query_ingredient': ['什么材料', '用量多少', '需要什么'],
  };

  const command = this.matchCommand(text, COMMAND_MAP);

  if (command) {
    return this.executeCommand(sessionId, command, text);
  } else {
    // 未匹配到指令 → 转为自由对话（调用 LLM）
    return this.handleCookingChat(sessionId, text);
  }
}
```

**步骤 3：烹饪自由对话 Prompt**

```typescript
// ai/prompts/cooking-chat.prompt.ts
export function buildCookingChatPrompt(
  recipeName: string,
  currentStep: CookingStep,
  allSteps: CookingStep[],
  question: string,
): ChatMessage[] {
  return [
    {
      role: "system",
      content: `你是用户的烹饪助手，正在指导用户烹饪「${recipeName}」。
当前在第 ${currentStep.order} 步：${currentStep.instruction}

全部步骤：
${allSteps.map((s) => `${s.order}. ${s.instruction}`).join("\n")}

请用简短、口语化的方式回答用户的烹饪问题。
回答控制在 2-3 句话以内，因为会通过语音播报。
如果问题与当前烹饪无关，礼貌地引导回到烹饪话题。`,
    },
    { role: "user", content: question },
  ];
}
```

**步骤 4：TTS 语音合成**

```typescript
// ai/tts.service.ts
@Injectable()
export class TtsService {
  async synthesize(text: string): Promise<string> {
    // 方案 A：使用 OpenAI TTS API
    const response = await this.openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // 女声，适合烹饪场景
      input: text,
      response_format: "mp3",
    });

    // 上传到 OSS 并返回 URL
    const buffer = Buffer.from(await response.arrayBuffer());
    return this.ossService.upload(buffer, `tts/${uuid()}.mp3`);
  }
}
```

#### 关键技术点

- **会话状态**：存储在 Redis（Hash 结构），支持步骤导航和状态跟踪
- **ASR** 选型：OpenAI Whisper API（精度高） / 腾讯云 ASR（中文优化） / 本地 whisper.cpp（成本低）
- **TTS** 选型：OpenAI TTS API（nova 音色） / 腾讯云 TTS / Edge TTS（免费）
- **指令匹配**：正则表达式 + 关键词匹配，避免每次都调用 LLM，降低延迟和成本
- **倒计时管理**：通过 BullMQ Delayed Job 实现，到时间后推送提醒

---

## 7. 部署方案

### 7.1 开发环境

| 工具       | 配置                                 |
| ---------- | ------------------------------------ |
| Node.js    | v20 LTS                              |
| PostgreSQL | Docker: `postgres:16-alpine`         |
| Redis      | Docker: `redis:7-alpine`             |
| MinIO      | Docker: `minio/minio` (本地替代 OSS) |

```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: postgres:16-alpine
    ports: ["5432:5432"]
    environment:
      POSTGRES_DB: chefmate
      POSTGRES_USER: chefmate
      POSTGRES_PASSWORD: chefmate_dev
    volumes: ["pgdata:/var/lib/postgresql/data"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

  minio:
    image: minio/minio
    ports: ["9000:9000", "9001:9001"]
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
```

### 7.2 生产环境（推荐）

| 组件     | 方案                  | 说明               |
| -------- | --------------------- | ------------------ |
| 应用     | Docker + PM2          | 多进程部署         |
| 数据库   | 阿里云 RDS PostgreSQL | 托管服务，自动备份 |
| 缓存     | 阿里云 Redis          | 托管服务           |
| 对象存储 | 阿里云 OSS            | 图片/视频/音频存储 |
| 反向代理 | Nginx                 | SSL + 负载均衡     |
| CI/CD    | GitHub Actions        | 自动构建和部署     |

### 7.3 环境变量

```bash
# .env.example
# 应用
PORT=3000
NODE_ENV=production

# 数据库
DATABASE_URL=postgresql://user:pass@host:5432/chefmate

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# JWT
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=2h
JWT_REFRESH_EXPIRES_IN=7d

# AI 大模型
AI_API_KEY=sk-xxxx
AI_BASE_URL=https://api.deepseek.com/v1
AI_MODEL=deepseek-chat
AI_VISION_MODEL=deepseek-vl

# 对象存储
OSS_ENDPOINT=https://oss-cn-hangzhou.aliyuncs.com
OSS_BUCKET=chefmate
OSS_ACCESS_KEY=xxxx
OSS_SECRET_KEY=xxxx

# TTS/ASR
TTS_PROVIDER=openai  # openai | tencent | edge
ASR_PROVIDER=openai  # openai | tencent | whisper-local
```
