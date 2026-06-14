# S9 Data Model

## Runtime Services

- `frontend`: React/Vite or current frontend app.
- `api`: NestJS API.
- `worker`: BullMQ worker.
- `postgres`: persistent relational database.
- `redis`: queue backend.
- `minio`: local S3-compatible object storage.

## Required Environment Groups

- App: `APP_ENV`, `APP_BASE_URL`
- API: `API_PORT`, `CORS_ORIGIN`
- Database: `DATABASE_URL`
- Queue: `REDIS_URL`
- Storage: `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE`
- Text proxy: `TEXT_PROXY_BASE_URL`, `TEXT_PROXY_API_KEY`

## Persistence Rules

- Postgres and MinIO must use named volumes.
- Redis can be persistent for local convenience, but queue truth should be recoverable from PostgreSQL task state.
- Generated media is retained until explicit user deletion.
