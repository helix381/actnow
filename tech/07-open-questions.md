# 前后端规划待确认问题

| 编号 | 问题 | 影响范围 | 推荐默认值 | 决策人 | 优先级 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| TQ1 | PRD 与原型差异的真源规则 | 前端、交互、API、状态 | 技术规划先按原型事实执行，PRD 回写走 `tech/changes/` | 用户 | 高 | 已确认：以原型为准，PRD 初版后续通过变更包回写 |
| TQ2 | `prototype/design-model.json` 是否作为机器真源继续使用 | 原型到工程、Figma/平替 MCP、自动生成 | 文件可用但属于早期页面流/画布中间模型；页面流不采用，当前不作为工程真源 | 用户/前端 | 中 | 已确认：不采用页面流；以 `workspace.html` + Canvas PRD + prototype deltas 为准 |
| TQ3 | 生产画布技术路线：React Flow、tldraw、react-konva 三者如何取舍 | 前端架构、协作、性能 | MVP 主画布正式按 React Flow 推进；tldraw 备选；react-konva 不进 MVP 主路线 | 用户/技术负责人 | 高 | 已确认：正式按 React Flow 推进 |
| TQ4 | 后端是否按 NestJS + Prisma + PostgreSQL + S3 兼容存储 + Redis/BullMQ 作为默认技术栈推进 | 后端、部署、数据迁移 | 按该组合推进，Harness 数据结构和事件日志作为产品真源 | 用户/技术负责人 | 高 | 已确认 |
| TQ5 | 异步任务队列是否使用 BullMQ + Redis，是否排除数据库轮询作为正式方案 | 生成任务、Agent、部署 | BullMQ + Redis 做正式队列；PostgreSQL 只存任务状态真源；不用数据库轮询做主方案 | 用户/后端 | 高 | 已确认：不用数据库轮询 |
| TQ6 | Docker/服务器部署目标 | 部署、环境变量、CI/CD | MVP 先按单机 Docker Compose + 可迁移云服务规划 | 用户/部署负责人 | 高 | 已确认：先按单机 Docker Compose 规划 |
| TQ7 | 鉴权账号是否 MVP 必做，还是本地 demo 暂用单用户模式 | 后端、数据隔离、权限 | MVP demo 单用户模式；保留 User/Workspace 数据结构，功能通过后再做登录 | 用户 | 中 | 已确认 |
| TQ8 | 人在环是否只覆盖图像/视频，文本任务是否全部接公司代理 API | AI 适配、成本、接口 | 文本走公司代理；图像/视频开发期人在环 | 用户 | 中 | 已确认 |
| TQ9 | Agent 编排是否必须接 LangGraph.js，还是先做 ActNow 自己的 Harness 数据结构和事件日志 | Agent runtime、开发复杂度、长期可替换性 | 先做 ActNow Harness：AgentThread、AgentEvent、ToolCall、HumanApproval、RuntimeResource；LangGraph 仅作可替换执行器 | 用户/技术负责人 | 中 | 已确认：先做 ActNow Harness 数据结构和事件日志 |
| TQ10 | 生成产物版本、清理、访问策略 | 存储、成本、隐私 | 图片/视频/成片默认全保留；除非用户主动删除；当前版本由用户确认；版本太多时建议用户打包到本地归档，后续需要可再上传；访问走后端签名 URL | 用户/后端 | 中 | 已确认 |
| TQ11 | 原型动画中 FLIP、pan/zoom、拖拽、连线、抽屉等哪些必须进入 MVP | 前端范围、排期 | 原型已出现的关键动效全部进入 MVP，但按性能和 reduced-motion 规则工程化实现 | 用户/前端 | 中 | 已确认：原型动效都必须进入 MVP |
| TQ12 | 是否继续创建 S7-S9 feature specs | spec 工作流、研发并行 | 继续拆 S7-S9；优先 S9 工程部署，其次 S7 Agent 驱动画布，S8 合成导出占位为 P1 | 用户/PM-TechTeam | 中 | 已确认 |
