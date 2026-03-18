# 前端页面开发规范

语言版本：

- English: `docs/frontend-page-standards.md`
- 简体中文: `docs/frontend-page-standards.zh-CN.md`

这份文档定义了 ChefMate 前端页面开发的默认规范。
它同时适用于：

- `chef-mate`：uni-app + Vue 3 用户端
- `admin`：Vue 3 + Vite 管理后台

在创建、重构或审查前端页面时，默认使用这份规范。
除非任务明确说明该页面是临时原型或一次性实验页，否则都按此文档执行。

## 1. 目标

这套规范的目标是让页面代码：

- 保持组件化，而不是堆成单体页面
- 更容易审查和测试
- 在页面职责边界上保持清晰
- 与现有 Vue Composition API 和仓库结构保持一致

这是一份开发与审查规范，不是 CI 强制校验规则。

## 2. 文件大小限制

这些限制是审查阈值，不只是风格建议。

| 类型 | 推荐上限 | 硬性上限 |
| --- | --- | --- |
| 页面入口组件 | 300 行 | 500 行 |
| 业务/功能组件 | 200 行 | 400 行 |
| 通用共享组件 | 150 行 | 300 行 |
| Composable | 100 行 | 200 行 |

规则：

- 超过推荐上限时，作者应主动评估是否需要拆分。
- 超过硬性上限时，必须拆分后才算完成任务。
- 即使未超行数，只要职责混杂明显，也应拆分。

## 3. 默认页面结构

默认使用下面的目录结构。

`chef-mate`：

```text
src/pages/{feature}/
├── index.vue
├── components/
│   ├── SomeCard.vue
│   └── SomePopup.vue
├── composables/
│   └── useSomeFeature.ts
└── constants/
    └── some-feature.ts
```

`admin`：

```text
src/views/{feature}/
├── index.vue
├── components/
│   ├── SomePanel.vue
│   └── SomeDialog.vue
├── composables/
│   └── useSomeFeature.ts
└── constants/
    └── some-feature.ts
```

说明：

- `components/` 用于页面作用域内的展示块或交互块
- `composables/` 用于页面作用域内的状态逻辑和副作用
- `constants/` 用于标签映射、图标映射、视图配置等静态元数据
- 如果逻辑已经跨多个功能复用，再提升到包级共享目录，例如 `src/components` 或 `src/composables`

## 4. 页面入口职责

页面入口组件，如 `pages/*/index.vue` 或 `views/*/index.vue`，应主要负责编排。

允许承担的职责：

- 页面布局组合
- 路由或页面参数接收
- 页面级生命周期处理
- 组合子组件
- 协调子组件之间通信
- 将页面级 composable 接入视图

以下内容一旦变得不简单，就不应继续直接留在页面入口内：

- 大段内联弹窗或 popup 内容
- 长的静态映射表
- 复杂状态流转
- 可复用的展示区块
- 重复的列表渲染片段
- 跨领域副作用，例如滚动锁定或事件订阅

经验性限制：

- 页面入口通常不应保留超过 5 个有意义的 `computed`
- 页面入口通常不应保留超过 5 个有意义的方法
- 如果页面同时承载“编排 + 业务逻辑”，优先先抽走业务逻辑

## 5. 必须拆分的触发条件

满足以下任一条件，就必须拆出组件或逻辑模块：

1. 它是视觉上独立的 UI 区块，例如卡片、区域、横幅、表格区、弹窗或 popup
2. 同一种结构或交互模式出现两次及以上
3. 该块拥有自己的 loading、error、empty、expanded、selected 或 submitting 状态
4. 它很可能会被同一功能下其它页面复用
5. 该块包含 3 个及以上事件处理函数，或已经形成一个小型交互流
6. 它迫使父页面同时持有互不相关的关注点

通常应该独立成组件的例子：

- 进度概览卡片
- 快速添加表单
- tab 分区内容
- 确认弹窗
- 分配任务弹窗
- 分类选择器
- 可折叠的已完成历史区

## 6. Composable 抽离规则

满足以下任一条件，就应抽为 composable：

- 状态和操作天然成组
- 逻辑本身拥有副作用
- 多个同级组件共同依赖该逻辑
- 逻辑中存在 3 个以上相关 `computed`
- 逻辑协调了一个交互流程
- 逻辑涉及 timer、DOM 状态、订阅或生命周期清理

典型例子：

- `useAssignment`
- `useScrollLock`
- `useCompletionTransition`
- `usePageInitialization`
- `useRecipeContextImport`

如果只是很小的胶水逻辑，并且仍然清晰属于编排层，才可以留在页面入口内。

## 7. 页面私有逻辑与共享逻辑的边界

按复用性和领域边界决定放置位置。

以下情况应放到页面局部 `composables/`：

- 只服务于一个页面或一个功能路由
- 强依赖页面专属 UI 状态
- 如果放到全局命名会产生误导

以下情况才应放到共享 `src/composables/`：

- 已经被多个页面复用
- 抽象稳定且不依赖具体业务页面
- 解决的是跨功能通用问题

不要为了减少局部文件数量，就把页面私有逻辑硬搬到全局共享目录。

## 8. Props 与 Emits 设计

子组件应接收窄而明确的输入，并抛出窄而明确的事件。

推荐：

```ts
defineProps<{
  item: ShoppingItem;
  canAssign: boolean;
  currentUserId: string;
}>();

defineEmits<{
  toggle: [itemId: string];
  assign: [item: ShoppingItem];
}>();
```

避免：

```ts
defineProps<{
  store: ReturnType<typeof useShoppingStore>;
  pageState: any;
}>();
```

规则：

- 不要把整个 Pinia store 直接传给子组件
- 不要把宽泛、可变的页面状态包直接透传给子组件
- 如果子组件是标准 Vue 交互组件，优先使用强类型 emits，而不是 callback props
- 除非组件设计目标就是绑定 store 的包装层，否则尽量让子组件保持 store 无感知

## 9. 弹窗与对话框规范

当 popup、dialog、drawer、bottom sheet 超过“很小的内联片段”时，应拆为独立组件。

标准模式：

- 使用独立组件
- 用 `v-model:show` 控制显隐
- 显式传入选中数据
- 通过 `confirm`、`cancel` 或类似的窄事件回传

推荐：

```vue
<AssignMemberPopup
  v-model:show="showAssignPopup"
  :item="selectedItem"
  :members="candidateMembers"
  @confirm="handleAssignConfirm"
/>
```

避免在页面入口里直接保留 100+ 行的内联弹窗内容。

## 10. 常量与视图元数据

以下内容不应长时间内联在大页面文件里：

- 分类标签映射
- 图标映射
- badge tone 映射
- 静态筛选项定义
- 被当作配置使用的文案

应移动到 `constants/` 目录或清晰命名的本地元数据文件中。

推荐命名：

- `constants/shopping.ts`
- `feature.meta.ts`
- `feature.constants.ts`

只有特别小的常量，例如一个默认字符串或单个布尔开关，才允许留在页面内联。

## 11. Store 职责边界

Pinia store 应承载领域状态和领域操作。

适合放进 store 的内容：

- 规范化后的后端数据
- 当前激活对象的身份信息
- API 驱动的领域 mutation
- 跨页面共享的领域派生状态

不适合放进 store 的内容：

- 弹窗显隐
- 只属于某个页面的表单草稿
- 滚动锁定
- 动画过渡标记
- 临时路由导入状态

这些 UI 状态应保留在页面层或页面专属 composable 中。

## 12. 审查清单

审查页面时，至少检查以下内容：

- 页面入口主要是在做编排，还是已经变成“大杂烩功能页”？
- 视觉独立的区域是否已经拆出？
- 大型弹窗是否已拆出？
- 有状态的流程是否已经转移到 composable？
- 常量是否已经从主页面文件中移出？
- 子组件接口是否足够明确和收敛？
- 页面私有 UI 状态是否错误地塞进了 store？
- 文件大小是否仍在阈值内？

如果这些问题中有多项答案是否定的，则该页面不应视为合规。

## 13. 例子

### 正向示例

一个合规页面通常具备下面的结构：

- `index.vue` 负责组合区块与连接事件
- `components/` 存放页面内的展示区和弹窗
- `composables/` 存放页面专属状态机和副作用
- `constants/` 存放标签映射、图标映射等元数据

页面入口可以在几分钟内顺着读完并理解。

### 反向示例

`chef-mate/src/pages/shopping/index.vue` 是促成这份规范的典型反例。

它为什么不合规：

- 页面入口远超文件大小阈值
- 多个独立视觉区块全部内联
- popup 内容内联
- 页面私有状态机逻辑内联
- 滚动锁定和过渡动画逻辑内联
- 大型元数据映射内联
- 页面同时混杂了编排、渲染、业务流程和 UI 副作用管理

这种结构应被视为重构目标，而不是后续页面的参照模板。

## 14. 端侧差异说明

### `chef-mate`

- 页面入口受 `src/pages.json` 和 uni-app 生命周期约束
- 功能专属页面逻辑优先放在页面目录下的 `components/`、`composables/` 和 `constants/`
- H5 滚动处理等平台相关行为，除非已跨页面复用，否则优先放到页面专属 composable 中
- 运行时平台判断优先使用 `@uni-helper/uni-env`，例如 `isWeb`、`isH5`、`isMpWeixin`，不要再直接读取 `uni.getSystemInfoSync().uniPlatform`
- `#ifdef H5`、`#ifdef APP-PLUS` 等条件编译继续保留给编译期平台分支，因为它们会直接裁掉非目标平台代码，而不是只在运行时分支
- 当代码直接访问浏览器全局对象时，继续保留 `typeof window` / `typeof document` 这类守卫；它们属于运行环境安全保护，不是平台判断的替代品

### `admin`

- 页面入口位于 `src/views/*`，由 Vue Router 驱动
- 同样遵循组件化和 composable 抽离规则
- 应保持现有 Arco 风格，但不能以“设计系统一致”为理由继续保留超大单体页面

## 15. 例外情况

只有在任务中明确满足以下任一条件时，才允许放宽这些规则：

- 临时原型
- 一次性实验页
- 短期迁移过渡页
- 暂时不适合手工重构的生成代码

如果使用了例外，应在任务说明或 review note 中明确记录原因。
