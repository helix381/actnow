# ActNow PRD 决策日志

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 日期 | 2026-06-16 |
| 状态 | 维护中 |

> **用途**：记录跨层冲突的拍板结论、层间断层的落地状态、文件健康问题的处置情况。决策已定的用~~划线~~标注，open items 持续追踪。
> **来源**：`prd/_前置作业/02-PRD滞后审计.md`（5 路并行通读 shaping / prd增量 / prototype / tech / specs 后汇总，2026-06-16）
> **状态图例**：🔴 待拍板 ／ 🟠 断层待落地 ／ 🟡 待清理 ／ ✅ 已决/已关闭

---

## A. 技术栈冲突决策（全部已决）

PRD v0.30、后端 tech/specs、原型三方对以下问题给出了互相矛盾的答案，已逐一拍板：

| # | 议题 | PRD 原文 | 工程事实 | 决策结论 | 已录入 |
|---|------|---------|---------|---------|--------|
| ~~A1~~ | ~~无限画布引擎~~ | ~~tldraw~~ | ~~React Flow（TQ3/SG-002 确认）~~ | ✅ **React Flow** | [04-backend-harness.md](04-backend-harness.md) |
| ~~A2~~ | ~~Agent 编排框架~~ | ~~LangGraph.js 或自研~~ | ~~自建 Harness 为主，LangGraph 降为可替换执行器~~ | ✅ **自建 Harness** | [06-agent-system.md](06-agent-system.md) |
| ~~A3~~ | ~~Asset 数据建模~~ | ~~资产库聚合视图，非独立表~~ | ~~独立实体表 `assets`~~ | ✅ **独立实体表** | [07-engineering-specs.md §5](07-engineering-specs.md) |
| ~~A4~~ | ~~资产跨项目复用~~ | ~~MVP 做~~ | ~~specs/s3 Out of Scope~~ | ✅ **推 Roadmap** | [07-engineering-specs.md §9](07-engineering-specs.md) |

---

## B. 层间断层（🟠 原型/PRD 定义了，后端还没接）

| # | 能力 | 谁定义了 | 缺什么 | 状态 |
|---|------|---------|--------|------|
| B1 | **天眼层 Canonical IR** | 原型 PD-11（正面层/天眼层/剧本层三层出参契约） | `canonicalIrJson` 字段未入 `schema.prisma`；后端 0 切片覆盖 | 🟠 **待落地**：天眼层是提示词出参的一部分，后端必须接（D5 已决） |
| B2 | **Skill 可配置体系** | 原型 workspace.html（4 类技能 + 模型选择 + 可编辑提示词模板 + 拆镜规则） | 后端无对应规格，PRD 仅有"Skill 按钮入口"概念 | 🟠 **待规格**：Roadmap 级，MVP 先保留入口占位 |
| B3 | **工作流/场景模板对象** | 原型 + PRD 6f-R4/R8 | `workflow_templates` 表在 `spec/database.md` 有规划，但 `schema.prisma` 未建 | 🟠 **待落地**：开发时随 S7 Agent 画布控制一并补入 |

---

## C. 产品决策清单（全部已决）

| 编号 | 决策 | 结论 | 已录入 |
|------|------|------|--------|
| ~~D1~~ | ~~无限画布引擎~~ | ✅ React Flow | [04-backend-harness.md](04-backend-harness.md) |
| ~~D2~~ | ~~Agent 编排框架~~ | ✅ 自建 Harness | [06-agent-system.md](06-agent-system.md) |
| ~~D3~~ | ~~Asset 数据建模~~ | ✅ 独立实体表 | [07-engineering-specs.md](07-engineering-specs.md) |
| ~~D4~~ | ~~资产跨项目复用~~ | ✅ 推 Roadmap | [07-engineering-specs.md](07-engineering-specs.md) |
| ~~D5~~ | ~~天眼层 Canonical IR 定位~~ | ✅ 落地：是提示词出参的一部分，后端必须接；`canonicalIrJson` 待补入 schema.prisma | [06-agent-system.md §14](06-agent-system.md) |
| ~~D6~~ | ~~创作设置删「时长」~~ | ✅ 确认删：短剧时长由剧本结构决定，非首屏预设项；创作设置 = 风格/比例/模型 | [02-frontend-ux.md](02-frontend-ux.md) |
| ~~D7~~ | ~~模块 6f 与 Canvas 专项册关系~~ | ✅ 方案 A：`02-frontend-ux.md` 承接 6f 摘要并引用 Canvas PRD；Canvas 册与 01-08 平级独立存在 | [00-index.md](00-index.md) |

---

## D. 文件健康

| 项 | 状态 |
|----|------|
| ~~_prototype-deltas.md 行号引用基于旧版本~~ | ✅ PD-1~11 已整合进各子PRD，行号引用不再需要 |
| ~~PRD.md 末尾版本号自相矛盾~~ | ✅ PRD.md 为只读存档，不再修改 |
| ~~shaping 失效引用（07-agent-team.md 不存在）~~ | ✅ shaping 全目录已归档只读，不再维护 |
| ~~specs 引用 TQ 编号但 PRD 无 TQ 体系~~ | ✅ tech/07 TQ1-TQ12 全部确认，已入 00-index.md 引用 |
| `tech/_planning-log.md` 后段上万行"（）"占位垃圾 | 🟡 **待清理**（不阻塞） |
| shaping 原文未回写 PRD 后续改动 | 🟢 不阻塞——shaping 已归档只读，子PRD 为准 |

---

## 修改记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-06-16 | v0.1 | 从 `prd/_前置作业/02-PRD滞后审计.md` 搬运归档；A/C/D 区全部决策已关闭；B 区 3 条断层保留追踪 |
