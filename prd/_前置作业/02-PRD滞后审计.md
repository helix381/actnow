# 主 PRD 滞后审计表

> **用途**：5 路子 agent 并行通读 shaping / prd 增量 / prototype / tech / specs 全部相关文件后，汇总「主 PRD v0.30 相对各层的滞后、冲突、断层」，作为后续**逐模块重构 PRD** 的施工图。
> **生成**：2026-06-16 · 数据来源：5 路并行通读（shaping / prd增量 / prototype / tech / specs）
> **状态图例**：🔴 冲突(三方给了矛盾答案,需拍板) ／ 🟠 断层(某层有、他层完全没接) ／ 🟡 滞后(PRD 缺、需补入) ／ 🟢 已对齐
> **原则**：不删旧想法；本表只记差异与去向，**不改 PRD 正文**；逐条注明来源层与应入模块。
>
> **2026-06-16 更新**：C 区 D1-D7 **全部已决**。A 区 4 条冲突全部录入子PRD。D 区元问题多数已关闭。
> **剩余 open items（B 区断层，需后续落地）**：B1 天眼层 Canonical IR（`canonicalIrJson` 待入 schema.prisma）· B2 Skill 可配置体系（未进后端规格）· B3 工作流/场景模板对象（`workflow_templates` 表未进 schema.prisma）

---

## A. 三方打架的决策（🔴 最高优先级 · 重写 PRD 前必须先拍板）

| # | 议题 | 主 PRD v0.30 | 后端 tech/specs | 原型 | 出处 | 决策结论 |
|---|------|--------------|-----------------|------|------|---------|
| ~~A1~~ | ~~无限画布引擎~~ | ~~**tldraw**（6f-R6 / 4.5）~~ | ~~**React Flow**（已确认反转 TQ3/SG-002；s2/s3/s6/s7 全用）~~ | ~~自研 canvas（workspace.html）~~ | ~~tech/00·01，specs/s2~~ | ✅ **React Flow**（已入 `04-backend-harness.md`） |
| ~~A2~~ | ~~Agent 编排框架~~ | ~~**LangGraph.js** 或自研（4.5 / 模块10）~~ | ~~**自研 Harness 为主**，LangGraph 降为"可替换执行器"；s7 明确排除 LangGraph~~ | — | ~~tech/00·02，specs/s7~~ | ✅ **自建 Harness**（已入 `06-agent-system.md`） |
| ~~A3~~ | ~~Asset 数据建模~~ | ~~"**不是**独立实体表，是资产库聚合视图"（7.1 注）~~ | ~~**独立实体表** `assets(id,owner_scope,type,uri,metadata,source)`~~ | — | ~~tech/02·04，specs/s3~~ | ✅ **独立实体表**（已入 `07-engineering-specs.md §5`） |
| ~~A4~~ | ~~资产跨项目复用~~ | ~~列入 **MVP 做**（模块3 / 6b-R6）~~ | ~~推到**以后**，MVP 只做项目内（s3 Out of Scope）~~ | — | ~~specs/s3~~ | ✅ **推 Roadmap**（specs/s3 Out of Scope 为准） |

> ~~这 4 条不是"PRD 落后"，是三份文档对同一件事给了**互相矛盾**的答案。PRD 要立准星，先定哪个为准。~~
> **A 区 4 条全部已决，决策已录入对应子PRD。**

---

## B. 层间断层（🟠 某层画了饼、他层完全没接）

| # | 能力 | 谁定义了 | 谁没接 | 说明 |
|---|------|----------|--------|------|
| B1 | **灵感 Agent 三层出参 / 天眼层 Canonical IR** | 原型 PD-11（正面层/天眼层/剧本层契约） | tech 9 份 + specs 8 切片 **0 命中**；PRD 无 | 原型郑重定义、后端完全没开工。这是核心断层，去向需单独决定 |
| B2 | Skill 可配置体系（4 类技能 + 模型选择 + 可编辑提示词模板 + 拆镜规则） | 原型 workspace.html | 后端无对应规格 | PRD 仅"挂载 Skill 按钮存在"，无内容 |
| B3 | 工作流/场景模板对象（按 N 节点计、存为模板/一键使用） | 原型 + PRD 6f-R4/R8 提概念 | specs 8 切片**均未建表** | 模板作为数据对象无人落地 |

---

## C. 待拍板决策清单（汇总）

| 编号 | 决策 | 选项 | 状态 |
|------|------|------|------|
| ~~D1~~ | ~~无限画布引擎（A1）~~ | ~~tldraw ／ React Flow ／ 自研~~ | ✅ React Flow |
| ~~D2~~ | ~~Agent 编排框架（A2）~~ | ~~LangGraph.js ／ 自研 Harness~~ | ✅ 自建 Harness |
| ~~D3~~ | ~~Asset 数据建模（A3）~~ | ~~聚合视图 ／ 独立实体表~~ | ✅ 独立实体表 |
| ~~D4~~ | ~~资产跨项目复用（A4）~~ | ~~MVP 就做 ／ 推到 Roadmap~~ | ✅ 推 Roadmap |
| ~~D5~~ | ~~天眼层 Canonical IR（B1）~~ | ~~保留并要求后端接 ／ 降级为 Roadmap 设想~~ | ✅ **落地**：天眼层是提示词出参的一部分，后端必须接；`canonicalIrJson` 字段待补入 schema.prisma（见 `06-agent-system.md §14`） |
| ~~D6~~ | ~~创作设置删「时长」（PD-4）~~ | ~~确认删 ／ 保留~~ | ✅ **确认删**：短剧时长由剧本结构决定，非首屏预设项；创作设置 = 风格/比例/模型（已入 `02-frontend-ux.md`） |
| ~~D7~~ | ~~模块 6f 与 Canvas 专项册关系~~ | ~~6f 改为引用 ／ Canvas 册并回 6f~~ | ✅ **方案A 已落地**：`02-frontend-ux.md` 承接 6f 摘要并引用 `Canvas/PRD-Canvas.md`；Canvas 册与 01-08 平级独立存在，`00-index.md` 已引用 |

---

## D. 元问题 / 文件健康

| 项 | 说明 | 状态 |
|----|------|------|
| ~~版本基线偏差~~ | ~~`_prototype-deltas.md` 行号引用相对 PRD v0.20，主 PRD 现为 v0.30~~ | ✅ PD-1~11 已整合进各子PRD，行号引用不再需要 |
| ~~PRD 版本号自相矛盾~~ | ~~末尾仍写"当前为 v0.16 草稿"~~ | ✅ PRD.md 为只读存档，不再修改 |
| ~~shaping 失效引用~~ | ~~shaping 01/04 指向不存在的 `07-agent-team.md`~~ | ✅ shaping 全目录已归档，原始文件不再维护 |
| ~~specs 交叉引用悬空~~ | ~~specs 引用 TQ10 等编号，PRD 无 TQ 体系~~ | ✅ tech/07-open-questions.md TQ1-TQ12 已全部确认并入索引 |
| **损坏文件** | `tech/_planning-log.md`（后段上万行"（）"占位垃圾） | 🟡 **待清理**（不阻塞） |
| **shaping 整体滞后** | 入口统一/版权免责/步骤重排/组合技 这 4 项 PRD 后续改动，shaping 原文未回写 | 🟢 不阻塞——shaping 已归档只读，PRD 子文件为准 |
