# API 契约

## 接口总览

| 前端动作 | Method | Path | 请求 | 响应 | 后端处理 | 前端反馈 | 幂等 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 创建项目/开始创作 | POST | `/api/projects` | title, route, initial_input | Project | 建项目、创建默认 episode/thread | 进入 chat stage | 否 |
| 获取项目工作区 | GET | `/api/projects/:projectId/workspace` | projectId | Project + canvas + current thread summary | 聚合工作区首屏数据 | loading -> ready | 是 |
| 发送 Agent 消息 | POST | `/api/agent/threads/:threadId/messages` | content, focus_ref, client_context | message, events/stream id | 总控理解意图，路由专家/工具 | streaming/thinking | 否 |
| 获取 Agent 消息流 | GET/SSE | `/api/agent/threads/:threadId/events` | cursor | AgentEvent stream | 推送消息、工具调用、状态更新 | 实时刷新 | 是 |
| 锁定剧本/打开画布 | POST | `/api/projects/:projectId/script/lock` | script_version | Project stage, scenes | 锁定创作设置，生成/确认结构 | 切到 sidebar/canvas | 是，按 version |
| 保存画布快照 | PUT | `/api/projects/:projectId/canvas` | nodes, edges, viewport, version | CanvasDocument | 乐观锁保存 | 保存状态/toast | 是，按 version |
| 创建/更新资产 | POST/PATCH | `/api/projects/:projectId/assets` | type, metadata, file_id? | Asset | 写资产与引用关系 | 节点更新 | POST 否/PATCH 是 |
| 创建分镜任务 | POST | `/api/projects/:projectId/storyboard/generate` | episode_id, scope, options | task/tool result | 文本模型生成 scenes/shots | 进度/结果卡片 | 否 |
| 更新镜头 | PATCH | `/api/shots/:shotId` | fields, version | Shot | 保存镜头字段、记录版本 | dirty -> saved | 是，按 version |
| 创建生成任务 | POST | `/api/generation-tasks` | target_type, target_id, gen_type, backend_mode, options | GenerationTask | 校验依赖，创建 task | 节点进入 pending/prompt_ready | 否 |
| 获取提示词包 | GET | `/api/generation-tasks/:taskId/prompt-package` | taskId | PromptPackage | 返回 prompt、参考、参数、manifest | 展示/复制/导出 | 是 |
| 回传生成结果 | POST | `/api/generation-tasks/:taskId/uploads` | files, manifest? | GeneratedFile[] | 校验 task_id、类型、比例、数量，入库 | done 或错误原因 | 否 |
| 重试生成任务 | POST | `/api/generation-tasks/:taskId/retry` | retry_mode | GenerationTask | 重新组装/调用/等待回传 | retrying | 否 |
| 取消生成任务 | POST | `/api/generation-tasks/:taskId/cancel` | reason | GenerationTask | 标记 canceled，停止队列 | canceled | 是 |
| 创建合成导出 | POST | `/api/exports` | project_id, episode_id, shot_file_ids | CompositionJob | 创建导出任务 | composing | 否 |
| 获取文件下载链接 | GET | `/api/files/:fileId/signed-url` | fileId | signed_url, expires_at | 鉴权并签名 | 打开/下载 | 是 |

## 错误码

| code | HTTP | 含义 | 前端处理 | 是否可重试 |
| --- | --- | --- | --- | --- |
| `AUTH_REQUIRED` | 401 | 未登录或会话失效 | 跳登录/提示恢复 | 否 |
| `FORBIDDEN` | 403 | 无项目或文件权限 | 禁用操作并提示 | 否 |
| `NOT_FOUND` | 404 | 项目/任务/文件不存在 | 显示已删除/刷新 | 否 |
| `VERSION_CONFLICT` | 409 | 乐观锁版本冲突 | 拉取最新并提示合并 | 是 |
| `VALIDATION_ERROR` | 422 | 字段、文件、manifest 不合法 | 定位字段/文件错误 | 可修改后重试 |
| `TASK_NOT_READY` | 409 | 依赖资产/镜头未齐备 | 标记缺口，引导补齐 | 是 |
| `TASK_CANCELED` | 409 | 任务已取消 | 更新节点状态 | 否 |
| `UPLOAD_MISMATCH` | 422 | 回传文件与 task_id/manifest 不匹配 | 拒绝并显示原因 | 可重传 |
| `MODEL_PROXY_FAILED` | 502 | 公司代理或外部 API 失败 | 重试/降级/稍后 | 是 |
| `QUEUE_TIMEOUT` | 504 | 队列或生成超时 | 提供重试/取消 | 是 |
| `INTERNAL_ERROR` | 500 | 未预期错误 | toast + 上报 | 视情况 |

## 长任务通知

| 任务 | 创建接口 | 查询接口 | 通知方式 | 完成回调 | 失败处理 |
| --- | --- | --- | --- | --- | --- |
| Agent 文本生成 | `POST /api/agent/threads/:id/messages` | `GET /api/agent/threads/:id/events` | SSE 优先，polling 兜底 | AgentEvent `message.completed` | 可重发或继续对话 |
| 分镜生成 | `POST /api/projects/:id/storyboard/generate` | `GET /api/tasks/:id` | SSE/polling | 更新 scenes/shots | 失败保留草稿 |
| 提示词包生成 | `POST /api/generation-tasks` | `GET /api/generation-tasks/:id` | polling 即可 | status `prompt_ready` | 显示依赖缺口 |
| 人在环回传 | `POST /api/generation-tasks/:id/uploads` | `GET /api/generation-tasks/:id` | 同步校验 + polling | status `completed` | 返回校验错误 |
| 真实 API 图像/视频 | `POST /api/generation-tasks` | `GET /api/generation-tasks/:id` | SSE/polling | GeneratedFile 入库 | 重试/降级人在环/取消 |
| 合成导出 | `POST /api/exports` | `GET /api/exports/:id` | polling | signed download URL | 重试/报错 |

## 契约原则

- 所有写操作携带 `project_id` 或通过资源归属反查项目权限。
- 所有会改变业务状态的接口返回更新后的实体和状态。
- 前端不能直接伪造 `GenerationTask.status`；状态以服务端为准。
- 文件上传使用预签名 URL 或 multipart form，最终必须生成 `GeneratedFile` 或 `Asset` 元数据。
- 人在环与真实 API 共用 `GenerationTask` 和 `GeneratedFile`，只差 `backend_mode` 和执行器。
- OpenAPI 细化写入 `spec/openapi.yaml`。
