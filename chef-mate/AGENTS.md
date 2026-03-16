# AGENTS.md

## Scope

This file applies to everything under `chef-mate/`.

Read the root docs first:

1. `../README.md`
2. `../LLM_HANDOFF.md`
3. `../PROJECT_CONTEXT.md`

Then use this file for client-app-specific guidance.

## What This Package Is

`chef-mate` is the end-user client.
It covers home, fridge, AI recipe generation, cooking guidance, shopping, profile, and family group flows.

## First Files To Read

Start here:

1. `src/main.ts`
2. `src/pages.json`
3. `src/services/request.ts`
4. the target page under `src/pages/*`

Then inspect the matching service wrapper under `src/services/*` and related store under `src/stores/*` if state is involved.

## Directory Guide

- `src/main.ts`: app bootstrap, global components, Pinia, UI plugin setup
- `src/pages.json`: page registry and tab bar
- `src/pages`: page-level feature screens
- `src/services`: API wrappers around backend endpoints
- `src/stores`: Pinia stores
- `src/components`: reusable UI components
- `src/composables`: reusable behavior logic
- `src/types`: shared client-side types
- `src/utils`: storage, env, permissions, feature helpers
- `src/styles`: shared styles

## Feature Navigation

If the task is about:

- login and auth state: `src/pages/login`, `src/services/auth.ts`, `src/stores/user.ts`
- homepage recommendations or feed: `src/pages/index`, `src/services/recipe.ts`, `src/services/feed.ts`
- fridge item management: `src/pages/fridge`, `src/services/fridge.ts`
- AI recipe ideas from ingredients: `src/pages/fridge/ai-recipe.vue`, `src/services/recipe.ts`
- cooking guide, timers, or voice commands: `src/pages/recipe`, `src/composables`, `src/services/recipe.ts`
- shopping list: `src/pages/shopping`, `src/services/shopping.ts`, `src/stores/shopping.ts`
- group invite or group state: `src/pages/group`, `src/services/group.ts`, `src/stores/group.ts`
- profile and preferences: `src/pages/profile`, `src/stores/user.ts`

## Client Conventions

- API base URL comes from `VITE_API_BASE_URL`
- request auth injection and token refresh behavior live in `src/services/request.ts`
- many flows depend on backend success meaning `code === 0`
- some upload or media flows bypass the generic request wrapper and use `uni.uploadFile` or `fetch`
- page routing is configured in `src/pages.json`, not a standard Vue Router setup

## Change Strategy

- keep page concerns in `src/pages/*`, API wiring in `src/services/*`, and shared logic in `src/composables/*`
- when changing API shapes, update the local types and the matching backend contract
- prefer following existing uni-app patterns instead of introducing web-only assumptions
- check mobile, H5, and upload-related behavior before changing platform-sensitive code

## Validation

Useful commands:

```bash
pnpm run dev:h5
pnpm run dev:mp-weixin
pnpm run type-check
```

Use the narrowest platform command that matches the task.

## Caveats

- `scripts/update-ip.sh` rewrites `.env.development` for LAN device testing
- platform differences matter for media, recording, upload, and navigation behavior
- there are prototype files under `src/prototype`; treat them as references unless the task explicitly targets them
