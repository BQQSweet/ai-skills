# ChefMate

Language:

- English: `README.md`
- 简体中文: `README.zh-CN.md`

ChefMate is an intelligent family cooking assistant with three connected applications:

- `server`: backend API, AI orchestration, and database access
- `chef-mate`: end-user client for cooking, fridge, shopping, and household collaboration
- `admin`: admin panel for recipe and management workflows

If you are a new contributor or an LLM, start with `LLM_HANDOFF.md` for the shortest overview, then read `PROJECT_CONTEXT.md` for the fuller repo map.
If you prefer Chinese, use `README.zh-CN.md`, `LLM_HANDOFF.zh-CN.md`, and `PROJECT_CONTEXT.zh-CN.md`.

## Quick Start

This repository is not a single package workspace. Each subproject is installed and started separately.

### Backend

```bash
cd server
pnpm install
pnpm run start:dev
```

Backend default URL:

- `http://localhost:3000`

Swagger docs:

- `http://localhost:3000/api/docs`

### Admin

```bash
cd admin
pnpm install
pnpm run dev
```

### Chef-mate

```bash
cd chef-mate
pnpm install
pnpm run dev:h5
```

For device debugging, `chef-mate/scripts/update-ip.sh` updates `chef-mate/.env.development` to the current LAN IP.

## Repository Structure

```text
.
├── admin/        # Vue 3 + Vite admin panel
├── chef-mate/    # uni-app + Vue 3 end-user client
├── server/       # NestJS + Prisma backend
├── docs/         # product and design docs
└── PROJECT_CONTEXT.md
```

## Documentation Guide

- `PROJECT_CONTEXT.md`: best single-file onboarding context for humans and LLMs
- `PROJECT_CONTEXT.md` also records the frontend Stitch prototype workflow for new pages
- `docs/frontend-page-standards.md`: shared frontend page structure and componentization standard for `chef-mate` and `admin`
- `task_plan.md`: current execution priorities, completed items, and P0 / P1 / P2 scheduling advice
- `THREAD_START_PROMPT.md`: reusable startup prompt for opening a new model thread
- `docs/ChefMate-需求设计文档.md`: product goals, user stories, feature scope
- `docs/ChefMate-前端开发设计文档.md`: frontend flow and page design
- `docs/ChefMate-后端开发设计文档.md`: backend module and AI design

## Architecture Summary

Both frontends call the same backend API under `/api/*`.

- `chef-mate` uses service wrappers under `src/services`
- `admin` uses Axios wrappers under `src/api`
- `server` organizes business logic by module under `src/modules`
- `server/prisma/schema.prisma` defines the core domain model

Main business areas:

- authentication and user management
- family groups and invitations
- fridge inventory and ingredient recognition
- recipe CRUD, recommendation, and AI generation
- cooking guidance and voice-related recipe assistance
- collaborative shopping, tasks, notifications, and family activity feed

## Common Entry Points

- backend bootstrap: `server/src/main.ts`
- backend module wiring: `server/src/app.module.ts`
- mobile app entry: `chef-mate/src/main.ts`
- mobile routes: `chef-mate/src/pages.json`
- admin app entry: `admin/src/main.ts`
- admin routes: `admin/src/router`

## Notes

- `server/README.md` is still the default Nest starter README
- backend success responses are expected as `code === 0`
- some local development flows depend on Redis, PostgreSQL, AI provider credentials, and optional object storage settings
