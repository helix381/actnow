# 前后端规划日志

| 时间 | 模块 | 来源 | 用户确认状态 | 待确认 |
| --- | --- | --- | --- | --- |
| 2026-06-11 | 初始化 | PM-TechTeam | 用户口头确认“开工大吉” | 无 |
| 2026-06-11 | 开工条件评估 | `prd/PRD.md`、`prd/Canvas/PRD-Canvas.md`、`prototype/pages/workspace.html`、`prototype/design-system/*`、`prototype/visual-qa.md` | 可以开工，先 draft | TQ1-TQ12 |
| 2026-06-11 | 工程骨架 | `scripts/init_workspace.py` | 已创建 `tech/`、`spec/`、`specs/`、`.planning/` | 后续需填充各模块 |
| 2026-06-11 | 风险收口 | `tech/07-open-questions.md` | 已集中记录真源、JSON、画布、后端、队列、Docker、Agent 编排等问题 | 待用户/技术负责人确认 |
| 2026-06-11 | 关键决策确认 | 用户确认 | TQ1 已确认：以原型为准；TQ6 已确认：先按单机 Docker Compose 规划 | TQ3/TQ4/TQ5 |
| 2026-06-12 | Harness 与队列决策 | 用户确认 | TQ5 已确认：不用数据库轮询；TQ9 已确认：先做 ActNow 自己的 Harness 数据结构和事件日志，LangGraph 仅作可替换执行器 | TQ3/TQ4 |
| 2026-06-12 | 前端/后端/MVP 范围确认 | 用户确认 | TQ2 已澄清：页面流不采用；TQ3 已确认：正式按 React Flow 推进；TQ4 已确认：后端主技术栈 OK；TQ7 已确认：MVP demo 单用户；TQ8 已确认：文本走公司代理、图像/视频人在环；TQ11 已确认：原型动效都进入 MVP | TQ10/TQ12 |
