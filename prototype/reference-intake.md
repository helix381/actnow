# 参考吸收记录 · ActNow

> 状态：已与用户确认（2026-06-10）。参考方向 = 内容电影感 + 暗色专业。
> 边界：只吸收颜色角色 / 字体层级 / 布局密度 / 组件状态 / 响应式规则 / 禁用项；不复刻任何第三方品牌、Logo、图片、专有文案或商标。最终 DESIGN.md 是 ActNow 自己的 design thesis。

## 收敛结论

| 角色 | 样本 | 吸收动作 | 进入文件 |
|------|------|----------|----------|
| 主参考 | **Apple** | 合并吸收（气质骨架） | DESIGN.md / MASTER.md / design-model.json.tokens |
| 辅助 1 | **Figma** | 案例抽取（画布/节点交互） | DESIGN.md 组件规则 / 分组色 token |
| 辅助 2 | **ElevenLabs** | 案例抽取（生成任务卡片/状态） | DESIGN.md 组件规则 / 渐变 token |
| 明确排除 | 金融(Stripe/Coinbase/Wise)、零售汽车(Nike/Tesla/Ferrari/BMW)、文档表格(Notion/Airtable) | 风险隔离 | 不进入 |

## 各参考可学习点（已转为规则，未保存任何素材）

**Apple（主 · 电影感骨架）**
- 内容/缩略图为主角，UI chrome 隐退——用于首页 hero、发现瀑布流、分镜图网格、成片预览。
- 明暗交替作为分区分隔（color change IS the divider），不靠边框/阴影堆叠层级。
- 单一强调色哲学：一个"click me"信号贯穿全局；暗底用更亮的同色相变体。
- 负字距大标题（"Apple tight"），display 600 + 负 letter-spacing；Inter 作 SF Pro 开源替代。
- 几乎零装饰阴影，唯一柔阴影只给内容图片（让画面"有重量"）。
- 8px 间距基准 + 大留白（section 80px）。

**Figma（辅 · 画布/节点）**
- 黑白技术骨架 + 局部低饱和**色块作"便利贴"分区**——直接映射 ComfyUI 式五个制作分组框（①资产②分镜③分镜图④视频⑤合成各给一个柔和色，见 tokens.colors.groups）。
- 小圆角语法（节点 6–8px）、紧凑控件、pill 主按钮。
- mono 字体用于 eyebrow / ID / 编号——ActNow 用于 task_id / 镜头号 / 节点 ID。

**ElevenLabs（辅 · 生成任务卡片）**
- 暖近黑暗面（#0c0a09 / #1c1917）给"暗色但不冰冷"的基调参考。
- 柔和渐变 orb（mint/peach/lavender/sky/rose）作为唯一"色彩"——ActNow 用于"生成中"节点的氛围光与进度态，而非装饰。
- 克制 CTA：近黑 ink pill 主按钮 + 透明描边次按钮。
- 语义色：error / success 明确，状态不只靠颜色。

## 设计 thesis（一句话）

**暗色电影感创作工作台**：深底让漫剧画面/分镜/视频成为主角（Apple 内容优先 + 明暗分区），紧凑节点 + 分组色块 + 状态徽标承载确定性生产（Figma 画布 + ElevenLabs 任务卡），单一强调色 + 柔和渐变点缀生成态，克制装饰、唯一柔阴影给内容缩略图。详见 `design-system/DESIGN.md`。

## 风险与边界

- 不克隆 LuxReal / LibTV 等竞品界面；PRD 模块 14 的 Q4「LuxReal 界面抓取做视觉对标」属外部动作，本原型不执行抓站。
- 不使用 SF Pro（Apple 专有），统一 Inter + 负字距近似；mono 用系统 ui-monospace。
- 三参考的具体品牌色（Apple Blue / Figma 便利贴色 / ElevenLabs 渐变）不直接照搬，已重映射为 ActNow 自有 token。

## 待确认问题（已收口）

- Q-A：主强调色色相 → **已定：电影靛蓝 `#5b78ff`**（用户确认 2026-06-10）。完成态青绿 `#34d8b4`、生成中琥珀 `#f2b657`、失败 `#ff5d6c` 保持。
- Q-B：runwayml/miro 是否纳入 → **已定：暂不纳入**，保持 Apple+Figma+ElevenLabs 三参考；runway 气质留作后续高保真细节的灵感补充，不改设计系统基线。
