# 原型产品流 ↔ 后端对齐规格

| 字段 | 内容 |
| --- | --- |
| 文档版本 | v0.2（整合灵感阶段世界观补齐 + 参数/集数纠正）|
| 创建日期 | 2026-06-14 |
| 定位 | 前后端共同 contract：把「原型 + PRD 的产品主线」逐 turn 映射到后端 API / 事件 / 数据写入，并列出改造清单与实施切片 |
| 真源关系 | `prototype/pages/workspace.html` + `prd/PRD.md` + `prd/_prototype-deltas.md`（PD-11）= 产品真源；本文 = 实现对齐基准 |
| Git 基线 | `52e105a`（含 lockScript bug 修复）|

> 背景纠偏：`apps/web`（React+React Flow）是后端测 API 连通的工具页，**不是前端真源**；前端真源是原型 `prototype/pages/workspace.html`（纯手写画布）。「对齐」= 让后端能力去支撑原型/PRD 这条产品流。

---

## 0. 本轮已决策（基线约束）

| 决策 | 内容 | 来源 |
| --- | --- | --- |
| 产品流以原型/PRD 为准 | 废弃 codex 的「短片参数确认卡」主交互 | 用户 6/14 |
| **短剧 ≠ 短片** | 短剧是**分集整季（N 集）**，不是 1 分钟短片；删除「影片长度 <>1 分钟」 | 用户 6/14 |
| **灵感阶段 = 导演黑盒补世界观** | 导演 Agent 亲自把一句灵感推理成「天眼层世界观暗骨 + 正面层分集大纲」，是核心卖点（让用户真正当导演） | 用户 6/14 + PD-11 |
| Agent 归属 | **导演 Agent = 总控 + 灵感大脑**，亲自产出世界观+大纲（不新增独立「灵感 Agent」）；编剧产单集剧本、资产产资产 | 用户 6/14 |
| 创作参数在首页定 | 对白语言**默认中文**、视频比例**默认横屏 16:9**、风格在首页创作设置条选；**不在聊天流里追问** | 用户 6/14 |
| 集数 | 导演按题材/篇幅**推荐 N 集，用户在大纲卡可改** | 用户 6/14 |
| MVP 范围 | **整季大纲 + 仅第 1 集打通「剧本→资产→画布」闭环** | 用户 6/14 (OQ3) |
| 本期动作 | **先评审定稿本文档，暂不写代码** | 用户 6/14 (OQ7) |

---

## 1. 产品主线总览（以原型/PRD 为准）

chat stage 是一条**线性引导流**，右侧「阅读时间轴」贯穿，每步一个确认按钮推进：

| 时间轴 | 内容 | 主导角色 | 推进动作 |
| --- | --- | --- | --- |
| 灵感 | 用户首页输入一句灵感（已携带首页选定的 风格/比例/语言）；或「上传整季剧本」 | 用户 | 进入聊天室 |
| 大纲 | 导演**黑盒推理**产出：**正面层分集大纲**（剧名+概览+题材+EP01–EPN，推荐 N 集可改）＋ **天眼层世界观暗骨**（Canonical IR，折叠预留），全字段可编辑 | 导演 | 「确认大纲，生成第1集剧本 →」 |
| 剧本 | 产出**第 1 集剧本**（叙事单元/场景头/动作行/台词行，可编辑） | 编剧 | 「确认剧本，拆解资产 →」 |
| 资产 | **从第 1 集剧本拆资产**（角色/场景/道具 + 标签） | 资产 | 「确认资产，推入画布 ⚡」 |
| 确认 | 切画布 **side 态**（画布内嵌 chat，非独立页） | — | setMode('side') |

> 原型时间轴里的「方向」节点（导演给 3 个方向选项让用户选）是抄 oii 的简化，**本规格删除**；创作方向收敛已并入「导演黑盒补世界观 + 大纲」一次产出（导演可在大纲文案里体现方向判断，必要时才追问关键缺失设定）。

延续 PRD/原型硬边界：
- 用户确认前不写业务表；任何状态变更先出 `approval_required`。
- 内部指令/route JSON/run id/模型名/天眼层原始 payload 不展示；确认后用户气泡只显示「信息已确认」等。
- 普通聊天不进画布；只有「进入画布」按钮或确认资产推入才切画布。
- 画布是内嵌三态（▥side / ⛶full / ◉ball + 悬浮球），不是独立 stage。
- 刷新回首页，从「我的项目/我的创作」重开。

---

## 2. 逐 turn 对齐表

图例：✅ 已有可用 · 🟡 部分/需改造 · ❌ 缺失需新增

### T0 · 灵感（home → chat）
- **前端**：首页输入灵感（创作设置条已选 风格 / 比例[默认横屏 16:9] / 语言[默认中文]）点「开始创作」进聊天室；或「上传整季剧本」。
- **API**：`POST /api/projects` ✅（建 Project + Episode1 + AgentThread + 首条 user message + version1 ScriptDraft）。需把首页创作设置（风格/比例/语言）随 `initial_input` 一并存入 Project.settings。
- **事件**：`message.created` ✅。
- **差距**：🟡 创建请求需带创作设置字段（当前只有 initial_input/route）；🟡「上传整季剧本」解析入口后端无对应（OQ6）。

### T1 · 大纲（导演黑盒补世界观 + 分集大纲 + 确认）
这是核心卖点环节。导演 Agent 用提示词（真源 `灵感agent1a_v1.2`，待接入）一次推理产出 PD-11 三层中的前两层：

- **① 正面层（用户可读可编辑）**：`work_title` / `overview` / `genre` / `episodes[]`（`ep_no`/`title`/`synopsis`，导演推荐 N 集、用户可改集数）。
- **② 天眼层（暗骨 / Canonical IR，折叠预留，驱动后续制作）**：五大契约（world/物理/力量体系/**认知防火墙**/禁忌/角色弧 S1-S5/压力源/付费点结构）、角色多形态资产、线程账本（主副线）、证据种子、AI 推理日志。
- **前端**：大纲卡（正面层 inline 可编辑）+ 天眼层折叠条 → 「确认大纲，生成第1集剧本」。
- **API**：发消息触发导演产大纲；确认走 approval。
- **事件**：❌ `outline.generated`（用户可见，payload 含正面层；天眼层进后台审计不直接展示）；确认走 `approval_required(create_outline)` → `approval_confirmed`。
- **数据**：❌ 正面层（Project.logline/genre + Episode.synopsis）、❌ 天眼层（Canonical IR JSON，挂 Project，预留不写死字段）需新增。见 §3。
- **差距**：导演 prompt 需接 `灵感agent1a_v1.2`；`action_type` 增 `create_outline`；`executeApprovalAction` 实现写入；**天眼层字段先按契约预留**（PD-11：待提示词定稿再接真实结构，避免写死返工）。

### T2 · 第 1 集剧本（生成 + 确认）
- **前端**：编剧产 script-card（叙事单元/场景头/动作/台词，可编辑）→「确认剧本，拆解资产」。
- **API**：发消息（内部指令「生成第1集剧本」，携带大纲 + 天眼层暗骨作为上下文）触发编剧；确认走 approval。
- **事件**：❌ `script.generated`（用户可见）；确认走 `approval_required(draft_script)` → 写入 ScriptDraft。
- **数据**：🟡 `ScriptDraft.content` 是单一 String，原型剧本是结构化（场景/动作/台词），需 `contentJson`（OQ2）。
- **差距**：`draft_script` action 已声明但 `executeApprovalAction` 未实现；编剧输出沉淀为 ScriptDraft（episodeId=第1集，source=`screenwriter`）。

### T3 · 第 1 集资产（拆解 + 确认）
- **前端**：资产 Agent 产 asset-card（角色/场景/道具 + 标签）→「确认资产，推入画布」。
- **API**：发消息触发资产 Agent；确认走 approval。
- **事件**：❌ `asset.extracted`（用户可见）；确认走 `approval_required(create_asset)` → 写入资产表。
- **数据**：❌ **完全没有 Asset 表**（见 §3、§6）。
- **差距**：建资产数据模型；`create_asset` action 落地。资产可复用天眼层 `assets`（角色多形态/场景）作为来源。

### T4 · 推入画布
- **前端**：确认资产 → `setMode('side')` 画布滑出，提示「资产已推入画布 Step 1」。
- **API**：🟡 现有 `POST /api/projects/:id/script/lock`（建 Scene/Shot/CanvasDocument，stage→canvas）。语义需从「锁定剧本」调整为「确认资产后初始化画布工作区」。
- **事件**：`canvas.initialized` ✅；增 ❌ `canvas.pushed`（产品语义，用户可见）。
- **差距**：🟡 canvas 节点当前是泛 5 节点，需对齐 studio 结构（资产框 / 分镜脚本 / 分镜图 / 视频 / 合成）；MVP 先初始化资产框 + 剧本节点（OQ5）。

---

## 3. 数据模型对齐（Prisma）

现有表：User / Workspace / Project / Episode / ScriptDraft / Scene / Shot / CanvasDocument / AgentThread / AgentMessage / AgentEvent。

| 产品概念 | 现状 | 对齐动作 |
| --- | --- | --- |
| 创作设置（风格/比例[默认横屏16:9]/语言[默认中文]） | 🟡 Project.settings 只存 initial_input | settings 扩展 `style`/`aspect_ratio`/`language`（首页写入） |
| 整季信息（剧名/概览/题材） | 🟡 Project.title；overview/genre 无 | Project 增 `logline`/`genreTags`（正面层①） |
| 分集大纲（集名+梗概+集数） | 🟡 Episode 有 title/order，无 synopsis | Episode 增 `synopsis`；集数 = Episode 数量（导演推荐可改） |
| **天眼层世界观暗骨（Canonical IR）** | ❌ 无 | 新增 `Project.canonicalIrJson`（或 `WorldBible` 表），**字段预留不写死**（PD-11） |
| 单集剧本结构（场景/动作/台词） | 🟡 ScriptDraft.content 为 String | 增 `ScriptDraft.contentJson`（OQ2），content 保留纯文本镜像 |
| 资产·角色/场景/道具 | ❌ 无表（Scene 是分镜场景，非资产场景） | 新增 `Asset(kind=character/scene/prop)` 单表 + `tagsJson`；`Scene.locationAssetId` 指向 Asset(kind=scene) |
| 确认卡片状态机 | 🟡 存 AgentEvent.payloadJson，靠全表扫 | 新增 `Approval` 表（见 §6） |
| 画布 studio 节点 | 🟡 泛 5 节点 | canvas node `data.ref` 指向 Asset/Scene/Shot；类型对齐 studio |

> 资产用**单一 `Asset` 表 + `kind` 字段**起步（OQ1）。天眼层与资产的关系：天眼层 `assets` 是导演阶段的世界观草案，资产 Agent 确认写入正式 `Asset` 表。新增表/字段走 Prisma migration，不静默改 schema。

---

## 4. 事件对齐

后台审计事件（已有）：`message.created` / `multi_agent.run_started` / `route_decided` / `agent_started` / `agent_completed` / `approval_required` / `final_message_created` / `approval_confirmed` / `approval_rejected` / `tool.started|completed|failed` / `script.locked` / `canvas.initialized`。

需新增（用户可见，承载各 turn 产物卡片）：

| 事件 | 含义 | 可见性 |
| --- | --- | --- |
| `outline.generated` | 导演产出分集大纲卡片（payload=正面层；天眼层只进后台审计） | 可见（仅正面层）|
| `script.generated` | 编剧产出单集剧本卡片 | 可见 |
| `asset.extracted` | 资产 Agent 产出资产清单卡片 | 可见 |
| `canvas.pushed` | 确认资产后画布初始化 | 可见 |

**天眼层可见性**：天眼层暗骨（Canonical IR）默认**不在普通聊天展示**，仅作为后台审计 + 大纲卡折叠条（预留位）。可见/后台分层沿用 PRD §6.1、§6.2。

---

## 5. 导演路由与 action 改造

`DirectorRoute`（[multi-agent-orchestrator.service.ts](../apps/api/src/services/multi-agent-orchestrator.service.ts)）：
- **导演承担灵感阶段世界观+大纲产出**（接 `灵感agent1a_v1.2` 提示词，输出正面层+天眼层）。
- `intent` 调整：灵感→大纲阶段用 `script_structuring`（或细分 `outline_drafting`/`world_building`）；剧本→`script_structuring`；资产→`asset_extraction`；推画布→`canvas_operation`。
- **删除「方向选项」逻辑**（不再 oii 式给 3 选项让用户选方向）。
- `action_type` 增 `create_outline`；现有 `draft_script/create_asset` 等需在 `executeApprovalAction` 落地（当前只实现 `update_shot_description`）。

**废弃**：前端 `WorkflowSetupCard`（短片参数确认卡，含「影片长度 <>1 分钟」）退出主交互——参数改由首页创作设置条提供（风格/比例/语言），不作为聊天流确认步骤。

---

## 6. 可维护性改造清单（归档）

| # | 问题 | 影响 | 建议 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | **Asset 体系缺表** | 「确认资产」无处落库 | 新增 `Asset(kind)` 表 + migration | 待办（§3）|
| 2 | **approval 无独立表**，状态塞 event payload，`confirmApproval` 全表扫再内存 find | 量大后性能差、状态机难维护 | 新增 `Approval` 表（id/threadId/runId/status/actionsJson/resolvedAt），事件只做审计 | 待办 |
| 3 | lockScript `String(settings)` → `"[object Object]"` | 垃圾写进剧本正文 | 纯函数 `extractInitialInput` | ✅ 已修 `9448482` |
| 4 | 模型名 `deepseek-v4-pro/flash` 硬编码 fallback 散落多处 | 改模型要改多处 | 收敛到 text-model.service / env | 待办 |
| 5 | 全仓 LF→CRLF 警告 | 跨平台 diff 噪音 | 加 `.gitattributes`（`* text=auto eol=lf`） | 可选 |
| 6 | 无单元测试基础设施（test=tsc --noEmit） | 改动靠类型检查兜底 | 关键写入逻辑稳定后再引 vitest | 观察 |

---

## 7. 实施切片建议（每片可独立提交/回滚）

> **MVP 范围（OQ3 已决）**：整季大纲 + 仅第 1 集打通「剧本→资产→画布」闭环；S-D/S-E/S-F 默认只处理第 1 集，多集为后续迭代。

| 切片 | 范围 | 端 | 依赖 | 验证 |
| --- | --- | --- | --- | --- |
| S-A | 数据地基：Asset(kind) + Approval 表 + Project.logline/genreTags/canonicalIrJson + Episode.synopsis + settings 扩展 + migration | 后端/DB | — | prisma validate + build |
| S-B | 导演路由改造：删方向选项/短片卡 + 接灵感提示词产出正面层+天眼层 + create_outline | 后端 | S-A | 路由手测 |
| S-C | 大纲：`outline.generated` + create_outline 确认写入（正面层落 Project/Episode，天眼层落 canonicalIrJson 预留） | 后端 | S-A,S-B | 发消息→确认→落库 |
| S-D | 第1集剧本：`script.generated` + draft_script 写入结构化 ScriptDraft | 后端 | S-A,S-C | 确认→ScriptDraft 落库 |
| S-E | 第1集资产：`asset.extracted` + create_asset 写入 Asset | 后端 | S-A,S-D | 确认→Asset 落库 |
| S-F | 推入画布：canvas 初始化对齐 studio（MVP 先资产框+剧本节点） | 后端 | S-E | canvas nodes ref 正确 |
| S-G | 前端工程化：workspace.html → React 真前端（四 stage + 时间轴 + 画布内嵌三态 + 大纲卡天眼层折叠） | 前端 | S-A~S-F | 端到端走通主线 |

> S-A 是地基，先行。S-G 工作量最大，可在 S-A~S-F 提供契约后并行启动。

---

## 8. 开放问题

**已决（6/14）**：OQ3 MVP=整季大纲+第1集闭环 · OQ7 本期先评审定稿不写代码 · Agent 归属=导演亲自产出世界观+大纲 · 视频比例默认横屏 16:9 · 集数=导演推荐可改 · 对白语言默认中文。

**待拍**：
- **OQ1 资产建模**：单一 `Asset(kind)` 表（建议）vs Character/Scene/Prop 分表？
- **OQ2 剧本存储**：`ScriptDraft.contentJson` 结构化 vs 约定 markdown 文本？
- **OQ4 天眼层接入**：真源提示词 `灵感agent1a_v1.2` 不在仓库——请指明位置以便接入；在此之前天眼层按 PD-11 契约**预留不写死**。`canonicalIrJson` 是否本期就建（空结构占位）还是等提示词定稿再建？
- **OQ5 画布 studio 完整度**：S-F 本期做到哪——只初始化资产框+剧本节点，还是含分镜/分镜图/视频/合成全套？
- **OQ6 上传整季剧本入口**：本期是否实现（涉及整季解析拆分），还是先只做一句话灵感？
