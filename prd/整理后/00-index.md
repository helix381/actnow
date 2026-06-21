# ActNow PRD 索引

| 字段 | 内容 |
|------|------|
| 版本 | v0.12 |
| 日期 | 2026-06-21 |
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
| ~~`agents/AGENTS-PRD.md`~~ | Multi-Agent系统PRD v0.3 → **已删除，归档进 [06-agent-system.md](06-agent-system.md)** | 📌 已归档 |
| [../Multi-Agent-Chatroom/PRD-Multi-Agent-Chatroom.md](../Multi-Agent-Chatroom/PRD-Multi-Agent-Chatroom.md) | 聊天体验与事件可见性基线 v0.4（已归档进06-agent-system.md）| 📌 只读存档 |

---

## 工程参考（非PRD，工程真相层）

| 资源 | 路径 | 说明 |
|------|------|------|
| 原型真相 v0 | `../prototype/pages/workspace-v0.html` | 设计规格 / UX 最终仲裁，单页四阶段（HOME/WORK/STUDIO/MYWORKS）；v1 React 重建见 [09 §E](09-decisions-log.md) |
| 生产前端 v1 | `../../apps/web/` | 原 API 联调测试件，**正按 [09 §E](09-decisions-log.md) 原地改造为 React 生产前端 v1**；其 `api.ts` 为复用契约层 |
| 数据库真相 | `../../packages/db/prisma/schema.prisma` | 实际建表结构（schema 差异见 06-agent-system.md §14）|
| Agent 提示词 | `../../agents/director/` | director 系统提示词 + skills（g2_five_contracts.md 等天眼层定义）|
| Canvas 专项 PRD | `../Canvas/PRD-Canvas.md` | 制作画布完整规格：坐标系/Frame/组件/端口连线/组合技，C0-C10 |

> 注：原 `tech/` `spec/` `specs/` `shaping/` `经验/` 已删除，内容已归档进 prd/ 各文档（spec+specs+tech → [07](07-engineering-specs.md)；shaping → [01](01-core-prd.md)；TQ/状态机/对齐 → [04](04-backend-harness.md) / [09](09-decisions-log.md)）。需原文见 git 历史。

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
| 2026-06-17 | v0.7 | workspace.html → workspace-v0.html 改名同步；apps/web 定性翻转为 v1 生产前端；清理工程参考区指向已删 tech/spec/specs/shaping/经验 的死链 + AGENTS-PRD 死链 |
| 2026-06-20 | v0.8 | 同步 G3 两阶段流式生成、Genesis worker 禁令、Canonical IR 项目持久化与恢复、角色/场景/道具资产展示及空态规则；审批动作改为严格白名单，未知动作不得误执行 |
| 2026-06-21 | v0.9 | 同步首页最近项目与“我的创作 / 作品”共用真实项目数据源，移除作品页静态项目分叉 |
| 2026-06-21 | v0.10 | 同步资产提示词确认、占位模拟生图完成后再进入分镜稿的串行流程 |
| 2026-06-21 | v0.12 | Agent 系统重构：06 新增 Designer/合并分镜+摄影/Tools+Hooks 清单；04 更新 Agent 清单+路由；03 更新流程+出参；02 新增 PD-12 可编辑气泡；01 更新架构图；09 新增 F 区决策 |
| 2026-06-21 | v0.11 | 同步分镜 Agent 注入已确认剧本/资产上下文及逐镜完整字段契约 |
