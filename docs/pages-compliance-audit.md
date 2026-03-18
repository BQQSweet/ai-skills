# `chef-mate/src/pages` 页面规范合规审查

审查日期：2026-03-17

第二轮整改更新：2026-03-18

第三轮整改更新：2026-03-18

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
| 页面内组件总数 | 65 |
| 超过推荐上限的页面入口 | 0 |
| 超过硬性上限的页面入口 | 0 |
| 超过推荐上限的页面内组件 | 3 |
| 超过硬性上限的页面内组件 | 0 |

总体结论：

- 第三轮整改完成后，`chef-mate/src/pages` 已清空全部 `P0` / `P1` 页面入口问题
- `shopping`、`group`、`recipe` 三个此前最重的目录已经回到“页面入口负责编排”的结构
- 组件级问题也明显收敛，`ShoppingItem.vue`、`FridgeAiBanner.vue`、`ScanCamera.vue`、`ScanResultEditor.vue` 已完成拆分
- 当前剩余问题集中在 2 个页面入口和 3 个页面内组件，优先级已下降到 `P2`

## 当前待整改项总览

| 文件 | 行数 / 证据 | 状态 | 优先级 | 核心问题 |
| --- | --- | --- | --- | --- |
| `src/pages/fridge/index.vue` | 278 行，仍内联分类样式映射、列表转换和确认弹窗 | 部分不合规 | P2 | 页面尚未完全回到纯编排层，仍混有数据转换与局部交互状态 |
| `src/pages/guide/index.vue` | 275 行，创建厨房和加入厨房两套完整交互仍在单页 | 部分不合规 | P2 | 两张表单卡已具备独立组件边界 |
| `src/pages/fridge/components/FridgeItemCard.vue` | 210 行，略超业务组件推荐上限 | 部分不合规 | P2 | 手势显隐、操作区和状态展示仍耦合在单组件内 |
| `src/pages/index/components/ExpiryAlerts.vue` | 204 行，略超业务组件推荐上限 | 部分不合规 | P2 | 预警映射、排序和展示逻辑集中在组件内 |
| `src/pages/index/components/FamilyFeed.vue` | 202 行，略超业务组件推荐上限 | 部分不合规 | P2 | 样式映射、时间处理、跳转判断和拉取逻辑集中在组件内 |

## 逐目录审查结果

### `fridge`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/fridge/ai-recipe.vue` | 148 | 合规 | - | 页面主要负责组合 `AiRecipeHeader`、`AiRecipeIngredients`、`AiRecipeCard`、`AiRecipeFab`，整体仍是编排层 |
| `src/pages/fridge/index.vue` | 278 | 部分不合规 | P2 | 未超页面推荐上限，但仍保留分类样式映射、列表转换和确认弹窗逻辑 |

`src/pages/fridge/index.vue` 证据：

- 页面仍在入口层做 API -> UI 数据转换
- 分类样式映射未外置到局部 `constants`
- 删除/清理过期流程仍由页面直接托管

`src/pages/fridge/index.vue` 整改方向：

- 页面入口保留：页面布局、`loadItems` 触发、子组件编排
- 新增局部 `constants/fridge.ts`：收拢分类样式映射
- 新增局部 `composables/useFridgeInventory.ts`：收拢转换、加载、选择、删除、清理过期
- 视情况补 `FridgeInventoryToolbar.vue`、`FridgeExpiredBanner.vue`

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/fridge/components/FridgeAiBanner.vue` | 44 | 合规 | - | 已完成第三轮拆分，入口只做 banner 触发区与偏好弹层编排 |
| `src/pages/fridge/components/FridgeItemCard.vue` | 210 | 部分不合规 | P2 | 略超推荐上限，上滑手势、操作显隐和状态展示仍耦合 |
| `src/pages/fridge/components/ScanCamera.vue` | 127 | 合规 | - | 已将拍照/选图/识别流抽到 `useScanCapture.ts`，入口只保留弹层组合与事件转发 |
| `src/pages/fridge/components/ScanResultEditor.vue` | 90 | 合规 | - | 已将表单草稿、校验和日期处理抽到 `useScanResultForm.ts` |
| 其余组件 | <= 138 | 合规 | - | `AiRecipe*`、`FridgeFab`、`FridgeHeader` 等组件结构清晰，暂无明显页面规范问题 |

`src/pages/fridge/components/FridgeItemCard.vue` 整改方向：

- 将手势显隐逻辑抽到 `useSwipeReveal.ts` 或等价 composable
- 保留组件主体负责展示层，减少状态与手势逻辑耦合

### `group`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/group/index.vue` | 130 | 合规 | - | 已完成第三轮拆分，页面入口回到 `CmPageShell` + section 组件编排 |
| `src/pages/group/invite.vue` | 65 | 合规 | - | 已完成第二轮拆分，邀请码、二维码、分享动作和成员区均已拆出 |

说明：

- `group/index.vue` 已拆出 `CurrentGroupCard.vue`、`MemberListSection.vue`、`GroupSwitcherSection.vue`、`GroupJoinCreatePanel.vue`、`GroupEmptyState.vue`、`GroupDangerZone.vue`
- 家庭组加载、切换、创建、加入、退出、解散已集中在 `useGroupManage.ts`

### `guide`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/guide/index.vue` | 275 | 部分不合规 | P2 | 未超推荐上限，但“创建厨房”和“加入厨房”两张卡已经是两个完整独立交互块 |

证据：

- 页面内直接承载创建与加入两条业务流
- 创建卡与加入卡都已具备独立 props / emits 边界

整改方向：

- 页面入口保留：欢迎页布局与结果跳转
- 新增局部组件：`CreateKitchenCard.vue`、`JoinKitchenCard.vue`
- 新增局部 `composables/useGuideKitchenSetup.ts`：封装创建、加入和邀请码输入状态

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
| `src/pages/login/index.vue` | 79 | 合规 | - | 已完成第二轮拆分，登录页入口只保留壳层、toast 和区块编排 |

说明：

- 验证码发送、登录提交、自动注册、冷却倒计时已收敛到 `useLoginFlow.ts`
- 品牌区、表单区、页脚区已拆为局部组件

### `profile`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/profile/index.vue` | 102 | 合规 | - | 已完成第二轮拆分，页面入口主要负责数据接入、导航和退出确认托管 |
| `src/pages/profile/dietary-preferences.vue` | 118 | 合规 | - | 已完成第二轮拆分，表单区块、表单状态流和静态配置均已外置 |
| `src/pages/profile/speech-language.vue` | 165 | 合规 | - | 页面结构简单，职责明确 |

说明：

- `profile/index.vue` 已拆出个人信息、统计、厨房入口、服务入口、退出按钮等区块组件
- `dietary-preferences.vue` 已拆出过敏源、习惯、忌口、口味偏好四个区块和独立表单 composable

### `recipe`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/recipe/cooking-guide.vue` | 107 | 合规 | - | 已完成第三轮拆分，烹饪主视图、步骤控制、语音和计时状态流已分层 |
| `src/pages/recipe/cooking-steps.vue` | 138 | 合规 | - | 已完成第二轮拆分，QA popup 与问答状态流已拆出 |

说明：

- `cooking-guide.vue` 已拆出 `CurrentStepHero.vue`、`CookingGuideControls.vue`、`TimerEndModal.vue`
- 步骤推进、计时和语音控制已分别收敛到 `useCookingGuideSession.ts`、`useCookingGuideTimer.ts`、`useCookingGuideVoice.ts`

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/recipe/components/CookingHeader.vue` | 48 | 合规 | - | 结构清晰 |
| `src/pages/recipe/components/CookingStepCard.vue` | 122 | 合规 | - | 组件职责明确 |
| `src/pages/recipe/components/CookingTimer.vue` | 73 | 合规 | - | 组件职责明确 |
| `src/pages/recipe/components/InstructionCard.vue` | 85 | 合规 | - | 组件职责明确 |
| `src/pages/recipe/components/TimerEndModal.vue` | 85 | 合规 | - | 组件职责明确 |
| 其余组件 | <= 134 | 合规 | - | `CurrentStepHero.vue`、`CookingGuideControls.vue`、`StepQaPopup.vue`、`StepTipsCard.vue` 均保持在合理规模内 |

### `shopping`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/shopping/index.vue` | 179 | 合规 | - | 已完成第三轮拆分，页面入口回到路由接入、壳层编排和弹窗托管 |

说明：

- 页面已拆出概览、快速添加、待买区、已完成区、分配弹层、分类选择和底部 CTA 组件
- 列表切换、协作清单生成、完成态过渡、滚动锁定等逻辑已收敛到局部 composables

#### 页面内组件

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/shopping/components/ShoppingItem.vue` | 171 | 合规 | - | 已完成第三轮拆分，组件入口仅负责组合状态视图和动作区 |
| 其余组件 | <= 136 | 合规 | - | `ShoppingOverviewCard.vue`、`ShoppingPendingSection.vue`、`ShoppingAssignPopup.vue` 等均保持清晰职责边界 |

说明：

- `ShoppingItem.vue` 已拆出 `ShoppingItemStatus.vue` 与 `ShoppingItemActions.vue`
- 展示派生逻辑已集中在 `useShoppingItemPresentation.ts`

### `splash`

#### 页面入口

| 文件 | 行数 | 状态 | 优先级 | 结论 |
| --- | ---: | --- | --- | --- |
| `src/pages/splash/index.vue` | 52 | 合规 | - | 启动页非常轻量，仍是清晰的单一职责页面 |

## 建议整改顺序

当前已无 `P0` / `P1` 页面入口或组件。

下一轮可按以下顺序继续收口剩余 `P2`：

1. `src/pages/fridge/index.vue`
2. `src/pages/guide/index.vue`
3. `src/pages/fridge/components/FridgeItemCard.vue`
4. `src/pages/index/components/ExpiryAlerts.vue`
5. `src/pages/index/components/FamilyFeed.vue`

## 后续重构批次建议

### 批次 A：收口剩余页面入口

- 先处理 `fridge/index.vue`，把数据转换、样式映射和确认流从入口层移走
- 再处理 `guide/index.vue`，拆出创建/加入两张卡和局部状态流

### 批次 B：收口次级膨胀组件

- 处理 `FridgeItemCard.vue`
- 再处理 `ExpiryAlerts.vue`、`FamilyFeed.vue`
- 目标是让页面内组件也回到“单一职责 + 轻派生”的规模

## 审查结论

当前 `chef-mate/src/pages` 已经形成比首轮审查时稳定得多的一致性页面开发习惯。

表现稳定的目录和页面包括：

- `src/pages/shopping/index.vue`
- `src/pages/group/index.vue`
- `src/pages/recipe/cooking-guide.vue`
- `src/pages/profile/index.vue`
- `src/pages/login/index.vue`

这些页面共同特点是：

- 页面入口主要做编排
- 独立区块已经被拆成页面私有组件
- 状态流被收敛到局部 `composables/`
- 元数据、映射和配置不再长期内联在页面入口

下一步最需要持续纠偏的模式是：

- 在未超 300 行时继续往页面入口塞数据转换和确认流
- 组件拆出一层后，又在页面内组件里累积过多手势、映射或展示派生
- 把仅服务于单页的元数据长期留在组件或页面内部

## 第二轮整改完成情况

已完成第二轮页面入口整改：

| 页面 | 整改后入口行数 | 状态 | 说明 |
| --- | ---: | --- | --- |
| `src/pages/profile/index.vue` | 102 | 已整改 | 页面入口已降为编排层，区块与退出逻辑已拆出 |
| `src/pages/profile/dietary-preferences.vue` | 118 | 已整改 | 4 个表单区块、表单状态流和静态配置已拆出 |
| `src/pages/group/invite.vue` | 65 | 已整改 | 邀请页展示区块与复制/分享/刷新逻辑已拆出 |
| `src/pages/recipe/cooking-steps.vue` | 138 | 已整改 | tips 卡片与 QA popup / 状态流已拆出 |
| `src/pages/login/index.vue` | 79 | 已整改 | Hero / Form / Footer / 登录状态流已拆出 |

第二轮新增的页面私有文件：

- `src/pages/profile/components/ProfileSummaryCard.vue`
- `src/pages/profile/components/ProfileStatsSection.vue`
- `src/pages/profile/components/ProfileKitchenSection.vue`
- `src/pages/profile/components/ProfileServiceSection.vue`
- `src/pages/profile/components/ProfileLogoutAction.vue`
- `src/pages/profile/composables/useProfilePage.ts`
- `src/pages/profile/constants/profile.ts`
- `src/pages/profile/components/AllergySelector.vue`
- `src/pages/profile/components/HabitSelector.vue`
- `src/pages/profile/components/DislikeInputSection.vue`
- `src/pages/profile/components/TastePreferenceSection.vue`
- `src/pages/profile/composables/useDietaryPreferencesForm.ts`
- `src/pages/profile/constants/profile-dietary.ts`
- `src/pages/group/components/InviteHeroSection.vue`
- `src/pages/group/components/InviteCodeCard.vue`
- `src/pages/group/components/InviteQrSection.vue`
- `src/pages/group/components/InviteShareActions.vue`
- `src/pages/group/components/InviteMembersStrip.vue`
- `src/pages/group/composables/useGroupInvite.ts`
- `src/pages/recipe/components/StepTipsCard.vue`
- `src/pages/recipe/components/StepQaPopup.vue`
- `src/pages/recipe/composables/useStepQa.ts`
- `src/pages/login/components/LoginHero.vue`
- `src/pages/login/components/LoginForm.vue`
- `src/pages/login/components/LoginFooter.vue`
- `src/pages/login/composables/useLoginFlow.ts`

## 第三轮整改完成情况

已完成第三轮页面与大组件整改：

| 页面 / 组件 | 整改后入口行数 | 状态 | 说明 |
| --- | ---: | --- | --- |
| `src/pages/shopping/index.vue` | 179 | 已整改 | 页面入口已回到路由接入、壳层编排、toast / confirm 托管 |
| `src/pages/group/index.vue` | 130 | 已整改 | 页面入口已回到家庭组加载、权限编排和 section 挂载 |
| `src/pages/recipe/cooking-guide.vue` | 107 | 已整改 | 页面入口仅保留壳层、Hero / Controls / Timer 组件编排 |
| `src/pages/shopping/components/ShoppingItem.vue` | 171 | 已整改 | 状态展示与动作区已拆分，展示派生已抽到 composable |
| `src/pages/fridge/components/FridgeAiBanner.vue` | 44 | 已整改 | banner 触发区与偏好 popup 已拆分 |
| `src/pages/fridge/components/ScanCamera.vue` | 127 | 已整改 | 拍照/选图/识别流已抽到 composable |
| `src/pages/fridge/components/ScanResultEditor.vue` | 90 | 已整改 | 编辑表单与日期逻辑已拆分 |

第三轮新增的页面私有文件：

- `src/pages/shopping/components/ShoppingItemStatus.vue`
- `src/pages/shopping/components/ShoppingItemActions.vue`
- `src/pages/fridge/constants/ai-recipe.ts`
- `src/pages/fridge/composables/useAiRecipePreferences.ts`
- `src/pages/fridge/components/FridgeAiBannerTrigger.vue`
- `src/pages/fridge/components/FridgeAiPreferencesPopup.vue`
- `src/pages/fridge/composables/useScanCapture.ts`
- `src/pages/fridge/components/ScanCameraHeader.vue`
- `src/pages/fridge/components/ScanCameraActions.vue`
- `src/pages/fridge/composables/useScanResultForm.ts`
- `src/pages/fridge/components/ScanResultFields.vue`
- `src/pages/fridge/components/ScanResultDatePicker.vue`

说明：

- `shopping/index.vue`、`group/index.vue`、`recipe/cooking-guide.vue` 已从原 `P0` 清单移除
- `ShoppingItem.vue`、`FridgeAiBanner.vue`、`ScanCamera.vue`、`ScanResultEditor.vue` 已从原组件整改队列移除
- 下一轮仅保留 `guide/index.vue`、`fridge/index.vue`、`FridgeItemCard.vue`、`ExpiryAlerts.vue`、`FamilyFeed.vue`
