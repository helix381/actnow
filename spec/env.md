# Environment Variables Spec

Do not store real secrets in this file. `.env.example` should mirror these names without real values.

| Variable | Purpose | local | dev | prod | Required |
| --- | --- | --- | --- | --- | --- |
| `NODE_ENV` | Runtime mode | development | development | production | yes |
| `APP_ENV` | App environment label | local | dev | prod | yes |
| `APP_URL` | Frontend base URL | http://localhost:5173 | dev URL | prod URL | yes |
| `API_URL` | API base URL | http://localhost:3000/api | dev API | prod API | yes |
| `DATABASE_URL` | PostgreSQL connection | docker postgres | dev postgres | prod postgres | yes |
| `REDIS_URL` | Redis/BullMQ connection | docker redis | dev redis | prod redis | yes |
| `S3_ENDPOINT` | S3-compatible endpoint | http://localhost:9000 | dev object storage | prod object storage | yes |
| `S3_REGION` | S3 region | us-east-1 | configured | configured | yes |
| `S3_ACCESS_KEY_ID` | S3 access key | local only | secret | secret | yes |
| `S3_SECRET_ACCESS_KEY` | S3 secret | local only | secret | secret | yes |
| `S3_BUCKET_UPLOADS` | Upload bucket | actnow-uploads | actnow-dev-uploads | actnow-prod-uploads | yes |
| `S3_BUCKET_GENERATED` | Generated assets bucket | actnow-generated | actnow-dev-generated | actnow-prod-generated | yes |
| `S3_BUCKET_EXPORTS` | Export bucket | actnow-exports | actnow-dev-exports | actnow-prod-exports | yes |
| `TEXT_MODEL_PROXY_BASE_URL` | Company OpenAI-compatible proxy | configured | configured | configured | yes |
| `TEXT_MODEL_PROXY_API_KEY` | Company proxy key if needed | secret | secret | secret | no/yes by proxy |
| `DEFAULT_TEXT_MODEL` | Default LLM model id | configured | configured | configured | yes |
| `GENERATION_DEFAULT_BACKEND_MODE` | Default image/video mode | human_loop | human_loop | real_api/human_loop | yes |
| `DEMO_SINGLE_USER` | Enable single-user demo mode | true | true | false | yes |
| `DEMO_USER_ID` | Seed user id | demo-user | demo-user | empty | local/dev |
| `JWT_SECRET` | Future auth secret | local placeholder | secret | secret | when auth enabled |
| `LOG_LEVEL` | Logging level | debug | info | info/warn | yes |
| `BULLMQ_PREFIX` | Queue prefix | actnow-local | actnow-dev | actnow-prod | yes |

## Docker Compose Services

- `api`: NestJS API.
- `worker`: BullMQ workers.
- `postgres`: PostgreSQL.
- `redis`: Redis.
- `minio`: local S3-compatible object storage.
- `frontend`: React app, if served separately in local compose.
