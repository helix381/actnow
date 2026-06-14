# S9 Plan

## Implementation Order

1. Add `.env.example` matching `spec/env.md`.
2. Add `docker-compose.yml` with Postgres, Redis, MinIO, API, worker and frontend.
3. Add migration and seed commands.
4. Add health endpoints for API and worker readiness.
5. Add smoke test script or documented command sequence.

## Engineering Notes

- S9 should run in parallel with S1-S6 because deployment constraints affect storage, queue, env and worker boundaries.
- Use PostgreSQL as data truth source.
- Use Redis/BullMQ for async queue.
- Use MinIO locally to match S3 object storage behavior.
- Keep demo single-user mode, but do not design schema in a way that blocks future User/Workspace.

## Verification

- `docker compose up --build`
- API health returns ok.
- Database migration succeeds.
- Seed creates demo project.
- Worker consumes one test generation task.
- Frontend loads workspace and calls API.
