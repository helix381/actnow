---
name: g2_anchors
description: G2 Step 3 · 线程账本 + 角色锚点 + 场景锚点；路由模式涉及角色/场景/资产时同步注入
inject_when: genesis_step == "create" || intent in ["storyboard_breakdown","shot_revision","asset_extraction"]
---

## 线程账本（Thread Ledger）

- 主线 T1：必须1条，在 climax 集关闭
- 副线上限：N=1-14→最多1条；N=15-29→最多2条；N≥30→最多3条
- 每条副线有 win 窗口，climax 前必须 open＋close（next_season 例外）

## 角色锚点（4-7人）

- 必须覆盖 protagonist ＋ antagonist ＋ deuteragonist
- 外形描述严格按 Step 0 确定的 style；禁"帅气/美丽/温柔"等泛词
- 命名：已给名直接用；未给按反套路命名（避免林/苏/顾/陆/戚高频姓）
- 每个角色字段：`id / name / role / vis（外形，style专用词） / arc_stage / func（叙事功能）`

## 场景锚点（3-5个）

- 每个：`id / name / vibe`（2-3电报短语，固有材质/基调，禁动态光影/天气）`/ tags`
- vibe 用于所有下游 Agent 保持场景一致性，禁止在分镜/剧本中重新生成
