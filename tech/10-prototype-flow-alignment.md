# 原型产品流 ↔ 后端对齐规格

| 字段 | 内容 |
| --- | --- |
| 文档版本 | v0.1 草案（OQ3/OQ7 已决，见 §8）|
| 创建日期 | 2026-06-14 |
| 定位 | 前后端共同 contract：把「原型 workspace.html 的产品主线」逐 turn 映射到后端 API / 事件 / 数据写入，并列出改造清单与实施切片 |
| 真源关系 | `prototype/pages/workspace.html` = 产品真源；本文 = 实现对齐基准；与 `PRD-Multi-Agent-Chatroom.md`（产品意图）配套 |
| Git 基线 | `a17d6ca`（导入 codex 现状）→ `9448482`（修 lockScript bug）|

> 背景纠偏：`apps/web` 那个 React 页是后端用来测 API 连通的工具页，**不是前端真源**。完整前端体验在 `prototype/pages/workspace.html`。因此「对齐」= 让后端能力去支撑原型这条产品流。

---

## 1. 产品主线总览（以原型为准）

chat stage 是一条**线性引导流**，右侧「阅读时间轴」6 节点贯穿，每步一个确认按钮推进：

| 时间轴 | 原型表现 | 主导角色 | 推进动作 |
| --- | --- | --- | --- |
| 灵感 | 用户首条创意（或首页「上传整季剧本」） | 用户 | 进入聊天室 |
| 方向 | 导演给 **3 个方向选项**供点选 | 导演 | 点选项 |
| 大纲 | 产出**整季分集大纲**（剧名+logline+EP01–06，全可编辑）+ 天眼层（Canonical IR 预留） | 导演 | 「确认大纲，生成第1集剧本 →」 |
| 剧本 | 产出**单集剧本**（EP tab、叙事单元、场景头/动作行/台词行，3场景/8镜/1.5min，可编辑） | 编剧 | 「确认剧本，拆解资产 →」 |
| 资产 | **从该集剧本拆资产**（3角色/3场景/1道具，带标签） | 资产 | 「确认资产，推入画布 ⚡」 |
| 确认 | 切画布 **side 态**（画布内嵌 chat，非独立页） | — | setMode('side') |

延续 PRD 的硬边界：
- 用户确认前不写业务表；任何状态变更先出 `approval_required`。
- 内部指令/route JSON/run id/模型名不展示，确认后用户气泡只显示「信息已确认」等。
- 普通聊天不进画布；只有「进入画布」按钮或确认资产推入才切画布。
- 画布是内嵌三态（▥side / ⛶full / ◉ball + 悬浮球），不是独立 stage。
- 刷新回首页，从「我的项目/我的创作」重开。

**与后端现状最大的不一致**：后端当前核心交互是「短片参数确认卡（长度/比例/语言）→ 泛化 `update_shot_description` approval」，这套**在原型 chat 流里不存在**（原型参数只是顶栏静态 pill）。本规格据此判定：**短片参数确认卡退出主交互**，导演输出改为「方向选项 + 分集大纲」。

---

## 2. 逐 turn 对齐表

图例：✅ 已有可用 · 🟡 部分/需改造 · ❌ 缺失需新增

### T0 · 灵感（home → chat）
- **前端**：首页输入灵感点「开始创作」→ 进聊天室；或「上传整季剧本」入口。
- **API**：`POST /api/projects` ✅（建 Project + Episode1 + AgentThread + 首条 user message + version1 ScriptDraft）。
- **事件**：`message.created` ✅。
- **差距**：🟡「上传整季剧本」解析入口后端无对应（解析整季→分集）。MVP 可先只做一句话灵感。

### T1 · 方向（导演给选项）
- **前端**：导演气泡 + 3 个方向选项按钮，用户点选追加用户气泡。
- **API**：`POST /api/agent/threads/:id/messages` ✅（复用）。
- **事件**：`multi_agent.final_message_created`（导演回复）✅；选项需承载在 payload。
- **差距**：❌ 导演路由当前不产出「方向选项」。需在 `DirectorRoute` 增 `options?: string[]`，intent 用 `creative_brainstorm`/`clarification`，前端渲染为可点选 chips。点选项 = 再发一条 message。

### T2 · 大纲（整季分集大纲 + 确认）
- **前端**：导演产出 outline-card（剧名/logline/EP01–06，可编辑）→「确认大纲，生成第1集剧本」。
- **API**：发消息触发导演产出大纲；确认走 approval。
- **事件**：需 ❌ `outline.generated`（用户可见，承载大纲结构）；确认走 `approval_required(create_outline)` → `approval_confirmed`。
- **数据**：❌ 整季分集大纲无存储。方案见 §3（Outline 或 Episode 批量 + Project.logline）。
- **差距**：导演 prompt 需能输出结构化分集大纲；`action_type` 增 `create_outline`；`executeApprovalAction` 实现写入。

### T3 · 单集剧本（生成 + 确认）
- **前端**：编剧产出 script-card（叙事单元/场景/动作/台词，可编辑）→「确认剧本，拆解资产」。
- **API**：发消息（内部指令「生成第N集剧本」）触发编剧；确认走 approval。
- **事件**：需 ❌ `script.generated`（用户可见）；确认走 `approval_required(draft_script)` → 写入 ScriptDraft。
- **数据**：🟡 `ScriptDraft.content` 是单一 String。原型剧本是结构化（场景/动作/台词）。需 `ScriptDraft.contentJson` 或约定 fountain/markdown 格式（见 §3）。
- **差距**：`draft_script` action 已声明但 `executeApprovalAction` 未实现，需补；编剧输出需沉淀为 ScriptDraft（含 episodeId、source=`screenwriter`）。

### T4 · 单集资产（拆解 + 确认）
- **前端**：资产 Agent 产出 asset-card（角色/场景/道具 + 标签）→「确认资产，推入画布」。
- **API**：发消息触发资产 Agent；确认走 approval。
- **事件**：需 ❌ `asset.extracted`（用户可见）；确认走 `approval_required(create_asset)` → 写入资产表。
- **数据**：❌ **完全没有 Asset/Character/Prop 表**（见 §3、§6）。资产无处落库。
- **差距**：建资产数据模型；`create_asset` action 落地。

### T5 · 推入画布
- **前端**：确认资产 → `setMode('side')` 画布滑出，提示「资产已推入画布 Step 1」。
- **API**：🟡 现有 `POST /api/projects/:id/script/lock`（建 Scene/Shot/CanvasDocument，刷 canvas，stage→canvas）。
- **事件**：`script.locked` + `canvas.initialized` ✅（system，后台）。
- **差距**：🟡 语义错位——原型「推入画布」是确认资产后初始化画布工作区（含资产框/分镜占位），不是「锁定剧本」。canvas 节点当前是泛 5 节点，需对齐 studio 结构（资产框 / 分镜脚本 / 分镜图 / 视频 / 合成）。`current_stage` 取值需容纳画布内嵌态。

---

## 3. 数据模型对齐（Prisma）

现有表：User / Workspace / Project / Episode / ScriptDraft / Scene / Shot / CanvasDocument / AgentThread / AgentMessage / AgentEvent。

| 原型概念 | 现状 | 对齐动作 |
| --- | --- | --- |
| 整季信息（剧名/logline/题材标签） | 🟡 散落 Project.title/settings | Project 增 `logline`、`genreTags`（或 Outline 表头） |
| 分集大纲（EP 标题+描述） | 🟡 Episode 有 title/order，无 logline/描述 | Episode 增 `synopsis`（分集梗概）；大纲=Episode 集合 |
| 单集剧本结构（场景/动作/台词） | 🟡 ScriptDraft.content 为 String | 增 `ScriptDraft.contentJson`（结构化叙事单元）或约定 markdown，content 保留为纯文本镜像 |
| 资产·角色 | ❌ 无表 | 新增 `Asset`（type=character/scene/prop 统一表）或 Character/Prop 分表 |
| 资产·场景 | ❌ 无表（Scene 是分镜场景，非资产场景） | 同上，资产场景与分镜 Scene 区分清楚 |
| 资产·道具 | ❌ 无表 | 同上 |
| 资产标签 | ❌ | Asset.tagsJson |
| 确认卡片状态机 | 🟡 存在 AgentEvent.payloadJson，靠全表扫 | 新增 `Approval` 表（见 §6） |
| 画布 studio 节点 | 🟡 泛 5 节点 | canvas node `data.ref` 指向 Asset/Scene/Shot/GenerationTask；节点类型对齐 studio |

> 建议资产用**单一 `Asset` 表 + `kind` 字段**（character/scene/prop），避免一上来开三张表；`Scene.locationAssetId` 的悬空外键正好指向 Asset(kind=scene)。

新增表/迁移需走 Prisma migration（`packages/db/prisma/migrations/`），不要静默改 schema。

---

## 4. 事件对齐

后台审计事件（已有）：`message.created` / `multi_agent.run_started` / `route_decided` / `agent_started` / `agent_completed` / `approval_required` / `final_message_created` / `approval_confirmed` / `approval_rejected` / `tool.started|completed|failed` / `script.locked` / `canvas.initialized`。

需新增（用户可见，承载各 turn 的产物卡片）：

| 事件 | 含义 | 可见性 |
| --- | --- | --- |
| `outline.generated` | 导演产出分集大纲卡片 | 可见 |
| `script.generated` | 编剧产出单集剧本卡片 | 可见 |
| `asset.extracted` | 资产 Agent 产出资产清单卡片 | 可见 |
| `canvas.pushed` | 确认资产后画布初始化（替代/补充 canvas.initialized 的产品语义） | 可见 |

确认动作复用现有 `approval_required / approval_confirmed / approval_rejected`，按 `action_type` 区分（create_outline / draft_script / create_asset）。可见/后台分层沿用 PRD §6.1、§6.2。

---

## 5. 导演路由与 action 改造

`DirectorRoute`（[multi-agent-orchestrator.service.ts](../apps/api/src/services/multi-agent-orchestrator.service.ts)）：
- 增 `options?: string[]`（方向选项，T1）。
- intent 枚举基本够用：方向→`creative_brainstorm`、大纲→`script_structuring`、剧本→`script_structuring`、资产→`asset_extraction`、推画布→`canvas_operation`。可考虑细分 `outline_drafting`。
- `action_type` 现有 `draft_script/create_scene/create_shot/create_asset/create_generation_task/update_canvas/update_shot_description`；增 `create_outline`。
- **`executeApprovalAction` 当前只实现 `update_shot_description`**，需按切片补 `create_outline / draft_script / create_asset`。

废弃项：前端 `WorkflowSetupCard`（短片参数确认卡）退出主交互流（参数降级为顶栏展示/项目设置，不作为确认步骤）。

---

## 6. 可维护性改造清单（本轮发现，归档）

| # | 问题 | 影响 | 建议 | 状态 |
| --- | --- | --- | --- | --- |
| 1 | **Asset 体系缺表** | 原型「确认资产」无处落库 | 新增 `Asset(kind)` 表 + migration | 待办（§3）|
| 2 | **approval 无独立表**，状态塞 event payload，`confirmApproval` 全表扫 `approval_required` 再内存 find | 量大后性能差、状态机难维护 | 新增 `Approval` 表（id/threadId/runId/status/actionsJson/resolvedAt），事件只做审计 | 待办 |
| 3 | lockScript `String(settings)` → `"[object Object]"` | 垃圾写进剧本正文 | 纯函数 `extractInitialInput` | ✅ 已修 `9448482` |
| 4 | 模型名 `deepseek-v4-pro/flash` 硬编码 fallback 散落多处 | 改模型要改多处 | 收敛到 text-model.service / env 常量 | 待办 |
| 5 | 全仓 LF→CRLF 警告 | 跨平台 diff 噪音 | 加 `.gitattributes`（`* text=auto eol=lf`） | 可选 |
| 6 | 无单元测试基础设施（test=tsc --noEmit） | 改动靠类型检查兜底 | 关键写入逻辑稳定后再引 vitest | 观察 |

---

## 7. 实施切片建议（每片可独立提交/回滚）

> **MVP 范围（OQ3 已决 2026-06-14）**：整季大纲 + 仅第 1 集打通「剧本→资产→画布」闭环；下表 S-D/S-E/S-F 默认只处理第 1 集，多集为后续迭代。

| 切片 | 范围 | 端 | 依赖 | 验证 |
| --- | --- | --- | --- | --- |
| S-A | 数据模型：Asset(kind) + Approval 表 + Episode.synopsis/Project.logline + migration | 后端/DB | — | prisma validate + build |
| S-B | 导演路由改造：options + create_outline + 废弃参数卡 | 后端 | — | 路由单测/手测 |
| S-C | 大纲：`outline.generated` + create_outline 确认写入 | 后端 | S-A,S-B | 发消息→确认→Episode 落库 |
| S-D | 第1集剧本：`script.generated` + draft_script 写入结构化 ScriptDraft | 后端 | S-A,S-C | 确认→ScriptDraft 落库 |
| S-E | 第1集资产：`asset.extracted` + create_asset 写入 Asset | 后端 | S-A,S-D | 确认→Asset 落库 |
| S-F | 推入画布：canvas 初始化对齐 studio 节点（资产/分镜/分镜图/视频/合成） | 后端 | S-E | canvas nodes ref 正确 |
| S-G | 前端工程化：workspace.html → React 真前端（四 stage + 时间轴 + 画布内嵌三态） | 前端 | S-A~S-F | 端到端走通主线 |

> S-A 是地基，先行。S-G 工作量最大，可在 S-A~S-F 提供契约后并行启动。

---

## 8. 开放问题（需主公决策，未替你拍）

- **OQ1 资产建模**：单一 `Asset(kind)` 表 vs Character/Scene/Prop 分表？（建议单表起步）
- **OQ2 剧本存储**：`ScriptDraft.contentJson` 结构化 vs 约定 markdown 文本？（影响画布读取与编辑回写）
- **OQ3「集」维度 MVP**：✅ 已决（2026-06-14）——**整季大纲 + 仅第 1 集打通「剧本→资产→画布」闭环**；第 2 集起后续迭代。
- **OQ4 天眼层 / Canonical IR**：原型大纲卡有「天眼层·AI 暗骨」预留位，本期纳入还是继续预留？
- **OQ5 画布 studio 完整度**：S-F 本期做到哪——只初始化资产框+剧本节点，还是含分镜/分镜图/视频/合成全套？
- **OQ6 上传整季剧本入口**：本期是否实现（涉及整季解析拆分），还是先只做一句话灵感？
- **OQ7 下一步执行**：✅ 已决（2026-06-14）——**本期先评审定稿本文档，暂不写代码**；定稿后再定 S-A / S-G 起点。
