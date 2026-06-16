# ActNow 工程规范子PRD

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 日期 | 2026-06-16 |
| 状态 | 草稿 |

> **来源**：`spec/`（constitution · events · database · storage · env · pr-template · README）+ `tech/03-api-contract.md` + `tech/08-engineering-governance.md` + `specs/s1-s9` 功能切片 spec 索引
>
> `spec/openapi.yaml` 为机器可解析真源（OpenAPI 3.1.0，16 paths，20 schemas），本文档不复制 YAML 内容，只做结构引用。

---

## 1. 工程原则（spec/constitution.md）

| 原则 | 规则 | 原因 |
|------|------|------|
| **Spec before implementation** | P0 功能先有 `specs/<feature>/spec.md` | 保证需求可追溯 |
| **Evidence before completion** | 完成声明必须有验证证据 | 防止口头完成 |
| **Small reviewable changes** | 复杂变更先进入 `tech/changes/<change-id>/` | 降低回写风险 |

**Spec Persistence Model**：默认 Flow-back（MVP 快速迭代）。进入多人协作或上线后重新确认是否切换为 Flow-forward 或 Living spec。

---

## 2. 真源目录与分工（spec/README.md）

| 文件 | 用途 | 对应规划文档 | 真源级别 |
|------|------|------------|---------|
| `spec/openapi.yaml` | API 契约 | `tech/03-api-contract.md` | 机器真源 |
| `spec/database.md` | 数据库 schema / migration 规划 | `tech/04-data-and-state.md` | 规划真源 |
| `packages/db/prisma/schema.prisma` | 数据库实现真源 | — | 实现真源（优先级高于 spec/database.md） |
| `spec/events.md` | 异步任务、事件、状态机 | `tech/04-data-and-state.md` | 规划真源 |
| `spec/env.md` | 环境变量 | `tech/08-engineering-governance.md` | 真源 |
| `spec/storage.md` | 文件存储、对象 key、权限 | `tech/02-backend-plan.md` | 真源 |
| `spec/constitution.md` | 工程原则和约束 | `tech/08-engineering-governance.md` | 真源 |
| `spec/pr-template.md` | PR 描述模板 | `tech/08-engineering-governance.md` | 真源 |

> **实现后的真源优先级**：`prisma/schema.prisma` > `spec/database.md`；`openapi.yaml` = 代码生成基础，后端实现后需反校。

---

## 3. 环境变量规范（spec/env.md）

> 不存储真实密钥；`.env.example` 应镜像这些变量名但不含真实值。

| 变量 | 用途 | local | dev | prod | 是否必须 |
|------|------|-------|-----|------|---------|
| `NODE_ENV` | 运行时模式 | development | development | production | ✅ |
| `APP_ENV` | 应用环境标签 | local | dev | prod | ✅ |
| `APP_URL` | 前端基础 URL | http://localhost:4173 | dev URL | prod URL | ✅ |
| `API_URL` | API 基础 URL | http://localhost:3000/api | dev API | prod API | ✅ |
| `DATABASE_URL` | PostgreSQL 连接 | docker postgres | dev postgres | prod postgres | ✅ |
| `REDIS_URL` | Redis/BullMQ 连接 | docker redis | dev redis | prod redis | ✅ |
| `S3_ENDPOINT` | S3 兼容端点 | http://localhost:9000 | dev object storage | prod object storage | ✅ |
| `S3_REGION` | S3 区域 | us-east-1 | configured | configured | ✅ |
| `S3_ACCESS_KEY_ID` | S3 access key | local only | secret | secret | ✅ |
| `S3_SECRET_ACCESS_KEY` | S3 secret | local only | secret | secret | ✅ |
| `S3_BUCKET_UPLOADS` | 上传 bucket | actnow-uploads | actnow-dev-uploads | actnow-prod-uploads | ✅ |
| `S3_BUCKET_GENERATED` | 生成资产 bucket | actnow-generated | actnow-dev-generated | actnow-prod-generated | ✅ |
| `S3_BUCKET_EXPORTS` | 导出 bucket | actnow-exports | actnow-dev-exports | actnow-prod-exports | ✅ |
| `TEXT_MODEL_PROXY_BASE_URL` | 公司 OpenAI 兼容代理 | configured | configured | configured | ✅ |
| `TEXT_MODEL_PROXY_API_KEY` | 代理 API key | secret | secret | secret | 按代理要求 |
| `DEFAULT_TEXT_MODEL` | 默认 LLM 模型 ID | configured | configured | configured | ✅ |
| `GENERATION_DEFAULT_BACKEND_MODE` | 默认图像/视频模式 | human_loop | human_loop | real_api/human_loop | ✅ |
| `DEMO_SINGLE_USER` | 单用户 demo 模式 | true | true | false | ✅ |
| `DEMO_USER_ID` | 种子用户 ID | demo-user | demo-user | empty | local/dev |
| `JWT_SECRET` | 未来鉴权密钥 | local placeholder | secret | secret | 启用鉴权时 |
| `LOG_LEVEL` | 日志级别 | debug | info | info/warn | ✅ |
| `BULLMQ_PREFIX` | 队列前缀 | actnow-local | actnow-dev | actnow-prod | ✅ |

> ⚠️ 注意：`spec/env.md` 原文 `APP_URL` 写的是 localhost:5173，但根据 `经验/AIGC-Platform-协作推进经验记忆.md`，Windows 保留了 5173，实际前端端口为 **4173**。本文已修正。

**Docker Compose 服务**：api · worker · postgres · redis · minio · frontend（可选独立服务）

---

## 4. 事件队列与状态机（spec/events.md）

### 4.1 运行时原则

ActNow 自建 Harness 持有数据模型和 append-only 事件日志。外部 agent runtime（如未来 LangGraph 集成）必须通过这些事件和表回写，不能绕过 Harness 层。

### 4.2 队列定义

| 队列 | 后端 | 用途 | 生产者 | 消费者 |
|------|------|------|--------|--------|
| `generation` | BullMQ + Redis | 图像/视频/样例生成、提示词包准备、人在环验证副作用 | API / Agent tools | generation worker |
| `storyboard` | BullMQ + Redis | 文本/分镜类长任务（非内联流式） | AgentRuntime / Storyboard service | storyboard worker |
| `export` | BullMQ + Redis | 合成/导出任务 | Export service | export worker |
| `maintenance` | BullMQ + Redis | 清理、重试恢复、定时任务 | system | maintenance worker |

> PostgreSQL 存储 `generation_tasks` 和事件真源；Redis/BullMQ 只存队列运行态。

### 4.3 Harness 事件清单

| 事件 | 触发方 | 消费方 | Payload | 幂等键 | 可重试 |
|------|--------|--------|---------|--------|--------|
| `agent.message.created` | 用户发消息 | AgentRuntime | thread_id, message_id, focus_ref | message_id | 否 |
| `agent.intent.parsed` | director/router 解析意图 | UI, logs | thread_id, intent, target_refs | event_id | 否 |
| `approval.requested` | 高风险/复合命令 | UI | approval_id, reason, impact_scope | approval_id | 否 |
| `approval.completed` | 用户确认/拒绝 | AgentRuntime | approval_id, decision | approval_id | 否 |
| `tool.started` | harness 启动 tool call | UI, logs | tool_call_id, tool_name, input_ref | tool_call_id | 否 |
| `tool.completed` | tool 完成 | UI, logs | tool_call_id, output_ref | tool_call_id | 否 |
| `tool.failed` | tool 失败 | UI, logs | tool_call_id, error_code, error_message | tool_call_id | **是** |
| `generation.status_changed` | 任务状态变化 | UI, workers, logs | task_id, from_status, to_status, reason | task_id + to_status + version | 否 |
| `upload.validated` | 人在环上传通过校验 | UI, generation service | task_id, file_ids, manifest | task_id + checksum | 否 |
| `worker.job.completed` | BullMQ worker 完成 | 可观测性 | queue, job_id, task_id, duration_ms | job_id | 否 |
| `worker.job.failed` | BullMQ worker 失败 | 可观测性 | queue, job_id, task_id, error_code | job_id + attempts | **是** |

> SSE 流式事件（agent 与前端实时通信）见 [06-agent-system.md §9](06-agent-system.md)。

### 4.4 GenerationTask 状态机

```
pending ──────────────────────────── → failed（依赖缺失）
  │
  ↓ 依赖就绪 + 提示词包创建
prompt_ready ──────────────────────── → canceled
  │
  ├── human_loop  → waiting_upload ──── → completed（上传验证通过）
  │                    │              └── → waiting_upload（上传被拒，重传）
  │                    └── → canceled
  │
  ├── real_api    → generating ─────── → completed（provider 结果入库）
  │                    │              └── → failed（provider/worker 错误）
  │                    └── → canceled
  │
  └── sample hit  → completed
  
failed → retrying → prompt_ready（重建提示词包）
                  → generating（重试 provider 调用）
failed → canceled
```

**任务状态枚举**：`pending` · `prompt_ready` · `waiting_upload` · `generating` · `completed` · `failed` · `retrying` · `canceled`

### 4.5 Job Payloads 示例

**generation job**：
```json
{
  "job_type": "generation",
  "task_id": "task_xxx",
  "project_id": "project_xxx",
  "gen_type": "keyframe",
  "backend_mode": "human_loop",
  "target": { "type": "shot", "id": "shot_xxx" }
}
```

**storyboard job**：
```json
{
  "job_type": "storyboard",
  "project_id": "project_xxx",
  "episode_id": "episode_xxx",
  "scope": "episode"
}
```

### 4.6 可观测性最低要求

- 每个 job 日志必须含 `job_id`、`task_id`（如有）、`project_id`、`thread_id`（如有）
- 每个 Agent tool call 必须创建 `tool.started` 及 `tool.completed`/`tool.failed`
- 每次 GenerationTask 状态变化必须追加 `generation.status_changed`

---

## 5. 数据库规划 Schema（spec/database.md）

### 5.1 Schema 真源说明

- **规划真源**：本文件 + `tech/04-data-and-state.md`
- **实现真源**（后端开工后）：`packages/db/prisma/schema.prisma`
- 数据库：PostgreSQL；ORM：Prisma
- Demo 模式：单 demo 用户，但保持 `users`/`workspaces` 兼容未来登录

### 5.2 Migration 规则

- 每次 schema 变更必须创建 Prisma migration
- 命名格式：`YYYYMMDDHHMM_<scope>`，例如 `202606121030_generation_tasks`
- local/dev 可 reset seed 数据；staging/prod 必须正向迁移
- 破坏性 migration 必须关联 feature spec 或变更包
- Seed 必须创建一个 demo 用户和一条 S1/S2 烟雾测试可用的样例项目路径

### 5.3 核心表清单

| 表名 | 用途 | 关键字段 | 关联 | 状态 |
|------|------|---------|------|------|
| `users` | 未来登录 + demo 身份 | id, name, email, role, status | 1-n workspaces/projects | draft |
| `workspaces` | 未来团队/用户容器 | id, owner_user_id, name, mode | 1-n projects | draft |
| `projects` | 主项目/工作台真源 | id, workspace_id, owner_user_id, title, route, current_stage, settings, status | 1-n episodes/assets/tasks/threads | draft |
| `episodes` | 短剧/漫剧单集单元 | id, project_id, title, order, script_version, status | 1-n scenes | draft |
| `script_drafts` | 剧本草稿与锁定版本 | id, project_id, episode_id, version, content, source, locked_at | n-1 project/episode | draft |
| `scenes` | 故事场景 | id, episode_id, title, order, location_asset_id, status | 1-n shots | draft |
| `shots` | 分镜镜头真源 | id, scene_id, order, description, camera_json, emotion, duration, status, version | n-m assets/character_forms | draft |
| `characters` | 角色身份 | id, project_id, name, profile_json, status | 1-n character_forms | draft |
| `character_forms` | 角色形态/参考态 | id, character_id, label, reference_asset_id, attributes_json, status | n-1 character | draft |
| `assets` | 上传/生成/参考资产 | id, project_id, type, name, uri, metadata_json, source, status | 被 shots/tasks/files 引用 | draft |
| `shot_asset_refs` | 镜头-资产引用关系 | id, shot_id, asset_id, role | n-m shots/assets | draft |
| `shot_character_form_refs` | 镜头-角色形态引用 | id, shot_id, character_form_id, role | n-m shots/forms | draft |
| `canvas_documents` | React Flow 画布状态 | id, project_id, nodes_json, edges_json, viewport_json, version, status | 1-1 project | draft |
| `generation_tasks` | 生成任务状态真源 | id, project_id, target_type, target_id, gen_type, backend_mode, status, prompt_package_id, retry_count, error_code | 1-n generated_files | draft |
| `prompt_packages` | 人在环/API 提示词包 | id, task_id, prompt, references_json, parameters_json, manifest_json, version | 1-1 generation_task | draft |
| `generated_files` | 生成/上传产物 | id, task_id, file_type, uri, version, is_current, checksum, model_meta_json, status, deleted_at | n-1 generation_task | draft |
| `agent_threads` | Harness 会话线程 | id, project_id, mode, status, focus_type, focus_id, summary | 1-n messages/events | draft |
| `agent_messages` | 人类/Agent 消息 | id, thread_id, role, content, model_meta_json | n-1 thread | draft |
| `agent_events` | append-only Harness 事件日志 | id, thread_id, task_id, event_type, actor, payload_json, created_at | n-1 thread/task | draft |
| `tool_calls` | Tool call 记录 | id, thread_id, event_id, tool_name, input_json, output_json, status, error_code | n-1 thread/event | draft |
| `human_approvals` | 人工审批检查点 | id, thread_id, target_type, target_id, reason, status, decision_json | n-1 thread | draft |
| `runtime_resources` | 运行时能力/资源 | id, project_id, type, name, config_json, status | n-1 project | draft |
| `workflow_templates` | 组合技/轻量 Skill | id, project_id, name, trigger_scope, steps_json, version, status | n-1 project | draft |
| `composition_jobs` | 导出/合成任务 | id, project_id, episode_id, status, output_file_id, error_code | n-1 project | P1 draft |
| `audit_logs` | 安全与数据变更审计 | id, project_id, actor_type, actor_id, action, target_type, target_id, payload_json | n-1 project | P1 draft |

> ⚠️ **schema.prisma vs 规划 schema 差距**：当前 `prisma/schema.prisma` 只有 User/Workspace/Project/Episode/ScriptDraft/Scene/Shot/CanvasDocument/AgentThread/AgentMessage/AgentEvent，缺少 Asset、Character、CharacterForm、GenerationTask、PromptPackage、GeneratedFile、ShotAssetRef、ShotCharacterFormRef、ToolCall、HumanApproval、WorkflowTemplate、CompositionJob、AuditLog 等表。详见 [06-agent-system.md §14](06-agent-system.md) 差距对照表。

### 5.4 关键索引

| 表 | 索引 | 原因 |
|----|------|------|
| `projects` | workspace_id, updated_at | 项目列表与最近工作 |
| `scenes` | episode_id, order | 叙事顺序 |
| `shots` | scene_id, order | 分镜顺序 |
| `assets` | project_id, type | 资产抽屉过滤 |
| `generation_tasks` | project_id, status | 任务面板与 SSE 水合 |
| `generation_tasks` | target_type, target_id | 查找绑定到 shot/asset/node 的任务 |
| `generated_files` | task_id, version | 文件版本查找 |
| `agent_events` | thread_id, created_at | 事件流 |
| `tool_calls` | thread_id, status | Tool 执行跟踪 |

### 5.5 重要约束

- PostgreSQL 是状态真源；Redis/BullMQ 只是执行队列
- 不使用数据库轮询作为正式队列策略
- React Flow 节点 ID 必须通过 `data.ref` 引用业务对象，不能成为业务真源
- 生成文件默认保留至用户主动删除；`is_current` 标记当前版本

---

## 6. 文件存储规范（spec/storage.md）

### 6.1 对象存储方案

使用 S3 兼容对象存储；local/dev 用 Docker Compose 内的 MinIO；生产可切换任意 S3 兼容供应商，不改业务代码。

| 文件类型 | Bucket/目录 | Key 规则 | 访问方式 | 生命周期 |
|---------|------------|---------|---------|---------|
| 上传剧本 | `uploads/scripts/` | `projects/{project_id}/scripts/{file_id}.{ext}` | 私有签名 URL | 保留 |
| 参考图 | `uploads/references/` | `projects/{project_id}/references/{asset_id}/{file_name}` | 私有签名 URL | 保留 |
| 全景资产 | `assets/panoramas/` | `projects/{project_id}/panoramas/{asset_id}/{version}.{ext}` | 私有签名 URL | 保留 |
| 关键帧结果 | `generated/keyframes/` | `projects/{project_id}/tasks/{task_id}/v{version}.{ext}` | 私有签名 URL | 用户删除前保留 |
| 视频结果 | `generated/videos/` | `projects/{project_id}/tasks/{task_id}/v{version}.{ext}` | 私有签名 URL | 用户删除前保留 |
| 导出成片 | `exports/` | `projects/{project_id}/exports/{export_id}/v{version}.{ext}` | 私有签名 URL | 用户删除前保留 |
| 提示词包下载 | DB 主，可选 JSON 导出 | `projects/{project_id}/prompt-packages/{task_id}/v{version}.json` | 私有签名 URL | 跟随任务 |

### 6.2 上传/下载规则

- MVP 可使用直接 multipart 上传；后续优化可切换为预签名上传 URL
- 下载必须使用签名 URL，不使用公开 bucket
- 上传校验必须检查：项目归属 · 任务状态 · 文件类型 · 文件大小 · 可选 manifest 映射

### 6.3 人在环 Manifest 格式

```json
{
  "task_id": "task_xxx",
  "files": [
    {
      "file_name": "shot-001.png",
      "target": { "type": "shot", "id": "shot_xxx" },
      "version": 1
    }
  ]
}
```

### 6.4 存储规则摘要

- 生成文件不是状态真源；`generated_files` 表才是
- 图像、视频、导出成片默认保留至用户主动删除
- 当前版本由用户确认选定，不是隐式覆盖
- 版本过多时，产品应提示本地归档/下载打包
- Object key 不应编码可变的业务名称
- 上传校验失败时不保留任何业务绑定，返回校验错误

---

## 7. API 契约总览（tech/03-api-contract.md + spec/openapi.yaml）

> 机器真源：`spec/openapi.yaml`（OpenAPI 3.1.0，16 paths，20 schemas，Python yaml.safe_load 验证通过）。以下为接口总览，实现时以 openapi.yaml 为准。

| 前端动作 | Method | Path | 主要请求字段 | 主要响应 | 幂等 |
|---------|--------|------|------------|---------|------|
| 创建项目 | POST | `/api/projects` | title, route, initial_input | Project | 否 |
| 获取项目工作区 | GET | `/api/projects/:projectId/workspace` | projectId | Project + canvas + thread summary | 是 |
| 发送 Agent 消息 | POST | `/api/agent/threads/:threadId/messages` | content, focus_ref, client_context | message, stream id | 否 |
| 获取 Agent 事件流 | GET/SSE | `/api/agent/threads/:threadId/events` | cursor | AgentEvent stream | 是 |
| 锁定剧本/打开画布 | POST | `/api/projects/:projectId/script/lock` | script_version | Project stage, scenes | 按 version |
| 保存画布快照 | PUT | `/api/projects/:projectId/canvas` | nodes, edges, viewport, version | CanvasDocument | 按 version |
| 创建/更新资产 | POST/PATCH | `/api/projects/:projectId/assets` | type, metadata, file_id? | Asset | PATCH 是 |
| 创建分镜任务 | POST | `/api/projects/:projectId/storyboard/generate` | episode_id, scope, options | task/tool result | 否 |
| 更新镜头 | PATCH | `/api/shots/:shotId` | fields, version | Shot | 按 version |
| 创建生成任务 | POST | `/api/generation-tasks` | target_type, target_id, gen_type, backend_mode | GenerationTask | 否 |
| 获取提示词包 | GET | `/api/generation-tasks/:taskId/prompt-package` | taskId | PromptPackage | 是 |
| 回传生成结果 | POST | `/api/generation-tasks/:taskId/uploads` | files, manifest? | GeneratedFile[] | 否 |
| 重试/取消生成任务 | POST | `/api/generation-tasks/:taskId/retry` · `/cancel` | retry_mode / reason | GenerationTask | — |
| 创建合成导出 | POST | `/api/exports` | project_id, episode_id, shot_file_ids | CompositionJob | 否 |
| 获取文件下载链接 | GET | `/api/files/:fileId/signed-url` | fileId | signed_url, expires_at | 是 |

**错误码约定**（来源 tech/03）：

| code | HTTP | 含义 | 前端处理 |
|------|------|------|---------|
| `AUTH_REQUIRED` | 401 | 未登录/会话失效 | 跳登录 |
| `FORBIDDEN` | 403 | 无项目/文件权限 | 禁用操作 |
| `NOT_FOUND` | 404 | 对象不存在 | 显示已删除/刷新 |
| `CONFLICT` | 409 | 乐观锁冲突 | 提示刷新并重试 |
| `VALIDATION_ERROR` | 422 | 请求格式/业务校验失败 | 显示字段错误 |
| `DEPENDENCY_MISSING` | 422 | 生成任务依赖资产缺失 | 提示补资产 |
| `BACKEND_UNAVAILABLE` | 503 | 外部生成后端不可用 | 降级提示 |

---

## 8. Git 工作流与 PR 规范（tech/08 + spec/pr-template.md）

### 8.1 Git 工作流

| 项 | 规则 |
|----|------|
| 默认分支 | `main` |
| 功能分支 | `feature/<slice-id>-<scope>`，例如 `feature/s5-human-loop-keyframes` |
| 修复分支 | `fix/<scope>` |
| 提交粒度 | 一个提交覆盖一个清晰变更点，避免前后端/文档/格式混杂 |
| PR 策略 | 小 PR + 截图/接口说明/测试说明；P0 切片必须列验收路径 |
| Review | 至少自检清单通过；关键 API/DB/状态机变更需要二次 review |

### 8.2 版本号

| 阶段 | 格式 |
|------|------|
| demo 阶段 | `v0.x.y-demo` |
| MVP | SemVer |

### 8.3 PR 模板（spec/pr-template.md）

```markdown
## Description
[What does this PR change and why?]

## Linked Spec / Change
- Feature spec: `specs/[feature]/spec.md`
- Change package: `tech/changes/[change-id]/proposal.md`

## Testing / Evidence
- [ ] Commands or manual review evidence listed.
- [ ] Screenshots or API responses attached where relevant.
- [ ] Database migration impact checked.

## AI Disclosure
- [ ] I did not use AI assistance.
- [ ] I did use AI assistance: [describe how]

## Risks
- [待确认]
```

### 8.4 Docker Compose 服务组成

| 模块 | 方案 |
|------|------|
| 前端 | Node build + 静态服务（Vite/React，端口 4173） |
| 后端 API | Docker 容器运行 NestJS |
| PostgreSQL | Docker Compose（local/dev）；生产可切托管 |
| Redis/Queue | Docker Compose（local/dev）；生产可切托管 |
| 对象存储 | MinIO（local/dev）；生产 S3 兼容 |
| Worker | 独立容器，处理生成任务/合成导出/长任务 |
| Reverse Proxy | Nginx/Caddy 可选 |

---

## 9. 功能切片 Spec 索引（specs/s1-s9）

> 每个切片目录结构：`spec.md`（功能规范）· `data-model.md`（数据模型）· `plan.md`（实施计划）· `tasks.md`（任务拆分）· `quickstart.md`（快速上手）· `contracts/README.md`（接口契约）

| 切片 | 路径 | 核心目标 | 优先级 |
|------|------|---------|--------|
| S1 Workspace Chat | `specs/s1-workspace-chat/` | 单一工作区 + Agent 聊天台 + SSE 事件流 | P0 |
| S2 Script to Canvas | `specs/s2-script-to-canvas/` | 锁定剧本 → 创建 Scene/Shot → 初始化 React Flow 画布 | P0 |
| S3 Asset Management | `specs/s3-asset-management/` | 资产上传/入库/复用（角色/场景/道具） | P0 |
| S4 Storyboard | `specs/s4-storyboard/` | 分镜脚本生成 → 编辑 → 画布节点化 | P0 |
| S5 Keyframe Human-Loop | `specs/s5-keyframe-human-loop/` | 关键帧（分镜图）提示词包 → 人在环回传 → 验证 | P0 |
| S6 Video Human-Loop | `specs/s6-video-human-loop/` | 视频片段提示词包 → 人在环回传 → 验证 | P0 |
| S7 Agent Canvas Control | `specs/s7-agent-canvas-control/` | Agent 通过聊天控制画布节点（双路径对等） | P0 |
| S8 Export Placeholder | `specs/s8-export-placeholder/` | 合成导出占位链路 | P1 |
| S9 Docker Deployment | `specs/s9-docker-deployment/` | Docker Compose 全栈本地部署 | P0 |

**推荐推进顺序**（来源 tech/06）：S1 → S2 → S9（穿插，不能最后补）→ S3 → S4 → S5 → S6 → S7 → S8（P1，不阻塞主链路）

**切片验收标准**（来源 tech/06）：

| 切片 | 验收标准 | 前端范围 | 后端范围 |
|------|---------|---------|---------|
| S1 | 输入灵感后创建项目并看到回复 | home/chat stage/rail/输入框 | Project、AgentThread、文本代理 |
| S2 | 打开画布后节点与场景/镜头数据一致 | chat/sidebar/canvas 三态、五步骤 frame | Script lock、Scene/Shot 初始化、CanvasDocument |
| S3 | 上传/编辑/绑定资产后画布同步 | assets frame、资产抽屉、上传入口 | Asset CRUD、file upload |
| S4 | 分镜可生成、编辑、保存、重排 | storyboard frame、镜头列表 | Storyboard service、文本模型调用 |
| S5 | 回传图片绑定到对应 shot/task | keyframes frame、prompt panel、upload dialog | GenerationTask、PromptPackage、GeneratedFile |
| S6 | 视频片段状态从 waiting_upload 到 completed | videos frame、状态 badge、重试/取消 | GenerationTask、GeneratedFile |
| S7 | "只重生成第8镜"能定位、确认并创建 task | AgentPanel focus、确认卡片、画布刷新 | Harness、ToolCall、target resolution |
| S8 | 素材齐备后可生成下载占位 | export frame、预览/下载入口 | CompositionJob、placeholder worker |
| S9 | 新环境一键启动并跑通 S1-S6 smoke | env 配置、构建产物 | Docker Compose、migration、seed、日志 |

**串并行原则**：
- S1/S2 是产品骨架，必须优先给前后端对齐
- S9 可与 S1-S6 并行，因为 Docker/环境变量/DB/对象存储/队列会反向影响后端结构
- S7 依赖 S2-S6 的对象、状态和任务协议，不应早于这些真源实现
- S8 不阻塞 MVP 主链路，但生成产物生命周期不能设计成临时文件

**反模式**：
- ❌ 先做纯静态前端页面不接 project/task 数据 → 状态机返工
- ❌ 后端先建全量表再等前端 → 应按 S1-S9 切片逐步落库
- ❌ 先接真实图像/视频 API → 先把人在环协议和任务状态跑通
- ❌ Agent 做成泛聊天 → 从 S7 起必须绑定 `focus_ref`、`target_ref` 和 `ToolCall`
- ❌ 把部署放到最后 → DB/对象存储/队列/环境变量会反向影响后端结构

---

## 10. 前端工程规划（tech/01-frontend-plan.md）

### 10.1 组件分层

| 组件 | 所属 | 职责 | 状态来源 |
|------|------|------|---------|
| AppWorkspace | 全局 | 管理 home/chat/canvas/myworks stage 与 rail | global store |
| AgentPanel | chat/canvas | 消息流、输入框、模式切换、上下文提示 | API + global store |
| CanvasShell | canvas | pan/zoom、选择、框选、右键、小地图、资产抽屉 | local + API snapshot |
| StepFrame | canvas | 五步骤 Frame 容器，承载组件卡片 | canvas state |
| ComponentCard | canvas | 资产/分镜/分镜图/视频/合成重型功能单元（锁定到步骤） | API |
| SimpleCard | canvas | 图片/视频/文本/参考素材自由卡片（自由浮动） | local + API |
| GenerationStatusBadge | 多处 | 统一展示生成状态 | API |
| PromptPackagePanel | keyframes/videos | 展示/导出提示词包、复制参数、下载 manifest | API |
| UploadReturnDialog | keyframes/videos | 回传文件、manifest、校验错误 | API |
| AssetDrawer | canvas | 浏览/收藏/拖入资产 | API |

### 10.2 前端状态管理

| 状态 | 范围 | 来源 | 持久化 | 失败处理 |
|------|------|------|--------|---------|
| `workspace.stage` | 全局 UI | 用户操作 | 是（project UI prefs）| 回到上次有效 stage |
| `agent.mode` | Agent 面板 | 用户切换 | 是 | 保持上下文，不丢消息 |
| `canvas.viewport` | 画布 | pan/zoom | 是（节流保存）| 保存失败只提示，不阻塞 |
| `canvas.selection` | 画布 | 用户选择 | 否 | 刷新清空 |
| `entity.dirty` | 表单/节点 | 用户编辑 | 否（本地暂存）| 离开前提醒 |
| `GenerationTask.status` | 业务状态 | 后端 | 是 | 统一错误码、可重试/取消/回传 |
| `upload.progress` | 上传 | 前端 + 后端签名 | 否 | 失败可重传 |
| `agent.streaming` | 消息流 | SSE | 消息落库 | 中断后可恢复 thread |

### 10.3 原型 → 实现差异

| 原型行为 | 实现要求 |
|---------|---------|
| workspace.html 单页四阶段切换 | 前端路由可仍是一页，但业务状态必须来自后端 project/session |
| 聊天/画布三态（全屏/侧边/悬浮球） | 状态不丢失，消息 thread 与选中对象上下文一致 |
| HTML 模拟 pan/zoom/拖拽/连线 | 生产正式按 React Flow 推进；tldraw 备选，react-konva 不进 MVP 主路线 |
| 演示态 badge/脉冲 | 后端 GenerationTask 为唯一真源 |
| 原型展示 task_id/回填入口 | 必须接 prompt package、manifest、文件校验、版本入库 |
| design-model.json 页面流 | 页面流不采用，不作为工程真源 |

---

## 11. 后端服务模块架构（tech/02-backend-plan.md）

| 模块 | 职责 | 拥有数据 | 外部依赖 | 优先级 |
|------|------|---------|---------|--------|
| Auth/User | 登录、用户、单用户 demo 开关 | User、Workspace | JWT/session provider | P1 |
| Project | 项目、路线、集、创作设置、阶段状态 | Project、Route、Episode | PostgreSQL | P0 |
| Script/Story | 灵感输入、剧本草稿、版本、锁定 | ScriptDraft、Episode、Scene | 文本模型代理 | P0 |
| Asset | 角色、角色形态、场景、道具、参考文件、全景 | Character、CharacterForm、Prop、Asset | S3、文本/图像任务 | P0 |
| Storyboard | 场景、镜头、镜头脚本、顺序、引用关系 | Scene、Shot、StoryboardVersion | 文本模型代理 | P0 |
| Generation | 统一生成适配层、任务状态机、提示词包、回传 | GenerationTask、PromptPackage、GeneratedFile | 公司代理、外部工具、队列 | P0 |
| AgentRuntime | ActNow Harness 数据结构、消息、事件、工具调用、回滚点 | AgentThread、AgentMessage、AgentEvent、ToolCall、HumanApproval | 文本模型代理 | P0 |
| Canvas | 画布节点、Frame、连线、视图状态、组合技模板 | CanvasDocument、WorkflowTemplate | PostgreSQL/S3 | P0 |
| Export | 合成任务、成片导出、下载链接 | CompositionJob、GeneratedFile | ffmpeg/未来合成服务、S3 | P1 |
| Observability | 日志、审计、任务事件、成本统计 | AuditLog、UsageMetric | 日志系统 | P1 |

**后台任务类型**：

| 任务 | 触发 | 执行方式 | 重试 |
|------|------|---------|------|
| 文本生成 | 用户输入/Agent 指令 | 直接调用 + 可流式返回 | 失败可重试 |
| 资产拆解 | 剧本确认/Agent 指令 | 队列或同步短任务 | 可重新拆解 |
| 提示词包生成 | 生成依赖齐备 | 后端同步组装 | 可重新组装 |
| 人在环回传校验 | 用户上传 | 后端校验 + 入库 | 允许重传 |
| 真实 API 图像/视频 | 用户触发/批量生成 | 队列 + 外部 API | 默认 2 次，降级需确认 |
| 合成导出 | 片段完成后触发 | 队列/ffmpeg worker | 1-2 次 |

---

## 12. 联调计划（tech/05-integration-plan.md）

### 12.1 联调顺序（8步）

1. 建立项目与 workspace 聚合接口，前端从 mock 切到真实 project id
2. 打通 Agent 文本消息流（先不接复杂工具，只保证 thread/event 可恢复）
3. 打通剧本锁定 → canvas 初始化（生成 Scene/Shot/CanvasDocument）
4. 打通资产 CRUD + 文件上传
5. 打通 GenerationTask + PromptPackage（不接真实图像/视频 API）
6. 打通人在环回传校验与 GeneratedFile 版本入库
7. 打通画布节点状态订阅/轮询（task 状态驱动 UI）
8. 接合成导出占位或真实 worker

### 12.2 端到端验收路径

| 路径 | 前端页面 | 后端模块 | 数据变化 | 验收方式 |
|------|---------|---------|---------|---------|
| 灵感输入到聊天 | home/chat stage | Project + AgentRuntime | Project、AgentThread、AgentMessage | 输入后出现 Agent 回复和 project id |
| 聊天到画布 | chat → canvas/sidebar | Script/Story + Canvas | ScriptDraft locked、Scene、Shot、CanvasDocument | 切画布后出现五步骤 frame 和初始节点 |
| 资产拆解与编辑 | assets frame | Asset + AgentRuntime | Character、CharacterForm、Asset | 角色/场景/道具可编辑保存 |
| 分镜脚本生成 | storyboard frame | Storyboard + AgentRuntime | Scene、Shot | 分镜列表可排序和保存 |
| 分镜图提示词包 | keyframes frame | Generation | GenerationTask、PromptPackage | task 进入 prompt_ready，能导出包 |
| 人在环回传 | keyframes/videos frame | Generation + Storage | GeneratedFile、task completed | 上传后文件绑定原 task/shot |
| 视频片段到合成 | videos/export frame | Generation + Export | GeneratedFile、CompositionJob | 缺片段时阻塞，齐备后可导出占位 |

### 12.3 环境矩阵

| 环境 | 用途 | 后端模式 | 外部依赖 | 数据策略 |
|------|------|---------|---------|---------|
| local | 本地开发 | mock + sample + 可选公司代理 | PostgreSQL/Redis/S3（Docker Compose）| seed/mock |
| dev | 联调 | 文本真 API + 图像/视频人在环 | 公司代理、对象存储、Redis | 可重置 |
| staging | 演示验收 | 文本真 API + 人在环 + 样例兜底 | 接近生产 | 保留演示数据 |
| prod | 正式 | 文本真 API + 未来图像/视频真 API | 正式密钥、监控、备份 | 不可随意重置 |

---

## 修改记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-06-16 | v0.1 | 整理 spec/ 全目录内容归档，+ tech/03/08 精华归入，+ specs/s1-s9 索引 |
| 2026-06-16 | v0.2 | 补充 §9 切片验收标准 + 串并行原则 + 反模式（tech/06）；新增 §10 前端组件分层 + 状态管理（tech/01）；新增 §11 后端服务模块 + 任务类型（tech/02）；新增 §12 联调计划8步 + E2E验收路径 + 环境矩阵（tech/05）|
