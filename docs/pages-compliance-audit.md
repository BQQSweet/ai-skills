# `chef-mate/src/pages` 页面规范合规审查

审查日期：2026-03-17

审查依据：

- `docs/frontend-page-standards.zh-CN.md`

审查范围：

- `chef-mate/src/pages/**/*.vue`
- `chef-mate/src/pages/**/components/*.vue`
- 不包含 `src/components` 全局共享组件
- 不包含 `admin/src/views/*`

## 审查口径

判定维度：

- 文件大小是否超过推荐/硬性上限
- 页面入口是否仍以编排为主
- 是否存在应拆出的独立 UI 区块
- 是否存在应抽出的 popup / dialog
- 是否存在应抽出的页面专属 composable
- 是否存在应外置的常量、映射、元数据
- 页面私有 UI 状态是否被不当地塞进页面或 store
- 页面内组件的 props / emits 是否足够收敛
- 页面内组件是否本身又发展为新的“大而全组件”

判定等级：

- `合规`：整体符合规范，仅有零星实现细节可优化
- `部分不合规`：未完全失控，但已明显偏离规范，建议进入重构队列
- `不合规`：超过硬性上限或结构已经明显失控，应优先整改

优先级定义：

- `P0`：超过硬性上限或结构明显失控，必须优先整改
- `P1`：超过推荐上限且职责混杂，建议尽快整改
- `P2`：未超线但结构有明显偏离，后续迭代顺手收敛

## 总体统计

| 项目 | 数量 |
| --- | ---: |
| 页面入口总数 | 14 |
| 页面内组件总数 | 23 |
| 超过推荐上限的页面入口 | 8 |
| 超过硬性上限的页面入口 | 3 |
| 超过推荐上限的页面内组件 | 7 |
| 超过硬性上限的页面内组件 | 0 |

总体结论：

- `src/pages` 当前整体不符合新固化的页面开发规范
- 最严重的问题集中在 `shopping`、`group`、`recipe` 三个目录
- 一批页面虽然未超过硬性上限，但页面入口已经不再是“编排层”，而是同时承载了表单流、弹层流、动画状态和副作用
- 页面内组件也出现了“二次膨胀”，尤其是 `ShoppingItem.vue`、`ScanCamera.vue`、`ScanResultEditor.vue`

## 高优先级问题总览

| 文件 | 行数 / 证据 | 状态 | 优先级 | 核心问题 |
| --- | --- | --- | --- | --- |
| `src/pages/shopping/index.vue` | 1475 行，28 个 `computed`，33 个方法，4 个 popup / confirm | 不合规 | P0 | 页面同时承载编排、统计派生、任务流、分配流、动画过渡、滚动锁定、路由导入和弹窗内容 |
| `src/pages/group/index.vue` | 655 行，15 个方法，多个独立区块和双态表单 | 不合规 | P0 | 家庭概览、成员列表、切组、创建/加入、危险操作全部堆在单页 |
| `src/pages/recipe/cooking-guide.vue` | 533 行，6 个 `computed`，10 个方法，定时器结束 overlay 内联 | 不合规 | P0 | 烹饪会话、计时、语音、步骤推进、结束弹层全部内联 |
| `src/pages/login/index.vue` | 463 行，13 个方法 | 部分不合规 | P1 | 登录页已超过推荐上限，表单切换、验证码流、自动注册流都留在页面内 |
| `src/pages/profile/dietary-preferences.vue` | 375 行，13 个方法 | 部分不合规 | P1 | 偏好表单多个独立区块 + 全量表单状态内联 |
| `src/pages/profile/index.vue` | 367 行，7 个 `computed` | 部分不合规 | P1 | 个人信息、统计、厨房入口、服务入口、退出确认都内联 |
| `src/pages/group/invite.vue` | 375 行 | 部分不合规 | P1 | 邀请码卡片、二维码区、分享动作、成员区和刷新弹窗都在同页 |
| `src/pages/recipe/cooking-steps.vue` | 313 行，底部 QA popup 内联 | 部分不合规 | P1 | 主页面承担了问答弹窗和问答状态流 |
| `src/pages/shopping/components/ShoppingItem.vue` | 396 行，29 个 `computed` | 部分不合规 | P1 | 组件本身已演变为“大而全状态组件” |

## 逐目录审查结果

### `fridge`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/fridge/ai-recipe.vue` | 148 | 合规 | - | 页面主要负责组合 `AiRecipeHeader`、`AiRecipeIngredients`、`AiRecipeCard`、`AiRecipeFab`，整体仍是编排层 |
| `src/pages/fridge/index.vue` | 278 | 部分不合规 | P2 | 虽未超 300 行，但页面内仍保留了分类样式映射、列表选择逻辑、删除/清理弹窗与数据转换逻辑 |

`src/pages/fridge/index.vue` 证据：

- 第 131-142 行内联 `categoryStyleMap`
- 第 147-166 行仍在页面内进行 API -> UI 转换
- 第 79-103 行保留两个内联确认弹窗
- 页面有 9 个方法，已经超过“页面入口主要编排”的合理复杂度

`src/pages/fridge/index.vue` 整改方向：

- 页面入口保留：页面布局、`loadItems` 触发、子组件编排
- 新增局部 `constants/fridge.ts`：收拢分类样式映射
- 新增局部 `composables/useFridgeInventory.ts`：收拢 `transformItem`、加载、选择、删除、清理过期
- 新增局部组件：`FridgeInventoryToolbar.vue`、`FridgeExpiredBanner.vue`

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/fridge/components/FridgeAiBanner.vue` | 223 | 部分不合规 | P1 | 组件超过推荐上限，入口 banner、偏好 popup、口味/人数状态和跳转参数拼装都在一个组件里 |
| `src/pages/fridge/components/FridgeItemCard.vue` | 210 | 部分不合规 | P2 | 略超推荐上限，上滑手势、操作显隐和状态展示耦合在一起 |
| `src/pages/fridge/components/ScanCamera.vue` | 276 | 部分不合规 | P1 | 相机 popup、图片获取、Base64 转换、AI 识别、编辑弹窗跳转全部内联 |
| `src/pages/fridge/components/ScanResultEditor.vue` | 250 | 部分不合规 | P1 | 编辑 popup、表单状态、日期选择、提交流程全部内联 |
| 其余组件 | <= 138 | 合规 | - | `AiRecipe*`、`FridgeFab`、`FridgeHeader` 等组件结构清晰，暂无明显页面规范问题 |

组件整改方向：

- `FridgeAiBanner.vue`：拆为 `FridgeAiBannerTrigger.vue` + `FridgeAiPreferencesPopup.vue`，偏好状态抽到 `useAiRecipePreferences.ts`
- `FridgeItemCard.vue`：手势显隐逻辑抽到 `useSwipeReveal.ts`，展示层保留在组件内
- `ScanCamera.vue`：相机交互与识别流抽到 `useScanCapture.ts`
- `ScanResultEditor.vue`：表单与日期处理抽到 `useScanResultForm.ts`

### `group`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/group/index.vue` | 655 | 不合规 | P0 | 远超硬性上限，家庭概览、成员列表、切组、创建/加入、空态、危险操作和多个弹窗全部内联 |
| `src/pages/group/invite.vue` | 375 | 部分不合规 | P1 | 超过推荐上限，邀请码、二维码、分享入口、成员区和刷新邀请码弹窗都留在页面内 |

`src/pages/group/index.vue` 证据：

- 第 17-252 行包含多个独立视觉区块
- 第 160-236 行内联“创建或加入新厨房”完整表单
- 第 367-385 行内联两个确认弹窗
- 页面存在 15 个方法和多个局部状态，已不是单纯编排层

`src/pages/group/index.vue` 整改方向：

- 页面入口保留：加载、导航、子区块编排
- 新增局部组件：`CurrentGroupCard.vue`、`MemberListSection.vue`、`GroupSwitcherSection.vue`、`GroupJoinCreatePanel.vue`、`GroupDangerZone.vue`
- 新增局部 `composables/useGroupManage.ts`：管理加载、切组、创建、加入、退出、解散
- 将邀请码输入相关状态抽到 `useInviteCodeInput.ts`

`src/pages/group/invite.vue` 证据：

- 页面包含 4 个独立展示区：邀请码卡、二维码区、分享动作区、成员区
- 第 198-207 行内联刷新确认弹窗
- 页面虽然逻辑不复杂，但视觉区块已经足够独立，适合拆分

`src/pages/group/invite.vue` 整改方向：

- 页面入口保留：鉴权、组信息加载、区块编排
- 新增局部组件：`InviteCodeCard.vue`、`InviteQrSection.vue`、`InviteShareActions.vue`、`InviteMembersStrip.vue`
- 新增局部 `composables/useGroupInvite.ts`：封装复制、刷新、分享入口

### `guide`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/guide/index.vue` | 275 | 部分不合规 | P2 | 未超推荐上限，但“创建厨房”和“加入厨房”两张卡已经是两个完整的独立交互块 |

证据：

- 第 35-83 行为创建厨房卡片
- 第 86-133 行为加入厨房卡片
- 页面内直接承载创建与加入两条业务流

整改方向：

- 页面入口保留：欢迎页布局与结果跳转
- 新增局部组件：`CreateKitchenCard.vue`、`JoinKitchenCard.vue`
- 新增局部 `composables/useGuideKitchenSetup.ts`：封装创建、加入、邀请码输入状态

### `index`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/index/index.vue` | 126 | 合规 | - | 首页页面入口仍以编排为主，主要逻辑是数据拉取与三个子区块组合 |

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/index/components/CookingPlanCard.vue` | 166 | 合规 | - | 组件职责单一，主要负责推荐卡片展示与跳转 |
| `src/pages/index/components/ExpiryAlerts.vue` | 204 | 部分不合规 | P2 | 略超推荐上限，预警映射与排序逻辑在组件内偏重 |
| `src/pages/index/components/FamilyFeed.vue` | 202 | 部分不合规 | P2 | 略超推荐上限，样式映射、时间格式化、路由判断和 watch 拉取都在组件内 |
| `src/pages/index/components/HomeHeader.vue` | 79 | 合规 | - | 结构简单，职责清晰 |

整改方向：

- `ExpiryAlerts.vue`：将预警映射逻辑抽到 `useExpiryAlerts.ts` 或局部 `expiry-alerts.meta.ts`
- `FamilyFeed.vue`：将 badge 样式映射和跳转判断抽到 `useFamilyFeedDisplay.ts`

### `login`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/login/index.vue` | 463 | 部分不合规 | P1 | 超过推荐上限，验证码流、账号密码登录流、自动注册流和倒计时都堆在页面里 |

证据：

- 页面存在 13 个方法
- 第 46-127 行内联表单切换与主操作区
- 第 252 行后保留倒计时和短信发送流
- `promptAutoRegister`、`handleSubmit`、`redirectAfterLogin` 等流程逻辑集中在页面入口

整改方向：

- 页面入口保留：壳层布局、品牌区、表单区、页脚区编排
- 新增局部组件：`LoginHero.vue`、`LoginForm.vue`、`LoginFooter.vue`
- 新增局部 `composables/useLoginFlow.ts`：封装短信发送、登录提交、自动注册、跳转

### `profile`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/profile/index.vue` | 367 | 部分不合规 | P1 | 超过推荐上限，页面被多个独立入口区块占满，且 `computed` 已超过推荐阈值 |
| `src/pages/profile/dietary-preferences.vue` | 375 | 部分不合规 | P1 | 超过推荐上限，多段表单和偏好映射全部内联 |
| `src/pages/profile/speech-language.vue` | 165 | 合规 | - | 页面结构简单，职责明确，虽然有候选列表，但整体仍保持清晰 |

`src/pages/profile/index.vue` 证据：

- 7 个 `computed`，已超页面入口经验阈值
- 页面由“个人信息 / 统计 / 我的厨房 / 更多服务 / 退出”多个独立区块组成
- 退出确认逻辑仍在页面入口

`src/pages/profile/index.vue` 整改方向：

- 页面入口保留：数据接入与导航编排
- 新增局部组件：`ProfileSummaryCard.vue`、`ProfileStatsSection.vue`、`ProfileKitchenSection.vue`、`ProfileServiceSection.vue`、`ProfileLogoutAction.vue`
- 新增局部 `composables/useProfilePage.ts`：封装数据刷新与退出流程

`src/pages/profile/dietary-preferences.vue` 整改方向：

- 页面入口保留：保存动作与整体编排
- 新增局部组件：`AllergySelector.vue`、`HabitSelector.vue`、`DislikeInputSection.vue`、`TastePreferenceSection.vue`
- 新增局部 `composables/useDietaryPreferencesForm.ts`：封装表单草稿、标签操作、滑杆映射与保存

### `recipe`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/recipe/cooking-guide.vue` | 533 | 不合规 | P0 | 超过硬性上限，烹饪主视图、计时器、步骤控制、语音控制、结束 overlay 全部内联 |
| `src/pages/recipe/cooking-steps.vue` | 313 | 部分不合规 | P1 | 超过推荐上限，且 QA popup 与问答状态流完全内联 |

`src/pages/recipe/cooking-guide.vue` 证据：

- 533 行，超过页面入口 500 行硬性上限
- 第 151-220 行存在大段 timer end overlay
- 页面既负责步骤推进，又负责计时器、TTS、语音命令、音频播放与生命周期清理

`src/pages/recipe/cooking-guide.vue` 整改方向：

- 页面入口保留：主壳层、当前步骤编排、导航
- 新增局部组件：`CurrentStepHero.vue`、`CookingGuideControls.vue`、`TimerEndOverlay.vue`
- 新增局部 `composables/useCookingGuideSession.ts`：封装步骤推进、完成判断、计时器结束处理
- 新增局部 `composables/useCookingGuideVoice.ts`：封装语音命令与 TTS 协同

`src/pages/recipe/cooking-steps.vue` 证据：

- 第 100-205 行内联 QA popup，已经是独立交互块
- 问答历史、滚动到底、提交提问全部在页面入口内处理

`src/pages/recipe/cooking-steps.vue` 整改方向：

- 页面入口保留：步骤列表、开始烹饪 CTA
- 新增局部组件：`StepQaPopup.vue`
- 新增局部 `composables/useStepQa.ts`：封装 QA 历史、发送、滚动和 active step 管理

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/recipe/components/CookingHeader.vue` | 48 | 合规 | - | 结构清晰 |
| `src/pages/recipe/components/CookingStepCard.vue` | 122 | 合规 | - | 组件职责明确 |
| `src/pages/recipe/components/CookingTimer.vue` | 73 | 合规 | - | 组件职责明确 |
| `src/pages/recipe/components/InstructionCard.vue` | 85 | 合规 | - | 组件职责明确 |
| `src/pages/recipe/components/TimerEndModal.vue` | 85 | 合规 | - | 组件职责明确 |

说明：

- `recipe/components` 已经具备较好的组件化基础，主要问题在页面入口未充分消费这些组件

### `shopping`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/shopping/index.vue` | 1475 | 不合规 | P0 | 当前仓库中最严重的页面规范违例，页面入口已经失去编排层属性 |

证据：

- 1475 行，超过硬性上限近 3 倍
- 28 个 `computed`
- 33 个方法
- 4 个 popup / confirm
- 页面同时承担概览、快速添加、待买区、已完成区、分配弹窗、分类选择、删除确认、入库确认、滚动锁定、过渡动画、路由导入上下文、购物流程状态机

整改方向：

- 页面入口只保留：路由参数接入、`CmPageShell` 组装、toast 与确认框托管、子组件编排
- 新增局部组件：`ShoppingOverviewCard.vue`、`ShoppingQuickAddCard.vue`、`ShoppingPendingSection.vue`、`ShoppingCompletedSection.vue`、`ShoppingAssignPopup.vue`、`ShoppingCategoryPicker.vue`、`ShoppingFooterAction.vue`
- 新增局部 `composables/useShoppingPage.ts`
- 新增局部 `constants/shopping.ts` 或 `shopping.meta.ts`

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/shopping/components/ShoppingItem.vue` | 396 | 部分不合规 | P1 | 未超硬性上限，但 29 个 `computed` 说明组件内部状态分支已经失控 |

`src/pages/shopping/components/ShoppingItem.vue` 证据：

- 展示、按钮显隐、状态文案、勾选逻辑、分配态、删除态全部内联
- props 保持收敛是优点，但内部展示派生过多，组件已变成“复杂状态呈现器”

整改方向：

- 保留当前窄 props / emits 接口
- 将状态展示派生抽到 `useShoppingItemPresentation.ts`
- 视图上至少拆出 `ShoppingItemActions.vue` 或 `ShoppingItemStatus.vue`

### `splash`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/splash/index.vue` | 52 | 合规 | - | 启动页非常轻量，仍是清晰的单一职责页面 |

## 建议整改顺序

### 第一批：必须优先处理

- `src/pages/shopping/index.vue`
- `src/pages/group/index.vue`
- `src/pages/recipe/cooking-guide.vue`

这三页已经超过硬性上限，且都不是“单页能暂时容忍”的程度。

### 第二批：应尽快进入结构重构

- `src/pages/login/index.vue`
- `src/pages/profile/index.vue`
- `src/pages/profile/dietary-preferences.vue`
- `src/pages/group/invite.vue`
- `src/pages/recipe/cooking-steps.vue`
- `src/pages/fridge/components/FridgeAiBanner.vue`
- `src/pages/fridge/components/ScanCamera.vue`
- `src/pages/fridge/components/ScanResultEditor.vue`
- `src/pages/shopping/components/ShoppingItem.vue`

### 第三批：可在后续迭代顺手收敛

- `src/pages/guide/index.vue`
- `src/pages/fridge/index.vue`
- `src/pages/fridge/components/FridgeItemCard.vue`
- `src/pages/index/components/ExpiryAlerts.vue`
- `src/pages/index/components/FamilyFeed.vue`

## 后续重构批次建议

### 批次 A：先清掉 P0 页面

- 先完成 `shopping` 页面重构，因为它已经是规范反例
- 再处理 `group/index`，可以顺手沉淀邀请码输入/家庭组操作模式
- 最后处理 `cooking-guide`，把语音与计时状态流从页面剥离

### 批次 B：处理中度复杂页面

- 处理 `login`、`profile`、`dietary-preferences`、`group/invite`、`cooking-steps`
- 目标不是“拆得越碎越好”，而是让页面入口重新回到编排层

### 批次 C：修复次级膨胀组件

- 优先处理 `ShoppingItem.vue`
- 再处理 `ScanCamera.vue`、`ScanResultEditor.vue`、`FridgeAiBanner.vue`
- 同步把局部 `composables/` 与 `constants/` 目录模式立起来

## 审查结论

当前 `chef-mate/src/pages` 还没有形成稳定的一致性页面开发习惯。

表现最好的页面是：

- `src/pages/index/index.vue`
- `src/pages/fridge/ai-recipe.vue`
- `src/pages/profile/speech-language.vue`
- `src/pages/splash/index.vue`

这些页面共同特点是：

- 页面入口主要做编排
- 独立区块已经被抽成页面内组件
- 状态与交互规模仍在人能快速理解的范围内

当前最需要纠偏的模式是：

- 把完整 popup / dialog 内联在页面入口
- 在页面入口累积大量局部状态与流程方法
- 把视图元数据和样式映射长期内联
- 组件拆分了一层后，又在页面内组件里继续长成新的大组件
