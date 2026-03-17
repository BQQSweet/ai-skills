# ChefMate Project Context

Language:

- English: `PROJECT_CONTEXT.md`
- 简体中文: `PROJECT_CONTEXT.zh-CN.md`

This file is a fast onboarding guide for humans and large language models.
Read this first if you need to understand the repository quickly without relying on chat history.

## 1. Project Summary

ChefMate is an intelligent family cooking assistant centered on three core ideas:

- manage household ingredients and fridge inventory
- generate or recommend recipes with AI
- support collaborative shopping and cooking inside a family group

This repository is a multi-app workspace with three independent subprojects:

- `server`: NestJS backend API and AI orchestration
- `chef-mate`: end-user mobile/web app built with uni-app + Vue 3
- `admin`: admin panel for recipe and management workflows built with Vue 3 + Vite + Arco Design

There is no single root package manager workspace. Each subproject has its own `package.json` and lockfile.

## 2. Repository Layout

```text
.
├── admin/        # Vue 3 admin panel
├── chef-mate/    # uni-app client for end users
├── server/       # NestJS backend + Prisma
└── docs/         # product, frontend, backend design documents
```

Useful documents:

- `task_plan.md`: current delivery priorities, completed items, and follow-up sequencing
- `docs/ChefMate-需求设计文档.md`: product goals, user stories, feature list
- `docs/ChefMate-前端开发设计文档.md`: frontend page flows and component ideas
- `docs/frontend-page-standards.md`: shared page componentization and frontend review standard for `chef-mate` and `admin`
- `docs/ChefMate-后端开发设计文档.md`: backend architecture, API conventions, AI module design

Important note: `server/README.md` is still the default Nest starter README, not a real project overview.

## 3. High-Level Architecture

```text
chef-mate (user app) ----\
                          >---- server (REST API + AI + Prisma + PostgreSQL)
admin (admin panel) -----/
```

Core flow:

1. `chef-mate` and `admin` call backend REST APIs under `/api/*`
2. `server` applies auth, validation, business logic, and AI orchestration
3. `server` persists business data through Prisma to PostgreSQL
4. some features also depend on Redis and external AI / object storage services

## 4. Subproject Details

### 4.1 `server`

Purpose:

- business API for authentication, groups, fridge items, recipes, cooking, shopping, stats, feed, notifications
- AI-facing endpoints for recipe generation, ingredient recognition, voice command parsing, and cooking assistance

Stack:

- NestJS 11
- Prisma 7
- PostgreSQL
- Redis
- OpenAI-compatible SDK and AI provider endpoints
- Swagger for API docs

Main entry points:

- `server/src/main.ts`: app bootstrap, global pipes, exception filter, response interceptor, Swagger, static uploads
- `server/src/app.module.ts`: top-level module wiring
- `server/prisma/schema.prisma`: domain data model
- `server/src/config/index.ts`: environment-driven app, JWT, Redis, AI, OSS config

Backend module map:

- `auth`: login, refresh token, auth flow
- `user`: profile and user-related APIs
- `group`: family group and invite flows
- `fridge`: ingredient recognition and fridge inventory
- `recipe`: recipe CRUD, recommendation, AI generation by ingredients, step Q&A, TTS, voice command parsing
- `cooking`: cooking-session style logic
- `shopping`: shared shopping lists and item purchase flow
- `task`: household collaborative tasks
- `notification`: user notifications
- `stats`: summary/statistics endpoints
- `feed`: family activity feed
- `ai`: admin-side AI recipe generation and shared AI service layer

Public API shape:

- route prefix: `/api/...`
- success envelope: backend is configured to return a unified structure through a global interceptor
- success convention used by both frontends: `code === 0`
- auth: Bearer token
- docs: Swagger served at `/api/docs`

Representative controllers:

- `server/src/modules/recipe/recipe.controller.ts`
- `server/src/modules/fridge/fridge.controller.ts`
- `server/src/ai/ai.controller.ts`

### 4.2 `chef-mate`

Purpose:

- primary end-user client for daily cooking, fridge management, recipe guidance, shopping, and profile flows

Stack:

- uni-app
- Vue 3
- Pinia
- uview-plus
- Tailwind/UnoCSS-related tooling
- Vite

Main entry points:

- `chef-mate/src/main.ts`: app creation, global component registration, Pinia, UI plugin setup
- `chef-mate/src/pages.json`: page routing and tab bar
- `chef-mate/src/services/request.ts`: unified request wrapper

Main user-facing pages:

- `pages/index/index`: home page with recommended recipes, fridge alerts, family feed
- `pages/fridge/index`: fridge inventory and scan/import flows
- `pages/fridge/ai-recipe`: AI recipe ideas from available ingredients
- `pages/recipe/cooking-guide`: immersive cooking guidance
- `pages/recipe/cooking-steps`: full recipe steps
- `pages/shopping/index`: shopping list
- `pages/profile/index`: profile and preference settings
- `pages/group/invite`: family invitation

Typical client service layer:

- `chef-mate/src/services/auth.ts`
- `chef-mate/src/services/fridge.ts`
- `chef-mate/src/services/recipe.ts`
- `chef-mate/src/services/shopping.ts`
- `chef-mate/src/services/group.ts`
- `chef-mate/src/services/feed.ts`

Behavioral conventions:

- API base URL comes from `VITE_API_BASE_URL`
- auth token is injected automatically in `src/services/request.ts`
- if token expires, client clears auth and redirects to the login page
- some file upload flows use `uni.uploadFile` or `fetch` directly instead of the generic request wrapper

Frontend prototype workflow:

- for new frontend pages, provide a Stitch design prompt before implementation planning
- ask the user for the target Stitch prototype or page ID before treating the page spec as final
- if the user already has a Stitch page ID, treat that prototype as the primary design reference
- if no Stitch prototype exists yet, propose creating or selecting one before implementation starts
- both `chef-mate` and `admin` also follow `docs/frontend-page-standards.md` as the default page structure and review standard

### 4.3 `admin`

Purpose:

- internal/admin interface, especially for recipe management

Stack:

- Vue 3
- Vite
- Arco Design Vue
- Vue Router
- Pinia
- Axios

Main entry points:

- `admin/src/main.ts`: app bootstrap
- `admin/src/router`: route definitions and guards
- `admin/src/api/interceptor.ts`: Axios base URL, auth header injection, error handling

Current notable screens:

- recipe list: `admin/src/views/recipe/list/index.vue`
- recipe create/edit: `admin/src/views/recipe/form/index.vue`

Behavioral conventions:

- dev mode proxies `/api` to `http://localhost:3000`
- optional explicit API base URL is read from `VITE_API_BASE_URL`
- frontend expects backend success format `code === 0`

## 5. Domain Model

The backend Prisma schema captures these core entities:

- `User`: account, role, dietary preferences
- `Group` and `GroupMember`: household/family grouping
- `FridgeItem`: ingredients stored by group, with expiry tracking
- `Recipe`: structured recipe, ingredients, steps, nutrition, tags, source metadata
- `RecipeFavorite` and `CookingHistory`: user-recipe interactions
- `ShoppingList` and `ShoppingItem`: collaborative buying flows
- `Task`: family task management
- `Notification`: user notifications
- `Feed`: family activity stream

This is a group-centric product. Many features are scoped by the current user's household group.

## 6. Runtime and Environment

### Backend

Important env vars are shown in `server/.env.example`:

- app: `PORT`, `NODE_ENV`
- database: `DATABASE_URL`
- redis: `REDIS_HOST`, `REDIS_PORT`
- auth: `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- AI: `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `AI_VISION_MODEL`
- object storage: `OSS_ENDPOINT`, `OSS_BUCKET`, `OSS_ACCESS_KEY`, `OSS_SECRET_KEY`

Defaults and assumptions:

- local backend port is `3000`
- Swagger is expected at `http://localhost:3000/api/docs`
- uploaded assets are served under `/uploads/`

### Frontends

Admin:

- local dev config points to `http://localhost:3000`
- Vite dev server also proxies `/api` to `http://localhost:3000`

Chef-mate:

- local API base URL is stored in `chef-mate/.env.development`
- `chef-mate/scripts/update-ip.sh` rewrites that file to the current LAN IP for real device testing

## 7. How To Run

Each app is started independently.

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

Other common chef-mate targets include `dev:mp-weixin` and `dev:app-plus`.

## 8. Where To Change Things

If you need to make a change, this mapping is usually the fastest entry point:

- login/auth issues: `server/src/modules/auth` and `chef-mate/src/services/auth.ts`
- fridge scan or item management: `server/src/modules/fridge` and `chef-mate/src/pages/fridge`
- recipe CRUD for admins: `admin/src/views/recipe`, `admin/src/api/recipe.ts`, `server/src/modules/recipe`
- AI recipe generation:
  - user-side ingredient-driven flow: `chef-mate/src/pages/fridge/ai-recipe.vue` and `server/src/modules/recipe`
  - admin-side prompt-driven flow: `admin/src/api/recipe.ts` and `server/src/ai`
- cooking guidance / voice control: `chef-mate/src/pages/recipe`, `chef-mate/src/services/recipe.ts`, `server/src/modules/recipe`
- shopping collaboration: `chef-mate/src/pages/shopping`, `chef-mate/src/services/shopping.ts`, `server/src/modules/shopping`
- family activity feed: `chef-mate/src/services/feed.ts` and `server/src/modules/feed`

## 9. Code Navigation Heuristics

This repo follows a fairly direct structure:

- backend business logic is grouped by module under `server/src/modules/*`
- DTOs live next to their module when needed
- mobile client APIs are wrapped in `chef-mate/src/services/*`
- admin APIs are wrapped in `admin/src/api/*`
- mobile pages are feature-first under `chef-mate/src/pages/*`
- admin pages are route/view-first under `admin/src/views/*`

If you are an LLM, use this reading order for most tasks:

1. identify the affected app: `server`, `chef-mate`, or `admin`
2. open the entry layer: controller/service/page/api module
3. inspect the matching service wrapper on the frontend
4. inspect Prisma schema if data shape or ownership is unclear
5. consult `docs/` only when business intent or feature scope is ambiguous

## 10. Current Caveats

- root-level project documentation was previously missing
- `server/README.md` is generic Nest starter text
- the repo is not a pnpm workspace; dependency management is per subproject
- the mobile app may rely on LAN IP rewriting for device debugging
- backend response wrapping is centralized, so raw controller return values are not the final HTTP shape seen by frontends

## 11. Short Mental Model

If you need the shortest correct summary:

- ChefMate is a three-part system: backend API, user app, admin panel
- the backend is the source of truth for domain logic and data modeling
- the user app is organized by feature pages and calls `/api/*` through service wrappers
- the admin app currently focuses on recipe management and also calls the same backend
- AI is not a separate deployment unit; it is embedded inside backend services and controllers
