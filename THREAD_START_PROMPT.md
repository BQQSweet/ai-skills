# Thread Start Prompt

This file contains reusable startup prompts for opening a new model thread on this repository.

## Chinese Standard Prompt

复制下面这段，作为新线程的第一条消息：

```text
你正在协作处理 ChefMate 仓库。请先不要急着改代码，先建立项目上下文，再开始执行任务。

请按这个顺序读取并理解仓库文档：
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. 如果你当前工作目录在某个子包下，再读取该子包的 AGENTS.md

仓库结构说明：
- server：NestJS 后端，负责业务逻辑、Prisma、数据库和 AI 集成
- chef-mate：uni-app 用户端
- admin：Vue 3 + Vite 管理后台

工作要求：
- 不要把 server/README.md 当作项目主文档，它只是 Nest 默认模板
- 修改前先定位目标子项目、入口文件、相关 service / module / page
- 如果接口或数据结构有变更，同时检查前后端对应调用
- 尽量做最小、聚焦、可验证的改动
- 注意当前工作区可能已经有未提交修改，不要误回滚不相关变更

完成上下文建立后，先用几句话告诉我：
1. 你理解的目标子项目
2. 你准备先看的文件
3. 你接下来会怎么做
```

## Chinese Short Prompt

适合已经知道要改哪个子包时使用：

```text
请先读取 README.md、LLM_HANDOFF.md、PROJECT_CONTEXT.md，以及当前子包下的 AGENTS.md，然后再开始处理任务。

请先确认：
- 你理解这个子包的职责
- 你准备检查的入口文件
- 这次改动会影响哪些模块

在没有建立上下文前，不要直接改代码。
```

## English Standard Prompt

Copy this into a new thread as the first message:

```text
You are working on the ChefMate repository. Do not jump into editing immediately. Build repository context first, then execute the task.

Read and understand these files in order:
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. If your current work is inside a subproject, also read that subproject's AGENTS.md

Repository shape:
- server: NestJS backend for business logic, Prisma, database access, and AI integrations
- chef-mate: uni-app end-user client
- admin: Vue 3 + Vite admin panel

Working rules:
- Do not treat server/README.md as the main project documentation; it is only the default Nest starter README
- Before editing, identify the target subproject, entry files, and related service / module / page
- If an API or data shape changes, also inspect the matching frontend/backend callers
- Prefer minimal, focused, verifiable changes
- Be careful with existing uncommitted changes in the working tree; do not revert unrelated work

After building context, first tell me briefly:
1. Which subproject you believe is relevant
2. Which files you will inspect first
3. What you plan to do next
```

## Per-App Variants

### `server`

```text
请先读取 README.md、LLM_HANDOFF.md、PROJECT_CONTEXT.md、server/AGENTS.md，然后从 server/src/main.ts、server/src/app.module.ts、server/prisma/schema.prisma 和目标模块开始定位问题。
```

### `admin`

```text
请先读取 README.md、LLM_HANDOFF.md、PROJECT_CONTEXT.md、admin/AGENTS.md，然后从 admin/src/main.ts、admin/src/router、admin/src/api/interceptor.ts 和目标页面开始定位问题。
```

### `chef-mate`

```text
请先读取 README.md、LLM_HANDOFF.md、PROJECT_CONTEXT.md、chef-mate/AGENTS.md，然后从 chef-mate/src/main.ts、chef-mate/src/pages.json、chef-mate/src/services/request.ts 和目标页面开始定位问题。
```

## Scenario Prompts

### Fix Bug

Chinese:

```text
你正在处理 ChefMate 仓库里的一个 bug。请先建立上下文，再开始修复，不要直接盲改。

请按顺序读取：
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. 相关子包下的 AGENTS.md

请优先做这些事：
- 判断 bug 属于 `server`、`chef-mate` 还是 `admin`
- 找到最可能的入口文件、调用链和数据流
- 先尝试定位根因，不要只做表面补丁
- 如果 bug 涉及接口或数据结构，检查前后端两侧是否一致
- 如果仓库已有未提交修改，不要回滚与当前 bug 无关的变更

开始修复前，请先告诉我：
1. 你认为 bug 最可能在哪个子项目
2. 你准备先看的文件
3. 你打算如何验证修复是否生效
```

English:

```text
You are fixing a bug in the ChefMate repository. Build context first, then debug. Do not jump straight into patching.

Read in this order:
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. The relevant subproject AGENTS.md

Priorities:
- decide whether the bug belongs to `server`, `chef-mate`, or `admin`
- trace the most likely entry file, call path, and data flow
- find the root cause instead of applying a surface-level patch
- if the bug touches API or data shape, inspect both frontend and backend sides
- do not revert unrelated uncommitted work

Before editing, tell me briefly:
1. which subproject you think is most relevant
2. which files you will inspect first
3. how you plan to verify the fix
```

### Build Feature

Chinese:

```text
你正在为 ChefMate 增加一个功能。请先建立上下文，再开始实现。

请按顺序读取：
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. 相关子包下的 AGENTS.md

实现要求：
- 先明确功能属于哪个子项目，必要时说明是否会跨前后端
- 先找现有相邻功能的实现方式，尽量沿用现有模式
- 如果涉及接口、DTO、类型或数据结构，请同步检查调用链
- 尽量做最小且完整的端到端实现，不要留明显断点

开始编码前，请先告诉我：
1. 你理解的功能归属
2. 你准备复用或参考哪些现有文件
3. 这次实现预计会改动哪些模块
```

English:

```text
You are adding a feature to the ChefMate repository. Build context first, then implement.

Read in this order:
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. The relevant subproject AGENTS.md

Implementation rules:
- identify which subproject owns the feature and whether it spans frontend/backend
- find adjacent existing implementations and follow current patterns
- if APIs, DTOs, types, or data shapes change, inspect the full call chain
- prefer a minimal but complete end-to-end implementation

Before coding, tell me briefly:
1. where you believe the feature belongs
2. which existing files you will reuse or reference
3. which modules you expect to touch
```

### Inspect Structure

Chinese:

```text
你现在的任务是理解 ChefMate 项目结构，而不是立刻改代码。

请按顺序读取：
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. 如有需要，再读相关子包下的 AGENTS.md

请重点输出：
- 仓库的整体结构和三端职责
- 当前任务相关的子项目、核心入口文件和目录职责
- 功能到代码位置的映射
- 哪些文档是权威入口，哪些文档只是辅助资料

除非我明确要求，否则不要直接修改代码。先把你的结构理解总结给我。
```

English:

```text
Your task is to understand the ChefMate repository structure, not to edit code immediately.

Read in this order:
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. If useful, the relevant subproject AGENTS.md

Focus your response on:
- the overall repository structure and responsibilities of the three apps
- the relevant subproject, main entry files, and directory responsibilities
- a mapping from features to code locations
- which documents are authoritative and which are only supporting references

Do not edit code unless I explicitly ask for it. First summarize your understanding of the structure.
```

### Do Review

Chinese:

```text
你现在的任务是对 ChefMate 相关代码做 review。请先建立上下文，再进入评审，不要急着改代码。

请按顺序读取：
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. 相关子包下的 AGENTS.md

评审要求：
- 重点找 bug、行为回归、接口不一致、数据流问题、缺少校验、缺少测试覆盖
- 先给出 findings，再给简短总结
- 如果没有发现明确问题，也要说明剩余风险和验证盲区
- 除非我明确要求，不要直接修代码

开始 review 前，请先告诉我：
1. 你认为这段代码属于哪个子项目和模块
2. 你会先检查哪些文件和调用关系
3. 你这次 review 的重点风险点是什么
```

English:

```text
Your task is to review ChefMate code. Build context first, then review. Do not jump into code changes unless I ask.

Read in this order:
1. README.md
2. LLM_HANDOFF.md
3. PROJECT_CONTEXT.md
4. The relevant subproject AGENTS.md

Review priorities:
- focus on bugs, regressions, API mismatches, data flow issues, missing validation, and missing test coverage
- present findings first, then a short summary
- if you find no clear issue, still state the residual risks and testing gaps
- do not fix code unless I explicitly request it

Before reviewing, tell me briefly:
1. which subproject and module this code belongs to
2. which files and call paths you will inspect first
3. what risk areas you plan to focus on
```

## Suggested Usage

- Use the standard prompt for a brand new thread
- Use the short prompt when the model already knows the task scope
- Use the per-app variant when you want to force the thread into one subproject quickly
- Use the scenario prompts when you want to shape the thread around a specific task type
