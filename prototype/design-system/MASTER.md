# Design System MASTER · ActNow

## Token Architecture

Primitive → Semantic → Component。真源是 `../design-model.json.tokens`；本文件是人类可读镜像，改值以 design-model.json 为准，再 `--regen-html` 同步 theme.css。

## Primitive Tokens（暗色电影感）

| Token | Value | 备注 |
| --- | --- | --- |
| `--background` | `#0d0e12` | 电影深底（冷中性） |
| `--surface` | `#16181f` | 面板/节点底 |
| `--surface-2` | `#1e2027` | 输入/分组框/次级面 |
| `--elevated` | `#23262f` | 悬浮层/抽屉/桌宠窗 |
| `--foreground` | `#f3f4f7` | 主文字 |
| `--muted` | `#9aa1ad` | 次文字 |
| `--line` | `#2b2e38` | 描边/分隔/网格 |
| `--primary` | `#5b78ff` | 主操作/焦点（暗底亮靛蓝） |
| `--accent` | `#34d8b4` | 完成/活跃（青绿） |
| `--warning` | `#f2b657` | 生成中/等待回填 |
| `--danger` | `#ff5d6c` | 失败/破坏 |
| group-asset / storyboard / keyframe / video / compose | `#b9a8e6` `#9cc2ec` `#7fdcc4` `#f4b78f` `#e6a6bd` | 制作五阶段分区色 |
| gradientOrb | `#a7e5d3 #f4c5a8 #c8b8e0 #a8c8e8` | 生成态/空状态氛围光 |

## Semantic Tokens

| Token | Purpose |
| --- | --- |
| `--background` | 页面/画布底 |
| `--surface` / `--surface-2` / `--elevated` | 三级面层（不嵌套） |
| `--primary` | 主操作、焦点、当前态 |
| `--accent` | 完成态/活跃强调 |
| `--warning` | 进行中/等待态 |
| `--danger` | 错误与破坏性操作 |
| `--group-*` | 制作阶段分区（非状态语义） |

## Layout System

- Spacing: 8px 基准。tokens：unit 8 · panel 16 · section 32 · hero 80（hero/发现区用大留白）。
- Radius: panel 12 · button 10 · node 8 · thumb 6 · pill 9999。
- Density: 创意 comfortable / 制作画布 compact。
- Breakpoints: 480 / 736 / 1024 / 1280 / 1440（主画布 ≥1280）。
- Elevation: 面板无投影靠边框分层；唯一柔阴影 `0 8px 30px rgba(0,0,0,.45)` 仅给内容缩略图。

## Component Specs

- Button: 最小 44px；pill 主操作 / 10px 次操作；必须有 focus(2px primary 描边)/active(scale .96)/disabled/loading。
- Panel: 12px 半径，边框优先，禁嵌套，loading/empty/error 尺寸稳定。
- Canvas Node: 8px 半径 + 分组色左边条；ID(mono)/标题/状态徽标/主操作必须可见；状态 = 色+图标+文字三重。
- Group 分组框: 半透明分组色边框 + 阶段标题 + 右下角组合技按钮（⚡）。
- Content Thumb: 6px，唯一柔阴影，含加载骨架/失败占位/可播放态。
- Modal/Drawer/桌宠窗: 必须有关闭与保存/取消路径；切换三态不丢上下文。
- 状态徽标: ○待生成(muted) ⟳生成中(warning+脉冲) ✓完成(accent) ✗失败(danger)。

## Accessibility Rules

- 正文对比度 ≥ 4.5:1（foreground/muted 均在深底上达标）。
- 触控目标 ≥ 44px；图标按钮必须 `aria-label`。
- 颜色不能作为唯一状态信号（状态恒为 色+图标+文字）。
- 焦点态键盘可见（2px `--primary` 描边）。

## Motion Rules

- 动画属性限定 transform / opacity。
- "生成中"= opacity 脉冲 + 渐变 orb 缓动（表达进度，非装饰）。
- reduced-motion 下保留状态色与文字反馈，动画降为即时。
- 不在 pan/zoom、输入、滚动上叠加阻塞动效。

## QA Gates

见 `../visual-qa.md`。交付前校验：暗色对比度、状态三重表达、缩略图唯一阴影、移动 375px 无溢出、reduced-motion 有反馈、无第三方素材。
