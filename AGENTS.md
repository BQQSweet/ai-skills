# AGENTS.md

## First Read

Before making assumptions about this repository, read these files in order:

1. `README.md`
2. `LLM_HANDOFF.md`
3. `PROJECT_CONTEXT.md`

Use `PROJECT_CONTEXT.md` for complete repo understanding.
Use `LLM_HANDOFF.md` when you need the shortest reliable summary.

Chinese mirror documents are available for human readers:

- `README.zh-CN.md`
- `LLM_HANDOFF.zh-CN.md`
- `PROJECT_CONTEXT.zh-CN.md`

Reusable startup prompt:

- `THREAD_START_PROMPT.md`

## Repository Shape

This repo contains three independent subprojects:

- `server`: backend API and AI logic
- `chef-mate`: end-user app
- `admin`: admin panel

Do not assume a root package workspace. Install and run each subproject separately.

## Navigation Rules

- For backend work, start in `server/src/modules/*` and `server/prisma/schema.prisma`
- For mobile/client work, start in `chef-mate/src/pages/*` and `chef-mate/src/services/*`
- For admin work, start in `admin/src/views/*` and `admin/src/api/*`
- Consult `docs/` only when business intent or feature scope is ambiguous

## Working Norms

- Prefer minimal, scoped changes
- Respect existing module boundaries
- Do not treat `server/README.md` as authoritative project documentation
- Be aware the working tree may already contain unrelated user changes

## Shared Context Goal

If you create new project-wide context that would help future agents, update one of these files rather than keeping that knowledge only in chat:

- `README.md`
- `PROJECT_CONTEXT.md`
- `LLM_HANDOFF.md`
