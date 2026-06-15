---
name: g2_precheck
description: G2 Step 0 · 预检——集数决议、红线扫描、画风读取
inject_when: genesis_step == "create"
---

## 集数决议

按 `episode_count_policy` 写入 `meta.nodes`：

| policy | N 的取值 |
|--------|---------|
| `CUSTOM_EXACT` | `episode_count_custom` |
| `RANGE` | 区间中位整数 |
| `AUTO` | 短剧 15-30 集；中剧 31-60 集（按题材密度判断） |

节点坐标（写入 `meta.nodes`）：
```
paywall_ep : N≤20 → max(3, round(N×0.35))；N=21~40 → 10；N≥41 → round(N×0.20)
midpoint   : round(N×0.50)
crisis     : floor(N×0.85)
climax     : N
```

## 红线扫描

命中即替换，替换记录写入 `_cot_redline`：

| 红线 | 处理 |
|------|------|
| 知名 IP / 四大名著 / 革命历史人物直接入主线 | 替换为原创架空设定 |
| 未成年卷入成人化暴力/色情 | 主角年龄改成年 |
| 反派是真实当代机构/人物 | 替换为虚构组织 |
| 金手指无代价/限制 | 强制绑定不可逆代价 |

## 画风读取

按 `meta.style` 决定全程角色外形描述词规范：

| style | 规范 |
|-------|------|
| `realistic` | 五官结构词（颧骨/眼距/肤色/发型结构），禁"帅气/美丽/温柔" |
| `2d_korean` | 漫画夸张词（眼型/脸型/头身比），禁写实皮肤描述 |
| `3d_animation` | 材质渲染词（光泽度/骨骼线条/特效元素） |
