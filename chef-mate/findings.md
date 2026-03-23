# Findings & Decisions

## Requirements
- 支持用户选择本地视频文件并上传。
- 后端异步解析视频，生成结构化 Recipe。
- 新增任务提交与任务状态查询接口。
- 前端新增视频解析页面，支持上传、轮询、恢复轮询、结果态。
- 解析完成后可直接进入现有烹饪步骤流，并能衔接购物清单。
- 页面保留“视频链接（即将支持）”禁用入口，不做真实链接解析。

## Research Findings
- 现有 `server/src/modules/recipe` 已有 Recipe CRUD、AI 食谱生成、语音转写入口，但没有视频解析实现。
- `server/package.json` 已安装 `@nestjs/bullmq` 与 `bullmq`，但项目里还没有任何 BullMQ 队列或 processor 接线。
- 当前后端有图片多模态 `AiService.vision()` 与语音转写 `AiService.transcribeAudio()`，可复用为视频解析的子能力。
- 当前前端已有 `Recipe` 详情页、烹饪步骤页、购物清单复用流；只要产物归一为现有 `Recipe` 结构即可接入。
- 冰箱页 FAB 已是最适合承接“视频解析”新入口的位置。
- 当前机器没有 `ffmpeg` / `ffprobe`，代码必须显式检测并在运行时报清晰错误。
- 后端 `pnpm run build` 已通过，说明 BullMQ 接线、controller/service/provider 关系有效。
- 前端 `pnpm run type-check` 已通过，说明新增页面、组件、composable 与现有类型系统兼容。

## Technical Decisions
| Decision | Rationale |
|----------|-----------|
| 使用磁盘存储上传临时视频到 `uploads/recipe-video/tmp` | 避免内存模式处理大文件 |
| 任务状态来源于 BullMQ job 状态与进度 | 无需新增数据库表即可满足 v1 |
| 解析链路固定为校验 -> 抽帧 -> 抽音 -> 转写 -> AI 生成 -> 落库 | 便于进度展示与问题定位 |
| 抽取最多 8 张均匀分布关键帧 | 控制多模态输入体积与成本 |
| 失败时清理临时文件 | 避免磁盘堆积 |
| 前端轮询间隔固定 3 秒并缓存 `jobId` | 简单稳定，页面重进可恢复 |
| 结果页购物清单直接带“缺少食材”跳转购物页 | 复用现有购物流，避免再做一次选择弹层 |
| 视频步骤生成改为 `strict` / `assisted` 双模式 | 让用户显式控制“严格贴视频”与“允许补全”的取舍 |
| 使用本地 JSON + 缓存帧图做 24 小时证据缓存 | 无需新表即可支持结果页重生成 |
| 严格模式步骤来自“分段候选步骤 -> 时间线合并” | 优先修复顺序错误和漏步骤问题，而不是继续放大一次性大模型自由编排 |
| OCR 重复去重与配料卡保留改为 `ocrEntries -> ocrSpans -> step.details` | 既减少重复字幕，又保留“调碗料汁”这类步骤的佐料明细 |

## Issues Encountered
| Issue | Resolution |
|-------|------------|
| 需求文档曾写 v1 不支持在线链接，但本次用户提出链接需求 | 方案中明确缩回到本地视频 v1，并在页面保留“即将支持”入口 |
| notification 模块仍是 stub | v1 不做站内通知，完成回流靠轮询 |
| 当前无 OSS 服务封装 | v1 仅使用本地 `uploads/` 临时目录，不引入新的对象存储抽象 |
| 本机没有 `ffmpeg` / `ffprobe`，无法做端到端视频解析联调 | 已在代码层做显式依赖检查，并在进度/最终说明中标注为环境前置条件 |
| 切换模式重生成依赖本地证据缓存，缓存过期后无法无损重跑 | 后端已加过期报错与重新上传提示，联调时需重点确认提示体验 |

## Resources
- `/Users/byy/develop/Intelligent-workbench/PROJECT_CONTEXT.md`
- `/Users/byy/develop/Intelligent-workbench/docs/frontend-page-standards.md`
- `/Users/byy/develop/Intelligent-workbench/server/src/modules/recipe/recipe.controller.ts`
- `/Users/byy/develop/Intelligent-workbench/server/src/modules/recipe/recipe.service.ts`
- `/Users/byy/develop/Intelligent-workbench/server/src/ai/ai.service.ts`
- `/Users/byy/develop/Intelligent-workbench/chef-mate/src/services/recipe.ts`
- `/Users/byy/develop/Intelligent-workbench/chef-mate/src/pages/fridge/index.vue`

## Visual/Browser Findings
- 冰箱页当前已有 FAB 堆叠菜单和 `AI 灵感食谱` 入口，新增“视频解析”动作可以延续现有交互心智。
- 当前前端 `AiRecipe` 页面是卡片化浅色厨房风格；新页面可沿用相同暖色系与分段卡片设计。
