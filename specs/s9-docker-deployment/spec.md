# S9 Docker Deployment Spec

## Goal

团队能用单机 Docker Compose 启动 ActNow MVP 所需的基础服务，并完成 S1-S6 的后端最小冒烟验证。

## Scope

- Docker Compose for frontend, API, worker, PostgreSQL, Redis and MinIO/S3-compatible storage.
- Environment variable template.
- Database migration and seed command.
- Worker connectivity to Redis queue and storage.
- Local smoke test checklist.

## Acceptance

- 新环境复制 `.env.example` 后能启动全部服务。
- API 能连接 PostgreSQL、Redis 和 MinIO。
- Worker 能消费一个测试任务。
- Frontend 能访问 API health endpoint。
- S1-S6 核心路径能在本地 compose 环境跑通。

## Out of Scope

- 多服务器部署。
- Kubernetes。
- 登录、权限和团队空间隔离。
- CDN 正式域名与对象生命周期自动清理。
