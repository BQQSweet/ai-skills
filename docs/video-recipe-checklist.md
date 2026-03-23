# 视频解析食谱 v1 部署与联调清单

本文用于把“本地视频 -> 异步解析 -> 生成 Recipe”功能跑通到可联调状态。

适用范围：

- `server`
- `chef-mate`
- 本地开发环境
- 测试环境 / 预发环境

## 1. 目标结果

完成以下链路即视为联调通过：

1. 用户在 `chef-mate` 冰箱页 FAB 点击“视频解析”
2. 选择本地 `mp4` 或 `mov` 视频
3. 前端上传成功并轮询任务状态
4. 后端完成抽帧、抽音、转写、AI 解析、Recipe 落库
5. 前端展示生成结果，并可：
   - 进入完整步骤页
   - 标记“已有/缺少食材”
   - 跳转购物清单

## 2. 环境前置检查

### 必需运行时

- Node.js / pnpm 已安装
- PostgreSQL 可访问
- Redis 可访问
- `ffmpeg` 可执行
- `ffprobe` 可执行

### 必需命令检查

```bash
node -v
pnpm -v
ffmpeg -version
ffprobe -version
```

如果 `ffmpeg` / `ffprobe` 不存在，视频解析任务会在后端直接失败。

### 常见安装方式

macOS:

```bash
brew install ffmpeg
```

Ubuntu / Debian:

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

## 3. 基础服务启动

仓库内提供了开发环境容器编排，可先拉起 PostgreSQL / Redis / MinIO：

```bash
cd server
docker compose -f docker-compose.dev.yml up -d
```

启动后建议验证：

```bash
docker ps
```

默认端口：

- PostgreSQL: `5432`
- Redis: `6379`
- MinIO API: `9000`
- MinIO Console: `9001`

## 4. 后端环境变量检查

参考文件：

- `server/.env.example`
- `server/src/ai/ai.service.ts`

### 最低必配

```env
PORT=3000
DATABASE_URL=...
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
JWT_SECRET=...
AI_API_KEY=...
AI_BASE_URL=...
AI_MODEL=...
AI_VISION_MODEL=...
AI_SILICONFLOW_API_KEY=...
```

### 视频解析推荐补齐

`AI_VISION_API_KEY` 和 `AI_VISION_BASE_URL` 未单独配置时会回退到 `AI_API_KEY` / `AI_BASE_URL`，但如果视觉模型与文本模型供应商不同，建议明确配置：

```env
AI_VISION_API_KEY=...
AI_VISION_BASE_URL=...
AI_VISION_MODEL=...
AI_SILICONFLOW_API_KEY=...
AI_SILICONFLOW_BASE_URL=https://api.siliconflow.cn/v1/audio/transcriptions
AI_SILICONFLOW_MODEL=FunAudioLLM/SenseVoiceSmall
```

说明：

- `AI_SILICONFLOW_API_KEY` 是视频转写必需项
- `AI_SPEECH_*` 只影响 TTS，不是这次视频解析链路的前置条件

## 5. 前端环境变量检查

参考文件：

- `chef-mate/.env.development`
- `chef-mate/scripts/update-ip.sh`

关键项：

```env
VITE_API_BASE_URL=http://<your-backend-host>:3000
```

如果用真机、模拟器或微信小程序联调，先执行：

```bash
cd chef-mate
pnpm run update-ip
```

## 6. 上传链路检查

### 本地直连开发

如果前端直接请求 Nest 服务，通常不需要额外配置上传大小限制。

### 经由反向代理

如果流量经过 Nginx / 网关，必须确认上传限制大于视频上限。建议至少 `600MB`。

Nginx 示例：

```nginx
client_max_body_size 600m;
```

否则会出现：

- 前端上传直接失败
- 返回 `413 Request Entity Too Large`

## 7. 启动顺序

### 启动后端

```bash
cd server
pnpm install
pnpm run start:dev
```

验证：

- Swagger 可打开：`http://localhost:3000/api/docs`
- 后端日志无 Redis 连接错误
- 后端日志无 `ffmpeg` / `ffprobe` 缺失错误

### 启动前端

H5:

```bash
cd chef-mate
pnpm install
pnpm run dev:h5
```

微信小程序：

```bash
cd chef-mate
pnpm run dev:mp-weixin
```

## 8. 视频解析 Smoke Test

建议准备一个 10 秒到 60 秒的竖屏做菜视频，优先满足：

- 文件格式：`mp4` 或 `mov`
- 文件大小：明显小于 `500MB`
- 画面中能看到食材与操作
- 最好包含口播或讲解音频

### 手工验证步骤

1. 打开冰箱页
2. 点击 FAB 展开菜单
3. 点击“视频解析”
4. 选择本地视频
5. 点击“开始解析”
6. 观察页面是否经历以下状态：
   - 上传中
   - 抽帧
   - 转写
   - 生成
7. 等待结果页出现
8. 验证结果页是否包含：
   - 菜名
   - 食材清单
   - 步骤预览
   - 已有 / 缺少食材标签
9. 点击“查看完整步骤”，确认能进入烹饪步骤页
10. 点击“生成购物清单”，确认能进入购物页并带上缺失食材

## 9. 后端接口验证点

### 提交任务

接口：

- `POST /api/recipe/from-video`

期望：

- 返回 `code === 0`
- `data.jobId` 存在
- `data.status === "queued"`

### 查询任务

接口：

- `GET /api/recipe/jobs/:jobId`

期望状态流转：

- `queued`
- `processing`
- `completed`

完成态期望：

- `recipeId` 存在
- `recipe` 存在
- `progress === 100`

失败态期望：

- `status === "failed"`
- `error` 有可读文案

## 10. 常见故障排查

### `ffmpeg not found` / `ffprobe not found`

原因：

- 部署机没有安装媒体处理工具

处理：

- 安装 `ffmpeg`
- 重新启动后端

### 视频上传后立刻失败

优先检查：

- 文件格式是否为 `mp4` / `mov`
- 文件大小是否超过 `500MB`
- 反向代理是否拦截大文件

### 任务一直停在 `queued`

优先检查：

- Redis 是否可连接
- BullMQ 是否成功初始化
- 后端是否只有 API 进程没有 worker 进程

当前仓库中 queue processor 已随 Nest 应用一起注册，通常只要后端进程正常启动即可消费任务。

### 任务停在 `transcribing` 或 `analyzing`

优先检查：

- `AI_SILICONFLOW_API_KEY` 是否正确
- 视觉模型或文本模型 API 是否可用
- 外网访问权限是否正常

### 结果页没有“已有食材”标记

优先检查：

- 当前用户是否已加入家庭组
- 当前组是否有冰箱库存
- 食材名称是否差异过大，导致轻量匹配失败

## 11. 联调完成标准

满足以下条件即可视为“可交付联调”：

- 后端可成功接收本地视频并创建任务
- 队列能消费任务并完成 Recipe 落库
- 前端页面能恢复轮询中的任务
- 结果页能展示 Recipe、食材匹配和步骤预览
- 可以从结果页进入烹饪步骤页和购物清单页
- 构建 / 类型检查通过

## 12. 当前实现备注

当前 v1 的边界：

- 仅支持本地视频
- 不支持平台分享链接解析
- 不做站内通知回流，完成态依赖前端轮询
- 运行环境缺少 `ffmpeg` / `ffprobe` 时会明确报错，而不是静默失败
