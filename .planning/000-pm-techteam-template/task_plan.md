# Task Plan: PM-TechTeam

## Goal

把 ActNow / AIGC-Platform 的 PRD、Canvas 专项 PRD 和 HTML 原型转成可评审、可拆分、可并行执行的前后端工程规划 draft。

## Current Phase

Phase 4

## Phases

| Phase | Goal | Status |
| --- | --- | --- |
| Phase 1: Requirements & Discovery | 收集 PRD、Canvas PRD、原型、原型增量、设计系统和 QA 结论，判断开工条件 | completed |
| Phase 2: Planning & Structure | 初始化 `tech/`、`spec/`、`specs/`、`.planning/`，建立真源和待确认问题 | completed |
| Phase 3: Spec / PM-TechTeam Update | 补齐前端、后端、API、数据状态、联调切片、工程治理、并行执行计划 | completed |
| Phase 4: Verification | 校验每个 P0 页面/动作是否追溯到 API、数据对象、状态和后端处理 | in_progress |
| Phase 5: Delivery | 输出可进入研发评审的 draft，并列出不能排期的残留风险 | pending |

## Key Questions

| Question | Status |
| --- | --- |
| PRD 与原型差异是否按“原型事实优先、PRD 回写走变更包”处理？ | 已确认 |
| 生产画布是否锁定 React Flow？ | 已确认 |
| 后端是否按 NestJS + Prisma + PostgreSQL + S3/MinIO + Redis/BullMQ 推进？ | 已确认 |
| 部署是否默认 Docker Compose？ | 已确认 |
| Agent 编排是否先做 ActNow Harness 数据结构和事件日志？ | 已确认 |
| `prototype/design-model.json` 是否作为当前工程真源？ | 已确认：不采用页面流 |
| 生成文件是否自动清理？ | 已确认：默认保留，用户主动删除才删 |
| 是否继续拆 S7-S9？ | 已确认：继续拆 |

## Decisions Made

| Decision | Rationale |
| --- | --- |
| 可以开工，但标记为 draft | PRD 和原型足够支撑技术规划；实现期仍需以 spec 反校代码。 |
| 不直接回写 PRD | PM-TechTeam 先维护 `tech/` 与 `spec/`，涉及 PRD 变更进入 `tech/changes/`。 |
| 优先补工程骨架而非提示词正文 | 提示词未完不阻塞工程规划，关键是 task、prompt package、manifest、回传校验和状态机。 |
| Docker Compose 提前进入 S9 | 部署会影响 DB、队列、对象存储、环境变量和 worker 边界，不能最后才补。 |
| 生成产物默认长期保留 | 图片、视频、成片是用户资产；版本多时建议本地打包归档，不自动删除。 |

## Errors Encountered

| Error | Attempt | Resolution |
| --- | --- | --- |
| `prototype/design-model.json` 曾被 PowerShell 误判解析失败 | 用 UTF-8 Python JSON parser 复核 | 文件有效，但它是早期页面流模型，不作为当前工程真源。 |
