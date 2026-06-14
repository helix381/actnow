# Implementation Kickoff

## Start Date

2026-06-12

## Current Mode

Parallel worker kickoff from planning/prototype workspace into implementation monorepo.

## Active Worker Lanes

| Lane | Scope | Write Boundary | First Goal | Status |
| --- | --- | --- | --- | --- |
| Frontend | S1/S2 web shell | `apps/web/**` | React + Vite + React Flow skeleton | completed |
| Backend | S1/S2 API and data | `apps/api/**`, `apps/worker/**`, `packages/db/**`, `packages/shared/**` | NestJS + Prisma + BullMQ skeleton | completed |
| Deploy | S9 local compose | `.env.example`, `docker-compose.yml`, Dockerfiles, `docker/**` | Docker Compose config and local services | completed |

## Integration Rules

- Do not edit `prototype/**` during implementation kickoff. It remains design/prototype reference.
- PostgreSQL is business state truth source.
- Redis/BullMQ is execution queue only.
- React Flow node `data.ref` points to business objects; canvas nodes are not business truth.
- Generated images, videos and exports are retained until explicit user deletion.
- Current generated version is selected by user confirmation.
- MVP remains demo single-user mode.

## First Integration Gate

The first gate passes when:

- `npm.cmd install` succeeds.
- `npm.cmd run build --workspaces --if-present` succeeds or has documented scaffold-only blockers.
- `docker compose config` succeeds.
- API exposes health and S1/S2 route skeletons.
- Web app can start and show S1/S2 flow with API fallback or live API.

## Verification Result

| Check | Result | Notes |
| --- | --- | --- |
| `npm.cmd install` | pass | Root npm workspaces lockfile created. |
| `npm.cmd run build --workspaces --if-present` | pass | API, web, worker, db and shared packages compile. |
| `npm.cmd audit --audit-level=moderate` | pass | 0 vulnerabilities after non-forced audit fix. |
| Prisma schema validate | pass | `packages/db/prisma/schema.prisma` is valid. |
| Compose YAML parse | pass | Services: api, frontend, minio, minio-init, postgres, redis, worker. |
| `docker compose config` | not run | Current machine has no `docker` command. |
| Web dev server | running | `http://127.0.0.1:5173/` from `apps/web`. |

## Integration Fixes Applied

- API default port changed from `3001` to `3000` to match `API_URL`, Vite proxy and Compose.
- Frontend script lock request now sends numeric `script_version: 1`.
- API Prisma JSON writes now cast to Prisma JSON input types.
- Worker BullMQ connection now uses a connection options object instead of passing an `ioredis` instance.
- Nest dependencies upgraded to the audited safe line.
- `POST /projects` now returns `WorkspaceAggregate`, matching the frontend validation shell and OpenAPI.
- `GET /agent/threads/:threadId/events` and `POST /agent/threads/:threadId/messages` are implemented as minimal ActNow Harness endpoints.
- Dockerfiles now install npm workspaces correctly with `npm ci`, build packages, and run compiled app entrypoints.
- `.dockerignore` added to keep local `node_modules`, build output and env files out of Docker build context.

## Current Backend Status

| Area | Status | Notes |
| --- | --- | --- |
| S1 project creation | implemented_pending_e2e | Creates demo project, episode, thread, first message and event. |
| S1 workspace aggregate | implemented_pending_e2e | Returns normalized `WorkspaceAggregate`, not raw Prisma objects. |
| S1 agent events | implemented_pending_e2e | Thread events can be listed; user messages can be appended. |
| S2 script lock | implemented_pending_e2e | Creates or reuses scene, shot and canvas document. |
| S2 canvas save | implemented_pending_e2e | Uses version conflict check. |
| S9 Docker | implemented_pending_docker | Compose and Dockerfiles are ready for a machine with Docker. |

## Current Blockers

- This machine has no `docker` command, so real Postgres/Redis/MinIO smoke test is still pending.
- API has not yet been tested against a live PostgreSQL instance in this environment.
- Frontend remains a validation shell, not the final prototype adaptation.
