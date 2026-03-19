# ChefMate 前端开发设计方案

> 文档版本：v1.0
> 创建日期：2026-02-25
> 技术栈：Uni-app + Vue 3 + TypeScript + Pinia + TailwindCSS

---

## 1. 技术栈总览

| 层次      | 技术选型                | 版本            | 用途                        |
| --------- | ----------------------- | --------------- | --------------------------- |
| 框架      | Uni-app                 | 3.x (Vite)      | 跨端框架（iOS + Android）   |
| 视图层    | Vue 3 Composition API   | 3.4+            | 响应式 UI 开发              |
| 语言      | TypeScript              | 5.x（严格模式） | 类型安全                    |
| 状态管理  | Pinia                   | 2.x             | 全局状态管理                |
| UI 组件库 | uni-ui + uView Plus     | latest          | 移动端原生组件              |
| CSS       | TailwindCSS + SCSS      | 3.x             | 原子化样式 + 预处理器       |
| HTTP      | @uni-helper/uni-network | latest          | 基于 uni.request 的请求封装 |
| 图表      | ECharts (uni-ec-canvas) | 5.x             | 数据统计可视化              |
| 工具      | dayjs                   | 1.x             | 日期处理（过期计算等）      |
| 国际化    | vue-i18n                | 9.x             | 架构预留                    |
| 推送      | UniPush 2.0             | -               | 消息推送                    |

---

## 2. 项目结构

```
src/
├── App.vue                           # 应用入口
├── main.ts                           # 初始化
├── manifest.json                     # Uni-app 配置
├── pages.json                        # 路由与页面配置
├── uni.scss                          # 全局 SCSS 变量
├── pages/                            # 页面组件
│   ├── login/                        # 登录注册
│   │   └── index.vue
│   ├── home/                         # 首页（食谱推荐）
│   │   └── index.vue
│   ├── fridge/                       # 冰箱管理
│   │   ├── index.vue                 # 食材列表
│   │   └── scan.vue                  # 拍照入库
│   ├── recipe/                       # 食谱
│   │   ├── index.vue                 # 食谱列表
│   │   ├── generate.vue              # AI 生成食谱
│   │   ├── detail.vue                # 食谱详情
│   │   └── from-video.vue            # 视频解析食谱
│   ├── cooking/                      # 沉浸式烹饪
│   │   └── index.vue                 # 烹饪指引页
│   ├── shopping/                     # 购物清单
│   │   └── index.vue
│   ├── group/                        # 家庭组
│   │   ├── index.vue                 # 组管理
│   │   └── tasks.vue                 # 协作任务
│   ├── profile/                      # 个人中心
│   │   ├── index.vue
│   │   └── preferences.vue           # 偏好设置
│   └── stats/                        # 数据统计
│       └── index.vue
├── components/                       # 公共组件
│   ├── AppNavBar.vue                 # 导航栏
│   ├── RecipeCard.vue                # 食谱卡片
│   ├── IngredientTag.vue             # 食材标签
│   ├── StepCard.vue                  # 烹饪步骤卡片
│   ├── TimerWidget.vue               # 倒计时组件
│   ├── ShoppingItem.vue              # 购物项
│   ├── TaskItem.vue                  # 任务项
│   ├── EmptyState.vue                # 空状态
│   ├── StreamText.vue                # SSE 流式文字展示
│   └── VoiceButton.vue               # 语音输入按钮
├── stores/                           # Pinia 状态管理
│   ├── user.ts                       # 用户状态
│   ├── group.ts                      # 家庭组状态
│   ├── fridge.ts                     # 冰箱食材状态
│   ├── recipe.ts                     # 食谱状态
│   └── notification.ts               # 通知状态
├── services/                         # API 请求层
│   ├── request.ts                    # 请求封装（拦截器）
│   ├── auth.ts                       # 认证 API
│   ├── group.ts                      # 家庭组 API
│   ├── fridge.ts                     # 食材 API
│   ├── recipe.ts                     # 食谱 API
│   ├── cooking.ts                    # 烹饪 API
│   ├── shopping.ts                   # 购物清单 API
│   └── notification.ts               # 通知 API
├── composables/                      # 组合式函数
│   ├── useAuth.ts                    # 认证相关逻辑
│   ├── useSSE.ts                     # SSE 流式数据处理
│   ├── useVoice.ts                   # 语音录制与识别
│   ├── useTimer.ts                   # 倒计时管理
│   ├── useCamera.ts                  # 拍照封装
│   └── usePagination.ts              # 分页加载
├── types/                            # TypeScript 类型定义
│   ├── api.d.ts                      # API 响应类型
│   ├── recipe.d.ts                   # 食谱相关类型
│   ├── fridge.d.ts                   # 食材相关类型
│   └── user.d.ts                     # 用户相关类型
├── utils/                            # 工具函数
│   ├── format.ts                     # 日期/数量格式化
│   ├── storage.ts                    # 本地存储封装
│   └── permission.ts                 # 权限检查
└── static/                           # 静态资源
    ├── images/
    └── icons/
```

---

## 3. 通用架构设计

### 3.1 请求封装

```typescript
// services/request.ts
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ApiResponse<T> {
  code: number;
  data: T;
  msg: string;
}

export const request = <T>(options: UniApp.RequestOptions): Promise<T> => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync("token");
    uni.request({
      ...options,
      url: `${BASE_URL}${options.url}`,
      header: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
        ...options.header,
      },
      success: (res) => {
        const data = res.data as ApiResponse<T>;
        if (data.code === 0) {
          resolve(data.data);
        } else if (data.code === 1002) {
          // Token 过期 → 尝试刷新
          refreshTokenAndRetry(options, resolve, reject);
        } else {
          uni.showToast({ title: data.msg, icon: "none" });
          reject(data);
        }
      },
      fail: reject,
    });
  });
};
```

### 3.2 SSE 流式数据处理

```typescript
// composables/useSSE.ts
export function useSSE(url: string) {
  const content = ref("");
  const status = ref<"idle" | "loading" | "done" | "error">("idle");

  const start = (body: Record<string, any>) => {
    status.value = "loading";
    content.value = "";

    // Uni-app 使用 RequestTask 接收流式数据
    const task = uni.request({
      url: `${BASE_URL}${url}`,
      method: "POST",
      data: body,
      header: {
        Authorization: `Bearer ${uni.getStorageSync("token")}`,
        Accept: "text/event-stream",
      },
      enableChunkedTransfer: true, // 开启分块传输
      success: () => {
        status.value = "done";
      },
      fail: () => {
        status.value = "error";
      },
    });

    // 监听分块数据
    task.onChunkReceived?.((res) => {
      const text = new TextDecoder().decode(res.data);
      // 解析 SSE 格式：data: {...}\n\n
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));
      for (const line of lines) {
        const json = JSON.parse(line.slice(6));
        if (json.type === "chunk") {
          content.value += json.content;
        } else if (json.type === "done") {
          status.value = "done";
        }
      }
    });

    return task;
  };

  return { content, status, start };
}
```

### 3.3 Pinia Store 示例（用户状态）

```typescript
// stores/user.ts
export const useUserStore = defineStore("user", () => {
  const token = ref(uni.getStorageSync("token") || "");
  const userInfo = ref<UserInfo | null>(null);
  const currentGroupId = ref("");

  const isLoggedIn = computed(() => !!token.value);

  const login = async (phone: string, password: string) => {
    const res = await authService.login({ phone, password });
    token.value = res.token;
    userInfo.value = res.user;
    uni.setStorageSync("token", res.token);
    uni.setStorageSync("refreshToken", res.refreshToken);
  };

  const logout = () => {
    token.value = "";
    userInfo.value = null;
    uni.removeStorageSync("token");
    uni.switchTab({ url: "/pages/login/index" });
  };

  return { token, userInfo, currentGroupId, isLoggedIn, login, logout };
});
```

---

## 4. 页面模块设计——基础页面

### 4.1 登录注册页

**页面路径**：`pages/login/index.vue`

**页面元素**：

- Logo + 应用名
- 登录 / 注册主切换 Tab
- 登录态：手机号验证码登录、手机号密码登录
- 注册态：手机号、短信验证码、密码、确认密码、协议勾选
- 用户协议 / 隐私保护指引可阅读内容层

**交互流程**：登录成功 → 存 Token → 检查是否有家庭组 → 有则跳首页 → 无则引导创建/加入

### 4.2 首页（食谱推荐）

**页面路径**：`pages/home/index.vue`

**页面结构**：

- 顶部：用户头像 + 家庭组切换 + 通知铃铛（未读小红点）
- 轮播区：每日推荐食谱卡片（调用 `/api/recipes/recommend`）
- 快捷入口：拍照入库 / AI 生成食谱 / 视频解析 / 购物清单
- 即将过期食材提醒横幅（调用 `/api/fridge/expiring`）
- 最近烹饪历史列表

### 4.3 冰箱管理页

**页面路径**：`pages/fridge/index.vue`

**页面结构**：

- 分类 Tab 栏：全部 / 蔬菜 / 水果 / 肉类 / 乳制品 / 调味品 / 其他
- 食材卡片列表（显示名称、数量、到期天数、状态色标）
- 状态色标：🟢新鲜 / 🟡即将过期 / 🔴已过期
- 右下角浮动按钮：➕ 拍照入库
- 长按食材：编辑数量 / 标记已消耗 / 删除

### 4.4 家庭组管理页

**页面路径**：`pages/group/index.vue`

**页面结构**：

- 组名 + 邀请码展示（点击复制）
- 成员列表（头像 + 昵称 + 角色标签）
- 功能按钮：邀请成员 / 管理角色 / 退出家庭组
- 无家庭组状态：创建新组 / 输入邀请码加入

---

## 5. 页面模块设计——AI 核心页面（详细设计）

### 5.1 拍照入库页 📸

**页面路径**：`pages/fridge/scan.vue`

#### 页面交互流程

```
打开相机/相册 → 拍照/选择图片 → 展示 loading → AI 识别结果卡片列表
→ 用户可修改（名称/数量/保质期） → 点击"确认入库" → 成功提示 → 返回冰箱页
```

#### 核心组件

| 组件                     | 职责                                      |
| ------------------------ | ----------------------------------------- |
| `ScanPreview.vue`        | 展示拍摄的照片预览                        |
| `RecognizeResult.vue`    | 展示 AI 识别结果列表，支持编辑            |
| `IngredientEditForm.vue` | 单个食材编辑表单（名称/数量/单位/保质期） |

#### 关键代码逻辑

```typescript
// composables/useCamera.ts
export function useCamera() {
  const takePhoto = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      uni.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["camera", "album"],
        success: (res) => resolve(res.tempFilePaths[0]),
        fail: reject,
      });
    });
  };

  const uploadAndScan = async (filePath: string, groupId: string) => {
    const res = await uni.uploadFile({
      url: `${BASE_URL}/api/groups/${groupId}/fridge/scan`,
      filePath,
      name: "file",
      header: { Authorization: `Bearer ${uni.getStorageSync("token")}` },
    });
    return JSON.parse(res.data as string).data;
  };

  return { takePhoto, uploadAndScan };
}
```

### 5.2 AI 食谱生成页 🤖

**页面路径**：`pages/recipe/generate.vue`

#### 页面交互流程

```
选择冰箱食材（多选） → 点击"AI 生成" → SSE 流式展示食谱内容（打字机效果）
→ 生成完成 → 展示食谱卡片列表 → 点击进入详情 → 可收藏/开始烹饪
```

#### 核心组件

| 组件                     | 职责                           |
| ------------------------ | ------------------------------ |
| `IngredientSelector.vue` | 食材多选面板（从冰箱列表加载） |
| `StreamText.vue`         | SSE 流式文字展示（打字机效果） |
| `RecipeCard.vue`         | 生成的食谱卡片（复用）         |

#### 关键代码逻辑

```vue
<!-- pages/recipe/generate.vue -->
<template>
  <view class="generate-page">
    <!-- 食材选择 -->
    <IngredientSelector v-model="selectedIngredients" :items="fridgeItems" />

    <!-- 生成按钮 -->
    <button
      class="generate-btn"
      :disabled="status === 'loading'"
      @click="generate"
    >
      {{ status === "loading" ? "AI 正在生成..." : "🤖 AI 生成食谱" }}
    </button>

    <!-- 流式内容展示 -->
    <StreamText v-if="content" :text="content" :typing="status === 'loading'" />

    <!-- 生成完成后的食谱列表 -->
    <view v-if="recipes.length" class="recipe-list">
      <RecipeCard
        v-for="r in recipes"
        :key="r.id"
        :recipe="r"
        @click="goDetail(r.id)"
        @cook="startCooking(r.id)"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
const { content, status, start } = useSSE("/api/recipes/generate");
const selectedIngredients = ref<string[]>([]);

const generate = () => {
  start({
    ingredients: selectedIngredients.value,
    groupId: currentGroupId.value,
  });
};
</script>
```

### 5.3 沉浸式烹饪页 🍳

**页面路径**：`pages/cooking/index.vue`

#### 页面交互流程

```
选择食谱 → 进入烹饪模式（全屏） → 展示当前步骤卡片 + 语音播报
→ 用户语音/手动操作（下一步/上一步/暂停/倒计时）
→ 倒计时到提醒 → 最后一步完成 → 评分 → 记录烹饪历史
```

#### 页面布局

```
┌────────────────────────────────────┐
│  步骤指示器  (1/8)     [×] 退出    │
├────────────────────────────────────┤
│                                    │
│     📋 当前步骤卡片                │
│     "将鸡蛋打入碗中搅拌均匀"       │
│                                    │
│     ⏱ 倒计时: 03:00               │
│                                    │
├────────────────────────────────────┤
│  ◀ 上一步  │ 🎤 语音 │  下一步 ▶  │
├────────────────────────────────────┤
│  ⏸ 暂停  │  🔄 重复  │  ⏱ 计时  │
└────────────────────────────────────┘
```

#### 核心组件

| 组件                 | 职责                                    |
| -------------------- | --------------------------------------- |
| `StepCard.vue`       | 当前步骤展示卡片（指令文字 + 食材信息） |
| `TimerWidget.vue`    | 倒计时 UI（环形进度条 + 数字）          |
| `VoiceButton.vue`    | 语音录制按钮（长按录音，松开发送）      |
| `StepIndicator.vue`  | 步骤进度指示器                          |
| `CookingToolbar.vue` | 底部操作栏                              |

#### 语音录制与识别

```typescript
// composables/useVoice.ts
export function useVoice() {
  const recorderManager = uni.getRecorderManager();
  const isRecording = ref(false);

  const startRecord = () => {
    isRecording.value = true;
    recorderManager.start({
      format: "mp3",
      sampleRate: 16000,
      numberOfChannels: 1,
    });
  };

  const stopRecord = (): Promise<string> => {
    return new Promise((resolve) => {
      recorderManager.onStop((res) => {
        isRecording.value = false;
        resolve(res.tempFilePath);
      });
      recorderManager.stop();
    });
  };

  // 发送录音到后端进行 ASR + 指令处理
  const sendVoiceCommand = async (sessionId: string, filePath: string) => {
    const res = await uni.uploadFile({
      url: `${BASE_URL}/api/cooking/${sessionId}/command`,
      filePath,
      name: "audio",
      header: { Authorization: `Bearer ${uni.getStorageSync("token")}` },
    });
    return JSON.parse(res.data as string).data;
  };

  return { isRecording, startRecord, stopRecord, sendVoiceCommand };
}
```

#### 倒计时管理

```typescript
// composables/useTimer.ts
export function useTimer() {
  const remaining = ref(0); // 秒
  const isRunning = ref(false);
  let intervalId: number | null = null;

  const start = (seconds: number) => {
    remaining.value = seconds;
    isRunning.value = true;
    intervalId = setInterval(() => {
      remaining.value--;
      if (remaining.value <= 0) {
        stop();
        // 震动 + 音频提醒
        uni.vibrateLong();
        const audio = uni.createInnerAudioContext();
        audio.src = "/static/audio/timer-done.mp3";
        audio.play();
      }
    }, 1000);
  };

  const stop = () => {
    if (intervalId) clearInterval(intervalId);
    isRunning.value = false;
  };

  const formatTime = computed(() => {
    const min = Math.floor(remaining.value / 60);
    const sec = remaining.value % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  });

  return { remaining, isRunning, formatTime, start, stop };
}
```

### 5.4 视频解析食谱页 🎬

**页面路径**：`pages/recipe/from-video.vue`

#### 页面交互流程

```
选择视频/音频文件 → 校验格式和大小 → 上传 → 展示解析进度条
→ 轮询任务状态 → 解析完成 → 展示生成的食谱 → 进入详情
```

#### 关键逻辑

```typescript
const submitVideo = async () => {
  // 选择文件（条件编译处理平台差异）
  // #ifdef APP-PLUS
  const file = await chooseVideoFile(); // uni.chooseVideo
  // #endif

  // 校验
  if (file.size > 500 * 1024 * 1024) {
    return uni.showToast({ title: "文件不能超过 500MB", icon: "none" });
  }

  // 上传
  status.value = "uploading";
  const { jobId } = await uploadVideo(file.path);

  // 轮询进度
  status.value = "processing";
  const result = await pollJobStatus(jobId, {
    interval: 3000, // 每 3 秒查询
    timeout: 120000, // 最多等 2 分钟
  });

  if (result.status === "completed") {
    status.value = "done";
    recipe.value = result.recipe;
  } else {
    status.value = "failed";
    uni.showToast({ title: "解析失败，请重试", icon: "none" });
  }
};
```

---

## 6. 多端兼容

使用 Uni-app 条件编译处理平台差异：

```vue
<!-- 相机权限处理 -->
<!-- #ifdef APP-PLUS -->
<script>
// Android 需要动态申请相机权限
const granted = await uni.authorize({ scope: "scope.camera" });
</script>
<!-- #endif -->

<!-- #ifdef H5 -->
<script>
// H5 使用 input[type=file] 降级
</script>
<!-- #endif -->
```

**关键兼容点**：

| 功能     | iOS               | Android         | 处理方式         |
| -------- | ----------------- | --------------- | ---------------- |
| 拍照     | ✅                | ✅ 需动态权限   | 条件编译         |
| 录音     | ✅                | ✅ 需动态权限   | 条件编译         |
| 后台播报 | ✅ AVAudioSession | ✅ 前台服务     | 原生插件         |
| 推送     | APNs              | FCM/厂商通道    | UniPush 统一封装 |
| 视频选择 | 相册/文件         | 相册/文件管理器 | uni.chooseVideo  |
