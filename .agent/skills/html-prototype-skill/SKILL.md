---
name: html-prototype-generator
description: 根据需求文档生成原型图，支持本地 HTML 生成或为 AI 设计工具（Figma、Stitch 等）生成可直接使用的 Prompt
---

# HTML 原型图生成器 Skill

## 📋 概述

根据需求文档（或用户描述的需求）生成原型图。支持两种生成模式：

- **本地生成模式**：直接生成 HTML 原型文件，线框风格，着重功能点标注。逐页生成、逐页审查迭代。
- **AI 工具生成模式**：为 AI 设计工具（如 Figma、Stitch、v0、Galileo AI 等）生成可直接使用的结构化 Prompt，用户复制到对应工具即可生成高保真原型。

## 🎯 使用场景

- 需求文档完成后，快速可视化各页面功能布局
- 与产品/设计团队讨论需求理解是否一致
- 需求评审时提供可交互的视觉参考
- 在正式设计之前做低保真原型验证
- 使用 AI 设计工具快速生成高保真原型或设计稿

## 🔄 工作流程

### 阶段 1：需求解析

**你必须先完成以下分析：**

1. **获取需求文档**：
   - 如果用户提供了需求文档路径，读取文档内容
   - 如果用户口述需求，整理为结构化信息
   - 如果当前对话中刚使用 `requirement-design-skill` 生成了需求文档，直接使用该文档

2. **提取页面列表**：
   - 从需求文档中识别所有需要生成原型的页面/界面
   - 为每个页面标注核心功能点

3. **确认页面清单**：

   向用户展示页面列表并确认：

   ```
   根据需求文档，我识别了以下页面需要制作原型：

   1. 📄 登录页 - 用户登录、注册入口
   2. 📄 仪表盘 - 数据概览、快捷操作
   3. 📄 列表页 - 数据展示、搜索筛选
   4. 📄 详情页 - 数据详情、编辑操作
   5. 📄 设置页 - 系统配置、个人设置

   这些页面是否正确？需要增加或删除吗？
   确认后我将按顺序逐一生成原型图。
   ```

   等待用户确认或调整后再继续。

4. **选择生成方式**：

   页面清单确认后，**必须询问用户选择原型生成方式**：

   ```
   页面清单已确认！请选择原型图的生成方式：

   🖥️ 方式 A：本地生成 HTML 原型
      - 直接在项目中生成 HTML 线框原型文件
      - 可在浏览器中即时预览，逐页审查迭代
      - 适合：快速验证功能布局、需求评审

   🎨 方式 B：AI 设计工具 Prompt 生成
      - 为 AI 设计工具生成可直接使用的结构化 Prompt
      - 支持的工具：
        a. Figma（配合 AI 插件）
        b. Stitch（stitch.withgoogle.com）
        c. v0（v0.dev）
        d. Galileo AI（usegalileo.ai）
        e. 通用 Prompt（适用于其他 AI 设计工具）
      - 适合：需要高保真设计稿、团队协作设计

   请选择（A / B）：
   ```

   - **用户选择 A**：进入「阶段 2A：本地 HTML 生成」流程（原有流程）
   - **用户选择 B**：追问具体工具后，进入「阶段 2B：AI 工具 Prompt 生成」流程

### 阶段 2A：本地 HTML 逐页生成

**对每个页面重复以下流程：**

#### 2.1 生成前提示

```
接下来生成第 [N]/[总数] 个页面原型：[页面名称]

核心功能点：
- [功能点1]
- [功能点2]
- ...

正在生成...
```

#### 2.2 生成 HTML 原型文件

**你必须按照以下规范生成 HTML 文件：**

##### 文件命名规则

- 文件名格式：`prototype_[序号]_[页面英文名].html`
- 示例：`prototype_01_login.html`、`prototype_02_dashboard.html`

##### 保存位置

- 默认保存到项目目录下的 `prototypes/` 文件夹
- 如用户指定了其他目录则使用用户指定的路径

##### HTML 原型规范

**必须遵循的设计原则：**

1. **线框风格**：使用灰色系 + 蓝色标注，不要花哨的样式
2. **功能优先**：每个功能区域必须清晰可辨
3. **标注完整**：所有功能点必须有文字标注说明
4. **布局合理**：使用合理的间距和层次结构
5. **自包含**：每个 HTML 文件独立运行，所有样式内联
6. **响应式**：基本的响应式支持，但不需要完美适配

**统一基础样式模板（所有原型页面必须使用）：**

```html
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[页面名称] - 原型图</title>
    <style>
      /* === 原型图基础样式 === */
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family:
          -apple-system, "PingFang SC", "Helvetica Neue", Arial, sans-serif;
        background: #f0f0f0;
        color: #333;
        padding: 20px;
      }

      /* 原型图外框 */
      .prototype-frame {
        max-width: 1200px;
        margin: 0 auto;
        background: #fff;
        border: 2px solid #ccc;
        border-radius: 4px;
        overflow: hidden;
      }

      /* 页面标题栏（标注信息） */
      .prototype-header {
        background: #4a90d9;
        color: #fff;
        padding: 12px 20px;
        font-size: 14px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .prototype-header .page-title {
        font-weight: bold;
        font-size: 16px;
      }

      .prototype-header .page-info {
        font-size: 12px;
        opacity: 0.8;
      }

      /* 内容区域 */
      .prototype-body {
        padding: 20px;
        min-height: 600px;
      }

      /* === 通用组件样式 === */

      /* 功能区域块 */
      .section {
        border: 1.5px dashed #b0b0b0;
        border-radius: 4px;
        padding: 16px;
        margin-bottom: 16px;
        position: relative;
      }

      /* 功能区域标注标签 */
      .section-label {
        position: absolute;
        top: -10px;
        left: 12px;
        background: #4a90d9;
        color: #fff;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 2px;
        font-weight: bold;
      }

      /* 标注气泡 */
      .annotation {
        background: #fff3cd;
        border: 1px solid #fbbf24;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12px;
        color: #92600a;
        margin: 8px 0;
        display: inline-block;
      }

      .annotation::before {
        content: "💡 ";
      }

      /* 功能标注编号 */
      .func-tag {
        display: inline-block;
        background: #e8f4fd;
        border: 1px solid #4a90d9;
        color: #4a90d9;
        font-size: 11px;
        padding: 1px 6px;
        border-radius: 10px;
        margin-left: 6px;
        font-weight: bold;
        vertical-align: middle;
      }

      /* 输入框占位 */
      .input-placeholder {
        border: 1.5px solid #d0d0d0;
        border-radius: 4px;
        padding: 8px 12px;
        background: #fafafa;
        color: #999;
        font-size: 14px;
        width: 100%;
        margin: 4px 0;
      }

      /* 按钮占位 */
      .btn-placeholder {
        display: inline-block;
        padding: 8px 20px;
        border-radius: 4px;
        font-size: 14px;
        cursor: default;
        margin: 4px;
        border: none;
      }

      .btn-primary {
        background: #4a90d9;
        color: #fff;
      }

      .btn-secondary {
        background: #e0e0e0;
        color: #666;
      }

      .btn-danger {
        background: #e74c3c;
        color: #fff;
      }

      /* 表格占位 */
      .table-placeholder {
        width: 100%;
        border-collapse: collapse;
        margin: 8px 0;
      }

      .table-placeholder th,
      .table-placeholder td {
        border: 1px solid #d0d0d0;
        padding: 8px 12px;
        text-align: left;
        font-size: 13px;
      }

      .table-placeholder th {
        background: #f5f5f5;
        font-weight: bold;
        color: #555;
      }

      .table-placeholder td {
        color: #888;
      }

      /* 卡片占位 */
      .card-placeholder {
        border: 1.5px solid #d0d0d0;
        border-radius: 4px;
        padding: 16px;
        margin: 8px 0;
        background: #fafafa;
      }

      /* 导航栏 */
      .nav-placeholder {
        background: #f5f5f5;
        border-bottom: 1px solid #d0d0d0;
        padding: 10px 20px;
        display: flex;
        gap: 20px;
        align-items: center;
      }

      .nav-placeholder .nav-item {
        color: #666;
        font-size: 14px;
        cursor: default;
      }

      .nav-placeholder .nav-item.active {
        color: #4a90d9;
        font-weight: bold;
      }

      /* 侧边栏 */
      .sidebar-placeholder {
        background: #f8f8f8;
        border-right: 1px solid #d0d0d0;
        padding: 16px;
        min-height: 500px;
      }

      .sidebar-placeholder .menu-item {
        padding: 8px 12px;
        font-size: 14px;
        color: #555;
        border-radius: 4px;
        margin-bottom: 4px;
        cursor: default;
      }

      .sidebar-placeholder .menu-item.active {
        background: #e8f4fd;
        color: #4a90d9;
      }

      /* 图片/图表占位 */
      .image-placeholder {
        background: #eaeaea;
        border: 1.5px dashed #ccc;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #999;
        font-size: 13px;
        border-radius: 4px;
        min-height: 120px;
      }

      /* 头像占位 */
      .avatar-placeholder {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #d0d0d0;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 16px;
      }

      /* 布局辅助 */
      .flex {
        display: flex;
      }
      .flex-col {
        flex-direction: column;
      }
      .gap-sm {
        gap: 8px;
      }
      .gap-md {
        gap: 16px;
      }
      .gap-lg {
        gap: 24px;
      }
      .items-center {
        align-items: center;
      }
      .justify-between {
        justify-content: space-between;
      }
      .flex-1 {
        flex: 1;
      }
      .w-full {
        width: 100%;
      }
      .text-center {
        text-align: center;
      }
      .text-muted {
        color: #999;
        font-size: 13px;
      }
      .mt-sm {
        margin-top: 8px;
      }
      .mt-md {
        margin-top: 16px;
      }
      .mb-sm {
        margin-bottom: 8px;
      }
      .mb-md {
        margin-bottom: 16px;
      }

      /* 网格布局 */
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .grid-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 16px;
      }
      .grid-4 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        gap: 16px;
      }

      /* 分割线 */
      .divider {
        border: none;
        border-top: 1px solid #e0e0e0;
        margin: 16px 0;
      }

      /* 底部页面标注 */
      .prototype-footer {
        background: #f9f9f9;
        border-top: 1px solid #e0e0e0;
        padding: 12px 20px;
        font-size: 12px;
        color: #999;
      }

      .prototype-footer .notes-title {
        font-weight: bold;
        color: #666;
        margin-bottom: 6px;
      }

      .prototype-footer .note-item {
        margin-bottom: 4px;
        padding-left: 16px;
        position: relative;
      }

      .prototype-footer .note-item::before {
        content: "•";
        position: absolute;
        left: 4px;
        color: #4a90d9;
      }
    </style>
  </head>
  <body>
    <div class="prototype-frame">
      <!-- 标题栏 -->
      <div class="prototype-header">
        <span class="page-title">📐 [页面名称] 原型</span>
        <span class="page-info">页面 [N]/[总数] | [项目名称]</span>
      </div>

      <!-- 页面主内容 -->
      <div class="prototype-body">
        <!-- 在这里放置页面内容，使用上述组件样式 -->
      </div>

      <!-- 底部标注 -->
      <div class="prototype-footer">
        <div class="notes-title">📝 功能标注说明</div>
        <div class="note-item">[F1] 功能说明1</div>
        <div class="note-item">[F2] 功能说明2</div>
      </div>
    </div>
  </body>
</html>
```

##### 功能标注规范

每个功能点必须使用 `func-tag` 标注：

```html
<span class="func-tag">F1</span>
```

并在页面底部 `prototype-footer` 中给出对应的详细说明：

```html
<div class="note-item">[F1] 用户点击登录按钮后，系统验证账号密码</div>
```

##### 交互说明标注

对需要交互的元素使用 `annotation` 标注：

```html
<div class="annotation">点击后跳转到注册页面</div>
```

#### 2.3 生成后展示

生成 HTML 文件后，你必须：

1. **告知文件路径**：

   ```
   ✅ 原型图已生成！

   📄 文件：prototypes/prototype_01_login.html
   📐 页面：登录页（第 1/5 页）

   请在浏览器中打开查看，然后告诉我：
   1. ✅ 满意，继续下一页
   2. ✏️ 需要修改（请描述修改内容）
   ```

2. **使用浏览器工具打开该 HTML 文件**：让用户可以直接预览

### 阶段 2B：AI 工具 Prompt 生成（高保真设计稿）

**当用户选择方式 B 时，执行以下流程。**

#### 2B.1 核心原则

**AI 工具模式的目标是生成可直接用于开发的高保真设计稿，而非简陋的线框原型。为了最大化利用 AI 工具的“审美想象力”，必须遵循以下指导：**

1. **启发重于约束**：避免过度限制微小的数值（如死板的色号、固定的圆角、精确的间距）。提供风格调性、意图描述和视觉灵感，允许 AI 在审美上进行自由发挥。
2. **场景化创意**：Prompt 应旨在产生具有视觉冲击力和现代感的方案。对于不同类型的应用，加入具体的创意方向（如：对于 AI 应用，强调“流光效果”或“极简透光感”）。
3. **高标准视觉要素**：Prompt 中必须包含对整体美感、光影、材质、动态感的描述，而不仅仅是布局。
4. **真实感细节**：使用贴近业务的模拟数据，增强设计的真实可信度。

#### 2B.1 确认目标工具

如果用户在选择方式 B 时未指定工具，追问：

```
请选择目标 AI 设计工具：

a. Figma（配合 Figma AI / Diagram 等插件）
b. Stitch（Google 出品，stitch.withgoogle.com）
c. v0（Vercel 出品，v0.dev，生成 React 组件）
d. Galileo AI（usegalileo.ai，生成高保真 UI）
e. 通用 Prompt（结构化描述，适用于任何 AI 设计工具）

请选择（a/b/c/d/e）：
```

#### 2B.2 逐页生成 Prompt

**对每个页面重复以下流程：**

1. **生成前提示**：

   ```
   接下来为第 [N]/[总数] 个页面生成 [工具名称] Prompt：[页面名称]

   核心功能点：
   - [功能点1]
   - [功能点2]
   - ...

   正在生成...
   ```

2. **生成 Prompt 文件**：
   - 文件保存到 `prototypes/prompts/` 目录
   - 文件命名：`prompt_[序号]_[页面英文名]_[工具名].md`
   - 示例：`prompt_01_login_figma.md`、`prompt_02_dashboard_v0.md`

3. **Prompt 内容结构**（根据工具不同调整格式）：

**所有 Prompt 必须包含以下维度的引导，旨在激发 AI 的高保真设计潜力：**

- **视觉调性与审美灵感**：定义设计的“性格”（如：前卫感、温暖且直观、极简而高级）。
- **配色意图**：提供品牌主色方向，鼓励 AI 在辅助色、背景渐变、微差对比上进行审美探索。
- **光影与材质**：引导 AI 使用阴影、磨砂玻璃、发光边缘等高级质感提升层次。
- **字体与层级**：定义大致的字号级数和性格（如：粗重有力的标题 vs 优雅轻盈的细节），而非死绑定具体数值。
- **布局逻辑**：描述页面如何“工作”以及信息如何在空间上顺畅流动，而非固定死每个模块的像素宽度。
- **创意引导（Creative Guidance）**：显式要求 AI 在[关键区域]提供“令人惊叹”的创意布局或视觉表现。
- **交互灵魂**：描述悬停、点击等动作时的“反馈感”，赋予 UI 生命。
- **真实感的占位数据**：拒绝 "xxx"，使用贴近业务的精彩模拟数据。

##### Figma Prompt 格式

```markdown
# [页面名称] - Figma AI 设计 Prompt

> 将以下内容复制到 Figma AI 插件（如 Diagram、Genius 等）中使用

## Prompt

设计一个高品质的[页面类型]页面，用于"企业智能工作台"应用。

**页面名称**：[页面名称]
**审美调性**：现代企业级 SaaS 高保真设计。视觉精致、层次分明，呈现出[特定的审美风格，如：Apple 风格的简洁、Cyberpunk 的科技感、或 Material Design 3 的活泼]。

**视觉与灵感引导**：

- **配色意图**：以[品牌色，如：#4A90D9]为灵魂，允许混合同类色或补色来增强视觉冲击。背景应有深浅不一的层级或柔和的渐变，避免单一平铺。
- **光影材质**：广泛使用多层阴影、玻璃化效果或柔光边缘，营造出精致的物理感。
- **空间与呼吸感**：保持宽裕的留白，使用 8px 基础网格作为参考，但允许 AI 根据平衡感微调间距。

**创意引导 (Creative Guidance)**：

- 请在[核心模块，如：仪表盘概览]尝试非传统的、具有艺术感的布局。
- 为[列表/卡片]设计独特的交互视觉反馈，让人感觉到界面的响应是“有机”的。

**细节规格参考**：

- 字体：使用具有高度识别度的字体（如：Inter, PingFang SC），标题粗重（font-weight 600+）与正文轻巧形成鲜明对比。
- 圆角：根据视觉张力灵活定义（参考：卡片 12px+，按钮 8px+）。
- 图标：风格高度统一的精细图标，建议 1.5px 或 2px 描边。

---

## 功能标注参考

| 编号 | 功能说明 |
| ---- | -------- |
| F1   | [说明]   |
| F2   | [说明]   |
```

##### Stitch (Google) Prompt 格式

```markdown
# [页面名称] - Stitch Prompt

> 将以下内容直接粘贴到 stitch.withgoogle.com 的输入框中

## Prompt

设计一个精致的高保真[页面类型]页面，用于"企业智能工作台"应用。

**页面概述**：[描述页面用途及核心用户目标]

**视觉调性**：[定义页面“性格”，如：极致专业、动态活力、或冷静透彻]。

**灵感与审美引导**：

- **色彩宇宙**：基于[主色，如：#4A90D9]，运用单色系的不同明度或具有对比感的辅色。鼓励在背景上使用极细微的颗粒感或大范围圆滑的色彩波动。
- **深度感**：运用深浅不一的弥散阴影、半透明磨砂（Glassmorphism）效果，让界面具有 Z 轴深度。
- **文字艺术**：建立强烈的字体层级对比。所有文字使用简体中文，注重排版的美感。
- **图标灵魂**：使用具有高级感的线性或双色调图标，提升细节质感。

**创意引导 (Creative Guidance)**：

- 请在[重点区域]展现你的设计才华，提供一个“哇”的瞬间。
- 探索独特的卡片折叠、滑动或层叠布局，而非单纯的网格平铺。

**核心区域描述**：
[区域名称]：[描述功能逻辑、内容重点，并给出视觉期望灵感，而不是死板的像素值]。

**交互状态灵感**：

- 悬停：不仅仅是变色，考虑微缩放、光晕偏移或深层投影的变化。
- 输入：聚焦时显示流光边框、轻微浮动标签等具有现代感的反馈。

---

## 功能标注参考

| 编号 | 功能说明 |
| ---- | -------- |
| F1   | [说明]   |
| F2   | [说明]   |
```

##### v0 (Vercel) Prompt 格式

```markdown
# [页面名称] - v0 Prompt

> 将以下内容直接粘贴到 v0.dev 的输入框中

## Prompt

使用 React 和 Tailwind CSS 构建一个精致的[页面类型]页面组件，用于"企业智能工作台"应用。要求生成生产级别的高品质 UI，不是线框原型。

**功能需求**：

- [需求1：具体的 UI 组件和功能描述]
- [需求2：具体的功能区域和交互行为]
- [需求3：具体的数据展示要求]

**布局结构**：

- [顶部区域描述——导航栏、用户信息、通知等]
- [主内容区域描述——核心功能布局]
- [侧边栏描述（如有）——菜单、快捷操作等]

**功能与创意需求**：

- [需求 1：功能逻辑描述，并附带“惊艳点”建议]
- [需求 2：如何展示数据，鼓励使用创新的可视化方式]

**视觉与灵感引导**：

- **现代美学**：使用极致的简约主义或现代 SaaS 风格。广泛采用 `backdrop-blur`、`border-opacity` 和 `shadow-2xl` 提升品质感。
- **色彩策略**：主色设为[品牌色]，允许在组件中运用渐变、混合模式。背景色追求干净且有层次。
- **字体层级**：利用 Tailwind 的文本类（如 `tracking-tight`, `leading-relaxed`）精细控制排版。
- **图标灵魂**：Lucide 图标，运用动画（如 `animate-pulse` 或 `hover:rotate`）增加交互趣味性。

**创意引导 (Creative Guidance)**：

- 为[核心组件]编写一段引人注目的 UI。打破常规，使用更具流动性的布局。
- 在状态转换处使用 Framer Motion 或 CSS 过渡，确保交互如同丝般顺滑。

**组件详细描述**：

1. [组件1：完整的内容、样式、状态描述]
2. [组件2：同上]
   ...

**交互状态**：

- 按钮：hover 时背景加深，transition 过渡
- 输入框：focus 时蓝色边框 + ring
- 卡片：hover 时 shadow-md 提升
- 列表行：hover 时浅灰背景高亮

使用 shadcn/ui 组件库。包含简体中文标签和贴近业务的模拟数据。

---

## 功能标注参考

| 编号 | 功能说明 |
| ---- | -------- |
| F1   | [说明]   |
| F2   | [说明]   |
```

##### Galileo AI Prompt 格式

```markdown
# [页面名称] - Galileo AI Prompt

> 将以下内容直接粘贴到 usegalileo.ai 的输入框中

## Prompt

设计一个高保真的[页面类型]页面，用于"企业智能工作台"应用。要求精致、专业、可直接用于开发交付。

**页面描述与愿景**：[一段充满感染力的页面功能描述，传达出页面想要带给用户的感受]。

**核心区域与创意引导 (Creative Guidance)**：

1. [区域1]：[功能逻辑描述] - 视觉上，请尝试[具体的创意建议，如：非对称布局、深度垂直空间感]。
2. [区域2]：[功能逻辑描述] - 视觉上，建议展示[如：流动的图表、动态响应的数据卡片]。

**视觉风格与灵感**：

- **审美底色**：现代企业级 SaaS，追求精致、通透和专业感。
- **色彩宇宙**：以[主色]为基调，搭配富有活力的对比色或和谐的渐变方案。
- **光影与层次**：利用弥散阴影、半透明磨砂材质营造出富有呼吸感的 Z 轴层次。
- **排版艺术**：强烈的视觉对比，标题与正文之间有清晰的节奏感。
- **图标与细节**：统一的线性高级图标，1.5px 描边，展现对每个像素的极致追求。

**交互灵魂**：

- 精致的悬停反馈、输入框的灵动交互，以及平滑的状态切换效果。
- 所有文字使用简体中文，填充极具真实感的业务模拟数据。

---

## 功能标注参考

| 编号 | 功能说明 |
| ---- | -------- |
| F1   | [说明]   |
| F2   | [说明]   |
```

##### 通用 Prompt 格式

```markdown
# [页面名称] - 通用 AI 设计 Prompt

> 适用于任何 AI 设计工具，根据工具要求适当调整格式

## Prompt

设计一个高保真的[页面类型]页面，用于"企业智能工作台"应用。要求输出精致、专业的设计稿，不是简陋的线框原型。

**页面概述**：[描述页面用途、目标用户以及希望传达的视觉情感]。

**布局与空间逻辑**：

- [区域 1]：[描述此区域在空间上的角色和信息流向，而非固死像素]。
- [区域 2]：[同上]。

**视觉与创意指引 (Creative Guidance)**：

1. **调性定义**：[风格关键词，如：极简、前卫、沉稳、或富有亲和力]。
2. **色彩灵感**：以[品牌色]为核心。鼓励使用渐变色、微妙的色相偏移来打破视觉单调。
3. **质感表达**：运用阴影、材质、留白来构建界面的秩序感和高级感。
4. **惊喜元素**：在[特定模块]尝试更有趣的展现形式（如：卡片、列表的非传统排版）。
5. **交互细节**：描述元素在被触碰时的灵动反馈（如：浮动感、光影变换）。
6. **全中文环境**：所有文字标签、占位和模拟数据必须使用简体中文，且贴合真实业务场景。

---

## 功能标注参考

| 编号 | 功能说明 |
| ---- | -------- |
| F1   | [说明]   |
| F2   | [说明]   |
```

#### 2B.3 展示生成结果

每个页面的 Prompt 生成后：

```
✅ Prompt 已生成！

📄 文件：prototypes/prompts/prompt_01_login_[工具名].md
📐 页面：[页面名称]（第 N/总数 页）
🎨 目标工具：[工具名称]

请查看 Prompt 内容，然后告诉我：
1. ✅ 满意，继续下一页
2. ✏️ 需要修改（请描述修改内容）
3. 📋 直接复制使用（我会将 Prompt 核心内容输出到对话中方便复制）
```

如果用户选择"直接复制"，将 Prompt 的核心部分（不含文件头和标注表格）直接输出到对话中，方便用户复制粘贴。

#### 2B.4 反馈迭代

与本地生成模式相同，收集用户反馈并迭代修改 Prompt 内容，直到用户满意后再进入下一页。

#### 2B.5 全部完成

所有页面 Prompt 生成完成后：

```
🎉 所有页面的 [工具名称] Prompt 已生成完毕！

📁 文件目录：prototypes/prompts/

| 序号 | 页面名称 | Prompt 文件 | 状态 |
|------|---------|------------|------|
| 1 | [页面名] | prompt_01_xxx_[工具].md | ✅ 已确认 |
| 2 | [页面名] | prompt_02_xxx_[工具].md | ✅ 已确认 |
| ... | ... | ... | ... |

🚀 使用方式：
1. 打开 [工具名称]（[工具链接]）
2. 逐个复制 Prompt 文件中的内容到工具输入框
3. 根据生成结果微调设计

你可以：
1. 重新修改某个页面的 Prompt（告诉我序号）
2. 切换到其他 AI 设计工具重新生成
3. 同时生成本地 HTML 原型（方式 A）
4. 全部确认完成
```

**注意**：AI 工具 Prompt 生成完成后，不再进入阶段 6（AI 开发打包），因为 Prompt 模式的交付物是设计稿而非开发用原型。但如果用户主动要求，仍可执行打包流程。

---

### 阶段 3：收集反馈和迭代修改（本地 HTML 模式）

**这是核心的迭代循环，必须严格执行：**

#### 3.1 等待用户反馈

暂停并等待用户回复，可能的回复类型：

- **满意** → 进入下一页
- **需要修改** → 执行修改
- **大改** → 重新生成该页面

#### 3.2 执行修改

如果用户提出修改意见：

1. **确认修改内容**：

   ```
   收到修改意见，我将进行以下调整：
   1. [修改点1]
   2. [修改点2]

   修改中...
   ```

2. **修改 HTML 文件**：直接编辑已生成的文件，不创建新文件

3. **再次展示**：

   ```
   ✅ 修改完成！

   📄 文件：prototypes/prototype_01_login.html（已更新）

   修改内容：
   1. ✅ [修改点1] - 已完成
   2. ✅ [修改点2] - 已完成

   请再次查看，然后告诉我：
   1. ✅ 满意，继续下一页
   2. ✏️ 还需要修改（请描述修改内容）
   ```

4. **再次使用浏览器工具打开**：让用户查看修改效果

#### 3.3 循环直到满意

**重复 3.1 → 3.2 步骤，直到用户明确表示满意。**

**不要主动跳过这个循环。必须等到用户明确说"满意""可以""下一页""OK"等肯定词语后，才能进入下一个页面。**

### 阶段 4：进入下一页（本地 HTML 模式）

用户对当前页面满意后：

```
✅ 第 [N]/[总数] 页「[页面名称]」已完成！

接下来生成第 [N+1]/[总数] 页「[下一页名称]」...
```

然后返回阶段 2，对下一个页面重复生成→反馈→迭代流程。

### 阶段 5：全部完成（本地 HTML 模式）

所有页面生成完成后：

```
🎉 所有原型图已生成完毕！

📁 原型文件目录：prototypes/

| 序号 | 页面名称 | 文件名 | 状态 |
|------|---------|--------|------|
| 1 | 登录页 | prototype_01_login.html | ✅ 已确认 |
| 2 | 仪表盘 | prototype_02_dashboard.html | ✅ 已确认 |
| ... | ... | ... | ... |

你可以：
1. 重新修改某个页面（告诉我页面序号）
2. 添加新页面
3. 全部确认，进入下一步
```

用户确认全部完成后，**必须进入阶段 6**。

### 阶段 6：AI 开发打包（本地 HTML 模式，必须执行）

**所有原型图确认完毕后，你必须询问用户是否需要打包给 AI 进行开发：**

```
所有原型图已确认！🎉

🤖 是否需要将原型图打包，用于交给 AI 进行开发？

打包内容包括：
- 所有原型图 HTML 文件
- 需求文档（如有）
- 开发指令 Prompt 文件（AI 可直接使用）

请选择：
1. ✅ 是，打包用于 AI 开发
2. ❌ 否，不需要打包
```

#### 6.1 用户选择"是"

**执行以下步骤：**

##### 步骤 1：收集打包信息

询问用户（如果之前未提供）：

```
为了生成更准确的开发指令，请确认以下信息：

1. 技术栈：（如 Vue + TypeScript、React + Next.js 等）
2. UI 框架偏好：（如 Ant Design、Element Plus、Tailwind CSS 等，或无偏好）
3. 项目类型：（新项目从零搭建 / 在现有项目中开发）
4. 特殊要求：（如有）

如果之前在需求文档中已经提供过这些信息，可以直接说"使用需求文档中的配置"。
```

##### 步骤 2：生成 AI 开发 Prompt 文件

**在 `prototypes/` 目录下生成 `AI_DEV_PROMPT.md` 文件，格式如下：**

```markdown
# AI 开发指令

> ⚠️ 本文件由原型图生成器自动创建，用于指导 AI 根据原型图进行前端开发。

## 📋 项目概述

- **项目名称**：[项目名称]
- **项目描述**：[简要描述]
- **技术栈**：[技术栈信息]
- **UI 框架**：[UI 框架]

## 🎯 开发任务

请根据以下原型图文件，逐页实现前端页面。每个原型图文件包含：

- 页面布局结构
- 功能区域划分（虚线框标注）
- 功能点编号（[F1]~[Fn] 蓝色标签）
- 交互说明（💡 黄色气泡）
- 底部功能标注详细说明

## 📄 原型图文件清单

| 序号 | 页面名称 | 原型文件                                         | 开发优先级 |
| ---- | -------- | ------------------------------------------------ | ---------- |
| 1    | [页面名] | [prototype_01_xxx.html](./prototype_01_xxx.html) | P0         |
| 2    | [页面名] | [prototype_02_xxx.html](./prototype_02_xxx.html) | P0         |
| ...  | ...      | ...                                              | ...        |

## 📐 开发要求

### 通用要求

1. **严格还原原型布局**：页面结构、功能区域划分必须与原型一致
2. **实现所有标注功能**：原型中每个 [Fn] 标注的功能都必须实现
3. **遵循交互说明**：原型中 💡 标注的交互行为必须实现
4. **响应式适配**：至少支持桌面端（1200px+）和平板端（768px+）
5. **组件化开发**：将重复使用的 UI 元素抽取为独立组件

### 页面开发说明

#### 页面 1：[页面名称]

**对应原型**：`prototype_01_xxx.html`

**功能要点**：

- [F1] [功能说明]
- [F2] [功能说明]
- ...

**交互要点**：

- [交互说明1]
- [交互说明2]

**数据接口**（建议）：

- `GET /api/xxx` - [用途]
- `POST /api/xxx` - [用途]

<!-- 对每个页面重复以上格式 -->

## ⚠️ 注意事项

1. 原型图仅展示功能布局，最终 UI 样式应使用 [UI 框架] 的标准组件
2. 原型中的灰色占位元素（输入框、按钮等）需替换为真实的 UI 组件
3. 原型中的标注信息（蓝色标签、黄色气泡、底部说明）是开发参考，不需要在最终页面中显示
4. 如遇到原型中未明确的交互细节，请参考同类产品的通用做法
```

##### 步骤 3：生成打包汇总

**打包完成后提示：**

```
✅ AI 开发打包完成！

📁 打包目录：prototypes/

📄 文件清单：
├── AI_DEV_PROMPT.md              ← 🤖 AI 开发指令（核心文件）
├── prototype_01_login.html        ← 原型图
├── prototype_02_dashboard.html    ← 原型图
├── ...                            ← 其他原型图
└── [requirement.md]               ← 需求文档（如有）

🚀 使用方式：
将 prototypes/ 目录提供给 AI 助手，并发送以下指令：

---
请阅读 prototypes/AI_DEV_PROMPT.md 文件，
根据其中的开发指令和原型图文件，逐页实现前端页面。
---

需要调整打包内容吗？
```

#### 6.2 用户选择"否"

```
好的，原型设计已全部完成！

📁 所有原型图保存在：prototypes/

如果后续需要打包用于 AI 开发，随时告诉我。
```

## ⚠️ 重要规则

### 通用规则（两种模式均适用）

1. **必须询问生成方式**：页面清单确认后，必须让用户选择本地生成（A）或 AI 工具 Prompt（B），不可跳过
2. **逐页生成**：必须一页一页输出，严禁一次性生成所有页面
3. **等待反馈**：每页生成后必须暂停等待用户反馈，严禁自动跳到下一页
4. **迭代修改**：修改后必须让用户再次确认，不要假设修改一定满足需求
5. **保留标注**：所有功能点必须有明确的标注编号和说明
6. **禁止使用 Emoji**：原型图和 Prompt 中一律不使用 Emoji 表情符号。需要图形表达的地方，必须使用图标（icon）描述代替（如"建筑图标"、"眼睛图标"、"铃铛图标"等矢量图标说明）
7. **使用简体中文**：所有面向用户的文字内容（标签、占位文字、标题、提示信息等）必须使用简体中文
8. **避免不必要的英文**：除技术参数（颜色值、尺寸、组件名等）外，描述性文字一律使用简体中文，不要中英文混杂

### 本地 HTML 模式（方式 A）附加规则

9. **线框风格**：本地 HTML 原型以功能展示为主，使用灰色系线框风格，不追求视觉精美，不需要实际的交互逻辑
10. **文件覆盖**：修改时直接更新原文件，不创建新文件
11. **浏览器预览**：每次生成或修改后，使用浏览器工具打开文件让用户查看

### AI 工具 Prompt 模式（方式 B）附加规则

12. **高保真设计（激发想象力）**：Prompt 必须旨在引导 AI 工具输出精致、前卫且专业的高保真设计稿，严禁生成过时的、死板的 UI。
    - **避免死限制**：不要在 Prompt 中硬性绑定微小的数值（如固定的圆角值、死板的间距值）。
    - **提供视觉意图**：提供风格调性、配色灵感和光影意向，鼓励 AI 在审美范围内进行自由探索和意外的“小惊喜”。
    - **场景化创意**：根据不同页面类型，显式要求 AI 在关键区域尝试“非传统”或“具有艺术感”的布局逻辑。
    - **完整要素**：必须包含对配色（意图而非死色值）、阴影材质、字体层级感、图标高级感、灵动交互状态以及极具业务真实感的全中文模拟数据的引导。
13. **Prompt 语言与适配**：Prompt 主体使用简体中文，UI 标签及其内容使用简体中文。必须按照对应工具（Figma, Stitch, v0, Galileo）的专用模板格式生成，确保视觉规范的一致性。
14. **方便复制**：当用户要求"直接复制"时，只输出可直接粘贴到工具中的 Prompt 文本，去掉文件头、标注表格等辅助信息。

## 📝 标注体系说明

原型图使用以下标注体系帮助读者理解：

| 标注类型                    | 样式                 | 用途               |
| --------------------------- | -------------------- | ------------------ |
| `func-tag`                  | 蓝色圆角标签 [F1]    | 标注功能点编号     |
| `annotation`                | 黄底气泡（灯泡图标） | 交互说明和备注     |
| `section` + `section-label` | 虚线框 + 蓝色标签    | 划分功能区域       |
| `prototype-footer`          | 底部灰色区域         | 功能标注的详细说明 |

## 📚 相关资源

- 参考示例：`examples/login_prototype.html`
- 与 `requirement-design-skill` 配合使用效果最佳
