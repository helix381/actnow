# 联调计划

## Mock 与真实接口

| 功能 | 前端 mock | 后端接口 | 切换条件 | 负责人 | 状态 |
| --- | --- | --- | --- | --- | --- |
| 项目创建/进入工作区 | 需要 | `POST /api/projects`、`GET /api/projects/:id/workspace` | 后端返回 Project + workspace 聚合数据 | 前端/后端 | draft |
| Agent 消息流 | 需要 | `POST /api/agent/.../messages`、SSE events | 能返回 message + event stream | Agent/后端/前端 | draft |
| 剧本锁定/打开画布 | 需要 | `POST /api/projects/:id/script/lock` | 能创建 scenes/shots/canvas 初始节点 | 后端/前端 | draft |
| 画布保存 | 需要 | `PUT /api/projects/:id/canvas` | 支持 version 乐观锁 | 前端/后端 | draft |
| 资产上传/入库 | 需要 | file signed URL + `/assets` | S3 或本地对象存储可用 | 后端/前端 | draft |
| 分镜生成 | 需要 | `/storyboard/generate` | 文本模型代理或 mock worker 可用 | Agent/后端 | draft |
| 提示词包导出 | 不建议纯 mock | `/generation-tasks/:id/prompt-package` | task 能进入 `prompt_ready` | 后端/前端 | draft |
| 人在环回传 | 需要 | `/generation-tasks/:id/uploads` | 校验 task_id、文件类型、manifest | 后端/前端 | draft |
| 合成导出 | 可以 mock | `/exports` | 至少返回 job 状态和下载占位 | 后端/前端 | P1 draft |

## 端到端路径

| 路径 | 前端页面 | 后端模块 | 数据变化 | 验收方式 | 风险 |
| --- | --- | --- | --- | --- | --- |
| 灵感输入到聊天 | home/chat stage | Project + AgentRuntime | Project、AgentThread、AgentMessage | 输入后出现 Agent 回复和 project id | 文本代理失败 |
| 聊天到画布 | chat -> canvas/sidebar | Script/Story + Canvas | ScriptDraft locked、Scene、Shot、CanvasDocument | 切画布后出现五步骤 frame 和初始节点 | PRD/原型分水岭语义待确认 |
| 资产拆解与编辑 | assets frame | Asset + AgentRuntime | Character、CharacterForm、Asset | 角色/场景/道具可编辑保存 | 角色形态字段未详设 |
| 分镜脚本生成 | storyboard frame | Storyboard + AgentRuntime | Scene、Shot、StoryboardVersion | 分镜列表可排序和保存 | 文本生成质量 |
| 分镜图提示词包 | keyframes frame | Generation | GenerationTask、PromptPackage | task 进入 prompt_ready，能导出包 | prompt schema 未终稿 |
| 人在环回传 | keyframes/videos frame | Generation + Storage | GeneratedFile、task completed | 上传后文件绑定原 task/shot | manifest 错传 |
| 视频片段到合成 | videos/export frame | Generation + Export | GeneratedFile、CompositionJob | 缺片段时阻塞，齐备后可导出占位 | 合成服务 P1 |

## 联调顺序

1. 建立项目与 workspace 聚合接口，前端从 mock 切到真实 project id。
2. 打通 Agent 文本消息流，先不接复杂工具，只保证 thread/event 可恢复。
3. 打通剧本锁定到 canvas 初始化，生成 Scene/Shot/CanvasDocument。
4. 打通资产 CRUD + 文件上传。
5. 打通 GenerationTask + PromptPackage，不接真实图像/视频 API。
6. 打通人在环回传校验与 GeneratedFile 版本入库。
7. 打通画布节点状态订阅/轮询，让 task 状态驱动 UI。
8. 最后接合成导出占位或真实 worker。

## 环境与配置

| 环境 | 用途 | 后端模式 | 外部依赖 | 数据策略 |
| --- | --- | --- | --- | --- |
| local | 本地开发 | mock + sample + 可选公司代理 | PostgreSQL/Redis/S3 可用 Docker Compose | seed/mock |
| dev | 联调 | 文本真 API + 图像/视频人在环 | 公司代理、对象存储、Redis | 可重置 |
| staging | 演示验收 | 文本真 API + 人在环 + 样例兜底 | 接近生产 | 保留演示数据 |
| prod | 正式 | 文本真 API + 未来图像/视频真 API | 正式密钥、监控、备份 | 不可随意重置 |
