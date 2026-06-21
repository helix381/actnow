---
name: anchors
description: G2 Step 3 · 线程账本 + 角色锚点 + 场景锚点；路由模式涉及角色/场景时注入
inject_when: genesis_step == "create" || intent in ["storyboard_breakdown","shot_revision","asset_extraction","design_prompt"]
---

## 线程账本（Thread Ledger）

- 主线 T1：必须1条，在 climax 集关闭
- 副线上限：N=1-14->最多1条；N=15-29->最多2条；N>=30->最多3条
- 每条副线有 win 窗口，climax 前必须 open+close（next_season 例外）

## 角色锚点（4-7人）

必须覆盖 protagonist + antagonist + deuteragonist。

### 角色势能三要素（第1集前5分钟内完成）

1. **能力信号**：用一个具体行动展示主角能力（有对比参照物）
2. **委屈信号**：承受一次明显不公平对待（施压方比主角强势），反应克制
3. **落差信号**：用视觉化手段呈现身份落差

三要素必须在同一集完成。

### 主角光环边界

- 每次使用核心能力必须消耗可见代价（体力/时间/情感/寿命/材料）
- S1-S2阶段必须经历至少一次"金手指失效"
- 禁止连续3集主角全胜，每3集内必须有一次真实威胁感
- 每次能力爆发后必须有可见的"代价呈现"

### 角色字段

每个角色：id / name / role / vis（外形，style专用词）/ voice（音色描述）/ arc_stage / func（叙事功能）

- 外形描述严格按 precheck 确定的 style 规范
- 命名：已给名直接用；未给按反套路命名（避免林/苏/顾/陆/戚高频姓）
- voice：[年龄感与性别], [生理音色特质]（供下游配音生成）

## 场景锚点（3-5个）

每个：id / name / vibe（2-3电报短语，固有材质/基调，禁动态光影/天气）/ tags

vibe 用于所有下游 Agent 保持场景一致性，禁止在分镜/剧本中重新生成。
