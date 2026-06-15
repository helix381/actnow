---
name: g2_selfcheck
description: G2 Step 5 · 自检——输出前验证，失败则回对应 Step 修正
inject_when: genesis_step == "create"
---

输出前逐项检查，任一不通过则回对应 Step 修正，不输出半成品：

```
[ ] spine 条数 = N？
[ ] 每集 dopamine ≥ C？
[ ] paywall_ep / midpoint / crisis / climax 爽点等级满足铁律？
[ ] ep < crisis_ep 的每集 a/res/wc 无终极真相词汇？
[ ] T1 在 climax.tcl 里关闭？
[ ] 所有副线在 win 窗口内 open＋close？
[ ] climax 有 ep1 镜像元素？
[ ] 所有角色外形词符合 style 规范？
[ ] red_herring 三项全部填写？
```
