# LLM Handoff

Language:

- English: `LLM_HANDOFF.md`
- 简体中文: `LLM_HANDOFF.zh-CN.md`

Read this file for the shortest useful summary of the repository.

## What This Repo Is

ChefMate is a 3-app system:

- `server`: NestJS backend, Prisma, PostgreSQL, Redis, AI integrations
- `chef-mate`: uni-app end-user client
- `admin`: Vue 3 + Vite admin panel

Both frontends call the same backend API under `/api/*`.

## Read Order

Use this order unless the task is already very specific:

1. `README.md`
2. `PROJECT_CONTEXT.md`
3. target app entry file
4. target feature module/page/service
5. `docs/` only if product intent is unclear

## Target App Entry Files

- backend bootstrap: `server/src/main.ts`
- backend module wiring: `server/src/app.module.ts`
- backend schema: `server/prisma/schema.prisma`
- mobile app entry: `chef-mate/src/main.ts`
- mobile routes: `chef-mate/src/pages.json`
- admin app entry: `admin/src/main.ts`

## Fast Routing Guide

If the task is about:

- auth/login: `server/src/modules/auth`, `chef-mate/src/services/auth.ts`
- recipe CRUD: `server/src/modules/recipe`, `admin/src/views/recipe`, `admin/src/api/recipe.ts`
- AI recipe generation:
  - user flow: `chef-mate/src/pages/fridge/ai-recipe.vue`, `chef-mate/src/services/recipe.ts`, `server/src/modules/recipe`
  - admin flow: `admin/src/api/recipe.ts`, `server/src/ai`
- fridge scan/items: `server/src/modules/fridge`, `chef-mate/src/pages/fridge`, `chef-mate/src/services/fridge.ts`
- cooking guide/voice: `chef-mate/src/pages/recipe`, `chef-mate/src/services/recipe.ts`, `server/src/modules/recipe`
- shopping/group/feed: matching folders in `chef-mate/src/services/*` and `server/src/modules/*`

## API Conventions

- backend routes use `/api/...`
- frontend success convention is `code === 0`
- auth uses Bearer token
- Swagger lives at `http://localhost:3000/api/docs`

## Run Commands

Backend:

```bash
cd server
pnpm install
pnpm run start:dev
```

Admin:

```bash
cd admin
pnpm install
pnpm run dev
```

Chef-mate:

```bash
cd chef-mate
pnpm install
pnpm run dev:h5
```

## Important Caveats

- this is not a root pnpm workspace
- `server/README.md` is generic starter text
- `chef-mate/.env.development` may be rewritten for LAN device testing
- backend response format is wrapped globally, not manually in each controller
