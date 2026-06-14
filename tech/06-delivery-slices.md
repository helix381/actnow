# 研发切片

| 切片 | 用户价值 | 前端范围 | 后端范围 | API/数据 | 验收标准 | 依赖 | 优先级 | Spec |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| S1 工作区最小闭环 | 用户能创建项目并进入聊天工作区 | home/chat stage/rail/输入框 | Project、AgentThread、文本代理接入或 mock | Project、AgentThread、Message | 输入灵感后创建项目并看到回复 | 无 | P0 | `specs/s1-workspace-chat` |
| S2 剧本锁定进入画布 | 用户能从聊天切到制作画布 | chat/sidebar/canvas 三态、五步骤 frame | Script lock、Scene/Shot 初始化、CanvasDocument | Episode、Scene、Shot、CanvasDocument | 打开画布后节点与场景/镜头数据一致 | S1 | P0 | `specs/s2-script-to-canvas` |
| S3 资产管理 | 用户能管理角色/场景/道具 | assets frame、资产抽屉、上传入口 | Asset CRUD、file upload | Asset、Character、CharacterForm | 上传/编辑/绑定资产后画布同步 | S2 | P0 | `specs/s3-asset-management` |
| S4 分镜脚本 | 用户能生成并编辑分镜 | storyboard frame、镜头列表、排序/编辑 | Storyboard service、文本模型调用 | Scene、Shot、StoryboardVersion | 分镜可生成、编辑、保存、重排 | S2/S3 | P0 | `specs/s4-storyboard` |
| S5 分镜图人在环 | 用户能导出提示词包并回传图 | keyframes frame、prompt panel、upload dialog | GenerationTask、PromptPackage、GeneratedFile | task_id、manifest、GeneratedFile | 回传图片绑定到对应 shot/task | S3/S4 | P0 | `specs/s5-keyframe-human-loop` |
| S6 视频片段人在环 | 用户能对镜头生成/回传视频 | videos frame、状态 badge、重试/取消 | GenerationTask、GeneratedFile | video task/file versions | 视频片段状态从 waiting_upload 到 completed | S5 | P0 | `specs/s6-video-human-loop` |
| S7 Agent 指令驱动画布 | 用户能用对话修改节点或触发任务 | AgentPanel focus、确认卡片、画布刷新 | ActNow Harness、ToolCall、target resolution | AgentEvent、ToolCall、target_ref | “只重生成第 8 镜”能定位、确认并创建 task | S2-S6 | P0 | `specs/s7-agent-canvas-control` |
| S8 合成导出占位 | 用户能看到成片导出路径 | export frame、预览/下载入口 | CompositionJob、placeholder worker | CompositionJob、GeneratedFile、signed URL | 素材齐备后可生成下载占位 | S6 | P1 | `specs/s8-export-placeholder` |
| S9 工程部署 | 团队能在服务器/本地稳定跑 demo | env 配置、构建产物 | Docker Compose、migration、seed、日志 | env/storage/db/events | 新环境一键启动并跑通 S1-S6 smoke | S1-S6 | P0 | `specs/s9-docker-deployment` |

## 推荐推进顺序

1. S1 工作区最小闭环。
2. S2 剧本锁定进入画布。
3. S9 工程部署穿插建设，不能最后才补。
4. S3 资产管理。
5. S4 分镜脚本。
6. S5 分镜图人在环。
7. S6 视频片段人在环。
8. S7 Agent 指令驱动画布。
9. S8 合成导出占位保持 P1，但 export frame 和数据模型先保留。

## 串并行原则

- S1/S2 是产品骨架，必须优先给前后端对齐。
- S9 可以与 S1-S6 并行推进，因为 Docker、环境变量、数据库、对象存储和队列会反向影响后端结构。
- S7 依赖 S2-S6 的对象、状态和任务协议，不应早于这些真源实现。
- S8 不阻塞 MVP 主链路，但不能把生成产物生命周期设计成临时文件。

## 不建议拆法

- 不建议先做纯静态前端页面而不接 project/task 数据，否则后续状态机会返工。
- 不建议后端先建全量表再等前端，应按 S1-S9 切片逐步落库。
- 不建议先接真实图像/视频 API；开发期先把人在环协议和任务状态跑通。
- 不建议把 Agent 做成泛聊天；必须从 S7 开始绑定 `focus_ref`、`target_ref` 和 `ToolCall`。
- 不建议把部署放到最后；数据库、对象存储、队列、环境变量会反向影响后端结构。
