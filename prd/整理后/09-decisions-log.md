# ActNow PRD 决策日志

| 字段 | 内容 |
|------|------|
| 版本 | v0.3 |
| 日期 | 2026-06-20 |
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
| ~~B1~~ | **天眼层 Canonical IR** | 原型 PD-11（正面层/天眼层/剧本层三层出参契约） | G3 两阶段流式生成、事件返回、前端资产展示、`Project.canonicalIrJson` 持久化与重进恢复均已接通 | ✅ **已关闭** |
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
| ~~D5~~ | ~~天眼层 Canonical IR 定位~~ | ✅ 落地：是提示词出参的一部分，后端已接并通过 `Project.canonicalIrJson` 持久化 | [06-agent-system.md §14](06-agent-system.md) |
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

## E. 前后端结合路线决策（v1 重建，2026-06-17）

> 背景：ActNow 前端分叉——真前端 `prototype/pages/workspace-v0.html`（静态原型）未连后端；`apps/web`（React，已连后端）是当初用来验证 API 连通性的测试件。经多轮评估 + React 保真试片验证，定下如下路线。

| # | 决策 | 结论 | 去向 |
|---|------|------|------|
| E1 | 真前端实现路线 | ✅ **B：React + React Flow + Vite 重建真前端**；workspace.html(v0) 作像素/交互规格，**原地改造 apps/web 为生产前端 workspace v1** | [07 §13](07-engineering-specs.md) |
| E2 | workspace 版本命名 | ✅ **v0** = 旧静态原型 `prototype/pages/workspace-v0.html`（只读设计规格，已改名冻结）；**v1** = apps/web 改造的 React 生产前端 | [07 §13](07-engineering-specs.md) |
| E3 | 后端策略 | ✅ **连接 + 边缘重塑，不重写**：创意半边（~80% 前端无关）保留；只调 presenter/DTO 形状贴合 v1；生成半边新建 | [04](04-backend-harness.md) / [07 §13](07-engineering-specs.md) |
| E4 | api.ts 契约 | ✅ apps/web 的 `api.ts` 已验证可用，作为复用契约层保留；其 React UI(stages) 弃用，以 workspace.html 设计为准 | [03](03-fullstack-contract.md) |
| E5 | 画布引擎 | ✅ **React Flow**（再确认 A1/D1）：复刻 `.ca-stage` 分阶段帧为自定义 RF 节点，天然匹配后端 canvas 契约 | [07 §13](07-engineering-specs.md) |
| E6 | 保真验证 | ✅ React 试片已验证 HOME/composer/下拉/**FLIP 转场**/导航外壳像素级 + 动画可还原（命令式 FLIP 经 refs 照搬，CSS 复用 design-system + 内联抽出）| 试片：`prototype/_react-fidelity-probe/` |

> **生成半边 schema 缺口**（随 E3/S3 落地）：`canonicalIrJson`（B1 天眼层）已入 `schema.prisma` 并完成迁移；`GenerationTask`、`Asset`（A3 已决独立表）、`GeneratedFile` 仍是 v1 生成流程前置。

---


---

## F. Agent 系统优化决策（2026-06-21，参考旧公司快出片经验）

| # | 议题 | 旧公司做法 | 决策结论 | 已录入 |
|---|------|-----------|---------|--------|
| F1 | 新增 Graphic Designer Agent | 旧公司封面Agent独立，提示词美学单独迭代 | ✅ **新增 Designer agent**：负责角色/场景/道具/封面的 generation_prompt；Asset 只做纯数据解耦 | [04 §10.2](04-backend-harness.md) / [06 §3](06-agent-system.md) |
| F2 | Storyboard + Cinematographer 合并 | 旧公司融生分镜师一个 agent 搞定景别/运镜/时间码 | ✅ **合并为 Storyboard agent**：分镜+摄影一体，避免双重处理 | [04 §10.2](04-backend-harness.md) / [06 §3](06-agent-system.md) |
| F3 | Director 定义修正 | 大纲是 Director 的核心产出 | ✅ **Director = 协调中枢 + 直接生成（G1/G2/G3）**，修正 PRD 04 §10.2"不直接生成内容"的错误定义 | [04 §10.2](04-backend-harness.md) |
| F4 | G1/G1.5 合并 + 参数简化 | META-mode: 三前置选择一步完成 | ✅ **G1 完成发散+意图解读，G1.5 只做轻量确认**（集数推荐+受众）；删除节奏选项（短剧=快）；受众改为男频/女频/泛大众 | [06 §5](06-agent-system.md) |
| F5 | 首页参数前置 | META-mode: 画风/性别/题材三前置 | ✅ **风格/画风/比例/模型在首页选好**，存入 project.settings，用 tool 拼到 agent 入参；题材从用户输入解读不选；画风后续扩展 | [02 §4.3](02-frontend-ux.md) |
| F6 | 每步可编辑气泡 | 旧公司无此设计（纯文本输出） | ✅ **每个 Agent 输出支持 inline 编辑+确认**，升级审批门为可编辑气泡模式 | [03 §6e](03-fullstack-contract.md) / [02 PD-11](02-frontend-ux.md) |
| F7 | Tools 定义 | 旧公司纯提示词，无 tool | ✅ **Tools = 入参拼装 / 出参组装 / 前后端中间件**，不做判断/分类（那是 LLM 的事） | [06 新增§15](06-agent-system.md) |
| F8 | Skills 分层 | 旧公司 RAG 知识库 ~250KB | ✅ **Skills = 精华规则 ≤22KB/agent；References = 完整知识库按需注入** | [06 新增§15](06-agent-system.md) |


## 修改记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-06-16 | v0.1 | 从 `prd/_前置作业/02-PRD滞后审计.md` 搬运归档；A/C/D 区全部决策已关闭；B 区 3 条断层保留追踪 |
| 2026-06-17 | v0.2 | 新增 E 区：前后端结合路线决策（v1 React 重建 / apps/web 改造 / 连接不重写 / React Flow 画布 / 保真验证），E1-E6 + 生成半边 schema 缺口 |
| 2026-06-20 | v0.3 | 关闭 B1：G3 两阶段流式生成、事件/前端资产展示、Canonical IR 项目持久化与重进恢复均已落地；同步审批动作白名单验证结果 |
| F9 | 文件级配置系统(settings.json) | Claude Code有.claude/settings.json分层配置 | ✅ **新增 .actnow/settings.json**（项目级）+ settings.local.json（本地级）；Project.settings从文件加载+用户操作合并；全局hooks可在settings.json中定义 | [04 §7.3.1](04-backend-harness.md) |

| 2026-06-21 | v0.4 | 新增 F 区：Agent 系统优化决策（F1-F8，含 Designer 新增 / 分镜+摄影合并 / G1G1.5 合并 / 首页参数前置 / 可编辑气泡 / Tools 定义 / Skills 分层）；同步更新 02/03/04/06 各子 PRD |
