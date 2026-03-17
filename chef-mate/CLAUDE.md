# Chef-Mate 项目规范

## 前端组件化开发规则

基于 `pages/shopping/index.vue`（1476 行）反面例子总结的组件化规范。

### 规则 1: 文件行数限制

| 类型 | 推荐上限 | 硬性上限 |
|------|---------|---------|
| 页面组件 | 300 行 | 500 行 |
| 业务组件 | 200 行 | 400 行 |
| 通用组件 | 150 行 | 300 行 |
| Composable | 100 行 | 200 行 |

超过推荐上限需评估拆分，超过硬性上限必须拆分。

### 规则 2: 组件拆分触发条件

满足任一条件时必须拆分：

1. **独立 UI 区块** — 视觉上可独立的卡片、区域、弹窗
2. **重复模式** — 相似结构出现 2 次以上
3. **独立状态** — 有自己的 loading/error/data 状态
4. **可复用性** — 其他页面可能用到
5. **复杂交互** — 包含 3+ 个事件处理函数

### 规则 3: 组件目录结构

```
pages/
└── {page-name}/
    ├── index.vue              # 页面入口（仅布局编排）
    ├── components/            # 页面专属组件
    │   ├── SomeCard.vue
    │   └── SomePopup.vue
    └── composables/           # 页面专属逻辑
        ├── useSomeFeature.ts
        └── useSomeState.ts
```

### 规则 4: 页面组件职责

页面组件（index.vue）只负责：
- 布局编排（组件组合）
- 路由参数处理
- 页面级生命周期
- 子组件间通信协调

**禁止**：
- 直接写业务逻辑
- 超过 5 个 computed
- 超过 5 个方法

### 规则 5: Composable 抽离规则

以下逻辑必须抽离为 composable：

1. **状态 + 操作组合** — 如 `useAssignment()`
2. **副作用逻辑** — 如 `useScrollLock()`
3. **跨组件共享** — 多个组件需要的逻辑
4. **复杂计算** — 超过 3 个相关 computed

### 规则 6: Props/Emits 设计

```typescript
// 好的设计：明确的接口
defineProps<{
  item: ShoppingItem
  canAssign: boolean
}>()

defineEmits<{
  toggle: [itemId: string]
  assign: [item: ShoppingItem]
}>()

// 坏的设计：传递整个 store
defineProps<{
  store: ReturnType<typeof useShoppingStore>
}>()
```

### 规则 7: 弹窗组件规范

弹窗必须独立为组件，通过 v-model 控制显隐：

```vue
<!-- 好的设计 -->
<AssignMemberPopup
  v-model:show="showAssign"
  :item="selectedItem"
  @confirm="handleConfirm"
/>

<!-- 坏的设计：弹窗内容直接写在页面 -->
<u-popup :show="showAssign">
  <!-- 100+ 行弹窗内容 -->
</u-popup>
```

### 规则 8: 常量外置

页面内的常量映射表必须外置到 `constants/` 目录：

```typescript
// 好的设计：constants/shopping.ts
export const CATEGORY_LABELS: Record<ShoppingCategory, string> = { ... }
export const CATEGORY_ICONS: Record<ShoppingCategory, string> = { ... }

// 坏的设计：写在组件内
const categoryLabel = { ... }  // 占用 20 行
```

---

## 反面例子分析

`pages/shopping/index.vue` 问题清单：

| 问题 | 现状 | 应拆分为 |
|------|------|---------|
| 进度卡片 (30-159) | 130 行内联 | `ShoppingProgressCard.vue` |
| 快速添加 (161-193) | 33 行内联 | `QuickAddInput.vue` |
| 待买清单 (195-265) | 70 行内联 | `PendingItemsSection.vue` |
| 已完成区 (267-359) | 92 行内联 | `CompletedItemsSection.vue` |
| 分配弹窗 (370-496) | 126 行内联 | `AssignMemberPopup.vue` |
| 分类选择 (498-525) | 28 行内联 | `CategoryPickerPopup.vue` |
| 滚动锁定逻辑 | 函数内联 | `useScrollLock.ts` |
| 完成动画状态 | 函数内联 | `useCompletionTransition.ts` |
| 分配逻辑 | 函数内联 | `useAssignment.ts` |
| 常量映射表 | 40+ 行内联 | `constants/shopping.ts` |
