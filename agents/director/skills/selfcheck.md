---
name: selfcheck
description: G2/G3 · 输出前自检——失败则回对应 Step 修正
inject_when: genesis_step in ["create","outline"]
---

输出前逐项检查，任一不通过则回对应 Step 修正，不输出半成品：

## 结构性自检（G2+G3）

```
[ ] world_card 所有必填字段存在？
[ ] logline 含主角+机制+代价，<=40字？
[ ] characters 3-5个，每个有 name/role/trait？
[ ] mechanism 含触发条件+代价？
[ ] red_lines 3条，每条<=20字？
[ ] 所有角色 vis 符合 style 规范？（禁"帅气/美丽/温柔"）
[ ] 所有场景 vibe 是固有材质/基调，无动态光影/天气？
[ ] red_herring 三项全部填写？
```

## 骨架自检（G3）

```
[ ] spine 条数 = episode_count？
[ ] 每集 dopamine >= C？
[ ] paywall_ep / midpoint / crisis / climax 爽点等级满足铁律？
[ ] ep < crisis_ep 的每集 a/res/wc 无终极真相词汇？
[ ] T1 在 climax 集关闭？
[ ] 所有副线在 win 窗口内 open+close？
[ ] climax 有 ep1 镜像元素？
[ ] hook_type 连续3集不为同一强度？
[ ] ep1.hk 强度 >= 四星？
```

## 钩子自检

```
[ ] 每集都有 hook_type + hook_strength + hook_text？
[ ] hook_text <=15字？
[ ] paywall_ep 用五星钩子？
[ ] 钩子类型在全剧中有变化（不全用同一类型）？
```
