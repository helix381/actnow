# 后端规划

## 服务模块

| 模块 | 职责 | 拥有数据 | 暴露接口 | 外部依赖 | 优先级 |
| --- | --- | --- | --- | --- | --- |
| Auth/User | 登录、用户、单用户 demo 开关 | User、Workspace | `/auth/*`、`/users/me` | JWT/session provider | P1 |
| Project | 项目、路线、集、创作设置、阶段状态 | Project、Route、Episode | `/projects/*` | PostgreSQL | P0 |
| Script/Story | 灵感输入、剧本草稿、版本、锁定 | ScriptDraft、Episode、Scene | `/projects/:id/script/*` | 文本模型代理 | P0 |
| Asset | 角色、角色形态、场景、道具、参考文件、全景 | Character、CharacterForm、Prop、Asset | `/projects/:id/assets/*` | S3、文本/图像任务 | P0 |
| Storyboard | 场景、镜头、镜头脚本、顺序、引用关系 | Scene、Shot、StoryboardVersion | `/projects/:id/storyboard/*` | 文本模型代理 | P0 |
| Generation | 统一生成适配层、任务状态机、提示词包、回传 | GenerationTask、PromptPackage、GeneratedFile | `/generation-tasks/*` | 公司代理、外部工具、未来真实 API、队列 | P0 |
| AgentRuntime | ActNow Harness 数据结构、消息、事件、工具调用、回滚点 | AgentThread、AgentMessage、AgentEvent、ToolCall、HumanApproval、RuntimeResource | `/agent/*` | 文本模型代理；LangGraph 仅作后续可替换执行器 | P0 |
| Canvas | 画布节点、Frame、连线、视图状态、组合技模板 | CanvasDocument、CanvasNode、CanvasEdge、WorkflowTemplate | `/projects/:id/canvas/*` | PostgreSQL/S3 | P0 |
| Export | 合成任务、成片导出、下载链接 | CompositionJob、GeneratedFile | `/exports/*` | ffmpeg/未来合成服务、S3 | P1 |
| Observability | 日志、审计、任务事件、成本统计 | AuditLog、UsageMetric | `/admin/events` | 日志系统 | P1 |

## 数据库初稿

| 表/集合 | 核心字段 | 关系 | 状态字段 | 索引建议 | 待确认 |
| --- | --- | --- | --- | --- | --- |
| users | id, name, email, role | 1-n projects | status | email unique | demo 是否单用户 |
| projects | id, owner_id, title, route, settings, current_stage | n-1 users, 1-n episodes/assets/tasks | status | owner_id, updated_at | 正式品牌/路线 |
| episodes | id, project_id, title, order, script_version | n-1 projects, 1-n scenes | status | project_id+order | MVP 是否单集 |
| scenes | id, episode_id, title, order, location_asset_id | n-1 episodes, 1-n shots | status | episode_id+order | 场景与全景绑定粒度 |
| shots | id, scene_id, order, description, camera, emotion, duration | n-1 scenes, n-m characters/assets | status | scene_id+order | 字段详设 |
| characters | id, project_id/global_scope, name, profile | 1-n forms | status | project_id, name | 跨项目复用范围 |
| character_forms | id, character_id, label, reference_asset_id, attributes | n-1 characters | status | character_id | 多形态字段 |
| assets | id, owner_scope, type, uri, metadata, source | 关联角色/场景/道具/卡片 | status | type, project_id | 全局资产库边界 |
| generation_tasks | id, target_type, target_id, gen_type, backend_mode, status, prompt_package_id | 1-n generated_files | status | target_type+target_id, status | 队列实现 |
| generated_files | id, task_id, file_type, uri, version, model_meta | n-1 tasks/assets/shots | status | task_id+version | 生命周期策略 |
| agent_threads | id, project_id, mode, focus_ref | 1-n messages/events | status | project_id, updated_at | thread 与 stage 关系 |
| canvas_documents | id, project_id, nodes, edges, viewport, version | 1-1 projects | status | project_id | React Flow nodes/edges + business refs |

## 文件与对象存储

| 文件类型 | 来源 | 存储位置 | 元数据表 | 生命周期 | 访问权限 |
| --- | --- | --- | --- | --- | --- |
| 剧本/上传文本 | 用户上传 | S3 `uploads/scripts/` | assets 或 script_uploads | 长期保留 | 私有，签名 URL |
| 角色/场景/道具参考图 | 上传/生成 | S3 `assets/references/` | assets | 长期保留，可复用 | 私有，项目授权 |
| 全景图 | 生成/上传 | S3 `assets/panoramas/` | assets | 长期保留 | 私有，项目授权 |
| 分镜图 | 生成/回传 | S3 `generated/keyframes/` | generated_files | 默认保留 5 版 | 私有，签名 URL |
| 视频片段 | 生成/回传 | S3 `generated/videos/` | generated_files | 默认保留 5 版 | 私有，签名 URL |
| 成片导出 | 合成 | S3 `exports/` | generated_files/export_jobs | 可设置过期 | 私有下载链接 |
| prompt package/manifest | 系统生成 | DB + 可下载 JSON | prompt_packages | 跟随 task | 仅项目成员 |

## 后台任务与队列

| 任务 | 触发 | 队列/执行方式 | 状态机 | 重试 | 取消/恢复 |
| --- | --- | --- | --- | --- | --- |
| 文本生成 | 用户输入/Agent 指令 | 直接调用 + 可流式返回 | AgentThread/ScriptDraft | 失败可重试 | thread 可恢复 |
| 资产拆解 | 剧本确认/Agent 指令 | 队列或同步短任务 | GenerationTask 或 ToolCall | 2 次 | 可重新拆解 |
| 提示词包生成 | 生成依赖齐备 | 后端同步组装 | pending -> prompt_ready | 可重新组装 | 可取消 |
| 人在环回传校验 | 用户上传 | 后端校验 + 入库 | waiting_upload -> completed/failed | 允许重传 | task 可取消 |
| 真实 API 图像/视频 | 用户触发/批量生成 | 队列，未来接 API | generating -> completed/failed/retrying | 默认 2 次，降级需确认 | 支持取消 |
| 合成导出 | 片段完成后触发 | 队列/ffmpeg worker | composing -> completed/failed | 1-2 次 | 可重跑 |

## 默认后端技术路线

- Node.js + NestJS，保持前后端 TypeScript 统一。
- Prisma + PostgreSQL 作为结构化数据真源。
- S3 兼容对象存储保存上传、生成、导出文件。
- Redis + BullMQ 作为正式 MVP 队列方案，不使用数据库轮询作为主方案。
- Docker Compose 作为本地/单机部署默认方案。
