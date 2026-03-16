# AGENTS.md

## Scope

This file applies to everything under `server/`.

Read the root docs first:

1. `../README.md`
2. `../LLM_HANDOFF.md`
3. `../PROJECT_CONTEXT.md`

Then use this file for backend-specific guidance.

## What This Package Is

`server` is the ChefMate backend. It owns:

- REST APIs under `/api/*`
- auth and permission checks
- domain business logic
- Prisma data access
- AI orchestration
- Swagger docs

This is the source of truth for business rules and data shape.

## First Files To Read

For general backend understanding, start here:

1. `src/main.ts`
2. `src/app.module.ts`
3. `prisma/schema.prisma`
4. `src/config/index.ts`

Then move into the relevant feature module under `src/modules/*` or `src/ai`.

## Directory Guide

- `src/main.ts`: bootstrap, global validation, filters, interceptors, Swagger, static uploads
- `src/app.module.ts`: top-level module registration
- `src/config`: environment-based configuration
- `src/common`: shared guards, decorators, filters, interceptors, DTO helpers, Prisma service
- `src/modules`: business modules grouped by feature
- `src/ai`: shared AI controller/service and prompt templates
- `prisma/schema.prisma`: domain entities and relations
- `test`: e2e test scaffolding

## Module Navigation

If the task is about:

- login or refresh token: `src/modules/auth`
- user profile or role: `src/modules/user`
- family group or invite flow: `src/modules/group`
- fridge recognition or inventory: `src/modules/fridge`
- recipe CRUD, recommend, ask-step, TTS, voice: `src/modules/recipe`
- cooking-session logic: `src/modules/cooking`
- shopping list collaboration: `src/modules/shopping`
- notifications: `src/modules/notification`
- stats/dashboard data: `src/modules/stats`
- family activity feed: `src/modules/feed`
- generic AI generation or prompt logic: `src/ai`

## Backend Conventions

- routes use `/api/...`
- auth is Bearer token based
- request validation is global and strict
- success responses are wrapped by a global interceptor
- frontends expect success as `code === 0`
- controller return values are not the final response envelope seen by clients
- Swagger is exposed at `/api/docs`

## Data Rules

- Prisma schema is authoritative for persistence shape
- many features are group-scoped, so check how the current user's group is resolved before changing queries
- soft-delete fields such as `deleted_at` exist on several models; preserve existing semantics when changing queries

## Change Strategy

- prefer editing one feature module end-to-end instead of scattering logic
- update DTOs when request/response contracts change
- check matching frontend service wrappers if you change API shape
- keep global response and auth conventions intact unless the task explicitly changes them

## Validation

Useful commands:

```bash
pnpm run start:dev
pnpm run test
pnpm run test:e2e
pnpm run lint
```

Run the narrowest useful validation first.

## Caveats

- `README.md` inside `server/` is generic Nest starter text
- `dist/` may contain generated output; prefer editing `src/`
- environment-dependent integrations include PostgreSQL, Redis, AI provider credentials, and optional object storage
