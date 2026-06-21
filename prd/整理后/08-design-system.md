# ActNow 设计系统子PRD

| 字段 | 内容 |
|------|------|
| 版本 | v0.1 |
| 日期 | 2026-06-16 |
| 状态 | 草稿 |

> **来源**：`prototype/design-system/DESIGN.md` · `prototype/design-system/MASTER.md` · `prototype/reference-intake.md` · `prototype/visual-qa.md` · `prototype/visual-brief.md` · `prototype/open-questions.md` · `prototype/prototype-plan.md`
>
> 设计系统代码真源：`prototype/design-system/` 下的 HTML/CSS 文件 + `prototype/design-model.json`（token 中间模型）。修改 token 值以 `design-model.json` 为准，再 `--regen-html` 同步 `theme.css`。

---

## 1. Design Thesis

**暗色电影感创作工作台。**

ActNow 是分阶段（创意聊天室 → 制作无限画布）的 AIGC 漫剧创作平台。视觉的第一职责是让**画面内容**——分镜图、视频片段、成片、角色基准图——在深色底上成为主角；第二职责是让**确定性生产**可控可追踪：节点、连线、生成任务状态、人在环回传一目了然。

| 项 | 内容 |
|----|------|
| 产品类型 | Web 应用（桌面优先，移动端 Roadmap 垫底） |
| 使用频率 | 高频、长时停留（逐镜精控） |
| 信息密度 | 创意阶段 comfortable / 制作画布 compact |
| 基调 | 暗色专业（深底 + 高对比状态色 + 柔和渐变点缀） |
| 主要设备 | desktop first（≥1280 主画布），mobile 拍平为步骤 tab |

**气质来源**（已转为规则，非品牌复刻）：
- **Apple**：内容优先 + 明暗分区 + 单强调色 + 负字距大标题
- **Figma**：画布节点 + 分组色块 + mono 编号
- **ElevenLabs**：生成任务卡 + 柔和渐变状态光

---

## 2. 参考吸收记录（prototype/reference-intake.md）

> 状态：已与用户确认（2026-06-10）。参考方向 = 内容电影感 + 暗色专业。
> 边界：只吸收颜色角色/字体层级/布局密度/组件状态/响应式规则；不复刻任何第三方品牌、Logo、图片、专有文案或商标。最终 DESIGN.md 是 ActNow 自己的 design thesis。

| 角色 | 样本 | 吸收动作 |
|------|------|---------|
| 主参考 | **Apple** | 合并吸收（气质骨架）→ DESIGN.md / MASTER.md / design-model.json |
| 辅助 1 | **Figma** | 案例抽取（画布/节点交互）→ DESIGN.md 组件规则 / 分组色 token |
| 辅助 2 | **ElevenLabs** | 案例抽取（生成任务卡/状态）→ DESIGN.md 组件规则 / 渐变 token |
| 明确排除 | 金融(Stripe/Coinbase)、零售(Nike/Tesla)、文档表格(Notion/Airtable) | 风险隔离，不进入 |

**设计 thesis 一句话**：暗色电影感创作工作台——深底让漫剧画面成为主角（Apple 内容优先 + 明暗分区），紧凑节点 + 分组色块 + 状态徽标承载确定性生产（Figma 画布 + ElevenLabs 任务卡），单一强调色 + 柔和渐变点缀生成态，克制装饰、唯一柔阴影给内容缩略图。

---

## 3. 颜色系统（prototype/design-system/DESIGN.md + MASTER.md）

### 3.1 Color Roles

| 角色 | Token | 值 | 用途 | 禁止 |
|------|-------|----|------|------|
| Background | `--background` | `#0d0e12` | 页面/画布最深底 | 不铺装饰图、不加噪点 |
| Surface | `--surface` | `#16181f` | 面板、节点、卡片底 | 不嵌套同色卡片 |
| Surface-2 | `--surface-2` | `#1e2027` | 输入框、分组框底、次级面 | 不与 surface 仅差 1–2% 造成糊 |
| Elevated | `--elevated` | `#23262f` | 悬浮层、抽屉、桌宠窗 | 不滥用于普通面板 |
| Foreground | `--foreground` | `#f3f4f7` | 主文字、标题 | 不用纯白 #fff 刺眼 |
| Muted | `--muted` | `#9aa1ad` | 次要文字、占位、说明 | 对比度不得低于 4.5:1（正文） |
| Line | `--line` | `#2b2e38` | 描边、分隔、网格 | 不当作文字色 |
| Primary | `--primary` | `#5b78ff` | 主操作、焦点、当前态 | 不把所有按钮设为主色 |
| Accent/Success | `--accent` | `#34d8b4` | 完成态、活跃强调 | 不承载危险/错误 |
| Warning | `--warning` | `#f2b657` | 生成中/等待回填/降级提示 | 不当作普通强调 |
| Danger | `--danger` | `#ff5d6c` | 失败、破坏性操作 | 不用于普通提醒 |

### 3.2 制作阶段分组色（Group Colors）

| 阶段 | Token | 值 | 用途 |
|------|-------|----|------|
| ① 资产 | `--group-asset` | `#b9a8e6`（lavender） | 画布分组框左边条 / 标题点 / 阶段徽标 |
| ② 分镜 | `--group-storyboard` | `#9cc2ec`（sky） | 同上 |
| ③ 分镜图 | `--group-keyframe` | `#7fdcc4`（mint） | 同上 |
| ④ 视频 | `--group-video` | `#f4b78f`（peach） | 同上 |
| ⑤ 合成 | `--group-compose` | `#e6a6bd`（rose） | 同上 |

**生成态渐变 orb**：`mint(#a7e5d3) → peach(#f4c5a8) → lavender(#c8b8e0) → sky(#a8c8e8)`，用于「生成中」节点氛围光 + 空状态，不做纯装饰满屏渐变。

---

## 4. 排版规则

| 层级 | Token | 用途 | 规则 |
|------|-------|------|------|
| Display | `--font-display`（Inter） | 首页 hero、成片标题 | 大字号 600 + 负字距 -0.02em（电影紧凑感）；不用于面板内部 |
| Body | `--font-sans`（Inter） | 正文、控件、节点文字 | 16px 基准；制作画布密集表格可降至 14px（不低于 12px） |
| Mono | `--font-mono` | task_id / 镜头号 / 节点 ID / 版本号 | 只用于结构化值，强化「可追踪」感 |

- 负字距只在 ≥18px 标题用；正文不收紧到糊
- 状态徽标用 12px 600 + 大写字距

---

## 5. 布局系统（prototype/design-system/MASTER.md）

| 项 | 规则 |
|----|------|
| 间距基准 | 8px；panel 16 · section 32 · hero 80 |
| 圆角 | panel 12 · button 10 · node 8 · thumb 6 · pill 9999 |
| 密度 | 创意 comfortable / 制作画布 compact |
| 断点 | 480 / 736 / 1024 / 1280 / 1440（主画布 ≥1280） |
| Elevation | 面板无投影靠边框分层；唯一柔阴影 `0 8px 30px rgba(0,0,0,.45)` 仅给内容缩略图 |

---

## 6. 组件规则

| 组件 | 默认规格 | 状态 | 禁用项 |
|------|---------|------|--------|
| Button | pill/10px 圆角，主次分明，最小 44px | hover（轻位移）/ active（scale .96）/ disabled / loading 明确 | 不用无语义假按钮、不全主色 |
| Panel | 12px 半径，边框优先无投影 | loading/empty/error 有稳定尺寸不跳动 | 不嵌套卡片、不堆阴影 |
| Canvas Node | 8px 半径 + 分组色左边条；ID(mono)/标题/状态徽标/主操作可见 | ○待生成(muted) ⟳生成中(warning+脉冲) ✓完成(accent) ✗失败(danger)——色+图标+文字三重 | 不只靠颜色表达状态 |
| 分组框（Group） | 半透明分组色边 + 阶段标题 + 右下角组合技按钮（⚡） | 折叠/展开 | 框内不套深色卡 |
| Content Thumb | 6px 半径，唯一柔阴影，含加载骨架/失败占位/可播放 | — | 不加边框抢戏 |
| Agent 聊天 | 三态：全屏/侧边/桌宠悬浮窗 | 操作反馈卡（改了什么 + 影响范围 + 预览入口） | 不遮挡画布、不丢上下文 |
| Table/List（分镜表） | 逐镜字段，长文本换行 | 空/错/加载/部分完成（成功X失败Y） | 不让字段溢出 |

**状态徽标**：`○待生成(muted)` · `⟳生成中(warning+脉冲)` · `✓完成(accent)` · `✗失败(danger)`

---

## 7. 页面级例外规则

| 页面 | 允许偏离 | 原因 | 不允许 |
|------|---------|------|--------|
| home / 发现 | 更大留白 + 电影感大图卡 | 找灵感、作品感入口 | 空泛营销 hero、堆 slogan |
| chat 创意聊天台 | comfortable 密度、对话沉浸 | 发散心智 | 过早塞制作级控件 |
| canvas 制作画布 | 高密度、分组色分区 | 制作主界面 | 装饰性大图、节点文字溢出 |
| keyframes 分镜图 | 网格大图为主角 | 关键帧预览 | UI 抢画面戏 |
| export 合成导出 | 更强状态反馈 | 异步导出 | 隐藏失败原因 |
| 3D 导播台 | 全屏沉浸 360° | 空间精控 | 控制面板挤压视图 |

---

## 8. 动效规则

- 只动画 `transform` / `opacity`
- 「生成中」用柔和 opacity 脉冲 + 渐变 orb 缓动（表达进度，非装饰）
- 节点状态切换、抽屉/桌宠窗进出用 180ms transform
- 支持 `prefers-reduced-motion`：降级为即时状态变化，仍保留状态色与文字反馈
- 动效不阻塞点击、输入、滚动、pan/zoom

---

## 9. Do Not 清单

- 不克隆 LuxReal/LibTV 等任何第三方界面，不复用第三方品牌、图片、文案、商标
- 不用纯装饰满屏渐变 / 噪点 / 光斑；渐变只服务生成态与空状态
- 不给面板/按钮/文字加投影（投影只属内容缩略图）
- 不只靠颜色表达生成状态（必须色 + 图标 + 文字）
- 不做文本溢出、元素重叠、不可点击假控件

---

## 10. 无障碍规则

- 正文对比度 ≥ 4.5:1（foreground/muted 均在深底上达标）
- 触控目标 ≥ 44px；图标按钮必须 `aria-label`
- 颜色不能作为唯一状态信号（状态恒为 色+图标+文字）
- 焦点态键盘可见（2px `--primary` 描边）

---

## 11. 视觉 QA 记录（prototype/visual-qa.md）

### 11.1 验收结果

| 项 | 结果 | 说明 |
|----|------|------|
| design-system/DESIGN.md / MASTER.md / reference-intake.md | ✅ | ActNow「暗色电影感工作台」thesis 已与用户确认 |
| design-model.json（暗色 tokens） | ✅ | 深底 #0d0e12 + 靛蓝主色 + 制作五阶段分组色 + 生成态渐变 |
| theme.css 暗色基线 | ✅ | input/sidebar/node.active 亮色已调暗；面板无投影、阴影仅给内容缩略图 |
| pages/home.html | ✅ 桌面 + ✅ 375px 移动 | 电影感入口 + 路线卡 + 大输入框 + 设置条 + 发现瀑布流 |
| pages/chat.html | ✅ 桌面 | 启发式选项发散 → 右侧大纲草稿 → 确认剧本；全屏/悬浮窗两态实测 |
| pages/studio.html | ✅ 桌面 | 无限画布全套交互；agent 左/资产库右弹出/液态玻璃浮岛 |
| 闭环 home→chat→studio | ✅ | 开始创作→chat、确认剧本→studio、项目卡/rail 互通 |
| mobile 375px（chat/studio） | ⚠️ 部分 | home 无溢出；chat/studio 移动端走 media 隐藏，未逐屏实测 |
| reduced-motion | ✅ | theme.css 有 `prefers-reduced-motion` 降级；生成态脉冲在降级下保留状态色文字 |
| 第三方素材风险 | ✅ 无 | 所有缩略图用 CSS 渐变模拟，无第三方图片/品牌/字体外链 |

### 11.2 studio 画布交互验收（Playwright evaluate 实测生效）

pan 平移 · 滚轮缩放（光标锚点，±5%/格）· 拖标题移动节点（缩放补偿）· 连线实时重绘 · 适应画布 · 整理布局 · 小地图（含视口框）· 节点选中 · Shift 框选批量 · 折叠/展开 · 右键节点类型菜单（6 类型 + 操作）· 端口拉线建节点 · 删除 · 复制 · **撤销/重做（快照栈 + Ctrl+Z/Y）**

### 11.3 发现并修复的问题

| # | 页面 | 问题 | 根因 | 修复 |
|----|------|------|------|------|
| 1 | home | 大输入框与设置条重叠 | `.settings .note` 在 flex-center 容器里错位 | note 移出 settings flex，改独立块 `.settings-note` |
| 2 | studio | 节点缩到 35%、偏上、下方大留白 | board 高度塌缩到 241px | `grid sparse` 挤位；加 `grid-row:1` 锁单行 + 初始 fit 改 rAF |
| 3 | studio | 拖线在空白松手不弹节点菜单 | mousedown+mouseup 共同祖先 board 发 click，秒关菜单 | 弹菜单放进 `setTimeout(…,0)` |
| 4 | studio | 滚轮缩放幅度过大 / 拖拽选中文字 | 步长 ±10% + 无 user-select | 步长降到 ±5%；`.studio user-select:none`（输入框除外）|
| 5 | chat | 顶栏三态点了没反应 | 只切了按钮高亮没切布局 | 简化为「全屏/悬浮窗」两态，可互切 |
| 6 | 基线 | 早期亮色残留 | 脚本默认亮色模板 | theme.css 调暗 + 删除 starter-index/wireframe |

### 11.4 剩余风险

- **theme.css 有手工暗色补丁**（input/sidebar/node.active/面板阴影）：勿对工作区盲目重跑 `--regen-html`，否则覆盖。如需改 token，改 design-model.json 后手工合补丁。
- **移动端**：chat/studio 在 <980/1100px 隐藏 agent/draft，移动体验属 Roadmap，未逐屏实测。
- **二级详情页未做**：3D 导播台（360°设机位）/ 合成时间线（轨道编辑）/ 分镜图全屏编辑 等节点双击详情，目前为占位按钮。
- **数据为演示态**：生成状态、队列、task_id 等为静态示意，非真实后端。

---

## 12. 原型待确认（prototype/open-questions.md）

### 12.1 已收口

| 编号 | 问题 | 结论 |
|------|------|------|
| Q1 | 参考吸收记录是否确认？ | ✅ Apple 主 + Figma/ElevenLabs 辅，暗色电影感（2026-06-10 确认） |
| Q2 | 高保真视觉基线方向？ | ✅ 暗色电影感工作台；主强调色 = 电影靛蓝 `#5b78ff` |
| Q3 | 首批画哪些页面？ | ✅ home / chat / studio 三个核心页已完成 |
| Q4 | 主流程关键跳转准确？ | ✅ home→chat→studio；项目卡/rail 互通 |
| Q5 | 哪些异步/人在环/外部流程进原型？ | ✅ studio 体现：生成态三重表达、人在环回填、后端三模式 |
| Q6 | runwayml/miro 是否纳入参考？ | ✅ 暂不纳入，保持三参考 |
| Q7 | Agent 聊天三态？ | ✅ 简化为「全屏/悬浮窗」两态；studio 内为侧边栏态 |

### 12.2 待确认/可选

| 编号 | 问题 | 影响 | 优先级 |
|------|------|------|--------|
| N1 | 二级节点详情页是否要做？（3D 导播台 360°设机位/合成时间线/分镜图全屏编辑） | studio 深度 | 中 |
| N2 | 创意短片/电商两条 Roadmap 路线何时进原型？ | 路线覆盖 | 低 |
| N3 | 移动端是否需要真实适配？ | 响应式 | 低 |
| N4 | 是否需要 mock 数据接可点状态流转（生成中→完成动画）？ | 演示保真 | 中 |
| N5 | 资产库/模板库是否要独立全屏页（现为 studio 内右侧抽屉）？ | 信息架构 | 低 |
| N6 | PRD 模块14 Q4「LuxReal 界面抓取做视觉对标」属外部动作，原型未执行 | 竞品对标 | 低 |

---

## 13. 原型生产流程（prototype/prototype-plan.md）

| 阶段 | 产物 | 目的 | 状态 |
|------|------|------|------|
| 1 | reference-intake.md | 参考吸收与风险隔离 | ✅ 完成 |
| 2 | design-system/DESIGN.md | 项目级设计说明 | ✅ 完成 |
| 3 | design-system/MASTER.md | 设计系统真源 | ✅ 完成 |
| 4 | design-model.json | 可编辑中间模型（token） | ✅ 完成 |
| 5-8 | ~~workbench/canvas/wireframe/index.html~~ | 早期探索阶段（已弃用） | 弃用，保留文件 |
| 9 | visual-qa.md | 视觉 QA 记录 | ✅ 完成 |
| 最终 | prototype/pages/workspace-v0.html | 单一高保真工作区原型（v0 设计规格）| ✅ 真源 |

---

## 修改记录

| 日期 | 版本 | 变更 |
|------|------|------|
| 2026-06-16 | v0.1 | 整理搬运 prototype/design-system/ + reference-intake + visual-qa + visual-brief + open-questions + prototype-plan 全内容归档 |
