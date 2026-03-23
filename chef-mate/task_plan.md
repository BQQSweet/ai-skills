# Task Plan: 视频解析生成食谱 v1

## Goal
在 `server` 与 `chef-mate` 中落地“本地视频上传 -> 异步解析 -> 生成可复用 Recipe -> 前端查看与继续烹饪”的完整链路。

## Current Phase
Phase 5

## Phases

### Phase 1: Requirements & Discovery
- [x] 对齐用户确认的 v1 范围
- [x] 确认现有 Recipe、AI、前端承接链路
- [x] 记录运行时限制与缺口
- **Status:** complete

### Phase 2: Backend Infrastructure
- [x] 为 recipe 模块接入 BullMQ 队列
- [x] 实现大文件落盘上传与任务状态查询
- [x] 实现 FFmpeg/FFprobe 处理服务与清理逻辑
- **Status:** complete

### Phase 3: AI Parse Pipeline
- [x] 实现视频抽帧、抽音、转写、AI 结构化解析
- [x] 将结果归一为现有 Recipe 结构并保存
- [x] 完成失败/降级/重试逻辑
- **Status:** complete

### Phase 4: Frontend Experience
- [x] 新增 `pages/recipe/from-video` 页面及组件/composable
- [x] 接入上传、轮询、结果展示、购物清单复用
- [x] 在冰箱页 FAB 增加入口并更新路由
- **Status:** complete

### Phase 5: Testing & Verification
- [x] 运行类型检查与后端测试/构建级验证
- [x] 记录因环境缺失无法完成的验证项
- [x] 汇总改动与风险
- **Status:** complete

### Phase 6: Timeline Mode Upgrade
- [x] 新增 `strict` / `assisted` 模式和前端切换入口
- [x] 将视频解析改为分段候选步骤提取 + 时间线合并
- [x] 新增证据缓存与结果重生成接口
- [x] 补充时间线 helper 单测
- **Status:** complete

## Key Questions
1. 现有后端能否在不改 Prisma schema 的前提下承接视频解析任务？答案：可以，先使用 BullMQ job data + 现有 `Recipe` 表承接。
2. 前端是否需要新增独立食谱结果模型？答案：不需要，直接复用当前 `Recipe` 类型并补 `source_url` 前向兼容字段。

## Decisions Made
| Decision | Rationale |
|----------|-----------|
| v1 仅支持本地视频文件 | 避免平台链接解析、版权与稳定性风险 |
| 统一使用 `/api/recipe/*` 路由 | 与现有仓库风格一致 |
| 使用 BullMQ 异步任务 + 轮询 | 大文件与多阶段处理更稳，能恢复页面状态 |
| 不新增 Prisma 表 | 优先最小改动落地，使用队列状态查询即可 |
| 任务结果直接返回 `recipeId` 与 `recipe` | 前端无需二次组装，直接复用现有详情/烹饪链路 |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| 当前机器缺少 `ffmpeg`/`ffprobe` | 1 | 记录为环境前置条件，代码中显式检测并给出清晰错误 |
| 首次创建 planning 文件时误用“删除再新增”补丁 | 1 | 改为直接创建新文件 |

## Notes
- 优先保证后端链路可用，再补前端体验。
- 页面遵循 `docs/frontend-page-standards.md`，入口页只做编排。
- 任何新增 Vue 组件都保持 `script setup + TypeScript`，避免宽泛 `any`。
- 已完成代码实现与静态验证；剩余风险集中在部署环境缺少 `ffmpeg` / `ffprobe` 时无法真正跑通视频解析。
- 已完成时间线模式升级；剩余主要风险是不同视频风格下 OCR / 分段提取精度仍需联调观察。
