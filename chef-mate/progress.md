# Progress Log

## Session: 2026-03-20

### Phase 1: Requirements & Discovery
- **Status:** complete
- **Started:** 2026-03-20 00:00
- Actions taken:
  - 阅读仓库总文档、客户端与后端入口文件。
  - 确认视频解析需求在设计文档中已有理想方案，但代码尚未落地。
  - 确认现有 Recipe、烹饪步骤、购物清单链路可复用。
  - 确认当前环境缺少 `ffmpeg` / `ffprobe`。
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

### Phase 2: Backend Infrastructure
- **Status:** complete
- Actions taken:
  - 开始梳理 recipe 模块、AI service、上传模式与前端入口。
  - 初始化 planning 文件，记录关键约束与方案。
  - 为后端接入 BullMQ 全局配置与 recipe queue。
  - 新增视频上传磁盘落盘、任务提交、任务状态查询、FFmpeg/FFprobe 处理服务与 processor。
  - 扩展 AI service，支持视频多模态食谱分析、文件路径转写与 JSON 修复。
- Files created/modified:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
  - `../server/src/app.module.ts`
  - `../server/src/ai/ai.service.ts`
  - `../server/src/modules/recipe/recipe.module.ts`
  - `../server/src/modules/recipe/recipe.controller.ts`
  - `../server/src/modules/recipe/recipe.service.ts`
  - `../server/src/modules/recipe/constants/video-recipe.constants.ts`
  - `../server/src/modules/recipe/video/*`

### Phase 3: Frontend Experience
- **Status:** complete
- Actions taken:
  - 新增 `pages/recipe/from-video` 页面与四个子组件。
  - 新增 `useVideoRecipeJob` composable，接入上传、轮询、恢复轮询、结果与失败态。
  - 扩展 `src/services/recipe.ts`、`src/types/recipe.d.ts`、`src/utils/storage.ts`。
  - 在冰箱页 FAB 中新增“视频解析”入口，并保持原 AI 灵感食谱入口不变。
- Files created/modified:
  - `src/pages/recipe/from-video.vue`
  - `src/pages/recipe/components/from-video/*`
  - `src/pages/recipe/composables/useVideoRecipeJob.ts`
  - `src/pages.json`
  - `src/services/recipe.ts`
  - `src/types/recipe.d.ts`
  - `src/utils/storage.ts`
  - `src/pages/fridge/components/FridgeFab.vue`
  - `src/pages/fridge/index.vue`

### Phase 4: Testing & Verification
- **Status:** complete
- Actions taken:
  - 运行服务端 `pnpm run build`。
  - 运行客户端 `pnpm run type-check`。
  - 运行既有 `recipe.service.spec.ts` 测试确认未破坏原能力。
  - 记录运行时依赖缺口：当前机器未安装 `ffmpeg` / `ffprobe`，无法进行真实视频端到端解析。
- Files created/modified:
  - `progress.md`
  - `findings.md`
  - `task_plan.md`

### Phase 5: Timeline Mode Upgrade
- **Status:** complete
- Actions taken:
  - 为视频任务新增 `strict` / `assisted` 模式和重生成接口。
  - 新增时间线 helper：分段构建、严格步骤合并、补全步骤插入。
  - 后端证据缓存改为本地 JSON + 分析帧缓存，支持 24 小时内无须重传重生成。
  - 前端上传卡增加模式切换，结果卡增加模式切换重生成和 AI 补全步骤标签。
  - 新增 `recipe-video.timeline.spec.ts` 覆盖排序与插入行为。
- Files created/modified:
  - `../server/src/modules/recipe/dto/video-recipe.dto.ts`
  - `../server/src/modules/recipe/video/recipe-video.timeline.ts`
  - `../server/src/modules/recipe/video/recipe-video.timeline.spec.ts`
  - `../server/src/modules/recipe/video/recipe-video.service.ts`
  - `../server/src/ai/ai.service.ts`
  - `../server/src/modules/recipe/recipe.controller.ts`
  - `../server/src/modules/recipe/recipe.service.ts`
  - `src/pages/recipe/composables/useVideoRecipeJob.ts`
  - `src/pages/recipe/components/from-video/VideoRecipeUploadCard.vue`
  - `src/pages/recipe/components/from-video/VideoRecipeResultCard.vue`
  - `src/pages/recipe/from-video.vue`
  - `src/services/recipe.ts`
  - `src/types/recipe.d.ts`

### Phase 6: OCR Span Dedup & Step Details
- **Status:** complete
- Actions taken:
  - 新增 OCR span 合并逻辑，对相邻重复配料卡做跨帧去重。
  - 为严格步骤增加 `details` 字段，并将“调碗料汁”类配料卡绑定到最近动作步骤。
  - 结果页与完整步骤页都接入 `details` 展示。
  - 新增基于用户样例的时间线单测，覆盖配料卡合并与步骤明细绑定。
- Files created/modified:
  - `../server/src/modules/recipe/video/video-recipe.types.ts`
  - `../server/src/modules/recipe/video/recipe-video.timeline.ts`
  - `../server/src/modules/recipe/video/recipe-video.service.ts`
  - `../server/src/modules/recipe/video/recipe-video.timeline.spec.ts`
  - `../server/src/ai/ai.service.ts`
  - `src/types/recipe.d.ts`
  - `src/pages/recipe/components/CookingStepCard.vue`
  - `src/pages/recipe/components/from-video/VideoRecipeResultCard.vue`

## Test Results
| Test | Input | Expected | Actual | Status |
|------|-------|----------|--------|--------|
| 环境检测 | `which ffmpeg` | 存在 ffmpeg | 未安装 | blocked |
| 环境检测 | `which ffprobe` | 存在 ffprobe | 未安装 | blocked |
| 服务端构建 | `pnpm run build` | Nest 项目成功构建 | 构建通过 | pass |
| 客户端类型检查 | `pnpm run type-check` | Vue/TS 类型检查通过 | 检查通过 | pass |
| Recipe 既有测试 | `pnpm test -- --runInBand modules/recipe/recipe.service.spec.ts` | 既有推荐逻辑测试通过 | 4/4 通过 | pass |
| 时间线 helper 测试 | `pnpm test -- --runInBand modules/recipe/video/recipe-video.timeline.spec.ts modules/recipe/recipe.service.spec.ts` | 时间线排序与插入逻辑通过 | 6/6 通过 | pass |
| OCR span + details 测试 | `pnpm test -- --runInBand modules/recipe/video/recipe-video.timeline.spec.ts modules/recipe/recipe.service.spec.ts` | 配料卡去重并挂到“调碗料汁”步骤 | 7/7 通过 | pass |

## Error Log
| Timestamp | Error | Attempt | Resolution |
|-----------|-------|---------|------------|
| 2026-03-20 00:00 | `ffmpeg not found` | 1 | 记录为环境依赖，后续在代码中显式检测 |
| 2026-03-20 00:00 | `ffprobe not found` | 1 | 记录为环境依赖，后续在代码中显式检测 |
| 2026-03-20 00:05 | planning 文件首次补丁方式不匹配 | 1 | 改为直接创建文件 |

## 5-Question Reboot Check
| Question | Answer |
|----------|--------|
| Where am I? | Phase 2: Backend Infrastructure |
| Where am I going? | 当前实现已完成，后续只需部署环境联调 |
| What's the goal? | 落地本地视频异步解析并生成可复用 Recipe 的完整链路 |
| What have I learned? | 现有 AI/Recipe/购物流已成功复用，主要环境风险在 FFmpeg 依赖 |
| What have I done? | 已完成前后端实现并跑通构建、类型检查和既有测试 |
