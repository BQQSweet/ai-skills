# AGENTS.md

## Scope

This file applies to everything under `admin/`.

Read the root docs first:

1. `../README.md`
2. `../LLM_HANDOFF.md`
3. `../PROJECT_CONTEXT.md`

Then use this file for admin-specific guidance.

## What This Package Is

`admin` is the ChefMate management panel.
It currently centers on recipe management and uses the same backend API as the user app.

## First Files To Read

Start here for orientation:

1. `src/main.ts`
2. `src/router/index.ts`
3. `src/api/interceptor.ts`
4. `src/router/routes/modules/recipe.ts`

Then open the target screen in `src/views/*` and the matching API wrapper in `src/api/*`.

## Directory Guide

- `src/main.ts`: app bootstrap
- `src/router`: routes, guards, menu wiring
- `src/api`: Axios wrappers and request interception
- `src/views`: page-level screens
- `src/components`: reusable UI pieces
- `src/store`: Pinia stores
- `src/locale`: i18n text
- `src/layout`: app shell
- `config`: Vite configuration and plugins

## Feature Navigation

If the task is about:

- login flow: `src/views/login`, `src/router/guard`, `src/store/modules/user`
- recipe list or search: `src/views/recipe/list`, `src/api/recipe.ts`
- recipe create/edit: `src/views/recipe/form`, `src/api/recipe.ts`
- auth header or global API handling: `src/api/interceptor.ts`
- route availability or menu behavior: `src/router`, `src/router/app-menus`

## Frontend Conventions

- Vue 3 + Vite + Arco Design Vue
- data fetching goes through `src/api/*`
- auth token injection and global error handling live in `src/api/interceptor.ts`
- backend success is interpreted as `code === 0`
- dev mode proxies `/api` to `http://localhost:3000`

## Change Strategy

- prefer keeping view logic inside `src/views/*` and request logic inside `src/api/*`
- if you change backend contracts, update the TypeScript interfaces in `src/api/*`
- preserve existing Arco UI patterns unless the task explicitly asks for redesign
- avoid introducing a second request abstraction

## Validation

Useful commands:

```bash
pnpm run dev
pnpm run build
pnpm run type:check
```

For most UI or API wiring changes, `pnpm run type:check` is the fastest initial validation.

## Caveats

- the admin panel appears narrower in scope than the mobile app and is not the source of truth for product behavior
- some files in `src/mock` exist, but real backend API usage is already enabled in the app bootstrap
