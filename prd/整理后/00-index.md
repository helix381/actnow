# ActNow PRD 索引

| 字段 | 内容 |
|------|------|
| 版本 | v0.6 |
| 日期 | 2026-06-16 |
| 状态 | 维护中 |

> 读者：内部（主公自用）。对外PRD另行撰写，不在此处。
> 更新原则：工程文件改了→先改对应子PRD→再来更新本索引说明。
> 来源PRD：`../PRD.md`（v0.30，历史主文件，只读存档，不删不改）
> 编辑规则：见 [README.md](README.md)

---

## 核心层（产品思考，与工程无关）

| 文件 | 内容 | 状态 |
|------|------|------|
| [01-core-prd.md](01-core-prd.md) | 项目背景 · 用户与场景 · 目标指标范围 · Harness架构哲学 · 两大范式决策 | ✅ 已整理 |

---

## 工程子PRD层

| 文件 | 对应原PRD模块 | 内容摘要 | 状态 |
|------|--------------|---------|------|
| [02-frontend-ux.md](02-frontend-ux.md) | 4.3 / 4.4 / 5 / 6a / 6b / 6c / 6d / 6f | 信息架构 · 页面骨架 · 功能总览 · 创意阶段 · 资产管理 · 分镜生成 · 合成导出 · 画布（引用Canvas子PRD）| ✅ 已整理（含PD-1~11）|
| [03-fullstack-contract.md](03-fullstack-contract.md) | 4.4主流程 / 6e / 8 / 9 | 主流程 · Agent聊天框 · 生成任务状态机 · 人在环交付协议 | ✅ 已整理 |
| [04-backend-harness.md](04-backend-harness.md) | 4.5 / 7 / 10 | 技术栈选型 · 数据模型与对象关系 · Agent编排（自建Harness）| ✅ 已整理 |
| [05-ops-governance.md](05-ops-governance.md) | 11 / 12 / 13 / 14 | 业务规则与异常 · 数据埋点权限账号 · 上线与运营 · 风险待决自检 | ✅ 已整理 |
| [06-agent-system.md](06-agent-system.md) | — | Multi-Agent系统完整规格：5 Agent规格·Harness·genesis_step状态机·SABC分级·response_type·SSE流式·事件流·schema差异记录 | ✅ 已整理 |
| [07-engineering-specs.md](07-engineering-specs.md) | spec/ + tech/01/02/05/06 | 工程原则·环境变量·事件队列·数据库规划schema·存储规范·API契约·Git/PR规范·切片索引+验收标准+串并行+反模式·前端组件分层+状态管理·后端服务模块·联调计划8步+E2E路径+环境矩阵 | ✅ 已整理 |
| [08-design-system.md](08-design-system.md) | prototype/design-system/ | 设计Thesis·颜色系统·排版·布局·组件规则·动效规则·参考吸收记录·视觉QA记录·原型待确认 | ✅ 已整理 |

> 画布工作台（6f）已有专项文件：[Canvas/PRD-Canvas.md](../Canvas/PRD-Canvas.md)（C0-C10已完成），`02-frontend-ux.md` 引用而非重复。

---

## 专项/冲突记录

| 文件 | 内容 | 状态 |
|------|------|------|
| [09-decisions-log.md](09-decisions-log.md) | 决策日志：A区技术栈冲突（全决）· B区层间断层（B1/B2/B3 追踪中）· C区产品决策（D1-D7全决）· D区文件健康 | ✅ 已整理 |
| [../_前置作业/02-PRD滞后审计.md](../_前置作业/02-PRD滞后审计.md) | 三方冲突（canvas引擎/agent框架/资产模型）+ 层断点 + 待决事项 | 📌 原始来源，已归档进 [09-decisions-log.md](09-decisions-log.md) |
| [../_prototype-deltas.md](../_prototype-deltas.md) | 原型迭代产生的11条产品决策变更（PD-1~11） | ✅ 已合并进各子PRD |
| [../../agents/AGENTS-PRD.md](../../agents/AGENTS-PRD.md) | Multi-Agent系统PRD v0.3（权威来源，已归档进06-agent-system.md）| 📌 只读存档 |
| [../Multi-Agent-Chatroom/PRD-Multi-Agent-Chatroom.md](../Multi-Agent-Chatroom/PRD-Multi-Agent-Chatroom.md) | 聊天体验与事件可见性基线 v0.4（已归档进06-agent-system.md）| 📌 只读存档 |

---

## 工程参考（非PRD，工程真相层）

| 资源 | 路径 | 说明 |
|------|------|------|
| 原型真相 | `../prototype/workspace.html` | 当前产品决策的最终仲裁，单页四阶段（HOME/WORK/STUDIO/MYWORKS） |
| 技术规格 | `../tech/specs/s1-s8` | 后端数据模型·API·状态机·编排，React Flow（非tldraw），自建Harness（非LangGraph） |
| 原型-后端对齐 | `../tech/10-prototype-flow-alignment.md` | 原型↔工程的流程对齐文档 |
| 数据库真相 | `../../packages/db/prisma/schema.prisma` | 实际建表结构，与PRD module 7 ER 图有出入（见06-agent-system.md §14）|
| Agent 提示词 | `../../agents/director/` | director系统提示词 + skills（g2_five_contracts.md等天眼层定义）|
| 前后端对齐规格 | `../../tech/10-prototype-flow-alignment.md` | 产品主线T0-T4逐turn映射到API/事件/写库；含数据模型差距+实施切片S-A~G（已归档进04-backend-harness.md §7.4）|
| ⚠️ apps/web | `../../apps/web/` | React+React Flow工具页，仅用于后端API联调，**不是产品前端**；真前端 = prototype/workspace.html |
| 技术决策记录 | `../../tech/07-open-questions.md` | TQ1-TQ12全部已确认：React Flow / NestJS+Prisma / BullMQ / Docker Compose / ActNow Harness / demo单用户 |
| 数据与状态 | `../../tech/04-data-and-state.md` | 核心对象ER图 + GenerationTask状态机 + AgentRuntime状态 + Canvas状态（与spec/database.md互为真源）|
| 工程规格层 | `../../spec/` | ✅ 已归档进 [07-engineering-specs.md](07-engineering-specs.md)；原始文件保留 |
| 特性执行规格 | `../../specs/s1-s9/` | ✅ 索引已归档进 [07-engineering-specs.md §9](07-engineering-specs.md)；各切片原始文件保留 |
| Canvas专项PRD | `../Canvas/PRD-Canvas.md` | 制作画布完整规格：坐标系/Frame/组件/简单卡片/端口连线/组合技，C0-C10 |
| 产品定型 | `../../shaping/06-shaped-brief.md` | 产品定型入场凭证：做/不做/MVP范围/核心差异能力/交互范式/技术决策/风险 |
| 运维经验 | `../../经验/AIGC-Platform-协作推进经验记忆.md` | Docker安装/端口/构建坑点/验证顺序；前端入口 localhost:4173（非5173，Windows保留端口）|

---

## 修改记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-06-16 | v0.1 | 初始创建，定义5个子PRD（01-05）|
| 2026-06-16 | v0.2 | 补充 agents/AGENTS-PRD.md + schema.prisma + tech/10 发现的差距；06-agent-system.md 新增 |
| 2026-06-16 | v0.3 | 全面补充工程参考层（spec/ / specs/ / tech/04 / tech/07 / Canvas PRD / 经验/ / shaping/）；所有子PRD状态更新为 ✅ |
| 2026-06-16 | v0.4 | 新增 07-engineering-specs.md（spec/全目录归档）+ 08-design-system.md（prototype/design-system/归档）；工程参考层引用更新 |
| 2026-06-16 | v0.5 | 07-engineering-specs.md 升至 v0.2，补入 tech/01/02/05/06 精华（前端组件分层·后端服务模块·联调计划·切片验收+反模式）；确认 shaping/02-04 内容已完全覆盖；审计 ❓ 全部清零 |
| 2026-06-16 | v0.6 | 新增 09-decisions-log.md（从 prd/_前置作业/02-PRD滞后审计.md 归档）；专项记录区更新引用 |
