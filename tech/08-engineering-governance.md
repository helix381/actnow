# 工程治理与 Spec 管理

## Git 工作流

| 项 | 规则 | 待确认 |
| --- | --- | --- |
| 默认分支 | `main` | 仓库初始化时确认 |
| 功能分支 | `feature/<slice-id>-<scope>`，例如 `feature/s5-human-loop-keyframes` | 是 |
| 修复分支 | `fix/<scope>` | 是 |
| 提交粒度 | 一个提交覆盖一个清晰变更点，避免前后端/文档/格式混杂 | 否 |
| PR 策略 | 小 PR，带截图/接口说明/测试说明；P0 切片必须列验收路径 | 是 |
| Review 要求 | 至少自检清单通过；关键 API/DB/状态机变更需要二次 review | 是 |

## 版本与发布

| 项 | 规则 | 待确认 |
| --- | --- | --- |
| 版本号 | demo 阶段用 `v0.x.y-demo`，MVP 用 SemVer | 是 |
| 标签 | `v0.1.0-demo`、`v0.1.0-mvp` | 是 |
| 环境 | local / dev / staging / prod | 否 |
| 发布记录 | release note + PRD append log + tech planning log | 否 |
| 回滚 | git tag 回滚 + 数据库 migration 回滚/重建策略 + feature flag | 是 |

## 部署与 Docker

| 模块 | 默认方案 | 说明 | 待确认 |
| --- | --- | --- | --- |
| 前端 | Node build + 静态/Next/Vite 服务 | 具体框架随工程仓库确认 | 是 |
| 后端 API | Docker 容器运行 NestJS | 暴露 API，读取 `.env` | 是 |
| PostgreSQL | Docker Compose local/dev；生产可切托管 | Prisma migration 管理 schema | 是 |
| Redis/Queue | Docker Compose local/dev；生产可切托管 | BullMQ 推荐方案 | TQ5 |
| 对象存储 | MinIO local/dev；生产 S3 兼容 | 统一 S3 SDK | 是 |
| Worker | 独立容器 | 处理生成任务、合成导出、长任务 | 是 |
| Reverse proxy | Nginx/Caddy 可选 | HTTPS、静态资源、API 转发 | 是 |
| 日志 | stdout + 后续日志采集 | 先保证 task_id/thread_id 可追踪 | 否 |

## Spec 真源

| Spec | 建议路径 | 真源 | 变更规则 |
| --- | --- | --- | --- |
| API spec | `spec/openapi.yaml` + `tech/03-api-contract.md` | `spec/openapi.yaml` 为机器真源，`tech/03` 为解释层 | 先改 spec，再改前后端 |
| 数据库 schema | `prisma/schema.prisma` + `spec/database.md` | `prisma/schema.prisma` 为实现真源，`spec/database.md` 为规划真源 | migration 必须关联需求/PR |
| 事件/任务 spec | `spec/events.md` + `tech/04-data-and-state.md` | `spec/events.md` | 状态机变化必须同步 |
| 环境变量 spec | `.env.example` + `spec/env.md` | `.env.example` | 不写密钥，只写变量名和用途 |
| 文件存储 spec | `spec/storage.md` + `tech/02-backend-plan.md` | `spec/storage.md` | key 规则和权限变化必须记录 |
| Feature spec | `specs/<feature>/` | 每个 P0 切片自己的 `spec.md/plan.md/tasks.md` | P0 需求变更先进 feature spec |

## 迁移与兼容

| 类型 | 规则 | 验收 |
| --- | --- | --- |
| 数据库迁移 | 每次 schema 变更生成 migration，记录是否破坏兼容 | 本地可 migrate/reset |
| API 变更 | 破坏性变更必须标注影响页面和调用方 | 前端类型/契约同步 |
| Mock 数据 | mock 与真实响应字段保持一致 | 联调前可替换 |
| Seed 数据 | 保留演示路径需要的数据 | 新环境可一键初始化 |
| Prompt schema | prompt package 结构变更必须兼容旧 task 或写迁移策略 | 旧 task 可查看/重新导出 |

## 工程自检

- [ ] 当前需求是否有对应分支或 PR。
- [ ] API、DB、事件、环境变量、存储 spec 是否有真源。
- [ ] 前后端是否引用同一份接口字段定义或生成类型。
- [ ] 数据库迁移是否可回滚或可重建。
- [ ] PR 是否说明测试方式、截图或接口验证结果。
- [ ] Docker Compose 是否能启动 API、DB、Redis、对象存储和 worker。
- [ ] 长任务日志是否包含 `task_id`、`project_id`、`thread_id`。
